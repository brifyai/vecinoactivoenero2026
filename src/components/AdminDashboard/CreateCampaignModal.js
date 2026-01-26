import React, { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import NotificationsIcon from '@mui/icons-material/Notifications';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import SendIcon from '@mui/icons-material/Send';
import ScheduleIcon from '@mui/icons-material/Schedule';
import SaveIcon from '@mui/icons-material/Save';
import './CreateCampaignModal.css';

const CreateCampaignModal = ({ isOpen, onClose, onSubmit, neighborhoodId }) => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'email',
    target_audience: 'all',
    scheduled_for: '',
    status: 'draft'
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
    
    if (!formData.message.trim()) {
      newErrors.message = 'El mensaje es requerido';
    }
    
    if (formData.status === 'scheduled' && !formData.scheduled_for) {
      newErrors.scheduled_for = 'Debes seleccionar una fecha para programar';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e, action = 'draft') => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      status: action,
      neighborhood_id: neighborhoodId
    };
    
    if (action === 'scheduled' && !formData.scheduled_for) {
      setErrors({ scheduled_for: 'Debes seleccionar una fecha para programar' });
      return;
    }
    
    if (validate()) {
      onSubmit(submitData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      message: '',
      type: 'email',
      target_audience: 'all',
      scheduled_for: '',
      status: 'draft'
    });
    setErrors({});
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="create-campaign-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Nueva Campaña</h2>
          <button className="close-btn" onClick={handleClose}>
            <CloseIcon />
          </button>
        </div>

        <form className="modal-body">
          {/* Título */}
          <div className="form-group">
            <label htmlFor="title">Título de la Campaña *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ej: Aviso importante para vecinos"
              className={errors.title ? 'error' : ''}
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          {/* Tipo de Campaña */}
          <div className="form-group">
            <label>Tipo de Campaña *</label>
            <div className="campaign-type-options">
              <label className={`type-option ${formData.type === 'email' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="type"
                  value="email"
                  checked={formData.type === 'email'}
                  onChange={handleChange}
                />
                <EmailIcon />
                <span>Email</span>
              </label>
              <label className={`type-option ${formData.type === 'push' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="type"
                  value="push"
                  checked={formData.type === 'push'}
                  onChange={handleChange}
                />
                <NotificationsIcon />
                <span>Notificación</span>
              </label>
              <label className={`type-option ${formData.type === 'whatsapp' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="type"
                  value="whatsapp"
                  checked={formData.type === 'whatsapp'}
                  onChange={handleChange}
                />
                <WhatsAppIcon />
                <span>WhatsApp</span>
              </label>
            </div>
          </div>

          {/* Mensaje */}
          <div className="form-group">
            <label htmlFor="message">Mensaje *</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Escribe el mensaje de tu campaña..."
              rows="6"
              className={errors.message ? 'error' : ''}
            />
            {errors.message && <span className="error-message">{errors.message}</span>}
            <div className="char-count">{formData.message.length} caracteres</div>
          </div>

          {/* Audiencia */}
          <div className="form-group">
            <label htmlFor="target_audience">Audiencia</label>
            <select
              id="target_audience"
              name="target_audience"
              value={formData.target_audience}
              onChange={handleChange}
            >
              <option value="all">Todos los vecinos</option>
              <option value="verified">Solo verificados</option>
              <option value="active">Usuarios activos</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>

          {/* Programar envío */}
          <div className="form-group">
            <label htmlFor="scheduled_for">Programar Envío (Opcional)</label>
            <input
              type="datetime-local"
              id="scheduled_for"
              name="scheduled_for"
              value={formData.scheduled_for}
              onChange={handleChange}
              min={new Date().toISOString().slice(0, 16)}
              className={errors.scheduled_for ? 'error' : ''}
            />
            {errors.scheduled_for && <span className="error-message">{errors.scheduled_for}</span>}
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
            className="btn-draft" 
            onClick={(e) => handleSubmit(e, 'draft')}
          >
            <SaveIcon />
            Guardar Borrador
          </button>
          {formData.scheduled_for && (
            <button 
              type="button" 
              className="btn-schedule" 
              onClick={(e) => handleSubmit(e, 'scheduled')}
            >
              <ScheduleIcon />
              Programar
            </button>
          )}
          <button 
            type="button" 
            className="btn-primary" 
            onClick={(e) => handleSubmit(e, 'sent')}
          >
            <SendIcon />
            Enviar Ahora
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaignModal;
