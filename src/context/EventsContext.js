import { createContext, useContext, useEffect } from 'react';
import { useReduxEvents } from '../hooks/useReduxEvents';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/selectors/authSelectors';

const EventsContext = createContext();

export const useEvents = () => {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error('useEvents debe usarse dentro de EventsProvider');
  }
  return context;
};

export const EventsProvider = ({ children }) => {
  const user = useSelector(selectUser);
  const reduxEvents = useReduxEvents();

  useEffect(() => {
    if (user) {
      reduxEvents.loadEvents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Alias para compatibilidad
  const inviteToEvent = (eventId, userId) => {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    notifications.push({
      id: Date.now(),
      userId: userId,
      type: 'event-invite',
      message: `te invitó a un evento`,
      eventId: eventId,
      read: false,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('notifications', JSON.stringify(notifications));
    return true;
  };

  const value = {
    ...reduxEvents,
    inviteToEvent
  };

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
};
