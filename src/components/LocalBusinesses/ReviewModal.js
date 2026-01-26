import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';

const ReviewModal = ({ 
  show, 
  onClose, 
  selectedBusiness, 
  newReview, 
  setNewReview, 
  onSubmit 
}) => {
  if (!show || !selectedBusiness) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Dejar Reseña</h2>
          <button className="close-modal" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="modal-body">
          <div className="business-summary">
            <h3>{selectedBusiness.name}</h3>
            <p>{selectedBusiness.description}</p>
          </div>

          <div className="form-group">
            <label>Calificación</label>
            <div className="rating-selector">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  className="star-btn"
                  onClick={() => setNewReview({...newReview, rating: star})}
                >
                  <StarIcon 
                    fontSize="large"
                    style={{ color: star <= newReview.rating ? '#f59e0b' : '#e4e6eb' }}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Tu Reseña</label>
            <textarea
              value={newReview.comment}
              onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
              placeholder="Comparte tu experiencia..."
              rows="5"
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancelar
          </button>
          <button className="submit-btn" onClick={onSubmit}>
            Publicar Reseña
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;