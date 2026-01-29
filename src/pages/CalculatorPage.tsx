import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ManualCalc from '../app/components/Calculator/ManualCalc.jsx';
import ResultsDisplay from '../app/components/Calculator/ResultsDisplay.jsx';
import Notification, { useNotification } from '../app/components/UI/Notification.jsx';
import {
  calculateFormula,
  calculateProjections,
  DEFAULT_FORMULAS,
  calculateFinancialMetrics
} from '../app/lib/calculations';
import { loadFormulas } from '../app/lib/firestore';

export default function CalculatorPage() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);
  const [projections, setProjections] = useState<any>(null);
  const [originalInputs, setOriginalInputs] = useState<any>(null);
  const [formulas, setFormulas] = useState(DEFAULT_FORMULAS);
  
  const { notification, notify } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = sessionStorage.getItem('tsi_current_user');
    const userType = sessionStorage.getItem('tsi_user_type');
    
    if (!savedUser || (userType !== 'user' && userType !== 'admin')) {
      navigate('/');
      return;
    }
    
    setCurrentUser(savedUser);
    loadCurrentFormulas();
  }, [navigate]);

  const loadCurrentFormulas = async () => {
    try {
      const savedFormulas = await loadFormulas();
      if (savedFormulas) {
        const updatedFormulas = { ...DEFAULT_FORMULAS, ...savedFormulas };
        setFormulas(updatedFormulas);
      } else {
        setFormulas(DEFAULT_FORMULAS);
      }
    } catch (_) {
      setFormulas(DEFAULT_FORMULAS);
    }
  };

  const handleManualCalculation = async (calculationData: any, customFormulas: any) => {
    try {
      setOriginalInputs(calculationData);
      
      let formulasToUse = customFormulas;
      if (!formulasToUse || Object.keys(formulasToUse).length === 0) {
        const freshFormulas = await loadFormulas();
        formulasToUse = freshFormulas ? { ...DEFAULT_FORMULAS, ...freshFormulas } : DEFAULT_FORMULAS;
      }
      setFormulas(formulasToUse);
      
      performCalculation(calculationData, formulasToUse);
    } catch (_) {
      notify('שגיאה בחישוב', 'error');
    }
  };
  
  const performCalculation = (calculationData: any, formulasToUse = formulas) => {
    try {
      const variablesInput = {
        pe: Number(calculationData.pe) || 0,
        eps: Number(calculationData.eps) || 0,
        revenue: Number(calculationData.revenue) || 0,
        netIncome: Number(calculationData.netIncome) || 0,
        growth: Number(calculationData.growth) || 0,
        shares: Number(calculationData.shares) || 0,
        currentPrice: Number(calculationData.currentPrice) || 0,
        marketCap: Number(calculationData.marketCap) || 0,
        years: Number(calculationData.years) || 5
      };

      const metrics = calculateFinancialMetrics(variablesInput, formulasToUse as any);

      const userEPS = Number(calculationData.eps) || 0;
      const calcEPS = Number(metrics.calculatedEPS) || 0;
      if (userEPS > 0 && Math.abs(userEPS - calcEPS) > Math.max(0.01, Math.abs(calcEPS) * 0.01)) {
        variablesInput.eps = calcEPS;
        notify('התאמת EPS אוטומטית מתוך NetIncome ÷ Shares (היה חוסר התאמה)', 'warning');
      } else {
        variablesInput.eps = calcEPS || variablesInput.eps;
      }

      if (!variablesInput.marketCap && variablesInput.shares > 0 && variablesInput.currentPrice > 0) {
        variablesInput.marketCap = variablesInput.shares * variablesInput.currentPrice;
      }

      const fairValue = metrics.fairValue || 0;
      const potentialReturn = metrics.annualizedReturn || 0;
      const marketCapFair = metrics.marketCapFair || 0;
      const marketCap = metrics.calculatedMarketCap || variablesInput.marketCap || 0;

      const calculationResults = {
        marketCap: `${Number(marketCap).toFixed(2)} מיליון $`,
        pe: Number(variablesInput.pe).toFixed(2),
        peTarget: Number(variablesInput.pe).toFixed(2),
        targetPrice: `$${Number(fairValue).toFixed(2)}`,
        fairValue: `$${Number(fairValue).toFixed(2)}`,
        annualReturn: `${Number(potentialReturn).toFixed(2)}%`,
        sanity: null,
        originalInputs: calculationData
      };

      const projectionData = calculateProjections(variablesInput, variablesInput.years, formulasToUse as any);

      setResults(calculationResults);
      setProjections(projectionData);
      setOriginalInputs(calculationData);
      notify('החישוב הושלם בהצלחה!');
      
    } catch (_) {
      notify('שגיאה בחישוב', 'error');
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <>
      <Notification notification={notification} />
      
      <div className="section">
        <h2 className="section-title">מחשבון הערכת שווי</h2>
        
        <ManualCalc onCalculate={handleManualCalculation} />
        
        {results && (
          <ResultsDisplay 
            results={results} 
            projections={projections}
            symbol={null}
            originalInputs={originalInputs} 
          />
        )}
      </div>
    </>
  );
}
