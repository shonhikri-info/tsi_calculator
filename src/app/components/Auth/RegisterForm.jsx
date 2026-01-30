import { useState } from 'react';
import Input from '../UI/Input';
import Button from '../UI/Button';
import { registerUser } from '../../lib/auth';

export default function RegisterForm({ onSwitchToLogin, notify }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^(\+?972|0)([5-9]\d{8})$/;
    const cleanPhone = phone.replace(/[\s-]/g, '');
    return phoneRegex.test(cleanPhone);
  };

  const normalizePhoneNumber = (phone) => {
    let cleanPhone = phone.replace(/[\s-]/g, '');
    if (cleanPhone.startsWith('+972')) {
      cleanPhone = '0' + cleanPhone.substring(4);
    } else if (cleanPhone.startsWith('972')) {
      cleanPhone = '0' + cleanPhone.substring(3);
    }
    return cleanPhone;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      notify('נא למלא את כל השדות החובה', 'error');
      setLoading(false);
      return;
    }

    if (!validatePhoneNumber(formData.phone)) {
      notify('מספר טלפון לא תקין. השתמש בפורמט: 050-1234567', 'error');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      notify('הסיסמה חייבת להכיל לפחות 6 תווים', 'error');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      notify('הסיסמאות אינן תואמות', 'error');
      setLoading(false);
      return;
    }

    try {
      const result = await registerUser(formData.email, formData.password, {
        name: formData.name.trim(),
        phone: normalizePhoneNumber(formData.phone)
      });

      if (result.success) {
        notify('נרשמת בהצלחה! בדוק את האימייל שלך לאימות. לאחר מכן המתן לאישור מנהל.');
        
        setFormData({
          name: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: ''
        });

        setTimeout(() => {
          onSwitchToLogin();
        }, 3000);
      } else {
        notify(result.error, 'error');
      }
    } catch (error) {
      notify('שגיאה בהרשמה', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section">
      <h2 className="section-title">הרשמה חדשה</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <Input
            label="שם מלא"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="הכנס שם מלא"
            required
          />
          
          <Input
            label="אימייל"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="example@email.com"
            required
          />
          
          <Input
            label="מספר טלפון"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="050-1234567"
            required
          />
          
          <Input
            label="סיסמה"
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            placeholder="לפחות 6 תווים"
            required
          />
          
          <Input
            label="אישור סיסמה"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            placeholder="הכנס סיסמה שוב"
            required
          />
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <Button type="submit" loading={loading} style={{ marginLeft: '10px' }}>
            הירשם
          </Button>
          <Button 
            type="button" 
            variant="secondary" 
            onClick={onSwitchToLogin}
          >
            חזרה לכניסה
          </Button>
        </div>
        
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          background: 'rgba(255, 215, 0, 0.1)', 
          borderRadius: '10px',
          border: '1px solid rgba(255, 215, 0, 0.3)',
          fontSize: '14px',
          color: '#FFD700'
        }}>
          <strong>הרישות הרשמה:</strong><br/>
          • שם מלא ומספר טלפון ישראלי חובה<br/>
          • סיסמה חזקה (לפחות 6 תווים)<br/>
          • אישור אימייל ואישור מנהל נדרשים לפני כניסה למערכת
        </div>
      </form>
    </div>
  );
}