import React, { useState } from 'react';
import { useReports } from '../../context/ReportsContext';
import { showSuccessToast, showErrorToast } from '../../utils/sweetalert';
import ReportIcon from '@mui/icons-material/Report';
import CloseIcon from '@mui/icons-material/Close';
import './ReportModal.css';

const ReportModal = ({ isOpen, onClose, targetType, targetId, targetInfo = {} }) => {
  const { reportContent } = useReports();
  const [formData, setFormData] = useState({
    reason: '',
    description: ''
  });

  if (!isOpen) return null;

  const reasons = {
    post: [
      'Contenido inapropiado',
      'Spam o publicidad',
      'Información falsa',
      'Acoso o bullying',
      'Contenido violento',
      'Otro'
    ],
    comment: [
      'Comentario ofensivo',
      'Spam',
      'Acoso',
      'Información falsa',
      'Otro'
    ],
    user: [
      'Perfil falso',
      'Suplantación de identidad',
      'Comportamiento inapropiado',
      'Acoso',
      'Spam',
      'Otro'
    ]
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.reason) {
      showErrorToast('Por favor selecciona un motivo');
      return;
    }

    const result = reportContent({
      type: targetType,
      targetId,
      targetType,
      reason: formData.reason,
      description: formData.description
    });

    if (result.success) {
      showSuccessToast('Reporte enviado correctamente. Lo revisaremos pronto.');
      onClose();
      setFormData({ reason: '', description: '' });
    } else {
      showErrorToast('Error al enviar el reporte');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="report-modal" onClick={(e) => e.stopPropagation()}>
        <div className="report-modal-header">
          <div className="report-modal-title">
            <ReportIcon style={{ color: '#dc2626', fontSize: 24 }} />
            <h2>Reportar {targetType === 'post' ? 'Publicación' : targetType === 'comment' ? 'Comentario' : 'Usuario'}</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="report-modal-body">
          <div className="report-info">
            <p>
              Ayúdanos a mantener Vecino Activo seguro. Tu reporte será revisado por nuestro equipo.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Motivo del reporte *</label>
              <select
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona un motivo</option>
                {reasons[targetType]?.map(reason => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Descripción (Opcional)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Proporciona más detalles sobre el problema..."
                rows={4}
              />
            </div>

            <div className="report-note">
              <p>
                ℹ️ Los reportes son anónimos. El usuario reportado no sabrá quién lo reportó.
              </p>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn-danger">
                Enviar Reporte
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
