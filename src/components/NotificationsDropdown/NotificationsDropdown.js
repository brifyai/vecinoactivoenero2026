import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from '../../store/selectors/authSelectors';
import { selectNotifications, selectNotificationsLoading } from '../../store/selectors/notificationsSelectors';
import { loadNotifications, markAsRead, markAllAsRead } from '../../store/slices/notificationsSlice';
import { useHybridRealtimeContext } from '../HybridRealtimeProvider/HybridRealtimeProvider';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import CheckIcon from '@mui/icons-material/Check';
import NotificationsCenter from '../NotificationsCenter/NotificationsCenter';
import './NotificationsDropdown.css';

const NotificationsDropdown = ({ onClose }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const notifications = useSelector(selectNotifications);
  const loading = useSelector(selectNotificationsLoading);
  const hybridRealtime = useHybridRealtimeContext();
  
  const [showFullCenter, setShowFullCenter] = useState(false);

  // Cargar notificaciones iniciales (solo las más recientes para el dropdown)
  useEffect(() => {
    if (user?.id) {
      dispatch(loadNotifications({ userId: user.id, limit: 5 }));
    }
  }, [dispatch, user?.id]);

  // Escuchar actualizaciones híbridas de notificaciones
  useEffect(() => {
    const handleHybridNotificationsUpdate = (event) => {
      console.log('🔔 Notificaciones actualizadas desde sistema híbrido:', event.detail);
      
      // Recargar notificaciones cuando hay actualizaciones híbridas
      if (user?.id) {
        dispatch(loadNotifications({ userId: user.id, limit: 5 }));
      }
    };

    // Escuchar eventos del sistema híbrido
    window.addEventListener('hybridNotificationsUpdate', handleHybridNotificationsUpdate);
    
    return () => {
      window.removeEventListener('hybridNotificationsUpdate', handleHybridNotificationsUpdate);
    };
  }, [dispatch, user?.id]);

  const handleMarkAsRead = async (notificationId) => {
    await dispatch(markAsRead({ notificationId, userId: user.id }));
  };

  const handleMarkAllAsRead = async () => {
    await dispatch(markAllAsRead({ userId: user.id }));
  };

  const handleSeeAll = () => {
    setShowFullCenter(true);
    onClose();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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
    <>
      <div className="notifications-dropdown">
        <div className="dropdown-header">
          <div className="header-left">
            <h3>Notificaciones</h3>
            {hybridRealtime.isConnected && (
              <div className="realtime-badge">
                <span className="realtime-dot"></span>
              </div>
            )}
          </div>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllAsRead} className="mark-all-btn">
              <CheckIcon fontSize="small" /> Marcar todas como leídas
            </button>
          )}
        </div>
        
        <div className="notifications-list">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Cargando...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">🔔</span>
              <p>No hay notificaciones aún</p>
            </div>
          ) : (
            notifications.map(notif => (
              <div 
                key={notif.id} 
                className={`notification-item ${!notif.read ? 'unread' : ''}`}
                onClick={() => handleMarkAsRead(notif.id)}
              >
                <div className="notif-avatar">
                  <div className="avatar-placeholder">
                    {getNotificationIcon(notif.type)}
                  </div>
                </div>
                <div className="notif-content">
                  <p>
                    <strong>{notif.title}</strong>
                  </p>
                  <span className="notif-message">{notif.message}</span>
                  <span className="notif-time">
                    {formatDistanceToNow(new Date(notif.created_at), { 
                      addSuffix: true, 
                      locale: es 
                    })}
                  </span>
                </div>
                {!notif.read && <span className="unread-dot"></span>}
              </div>
            ))
          )}
        </div>
        
        <div className="dropdown-footer">
          <button className="see-all-btn" onClick={handleSeeAll}>
            Ver Todas las Notificaciones
          </button>
        </div>
      </div>

      <NotificationsCenter 
        isOpen={showFullCenter}
        onClose={() => setShowFullCenter(false)}
      />
    </>
  );
};

export default NotificationsDropdown;
