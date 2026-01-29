import { useState, useEffect } from 'react';
import Input from '../UI/Input';
import Button from '../UI/Button';
import { 
  saveTrade, 
  getUserTrades, 
  getUserPortfolio, 
  savePortfolio,
  deleteTrade 
} from '../../lib/firestore';

export default function TradingJournal({ userId, onStatsUpdate }) {
  const [trades, setTrades] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [currentView, setCurrentView] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [openMonths, setOpenMonths] = useState({});
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [isTableFullScreen, setIsTableFullScreen] = useState(false);
  const [newTrade, setNewTrade] = useState({
    type: 'buy',
    symbol: '',
    shares: '',
    price: '',
    date: new Date().toISOString().split('T')[0],
    displayDate: formatDateForDisplay(new Date())
  });

  // Format date as DD/MM/YYYY for display
  function formatDateForDisplay(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Convert DD/MM/YYYY to YYYY-MM-DD for storage
  function parseDisplayDate(displayDate) {
    const parts = displayDate.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return new Date().toISOString().split('T')[0];
  }

  const loadData = async () => {
    setLoading(true);
    try {
      const [tradesData, portfolioData] = await Promise.all([
        getUserTrades(userId),
        getUserPortfolio(userId)
      ]);
      
      setTrades(tradesData || []);
      setPortfolio(portfolioData || []);
      
      if (onStatsUpdate) {
        onStatsUpdate(userId);
      }
    } catch (error) {
      console.error('Error loading trading data:', error);
      notify('שגיאה בטעינת נתוני המסחר', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId]);

  const notify = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const markPortfolioUpdated = () => {
    sessionStorage.setItem('tsi_portfolio_updated', Date.now().toString());
  };

  const recalculatePortfolio = async (tradesToUse = null) => {
    try {
      const allTrades = tradesToUse || trades;
      const sortedTrades = [...allTrades].sort((a, b) => new Date(a.date) - new Date(b.date));
      const newPortfolio = {};

      sortedTrades.forEach(trade => {
        if (!newPortfolio[trade.symbol]) {
          newPortfolio[trade.symbol] = {
            symbol: trade.symbol,
            shares: 0,
            avgPrice: 0,
            currentPrice: trade.price,
            totalInvested: 0
          };
        }

        const stock = newPortfolio[trade.symbol];

        if (trade.type === 'buy') {
          const newTotalInvested = stock.totalInvested + (trade.shares * trade.price);
          const newTotalShares = stock.shares + trade.shares;
          stock.avgPrice = newTotalShares > 0 ? newTotalInvested / newTotalShares : 0;
          stock.shares = newTotalShares;
          stock.totalInvested = newTotalInvested;
        } else if (trade.type === 'sell') {
          stock.shares -= trade.shares;
          if (stock.shares > 0) {
            stock.totalInvested = stock.shares * stock.avgPrice;
          } else {
            stock.totalInvested = 0;
          }
        }
        
        // תמיד מעדכן את המחיר הנוכחי למחיר האחרון
        stock.currentPrice = trade.price;
      });

      const portfolioArray = Object.values(newPortfolio).filter(stock => stock.shares > 0);
      
      await savePortfolio(userId, portfolioArray);
      setPortfolio(portfolioArray);
      markPortfolioUpdated();
      
      if (onStatsUpdate) {
        onStatsUpdate(userId);
      }
    } catch (error) {
      console.error('Error recalculating portfolio:', error);
    }
  };

  const handleTradeSubmit = async (e) => {
    e.preventDefault();
    
    if (!newTrade.symbol || !newTrade.shares || !newTrade.price) {
      notify('נא למלא את כל השדות', 'error');
      return;
    }

    if (parseFloat(newTrade.shares) <= 0 || parseFloat(newTrade.price) <= 0) {
      notify('כמות ומחיר חייבים להיות חיוביים', 'error');
      return;
    }

    setLoading(true);
    try {
      const tradeData = {
        type: newTrade.type,
        symbol: newTrade.symbol.toUpperCase(),
        shares: parseFloat(newTrade.shares),
        price: parseFloat(newTrade.price),
        date: newTrade.date,
        total: parseFloat(newTrade.shares) * parseFloat(newTrade.price)
      };

      if (tradeData.type === 'sell') {
        const existingStock = portfolio.find(stock => stock.symbol === tradeData.symbol);
        if (!existingStock || existingStock.shares < tradeData.shares) {
          notify('אין מספיק מניות למכירה', 'error');
          setLoading(false);
          return;
        }
      }

      const tradeId = await saveTrade(userId, tradeData);
      
      if (tradeId) {
        const updatedTrades = await getUserTrades(userId);
        setTrades(updatedTrades || []);
        await recalculatePortfolio(updatedTrades);
        
        setNewTrade({
          type: 'buy',
          symbol: '',
          shares: '',
          price: '',
          date: new Date().toISOString().split('T')[0],
          displayDate: formatDateForDisplay(new Date())
        });
        
        setCurrentView('overview');
        notify('עסקה נשמרה בהצלחה!');
      } else {
        notify('שגיאה בשמירת העסקה', 'error');
      }
    } catch (error) {
      console.error('Error saving trade:', error);
      notify('שגיאה בשמירת העסקה', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrade = async (tradeId) => {
    if (confirm('האם אתה בטוח שברצונך למחוק עסקה זו? פעולה זו תעדכן את התיק שלך.')) {
      setLoading(true);
      try {
        const success = await deleteTrade(userId, tradeId);
        if (success) {
          const updatedTrades = trades.filter(t => t.id !== tradeId);
          setTrades(updatedTrades);
          await recalculatePortfolio(updatedTrades);
          notify('העסקה נמחקה והתיק עודכן');
        } else {
          notify('שגיאה במחיקת העסקה', 'error');
        }
      } catch (error) {
        console.error('Error deleting trade:', error);
        notify('שגיאה במחיקת העסקה', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteStock = async (stockSymbol) => {
    if (confirm('האם אתה בטוח שברצונך למחוק את המניה מהתיק?')) {
      setLoading(true);
      try {
        const updatedPortfolio = portfolio.filter(stock => stock.symbol !== stockSymbol);
        await savePortfolio(userId, updatedPortfolio);
        await loadData();
        markPortfolioUpdated();
        notify(`${stockSymbol} נמחק מהתיק`);
      } catch (error) {
        console.error('Error deleting stock:', error);
        notify('שגיאה במחיקת המניה', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const groupTradesByMonth = () => {
    const grouped = {};
    
    trades.forEach(trade => {
      const date = new Date(trade.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('he-IL', { year: 'numeric', month: 'long' });
      
      if (!grouped[monthKey]) {
        grouped[monthKey] = {
          monthName,
          trades: [],
          total: 0
        };
      }
      
      grouped[monthKey].trades.push(trade);
      grouped[monthKey].total += trade.total || (trade.shares * trade.price);
    });
    
    // Sort trades within each month by date (newest first)
    Object.values(grouped).forEach(monthData => {
      monthData.trades.sort((a, b) => new Date(b.date) - new Date(a.date));
    });
    
    return Object.entries(grouped).sort((a, b) => b[0].localeCompare(a[0]));
  };

  const toggleMonth = (monthKey) => {
    setOpenMonths(prev => ({
      ...prev,
      [monthKey]: !prev[monthKey]
    }));
  };

  const toggleMonthSelection = (monthKey) => {
    setSelectedMonths(prev => {
      if (prev.includes(monthKey)) {
        return prev.filter(m => m !== monthKey);
      } else {
        return [...prev, monthKey];
      }
    });
  };

  const exportToExcel = (monthKeys = null) => {
    let tradesToExport = trades;
    
    if (monthKeys && monthKeys.length > 0) {
      tradesToExport = trades.filter(trade => {
        const date = new Date(trade.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        return monthKeys.includes(monthKey);
      });
    }
    
    const headers = ['תאריך', 'סוג עסקה', 'מניה', 'כמות', 'מחיר', 'סכום כולל'];
    const rows = tradesToExport.map(trade => [
      new Date(trade.date).toLocaleDateString('he-IL'),
      trade.type === 'buy' ? 'קנייה' : 'מכירה',
      trade.symbol,
      trade.shares,
      trade.price,
      trade.total || (trade.shares * trade.price)
    ]);
    
    let csvContent = '\uFEFF';
    csvContent += headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `trades_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    notify('הקובץ יוצא בהצלחה!');
  };

  const groupedTrades = groupTradesByMonth();

  return (
    <div>
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: notification.type === 'error' ? '#dc3545' : '#28a745',
          color: 'white',
          padding: '15px 25px',
          borderRadius: '10px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          zIndex: 9999,
          animation: 'slideIn 0.3s ease'
        }}>
          {notification.message}
        </div>
      )}

      <div className="modern-navigation">
        <button 
          className={`nav-tab ${currentView === 'overview' ? 'active' : ''}`}
          onClick={() => {setCurrentView('overview'); setEditMode(false);}}
        >
          <span className="nav-text">סקירה כללית</span>
        </button>
        
        <button 
          className={`nav-tab ${currentView === 'add-trade' ? 'active' : ''}`}
          onClick={() => {setCurrentView('add-trade'); setEditMode(false);}}
        >
          <span className="nav-text">הוסף עסקה</span>
        </button>
        
        <button 
          className={`nav-tab ${currentView === 'trades' ? 'active' : ''}`}
          onClick={() => {setCurrentView('trades'); setEditMode(false);}}
        >
          <span className="nav-text">היסטוריה</span>
        </button>
      </div>

      {loading && <div className="loading">טוען נתונים...</div>}

      {currentView === 'overview' && (
        <div>
          {portfolio.length > 0 ? (
            <div>
              <div className="portfolio-stocks-list">
                <h3>המניות בתיק שלי</h3>
                <div className="stocks-horizontal">
                  {portfolio.map((stock, index) => {
                    const colors = [
                      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', 
                      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
                      '#F8C471', '#82E0AA', '#F1948A', '#D2B4DE', '#AED6F1'
                    ];
                    const bulletColor = colors[index % colors.length];
                    
                    return (
                      <div key={index} className="stock-item-horizontal">
                        <div 
                          className="stock-bullet-colored" 
                          style={{ backgroundColor: bulletColor }}
                        ></div>
                        <div className="stock-text">
                          <span className="stock-symbol-inline">{stock.symbol}</span>
                          <span className="stock-separator">•</span>
                          <span className="stock-shares-inline">{stock.shares} מניות</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="section-header">
                <h3 className="section-subtitle">פירוט תיק</h3>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => setIsTableFullScreen(true)}
                    style={{
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 10px',
                      fontSize: '10px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    הגדל
                  </button>
                  <button
                    onClick={() => setEditMode(!editMode)}
                    style={{
                      background: editMode ? 'linear-gradient(45deg, #dc3545, #c82333)' : 'linear-gradient(45deg, #6c757d, #5a6268)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 10px',
                      fontSize: '10px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    {editMode ? 'סיום' : 'ערוך'}
                  </button>
                </div>
              </div>
              
              <div className="beautiful-table-container">
                <table className="beautiful-table">
                  <thead>
                    <tr>
                      <th>מניה</th>
                      <th>כמות</th>
                      <th>ממוצע</th>
                      <th>מחיר קנייה אחרון</th>
                      <th>שווי</th>
                      {editMode && <th>פעולות</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.map((stock, index) => {
                      const current = (stock.shares || 0) * (stock.currentPrice || 0);
                      
                      return (
                        <tr key={index}>
                          <td className="symbol-cell">
                            <span className="symbol-badge">{stock.symbol}</span>
                          </td>
                          <td>{stock.shares}</td>
                          <td>${(stock.avgPrice || 0).toFixed(2)}</td>
                          <td>${(stock.currentPrice || 0).toFixed(2)}</td>
                          <td>${Math.round(current).toLocaleString()}</td>
                          {editMode && (
                            <td className="actions-cell">
                              <button
                                onClick={() => handleDeleteStock(stock.symbol)}
                                style={{
                                  background: '#dc3545',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  padding: '5px 10px',
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                  fontWeight: '700',
                                  minHeight: '28px',
                                  minWidth: '28px'
                                }}
                              >
                                ×
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <h3>התיק שלך ריק</h3>
              <p>הוסף עסקה ראשונה כדי להתחיל</p>
              <Button variant="success" onClick={() => setCurrentView('add-trade')}>
                הוסף עסקה ראשונה
              </Button>
            </div>
          )}
        </div>
      )}

      {currentView === 'add-trade' && (
        <div className="add-trade-section">
          <div className="form-header">
            <h3>הוסף עסקה חדשה</h3>
            <p>הזן פרטי עסקה כדי לעדכן את התיק שלך</p>
          </div>
          
          <form onSubmit={handleTradeSubmit} className="beautiful-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">סוג עסקה</label>
                <select 
                  className="form-select"
                  value={newTrade.type}
                  onChange={(e) => setNewTrade({...newTrade, type: e.target.value})}
                >
                  <option value="buy">קנייה</option>
                  <option value="sell">מכירה</option>
                </select>
              </div>
              
              <Input
                label="סמל המניה"
                type="text"
                value={newTrade.symbol}
                onChange={(e) => setNewTrade({...newTrade, symbol: e.target.value.toUpperCase()})}
                placeholder="AAPL, MSFT..."
                required
              />
            </div>
            
            <div className="form-row">
              <Input
                label="כמות מניות"
                type="number"
                step="0.001"
                min="0.001"
                inputMode="decimal"
                value={newTrade.shares}
                onChange={(e) => setNewTrade({...newTrade, shares: e.target.value})}
                required
              />
              
              <Input
                label="מחיר למניה ($)"
                type="number"
                step="0.01"
                min="0.01"
                inputMode="decimal"
                value={newTrade.price}
                onChange={(e) => setNewTrade({...newTrade, price: e.target.value})}
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">תאריך</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className="form-input"
                  value={newTrade.displayDate}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewTrade({
                      ...newTrade, 
                      displayDate: value,
                      date: parseDisplayDate(value)
                    });
                  }}
                  placeholder="DD/MM/YYYY"
                  pattern="\d{2}/\d{2}/\d{4}"
                  maxLength="10"
                  style={{ 
                    fontSize: '14px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">סכום כולל</label>
                <div className="total-amount">
                  ${(parseFloat(newTrade.shares || 0) * parseFloat(newTrade.price || 0)).toLocaleString()}
                </div>
              </div>
            </div>
            
            <div className="form-actions">
              <Button type="submit" variant="success" loading={loading}>
                שמור עסקה
              </Button>
              <Button 
                type="button"
                variant="secondary" 
                onClick={() => setCurrentView('overview')}
              >
                ביטול
              </Button>
            </div>
          </form>
        </div>
      )}

      {currentView === 'trades' && (
        <div className="trades-section">
          <div className="section-header" style={{ marginBottom: '10px' }}>
            <h3 className="section-subtitle">היסטוריית עסקאות</h3>
          </div>

          <div style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '20px',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <Button 
              variant="success"
              size="small"
              onClick={() => exportToExcel()}
            >
              ייצא הכל
            </Button>
            
            <Button 
              variant="primary"
              size="small"
              onClick={() => exportToExcel(selectedMonths)}
              disabled={selectedMonths.length === 0}
            >
              ייצא נבחרים
            </Button>
          </div>
          
          {groupedTrades.length > 0 ? (
            <div className="trades-by-month">
              {groupedTrades.map(([monthKey, monthData]) => (
                <div key={monthKey} className="month-section">
                  <div 
                    className="month-header"
                    onClick={() => toggleMonth(monthKey)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="checkbox"
                        checked={selectedMonths.includes(monthKey)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleMonthSelection(monthKey);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        style={{ 
                          width: '18px', 
                          height: '18px',
                          cursor: 'pointer'
                        }}
                      />
                      <span className="month-toggle">
                        {openMonths[monthKey] ? '▾' : '▸'}
                      </span>
                      <h4 className="month-title">{monthData.monthName}</h4>
                    </div>
                    <div className="month-stats">
                      <span className="month-total">${Math.round(monthData.total).toLocaleString()}</span>
                    </div>
                  </div>

                  {openMonths[monthKey] && (
                    <div className="month-content">
                      <div className="trades-table-container">
                        <table className="trades-table">
                          <thead>
                            <tr>
                              <th style={{ minWidth: '90px', width: '90px' }}>תאריך</th>
                              <th style={{ minWidth: '70px' }}>סוג</th>
                              <th style={{ minWidth: '70px' }}>מניה</th>
                              <th style={{ minWidth: '60px' }}>כמות</th>
                              <th style={{ minWidth: '70px' }}>מחיר</th>
                              <th style={{ minWidth: '80px' }}>סכום</th>
                              <th style={{ minWidth: '60px' }}>מחק</th>
                            </tr>
                          </thead>
                          <tbody>
                            {monthData.trades.map((trade, index) => (
                              <tr key={trade.id || index}>
                                <td style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
                                  {new Date(trade.date).toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                  })}
                                </td>
                                <td>
                                  <span className={`trade-badge ${trade.type}`}>
                                    {trade.type === 'buy' ? 'קנייה' : 'מכירה'}
                                  </span>
                                </td>
                                <td className="symbol-cell">
                                  <span className="symbol-badge">{trade.symbol}</span>
                                </td>
                                <td>{trade.shares}</td>
                                <td>${trade.price}</td>
                                <td>${Math.round(trade.total || (trade.shares * trade.price)).toLocaleString()}</td>
                                <td className="actions-cell">
                                  <button
                                    onClick={() => handleDeleteTrade(trade.id)}
                                    disabled={loading}
                                    style={{
                                      background: '#dc3545',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '4px',
                                      padding: '5px 10px',
                                      fontSize: '12px',
                                      cursor: 'pointer',
                                      fontWeight: '700',
                                      minHeight: '28px',
                                      minWidth: '28px'
                                    }}
                                  >
                                    ×
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>אין עסקאות</h3>
              <p>עדיין אין עסקאות בהיסטוריה</p>
              <Button 
                variant="success" 
                onClick={() => setCurrentView('add-trade')}
              >
                הוסף עסקה ראשונה
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Full Screen Table Modal */}
      {isTableFullScreen && (
        <div 
          onClick={() => setIsTableFullScreen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.95)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px',
            cursor: 'pointer'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ 
              background: 'white',
              borderRadius: '10px',
              width: '100%',
              maxWidth: '100vw',
              maxHeight: '95vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              cursor: 'default'
            }}
          >
            <div style={{ 
              position: 'sticky',
              top: 0,
              background: '#2c3e50',
              padding: '12px 15px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              zIndex: 1,
              borderRadius: '10px 10px 0 0'
            }}>
              <h3 style={{ color: '#FFD700', margin: 0, fontSize: '16px' }}>פירוט תיק מלא</h3>
              <button
                onClick={() => setIsTableFullScreen(false)}
                style={{
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                סגור
              </button>
            </div>

            <div style={{ padding: '15px' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px'
              }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #2c3e50, #34495e)', color: 'white' }}>
                    <th style={{ padding: '12px 8px', fontSize: '13px' }}>מניה</th>
                    <th style={{ padding: '12px 8px', fontSize: '13px' }}>כמות</th>
                    <th style={{ padding: '12px 8px', fontSize: '13px' }}>ממוצע</th>
                    <th style={{ padding: '12px 8px', fontSize: '13px' }}>מחיר קנייה אחרון</th>
                    <th style={{ padding: '12px 8px', fontSize: '13px' }}>שווי</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.map((stock, index) => {
                    const current = (stock.shares || 0) * (stock.currentPrice || 0);
                    return (
                      <tr key={index} style={{ background: index % 2 === 0 ? 'white' : 'rgba(255, 215, 0, 0.05)' }}>
                        <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: '13px', fontWeight: '700', color: '#333' }}>
                          {stock.symbol}
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: '13px', color: '#333' }}>{stock.shares}</td>
                        <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: '13px', color: '#333' }}>${(stock.avgPrice || 0).toFixed(2)}</td>
                        <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: '13px', color: '#333' }}>${(stock.currentPrice || 0).toFixed(2)}</td>
                        <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: '13px', fontWeight: '700', color: '#333' }}>${Math.round(current).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}