import React, { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import CategoryIcon from '@mui/icons-material/Category';
import SaveIcon from '@mui/icons-material/Save';
import './CreateTicketModal.css';

const CreateTicketModal = ({ isOpen, onClose, onSubmit, neighborhoodId }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    priority: 'medium',
    location: '',
    reporter_contact: ''
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      const submitData = {
        ...formData,
        neighborhood_id: neighborhoodId,
        status: 'pending'
      };
      
      onSubmit(submitData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      category: 'other',
      priority: 'medium',
      location: '',
      reporter_contact: ''
    });
    setErrors({});
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="create-ticket-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-title">
            <ConfirmationNumberIcon />
            <h2>Crear Nuevo Ticket</h2>
          </div>
          <button className="close-btn" onClick={handleClose}>
            <CloseIcon />
          </button>
        </div>

        <form className="modal-body" onSubmit={handleSubmit}>
          {/* Título */}
          <div className="form-group">
            <label htmlFor="title">Título del Ticket *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ej: Problema con iluminación en calle principal"
              className={errors.title ? 'error' : ''}
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          {/* Descripción */}
          <div className="form-group">
            <label htmlFor="description">Descripción *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe el problema en detalle..."
              rows="4"
              className={errors.description ? 'error' : ''}
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>

          {/* Categoría y Prioridad */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">
                <CategoryIcon />
                Categoría *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="security">Seguridad</option>
                <option value="infrastructure">Infraestructura</option>
                <option value="noise">Ruido</option>
                <option value="cleaning">Limpieza</option>
                <option value="lighting">Iluminación</option>
                <option value="maintenance">Mantenimiento</option>
                <option value="other">Otro</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority">
                <PriorityHighIcon />
                Prioridad *
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
          </div>

          {/* Ubicación */}
          <div className="form-group">
            <label htmlFor="location">Ubicación (Opcional)</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Ej: Calle Los Aromos #123"
            />
          </div>

          {/* Contacto del Reportante */}
          <div className="form-group">
            <label htmlFor="reporter_contact">Contacto (Opcional)</label>
            <input
              type="text"
              id="reporter_contact"
              name="reporter_contact"
              value={formData.reporter_contact}
              onChange={handleChange}
              placeholder="Email o teléfono"
            />
          </div>
        </form>

        <div className="modal-footer">
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={handleClose}
          >
            Cancelar
          </button>
          <button 
            type="button" 
            className="btn-primary" 
            onClick={handleSubmit}
          >
            <SaveIcon />
            Crear Ticket
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTicketModal;
