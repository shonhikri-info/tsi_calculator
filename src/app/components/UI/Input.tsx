import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps {
  label?: string;
  type?: string;
  value: any;
  onChange: (e: any) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  autoCalc?: boolean;
  step?: any;
  min?: any;
  max?: any;
  inputMode?: any;
  [key: string]: any;
}

export default function Input({ 
  label, 
  type = "text", 
  value, 
  onChange, 
  placeholder = "", 
  required = false,
  disabled = false,
  className = "",
  autoCalc = false,
  step,
  min,
  max,
  inputMode,
  ...rest 
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === "password";
  const inputType = isPasswordField && showPassword ? "text" : type;

  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <div style={{ position: 'relative' }}>
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`form-input ${autoCalc ? 'auto-calc' : ''} ${className}`}
          style={isPasswordField ? { paddingLeft: '45px' } : {}}
          {...(step !== undefined && { step })}
          {...(min !== undefined && { min })}
          {...(max !== undefined && { max })}
          {...(inputMode && { inputMode })}
          {...rest}
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#333333',
              transition: 'color 0.2s',
              zIndex: 10
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#000000'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#333333'}
            aria-label={showPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
}
