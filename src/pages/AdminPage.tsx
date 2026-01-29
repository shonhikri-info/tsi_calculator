import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../app/components/UI/Button.jsx';
import Notification, { useNotification } from '../app/components/UI/Notification.jsx';
import UserManagement from '../app/components/Admin/UserManagement.jsx';
import FormulaEditor from '../app/components/Admin/FormulaEditor.jsx';
import { onAuthChange } from '../app/lib/auth';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../app/lib/firebase';

export default function AdminPage() {
  const [currentView, setCurrentView] = useState('users');
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { notification, notify } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    // בדיקה אמיתית של Firebase Authentication
    const unsubscribe = onAuthChange(async (user) => {
      if (!user) {
        // אין משתמש מחובר - נקה sessionStorage והפנה לדף הבית
        sessionStorage.clear();
        navigate('/');
        return;
      }

      try {
        // בדוק אם המשתמש הוא admin
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
          sessionStorage.clear();
          navigate('/');
          return;
        }

        const userData = userDoc.data();
        if (userData.role !== 'admin') {
          notify('גישה נדחתה - אין הרשאות מנהל', 'error');
          sessionStorage.clear();
          navigate('/');
          return;
        }

        // המשתמש מחובר והוא admin - עדכן את sessionStorage
        sessionStorage.setItem('tsi_current_user', user.uid);
        sessionStorage.setItem('tsi_user_type', userData.role);
        sessionStorage.setItem('tsi_user_data', JSON.stringify(userData));

        setCurrentUser(user.uid);
      } catch (error) {
        console.error('Error checking admin status:', error);
        notify('שגיאה בבדיקת הרשאות', 'error');
        sessionStorage.clear();
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate, notify]);

  const handleLogout = async () => {
    const { logoutUser } = await import('../app/lib/auth');
    await logoutUser();
    sessionStorage.clear();
    navigate('/');
    notify('יצאת מהמערכת');
  };

  if (isLoading || !currentUser) {
    return (
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '20px',
        color: '#FFD700'
      }}>
        <div>
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>🔐</div>
          <div>בודק הרשאות...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <Notification notification={notification} />

      <div className="header">
        <div className="nav-buttons">
          <button className="nav-btn" onClick={handleLogout}>
            יציאה
          </button>
          <button 
            className={`nav-btn ${currentView === 'users' ? 'active' : ''}`}
            onClick={() => setCurrentView('users')}
          >
            ניהול משתמשים
          </button>
          <button 
            className={`nav-btn ${currentView === 'formulas' ? 'active' : ''}`}
            onClick={() => setCurrentView('formulas')}
          >
            עורך נוסחאות
          </button>
        </div>
        
        <div className="logo">TSI</div>
        <div className="subtitle">פאנל מנהל</div>
      </div>

      <div className="modern-navigation">
        <button 
          className={`nav-tab ${currentView === 'users' ? 'active' : ''}`}
          onClick={() => setCurrentView('users')}
        >
          <span className="nav-text">ניהול משתמשים</span>
        </button>
        
        <button 
          className={`nav-tab ${currentView === 'formulas' ? 'active' : ''}`}
          onClick={() => setCurrentView('formulas')}
        >
          <span className="nav-text">עורך נוסחאות</span>
        </button>
      </div>

      {currentView === 'users' ? (
        <div className="section">
          <h2 className="section-title">ניהול משתמשים</h2>
          <UserManagement />
        </div>
      ) : (
        <div className="section">
          <FormulaEditor />
        </div>
      )}
      
      <div style={{
        textAlign: 'center',
        marginTop: '40px',
        padding: '20px',
        background: 'rgba(220, 53, 69, 0.1)',
        borderRadius: '15px',
        border: '2px solid rgba(220, 53, 69, 0.3)'
      }}>
        <h4 style={{ color: '#ff6b6b', marginBottom: '10px' }}>
          פאנל מנהל מערכת
        </h4>
        <p style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.5' }}>
          <strong>אישור משתמשים:</strong> אשר או דחה בקשות הרשמה של תלמידים<br/>
          <strong>עריכת נוסחאות:</strong> התאם נוסחאות החישוב לפי הצורך<br/>
          <strong>ניהול כללי:</strong> פקח על פעילות המערכת
        </p>
      </div>
    </div>
  );
}
