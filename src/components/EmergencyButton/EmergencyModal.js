import React, { useState } from 'react';
import MediaCapture from './MediaCapture';
import './EmergencyModal.css';

// Material UI Icons
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const EmergencyModal = ({ emergencyData, onSend, onCancel }) => {
  const [message, setMessage] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const emergencyDetails = {
        message: message || 'Emergencia reportada',
        mediaFile: mediaFile,
        isAnonymous: isAnonymous,
        // Si es anónimo, no enviar datos del usuario
        userName: isAnonymous ? 'Reporte Anónimo' : emergencyData.userName,
        userId: isAnonymous ? null : emergencyData.userId
      };
      
      await onSend(emergencyDetails);
    } catch (error) {
      console.error('Error sending emergency:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatLocation = (location) => {
    if (!location) return 'Ubicación no disponible';
    return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
  };

  return (
    <div className="emergency-modal-overlay">
      <div className="emergency-modal">
        <div className="emergency-modal-header">
          <h2>🚨 Alerta de Emergencia</h2>
          <p>Se enviará a todos los residentes de tu unidad vecinal</p>
        </div>
        
        <div className="emergency-modal-content">
          <div className="emergency-info">
            <div className="info-item">
              <AccessTimeIcon className="info-icon" />
              <span><strong>Hora:</strong> {new Date(emergencyData.timestamp).toLocaleString()}</span>
            </div>
            
            {emergencyData.location && (
              <div className="info-item">
                <LocationOnIcon className="info-icon" />
                <span><strong>Ubicación:</strong> {formatLocation(emergencyData.location)}</span>
              </div>
            )}
          </div>

          {/* Opción de anonimato */}
          <div className="anonymity-section">
            <div className="anonymity-toggle">
              <input
                type="checkbox"
                id="anonymous-toggle"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                disabled={isLoading}
              />
              <label htmlFor="anonymous-toggle" className="toggle-label">
                {isAnonymous ? (
                  <>
                    <VisibilityOffIcon className="toggle-icon" />
                    <span>Reporte Anónimo</span>
                  </>
                ) : (
                  <>
                    <PersonIcon className="toggle-icon" />
                    <span>Incluir mi nombre y dirección</span>
                  </>
                )}
              </label>
            </div>
            <p className="anonymity-description">
              {isAnonymous 
                ? 'Tu identidad no será revelada en la alerta'
                : 'Tu nombre aparecerá en la alerta para que los vecinos puedan contactarte'
              }
            </p>
          </div>
          
          <div className="message-section">
            <label htmlFor="emergency-message">Describe la emergencia (opcional):</label>
            <textarea
              id="emergency-message"
              placeholder="Ej: Incendio en el edificio, robo en progreso, accidente..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={200}
              rows={3}
              disabled={isLoading}
            />
            <div className="character-count">
              {message.length}/200 caracteres
            </div>
          </div>
          
          <MediaCapture
            onMediaCaptured={setMediaFile}
            isCapturing={isCapturing}
            setIsCapturing={setIsCapturing}
            disabled={isLoading}
          />
          
          {mediaFile && (
            <div className="media-preview">
              <div className="media-preview-header">
                <span>Archivo adjunto:</span>
                <button 
                  className="remove-media-btn"
                  onClick={() => setMediaFile(null)}
                  disabled={isLoading}
                >
                  ×
                </button>
              </div>
              {mediaFile.type.startsWith('image/') ? (
                <img 
                  src={URL.createObjectURL(mediaFile)} 
                  alt="Emergency" 
                  className="media-preview-image"
                />
              ) : (
                <video 
                  src={URL.createObjectURL(mediaFile)} 
                  controls 
                  className="media-preview-video"
                />
              )}
            </div>
          )}
        </div>
        
        <div className="emergency-modal-actions">
          <button 
            className="emergency-cancel-btn"
            onClick={onCancel}
            disabled={isCapturing || isLoading}
          >
            Cancelar
          </button>
          <button 
            className="emergency-send-btn"
            onClick={handleSend}
            disabled={isCapturing || isLoading}
          >
            {isLoading ? (
              <>
                <div className="loading-spinner"></div>
                Enviando...
              </>
            ) : (
              <>🚨 Enviar Alerta</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmergencyModal;