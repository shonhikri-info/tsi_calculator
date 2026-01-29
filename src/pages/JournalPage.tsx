import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TradingJournal from '../app/components/Trading/TradingJournal.jsx';
import Notification, { useNotification } from '../app/components/UI/Notification.jsx';

export default function JournalPage() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const { notification, notify } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = sessionStorage.getItem('tsi_current_user');
    const userType = sessionStorage.getItem('tsi_user_type');
    
    if (!savedUser || (userType !== 'user' && userType !== 'admin')) {
      navigate('/');
      return;
    }
    
    setCurrentUser(savedUser);
  }, [navigate]);

  if (!currentUser) {
    return null;
  }

  return (
    <>
      <Notification notification={notification} />
      
      <div className="section">
        <h2 className="section-title">יומן המסחר</h2>
        
        <TradingJournal 
          userId={currentUser}
          onStatsUpdate={() => {}}
        />
      </div>
    </>
  );
}
