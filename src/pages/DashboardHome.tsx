import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../app/components/UI/Button';

export default function DashboardHomePage() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [portfolioStats, setPortfolioStats] = useState({
    totalValue: 0,
    stockCount: 0,
    totalPnL: 0,
    avgChange: 0
  });
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = sessionStorage.getItem('tsi_current_user');
    const storedUserData = sessionStorage.getItem('tsi_user_data');
    
    if (!savedUser) {
      navigate('/');
      return;
    }
    
    setCurrentUser(savedUser);
    
    try {
      if (storedUserData) {
        const parsedUserData = JSON.parse(storedUserData);
        setUserData(parsedUserData);
      }
    } catch (error) {
      // Silent fail
    }
    
    loadPortfolioStats(savedUser);
  }, [navigate]);

  useEffect(() => {
    if (!currentUser) return;

    const handleFocus = () => {
      loadPortfolioStats(currentUser);
    };

    window.addEventListener('focus', handleFocus);
    
    const handleVisibilityChange = () => {
      if (!document.hidden && currentUser) {
        loadPortfolioStats(currentUser);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    
    const checkForUpdates = setInterval(() => {
      const lastUpdate = sessionStorage.getItem('tsi_portfolio_updated');
      const lastCheck = sessionStorage.getItem('tsi_last_check');
      
      if (lastUpdate && lastUpdate !== lastCheck) {
        loadPortfolioStats(currentUser);
        sessionStorage.setItem('tsi_last_check', lastUpdate);
      }
    }, 1000);

    return () => clearInterval(checkForUpdates);
  }, [currentUser]);

  const loadPortfolioStats = async (userId: string) => {
    setLoading(true);
    try {
      const { getUserPortfolio } = await import('../app/lib/firestore');
      const { calculatePortfolioStats } = await import('../app/lib/calculations');
      
      const portfolioData = await getUserPortfolio(userId);
      const stats = calculatePortfolioStats(portfolioData);
      setPortfolio(portfolioData || []);
      setPortfolioStats(stats);
    } catch (error) {
      console.error('Error loading portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="section">
      <div className="welcome-section">
        <h1 className="welcome-title">
          שלום {userData?.name || currentUser}!
        </h1>
        <h3 className="welcome-subtitle">
          טוב לראות אותך שוב
        </h3>
      </div>

      {loading ? (
        <div className="loading">טוען נתונים...</div>
      ) : (
        <>
          <div className="action-buttons">
            <Button 
              variant="success" 
              size="full"
              onClick={() => navigate('/dashboard/calculator')}
            >
              מחשבון הערכת שווי
            </Button>
            
            <Button 
              variant="primary" 
              size="full"
              onClick={() => {
                sessionStorage.setItem('tsi_navigated_to_journal', 'true');
                navigate('/dashboard/journal');
              }}
            >
              יומן מסחר
            </Button>
          </div>

          {portfolioStats.stockCount === 0 ? (
            <div className="empty-state">
              <h3>התיק שלך ריק</h3>
              <p>התחל לנהל את ההשקעות שלך על ידי הוספת עסקאות ביומן המסחר</p>
              <Button 
                variant="success" 
                onClick={() => {
                  sessionStorage.setItem('tsi_navigated_to_journal', 'true');
                  navigate('/dashboard/journal');
                }}
              >
                פתח יומן מסחר
              </Button>
            </div>
          ) : (
            <div className="quick-portfolio">
              <h4>תיק ההשקעות שלך</h4>
              
              <div className="portfolio-stocks-list" style={{ marginTop: '15px' }}>
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

              <div style={{
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                padding: '15px',
                borderRadius: '12px',
                textAlign: 'center',
                marginTop: '15px',
                boxShadow: '0 6px 15px rgba(255, 215, 0, 0.3)'
              }}>
                <div style={{ 
                  fontSize: '12px', 
                  fontWeight: '700', 
                  color: '#333',
                  marginBottom: '5px'
                }}>
                  שווי כולל
                </div>
                <div style={{ 
                  fontSize: '20px', 
                  fontWeight: '900', 
                  color: '#333'
                }}>
                  ${portfolioStats.totalValue.toLocaleString()}
                </div>
              </div>

              <Button 
                variant="secondary" 
                size="full"
                onClick={() => {
                  sessionStorage.setItem('tsi_navigated_to_journal', 'true');
                  navigate('/dashboard/journal');
                }}
                style={{ marginTop: '20px' }}
              >
                צפה בתיק המלא
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
