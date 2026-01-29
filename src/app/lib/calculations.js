// נוסחאות ברירת מחדל (מסונכרנות עם עורך הנוסחאות)
export const DEFAULT_FORMULAS = {
  // נוסחאות בסיסיות
  eps: 'netIncome / shares',
  fair: 'eps * pe',
  marketCap: 'currentPrice * shares',
  marketCapFair: '(eps * pe) * shares',

  // תשואה/פוטנציאל - עם טיפול במספרים שליליים
  potentialReturnFixed: `(((eps >= 0 ? eps * Math.pow(1 + (growth / 100), years) : eps * Math.pow(1 - (growth / 100), years)) * 
                          (pe >= 0 ? pe * Math.pow(1 + (growth / 100), years * 0.5) : Math.abs(pe))) / currentPrice - 1) * 100`,
  
  annualizedReturn: `(currentPrice > 0) ? 
                     (Math.pow(Math.abs(((eps >= 0 ? eps * Math.pow(1 + (growth / 100), years) : eps * Math.pow(1 - (growth / 100), years)) * 
                      (pe >= 0 ? pe * Math.pow(1 + (growth / 100), years * 0.5) : Math.abs(pe))) / currentPrice), 1 / years) - 1) * 100 : 0`,

  // נוסחאות תחזיות - צמיחה לאורך זמן עם טיפול במספרים שליליים
  epsAfterYears: '(eps >= 0) ? eps * Math.pow(1 + (growth / 100), years) : eps * Math.pow(1 - (growth / 100), years)',
  peTargetAfterYears: '(pe >= 0) ? pe * Math.pow(1 + (growth / 100), years * 0.5) : pe',
  netIncomeAfterYears: '(netIncome >= 0) ? netIncome * Math.pow(1 + (growth / 100), years) : netIncome * Math.pow(1 - (growth / 100), years)',
  revenueAfterYears: '(revenue >= 0) ? revenue * Math.pow(1 + (growth / 100), years) : revenue * Math.pow(1 - (growth / 100), years)',

  // שווי הוגן עתידי (מחיר יעד למניה) - עם טיפול במספרים שליליים
  fairAfterYears: `((eps >= 0 ? eps * Math.pow(1 + (growth / 100), years) : eps * Math.pow(1 - (growth / 100), years)) * 
                    (pe >= 0 ? pe * Math.pow(1 + (growth / 100), years * 0.5) : Math.abs(pe)))`,

  // תאימות לאחור (אם יש קוד ישן שמסתמך על שמות קודמים)
  priceTargetAfterYears: `((eps >= 0 ? eps * Math.pow(1 + (growth / 100), years) : eps * Math.pow(1 - (growth / 100), years)) * 
                           (pe >= 0 ? pe * Math.pow(1 + (growth / 100), years * 0.5) : Math.abs(pe)))`,
  
  marketCapTargetAfterYears: `(((eps >= 0 ? eps * Math.pow(1 + (growth / 100), years) : eps * Math.pow(1 - (growth / 100), years)) * 
                                (pe >= 0 ? pe * Math.pow(1 + (growth / 100), years * 0.5) : Math.abs(pe))) * shares)`
};

// פונקציה בטוחה להערכת נוסחה מחרוזתית מול משתנים
export const calculateFormula = (formula, variables) => {
  try {
    let expression = String(formula);

    // החלפת משתנים בערכים
    Object.keys(variables).forEach((key) => {
      const val = variables[key];
      const safeVal = (typeof val === 'number' && isFinite(val)) ? val : 0;
      const regex = new RegExp(`\\b${key}\\b`, 'g');
      expression = expression.replace(regex, String(safeVal));
    });

    // סינון בטיחות: מאפשר רק ספרות, אופרטורים, סוגריים, רווחים, נקודה/פסיק
    // ומסיר קריאות ל-Math.* כדי לאמת את הביטוי בלבד (לא לקריאה בפועל).
    const cleanExpression = expression.replace(/Math\.(pow|sqrt|abs|round|floor|ceil|min|max)/g, '');
    if (!/^[0-9+\-*/().,\s]+$/.test(cleanExpression)) {
      throw new Error('נוסחה לא תקינה');
    }

    // הערכת הנוסחה
    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${expression})`)();
    return (typeof result === 'number' && isFinite(result)) ? result : 0;
  } catch (_) {
    return 0;
  }
};

// חישוב מדדים פיננסיים מרכזיים
export const calculateFinancialMetrics = (inputs, customFormulas = null) => {
  const formulas = customFormulas || DEFAULT_FORMULAS;

  const variables = {
    pe: Number(inputs.pe) || 0,
    peTarget: Number(inputs.peTarget || inputs.pe) || 0,
    eps: Number(inputs.eps) || 0,
    revenue: Number(inputs.revenue) || 0,
    netIncome: Number(inputs.netIncome) || 0,
    growth: Number(inputs.growth) || 0,
    shares: Number(inputs.shares) || 0,
    currentPrice: Number(inputs.currentPrice) || 0,
    marketCap: Number(inputs.marketCap) || 0,
    years: Number(inputs.years) || 5
  };

  // EPS מחושב אם ניתן
  if (variables.shares > 0 && !isNaN(variables.netIncome)) {
    variables.eps = calculateFormula(formulas.eps, variables);
  }

  const out = {
    calculatedEPS: calculateFormula(formulas.eps, variables),
    calculatedMarketCap: calculateFormula(formulas.marketCap, variables),
    marketCapFair: calculateFormula(formulas.marketCapFair, variables),
    fairValue: calculateFormula(formulas.fair, variables),
    potentialReturn: calculateFormula(formulas.potentialReturnFixed, variables),
    annualizedReturn: calculateFormula(formulas.annualizedReturn, variables),
    epsAfterYears: calculateFormula(formulas.epsAfterYears, variables),
    priceTargetAfterYears: calculateFormula(formulas.priceTargetAfterYears, variables),
    marketCapTargetAfterYears: calculateFormula(formulas.marketCapTargetAfterYears, variables),
    peTargetAfterYears: calculateFormula(formulas.peTargetAfterYears, variables)
  };

  return out;
};

// תחזיות רב-שנתיות לטבלה (כל העמודות נשענות על נוסחאות הניתנות לעריכה)
export const calculateProjections = (inputs, years, customFormulas = null) => {
  const formulas = customFormulas || DEFAULT_FORMULAS;

  // הסרת Math.abs - שומרים על ערכים שליליים!
  const cleanInputs = {
    eps: parseFloat(inputs.eps) || 0,
    pe: parseFloat(inputs.pe) || 0,
    peTarget: parseFloat(inputs.peTarget) || parseFloat(inputs.pe) || 0,
    revenue: parseFloat(inputs.revenue) || 0,
    netIncome: parseFloat(inputs.netIncome) || 0,
    growth: parseFloat(inputs.growth) || 0,
    shares: parseFloat(inputs.shares) || 1,
    currentPrice: parseFloat(inputs.currentPrice) || 0,
    marketCap: parseFloat(inputs.marketCap) || 0
  };

  const projections = [];
  const baseYear = new Date().getFullYear();

  for (let i = 0; i < years; i++) {
    const year = baseYear + i;

    if (i === 0) {
      // שנה נוכחית - ערכים מקוריים
      const fairValuePerShare = cleanInputs.eps * cleanInputs.pe;
      projections.push({
        year,
        eps: cleanInputs.eps,
        pe: cleanInputs.pe,
        revenue: cleanInputs.revenue,
        netIncome: cleanInputs.netIncome,
        fair: fairValuePerShare,
        cagr: null
      });
    } else {
      // שנים עתידיות - חישוב עם צמיחה
      const yearVars = { ...cleanInputs, years: i };

      const newEps = calculateFormula(formulas.epsAfterYears, yearVars);
      const futurePE = calculateFormula(formulas.peTargetAfterYears, yearVars);
      const newNetIncome = calculateFormula(formulas.netIncomeAfterYears, yearVars);
      const newRevenue = calculateFormula(formulas.revenueAfterYears, yearVars);

      const fairValuePerShare = calculateFormula(formulas.fairAfterYears, {
        ...yearVars,
        eps: newEps,
        pe: futurePE
      });

      const cagr = (projections[0].fair !== 0 && projections[0].fair > 0 && fairValuePerShare > 0)
        ? Math.pow(fairValuePerShare / projections[0].fair, 1 / i) - 1
        : 0;

      projections.push({
        year,
        eps: newEps,
        pe: futurePE,
        revenue: newRevenue,
        netIncome: newNetIncome,
        fair: fairValuePerShare,
        cagr
      });
    }
  }

  return projections;
};

// טעינת נתוני מניה בסיסיים מ-Yahoo (דרך AllOrigins) – אופציונלי
export const fetchStockData = async (symbol) => {
  const url = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`)}`;
  const response = await fetch(url);
  const data = await response.json();
  const stockInfo = JSON.parse(data.contents);

  if (stockInfo.chart && stockInfo.chart.result && stockInfo.chart.result[0]) {
    const result = stockInfo.chart.result[0];
    const meta = result.meta;
    const price = (typeof meta.regularMarketPrice === 'number')
      ? meta.regularMarketPrice
      : meta.previousClose;

    return {
      name: meta.longName || meta.shortName || symbol,
      symbol: symbol,
      price: price,
      change: (typeof meta.previousClose === 'number' && meta.previousClose > 0)
        ? ((price - meta.previousClose) / meta.previousClose * 100)
        : 0,
      volume: meta.regularMarketVolume || 0,
      marketCap: meta.marketCap,
      type: 'CS'
    };
  }

  throw new Error('לא ניתן לטעון נתונים');
};

// יצירת אומדנים אוטומטיים אם חסרים נתונים
export const generateAutoEstimates = (stockData) => {
  let growth = 12;
  let estimatedPE = 15;

  if (stockData.change > 20) {
    growth = 18;
    estimatedPE = 20;
  } else if (stockData.change > 10) {
    growth = 15;
    estimatedPE = 17;
  } else if (stockData.change < -20) {
    growth = 3;
    estimatedPE = 10;
  } else if (stockData.change < -10) {
    growth = 6;
    estimatedPE = 12;
  }

  const currentPrice = stockData.price;
  const estimatedEPS = currentPrice / 20;
  const estimatedRevenue = estimatedEPS * 100;
  const estimatedShares = 100;
  const estimatedMarketCap = currentPrice * estimatedShares;

  return {
    pe: estimatedPE,
    peTarget: estimatedPE * 1.2,
    eps: estimatedEPS,
    revenue: estimatedRevenue,
    netIncome: estimatedRevenue * 0.15,
    growth: growth,
    shares: estimatedShares,
    currentPrice: currentPrice,
    marketCap: estimatedMarketCap
  };
};

// סטטיסטיקות תיק – עוקף שינויי סכימות ומנסה להיות סלחני
export const calculatePortfolioStats = (portfolio = []) => {
  if (!Array.isArray(portfolio) || portfolio.length === 0) {
    return { totalValue: 0, stockCount: 0, totalPnL: 0, avgChange: 0 };
  }

  let totalValue = 0;
  let totalPnL = 0;
  let sumChange = 0;
  let counted = 0;

  for (const item of portfolio) {
    const qty = Number(item.quantity || item.qty || item.shares || 0) || 0;
    const price = Number(item.currentPrice || item.price || 0) || 0;
    const cost = Number(item.costBasis || item.avgPrice || 0) || 0;
    const changePct = Number(item.change || item.changePct || 0) || 0;

    const value = qty * price;
    totalValue += value;

    if (qty > 0 && (price || cost)) {
      const pnl = (price - (cost || price)) * qty;
      totalPnL += pnl;
    }

    if (!isNaN(changePct)) {
      sumChange += changePct;
      counted += 1;
    }
  }

  const avgChange = counted > 0 ? sumChange / counted : 0;
  const stockCount = portfolio.length;

  return { totalValue, stockCount, totalPnL, avgChange };
};