// ============================================
// CENTRO DE NOTIFICACIONES
// Componente para mostrar notificaciones en tiempo real
// ============================================

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from '../../store/selectors/authSelectors';
import { selectNotifications, selectNotificationsLoading } from '../../store/selectors/notificationsSelectors';
import { loadNotifications, markAsRead, markAllAsRead } from '../../store/slices/notificationsSlice';
import { useHybridRealtimeContext } from '../HybridRealtimeProvider/HybridRealtimeProvider';
import { formatTimeAgo } from '../../utils/timeUtils';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import CloseIcon from '@mui/icons-material/Close';
import './NotificationsCenter.css';

const NotificationsCenter = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const notifications = useSelector(selectNotifications);
  const loading = useSelector(selectNotificationsLoading);
  const hybridRealtime = useHybridRealtimeContext();
  
  const [filter, setFilter] = useState('all'); // all, unread, read

  // Cargar notificaciones iniciales
  useEffect(() => {
    if (user?.id && isOpen) {
      dispatch(loadNotifications({ userId: user.id, limit: 50 }));
    }
  }, [dispatch, user?.id, isOpen]);

  // Escuchar actualizaciones híbridas de notificaciones
  useEffect(() => {
    const handleHybridNotificationsUpdate = (event) => {
      console.log('🔔 Notificaciones actualizadas desde sistema híbrido:', event.detail);
      
      // Recargar notificaciones cuando hay actualizaciones híbridas
      if (user?.id && isOpen) {
        dispatch(loadNotifications({ userId: user.id, limit: 50 }));
      }
    };

    // Escuchar eventos del sistema híbrido
    window.addEventListener('hybridNotificationsUpdate', handleHybridNotificationsUpdate);
    
    return () => {
      window.removeEventListener('hybridNotificationsUpdate', handleHybridNotificationsUpdate);
    };
  }, [dispatch, user?.id, isOpen]);

  // Filtrar notificaciones
  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'read':
        return notification.read;
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (notificationId) => {
    await dispatch(markAsRead({ notificationId, userId: user.id }));
  };

  const handleMarkAllAsRead = async () => {
    await dispatch(markAllAsRead({ userId: user.id }));
  };

  const getNotificationIcon = (type) => {
    const icons = {
      message: '💬',
      like: '❤️',
      comment: '💭',
      friend_request: '👥',
      emergency: '🚨',
      event: '📅',
      system: '⚙️',
      default: '🔔'
    };
    return icons[type] || icons.default;
  };

  const getNotificationColor = (type) => {
    const colors = {
      message: '#3b82f6',
      like: '#ef4444',
      comment: '#8b5cf6',
      friend_request: '#10b981',
      emergency: '#dc2626',
      event: '#f59e0b',
      system: '#6b7280',
      default: '#6b7280'
    };
    return colors[type] || colors.default;
  };

  if (!isOpen) return null;

  return (
    <div className="notifications-center">
      <div className="notifications-overlay" onClick={onClose} />
      <div className="notifications-panel">
        <div className="notifications-header">
          <div className="header-left">
            <h3>Notificaciones</h3>
            {hybridRealtime.isConnected && (
              <div className="realtime-indicator">
                <span className="realtime-dot"></span>
                Tiempo real
              </div>
            )}
          </div>
          <div className="header-actions">
            {unreadCount > 0 && (
              <button 
                className="mark-all-read-btn"
                onClick={handleMarkAllAsRead}
                title="Marcar todas como leídas"
              >
                <MarkEmailReadIcon />
              </button>
            )}
            <button className="close-btn" onClick={onClose}>
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className="notifications-filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Todas ({notifications.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            No leídas ({unreadCount})
          </button>
          <button 
            className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
            onClick={() => setFilter('read')}
          >
            Leídas ({notifications.length - unreadCount})
          </button>
        </div>

        <div className="notifications-list">
          {loading ? (
            <div className="notifications-loading">
              <div className="loading-spinner"></div>
              <p>Cargando notificaciones...</p>
            </div>
          ) : filteredNotifications.length > 0 ? (
            filteredNotifications.map(notification => (
              <div 
                key={notification.id} 
                className={`notification-item ${!notification.read ? 'unread' : ''}`}
                onClick={() => !notification.read && handleMarkAsRead(notification.id)}
              >
                <div className="notification-icon" style={{ color: getNotificationColor(notification.type) }}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="notification-content">
                  <div className="notification-title">
                    {notification.title}
                  </div>
                  <div className="notification-message">
                    {notification.message}
                  </div>
                  <div className="notification-time">
                    {formatTimeAgo(notification.created_at)}
                  </div>
                </div>
                {!notification.read && (
                  <div className="unread-indicator"></div>
                )}
              </div>
            ))
          ) : (
            <div className="no-notifications">
              <NotificationsIcon className="no-notifications-icon" />
              <h4>No hay notificaciones</h4>
              <p>
                {filter === 'unread' 
                  ? 'No tienes notificaciones sin leer'
                  : filter === 'read'
                  ? 'No tienes notificaciones leídas'
                  : 'Aquí aparecerán tus notificaciones'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsCenter;