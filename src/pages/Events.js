import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '../context/EventsContext';
import { useCommunityCalendar } from '../context/CommunityCalendarContext';
import { useReduxAuth as useAuth } from '../hooks/useReduxAuth';
import { useGamification } from '../context/GamificationContext';
import { useSidebar } from '../context/SidebarContext';
import { formatNumber } from '../utils/formatNumber';
import { showSuccessToast, showInputDialog } from '../utils/sweetalert';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import AddIcon from '@mui/icons-material/Add';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import BuildIcon from '@mui/icons-material/Build';
import WarningIcon from '@mui/icons-material/Warning';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import HandshakeIcon from '@mui/icons-material/Handshake';
import SportsIcon from '@mui/icons-material/Sports';
import TheaterComedyIcon from '@mui/icons-material/TheaterComedy';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SearchIcon from '@mui/icons-material/Search';
import './Events.css';

const Events = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { events, upcomingEvents, rsvpEvent, createEvent: createSocialEvent } = useEvents();
  const {
    calendarEvents,
    createEvent: createCommunityEvent,
    attendEvent,
    getUpcomingEvents
  } = useCommunityCalendar();
  const { addPoints, updateActivity } = useGamification();
  const { isRightSidebarCollapsed } = useSidebar();
  
  const [activeTab, setActiveTab] = useState('social'); // 'social' o 'community'
  const [selectedYear, setSelectedYear] = useState(2026);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCommunityEvent, setNewCommunityEvent] = useState({
    title: '',
    description: '',
    type: 'vecinal',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    maxAttendees: null
  });

  const years = [2026, 2025, 2024, 2023];
  const categories = ['Todos', 'Música', 'Tecnología', 'Comida', 'Arte', 'Deportes'];

  const eventTypes = [
    { value: 'oficial', label: 'Oficial', icon: <AccountBalanceIcon />, color: '#3b82f6' },
    { value: 'vecinal', label: 'Vecinal', icon: <HomeWorkIcon />, color: '#10b981' },
    { value: 'servicio', label: 'Servicio', icon: <BuildIcon />, color: '#f59e0b' },
    { value: 'emergencia', label: 'Emergencia', icon: <WarningIcon />, color: '#ef4444' },
    { value: 'taller', label: 'Taller', icon: <MenuBookIcon />, color: '#8b5cf6' },
    { value: 'reunion', label: 'Reunión', icon: <HandshakeIcon />, color: '#06b6d4' },
    { value: 'deporte', label: 'Deporte', icon: <SportsIcon />, color: '#f97316' },
    { value: 'cultural', label: 'Cultural', icon: <TheaterComedyIcon />, color: '#ec4899' }
  ];

  const handleCreateSocialEvent = async () => {
    const result = await showInputDialog('Crear Evento Social', 'Nombre del evento', 'text');
    if (result.isConfirmed && result.value) {
      const newEvent = {
        title: result.value,
        date: new Date().toISOString(),
        location: 'Por definir',
        description: 'Nuevo evento',
        category: 'General',
        image: `https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=250&fit=crop&sig=${Date.now()}`
      };
      const created = createSocialEvent(newEvent);
      showSuccessToast('¡Evento creado exitosamente!');
      navigate(`/evento/${created.slug}`);
    }
  };

  const handleEventClick = (eventSlug) => {
    navigate(`/evento/${eventSlug}`);
  };

  const handleCreateCommunityEvent = () => {
    if (!newCommunityEvent.title || !newCommunityEvent.date) return;

    const result = createCommunityEvent(newCommunityEvent);
    if (result.success) {
      addPoints('EVENT_CREATED');
      updateActivity('eventsOrganized');
      setShowCreateModal(false);
      setNewCommunityEvent({
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

  const handleRSVP = (eventId, status) => {
    rsvpEvent(eventId, status);
    showSuccessToast(`¡Has marcado que ${status === 'going' ? 'asistirás' : 'te interesa'}!`);
  };

  const handleAttendEvent = (eventId) => {
    attendEvent(eventId);
    addPoints('EVENT_ATTENDED');
    updateActivity('eventsAttended');
  };

  const filteredEvents = (events || []).filter(e => {
    const matchesCategory = activeCategory === 'Todos' || e.category === activeCategory;
    const matchesSearch = !searchTerm || e.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const upcomingCommunityEvents = getUpcomingEvents();

  return (
    <div className={`events-page ${isRightSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="events-header">
        <h1>Eventos</h1>
        <p>Descubre y participa en eventos de tu comunidad</p>
      </div>

      <div className="events-center">
        {/* Buscador con botón crear */}
        <div className="search-with-button">
          <div className="search-input-wrapper">
            <SearchIcon className="search-icon" />
            <input
              type="text"
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="create-event-btn" onClick={activeTab === 'social' ? handleCreateSocialEvent : () => setShowCreateModal(true)}>
            <AddIcon />
            Crear Evento
          </button>
        </div>

        {/* Tabs */}
        <div className="events-tabs">
          <button
            className={`tab-btn ${activeTab === 'social' ? 'active' : ''}`}
            onClick={() => setActiveTab('social')}
          >
            Sociales
          </button>
          <button
            className={`tab-btn ${activeTab === 'community' ? 'active' : ''}`}
            onClick={() => setActiveTab('community')}
          >
            Comunitarios
          </button>
        </div>

        {/* Contenido de Eventos Sociales */}
        {activeTab === 'social' && (
          <>
            {/* Categorías */}
            <div className="category-buttons">
              {categories.map(cat => (
                <button 
                  key={cat} 
                  className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Grid de eventos */}
            <div className="events-grid">
              {filteredEvents.length === 0 ? (
                <div className="no-events">
                  <p>No hay eventos en esta categoría</p>
                </div>
              ) : (
                filteredEvents.map(event => {
                  const eventDate = new Date(event.date);
                  const formattedDate = eventDate.toLocaleDateString('es', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  });
                  const formattedTime = eventDate.toLocaleTimeString('es', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  });

                  return (
                    <div key={event.id} className="event-card" onClick={() => handleEventClick(event.slug)}>
                      <div className="event-image">
                        <img src={event.image} alt={event.title} />
                        <span className="event-category">{event.category}</span>
                        {event.rsvp && (
                          <span className={`event-status ${event.rsvp}`}>
                            {event.rsvp === 'going' ? 'Asistiré' : 'Me interesa'}
                          </span>
                        )}
                      </div>
                      <div className="event-content">
                        <h3>{event.title}</h3>
                        <div className="event-details">
                          <div className="event-detail">
                            <EventIcon fontSize="small" />
                            <span>{formattedDate} a las {formattedTime}</span>
                          </div>
                          <div className="event-detail">
                            <LocationOnIcon fontSize="small" />
                            <span>{event.location}</span>
                          </div>
                          <div className="event-detail">
                            <PeopleIcon fontSize="small" />
                            <span>{event.attendees || 0} asistirán</span>
                          </div>
                        </div>
                        <div className="event-actions">
                          <button 
                            className="interested-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRSVP(event.id, 'interested');
                            }}
                          >
                            Me Interesa
                          </button>
                          <button 
                            className="going-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRSVP(event.id, 'going');
                            }}
                          >
                            Asistiré
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* Contenido de Eventos Comunitarios */}
        {activeTab === 'community' && (
          <div className="community-events-section">
            <div className="community-header">
              <button className="create-event-btn" onClick={() => setShowCreateModal(true)}>
                <AddIcon /> Crear Evento Comunitario
              </button>
            </div>

            <div className="calendar-stats">
              <div className="stat-card">
                <div className="stat-icon">
                  <EventIcon style={{ fontSize: '28px', color: '#3b82f6' }} />
                </div>
                <div className="stat-info">
                  <span className="stat-value">{formatNumber(calendarEvents.length)}</span>
                  <span className="stat-label">Eventos Totales</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <CalendarMonthIcon style={{ fontSize: '28px', color: '#10b981' }} />
                </div>
                <div className="stat-info">
                  <span className="stat-value">{formatNumber(upcomingCommunityEvents.length)}</span>
                  <span className="stat-label">Próximos Eventos</span>
                </div>
              </div>
            </div>

            <div className="community-events-grid">
              {upcomingCommunityEvents.length === 0 ? (
                <div className="empty-state">
                  <EventIcon style={{ fontSize: 60, opacity: 0.3 }} />
                  <h3>No hay eventos comunitarios próximos</h3>
                  <p>Sé el primero en crear un evento para tu barrio</p>
                </div>
              ) : (
                upcomingCommunityEvents.map(event => {
                  const typeInfo = eventTypes.find(t => t.value === event.type);
                  const isAttending = event.attendees.some(a => a.id === user?.id);
                  const isFull = event.maxAttendees && event.attendees.length >= event.maxAttendees;

                  return (
                    <div key={event.id} className="community-event-card">
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
                          {event.maxAttendees && <span> / {event.maxAttendees}</span>}
                        </div>
                      </div>
                      <button 
                        className={`attend-btn ${isAttending ? 'attending' : ''}`}
                        onClick={() => handleAttendEvent(event.id)}
                        disabled={isFull && !isAttending}
                      >
                        {isAttending ? (
                          <><CheckCircleIcon fontSize="small" /> Asistiré</>
                        ) : isFull ? (
                          'Evento Lleno'
                        ) : (
                          'Confirmar Asistencia'
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal Crear Evento Comunitario */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Crear Evento Comunitario</h2>
              <button className="close-modal" onClick={() => setShowCreateModal(false)}>
                <CloseIcon />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Tipo de Evento</label>
                <select 
                  value={newCommunityEvent.type} 
                  onChange={(e) => setNewCommunityEvent({...newCommunityEvent, type: e.target.value})}
                >
                  {eventTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Título</label>
                <input
                  type="text"
                  value={newCommunityEvent.title}
                  onChange={(e) => setNewCommunityEvent({...newCommunityEvent, title: e.target.value})}
                  placeholder="Nombre del evento"
                />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={newCommunityEvent.description}
                  onChange={(e) => setNewCommunityEvent({...newCommunityEvent, description: e.target.value})}
                  rows="3"
                  placeholder="Describe el evento..."
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Fecha</label>
                  <input
                    type="date"
                    value={newCommunityEvent.date}
                    onChange={(e) => setNewCommunityEvent({...newCommunityEvent, date: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="form-group">
                  <label>Hora Inicio</label>
                  <input
                    type="time"
                    value={newCommunityEvent.startTime}
                    onChange={(e) => setNewCommunityEvent({...newCommunityEvent, startTime: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Hora Fin</label>
                  <input
                    type="time"
                    value={newCommunityEvent.endTime}
                    onChange={(e) => setNewCommunityEvent({...newCommunityEvent, endTime: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Ubicación</label>
                <input
                  type="text"
                  value={newCommunityEvent.location}
                  onChange={(e) => setNewCommunityEvent({...newCommunityEvent, location: e.target.value})}
                  placeholder="Lugar del evento"
                />
              </div>
              <div className="form-group">
                <label>Límite de Asistentes (Opcional)</label>
                <input
                  type="number"
                  value={newCommunityEvent.maxAttendees || ''}
                  onChange={(e) => setNewCommunityEvent({...newCommunityEvent, maxAttendees: parseInt(e.target.value) || null})}
                  placeholder="Sin límite"
                  min="1"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowCreateModal(false)}>
                Cancelar
              </button>
              <button className="submit-btn" onClick={handleCreateCommunityEvent}>
                Crear Evento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
