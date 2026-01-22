import { useSelector, useDispatch } from 'react-redux';
import {
  loadEvents,
  createEvent,
  rsvpEvent,
  updateEvent,
  deleteEvent,
  clearError
} from '../store/slices/eventsSlice';
import {
  selectAllEvents,
  selectMyEvents,
  selectEventsLoading,
  selectEventsError,
  selectUpcomingEvents,
  selectPastEvents
} from '../store/selectors/eventsSelectors';
import { selectUser } from '../store/selectors/authSelectors';
import { showSuccessToast, showErrorToast } from '../utils/sweetalert';

export const useReduxEvents = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const allEvents = useSelector(selectAllEvents);
  const myEvents = useSelector(selectMyEvents);
  const loading = useSelector(selectEventsLoading);
  const error = useSelector(selectEventsError);
  const upcomingEvents = useSelector(selectUpcomingEvents);
  const pastEvents = useSelector(selectPastEvents);

  const loadUserEvents = () => {
    if (user) {
      dispatch(loadEvents(user.id));
    }
  };

  const createNewEvent = async (eventData) => {
    if (!user) return null;
    try {
      const result = await dispatch(createEvent({ eventData, userId: user.id })).unwrap();
      showSuccessToast('¡Evento creado exitosamente!');
      return result;
    } catch (error) {
      showErrorToast(error || 'Error al crear evento');
      return null;
    }
  };

  const rsvpToEvent = async (eventId, status) => {
    if (!user) return false;
    try {
      await dispatch(rsvpEvent({ eventId, userId: user.id, status })).unwrap();
      const messages = {
        going: '¡Confirmaste tu asistencia!',
        interested: 'Marcado como interesado',
        'not-going': 'Asistencia cancelada'
      };
      showSuccessToast(messages[status] || 'Estado actualizado');
      return true;
    } catch (error) {
      showErrorToast(error || 'Error al actualizar RSVP');
      return false;
    }
  };

  const attendEvent = (eventId) => rsvpToEvent(eventId, 'going');
  const cancelAttendance = (eventId) => rsvpToEvent(eventId, 'not-going');

  const updateEventById = async (eventId, updates) => {
    if (!user) return false;
    try {
      await dispatch(updateEvent({ eventId, updates, userId: user.id })).unwrap();
      showSuccessToast('Evento actualizado');
      return true;
    } catch (error) {
      showErrorToast(error || 'Error al actualizar evento');
      return false;
    }
  };

  const deleteEventById = async (eventId) => {
    if (!user) return false;
    try {
      await dispatch(deleteEvent({ eventId, userId: user.id })).unwrap();
      showSuccessToast('Evento eliminado');
      return true;
    } catch (error) {
      showErrorToast(error || 'Error al eliminar evento');
      return false;
    }
  };

  const getUserRSVP = (eventId) => {
    const event = allEvents.find(e => e.id === eventId);
    if (!event || !user) return null;
    if (event.attendees?.includes(user.id)) return 'going';
    if (event.interested?.includes(user.id)) return 'interested';
    return 'not-going';
  };

  const searchEvents = (query) => {
    if (!query || !query.trim()) return allEvents;
    const lowerQuery = query.toLowerCase();
    return allEvents.filter(event =>
      event.title.toLowerCase().includes(lowerQuery) ||
      event.description.toLowerCase().includes(lowerQuery) ||
      event.location.toLowerCase().includes(lowerQuery)
    );
  };

  return {
    events: allEvents,
    myEvents,
    loading,
    error,
    upcomingEvents,
    pastEvents,
    loadEvents: loadUserEvents,
    createEvent: createNewEvent,
    rsvpEvent: rsvpToEvent,
    attendEvent,
    cancelAttendance,
    getUserRSVP,
    updateEvent: updateEventById,
    deleteEvent: deleteEventById,
    searchEvents,
    getUpcomingEvents: () => upcomingEvents,
    getPastEvents: () => pastEvents,
    clearError: () => dispatch(clearError())
  };
};
