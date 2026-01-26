import React, { useState } from 'react';
import { useReduxAuth as useAuth } from '../../hooks/useReduxAuth';
import { useReduxSecurity } from '../../hooks/useReduxSecurity';
import { showSuccessToast, showErrorToast } from '../../utils/sweetalert';
import CloseIcon from '@mui/icons-material/Close';
import './CreateSecurityReport.css';

const CreateSecurityReport = ({ onClose, defaultLocation }) => {
  const { user } = useAuth();
  const { createReport } = useReduxSecurity();
  
  const [formData, setFormData] = useState({
    type: 'robo',
    title: '',
    description: '',
    lat: defaultLocation?.lat || -33.4489,
    lng: defaultLocation?.lng || -70.6693,
    useCurrentLocation: false
  });

  const reportTypes = [
    { value: 'robo', label: '🏠 Robo', color: '#ef4444' },
    { value: 'sospechoso', label: '👤 Persona Sospechosa', color: '#f59e0b' },
    { value: 'vehiculo', label: '🚗 Vehículo Sospechoso', color: '#eab308' },
    { value: 'vandalismo', label: '💥 Vandalismo', color: '#f97316' },
    { value: 'emergencia', label: '🆘 Emergencia', color: '#dc2626' },
    { value: 'otro', label: '⚠️ Otro', color: '#6b7280' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      setFormData(prev => ({ ...prev, useCurrentLocation: true }));
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            useCurrentLocation: false
          }));
          showSuccessToast('Ubicación obtenida correctamente');
        },
        (error) => {
          setFormData(prev => ({ ...prev, useCurrentLocation: false }));
          showErrorToast('No se pudo obtener la ubicación');
          console.error('Error getting location:', error);
        }
      );
    } else {
      showErrorToast('Tu navegador no soporta geolocalización');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      showErrorToast('Por favor ingresa un título');
      return;
    }

    if (!formData.description.trim()) {
      showErrorToast('Por favor describe lo que pasó');
      return;
    }

    const newReport = {
      type: formData.type,
      title: formData.title,
      description: formData.description,
      lat: formData.lat,
      lng: formData.lng,
      neighborhoodId: user.neighborhoodId || null
    };

    createReport(newReport);
    showSuccessToast('¡Reporte creado exitosamente!');
    onClose();
  };

  const selectedType = reportTypes.find(t => t.value === formData.type);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="create-report-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🚨 Reportar Incidente de Seguridad</h2>
          <button className="close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="report-form">
          {/* Tipo de reporte */}
          <div className="form-group">
            <label>Tipo de Incidente</label>
            <div className="report-types">
              {reportTypes.map(type => (
                <button
                  key={type.value}
                  type="button"
                  className={`type-btn ${formData.type === type.value ? 'active' : ''}`}
                  style={{
                    borderColor: formData.type === type.value ? type.color : 'var(--outline-variant)',
                    backgroundColor: formData.type === type.value ? `${type.color}15` : 'transparent'
                  }}
                  onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Título */}
          <div className="form-group">
            <label htmlFor="title">Título del Reporte *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ej: Intento de robo a vehículo"
              maxLength={100}
              required
            />
            <small>{formData.title.length}/100 caracteres</small>
          </div>

          {/* Descripción */}
          <div className="form-group">
            <label htmlFor="description">Descripción Detallada *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe lo que pasó, cuándo, dónde exactamente, características de personas o vehículos, etc."
              rows={5}
              maxLength={500}
              required
            />
            <small>{formData.description.length}/500 caracteres</small>
          </div>

          {/* Ubicación */}
          <div className="form-group">
            <label>Ubicación</label>
            <div className="location-input">
              <div className="coordinates">
                <input
                  type="number"
                  name="lat"
                  value={formData.lat}
                  onChange={handleChange}
                  placeholder="Latitud"
                  step="0.000001"
                />
                <input
                  type="number"
                  name="lng"
                  value={formData.lng}
                  onChange={handleChange}
                  placeholder="Longitud"
                  step="0.000001"
                />
              </div>
              <button
                type="button"
                className="location-btn"
                onClick={handleGetCurrentLocation}
                disabled={formData.useCurrentLocation}
              >
                {formData.useCurrentLocation ? '📍 Obteniendo...' : '📍 Usar mi ubicación actual'}
              </button>
            </div>
            <small className="location-help">
              Puedes usar tu ubicación actual o ingresar coordenadas manualmente
            </small>
          </div>

          {/* Vista previa */}
          <div className="report-preview">
            <h4>Vista Previa</h4>
            <div className="preview-card" style={{ borderLeftColor: selectedType.color }}>
              <div className="preview-header">
                <span className="preview-type" style={{ backgroundColor: `${selectedType.color}15`, color: selectedType.color }}>
                  {selectedType.label}
                </span>
                <span className="preview-time">Justo ahora</span>
              </div>
              <h5>{formData.title || 'Título del reporte'}</h5>
              <p>{formData.description || 'Descripción del incidente...'}</p>
              <div className="preview-footer">
                <span>📍 Lat: {formData.lat.toFixed(4)}, Lng: {formData.lng.toFixed(4)}</span>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-submit">
              Publicar Reporte
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSecurityReport;
