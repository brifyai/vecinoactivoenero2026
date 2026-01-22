import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocalNeeds } from '../../context/LocalNeedsContext';
import { showSuccessToast, showErrorToast } from '../../utils/sweetalert';
import CloseIcon from '@mui/icons-material/Close';
import './RespondNeedModal.css';

const RespondNeedModal = ({ need, onClose, onSuccess }) => {
  const { user } = useAuth();
  const { respondToNeed } = useLocalNeeds();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      showErrorToast('Por favor escribe un mensaje');
      return;
    }

    setLoading(true);

    try {
      const result = respondToNeed(need.id, user.id, message);

      if (result.success) {
        showSuccessToast('¡Respuesta enviada! El creador será notificado');
        onSuccess();
      } else {
        showErrorToast(result.error || 'Error al enviar respuesta');
      }
    } catch (error) {
      showErrorToast('Error al enviar respuesta');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content respond-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Responder a Necesidad</h2>
          <button className="close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="need-preview">
          <h3>{need.title}</h3>
          <p>{need.description}</p>
        </div>

        <form onSubmit={handleSubmit} className="respond-form">
          <div className="form-group">
            <label>Tu Mensaje</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Cuéntale cómo puedes ayudar o qué tienes para ofrecer..."
              className="form-input textarea"
              rows="5"
              maxLength="500"
              disabled={loading}
            />
            <span className="char-count">{message.length}/500</span>
          </div>

          <div className="form-info">
            <p>
              💡 <strong>Consejo:</strong> Sé específico sobre cómo puedes ayudar. 
              Incluye tu disponibilidad y forma de contacto si es necesario.
            </p>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={loading || !message.trim()}
            >
              {loading ? 'Enviando...' : 'Enviar Respuesta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RespondNeedModal;
