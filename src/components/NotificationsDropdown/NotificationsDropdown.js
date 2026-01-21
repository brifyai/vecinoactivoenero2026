import { useApp } from '../../context/AppContext';
import CheckIcon from '@mui/icons-material/Check';
import './NotificationsDropdown.css';

const NotificationsDropdown = ({ onClose }) => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useApp();

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'like': return '❤️';
      case 'comment': return '💬';
      case 'friend': return '👥';
      case 'share': return '🔗';
      default: return '🔔';
    }
  };

  return (
    <div className="notifications-dropdown">
      <div className="dropdown-header">
        <h3>Notificaciones</h3>
        <button onClick={markAllNotificationsAsRead} className="mark-all-btn">
          <CheckIcon fontSize="small" /> Marcar todas como leídas
        </button>
      </div>
      
      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🔔</span>
            <p>No hay notificaciones aún</p>
          </div>
        ) : (
          notifications.map(notif => (
            <div 
              key={notif.id} 
              className={`notification-item ${!notif.read ? 'unread' : ''}`}
              onClick={() => markNotificationAsRead(notif.id)}
            >
              <div className="notif-avatar">
                <img src={notif.avatar} alt={notif.user} />
                <span className="notif-type-icon">{getNotificationIcon(notif.type)}</span>
              </div>
              <div className="notif-content">
                <p>
                  <strong>{notif.user}</strong> {notif.message}
                </p>
                <span className="notif-time">{notif.time}</span>
              </div>
              {!notif.read && <span className="unread-dot"></span>}
            </div>
          ))
        )}
      </div>
      
      <div className="dropdown-footer">
        <button className="see-all-btn" onClick={() => alert('¡Función de ver todas las notificaciones próximamente!')}>
          Ver Todas las Notificaciones
        </button>
      </div>
    </div>
  );
};

export default NotificationsDropdown;
