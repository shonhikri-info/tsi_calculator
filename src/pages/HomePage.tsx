import { useState } from 'react';
import LoginForm from '../app/components/Auth/LoginForm.jsx';
import RegisterForm from '../app/components/Auth/RegisterForm.jsx';
import AdminLogin from '../app/components/Auth/AdminLogin.jsx';
import Notification, { useNotification } from '../app/components/UI/Notification.jsx';

export default function HomePage() {
  const [currentView, setCurrentView] = useState('login');
  const { notification, notify } = useNotification();

  return (
    <div className="container">
      <Notification notification={notification} />
      
      <div className="header">
        <div className="nav-buttons">
          <button 
            className="nav-btn" 
            onClick={() => setCurrentView('admin')}
          >
            מנהל
          </button>
          <button 
            className="nav-btn" 
            onClick={() => setCurrentView('login')}
          >
            תלמידים
          </button>
        </div>
        <div className="logo">TSI</div>
        <div className="subtitle">פלטפורמת השקעות מתקדמת</div>
      </div>

      {currentView === 'login' && (
        <LoginForm 
          onSwitchToRegister={() => setCurrentView('register')}
          notify={notify}
        />
      )}
      
      {currentView === 'register' && (
        <RegisterForm 
          onSwitchToLogin={() => setCurrentView('login')}
          notify={notify}
        />
      )}
      
      {currentView === 'admin' && (
        <AdminLogin 
          onBackToMain={() => setCurrentView('login')}
          notify={notify}
        />
      )}
      
      <div style={{
        textAlign: 'center',
        marginTop: '40px',
        padding: '20px',
        color: '#ccc',
        fontSize: '13px',
        background: 'rgba(0, 0, 0, 0.2)',
        borderRadius: '15px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <strong style={{ color: '#FFD700' }}>TSI Investment Platform</strong><br/>
        כלי אקדמי לתרגול הערכת שווי מניות ויומן מסחר<br/>
        <div style={{ marginTop: '10px', fontSize: '12px', color: '#ff6b6b' }}>
          אין במידע זה המלצה להשקעה
        </div>
        <div style={{ marginTop: '15px', fontSize: '12px' }}>
          <a 
            href="/privacy" 
            style={{ 
              color: '#4A9EFF', 
              textDecoration: 'none',
              cursor: 'pointer',
              borderBottom: '1px solid transparent',
              transition: 'border-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderBottomColor = '#4A9EFF'}
            onMouseLeave={(e) => e.currentTarget.style.borderBottomColor = 'transparent'}
          >
            🔐 מדיניות פרטיות
          </a>
        </div>
      </div>
    </div>
  );
}
