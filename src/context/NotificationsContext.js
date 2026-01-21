import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const NotificationsContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationsProvider');
  }
  return context;
};

export const NotificationsProvider = ({ children }) => {
  const auth = useAuth();
  const user = auth?.user || null;
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    const count = notifications.filter(n => !n.read && n.userId === user?.id).length;
    setUnreadCount(count);
  }, [notifications, user]);

  const loadNotifications = () => {
    if (!user) return;
    
    const stored = localStorage.getItem('notifications');
    if (stored) {
      const all = JSON.parse(stored);
      const userNotifications = all.filter(n => n.userId === user.id);
      setNotifications(userNotifications);
    }
  };

  const saveNotifications = (newNotifications) => {
    if (!user) return;
    
    const stored = localStorage.getItem('notifications');
    const all = stored ? JSON.parse(stored) : [];
    const others = all.filter(n => n.userId !== user.id);
    const updated = [...others, ...newNotifications];
    localStorage.setItem('notifications', JSON.stringify(updated));
    setNotifications(newNotifications);
  };

  // Crear notificación
  const createNotification = (data) => {
    const notification = {
      id: Date.now().toString() + Math.random(),
      userId: data.userId,
      type: data.type, // like, comment, friend_request, verification, event, poll, etc.
      title: data.title,
      message: data.message,
      icon: data.icon || '🔔',
      link: data.link || null,
      read: false,
      createdAt: new Date().toISOString(),
      data: data.extraData || {}
    };

    const updated = [notification, ...notifications];
    saveNotifications(updated);
    return notification;
  };

  // Marcar como leída
  const markAsRead = (notificationId) => {
    const updated = notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    saveNotifications(updated);
  };

  // Marcar todas como leídas
  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    saveNotifications(updated);
  };

  // Eliminar notificación
  const deleteNotification = (notificationId) => {
    const updated = notifications.filter(n => n.id !== notificationId);
    saveNotifications(updated);
  };

  // Limpiar todas
  const clearAll = () => {
    saveNotifications([]);
  };

  // Obtener notificaciones no leídas
  const getUnreadNotifications = () => {
    return notifications.filter(n => !n.read);
  };

  // Helpers para crear notificaciones específicas
  const notifyLike = (userId, postId, likerName) => {
    return createNotification({
      userId: userId,
      type: 'like',
      title: 'Nueva reacción',
      message: `A ${likerName} le gustó tu publicación`,
      icon: '❤️',
      link: `/post/${postId}`
    });
  };

  const notifyComment = (userId, postId, commenterName) => {
    return createNotification({
      userId: userId,
      type: 'comment',
      title: 'Nuevo comentario',
      message: `${commenterName} comentó en tu publicación`,
      icon: '💬',
      link: `/post/${postId}`
    });
  };

  const notifyFriendRequest = (userId, requesterId, requesterName) => {
    return createNotification({
      userId: userId,
      type: 'friend_request',
      title: 'Solicitud de amistad',
      message: `${requesterName} te envió una solicitud de amistad`,
      icon: '👥',
      link: `/friends`
    });
  };

  const notifyVerificationApproved = (userId) => {
    return createNotification({
      userId: userId,
      type: 'verification',
      title: '¡Verificación aprobada!',
      message: 'Tu solicitud de verificación fue aprobada. Ahora eres un vecino verificado.',
      icon: '✅',
      link: `/profile`
    });
  };

  const notifyVerificationRejected = (userId, reason) => {
    return createNotification({
      userId: userId,
      type: 'verification',
      title: 'Verificación rechazada',
      message: `Tu solicitud fue rechazada. ${reason}`,
      icon: '❌',
      link: `/profile`
    });
  };

  const notifyNewEvent = (userId, eventName, neighborhoodName) => {
    return createNotification({
      userId: userId,
      type: 'event',
      title: 'Nuevo evento en tu vecindario',
      message: `${eventName} en ${neighborhoodName}`,
      icon: '📅',
      link: `/events`
    });
  };

  const notifyNewPoll = (userId, pollTitle, neighborhoodName) => {
    return createNotification({
      userId: userId,
      type: 'poll',
      title: 'Nueva votación',
      message: `${pollTitle} en ${neighborhoodName}`,
      icon: '🗳️',
      link: `/polls`
    });
  };

  // Agregar notificación (método genérico usado por otros contextos)
  const addNotification = (userId, notificationData) => {
    if (!userId) return;
    
    const notification = {
      id: Date.now().toString() + Math.random(),
      userId: userId,
      type: notificationData.type,
      from: notificationData.from || null,
      fromName: notificationData.fromName || '',
      fromAvatar: notificationData.fromAvatar || '',
      message: notificationData.message,
      postId: notificationData.postId || null,
      projectId: notificationData.projectId || null,
      eventId: notificationData.eventId || null,
      resourceId: notificationData.resourceId || null,
      reservationId: notificationData.reservationId || null,
      read: notificationData.read || false,
      createdAt: new Date().toISOString()
    };

    // Cargar todas las notificaciones
    const stored = localStorage.getItem('notifications');
    const all = stored ? JSON.parse(stored) : [];
    
    // Agregar la nueva notificación
    const updated = [notification, ...all];
    localStorage.setItem('notifications', JSON.stringify(updated));
    
    // Si es para el usuario actual, actualizar el estado
    if (user && userId === user.id) {
      setNotifications([notification, ...notifications]);
    }
    
    return notification;
  };

  const value = {
    notifications,
    unreadCount,
    createNotification,
    addNotification, // Agregar este método
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    getUnreadNotifications,
    // Helpers
    notifyLike,
    notifyComment,
    notifyFriendRequest,
    notifyVerificationApproved,
    notifyVerificationRejected,
    notifyNewEvent,
    notifyNewPoll
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};
