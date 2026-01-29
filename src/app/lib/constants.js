// User Status Constants
export const USER_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  BLOCKED: 'blocked'
};

// Trade Types
export const TRADE_TYPES = {
  BUY: 'buy',
  SELL: 'sell'
};

// User Roles
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin'
};

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Session Storage Keys
export const SESSION_KEYS = {
  CURRENT_USER: 'tsi_current_user',
  USER_TYPE: 'tsi_user_type',
  USER_DATA: 'tsi_user_data'
};

// Validation Rules
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  PHONE_REGEX: /^(\+?972|0)([5-9]\d{8})$/,
  MIN_PROJECTION_YEARS: 1,
  MAX_PROJECTION_YEARS: 15
};

// Default Values
export const DEFAULTS = {
  PROJECTION_YEARS: 5,
  EXPECTED_RETURN: 10,
  MIN_TRADE_SHARES: 0.001,
  MIN_TRADE_PRICE: 0.01
};

// Error Messages (Hebrew)
export const ERROR_MESSAGES = {
  AUTH: {
    EMAIL_IN_USE: 'האימייל כבר בשימוש',
    WEAK_PASSWORD: 'הסיסמה חלשה מדי (לפחות 6 תווים)',
    INVALID_EMAIL: 'אימייל לא תקין',
    WRONG_CREDENTIALS: 'אימייל או סיסמה שגויים',
    TOO_MANY_REQUESTS: 'יותר מדי ניסיונות. נסה שוב מאוחר יותר',
    USER_NOT_FOUND: 'משתמש לא קיים',
    USER_BLOCKED: 'המשתמש חסום',
    USER_NOT_APPROVED: 'המשתמש טרם אושר על ידי מנהל',
    ACCESS_DENIED: 'גישה נדחתה - משתמש זה אינו מנהל'
  },
  VALIDATION: {
    REQUIRED_FIELDS: 'נא למלא את כל השדות החובה',
    INVALID_PHONE: 'מספר טלפון לא תקין. השתמש בפורמט: 050-1234567',
    PASSWORD_MISMATCH: 'הסיסמאות אינן תואמות',
    PASSWORD_TOO_SHORT: 'הסיסמה חייבת להכיל לפחות 6 תווים',
    INVALID_YEARS: 'מספר השנים לתחזית חייב להיות בין 1 ל-15',
    POSITIVE_VALUES: 'כמות ומחיר חייבים להיות חיוביים',
    INSUFFICIENT_SHARES: 'אין מספיק מניות למכירה'
  },
  GENERAL: {
    LOADING_ERROR: 'שגיאה בטעינת נתונים',
    SAVE_ERROR: 'שגיאה בשמירת נתונים',
    DELETE_ERROR: 'שגיאה במחיקה',
    CALCULATION_ERROR: 'שגיאה בחישוב',
    UNKNOWN_ERROR: 'שגיאה לא צפויה'
  }
};

// Success Messages (Hebrew)
export const SUCCESS_MESSAGES = {
  AUTH: {
    LOGIN: 'התחברת בהצלחה!',
    REGISTER: 'נרשמת בהצלחה! בדוק את האימייל שלך לאימות.',
    LOGOUT: 'יציאת מהמערכת',
    PASSWORD_RESET_SENT: 'נשלח אימייל לאיפוס סיסמה!',
    PASSWORD_RESET_SUCCESS: 'הסיסמה אופסה בהצלחה!',
    EMAIL_VERIFIED: 'האימייל אומת בהצלחה!'
  },
  TRADE: {
    SAVED: 'עסקה נשמרה בהצלחה!',
    DELETED: 'העסקה נמחקה'
  },
  ADMIN: {
    USER_APPROVED: 'המשתמש אושר',
    USER_REJECTED: 'המשתמש נדחה',
    USER_BLOCKED: 'המשתמש נחסם',
    USER_DELETED: 'המשתמש נמחק',
    FORMULAS_SAVED: 'נוסחאות נשמרו בהצלחה!',
    FORMULAS_RESET: 'נוסחאות אופסו לברירת מחדל'
  },
  CALCULATION: {
    COMPLETED: 'החישוב הושלם בהצלחה!'
  }
};

// Route Paths
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  CALCULATOR: '/dashboard/calculator',
  JOURNAL: '/dashboard/journal',
  ADMIN: '/admin',
  AUTH_ACTION: '/auth-action'
};