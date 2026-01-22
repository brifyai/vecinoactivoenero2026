import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHelpRequests } from '../../context/HelpRequestsContext';
import { useReduxAuth as useAuth } from '../../hooks/useReduxAuth';
import { useSidebar } from '../../context/SidebarContext';
import { useGamification } from '../../context/GamificationContext';
import { formatNumber } from '../../utils/formatNumber';
import AddIcon from '@mui/icons-material/Add';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import HandshakeIcon from '@mui/icons-material/Handshake';
import ListAltIcon from '@mui/icons-material/ListAlt';
import WarningIcon from '@mui/icons-material/Warning';
import BuildIcon from '@mui/icons-material/Build';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import HelpIcon from '@mui/icons-material/Help';
import BarChartIcon from '@mui/icons-material/BarChart';
import LoopIcon from '@mui/icons-material/Loop';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import CancelIcon from '@mui/icons-material/Cancel';
import './HelpRequests.css';

const HelpRequests = ({ hideHeader = false, hideStats = false }) => {
  const { user } = useAuth();
  const { isRightSidebarCollapsed } = useSidebar();
  const {
    helpRequests,
    createHelpRequest,
    offerHelp,
    acceptOffer,
    resolveRequest,
    cancelRequest,
    getMyRequests,
    getMyOffers
  } = useHelpRequests();
  const { addPoints, updateActivity } = useGamification();
  const navigate = useNavigate();
  
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  const [newRequest, setNewRequest] = useState({
    type: 'prestamo',
    title: '',
    description: '',
    urgency: 'normal',
    location: ''
  });

  const [offerData, setOfferData] = useState({
    message: '',
    availability: ''
  });

  const types = [
    { value: 'all', label: 'Todos', icon: <ListAltIcon /> },
    { value: 'emergencia', label: 'Emergencia', icon: <WarningIcon />, color: '#ef4444' },
    { value: 'prestamo', label: 'Préstamo', icon: <BuildIcon />, color: '#3b82f6' },
    { value: 'cuidado', label: 'Cuidado', icon: <ChildCareIcon />, color: '#8b5cf6' },
    { value: 'transporte', label: 'Transporte', icon: <DirectionsCarIcon />, color: '#10b981' },
    { value: 'donacion', label: 'Donación', icon: <CardGiftcardIcon />, color: '#f59e0b' },
    { value: 'otro', label: 'Otro', icon: <HelpIcon />, color: '#6b7280' }
  ];

  const urgencyLevels = [
    { value: 'baja', label: 'Baja', color: '#10b981' },
    { value: 'normal', label: 'Normal', color: '#3b82f6' },
    { value: 'alta', label: 'Alta', color: '#f59e0b' },
    { value: 'emergencia', label: 'Emergencia', color: '#ef4444' }
  ];

  const getFilteredRequests = () => {
    let filtered = helpRequests;

    if (filter === 'my-requests') {
      filtered = getMyRequests();
    } else if (filter === 'my-offers') {
      filtered = getMyOffers();
    } else if (filter !== 'all') {
      filtered = filtered.filter(r => r.status === filter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(r => r.type === typeFilter);
    }

    return filtered.sort((a, b) => {
      const urgencyOrder = { emergencia: 0, alta: 1, normal: 2, baja: 3 };
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    });
  };

  const filteredRequests = getFilteredRequests();

  const handleCreateRequest = () => {
    if (!newRequest.title || !newRequest.description) return;

    const result = createHelpRequest(newRequest);
    if (result.success) {
      addPoints('HELP_REQUEST');
      updateActivity('helpRequestsCreated');
      setShowCreateModal(false);
      setNewRequest({
        type: 'prestamo',
        title: '',
        description: '',
        urgency: 'normal',
        location: ''
      });
      navigate(`/ayuda/${result.request.slug}`);
    }
  };

  const handleOfferHelp = () => {
    if (!offerData.message || !selectedRequest) return;

    offerHelp(selectedRequest.id, offerData);
    addPoints('HELP_OFFERED');
    updateActivity('helpOffered');
    setShowOfferModal(false);
    setOfferData({ message: '', availability: '' });
    setSelectedRequest(null);
  };

  const handleAcceptOffer = (requestId, offerId) => {
    acceptOffer(requestId, offerId);
    setShowDetailsModal(false);
  };

  const handleResolveRequest = (requestId) => {
    resolveRequest(requestId);
    addPoints('HELP_COMPLETED');
    setShowDetailsModal(false);
  };

  const openOfferModal = (request) => {
    setSelectedRequest(request);
    setShowOfferModal(true);
  };

  const openDetailsModal = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    return `Hace ${diffDays}d`;
  };

  return (
    <div className={`help-requests-page ${isRightSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {!hideHeader && (
        <div className="help-header">
          <div className="help-title">
            <h1><HandshakeIcon className="page-title-icon" /> Ayuda Mutua</h1>
            <p>Red de apoyo entre vecinos - Juntos somos más fuertes</p>
          </div>
          <button className="create-help-btn" onClick={() => setShowCreateModal(true)}>
            <AddIcon /> Solicitar Ayuda
          </button>
        </div>
      )}

      <div className="help-stats">
        {!hideStats && (
          <>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#dbeafe' }}>
                <BarChartIcon style={{ fontSize: '28px', color: '#3b82f6' }} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{formatNumber(helpRequests.length)}</span>
                <span className="stat-label">Solicitudes Totales</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#dcfce7' }}>
                <CheckCircleIcon style={{ fontSize: '28px', color: '#10b981' }} />
              </div>
              <div className="stat-info">
                <span className="stat-value">
                  {formatNumber(helpRequests.filter(r => r.status === 'resuelta').length)}
                </span>
                <span className="stat-label">Ayudas Completadas</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#fef3c7' }}>
                <LoopIcon style={{ fontSize: '28px', color: '#f59e0b' }} />
              </div>
              <div className="stat-info">
                <span className="stat-value">
                  {formatNumber(helpRequests.filter(r => r.status === 'abierta').length)}
                </span>
                <span className="stat-label">Necesitan Ayuda</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#fee2e2' }}>
                <WarningIcon style={{ fontSize: '28px', color: '#ef4444' }} />
              </div>
              <div className="stat-info">
                <span className="stat-value">
                  {formatNumber(helpRequests.filter(r => r.urgency === 'emergencia').length)}
                </span>
                <span className="stat-label">Emergencias</span>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="help-filters">
        <div className="status-filters">
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
          >
            Todas
          </button>
          <button 
            className={filter === 'abierta' ? 'active' : ''} 
            onClick={() => setFilter('abierta')}
          >
            Abiertas
          </button>
          <button 
            className={filter === 'en_proceso' ? 'active' : ''} 
            onClick={() => setFilter('en_proceso')}
          >
            En Proceso
          </button>
          <button 
            className={filter === 'resuelta' ? 'active' : ''} 
            onClick={() => setFilter('resuelta')}
          >
            Resueltas
          </button>
          <button 
            className={filter === 'my-requests' ? 'active' : ''} 
            onClick={() => setFilter('my-requests')}
          >
            Mis Solicitudes
          </button>
          <button 
            className={filter === 'my-offers' ? 'active' : ''} 
            onClick={() => setFilter('my-offers')}
          >
            Mis Ofertas
          </button>
        </div>

        <div className="type-filters">
          {types.map(type => (
            <button
              key={type.value}
              className={`type-filter-btn ${typeFilter === type.value ? 'active' : ''}`}
              onClick={() => setTypeFilter(type.value)}
              style={typeFilter === type.value ? { 
                background: type.color + '20', 
                borderColor: type.color,
                color: type.color 
              } : {}}
            >
              <span className="type-icon">{type.icon}</span>
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div className="help-requests-grid">
        {filteredRequests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <HandshakeIcon style={{ fontSize: '64px', opacity: 0.3 }} />
            </div>
            <h3>No hay solicitudes</h3>
            <p>Sé el primero en solicitar o ofrecer ayuda</p>
          </div>
        ) : (
          filteredRequests.map(request => {
            const typeInfo = types.find(t => t.value === request.type);
            const urgencyInfo = urgencyLevels.find(u => u.value === request.urgency);
            const isMyRequest = request.requesterId === user?.id;
            const hasOffered = request.offers.some(o => o.helperId === user?.id);

            return (
              <div
                key={request.id}
                className={`help-request-card urgency-${request.urgency}`}
                onClick={() => navigate(`/ayuda/${request.slug}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="request-card-header">
                  <div className="request-type-badge" style={{ background: typeInfo?.color + '20', color: typeInfo?.color }}>
                    <span className="type-icon">{typeInfo?.icon}</span>
                    {typeInfo?.label}
                  </div>
                  <div className="request-urgency-badge" style={{ background: urgencyInfo?.color }}>
                    {urgencyInfo?.label}
                  </div>
                </div>

                <h3 className="request-title">{request.title}</h3>
                <p className="request-description">{request.description}</p>

                {request.location && (
                  <div className="request-location">
                    <LocationOnIcon fontSize="small" />
                    <span>{request.location}</span>
                  </div>
                )}

                <div className="request-meta-info">
                  <div className="requester-info">
                    <img src={request.requesterAvatar} alt={request.requesterName} />
                    <div>
                      <span className="requester-name">{request.requesterName}</span>
                      <span className="request-time">
                        <AccessTimeIcon fontSize="small" />
                        {getTimeAgo(request.createdAt)}
                      </span>
                    </div>
                  </div>
                  <span className="request-neighborhood">{request.neighborhoodName}</span>
                </div>

                {request.offers.length > 0 && (
                  <div className="offers-indicator">
                    <PersonIcon fontSize="small" />
                    <span>{request.offers.length} {request.offers.length === 1 ? 'persona ofrece' : 'personas ofrecen'} ayuda</span>
                  </div>
                )}

                <div className="request-card-actions" onClick={(e) => e.stopPropagation()}>
                  {request.status === 'abierta' && !isMyRequest && !hasOffered && (
                    <button 
                      className="offer-help-btn"
                      onClick={() => openOfferModal(request)}
                    >
                      <HelpOutlineIcon fontSize="small" />
                      Ofrecer Ayuda
                    </button>
                  )}
                  {hasOffered && (
                    <div className="offered-badge">
                      <CheckCircleIcon fontSize="small" />
                      Ya ofreciste ayuda
                    </div>
                  )}
                  {isMyRequest && request.status === 'abierta' && (
                    <button 
                      className="cancel-request-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        cancelRequest(request.id);
                      }}
                    >
                      Cancelar Solicitud
                    </button>
                  )}
                  {isMyRequest && request.status === 'en_proceso' && (
                    <button 
                      className="resolve-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResolveRequest(request.id);
                      }}
                    >
                      <CheckCircleIcon fontSize="small" />
                      Marcar como Resuelta
                    </button>
                  )}
                </div>

                <div className={`status-indicator status-${request.status}`}>
                  {request.status === 'abierta' && (
                    <>
                      <LockOpenIcon fontSize="small" /> Abierta
                    </>
                  )}
                  {request.status === 'en_proceso' && (
                    <>
                      <LoopIcon fontSize="small" /> En Proceso
                    </>
                  )}
                  {request.status === 'resuelta' && (
                    <>
                      <CheckCircleIcon fontSize="small" /> Resuelta
                    </>
                  )}
                  {request.status === 'cancelada' && (
                    <>
                      <CancelIcon fontSize="small" /> Cancelada
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Crear Solicitud */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Solicitar Ayuda</h2>
              <button className="close-modal" onClick={() => setShowCreateModal(false)}>
                <CloseIcon />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Tipo de Ayuda</label>
                <div className="type-selector">
                  {types.filter(t => t.value !== 'all').map(type => (
                    <button
                      key={type.value}
                      className={`type-option ${newRequest.type === type.value ? 'selected' : ''}`}
                      onClick={() => setNewRequest({...newRequest, type: type.value})}
                      style={newRequest.type === type.value ? { 
                        background: type.color + '20', 
                        borderColor: type.color 
                      } : {}}
                    >
                      <span className="type-icon">{type.icon}</span>
                      <span>{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Nivel de Urgencia</label>
                <div className="urgency-selector">
                  {urgencyLevels.map(level => (
                    <button
                      key={level.value}
                      className={`urgency-option ${newRequest.urgency === level.value ? 'selected' : ''}`}
                      onClick={() => setNewRequest({...newRequest, urgency: level.value})}
                      style={newRequest.urgency === level.value ? { 
                        background: level.color,
                        color: 'white'
                      } : {}}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Título</label>
                <input
                  type="text"
                  value={newRequest.title}
                  onChange={(e) => setNewRequest({...newRequest, title: e.target.value})}
                  placeholder="Ej: Necesito ayuda para mover muebles"
                />
              </div>

              <div className="form-group">
                <label>Descripción Detallada</label>
                <textarea
                  value={newRequest.description}
                  onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
                  placeholder="Describe qué necesitas y cualquier detalle importante..."
                  rows="5"
                />
              </div>

              <div className="form-group">
                <label>Ubicación (Opcional)</label>
                <input
                  type="text"
                  value={newRequest.location}
                  onChange={(e) => setNewRequest({...newRequest, location: e.target.value})}
                  placeholder="Ej: Calle Principal #123"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowCreateModal(false)}>
                Cancelar
              </button>
              <button className="submit-btn" onClick={handleCreateRequest}>
                Publicar Solicitud
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ofrecer Ayuda */}
      {showOfferModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowOfferModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Ofrecer Ayuda</h2>
              <button className="close-modal" onClick={() => setShowOfferModal(false)}>
                <CloseIcon />
              </button>
            </div>

            <div className="modal-body">
              <div className="request-summary">
                <h3>{selectedRequest.title}</h3>
                <p>{selectedRequest.description}</p>
              </div>

              <div className="form-group">
                <label>Tu Mensaje</label>
                <textarea
                  value={offerData.message}
                  onChange={(e) => setOfferData({...offerData, message: e.target.value})}
                  placeholder="Explica cómo puedes ayudar..."
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label>Tu Disponibilidad</label>
                <input
                  type="text"
                  value={offerData.availability}
                  onChange={(e) => setOfferData({...offerData, availability: e.target.value})}
                  placeholder="Ej: Disponible hoy después de las 18:00"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowOfferModal(false)}>
                Cancelar
              </button>
              <button className="submit-btn" onClick={handleOfferHelp}>
                Enviar Oferta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalles */}
      {showDetailsModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalles de la Solicitud</h2>
              <button className="close-modal" onClick={() => setShowDetailsModal(false)}>
                <CloseIcon />
              </button>
            </div>

            <div className="modal-body">
              <div className="request-full-details">
                <div className="detail-header">
                  <div className="detail-type" style={{ 
                    background: types.find(t => t.value === selectedRequest.type)?.color + '20',
                    color: types.find(t => t.value === selectedRequest.type)?.color
                  }}>
                    {types.find(t => t.value === selectedRequest.type)?.icon}
                    {types.find(t => t.value === selectedRequest.type)?.label}
                  </div>
                  <div className="detail-urgency" style={{ 
                    background: urgencyLevels.find(u => u.value === selectedRequest.urgency)?.color
                  }}>
                    {urgencyLevels.find(u => u.value === selectedRequest.urgency)?.label}
                  </div>
                </div>

                <h3>{selectedRequest.title}</h3>
                <p className="detail-description">{selectedRequest.description}</p>

                <div className="detail-info-grid">
                  <div className="info-item">
                    <PersonIcon />
                    <div>
                      <span className="info-label">Solicitante</span>
                      <span className="info-value">{selectedRequest.requesterName}</span>
                    </div>
                  </div>
                  {selectedRequest.requesterPhone && (
                    <div className="info-item">
                      <PhoneIcon />
                      <div>
                        <span className="info-label">Teléfono</span>
                        <span className="info-value">{selectedRequest.requesterPhone}</span>
                      </div>
                    </div>
                  )}
                  {selectedRequest.location && (
                    <div className="info-item">
                      <LocationOnIcon />
                      <div>
                        <span className="info-label">Ubicación</span>
                        <span className="info-value">{selectedRequest.location}</span>
                      </div>
                    </div>
                  )}
                  <div className="info-item">
                    <AccessTimeIcon />
                    <div>
                      <span className="info-label">Publicado</span>
                      <span className="info-value">{getTimeAgo(selectedRequest.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {selectedRequest.offers.length > 0 && (
                  <div className="offers-section">
                    <h4>Ofertas de Ayuda ({selectedRequest.offers.length})</h4>
                    <div className="offers-list">
                      {selectedRequest.offers.map(offer => (
                        <div key={offer.id} className="offer-item">
                          <img src={offer.helperAvatar} alt={offer.helperName} />
                          <div className="offer-content">
                            <div className="offer-header">
                              <span className="offer-name">{offer.helperName}</span>
                              <span className="offer-time">{getTimeAgo(offer.createdAt)}</span>
                            </div>
                            <p className="offer-message">{offer.message}</p>
                            <p className="offer-availability">
                              <AccessTimeIcon fontSize="small" />
                              {offer.availability}
                            </p>
                            {selectedRequest.requesterId === user?.id && 
                             selectedRequest.status === 'abierta' && 
                             !selectedRequest.acceptedOfferId && (
                              <button 
                                className="accept-offer-btn"
                                onClick={() => handleAcceptOffer(selectedRequest.id, offer.id)}
                              >
                                <CheckCircleIcon fontSize="small" />
                                Aceptar Oferta
                              </button>
                            )}
                            {selectedRequest.acceptedOfferId === offer.id && (
                              <div className="accepted-badge">
                                <CheckCircleIcon fontSize="small" />
                                Oferta Aceptada
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowDetailsModal(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpRequests;
