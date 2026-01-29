import { useState } from 'react';
import { useCallback } from 'react';

export function useNotification() {
  const [notification, setNotification] = useState(null);

  const notify = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  }, []);

  return { notification, notify };
}

export default function Notification({ notification }) {
  if (!notification) return null;

  const bgColor = notification.type === 'error' ? '#dc3545' : 
                  notification.type === 'warning' ? '#ffc107' : '#28a745';

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: bgColor,
      color: 'white',
      padding: '15px 25px',
      borderRadius: '10px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
      zIndex: 9999,
      animation: 'slideIn 0.3s ease',
      maxWidth: '400px',
      fontSize: '15px',
      fontWeight: '600'
    }}>
      {notification.message}
      
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}