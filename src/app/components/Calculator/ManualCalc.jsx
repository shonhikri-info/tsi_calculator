import { useState, useEffect } from 'react';
import Input from '../UI/Input';
import Button from '../UI/Button';
import { loadFormulas } from '../../lib/firestore';
import { DEFAULT_FORMULAS, calculateFormula } from '../../lib/calculations';

export default function ManualCalc({ onCalculate }) {
  const [formData, setFormData] = useState({
    pe: '',
    eps: '',
    revenue: '',
    netIncome: '',
    growth: '',
    shares: '',
    currentPrice: '',
    marketCap: '',
    years: '5'
  });

  const [autoCalcFields, setAutoCalcFields] = useState(new Set());
  const [formulas, setFormulas] = useState(DEFAULT_FORMULAS);

  useEffect(() => {
    loadCurrentFormulas();
  }, []);

  const loadCurrentFormulas = async () => {
    try {
      const savedFormulas = await loadFormulas();
      if (savedFormulas) {
        const updatedFormulas = { ...DEFAULT_FORMULAS, ...savedFormulas };
        setFormulas(updatedFormulas);
      } else {
        setFormulas(DEFAULT_FORMULAS);
      }
    } catch (error) {
      setFormulas(DEFAULT_FORMULAS);
    }
  };

  useEffect(() => {
    const net = Number(formData.netIncome);
    const sh = Number(formData.shares);
    
    if (sh > 0 && !isNaN(net)) {
      try {
        const variables = {
          netIncome: net,
          shares: sh,
          revenue: Number(formData.revenue) || 0,
          currentPrice: Number(formData.currentPrice) || 0,
          marketCap: Number(formData.marketCap) || 0,
          pe: Number(formData.pe) || 0,
          peTarget: Number(formData.pe) || 0,
          eps: Number(formData.eps) || 0,
          growth: Number(formData.growth) || 0,
          years: Number(formData.years) || 5
        };
        const epsVal = calculateFormula(formulas.eps, variables);
        // תיקון: וודא שהמינוס מופיע בהתחלה
        const epsFixed = Math.abs(epsVal) < 0.005 ? '0.00' : 
                       epsVal < 0 ? `-${Math.abs(epsVal).toFixed(2)}` : 
                       epsVal.toFixed(2);
        setFormData(prev => ({ ...prev, eps: epsFixed }));
      } catch (error) {
        const epsVal = net / sh;
        // תיקון: וודא שהמינוס מופיע בהתחלה
        const epsFixed = Math.abs(epsVal) < 0.005 ? '0.00' : 
                       epsVal < 0 ? `-${Math.abs(epsVal).toFixed(2)}` : 
                       epsVal.toFixed(2);
        setFormData(prev => ({ ...prev, eps: epsFixed }));
      }
    } else {
      setFormData(prev => ({ ...prev, eps: '' }));
    }
  }, [formData.netIncome, formData.shares, formulas.eps, formData.revenue, formData.currentPrice, formData.marketCap, formData.pe, formData.growth, formData.years]);

  useEffect(() => {
    const shares = parseFloat(formData.shares) || 0;
    const currentPrice = parseFloat(formData.currentPrice) || 0;
    const marketCap = parseFloat(formData.marketCap) || 0;

    if (shares > 0 && currentPrice !== 0) {
      const calculated = shares * currentPrice;
      if (Math.abs(calculated - marketCap) > 0.01) {
        // תיקון: וודא שהמינוס מופיע בהתחלה
        const marketCapFixed = calculated < 0 ? 
          `-${Math.abs(calculated).toFixed(2)}` : 
          calculated.toFixed(2);
        setFormData(prev => ({ ...prev, marketCap: marketCapFixed }));
        setAutoCalcFields(prev => new Set(prev).add('marketCap'));
      }
    } else if (marketCap !== 0 && shares > 0 && currentPrice === 0) {
      const calculated = marketCap / shares;
      const priceFixed = calculated < 0 ? 
        `-${Math.abs(calculated).toFixed(2)}` : 
        calculated.toFixed(2);
      setFormData(prev => ({ ...prev, currentPrice: priceFixed }));
      setAutoCalcFields(prev => new Set(prev).add('currentPrice'));
    } else if (marketCap !== 0 && currentPrice !== 0 && shares === 0) {
      const calculated = marketCap / currentPrice;
      const sharesFixed = calculated < 0 ? 
        `-${Math.abs(calculated).toFixed(2)}` : 
        calculated.toFixed(2);
      setFormData(prev => ({ ...prev, shares: sharesFixed }));
      setAutoCalcFields(prev => new Set(prev).add('shares'));
    }
  }, [formData.shares, formData.currentPrice, formData.marketCap]);

  useEffect(() => {
    if (autoCalcFields.size > 0) {
      const timer = setTimeout(() => {
        setAutoCalcFields(new Set());
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [autoCalcFields]);

  const formatNumberWithCommas = (value) => {
    if (!value && value !== 0 && value !== '0') return '';
    
    // המר לstring
    let stringValue = value.toString();
    
    // בדוק אם יש מינוס בסוף (כמו "10-")
    const hasMinusAtEnd = stringValue.endsWith('-');
    if (hasMinusAtEnd) {
      // העבר את המינוס להתחלה
      stringValue = '-' + stringValue.slice(0, -1);
    }
    
    // בדוק אם יש מינוס בהתחלה
    const isNegative = stringValue.startsWith('-');
    
    // הסר את המינוס ואת כל הפסיקים
    const cleanValue = stringValue.replace(/[^0-9.]/g, '');
    
    // אם אין ערך מספרי, החזר ריק או 0
    if (!cleanValue && cleanValue !== '0') {
      return isNegative ? '-' : '';
    }
    
    // פצל לחלק השלם והעשרוני
    const parts = cleanValue.split('.');
    const integerPart = parts[0] || '0';
    const decimalPart = parts[1];
    
    // הוסף פסיקים רק למספרים גדולים מ-99 ורק אם אין נקודה עשרונית
    const num = parseFloat(integerPart);
    if (num > 99 && !decimalPart) {
      const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      const result = `${formattedInteger}`;
      return isNegative ? `-${result}` : result;
    }
    
    // למספרים קטנים או עם נקודה עשרונית, החזר כמו שהוא
    const result = decimalPart !== undefined ? `${integerPart}.${decimalPart}` : integerPart;
    return isNegative ? `-${result}` : result;
  };

  const handleInputChange = (field, value) => {
    let cleanValue = value;
    
    // אם זה השדה years, אל תאפשר מינוס
    if (field === 'years') {
      cleanValue = value.replace(/[^0-9]/g, '');
    } else {
      // עבור כל השדות האחרים, אפשר מינוס, מספרים, נקודה ופסיקים
      
      // שלב 1: הסר את כל הפסיקים כדי לעבוד עם המספר הנקי
      let valueWithoutCommas = value.replace(/,/g, '');
      
      // שלב 2: בדוק אם יש מינוס בסוף והעבר אותו להתחלה
      if (valueWithoutCommas.endsWith('-') && valueWithoutCommas.length > 1) {
        valueWithoutCommas = '-' + valueWithoutCommas.slice(0, -1);
      }
      
      // שלב 3: בדוק אם יש מינוס בהתחלה
      const hasMinusAtStart = valueWithoutCommas.startsWith('-');
      
      // שלב 4: הסר את כל התווים שאינם מספרים או נקודה (כולל מינוסים נוספים)
      let numbersOnly = valueWithoutCommas.replace(/[^0-9.]/g, '');
      
      // שלב 5: וודא שיש רק נקודה אחת
      const dotCount = (numbersOnly.match(/\./g) || []).length;
      if (dotCount > 1) {
        const parts = numbersOnly.split('.');
        numbersOnly = parts[0] + '.' + parts.slice(1).join('');
      }
      
      // שלב 6: הוסף מינוס בחזרה אם היה
      cleanValue = hasMinusAtStart ? '-' + numbersOnly : numbersOnly;
      
      // שלב 7: אם המשתמש רק הקליד מינוס, שמור אותו
      if (value === '-') {
        cleanValue = '-';
      }
    }
    
    setFormData(prev => ({ ...prev, [field]: cleanValue }));
    setAutoCalcFields(prev => {
      const newSet = new Set(prev);
      newSet.delete(field);
      return newSet;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // בדוק שכל השדות הנדרשים מלאים וחוקיים
    const requiredFields = ['pe', 'eps', 'revenue', 'netIncome', 'growth', 'shares', 'currentPrice'];
    const missingFields = requiredFields.filter(field => {
      const value = formData[field];
      // ערך חסר אם הוא ריק, רק מינוס, או לא מספרי
      return !value || value === '' || value === '-' || isNaN(parseFloat(value));
    });
    
    if (missingFields.length > 0) {
      alert('נא למלא את כל השדות בערכים תקינים (ניתן להזין מספרים שליליים)');
      return;
    }

    const years = parseInt(formData.years);
    if (years < 1 || years > 15) {
      alert('מספר השנים לתחזית חייב להיות בין 1 ל-15');
      return;
    }

    const calculationData = {
      pe: parseFloat(formData.pe),
      eps: parseFloat(formData.eps),
      revenue: parseFloat(formData.revenue),
      netIncome: parseFloat(formData.netIncome),
      growth: parseFloat(formData.growth),
      shares: parseFloat(formData.shares),
      currentPrice: parseFloat(formData.currentPrice),
      marketCap: parseFloat(formData.marketCap) || (parseFloat(formData.shares) * parseFloat(formData.currentPrice)),
      years: years
    };
    
    // הדפס את הנתונים לדיבאג
    console.log('Sending data:', calculationData);

    try {
      const freshFormulas = await loadFormulas();
      const formulasToSend = freshFormulas ? { ...DEFAULT_FORMULAS, ...freshFormulas } : DEFAULT_FORMULAS;
      onCalculate(calculationData, formulasToSend);
    } catch (error) {
      onCalculate(calculationData, formulas);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ 
        fontSize: '11px', 
        color: '#666', 
        marginBottom: '15px', 
        padding: '8px', 
        background: '#f0f0f0', 
        borderRadius: '6px',
        textAlign: 'center'
      }}>
        💡 ניתן להזין ערכים שליליים (לדוגמה: רווח שלילי, צמיחה שלילית)
      </div>
      
      <div className="mobile-form-grid">
        <Input
          label="מכפיל רווח נוכחי (P/E)"
          type="text"
          value={formatNumberWithCommas(formData.pe)}
          onChange={(e) => handleInputChange('pe', e.target.value)}
          placeholder="הכנס מכפיל רווח"
          required
        />
        
        <Input
          label="מחיר למנייה ($)"
          type="text"
          value={formatNumberWithCommas(formData.currentPrice)}
          onChange={(e) => handleInputChange('currentPrice', e.target.value)}
          placeholder="הכנס מחיר למנייה"
          autoCalc={autoCalcFields.has('currentPrice')}
          required
        />
        
        <Input
          label="הכנסות (מיליון $)"
          type="text"
          value={formatNumberWithCommas(formData.revenue)}
          onChange={(e) => handleInputChange('revenue', e.target.value)}
          placeholder="הכנס הכנסות"
          required
        />
        
        <Input
          label="רווח נקי (מיליון $)"
          type="text"
          value={formatNumberWithCommas(formData.netIncome)}
          onChange={(e) => handleInputChange('netIncome', e.target.value)}
          placeholder="הכנס רווח נקי"
          required
        />
        
        <Input
          label="צמיחה שנתית (%)"
          type="text"
          value={formatNumberWithCommas(formData.growth)}
          onChange={(e) => handleInputChange('growth', e.target.value)}
          placeholder="הכנס צמיחה צפויה"
          required
        />
        
        <Input
          label="מספר מניות (מיליון)"
          type="text"
          value={formatNumberWithCommas(formData.shares)}
          onChange={(e) => handleInputChange('shares', e.target.value)}
          placeholder="הכנס מספר מניות"
          autoCalc={autoCalcFields.has('shares')}
          required
        />
        
        <Input
          label="שווי שוק (מיליון $)"
          type="text"
          value={formatNumberWithCommas(formData.marketCap)}
          onChange={(e) => handleInputChange('marketCap', e.target.value)}
          placeholder="יחושב אוטומטית"
          autoCalc={autoCalcFields.has('marketCap')}
        />
        
        <Input
          label="רווח למנייה EPS ($)"
          type="text"
          value={formatNumberWithCommas(formData.eps)}
          onChange={(e) => handleInputChange('eps', e.target.value)}
          placeholder="יחושב אוטומטית"
          required
        />
        
        <Input
          label="מספר שנים לתחזית"
          type="number"
          step="1"
          min="1"
          max="15"
          inputMode="numeric"
          value={formData.years}
          onChange={(e) => handleInputChange('years', e.target.value)}
          placeholder="5"
          required
        />
      </div>

      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <Button type="submit">חשב</Button>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .mobile-form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 15px;
          }
        }
        
        @media (min-width: 769px) {
          .mobile-form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 25px;
            margin-bottom: 30px;
          }
        }
      `}</style>
    </form>
  );
}