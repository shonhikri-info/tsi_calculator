import { useState, useEffect } from 'react';

export default function ResultsDisplay({ results, projections, symbol, originalInputs }) {
  const [displayResults, setDisplayResults] = useState(results);
  const [displayProjections, setDisplayProjections] = useState(projections);

  useEffect(() => {
    setDisplayResults(results);
    setDisplayProjections(projections);
  }, [results, projections, originalInputs]);

  const calculateInvestmentPosition = (annualReturn, expectedReturn = 10) => {
    let position = 0;
    const numericReturn = parseFloat(annualReturn) || 0;
    
    if (numericReturn <= 0) {
      position = 83.33;
    } else if (numericReturn < expectedReturn * 0.8) {
      position = 83.33;
    } else if (numericReturn < expectedReturn * 1.2) {
      position = 50;
    } else if (numericReturn < expectedReturn * 2) {
      position = 33.33;
    } else {
      position = 16.67;
    }
    
    return position;
  };

  const investmentPosition = calculateInvestmentPosition(displayResults.annualReturn);

  return (
    <div className="results" style={{ display: 'block' }}>
      <h3 className="results-title">תוצאות החישוב</h3>
      
      {displayResults?.sanity && displayResults.sanity.notes && displayResults.sanity.notes.length > 0 && (
        <div style={{ 
          background: '#fff4e6', 
          border: '1px solid #ffd699', 
          padding: '12px', 
          borderRadius: '8px', 
          marginBottom: '20px' 
        }}>
          <strong style={{ color: '#b55800' }}>אזהרה - אי התאמה בנתונים:</strong>
          <ul style={{ marginTop: '8px', marginBottom: 0 }}>
            {displayResults.sanity.notes.map((n, idx) => (
              <li key={idx} style={{ color: '#8a4b00' }}>{n}</li>
            ))}
          </ul>
        </div>
      )}

      <style jsx>{`
        @media (min-width: 769px) {
          .results-cards-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
          }
          
          .result-card-custom {
            padding: 30px;
          }
          
          .result-card-title {
            font-size: 16px;
            margin-bottom: 15px;
          }
          
          .result-card-value {
            font-size: 48px;
          }
        }
        
        @media (max-width: 768px) {
          .results-cards-container {
            display: flex;
            flex-direction: column;
            gap: 15px;
            margin-bottom: 25px;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
          }
          
          .result-card-custom {
            padding: 20px;
          }
          
          .result-card-title {
            font-size: 13px;
            margin-bottom: 8px;
          }
          
          .result-card-value {
            font-size: 36px;
          }
        }
      `}</style>
      
      <div className="results-cards-container">
        <div className="result-card result-card-custom" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '12px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
          textAlign: 'center'
        }}>
          <div className="result-card-title" style={{ 
            fontWeight: '600',
            color: '#fff'
          }}>
            תשואה פוטנציאלית
          </div>
          <div className="result-card-value" style={{ 
            fontWeight: '900',
            color: '#fff'
          }}>
            {displayResults.annualReturn && displayResults.annualReturn.includes('%') ? 
              displayResults.annualReturn : 
              `${displayResults.annualReturn}%`}
          </div>
        </div>

        <div className="result-card result-card-custom" style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          borderRadius: '12px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.25)'
        }}>
          <div className="result-card-title" style={{ 
            fontWeight: '600',
            marginBottom: '8px',
            color: '#fff',
            textAlign: 'center'
          }}>
            האם שווה השקעה?
          </div>
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '12px', 
            fontSize: '11px', 
            fontWeight: 600, 
            color: '#fff'
          }}>
            אין במידע זה המלצה להשקעה
          </div>
          <div className="investment-scale">
            <div className="scale-labels">
              <span style={{ color: '#000', fontWeight: '700', fontSize: '12px' }}>לא</span>
              <span style={{ color: '#000', fontWeight: '700', fontSize: '12px' }}>נטרלי</span>
              <span style={{ color: '#000', fontWeight: '700', fontSize: '12px' }}>כן</span>
            </div>
            <div className="scale-bar">
              <div className="scale-sections">
                <div className="section-color no"></div>
                <div className="section-color neutral"></div>
                <div className="section-color yes"></div>
              </div>
              <div 
                className="scale-indicator" 
                style={{ left: `calc(${investmentPosition}% - 10px)` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {displayProjections && (
        <ProjectionsTable projections={displayProjections} symbol={symbol} />
      )}

      <div style={{ 
        background: 'linear-gradient(135deg, #ff4444 0%, #cc0000 100%)', 
        border: '2px solid #ff6666', 
        borderRadius: '12px', 
        padding: '15px', 
        marginTop: '20px', 
        textAlign: 'center',
        boxShadow: '0 6px 20px rgba(255, 68, 68, 0.3)'
      }}>
        <div style={{ 
          fontSize: '16px', 
          fontWeight: '800', 
          color: '#ffffff', 
          marginBottom: '8px',
          textShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
          כלי אקדמי בלבד
        </div>
        <div style={{ 
          fontWeight: '600', 
          color: '#ffffff', 
          fontSize: '13px',
          lineHeight: '1.5'
        }}>
          זהו כלי אקדמי לתרגול בלבד ואינו מהווה המלצה להשקעה.
          <br/>
          לפני כל השקעה יש להתייעץ עם יועץ השקעות מוסמך.
        </div>
      </div>
    </div>
  );
}

function ProjectionsTable({ projections, symbol }) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // פונקציה משופרת לפורמט מספרים עם תמיכה במספרים שליליים
  const formatNumber = (num, decimals = 2) => {
    if (num === null || num === undefined || isNaN(num)) return '0.00';
    
    // תיקון: וודא שהמינוס תמיד בהתחלה
    const isNegative = num < 0;
    const absNum = Math.abs(num);
    
    // פורמט המספר עם פסיקים
    const formatted = absNum.toLocaleString('en-US', { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    });
    
    // החזר עם סימן מינוס אם שלילי
    return isNegative ? `-${formatted}` : formatted;
  };

  // פונקציה לפורמט מספרים פיננסיים עם צבע לערכים שליליים
  const formatFinancialNumber = (num, decimals = 2, prefix = '') => {
    if (num === null || num === undefined || isNaN(num)) {
      return {
        text: `${prefix}0.00`,
        color: '#333'
      };
    }
    
    const formatted = formatNumber(num, decimals);
    const isNegative = num < 0;
    
    return {
      text: `${prefix}${formatted}`,
      color: isNegative ? '#dc3545' : '#333'
    };
  };

  const headerStyle = {
    padding: isMobile ? '6px 1px' : '10px 6px',
    textAlign: 'center',
    fontWeight: '900',
    letterSpacing: '0px',
    fontSize: isMobile ? '9px' : '12px'
  };

  const cellStyle = {
    padding: isMobile ? '6px 1px' : '10px 6px',
    textAlign: 'center',
    borderBottom: '1px solid rgba(0,0,0,0.07)',
    fontSize: isMobile ? '9px' : '12px',
    color: '#333'
  };

  const subTextStyle = {
    fontSize: isMobile ? '7px' : '10px',
    color: '#666',
    marginTop: '2px'
  };

  return (
    <>
      <div style={{ marginTop: '30px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <h4 style={{ 
            color: '#FFD700', 
            fontSize: isMobile ? '1.1em' : '1.5em',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            margin: 0
          }}>
            תחזיות לפי שנה
          </h4>
          <button
            onClick={() => setIsFullScreen(true)}
            style={{
              background: 'linear-gradient(45deg, #FFD700, #FFA500)',
              color: '#333',
              border: 'none',
              padding: isMobile ? '8px 12px' : '10px 20px',
              borderRadius: '10px',
              fontSize: isMobile ? '11px' : '14px',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(255,215,0,0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            הגדל טבלה
          </button>
        </div>
        
        {symbol && (
          <div style={{ 
            marginBottom: '20px', 
            padding: '12px', 
            background: 'rgba(255,255,255,0.1)', 
            borderRadius: '10px', 
            fontSize: isMobile ? '11px' : '14px', 
            textAlign: 'center',
            fontWeight: '600'
          }}>
            <strong>הערה:</strong> החישוב מבוסס על נתונים אמיתיים עבור {symbol} עם אמידות לנתונים חסרים.
          </div>
        )}
        
        <div style={{ 
          overflowX: 'auto',
          borderRadius: '15px',
          boxShadow: '0 15px 50px rgba(0,0,0,0.4)',
          WebkitOverflowScrolling: 'touch'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            background: 'white',
            fontSize: isMobile ? '9px' : '12px',
            minWidth: isMobile ? '350px' : '600px'
          }}>
            <thead>
              <tr style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
              }}>
                <th style={headerStyle}>שנה</th>
                <th style={headerStyle}>EPS<br/>רווח למנייה</th>
                <th style={headerStyle}>מכפיל<br/>רווח</th>
                <th style={headerStyle}>רווח נקי<br/>(מיליון $)</th>
                <th style={headerStyle}>הכנסות<br/>(מיליון $)</th>
                <th style={headerStyle}>שווי הוגן<br/>Fair Value</th>
              </tr>
            </thead>
            <tbody>
              {projections.map((projection, index) => {
                const isLast = index === projections.length - 1;
                const isCurrent = index === 0;
                
                let rowStyle = { background: 'white' };
                if (isLast) {
                  rowStyle = { 
                    background: 'rgba(255, 215, 0, 0.25)', 
                    fontWeight: 'bold',
                    borderTop: '3px solid #FFD700'
                  };
                } else if (isCurrent) {
                  rowStyle = { 
                    background: 'rgba(102, 126, 234, 0.15)',
                    borderTop: '2px solid #667eea'
                  };
                } else if (index % 2 === 0) {
                  rowStyle = { background: 'rgba(240, 248, 255, 0.9)' };
                }

                const epsData = formatFinancialNumber(projection.eps, 2, '$');
                const netIncomeData = formatFinancialNumber(projection.netIncome, 2, '$');
                const revenueData = formatFinancialNumber(projection.revenue, 2, '$');
                const fairData = formatFinancialNumber(projection.fair, 2, '$');

                return (
                  <tr key={projection.year} style={rowStyle}>
                    <td style={{
                      ...cellStyle,
                      fontWeight: 'bold',
                      fontSize: isMobile ? '10px' : '12px',
                      color: isLast ? '#B8860B' : '#000',
                      background: isCurrent ? '#E6F0FF' : isLast ? '#FFF8DC' : 'inherit'
                    }}>
                      {projection.year}
                      {isCurrent && <div style={{...subTextStyle, color: '#000'}}>(נוכחי)</div>}
                      {isLast && <div style={{...subTextStyle, color: '#B8860B', fontWeight: 'bold'}}>(יעד)</div>}
                    </td>
                    <td style={{
                      ...cellStyle, 
                      fontWeight: '700', 
                      color: isLast ? '#B8860B' : epsData.color
                    }}>
                      {epsData.text}
                    </td>
                    <td style={{
                      ...cellStyle, 
                      fontWeight: '700', 
                      color: isLast ? '#B8860B' : (projection.pe < 0 ? '#dc3545' : '#000')
                    }}>
                      {formatNumber(projection.pe, 1)}
                    </td>
                    <td style={{
                      ...cellStyle, 
                      fontWeight: '700', 
                      color: isLast ? '#B8860B' : netIncomeData.color
                    }}>
                      {netIncomeData.text}
                    </td>
                    <td style={{
                      ...cellStyle, 
                      fontWeight: '700', 
                      color: isLast ? '#B8860B' : revenueData.color
                    }}>
                      {revenueData.text}
                    </td>
                    <td style={{
                      ...cellStyle,
                      fontWeight: 'bold',
                      fontSize: isMobile ? '10px' : '13px',
                      color: isLast ? '#B8860B' : fairData.color
                    }}>
                      {fairData.text}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isFullScreen && (
        <div 
          onClick={() => setIsFullScreen(false)}
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
              <h3 style={{ color: '#FFD700', margin: 0, fontSize: '16px' }}>תחזיות מלאות</h3>
              <button
                onClick={() => setIsFullScreen(false)}
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
                fontSize: '13px'
              }}>
                <thead>
                  <tr style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                  }}>
                    <th style={{padding: '10px 6px', fontSize: '12px'}}>שנה</th>
                    <th style={{padding: '10px 6px', fontSize: '12px'}}>EPS</th>
                    <th style={{padding: '10px 6px', fontSize: '12px'}}>P/E</th>
                    <th style={{padding: '10px 6px', fontSize: '12px'}}>רווח נקי</th>
                    <th style={{padding: '10px 6px', fontSize: '12px'}}>הכנסות</th>
                    <th style={{padding: '10px 6px', fontSize: '12px'}}>שווי הוגן</th>
                  </tr>
                </thead>
                <tbody>
                  {projections.map((projection, index) => {
                    const epsData = formatFinancialNumber(projection.eps, 2, '$');
                    const netIncomeData = formatFinancialNumber(projection.netIncome, 2, '$');
                    const revenueData = formatFinancialNumber(projection.revenue, 2, '$');
                    const fairData = formatFinancialNumber(projection.fair, 2, '$');
                    
                    return (
                      <tr key={projection.year} style={{background: index % 2 === 0 ? 'white' : 'rgba(255, 215, 0, 0.05)'}}>
                        <td style={{padding: '10px 6px', textAlign: 'center', fontSize: '12px', fontWeight: '700', color: '#333'}}>
                          {projection.year}
                        </td>
                        <td style={{padding: '10px 6px', textAlign: 'center', fontSize: '12px', color: epsData.color}}>
                          {epsData.text}
                        </td>
                        <td style={{padding: '10px 6px', textAlign: 'center', fontSize: '12px', color: projection.pe < 0 ? '#dc3545' : '#333'}}>
                          {formatNumber(projection.pe, 1)}
                        </td>
                        <td style={{padding: '10px 6px', textAlign: 'center', fontSize: '12px', color: netIncomeData.color}}>
                          {netIncomeData.text}
                        </td>
                        <td style={{padding: '10px 6px', textAlign: 'center', fontSize: '12px', color: revenueData.color}}>
                          {revenueData.text}
                        </td>
                        <td style={{padding: '10px 6px', textAlign: 'center', fontSize: '12px', fontWeight: '700', color: fairData.color}}>
                          {fairData.text}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}