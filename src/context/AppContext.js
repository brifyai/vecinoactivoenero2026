import { createContext, useContext, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/selectors/authSelectors';
import storageService from '../services/storageService';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const user = useSelector(selectUser);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('friendbook_darkMode');
    return saved === 'true';
  });
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([
    { id: 1, user: 'Josephin Water', message: 'Hey! Como estas?', time: 'hace 2 min', unread: true, avatar: 'https://i.pravatar.cc/40?img=8', online: true, location: 'Chamisero, Colina' },
    { id: 2, user: 'Carlos Mendoza', message: 'Nos vemos mañana!', time: 'hace 1 hora', unread: true, avatar: 'https://i.pravatar.cc/40?img=11', online: true, location: 'Chamisero, Colina' },
    { id: 3, user: 'Maria Elena Rodriguez', message: 'Gracias por la ayuda', time: 'hace 3 horas', unread: false, avatar: 'https://i.pravatar.cc/40?img=5', online: false, location: 'Chamisero, Colina' },
    { id: 4, user: 'Roberto Carlos Gomez', message: 'Excelente publicacion!', time: 'hace 5 horas', unread: false, avatar: 'https://i.pravatar.cc/40?img=13', online: false, location: 'Chicureo, Colina' },
    { id: 5, user: 'Ana Maria Fernandez', message: 'Pongamonos al dia pronto', time: 'hace 1 dia', unread: false, avatar: 'https://i.pravatar.cc/40?img=9', online: false, location: 'Chamisero, Colina' },
  ]);

  // Cargar notificaciones del usuario
  useEffect(() => {
    if (user) {
      const userNotifications = storageService.getNotifications(user.id);
      setNotifications(userNotifications);
    }
  }, [user]);

  // Aplicar dark mode al cargar
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('friendbook_darkMode', newMode.toString());
  };

  const markNotificationAsRead = (id) => {
    if (!user) return;
    
    storageService.markNotificationAsRead(user.id, id);
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllNotificationsAsRead = () => {
    if (!user) return;
    
    storageService.markAllNotificationsAsRead(user.id);
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const addNotification = (notification) => {
    if (!user) return;
    
    const newNotification = {
      id: Date.now(),
      ...notification,
      read: false,
      createdAt: new Date().toISOString()
    };
    
    storageService.addNotification(user.id, newNotification);
    setNotifications([newNotification, ...notifications]);
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;
  const unreadMessagesCount = messages.filter(m => m.unread).length;

  const value = {
    darkMode,
    toggleDarkMode,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    addNotification,
    unreadNotificationsCount,
    messages,
    unreadMessagesCount
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
