import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSharedResources } from '../../context/SharedResourcesContext';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import { useGamification } from '../../context/GamificationContext';
import { formatNumber } from '../../utils/formatNumber';
import AddIcon from '@mui/icons-material/Add';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ShareIcon from '@mui/icons-material/Share';
import ListAltIcon from '@mui/icons-material/ListAlt';
import BuildIcon from '@mui/icons-material/Build';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import HomeIcon from '@mui/icons-material/Home';
import HelpIcon from '@mui/icons-material/Help';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbsUpDownIcon from '@mui/icons-material/ThumbsUpDown';
import LoopIcon from '@mui/icons-material/Loop';
import BarChartIcon from '@mui/icons-material/BarChart';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CancelIcon from '@mui/icons-material/Cancel';
import MailIcon from '@mui/icons-material/Mail';
import './SharedResources.css';

const SharedResources = ({ hideHeader = false, hideStats = false }) => {
  const { user } = useAuth();
  const { isRightSidebarCollapsed } = useSidebar();
  const {
    resources,
    reservations,
    addResource,
    reserveResource,
    approveReservation,
    completeReservation,
    cancelReservation,
    getMyResources,
    getMyReservations,
    getPendingRequests
  } = useSharedResources();
  const { addPoints, updateActivity } = useGamification();
  const navigate = useNavigate();

  const [view, setView] = useState('all'); // all, my-resources, my-reservations, pending
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);

  const [newResource, setNewResource] = useState({
    name: '',
    description: '',
    category: 'herramienta',
    subcategory: '',
    condition: 'bueno',
    requiresDeposit: false,
    depositAmount: 0,
    maxLoanDays: 7,
    rules: ''
  });

  const [reservationData, setReservationData] = useState({
    startDate: '',
    endDate: '',
    purpose: ''
  });

  const [completeData, setCompleteData] = useState({
    inGoodCondition: true,
    rating: 5
  });

  const categories = [
    { value: 'all', label: 'Todos', icon: <ListAltIcon /> },
    { value: 'herramienta', label: 'Herramientas', icon: <BuildIcon /> },
    { value: 'equipo', label: 'Equipos', icon: <Inventory2Icon /> },
    { value: 'libro', label: 'Libros', icon: <MenuBookIcon /> },
    { value: 'juego', label: 'Juegos', icon: <SportsEsportsIcon /> },
    { value: 'espacio', label: 'Espacios', icon: <HomeIcon /> },
    { value: 'otro', label: 'Otro', icon: <HelpIcon /> }
  ];

  const conditions = [
    { value: 'nuevo', label: 'Nuevo', icon: <AutoAwesomeIcon /> },
    { value: 'bueno', label: 'Bueno', icon: <ThumbUpIcon /> },
    { value: 'regular', label: 'Regular', icon: <ThumbsUpDownIcon /> },
    { value: 'usado', label: 'Usado', icon: <LoopIcon /> }
  ];

  const getFilteredResources = () => {
    let filtered = [];

    if (view === 'my-resources') {
      filtered = getMyResources();
    } else if (view === 'my-reservations') {
      return getMyReservations();
    } else if (view === 'pending') {
      return getPendingRequests();
    } else {
      filtered = resources.filter(r => r.isAvailable);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(r => r.category === categoryFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredItems = getFilteredResources();

  const handleAddResource = () => {
    if (!newResource.name || !newResource.description) return;

    const result = addResource(newResource);
    if (result.success) {
      addPoints('RESOURCE_SHARED');
      updateActivity('resourcesShared');
      setShowAddModal(false);
      setNewResource({
        name: '',
        description: '',
        category: 'herramienta',
        subcategory: '',
        condition: 'bueno',
        requiresDeposit: false,
        depositAmount: 0,
        maxLoanDays: 7,
        rules: ''
      });
      navigate(`/recursos/${result.resource.slug}`);
    }
  };

  const handleReserve = () => {
    if (!reservationData.startDate || !reservationData.endDate || !selectedResource) return;

    const result = reserveResource(selectedResource.id, reservationData);
    if (result.success) {
      setShowReserveModal(false);
      setReservationData({ startDate: '', endDate: '', purpose: '' });
      setSelectedResource(null);
    }
  };

  const handleComplete = () => {
    if (!selectedReservation) return;

    completeReservation(selectedReservation.id, completeData);
    setShowCompleteModal(false);
    setCompleteData({ inGoodCondition: true, rating: 5 });
    setSelectedReservation(null);
  };

  const openReserveModal = (resource) => {
    setSelectedResource(resource);
    setShowReserveModal(true);
  };

  const openCompleteModal = (reservation) => {
    setSelectedReservation(reservation);
    setShowCompleteModal(true);
  };

  return (
    <div className={`shared-resources-page ${isRightSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {!hideHeader && (
        <div className="resources-header">
          <div className="resources-title">
            <h1><ShareIcon className="page-title-icon" /> Recursos Compartidos</h1>
            <p>Comparte y pide prestado entre vecinos - Economía colaborativa</p>
          </div>
          <button className="add-resource-btn" onClick={() => setShowAddModal(true)}>
            <AddIcon /> Agregar Recurso
          </button>
        </div>
      )}

      <div className="resources-stats">
        {!hideStats && (
          <>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#dbeafe' }}>
                <Inventory2Icon style={{ fontSize: '28px', color: '#3b82f6' }} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{formatNumber(resources.length)}</span>
                <span className="stat-label">Recursos Disponibles</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#dcfce7' }}>
                <CheckCircleIcon style={{ fontSize: '28px', color: '#10b981' }} />
              </div>
              <div className="stat-info">
                <span className="stat-value">
                  {formatNumber(reservations.filter(r => r.status === 'completada').length)}
                </span>
                <span className="stat-label">Préstamos Completados</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#fef3c7' }}>
                <LoopIcon style={{ fontSize: '28px', color: '#f59e0b' }} />
              </div>
              <div className="stat-info">
                <span className="stat-value">
                  {formatNumber(reservations.filter(r => r.status === 'activa').length)}
                </span>
                <span className="stat-label">Préstamos Activos</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#fce7f3' }}>
                <HourglassEmptyIcon style={{ fontSize: '28px', color: '#ec4899' }} />
              </div>
              <div className="stat-info">
                <span className="stat-value">
                  {formatNumber(getPendingRequests().length)}
                </span>
                <span className="stat-label">Solicitudes Pendientes</span>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="resources-controls">
        <div className="view-tabs">
          <button
            className={view === 'all' ? 'active' : ''}
            onClick={() => setView('all')}
          >
            Todos los Recursos
          </button>
          <button
            className={view === 'my-resources' ? 'active' : ''}
            onClick={() => setView('my-resources')}
          >
            Mis Recursos
          </button>
          <button
            className={view === 'my-reservations' ? 'active' : ''}
            onClick={() => setView('my-reservations')}
          >
            Mis Reservas
          </button>
          <button
            className={view === 'pending' ? 'active' : ''}
            onClick={() => setView('pending')}
          >
            Solicitudes Pendientes
            {getPendingRequests().length > 0 && (
              <span className="badge">{getPendingRequests().length}</span>
            )}
          </button>
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar recursos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {(view === 'all' || view === 'my-resources') && (
        <div className="category-filters">
          {categories.map(cat => (
            <button
              key={cat.value}
              className={`category-btn ${categoryFilter === cat.value ? 'active' : ''}`}
              onClick={() => setCategoryFilter(cat.value)}
            >
              <span className="cat-icon">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      )}

      <div className="resources-grid">
        {view === 'my-reservations' || view === 'pending' ? (
          // Vista de reservas
          filteredItems.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <MailIcon style={{ fontSize: '64px', opacity: 0.3 }} />
              </div>
              <h3>No hay {view === 'pending' ? 'solicitudes pendientes' : 'reservas'}</h3>
              <p>{view === 'pending' ? 'Cuando alguien solicite tus recursos aparecerán aquí' : 'Aún no has reservado ningún recurso'}</p>
            </div>
          ) : (
            filteredItems.map(reservation => {
              const resource = resources.find(r => r.id === reservation.resourceId);
              const isOwner = reservation.ownerId === user?.id;

              return (
                <div key={reservation.id} className="reservation-card">
                  <div className="reservation-header">
                    <div className="reservation-status" data-status={reservation.status}>
                      {reservation.status === 'pendiente' && (
                        <>
                          <HourglassEmptyIcon fontSize="small" /> Pendiente
                        </>
                      )}
                      {reservation.status === 'activa' && (
                        <>
                          <LoopIcon fontSize="small" /> Activa
                        </>
                      )}
                      {reservation.status === 'completada' && (
                        <>
                          <CheckCircleIcon fontSize="small" /> Completada
                        </>
                      )}
                      {reservation.status === 'cancelada' && (
                        <>
                          <CancelIcon fontSize="small" /> Cancelada
                        </>
                      )}
                    </div>
                  </div>

                  <h3 className="reservation-resource-name">{reservation.resourceName}</h3>

                  <div className="reservation-dates">
                    <CalendarTodayIcon fontSize="small" />
                    <span>
                      {new Date(reservation.startDate).toLocaleDateString('es-CL')} - {' '}
                      {new Date(reservation.endDate).toLocaleDateString('es-CL')}
                    </span>
                  </div>

                  {reservation.purpose && (
                    <p className="reservation-purpose">
                      <strong>Propósito:</strong> {reservation.purpose}
                    </p>
                  )}

                  <div className="reservation-people">
                    {isOwner ? (
                      <div className="person-info">
                        <img src={reservation.borrowerAvatar} alt={reservation.borrowerName} />
                        <div>
                          <span className="person-name">{reservation.borrowerName}</span>
                          <span className="person-role">Solicitante</span>
                        </div>
                      </div>
                    ) : (
                      <div className="person-info">
                        <img src={reservation.ownerAvatar || resource?.ownerAvatar} alt={reservation.ownerName} />
                        <div>
                          <span className="person-name">{reservation.ownerName}</span>
                          <span className="person-role">Dueño</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="reservation-actions">
                    {isOwner && reservation.status === 'pendiente' && (
                      <>
                        <button
                          className="approve-btn"
                          onClick={() => approveReservation(reservation.id)}
                        >
                          <CheckCircleIcon fontSize="small" />
                          Aprobar
                        </button>
                        <button
                          className="reject-btn"
                          onClick={() => cancelReservation(reservation.id)}
                        >
                          <CloseIcon fontSize="small" />
                          Rechazar
                        </button>
                      </>
                    )}
                    {isOwner && reservation.status === 'activa' && (
                      <button
                        className="complete-btn"
                        onClick={() => openCompleteModal(reservation)}
                      >
                        <CheckCircleIcon fontSize="small" />
                        Marcar como Devuelto
                      </button>
                    )}
                    {!isOwner && reservation.status === 'pendiente' && (
                      <button
                        className="cancel-btn"
                        onClick={() => cancelReservation(reservation.id)}
                      >
                        Cancelar Solicitud
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )
        ) : (
          // Vista de recursos
          filteredItems.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎁</div>
              <h3>No hay recursos disponibles</h3>
              <p>Sé el primero en compartir algo con tu comunidad</p>
            </div>
          ) : (
            filteredItems.map(resource => {
              const categoryInfo = categories.find(c => c.value === resource.category);
              const conditionInfo = conditions.find(c => c.value === resource.condition);
              const isMyResource = resource.ownerId === user?.id;

              return (
                <div
                  key={resource.id}
                  className="resource-card"
                  onClick={() => navigate(`/recursos/${resource.slug}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="resource-card-header">
                    <div className="resource-category">
                      {categoryInfo?.icon} {categoryInfo?.label}
                    </div>
                    <div className="resource-condition">
                      {conditionInfo?.icon} {conditionInfo?.label}
                    </div>
                  </div>

                  <h3 className="resource-name">{resource.name}</h3>
                  <p className="resource-description">{resource.description}</p>

                  <div className="resource-meta">
                    <div className="meta-item">
                      <CalendarTodayIcon fontSize="small" />
                      <span>Máx. {resource.maxLoanDays} días</span>
                    </div>
                    {resource.requiresDeposit && (
                      <div className="meta-item deposit">
                        💰 Depósito: ${formatNumber(resource.depositAmount)}
                      </div>
                    )}
                    {resource.totalLoans > 0 && (
                      <div className="meta-item">
                        <CheckCircleIcon fontSize="small" />
                        <span>{resource.totalLoans} préstamos</span>
                      </div>
                    )}
                  </div>

                  {resource.rules && (
                    <div className="resource-rules">
                      <strong>Reglas:</strong> {resource.rules}
                    </div>
                  )}

                  <div className="resource-owner">
                    <img src={resource.ownerAvatar} alt={resource.ownerName} />
                    <div>
                      <span className="owner-name">{resource.ownerName}</span>
                      <span className="owner-neighborhood">{resource.neighborhoodName}</span>
                    </div>
                    {resource.ownerPhone && !isMyResource && (
                      <a href={`tel:${resource.ownerPhone}`} className="phone-link">
                        <PhoneIcon fontSize="small" />
                      </a>
                    )}
                  </div>

                  {!isMyResource && resource.isAvailable && (
                    <button
                      className="reserve-btn"
                      onClick={() => openReserveModal(resource)}
                    >
                      <CalendarTodayIcon fontSize="small" />
                      Solicitar Préstamo
                    </button>
                  )}

                  {isMyResource && (
                    <div className="my-resource-badge">
                      <CheckCircleIcon fontSize="small" />
                      Tu Recurso
                    </div>
                  )}
                </div>
              );
            })
          )
        )}
      </div>

      {/* Modal Agregar Recurso */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Agregar Recurso</h2>
              <button className="close-modal" onClick={() => setShowAddModal(false)}>
                <CloseIcon />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Nombre del Recurso</label>
                <input
                  type="text"
                  value={newResource.name}
                  onChange={(e) => setNewResource({...newResource, name: e.target.value})}
                  placeholder="Ej: Taladro eléctrico"
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={newResource.description}
                  onChange={(e) => setNewResource({...newResource, description: e.target.value})}
                  placeholder="Describe el recurso, marca, modelo, etc..."
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Categoría</label>
                  <select
                    value={newResource.category}
                    onChange={(e) => setNewResource({...newResource, category: e.target.value})}
                  >
                    {categories.filter(c => c.value !== 'all').map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Condición</label>
                  <select
                    value={newResource.condition}
                    onChange={(e) => setNewResource({...newResource, condition: e.target.value})}
                  >
                    {conditions.map(cond => (
                      <option key={cond.value} value={cond.value}>
                        {cond.icon} {cond.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Máximo de Días de Préstamo</label>
                <input
                  type="number"
                  value={newResource.maxLoanDays}
                  onChange={(e) => setNewResource({...newResource, maxLoanDays: parseInt(e.target.value)})}
                  min="1"
                  max="30"
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={newResource.requiresDeposit}
                    onChange={(e) => setNewResource({...newResource, requiresDeposit: e.target.checked})}
                  />
                  Requiere depósito
                </label>
              </div>

              {newResource.requiresDeposit && (
                <div className="form-group">
                  <label>Monto del Depósito</label>
                  <input
                    type="number"
                    value={newResource.depositAmount}
                    onChange={(e) => setNewResource({...newResource, depositAmount: parseInt(e.target.value)})}
                    placeholder="0"
                  />
                </div>
              )}

              <div className="form-group">
                <label>Reglas de Uso (Opcional)</label>
                <textarea
                  value={newResource.rules}
                  onChange={(e) => setNewResource({...newResource, rules: e.target.value})}
                  placeholder="Ej: Devolver limpio, no usar en exteriores, etc..."
                  rows="2"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowAddModal(false)}>
                Cancelar
              </button>
              <button className="submit-btn" onClick={handleAddResource}>
                Agregar Recurso
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reservar */}
      {showReserveModal && selectedResource && (
        <div className="modal-overlay" onClick={() => setShowReserveModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Solicitar Préstamo</h2>
              <button className="close-modal" onClick={() => setShowReserveModal(false)}>
                <CloseIcon />
              </button>
            </div>

            <div className="modal-body">
              <div className="resource-summary">
                <h3>{selectedResource.name}</h3>
                <p>{selectedResource.description}</p>
                <div className="summary-meta">
                  <span>Máximo: {selectedResource.maxLoanDays} días</span>
                  {selectedResource.requiresDeposit && (
                    <span className="deposit-info">
                      💰 Depósito: ${formatNumber(selectedResource.depositAmount)}
                    </span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Fecha de Inicio</label>
                <input
                  type="date"
                  value={reservationData.startDate}
                  onChange={(e) => setReservationData({...reservationData, startDate: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="form-group">
                <label>Fecha de Devolución</label>
                <input
                  type="date"
                  value={reservationData.endDate}
                  onChange={(e) => setReservationData({...reservationData, endDate: e.target.value})}
                  min={reservationData.startDate || new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="form-group">
                <label>Propósito del Préstamo</label>
                <textarea
                  value={reservationData.purpose}
                  onChange={(e) => setReservationData({...reservationData, purpose: e.target.value})}
                  placeholder="Explica para qué necesitas el recurso..."
                  rows="3"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowReserveModal(false)}>
                Cancelar
              </button>
              <button className="submit-btn" onClick={handleReserve}>
                Enviar Solicitud
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Completar Préstamo */}
      {showCompleteModal && selectedReservation && (
        <div className="modal-overlay" onClick={() => setShowCompleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Completar Préstamo</h2>
              <button className="close-modal" onClick={() => setShowCompleteModal(false)}>
                <CloseIcon />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>¿El recurso fue devuelto en buenas condiciones?</label>
                <div className="condition-options">
                  <button
                    className={`condition-btn ${completeData.inGoodCondition ? 'selected' : ''}`}
                    onClick={() => setCompleteData({...completeData, inGoodCondition: true})}
                  >
                    <CheckCircleIcon fontSize="small" /> Sí
                  </button>
                  <button
                    className={`condition-btn ${!completeData.inGoodCondition ? 'selected' : ''}`}
                    onClick={() => setCompleteData({...completeData, inGoodCondition: false})}
                  >
                    <CancelIcon fontSize="small" /> No
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Califica al vecino</label>
                <div className="rating-selector">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      className={`star-btn ${star <= completeData.rating ? 'active' : ''}`}
                      onClick={() => setCompleteData({...completeData, rating: star})}
                    >
                      <StarIcon />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowCompleteModal(false)}>
                Cancelar
              </button>
              <button className="submit-btn" onClick={handleComplete}>
                Completar Préstamo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SharedResources;
