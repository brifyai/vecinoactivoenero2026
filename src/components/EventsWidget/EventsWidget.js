import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReduxEvents } from '../../hooks/useReduxEvents';
import EventIcon from '@mui/icons-material/Event';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import './EventsWidget.css';

const EventsWidget = () => {
  const navigate = useNavigate();
  const { upcomingEvents, loadEvents, loading } = useReduxEvents();

  useEffect(() => {
    loadEvents();
  }, []);

  // Mostrar solo los primeros 3 eventos próximos
  const displayEvents = upcomingEvents.slice(0, 3);

  const handleEventClick = (eventSlug) => {
    navigate(`/app/evento/${eventSlug}`);
  };

  const handleViewAll = () => {
    navigate('/app/eventos');
  };

  const formatEventDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatEventTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="events-widget">
      <div className="widget-header">
        <div className="widget-title">
          <EventIcon style={{ color: '#0e8ce4' }} />
          <h3>Eventos</h3>
        </div>
        <button className="view-all-btn" onClick={handleViewAll}>
          Ver Todos <ArrowForwardIcon fontSize="small" />
        </button>
      </div>
      
      {loading ? (
        <div className="events-loading">
          <p>Cargando eventos...</p>
        </div>
      ) : displayEvents.length === 0 ? (
        <div className="events-empty">
          <p>No hay eventos próximos</p>
          <button className="create-event-link" onClick={() => navigate('/app/eventos')}>
            Crear un evento
          </button>
        </div>
      ) : (
        <div className="events-list">
          {displayEvents.map((event) => (
            <div 
              key={event.id} 
              className="event-item"
              onClick={() => handleEventClick(event.slug)}
            >
              <img 
                src={event.image || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&h=150&fit=crop'} 
                alt={event.title} 
              />
              <div className="event-info">
                <h4>{event.title}</h4>
                <p>{formatEventDate(event.date)} • {formatEventTime(event.date)}</p>
                {event.attendees && (
                  <span className="event-attendees">{event.attendees} asistirán</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsWidget;
