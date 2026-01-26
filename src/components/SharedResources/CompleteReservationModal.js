import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import StarIcon from '@mui/icons-material/Star';

const CompleteReservationModal = ({ 
  show, 
  onClose, 
  selectedReservation, 
  completeData, 
  setCompleteData, 
  onSubmit 
}) => {
  if (!show || !selectedReservation) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Completar Préstamo</h2>
          <button className="close-modal" onClick={onClose}>
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
          <button className="cancel-btn" onClick={onClose}>
            Cancelar
          </button>
          <button className="submit-btn" onClick={onSubmit}>
            Completar Préstamo
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompleteReservationModal;