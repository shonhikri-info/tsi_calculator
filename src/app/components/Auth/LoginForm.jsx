import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../UI/Input';
import Button from '../UI/Button';
import { loginUser, resetPassword } from '../../lib/auth';

export default function LoginForm({ onSwitchToRegister, notify }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await loginUser(email, password);
      
      if (result.success) {
        sessionStorage.setItem('tsi_current_user', result.userId);
        sessionStorage.setItem('tsi_user_type', result.userType);
        sessionStorage.setItem('tsi_user_data', JSON.stringify(result.userData));
        
        notify(`ברוך הבא ${result.userData.name || 'משתמש'}!`);
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      } else {
        notify(result.error, 'error');
      }
    } catch (error) {
      notify('שגיאה בהתחברות', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    if (!email) {
      notify('הכנס אימייל כדי לאפס סיסמה', 'error');
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword(email);

      if (result.success) {
        notify('נשלח אימייל לאיפוס סיסמה!');
        setShowForgotPassword(false);
      } else {
        notify(result.error, 'error');
      }
    } catch (error) {
      notify('שגיאה בשליחת אימייל', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="section">
        <h2 className="section-title">איפוס סיסמה</h2>
        
        <form onSubmit={handleForgotPassword} style={{ maxWidth: '400px', margin: '0 auto' }}>
          <p style={{ textAlign: 'center', marginBottom: '20px', color: '#ccc' }}>
            הכנס את האימייל שלך ונשלח לך קישור לאיפוס הסיסמה
          </p>
          
          <Input
            label="אימייל"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="הכנס אימייל"
            required
          />
          
          <Button type="submit" size="full" loading={loading}>
            שלח קישור לאיפוס
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button
            onClick={() => setShowForgotPassword(false)}
            style={{
              background: 'none',
              border: 'none',
              color: '#FFD700',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '700',
              textDecoration: 'underline'
            }}
          >
            חזור להתחברות
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <h2 className="section-title">כניסה למערכת</h2>
      
      <div style={{ maxWidth: '400px', margin: '0 auto' }}>
        <form onSubmit={handleLogin}>
          <Input
            label="אימייל"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="הכנס אימייל"
            required
          />
          
          <Input
            label="סיסמה"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="הכנס סיסמה"
            required
          />
          
          <Button type="submit" size="full" loading={loading}>
            כניסה
          </Button>
        </form>
        
        <div style={{ 
          textAlign: 'center', 
          marginTop: '25px',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px'
        }}>
          <button
            onClick={() => setShowForgotPassword(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#FFD700',
              cursor: 'pointer',
              fontSize: '14px',
              textDecoration: 'underline'
            }}
          >
            שכחתי סיסמה
          </button>
          
          <div style={{ 
            padding: '20px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '15px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <p style={{ 
              color: '#ccc', 
              fontSize: '14px',
              marginBottom: '15px',
              fontWeight: '600'
            }}>
              אין לך חשבון עדיין?
            </p>
            <Button 
              variant="secondary" 
              size="full"
              onClick={onSwitchToRegister}
            >
              הרשמה חדשה
            </Button>
          </div>
        </div>
        
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          background: 'rgba(255, 215, 0, 0.1)', 
          borderRadius: '10px',
          border: '1px solid rgba(255, 215, 0, 0.3)',
          fontSize: '13px',
          color: '#FFD700',
          textAlign: 'center'
        }}>
          <strong>שים לב:</strong><br/>
          משתמשים חדשים זקוקים לאישור מנהל לפני הכניסה למערכת
        </div>
      </div>
    </div>
  );
}