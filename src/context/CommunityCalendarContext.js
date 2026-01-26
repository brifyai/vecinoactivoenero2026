import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/selectors/authSelectors';
import { useDispatch } from 'react-redux';
import { createNotification } from '../store/slices/notificationsSlice';
import { showSuccessToast } from '../utils/sweetalert';

const CommunityCalendarContext = createContext();

export const useCommunityCalendar = () => {
  const context = useContext(CommunityCalendarContext);
  if (!context) {
    throw new Error('useCommunityCalendar must be used within CommunityCalendarProvider');
  }
  return context;
};

export const CommunityCalendarProvider = ({ children }) => {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCalendarEvents();
  }, []);

  const loadCalendarEvents = () => {
    const stored = localStorage.getItem('communityCalendar');
    if (stored) {
      setCalendarEvents(JSON.parse(stored));
    }
    setLoading(false);
  };

  const saveCalendarEvents = (updated) => {
    localStorage.setItem('communityCalendar', JSON.stringify(updated));
    setCalendarEvents(updated);
  };

  // Crear evento
  const createEvent = (eventData) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    const newEvent = {
      id: Date.now(),
      title: eventData.title,
      description: eventData.description,
      type: eventData.type, // oficial, vecinal, servicio, emergencia, taller, reunion, deporte, cultural
      date: eventData.date,
      startTime: eventData.startTime,
      endTime: eventData.endTime,
      location: eventData.location,
      organizerId: user.id,
      organizerName: user.name,
      organizerAvatar: user.avatar,
      neighborhoodId: user.neighborhoodId,
      neighborhoodName: user.neighborhoodName,
      neighborhoodCode: user.neighborhoodCode,
      isRecurring: eventData.isRecurring || false,
      recurrencePattern: eventData.recurrencePattern || null, // diario, semanal, mensual
      maxAttendees: eventData.maxAttendees || null,
      attendees: [],
      reminders: eventData.reminders || [], // 1h, 24h, 1week
      images: eventData.images || [],
      tags: eventData.tags || [],
      isPublic: eventData.isPublic !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updated = [...calendarEvents, newEvent];
    saveCalendarEvents(updated);
    showSuccessToast('¡Evento creado exitosamente!');
    
    return { success: true, event: newEvent };
  };

  // Confirmar asistencia
  const attendEvent = (eventId) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    const updated = calendarEvents.map(event => {
      if (event.id === eventId) {
        const isAttending = event.attendees.some(a => a.id === user.id);
        
        if (isAttending) {
          return {
            ...event,
            attendees: event.attendees.filter(a => a.id !== user.id)
          };
        } else {
          // Verificar límite de asistentes
          if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
            showSuccessToast('Evento lleno');
            return event;
          }

          // Notificar al organizador
          if (event.organizerId !== user.id) {
            dispatch(createNotification({
              userId: event.organizerId,
              type: 'event_attendance',
              from: user.id,
              fromName: user.name,
              fromAvatar: user.avatar,
              eventId: eventId,
              message: `${user.name} confirmó asistencia a "${event.title}"`,
              read: false
            }));
          }
          
          return {
            ...event,
            attendees: [...event.attendees, {
              id: user.id,
              name: user.name,
              avatar: user.avatar,
              confirmedAt: new Date().toISOString()
            }]
          };
        }
      }
      return event;
    });

    saveCalendarEvents(updated);
    return { success: true };
  };

  // Actualizar evento
  const updateEvent = (eventId, updates) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    const updated = calendarEvents.map(event => {
      if (event.id === eventId && event.organizerId === user.id) {
        return {
          ...event,
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
      return event;
    });

    saveCalendarEvents(updated);
    showSuccessToast('Evento actualizado');
    return { success: true };
  };

  // Eliminar evento
  const deleteEvent = (eventId) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    const event = calendarEvents.find(e => e.id === eventId);
    if (!event || event.organizerId !== user.id) {
      return { success: false, error: 'No tienes permiso' };
    }

    const updated = calendarEvents.filter(e => e.id !== eventId);
    saveCalendarEvents(updated);
    showSuccessToast('Evento eliminado');
    return { success: true };
  };

  // Filtros
  const getEventsByDate = (date) => {
    return calendarEvents.filter(e => e.date === date);
  };

  const getEventsByMonth = (year, month) => {
    return calendarEvents.filter(e => {
      const eventDate = new Date(e.date);
      return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    });
  };

  const getEventsByNeighborhood = (neighborhoodId) => {
    return calendarEvents.filter(e => e.neighborhoodId === neighborhoodId);
  };

  const getEventsByType = (type) => {
    return calendarEvents.filter(e => e.type === type);
  };

  const getUpcomingEvents = () => {
    const now = new Date();
    return calendarEvents
      .filter(e => new Date(e.date) >= now)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const getMyEvents = () => {
    if (!user) return [];
    return calendarEvents.filter(e => 
      e.organizerId === user.id || e.attendees.some(a => a.id === user.id)
    );
  };

  const value = {
    calendarEvents,
    loading,
    createEvent,
    attendEvent,
    updateEvent,
    deleteEvent,
    getEventsByDate,
    getEventsByMonth,
    getEventsByNeighborhood,
    getEventsByType,
    getUpcomingEvents,
    getMyEvents,
    refreshCalendar: loadCalendarEvents
  };

  return <CommunityCalendarContext.Provider value={value}>{children}</CommunityCalendarContext.Provider>;
};
