import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../UI/Input';
import Button from '../UI/Button';
import { loginUser } from '../../lib/auth';

export default function AdminLogin({ onBackToMain, notify }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await loginUser(email, password);
      
      if (result.success) {
        if (result.userType !== 'admin') {
          notify('גישה נדחתה - משתמש זה אינו מנהל', 'error');
          setLoading(false);
          return;
        }

        sessionStorage.setItem('tsi_current_user', result.userId);
        sessionStorage.setItem('tsi_user_type', result.userType);
        sessionStorage.setItem('tsi_user_data', JSON.stringify(result.userData));
        
        notify('התחברת כמנהל!');
        
        setTimeout(() => {
          navigate('/admin');
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

  return (
    <div className="section">
      <h2 className="section-title">כניסת מנהל</h2>
      
      <div style={{
        background: 'rgba(255, 68, 68, 0.1)',
        border: '2px solid #ff4444',
        borderRadius: '10px',
        padding: '15px',
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        <strong style={{ color: '#ff4444' }}>⚠️ אזור מוגבל למנהלי מערכת בלבד</strong>
      </div>
      
      <div style={{ maxWidth: '400px', margin: '0 auto' }}>
        <form onSubmit={handleAdminLogin}>
          <Input
            label="אימייל מנהל"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="הכנס אימייל מנהל"
            required
          />
          
          <Input
            label="סיסמת מנהל"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="הכנס סיסמת מנהל"
            required
          />
          
          <Button type="submit" size="full" loading={loading}>
            התחבר כמנהל
          </Button>
        </form>
        
        <div style={{ 
          textAlign: 'center', 
          marginTop: '25px',
          padding: '20px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '15px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <Button 
            variant="secondary" 
            size="full"
            onClick={onBackToMain}
          >
            חזרה לעמוד הראשי
          </Button>
        </div>
        
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          background: 'rgba(220, 53, 69, 0.1)', 
          borderRadius: '10px',
          border: '1px solid rgba(220, 53, 69, 0.3)',
          fontSize: '13px',
          color: '#ff6b6b',
          textAlign: 'center'
        }}>
          <strong>אזור מוגבל:</strong><br/>
          גישה למנהלי מערכת בלבד. יש צורך בחשבון מנהל מאושר.
        </div>
      </div>
    </div>
  );
}