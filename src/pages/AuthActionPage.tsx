import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import Button from '../app/components/UI/Button';
import Input from '../app/components/UI/Input';
import Notification, { useNotification } from '../app/components/UI/Notification';
import { verifyActionCode, confirmNewPassword, verifyResetCode } from '../app/lib/auth';

function AuthActionContent() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<string | null>(null);
  const [oobCode, setOobCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const { notification, notify } = useNotification();

  useEffect(() => {
    const actionMode = searchParams.get('mode');
    const code = searchParams.get('oobCode');
    
    setMode(actionMode);
    setOobCode(code);

    const handleVerifyEmail = async (verifyCode: string) => {
      try {
        const result = await verifyActionCode(verifyCode);
        if (result.success) {
          notify('האימייל אומת בהצלחה! תוכל להתחבר עכשיו.');
        } else {
          notify(result.error || 'שגיאה באימות', 'error');
        }
      } catch (error) {
        notify('שגיאה באימות האימייל', 'error');
      } finally {
        setLoading(false);
      }
    };

    const handleVerifyResetCode = async (verifyCode: string) => {
      try {
        const result = await verifyResetCode(verifyCode);
        if (result.success) {
          notify('קוד תקין! הזן סיסמה חדשה');
        } else {
          notify(result.error || 'קוד לא תקין', 'error');
        }
      } catch (error) {
        notify('שגיאה בבדיקת הקוד', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (actionMode === 'verifyEmail' && code) {
      handleVerifyEmail(code);
    } else if (actionMode === 'resetPassword' && code) {
      handleVerifyResetCode(code);
    } else {
      setLoading(false);
    }
  }, [searchParams, notify]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!oobCode) {
      notify('קוד לא תקין', 'error');
      return;
    }

    if (password.length < 6) {
      notify('הסיסמה חייבת להכיל לפחות 6 תווים', 'error');
      return;
    }

    if (password !== confirmPass) {
      notify('הסיסמאות אינן תואמות', 'error');
      return;
    }

    setLoading(true);
    try {
      const result = await confirmNewPassword(oobCode, password);
      if (result.success) {
        notify('הסיסמה שונתה בהצלחה!');
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        notify(result.error || 'שגיאה בשינוי הסיסמה', 'error');
      }
    } catch (error) {
      notify('שגיאה בשינוי הסיסמה', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="section">
          <div className="loading">מעבד בקשה...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <Notification notification={notification} />

      <div className="header">
        <div className="logo">TSI</div>
        <div className="subtitle">פלטפורמת השקעות מתקדמת</div>
      </div>

      <div className="section">
        {mode === 'verifyEmail' && (
          <div style={{ textAlign: 'center' }}>
            <h2 className="section-title">אימות אימייל</h2>
            <p style={{ color: '#28a745', fontSize: '18px', marginTop: '20px' }}>
              ✓ האימייל שלך אומת בהצלחה!
            </p>
            <p style={{ marginTop: '15px' }}>
              תוכל להתחבר למערכת לאחר שמנהל יאשר את החשבון שלך.
            </p>
            <Button 
              variant="primary" 
              onClick={() => window.location.href = '/'}
              style={{ marginTop: '30px' }}
            >
              חזרה לדף הראשי
            </Button>
          </div>
        )}

        {mode === 'resetPassword' && (
          <div>
            <h2 className="section-title">איפוס סיסמה</h2>
            <form onSubmit={handleResetPassword} style={{ maxWidth: '400px', margin: '0 auto' }}>
              <Input
                label="סיסמה חדשה"
                type="password"
                value={password}
                onChange={(e: any) => setPassword(e.target.value)}
                placeholder="לפחות 6 תווים"
                required
              />
              
              <Input
                label="אימות סיסמה"
                type="password"
                value={confirmPass}
                onChange={(e: any) => setConfirmPass(e.target.value)}
                placeholder="הזן סיסמה שוב"
                required
              />

              <Button type="submit" size="full" loading={loading} onClick={() => {}}>
                שנה סיסמה
              </Button>
            </form>
          </div>
        )}

        {!mode && (
          <div style={{ textAlign: 'center' }}>
            <h2 className="section-title">בקשה לא תקינה</h2>
            <p>הקישור אינו תקין או שפג תוקפו.</p>
            <Button 
              variant="primary" 
              onClick={() => window.location.href = '/'}
              style={{ marginTop: '30px' }}
            >
              חזרה לדף הראשי
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthActionPage() {
  return (
    <Suspense fallback={
      <div className="container">
        <div className="section">
          <div className="loading">טוען...</div>
        </div>
      </div>
    }>
      <AuthActionContent />
    </Suspense>
  );
}
