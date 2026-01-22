import { createContext, useContext, useState, useEffect } from 'react';
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
  const [events, setEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);

  useEffect(() => {
    if (user) {
      loadEvents();
    }
  }, [user]);

  const loadEvents = () => {
    let allEvents = JSON.parse(localStorage.getItem('events') || '[]');
    
    // Si no hay eventos, crear algunos de ejemplo
    if (allEvents.length === 0) {
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      
      const nextMonth = new Date(today);
      nextMonth.setDate(today.getDate() + 30);

      allEvents = [
        {
          id: Date.now(),
          name: 'Feria Vecinal de Primavera',
          slug: 'feria-vecinal-primavera',
          title: 'Feria Vecinal de Primavera',
          description: 'Únete a nuestra feria vecinal con emprendedores locales, comida, música en vivo y actividades para toda la familia.',
          date: nextWeek.toISOString().split('T')[0],
          time: '10:00',
          location: 'Plaza del Barrio',
          image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=250&fit=crop',
          createdBy: user?.id || 1,
          attendees: [user?.id || 1],
          interested: [],
          category: 'Comunitario',
          privacy: 'public',
          createdAt: new Date().toISOString()
        },
        {
          id: Date.now() + 1,
          name: 'Limpieza Comunitaria del Parque',
          slug: 'limpieza-comunitaria-parque',
          title: 'Limpieza Comunitaria del Parque',
          description: 'Ayúdanos a mantener nuestro parque limpio y hermoso. Trae guantes y bolsas, nosotros ponemos el café y las ganas.',
          date: nextMonth.toISOString().split('T')[0],
          time: '09:00',
          location: 'Parque Central',
          image: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=400&h=250&fit=crop',
          createdBy: user?.id || 1,
          attendees: [user?.id || 1],
          interested: [],
          category: 'Medio Ambiente',
          privacy: 'public',
          createdAt: new Date().toISOString()
        }
      ];
      
      localStorage.setItem('events', JSON.stringify(allEvents));
    }
    
    setEvents(allEvents);
    
    if (user) {
      const userEvents = allEvents.filter(event => 
        event.attendees?.includes(user.id) || event.createdBy === user.id
      );
      setMyEvents(userEvents);
    }
  };

  const createEvent = (eventData) => {
    const allEvents = JSON.parse(localStorage.getItem('events') || '[]');
    
    // Generar slug único
    const baseSlug = eventData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let slug = baseSlug;
    let counter = 1;
    while (allEvents.some(e => e.slug === slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    const newEvent = {
      id: Date.now(),
      title: eventData.title,
      slug: slug,
      description: eventData.description,
      date: eventData.date,
      time: eventData.time,
      location: eventData.location,
      image: eventData.image || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=250&fit=crop',
      createdBy: user.id,
      attendees: [user.id],
      interested: [],
      category: eventData.category || 'General',
      privacy: eventData.privacy || 'public',
      createdAt: new Date().toISOString()
    };

    allEvents.push(newEvent);
    localStorage.setItem('events', JSON.stringify(allEvents));
    loadEvents();
    return newEvent;
  };

  const rsvpEvent = (eventId, status) => {
    // status: 'going', 'interested', 'not-going'
    const allEvents = JSON.parse(localStorage.getItem('events') || '[]');
    const eventIndex = allEvents.findIndex(e => e.id === eventId);

    if (eventIndex === -1) return false;

    // Inicializar arrays si no existen
    if (!allEvents[eventIndex].attendees) allEvents[eventIndex].attendees = [];
    if (!allEvents[eventIndex].interested) allEvents[eventIndex].interested = [];

    // Remover de todas las listas primero
    allEvents[eventIndex].attendees = allEvents[eventIndex].attendees.filter(id => id !== user.id);
    allEvents[eventIndex].interested = allEvents[eventIndex].interested.filter(id => id !== user.id);

    // Agregar según el nuevo estado
    if (status === 'going') {
      allEvents[eventIndex].attendees.push(user.id);
    } else if (status === 'interested') {
      allEvents[eventIndex].interested.push(user.id);
    }

    localStorage.setItem('events', JSON.stringify(allEvents));
    loadEvents();
    return true;
  };

  const getUserRSVP = (eventId) => {
    const allEvents = JSON.parse(localStorage.getItem('events') || '[]');
    const event = allEvents.find(e => e.id === eventId);

    if (!event) return null;

    if (event.attendees.includes(user.id)) return 'going';
    if (event.interested.includes(user.id)) return 'interested';
    return 'not-going';
  };

  const updateEvent = (eventId, updates) => {
    const allEvents = JSON.parse(localStorage.getItem('events') || '[]');
    const eventIndex = allEvents.findIndex(e => e.id === eventId);

    if (eventIndex === -1) return false;

    // Verificar que el usuario es el creador
    if (allEvents[eventIndex].createdBy !== user.id) {
      return false;
    }

    allEvents[eventIndex] = {
      ...allEvents[eventIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem('events', JSON.stringify(allEvents));
    loadEvents();
    return true;
  };

  const deleteEvent = (eventId) => {
    const allEvents = JSON.parse(localStorage.getItem('events') || '[]');
    const event = allEvents.find(e => e.id === eventId);

    if (!event || event.createdBy !== user.id) {
      return false;
    }

    const filtered = allEvents.filter(e => e.id !== eventId);
    localStorage.setItem('events', JSON.stringify(filtered));
    loadEvents();
    return true;
  };

  const inviteToEvent = (eventId, userId) => {
    // Aquí podrías agregar lógica de invitaciones
    // Por ahora, simplemente notificamos
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

  const getUpcomingEvents = () => {
    const now = new Date();
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= now;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const getPastEvents = () => {
    const now = new Date();
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate < now;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const searchEvents = (query) => {
    return events.filter(event =>
      event.title.toLowerCase().includes(query.toLowerCase()) ||
      event.description.toLowerCase().includes(query.toLowerCase()) ||
      event.location.toLowerCase().includes(query.toLowerCase())
    );
  };

  const attendEvent = (eventId) => {
    return rsvpEvent(eventId, 'going');
  };

  const cancelAttendance = (eventId) => {
    return rsvpEvent(eventId, 'not-going');
  };

  const value = {
    events,
    myEvents,
    createEvent,
    rsvpEvent,
    attendEvent,
    cancelAttendance,
    getUserRSVP,
    updateEvent,
    deleteEvent,
    inviteToEvent,
    getUpcomingEvents,
    getPastEvents,
    searchEvents,
    loadEvents
  };

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
};
