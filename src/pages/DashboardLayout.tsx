import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Notification, { useNotification } from '../app/components/UI/Notification';

export default function DashboardLayout() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [portfolioStats, setPortfolioStats] = useState({
    totalValue: 0,
    stockCount: 0,
    totalPnL: 0,
    avgChange: 0
  });
  
  const { notification, notify } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const savedUser = sessionStorage.getItem('tsi_current_user');
    const userType = sessionStorage.getItem('tsi_user_type');
    const storedUserData = sessionStorage.getItem('tsi_user_data');
    
    if (!savedUser || (userType !== 'user' && userType !== 'admin')) {
      navigate('/');
      return;
    }
    
    setCurrentUser(savedUser);
    setIsAdmin(userType === 'admin');
    
    try {
      if (storedUserData) {
        const parsedUserData = JSON.parse(storedUserData);
        setUserData(parsedUserData);
      }
    } catch (_) {}
    
    loadPortfolioStats(savedUser);
  }, [navigate]);

  const loadPortfolioStats = async (userId: string) => {
    try {
      const { getUserPortfolio } = await import('../app/lib/firestore');
      const { calculatePortfolioStats } = await import('../app/lib/calculations');
      
      const portfolio = await getUserPortfolio(userId);
      const stats = calculatePortfolioStats(portfolio);
      setPortfolioStats(stats);
    } catch (_) {}
  };

  const handleLogout = async () => {
    const { logoutUser } = await import('../app/lib/auth');
    await logoutUser();
    sessionStorage.clear();
    navigate('/');
    notify('יציאת מהמערכת');
  };

  const isActive = (path: string) => {
    if (path === '/dashboard' && location.pathname === '/dashboard') return true;
    if (path !== '/dashboard' && location.pathname.startsWith(path)) return true;
    return false;
  };

  if (!currentUser) {
    return <div className="container">טוען...</div>;
  }

  return (
    <div className="container">
      <Notification notification={notification} />

      <div className="header">
        <div className="nav-buttons">
          <button className="nav-btn" onClick={handleLogout}>
            יציאה
          </button>
        </div>
        
        <div className="logo">TSI</div>
        <div className="subtitle">פלטפורמת השקעות מתקדמת</div>
      </div>

      <div className="modern-navigation">
        <button 
          className={`nav-tab ${isActive('/dashboard') ? 'active' : ''}`}
          onClick={() => navigate('/dashboard')}
        >
          <span className="nav-text">בית</span>
        </button>
        
        <button 
          className={`nav-tab ${isActive('/dashboard/calculator') ? 'active' : ''}`}
          onClick={() => navigate('/dashboard/calculator')}
        >
          <span className="nav-text">מחשבון</span>
        </button>
        
        <button 
          className={`nav-tab ${isActive('/dashboard/journal') ? 'active' : ''}`}
          onClick={() => navigate('/dashboard/journal')}
        >
          <span className="nav-text">יומן מסחר</span>
        </button>
      </div>

      {isAdmin && (
        <button
          onClick={() => navigate('/admin')}
          style={{
            position: 'fixed',
            bottom: '70px',
            left: '15px',
            background: 'rgba(102, 126, 234, 0.9)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            fontSize: '22px',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            zIndex: 1000,
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.background = 'rgba(102, 126, 234, 1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.background = 'rgba(102, 126, 234, 0.9)';
          }}
          title="עבור לפאנל מנהל"
        >
          🔧
        </button>
      )}

      <Outlet />
    </div>
  );
}
