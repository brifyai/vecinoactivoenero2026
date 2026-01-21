import React from 'react';
import { useNotifications } from '../../context/NotificationsContext';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import './NotificationsCenter.css';

const NotificationsCenter = ({ isOpen, onClose }) => {
  const { notifications, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotifications();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
      onClose();
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return 'Hace un momento';
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} h`;
    if (seconds < 604800) return `Hace ${Math.floor(seconds / 86400)} días`;
    return new Date(date).toLocaleDateString('es-CL');
  };

  return (
    <>
      <div className="notifications-overlay" onClick={onClose} />
      <div className="notifications-center">
        <div className="notifications-header">
          <h3>Notificaciones</h3>
          <div className="notifications-actions">
            {notifications.length > 0 && (
              <>
                <button
                  className="action-btn"
                  onClick={markAllAsRead}
                  title="Marcar todas como leídas"
                >
                  <DoneAllIcon fontSize="small" />
                </button>
                <button
                  className="action-btn"
                  onClick={clearAll}
                  title="Limpiar todas"
                >
                  <DeleteIcon fontSize="small" />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="notifications-list">
          {notifications.length === 0 ? (
            <div className="notifications-empty">
              <span className="empty-icon">🔔</span>
              <p>No tienes notificaciones</p>
            </div>
          ) : (
            notifications.map(notification => (
              <div
                key={notification.id}
                className={`notification-item ${!notification.read ? 'unread' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="notification-icon">{notification.icon}</div>
                <div className="notification-content">
                  <div className="notification-title">{notification.title}</div>
                  <div className="notification-message">{notification.message}</div>
                  <div className="notification-time">{getTimeAgo(notification.createdAt)}</div>
                </div>
                <button
                  className="notification-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification.id);
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationsCenter;
