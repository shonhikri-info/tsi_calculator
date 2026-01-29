import { useState, useEffect } from 'react';
import Button from '../UI/Button';
import { saveFormulas, loadFormulas } from '../../lib/firestore';
import Notification, { useNotification } from '../UI/Notification';

export const DEFAULT_FORMULAS = {
  // נוסחאות בסיסיות (לשנה נוכחית) - מחושבות ראשונות
  eps: 'netIncome / shares',
  fair: 'eps * pe',
  
  // עמודות טבלת התחזיות (שנים עתידיות) - מחושבות שניות
  epsAfterYears: 'eps * Math.pow(1 + (growth / 100), years)',
  peTargetAfterYears: 'pe * Math.pow(1 + (growth / 100), years * 0.5)',
  netIncomeAfterYears: 'netIncome * Math.pow(1 + (growth / 100), years)',
  revenueAfterYears: 'revenue * Math.pow(1 + (growth / 100), years)',
  
  // שווי הוגן - הנוסחה שעובדת לך
  fairAfterYears: 'eps * pe * Math.pow(1 + (growth / 100), years * 0.5)',
  
  // כרטיס תשואה - הנוסחה שעובדת לך
  annualizedReturn: '((((eps * Math.pow(1 + (growth / 100), years)) * (pe * Math.pow(1 + (growth / 100), years * 0.5882))) / currentPrice) - 1) * 100'
};

export default function FormulaEditor() {
  const [formulas, setFormulas] = useState(DEFAULT_FORMULAS);
  const [loading, setLoading] = useState(false);
  const { notification, notify } = useNotification();

  useEffect(() => {
    loadCurrentFormulas();
  }, []);

  const loadCurrentFormulas = async () => {
    try {
      const savedFormulas = await loadFormulas();
      if (savedFormulas) {
        const mergedFormulas = { ...DEFAULT_FORMULAS, ...savedFormulas };
        setFormulas(mergedFormulas);
      }
    } catch (_) {}
  };

  const handleFormulaChange = (type, value) => {
    setFormulas(prev => ({ ...prev, [type]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const success = await saveFormulas(formulas);
      if (success) {
        notify('נוסחאות נשמרו בהצלחה!');
      } else {
        notify('שגיאה בשמירת הנוסחאות', 'error');
      }
    } catch (_) {
      notify('שגיאה בשמירת הנוסחאות', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (confirm('האם אתה בטוח שברצונך לאפס את הנוסחאות לברירת מחדל?')) {
      setFormulas(DEFAULT_FORMULAS);
      notify('נוסחאות אופסו לברירת מחדל');
      try {
        await saveFormulas(DEFAULT_FORMULAS);
      } catch (_) {}
    }
  };

  const formulaItemStyle = { display: 'grid', gap: '6px', marginBottom: '10px' };
  const formulaLabelStyle = { color: '#eee', fontWeight: 700, fontSize: '13px' };
  const formulaInputStyle = { padding: '10px', borderRadius: '8px', border: '1px solid #333', background: '#111', color: '#fff', fontFamily: 'monospace', fontSize: '13px', width: '100%', boxSizing: 'border-box' };
  const formulaHintStyle = { color: '#aaa', fontSize: '11px', lineHeight: '1.4' };

  return (
    <div className="section">
      <Notification notification={notification} />
      <h2 className="section-title">עורך נוסחאות</h2>
      
      <div className="formula-editor" style={{
        maxWidth: '100%',
        overflowX: 'hidden'
      }}>
        <h3 style={{ color: '#FFD700', marginBottom: '15px', textAlign: 'center', fontSize: '1.3em' }}>
          נוסחאות טבלת התחזיות
        </h3>
        <p style={{ 
          marginBottom: '20px', 
          color: '#ccc', 
          textAlign: 'center',
          fontSize: '13px',
          lineHeight: '1.5',
          padding: '0 10px'
        }}>
          הנוסחאות מחושבות בסדר מסוים - ניתן להשתמש בשדות מחושבים קודמים.<br/>
          <strong>למשל:</strong> fairAfterYears יכול להשתמש ב-epsAfterYears ו-peTargetAfterYears
        </p>
        
        <div style={{ display: 'grid', gap: '15px', maxWidth: '900px', margin: '0 auto', padding: '0 10px' }}>
          <div className="formula-section">
            <h4 style={{ color: '#FFD700', marginBottom: '12px', textAlign: 'center', fontSize: '1.1em' }}>
              נוסחאות בסיס (מחושבות ראשונות)
            </h4>
            
            <div style={formulaItemStyle}>
              <div style={formulaLabelStyle}>1. EPS - רווח למניה נוכחי:</div>
              <input 
                type="text" 
                style={formulaInputStyle}
                value={formulas.eps}
                onChange={(e) => handleFormulaChange('eps', e.target.value)}
              />
              <small style={formulaHintStyle}>ערך בסיסי המחושב מהרווח הנקי חלקי מספר המניות</small>
            </div>
            
            <div style={formulaItemStyle}>
              <div style={formulaLabelStyle}>2. שווי הוגן נוכחי:</div>
              <input 
                type="text" 
                style={formulaInputStyle}
                value={formulas.fair}
                onChange={(e) => handleFormulaChange('fair', e.target.value)}
              />
              <small style={formulaHintStyle}>משתמש ב-eps שחושב קודם</small>
            </div>
          </div>

          <div className="formula-section">
            <h4 style={{ color: '#FFD700', marginBottom: '12px', textAlign: 'center', fontSize: '1.1em' }}>
              ערכים עתידיים (מחושבים שניים)
            </h4>
            
            <div style={formulaItemStyle}>
              <div style={formulaLabelStyle}>3. EPS עתידי - רווח למניה:</div>
              <input 
                type="text" 
                style={formulaInputStyle}
                value={formulas.epsAfterYears}
                onChange={(e) => handleFormulaChange('epsAfterYears', e.target.value)}
              />
              <small style={formulaHintStyle}>משתמש ב-eps הבסיסי ומחיל עליו את הגידול</small>
            </div>
            
            <div style={formulaItemStyle}>
              <div style={formulaLabelStyle}>4. P/E עתידי - מכפיל רווח:</div>
              <input 
                type="text" 
                style={formulaInputStyle}
                value={formulas.peTargetAfterYears}
                onChange={(e) => handleFormulaChange('peTargetAfterYears', e.target.value)}
              />
              <small style={formulaHintStyle}>גידול ב-P/E (לרוב בקצב איטי יותר - 0.5)</small>
            </div>
            
            <div style={formulaItemStyle}>
              <div style={formulaLabelStyle}>5. רווח נקי עתידי (מיליון $):</div>
              <input 
                type="text" 
                style={formulaInputStyle}
                value={formulas.netIncomeAfterYears}
                onChange={(e) => handleFormulaChange('netIncomeAfterYears', e.target.value)}
              />
              <small style={formulaHintStyle}>רווח נקי עם גידול צפוי</small>
            </div>
            
            <div style={formulaItemStyle}>
              <div style={formulaLabelStyle}>6. הכנסות עתידיות (מיליון $):</div>
              <input 
                type="text" 
                style={formulaInputStyle}
                value={formulas.revenueAfterYears}
                onChange={(e) => handleFormulaChange('revenueAfterYears', e.target.value)}
              />
              <small style={formulaHintStyle}>הכנסות עם גידול צפוי</small>
            </div>
          </div>

          <div className="formula-section">
            <h4 style={{ color: '#FFD700', marginBottom: '12px', textAlign: 'center', fontSize: '1.1em' }}>
              חישובים מסכמים (מחושבים אחרונים)
            </h4>
            
            <div style={formulaItemStyle}>
              <div style={formulaLabelStyle}>7. שווי הוגן עתידי (Fair Value $):</div>
              <input 
                type="text" 
                style={formulaInputStyle}
                value={formulas.fairAfterYears}
                onChange={(e) => handleFormulaChange('fairAfterYears', e.target.value)}
              />
              <small style={formulaHintStyle}>
                שווי הוגן = eps × pe × צמיחה^(שנים×0.5)<br/>
                נוסחה פשוטה שמחשבת שווי עם צמיחה מתונה
              </small>
            </div>
            
            <div style={formulaItemStyle}>
              <div style={formulaLabelStyle}>8. תשואה שנתית ממוצעת (CAGR):</div>
              <input 
                type="text" 
                style={formulaInputStyle}
                value={formulas.annualizedReturn}
                onChange={(e) => handleFormulaChange('annualizedReturn', e.target.value)}
              />
              <small style={formulaHintStyle}>
                תשואה פוטנציאלית = (שווי הוגן עתידי ÷ מחיר נוכחי) × 100<br/>
                מראה כמה אחוז השווי ההוגן מהמחיר הנוכחי
              </small>
            </div>
          </div>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '30px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', padding: '0 10px' }}>
          <Button onClick={handleSave} loading={loading}>
            שמור נוסחאות
          </Button>
          <Button variant="secondary" onClick={handleReset}>
            אפס לברירת מחדל
          </Button>
        </div>
      </div>
      
      <div style={{ 
        background: 'rgba(255,255,255,0.1)', 
        padding: '15px', 
        borderRadius: '12px', 
        marginTop: '20px',
        border: '2px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h4 style={{ color: '#FFD700', marginBottom: '15px', textAlign: 'center', fontSize: '1.1em' }}>
          משתנים זמינים
        </h4>
        <div style={{ color: '#ccc', lineHeight: 1.6, fontSize: '12px' }}>
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#FFD700' }}>נתוני בסיס:</strong><br/>
            • <code>netIncome</code> - רווח נקי (מיליון $)<br/>
            • <code>revenue</code> - הכנסות (מיליון $)<br/>
            • <code>shares</code> - מספר מניות (מיליון)<br/>
            • <code>pe</code> - מכפיל רווח נוכחי<br/>
            • <code>currentPrice</code> - מחיר נוכחי ($)<br/>
            • <code>growth</code> - צמיחה שנתית (%)<br/>
            • <code>years</code> - מספר שנים מהיום<br/>
          </div>
          <div>
            <strong style={{ color: '#FFD700' }}>שדות מחושבים:</strong><br/>
            • <code>eps</code> - רווח למניה בסיסי<br/>
            • <code>fair</code> - שווי הוגן נוכחי<br/>
            • <code>epsAfterYears</code> - EPS עתידי<br/>
            • <code>peTargetAfterYears</code> - P/E עתידי<br/>
            • <code>netIncomeAfterYears</code> - רווח נקי עתידי<br/>
            • <code>revenueAfterYears</code> - הכנסות עתידיות<br/>
            • <code>fairAfterYears</code> - שווי הוגן עתידי<br/>
          </div>
        </div>
        
        <div style={{ marginTop: '15px', padding: '12px', background: 'rgba(255,215,0,0.1)', borderRadius: '8px' }}>
          <strong style={{ color: '#FFD700' }}>טיפ:</strong>
          <p style={{ color: '#ddd', marginTop: '5px', marginBottom: 0, fontSize: '11px', lineHeight: '1.4' }}>
            אפשר לבנות נוסחאות פשוטות יותר על ידי שימוש בשדות מחושבים.<br/>
            למשל, במקום לכתוב את כל החישוב מחדש בשווי הוגן,<br/>
            פשוט כתוב: <code>epsAfterYears * peTargetAfterYears</code>
          </p>
        </div>
      </div>
    </div>
  );
}