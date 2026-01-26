import React, { useState } from 'react';
import { useCommunityCalendar } from '../../context/CommunityCalendarContext';
import { useReduxAuth as useAuth } from '../../hooks/useReduxAuth';
import { useReduxGamification } from '../../hooks/useReduxGamification';
import { formatNumber } from '../../utils/formatNumber';
import AddIcon from '@mui/icons-material/Add';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import './CommunityCalendar.css';

const CommunityCalendar = () => {
  const { user } = useAuth();
  const { calendarEvents, createEvent, attendEvent, getUpcomingEvents } = useCommunityCalendar();
  const { addPoints, updateActivity } = useReduxGamification();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    type: 'vecinal',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    maxAttendees: null
  });

  const eventTypes = [
    { value: 'oficial', label: 'Oficial', icon: '🏛️', color: '#3b82f6' },
    { value: 'vecinal', label: 'Vecinal', icon: '🏘️', color: '#10b981' },
    { value: 'servicio', label: 'Servicio', icon: '🔧', color: '#f59e0b' },
    { value: 'emergencia', label: 'Emergencia', icon: '🚨', color: '#ef4444' },
    { value: 'taller', label: 'Taller', icon: '📚', color: '#8b5cf6' },
    { value: 'reunion', label: 'Reunión', icon: '🤝', color: '#06b6d4' },
    { value: 'deporte', label: 'Deporte', icon: '⚽', color: '#f97316' },
    { value: 'cultural', label: 'Cultural', icon: '🎭', color: '#ec4899' }
  ];

  const upcomingEvents = getUpcomingEvents();

  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.date) return;

    const result = createEvent(newEvent);
    if (result.success) {
      addPoints('EVENT_CREATED');
      updateActivity('eventsOrganized');
      setShowCreateModal(false);
      setNewEvent({
        title: '',
        description: '',
        type: 'vecinal',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        maxAttendees: null
      });
    }
  };

  const handleAttendEvent = (eventId) => {
    attendEvent(eventId);
    addPoints('EVENT_ATTENDED');
    updateActivity('eventsAttended');
  };

  return (
    <div className="calendar-page">
      <div className="calendar-header">
        <div>
          <h1>📅 Calendario Comunitario</h1>
          <p>Eventos y actividades de tu barrio</p>
        </div>
        <button className="create-event-btn" onClick={() => setShowCreateModal(true)}>
          <AddIcon /> Crear Evento
        </button>
      </div>

      <div className="calendar-stats">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <span className="stat-value">{formatNumber(calendarEvents.length)}</span>
            <span className="stat-label">Eventos Totales</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <span className="stat-value">{formatNumber(upcomingEvents.length)}</span>
            <span className="stat-label">Próximos Eventos</span>
          </div>
        </div>
      </div>

      <div className="events-grid">
        {upcomingEvents.map(event => {
          const typeInfo = eventTypes.find(t => t.value === event.type);
          const isAttending = event.attendees.some(a => a.id === user?.id);
          const isFull = event.maxAttendees && event.attendees.length >= event.maxAttendees;

          return (
            <div key={event.id} className="event-card">
              <div className="event-type-badge" style={{ background: typeInfo?.color }}>
                {typeInfo?.icon} {typeInfo?.label}
              </div>
              <h3>{event.title}</h3>
              <p>{event.description}</p>
              <div className="event-details">
                <div className="detail-item">
                  <EventIcon fontSize="small" />
                  <span>{new Date(event.date).toLocaleDateString('es-CL')}</span>
                </div>
                <div className="detail-item">
                  <AccessTimeIcon fontSize="small" />
                  <span>{event.startTime} - {event.endTime}</span>
                </div>
                <div className="detail-item">
                  <LocationOnIcon fontSize="small" />
                  <span>{event.location}</span>
                </div>
                <div className="detail-item">
                  <PeopleIcon fontSize="small" />
                  <span>{event.attendees.length} asistentes</span>
                </div>
              </div>
              <button 
                className={`attend-btn ${isAttending ? 'attending' : ''}`}
                onClick={() => handleAttendEvent(event.id)}
                disabled={isFull && !isAttending}
              >
                {isAttending ? <><CheckCircleIcon fontSize="small" /> Asistiré</> : 'Confirmar Asistencia'}
              </button>
            </div>
          );
        })}
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Crear Evento</h2>
              <button className="close-modal" onClick={() => setShowCreateModal(false)}>
                <CloseIcon />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Tipo de Evento</label>
                <select value={newEvent.type} onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}>
                  {eventTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.icon} {type.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Título</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  placeholder="Nombre del evento"
                />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  rows="3"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Fecha</label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Hora Inicio</label>
                  <input
                    type="time"
                    value={newEvent.startTime}
                    onChange={(e) => setNewEvent({...newEvent, startTime: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Hora Fin</label>
                  <input
                    type="time"
                    value={newEvent.endTime}
                    onChange={(e) => setNewEvent({...newEvent, endTime: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Ubicación</label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                  placeholder="Lugar del evento"
                />
              </div>
              <div className="form-group">
                <label>Límite de Asistentes (Opcional)</label>
                <input
                  type="number"
                  value={newEvent.maxAttendees || ''}
                  onChange={(e) => setNewEvent({...newEvent, maxAttendees: parseInt(e.target.value) || null})}
                  placeholder="Sin límite"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowCreateModal(false)}>Cancelar</button>
              <button className="submit-btn" onClick={handleCreateEvent}>Crear Evento</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityCalendar;
