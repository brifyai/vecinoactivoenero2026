import React, { useState } from 'react';
import { useReduxAuth as useAuth } from '../../hooks/useReduxAuth';
import { useReduxCommunityActions } from '../../hooks/useReduxCommunityActions';
import { showSuccessToast, showErrorToast } from '../../utils/sweetalert';
import CloseIcon from '@mui/icons-material/Close';
import './CreateActionModal.css';

const CreateActionModal = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const { createAction } = useReduxCommunityActions();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    locationName: '',
    requiredSkills: [],
    participantLimit: ''
  });
  const [loading, setLoading] = useState(false);

  const skills = [
    'Reparaciones',
    'Plomería',
    'Electricidad',
    'Carpintería',
    'Enseñanza',
    'Diseño',
    'Programación',
    'Fotografía',
    'Cocina',
    'Cuidado de Mascotas'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSkill = (skill) => {
    if (!formData.requiredSkills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, skill]
      }));
    }
  };

  const handleRemoveSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter(s => s !== skill)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim() || !formData.startDate || !formData.locationName.trim()) {
      showErrorToast('Por favor completa todos los campos requeridos');
      return;
    }

    if (formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      showErrorToast('La fecha de fin debe ser posterior a la de inicio');
      return;
    }

    setLoading(true);

    try {
      const result = createAction({
        organizerId: user.id,
        neighborhoodId: user.neighborhoodId,
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate || formData.startDate,
        location: {
          latitude: user.latitude,
          longitude: user.longitude,
          name: formData.locationName
        },
        requiredSkills: formData.requiredSkills,
        participantLimit: formData.participantLimit ? parseInt(formData.participantLimit) : null
      });

      if (result.success) {
        showSuccessToast('¡Acción comunitaria creada exitosamente!');
        onSuccess();
      } else {
        showErrorToast(result.error || 'Error al crear la acción');
      }
    } catch (error) {
      showErrorToast('Error al crear la acción');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Crear Acción Comunitaria</h2>
          <button className="close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="action-form">
          <div className="form-group">
            <label>Título de la Acción</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Ej: Limpieza del Parque"
              className="form-input"
              maxLength="100"
            />
            <span className="char-count">{formData.title.length}/100</span>
          </div>

          <div className="form-group">
            <label>Descripción</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe la acción y qué se espera de los participantes..."
              className="form-input textarea"
              rows="4"
              maxLength="500"
            />
            <span className="char-count">{formData.description.length}/500</span>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Fecha y Hora de Inicio</label>
              <input
                type="datetime-local"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Fecha y Hora de Fin (opcional)</label>
              <input
                type="datetime-local"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Ubicación</label>
            <input
              type="text"
              name="locationName"
              value={formData.locationName}
              onChange={handleInputChange}
              placeholder="Ej: Parque Central"
              className="form-input"
              maxLength="100"
            />
          </div>

          <div className="form-group">
            <label>Límite de Participantes (opcional)</label>
            <input
              type="number"
              name="participantLimit"
              value={formData.participantLimit}
              onChange={handleInputChange}
              placeholder="Dejar en blanco para sin límite"
              className="form-input"
              min="1"
            />
          </div>

          <div className="form-group">
            <label>Habilidades Requeridas (opcional)</label>
            <div className="skills-selector">
              <div className="available-skills">
                {skills.map(skill => (
                  <button
                    key={skill}
                    type="button"
                    className={`skill-btn ${formData.requiredSkills.includes(skill) ? 'selected' : ''}`}
                    onClick={() => handleAddSkill(skill)}
                  >
                    {skill}
                  </button>
                ))}
              </div>
              {formData.requiredSkills.length > 0 && (
                <div className="selected-skills">
                  <p className="selected-label">Seleccionadas:</p>
                  <div className="selected-list">
                    {formData.requiredSkills.map(skill => (
                      <div key={skill} className="selected-skill">
                        <span>{skill}</span>
                        <button
                          type="button"
                          className="remove-skill"
                          onClick={() => handleRemoveSkill(skill)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
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
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear Acción'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateActionModal;
