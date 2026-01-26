import React, { useState, useEffect } from 'react';
import { useReduxEmergency } from '../../hooks/useReduxEmergency';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/selectors/authSelectors';
import './EmergencyManagement.css';

// Material UI Icons
import WarningIcon from '@mui/icons-material/Warning';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ImageIcon from '@mui/icons-material/Image';
import VideoFileIcon from '@mui/icons-material/VideoFile';

const EmergencyManagement = () => {
  const currentUser = useSelector(selectUser);
  const {
    emergencies,
    activeEmergencies,
    recentEmergencies,
    isLoadingHistory,
    historyError,
    stats,
    getEmergencyHistory,
    resolveEmergency,
    emergencyMetrics
  } = useReduxEmergency();

  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [filter, setFilter] = useState('all'); // all, active, resolved

  useEffect(() => {
    // Cargar historial de emergencias al montar el componente
    if (currentUser?.neighborhood_id) {
      getEmergencyHistory(currentUser.neighborhood_id, 100);
    }
  }, [currentUser, getEmergencyHistory]);

  const handleResolveEmergency = async (emergencyId) => {
    if (!resolutionNotes.trim()) {
      alert('Por favor, agrega notas de resolución');
      return;
    }

    setIsResolving(true);
    try {
      await resolveEmergency(emergencyId, resolutionNotes, currentUser.id);
      setSelectedEmergency(null);
      setResolutionNotes('');
      alert('Emergencia marcada como resuelta');
    } catch (error) {
      console.error('Error resolviendo emergencia:', error);
      alert('Error al resolver la emergencia');
    } finally {
      setIsResolving(false);
    }
  };

  const getFilteredEmergencies = () => {
    switch (filter) {
      case 'active':
        return emergencies.filter(e => e.status === 'active');
      case 'resolved':
        return emergencies.filter(e => e.status === 'resolved');
      default:
        return emergencies;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-CL');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return '#ff4444';
      case 'resolved':
        return '#28a745';
      case 'false_alarm':
        return '#ffc107';
      default:
        return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Activa';
      case 'resolved':
        return 'Resuelta';
      case 'false_alarm':
        return 'Falsa Alarma';
      default:
        return 'Desconocido';
    }
  };

  if (isLoadingHistory) {
    return (
      <div className="emergency-management">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Cargando emergencias...</p>
        </div>
      </div>
    );
  }

  if (historyError) {
    return (
      <div className="emergency-management">
        <div className="error-state">
          <WarningIcon className="error-icon" />
          <h3>Error al cargar emergencias</h3>
          <p>{historyError}</p>
          <button 
            className="retry-btn"
            onClick={() => getEmergencyHistory(currentUser?.neighborhood_id, 100)}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="emergency-management">
      <div className="emergency-header">
        <h1>🚨 Gestión de Emergencias</h1>
        <p>Panel de control para alertas de emergencia de la comunidad</p>
      </div>

      {/* Estadísticas */}
      <div className="emergency-stats">
        <div className="stat-card total">
          <div className="stat-number">{emergencyMetrics.total}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-card active">
          <div className="stat-number">{emergencyMetrics.active}</div>
          <div className="stat-label">Activas</div>
        </div>
        <div className="stat-card resolved">
          <div className="stat-number">{emergencyMetrics.resolved}</div>
          <div className="stat-label">Resueltas</div>
        </div>
        <div className="stat-card recent">
          <div className="stat-number">{emergencyMetrics.recentCount}</div>
          <div className="stat-label">Últimas 24h</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="emergency-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Todas ({emergencies.length})
        </button>
        <button 
          className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Activas ({activeEmergencies.length})
        </button>
        <button 
          className={`filter-btn ${filter === 'resolved' ? 'active' : ''}`}
          onClick={() => setFilter('resolved')}
        >
          Resueltas ({emergencies.filter(e => e.status === 'resolved').length})
        </button>
      </div>

      {/* Lista de emergencias */}
      <div className="emergency-list">
        {getFilteredEmergencies().length === 0 ? (
          <div className="empty-state">
            <WarningIcon className="empty-icon" />
            <h3>No hay emergencias</h3>
            <p>No se encontraron emergencias con los filtros seleccionados.</p>
          </div>
        ) : (
          getFilteredEmergencies().map((emergency) => (
            <div key={emergency.id} className="emergency-card">
              <div className="emergency-card-header">
                <div className="emergency-info">
                  <div className="emergency-title">
                    <WarningIcon className="emergency-icon" />
                    <span>Emergencia #{emergency.id.slice(-8)}</span>
                    <div 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(emergency.status) }}
                    >
                      {getStatusText(emergency.status)}
                    </div>
                  </div>
                  <div className="emergency-meta">
                    <div className="meta-item">
                      <AccessTimeIcon className="meta-icon" />
                      <span>{formatDate(emergency.timestamp)}</span>
                    </div>
                    <div className="meta-item">
                      {emergency.is_anonymous ? (
                        <>
                          <VisibilityOffIcon className="meta-icon" />
                          <span>Reporte Anónimo</span>
                        </>
                      ) : (
                        <>
                          <PersonIcon className="meta-icon" />
                          <span>{emergency.user_name}</span>
                        </>
                      )}
                    </div>
                    {emergency.location && (
                      <div className="meta-item">
                        <LocationOnIcon className="meta-icon" />
                        <span>
                          {emergency.location.latitude.toFixed(4)}, {emergency.location.longitude.toFixed(4)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {emergency.status === 'active' && (
                  <button
                    className="resolve-btn"
                    onClick={() => setSelectedEmergency(emergency)}
                  >
                    <CheckCircleIcon />
                    Resolver
                  </button>
                )}
              </div>

              <div className="emergency-content">
                <div className="emergency-message">
                  <strong>Mensaje:</strong>
                  <p>{emergency.message || 'Sin mensaje específico'}</p>
                </div>

                {emergency.media_url && (
                  <div className="emergency-media">
                    <strong>Archivo adjunto:</strong>
                    <div className="media-preview">
                      {emergency.media_url.includes('image') || emergency.media_url.includes('.jpg') || emergency.media_url.includes('.png') ? (
                        <div className="media-item">
                          <ImageIcon className="media-icon" />
                          <a href={emergency.media_url} target="_blank" rel="noopener noreferrer">
                            Ver imagen
                          </a>
                        </div>
                      ) : (
                        <div className="media-item">
                          <VideoFileIcon className="media-icon" />
                          <a href={emergency.media_url} target="_blank" rel="noopener noreferrer">
                            Ver video
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {emergency.status === 'resolved' && emergency.resolution_notes && (
                  <div className="resolution-info">
                    <strong>Resolución:</strong>
                    <p>{emergency.resolution_notes}</p>
                    <small>
                      Resuelto el {formatDate(emergency.resolved_at)} 
                      {emergency.resolved_by && ` por ${emergency.resolved_by}`}
                    </small>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de resolución */}
      {selectedEmergency && (
        <div className="resolution-modal-overlay">
          <div className="resolution-modal">
            <div className="resolution-modal-header">
              <h3>Resolver Emergencia</h3>
              <button 
                className="close-btn"
                onClick={() => setSelectedEmergency(null)}
              >
                ×
              </button>
            </div>
            
            <div className="resolution-modal-content">
              <div className="emergency-summary">
                <p><strong>Emergencia:</strong> #{selectedEmergency.id.slice(-8)}</p>
                <p><strong>Reportado por:</strong> {selectedEmergency.is_anonymous ? 'Anónimo' : selectedEmergency.user_name}</p>
                <p><strong>Fecha:</strong> {formatDate(selectedEmergency.timestamp)}</p>
                <p><strong>Mensaje:</strong> {selectedEmergency.message || 'Sin mensaje'}</p>
              </div>
              
              <div className="resolution-form">
                <label htmlFor="resolution-notes">Notas de resolución:</label>
                <textarea
                  id="resolution-notes"
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Describe cómo se resolvió la emergencia..."
                  rows={4}
                  disabled={isResolving}
                />
              </div>
            </div>
            
            <div className="resolution-modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => setSelectedEmergency(null)}
                disabled={isResolving}
              >
                Cancelar
              </button>
              <button 
                className="resolve-confirm-btn"
                onClick={() => handleResolveEmergency(selectedEmergency.id)}
                disabled={isResolving || !resolutionNotes.trim()}
              >
                {isResolving ? (
                  <>
                    <div className="loading-spinner small"></div>
                    Resolviendo...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon />
                    Marcar como Resuelta
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyManagement;