import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { formatNumber } from '../../utils/formatNumber';

const ReserveResourceModal = ({ 
  show, 
  onClose, 
  selectedResource, 
  reservationData, 
  setReservationData, 
  onSubmit 
}) => {
  if (!show || !selectedResource) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Solicitar Préstamo</h2>
          <button className="close-modal" onClick={onClose}>
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
          <button className="cancel-btn" onClick={onClose}>
            Cancelar
          </button>
          <button className="submit-btn" onClick={onSubmit}>
            Enviar Solicitud
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReserveResourceModal;