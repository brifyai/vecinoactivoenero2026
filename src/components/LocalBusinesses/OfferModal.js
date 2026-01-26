import React from 'react';
import CloseIcon from '@mui/icons-material/Close';

const OfferModal = ({ 
  show, 
  onClose, 
  selectedBusiness, 
  newOffer, 
  setNewOffer, 
  onSubmit 
}) => {
  if (!show || !selectedBusiness) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Crear Oferta</h2>
          <button className="close-modal" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Título de la Oferta</label>
            <input
              type="text"
              value={newOffer.title}
              onChange={(e) => setNewOffer({...newOffer, title: e.target.value})}
              placeholder="Ej: 20% de descuento"
            />
          </div>

          <div className="form-group">
            <label>Descripción</label>
            <textarea
              value={newOffer.description}
              onChange={(e) => setNewOffer({...newOffer, description: e.target.value})}
              placeholder="Detalles de la oferta..."
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Descuento</label>
              <input
                type="text"
                value={newOffer.discount}
                onChange={(e) => setNewOffer({...newOffer, discount: e.target.value})}
                placeholder="20%"
              />
            </div>
            <div className="form-group">
              <label>Válido Hasta</label>
              <input
                type="date"
                value={newOffer.validUntil}
                onChange={(e) => setNewOffer({...newOffer, validUntil: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Código (Opcional)</label>
            <input
              type="text"
              value={newOffer.code}
              onChange={(e) => setNewOffer({...newOffer, code: e.target.value})}
              placeholder="VECINO20"
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancelar
          </button>
          <button className="submit-btn" onClick={onSubmit}>
            Crear Oferta
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfferModal;