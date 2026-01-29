import { useState, useEffect } from 'react';
import Button from '../UI/Button';
import { getAllUsers, updateUserStatus, deleteUser, USER_STATUS } from '../../lib/firestore';
import Notification, { useNotification } from '../UI/Notification';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { notification, notify } = useNotification();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    today: 0
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const usersData = await getAllUsers();
      setUsers(usersData);
      calculateStats(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      notify('שגיאה בטעינת נתוני המשתמשים', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (usersData) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = {
      total: usersData.length,
      pending: 0,
      approved: 0,
      today: 0
    };

    usersData.forEach(user => {
      if (user.status === USER_STATUS.PENDING) stats.pending++;
      if (user.status === USER_STATUS.APPROVED) stats.approved++;

      if (user.createdAt && user.createdAt.toDate) {
        const userDate = user.createdAt.toDate();
        userDate.setHours(0, 0, 0, 0);
        if (userDate.getTime() === today.getTime()) {
          stats.today++;
        }
      }
    });

    setStats(stats);
  };

  const handleStatusChange = async (username, newStatus) => {
    const success = await updateUserStatus(username, newStatus);
    if (success) {
      setUsers(prev => prev.map(user => 
        user.id === username ? { ...user, status: newStatus } : user
      ));
      calculateStats(users.map(user => 
        user.id === username ? { ...user, status: newStatus } : user
      ));
      
      const statusTexts = {
        [USER_STATUS.APPROVED]: 'אושר',
        [USER_STATUS.REJECTED]: 'נדחה',
        [USER_STATUS.BLOCKED]: 'נחסם'
      };
      notify(`המשתמש ${username} ${statusTexts[newStatus]}`);
    } else {
      notify('שגיאה בעדכון סטטוס המשתמש', 'error');
    }
  };

  const handleDeleteUser = async (username) => {
    if (confirm('האם אתה בטוח שברצונך למחוק את המשתמש?')) {
      const success = await deleteUser(username);
      if (success) {
        setUsers(prev => prev.filter(user => user.id !== username));
        calculateStats(users.filter(user => user.id !== username));
        notify(`המשתמש ${username} נמחק`, 'error');
      } else {
        notify('שגיאה במחיקת המשתמש', 'error');
      }
    }
  };

  const getStatusText = (status) => {
    const statusTexts = {
      [USER_STATUS.PENDING]: 'ממתין',
      [USER_STATUS.APPROVED]: 'מאושר',
      [USER_STATUS.REJECTED]: 'נדחה',
      [USER_STATUS.BLOCKED]: 'חסום'
    };
    return statusTexts[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      [USER_STATUS.PENDING]: '#ffc107',
      [USER_STATUS.APPROVED]: '#28a745',
      [USER_STATUS.REJECTED]: '#dc3545',
      [USER_STATUS.BLOCKED]: '#6c757d'
    };
    return colors[status] || '#6c757d';
  };

  const formatDate = (createdAt) => {
    if (!createdAt || !createdAt.toDate) return 'לא זמין';
    return createdAt.toDate().toLocaleDateString('he-IL');
  };

  const formatPhone = (phone) => {
    if (!phone) return '-';
    if (phone.length === 10 && phone.startsWith('0')) {
      return `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`;
    }
    return phone;
  };

  return (
    <div>
      <Notification notification={notification} />
      
      <div className="stats-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '30px'
      }}>
        <div className="stat-card" style={{
          background: 'linear-gradient(45deg, #667eea, #764ba2)',
          padding: '25px',
          borderRadius: '15px',
          textAlign: 'center',
          color: 'white',
          boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
        }}>
          <div className="stat-number" style={{ fontSize: '2.5em', fontWeight: '900', marginBottom: '8px' }}>
            {stats.total}
          </div>
          <div className="stat-label" style={{ fontSize: '14px', fontWeight: '600', opacity: 0.9 }}>
            סה&quot;כ משתמשים
          </div>
        </div>
        <div className="stat-card" style={{
          background: 'linear-gradient(45deg, #ffc107, #e0a800)',
          padding: '25px',
          borderRadius: '15px',
          textAlign: 'center',
          color: 'white',
          boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
        }}>
          <div className="stat-number" style={{ fontSize: '2.5em', fontWeight: '900', marginBottom: '8px' }}>
            {stats.pending}
          </div>
          <div className="stat-label" style={{ fontSize: '14px', fontWeight: '600', opacity: 0.9 }}>
            ממתינים
          </div>
        </div>
        <div className="stat-card" style={{
          background: 'linear-gradient(45deg, #28a745, #20c997)',
          padding: '25px',
          borderRadius: '15px',
          textAlign: 'center',
          color: 'white',
          boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
        }}>
          <div className="stat-number" style={{ fontSize: '2.5em', fontWeight: '900', marginBottom: '8px' }}>
            {stats.approved}
          </div>
          <div className="stat-label" style={{ fontSize: '14px', fontWeight: '600', opacity: 0.9 }}>
            מאושרים
          </div>
        </div>
        <div className="stat-card" style={{
          background: 'linear-gradient(45deg, #dc3545, #c82333)',
          padding: '25px',
          borderRadius: '15px',
          textAlign: 'center',
          color: 'white',
          boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
        }}>
          <div className="stat-number" style={{ fontSize: '2.5em', fontWeight: '900', marginBottom: '8px' }}>
            {stats.today}
          </div>
          <div className="stat-label" style={{ fontSize: '14px', fontWeight: '600', opacity: 0.9 }}>
            היום
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <Button onClick={loadUsers} loading={loading}>
          רענון
        </Button>
      </div>

      <div className="beautiful-table-container" style={{
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch'
      }}>
        <table className="beautiful-table" style={{ minWidth: '100%' }}>
          <thead>
            <tr>
              <th style={{ minWidth: '100px' }}>שם</th>
              <th style={{ minWidth: '80px' }}>משתמש</th>
              <th style={{ minWidth: '150px' }}>אימייל</th>
              <th style={{ minWidth: '100px' }}>טלפון</th>
              <th style={{ minWidth: '80px' }}>סטטוס</th>
              <th style={{ minWidth: '80px' }}>תאריך</th>
              <th style={{ minWidth: '200px' }}>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                  <div className="loading">טוען נתוני משתמשים...</div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{ color: '#ccc' }}>אין משתמשים רשומים</div>
                </td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user.id}>
                  <td style={{ fontWeight: '700', fontSize: '13px' }}>{user.name}</td>
                  <td>
                    <span className="symbol-badge" style={{ fontSize: '11px', padding: '3px 6px' }}>
                      {user.username || user.id}
                    </span>
                  </td>
                  <td style={{ 
                    fontSize: '12px',
                    color: '#666',
                    wordBreak: 'break-all',
                    maxWidth: '150px'
                  }}>
                    {user.email}
                  </td>
                  <td style={{ 
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    fontWeight: '600'
                  }}>
                    {formatPhone(user.phone)}
                  </td>
                  <td>
                    <span 
                      className="trade-badge" 
                      style={{ 
                        backgroundColor: `${getStatusColor(user.status)}20`,
                        color: getStatusColor(user.status),
                        border: `1px solid ${getStatusColor(user.status)}50`,
                        fontSize: '11px',
                        padding: '3px 6px'
                      }}
                    >
                      {getStatusText(user.status)}
                    </span>
                  </td>
                  <td style={{ fontSize: '12px', color: '#666' }}>
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="actions-cell">
                    <div style={{ 
                      display: 'flex', 
                      gap: '4px', 
                      flexWrap: 'wrap',
                      justifyContent: 'center'
                    }}>
                      {user.status === USER_STATUS.PENDING && (
                        <>
                          <Button 
                            variant="success" 
                            size="small" 
                            onClick={() => handleStatusChange(user.id, USER_STATUS.APPROVED)}
                          >
                            אשר
                          </Button>
                          <Button 
                            variant="danger" 
                            size="small" 
                            onClick={() => handleStatusChange(user.id, USER_STATUS.REJECTED)}
                          >
                            דחה
                          </Button>
                        </>
                      )}
                      {user.status === USER_STATUS.APPROVED && (
                        <Button 
                          variant="warning" 
                          size="small" 
                          onClick={() => handleStatusChange(user.id, USER_STATUS.BLOCKED)}
                        >
                          חסום
                        </Button>
                      )}
                      {user.status === USER_STATUS.BLOCKED && (
                        <Button 
                          variant="success" 
                          size="small" 
                          onClick={() => handleStatusChange(user.id, USER_STATUS.APPROVED)}
                        >
                          בטל חסימה
                        </Button>
                      )}
                      <Button 
                        variant="danger" 
                        size="small" 
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        מחק
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
        <strong>הוראות לניהול משתמשים:</strong><br/>
        • <strong>אשר:</strong> אפשר למשתמש להיכנס למערכת<br/>
        • <strong>דחה:</strong> סירוב כניסה למערכת<br/>
        • <strong>חסום:</strong> חסימת משתמש מאושר<br/>
        • <strong>מחק:</strong> מחיקת המשתמש לחלוטין מהמערכת
      </div>
    </div>
  );
}