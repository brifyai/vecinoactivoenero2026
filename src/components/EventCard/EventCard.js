import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '../../context/EventsContext';
import { useReduxAuth as useAuth } from '../../hooks/useReduxAuth';
import { showSuccessToast } from '../../utils/sweetalert';
import './EventCard.css';

const EventCard = () => {
  const navigate = useNavigate();
  const { events, attendEvent, cancelAttendance } = useEvents();
  const { user } = useAuth();

  // Obtener el próximo evento
  const upcomingEvent = events
    .filter(event => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  if (!upcomingEvent) {
    return (
      <div className="event-card-home">
        <div className="event-content-home no-events">
          <h4>No hay eventos próximos</h4>
          <p>Crea un evento para tu comunidad</p>
          <button 
            className="event-btn-home" 
            onClick={() => navigate('/eventos')}
          >
            Ver Eventos
          </button>
        </div>
      </div>
    );
  }

  const isAttending = upcomingEvent.attendees?.includes(user?.id);
  const attendeeCount = upcomingEvent.attendees?.length || 0;

  const handleEventResponse = () => {
    if (isAttending) {
      cancelAttendance(upcomingEvent.id);
      showSuccessToast('Ya no asistirás a este evento');
    } else {
      attendEvent(upcomingEvent.id);
      showSuccessToast('¡Confirmaste tu asistencia!');
    }
  };

  const handleViewEvent = () => {
    navigate(`/evento/${upcomingEvent.slug || upcomingEvent.id}`);
  };

  return (
    <div className="event-card-home">
      <img 
        src={upcomingEvent.image || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=200&fit=crop'} 
        alt={upcomingEvent.name}
        onClick={handleViewEvent}
        style={{ cursor: 'pointer' }}
      />
      <div className="event-content-home">
        <h4 onClick={handleViewEvent} style={{ cursor: 'pointer' }}>
          {upcomingEvent.name}
        </h4>
        <p>{upcomingEvent.date} • {upcomingEvent.time}</p>
        <span>
          {upcomingEvent.location} • {attendeeCount} {attendeeCount === 1 ? 'persona asistirá' : 'personas asistirán'}
        </span>
        <button className="event-btn-home" onClick={handleEventResponse}>
          {isAttending ? 'Asistiré ✓' : 'Asistiré / No asistiré'}
        </button>
      </div>
    </div>
  );
};

export default EventCard;
