import React, { useState } from 'react';
import { useReduxAuth as useAuth } from '../../hooks/useReduxAuth';
import { useReduxLocalNeeds } from '../../hooks/useReduxLocalNeeds';
import { showSuccessToast, showErrorToast } from '../../utils/sweetalert';
import CloseIcon from '@mui/icons-material/Close';
import './CreateNeedModal.css';

const CreateNeedModal = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const { createNeed } = useReduxLocalNeeds();
  const [formData, setFormData] = useState({
    type: 'help_request',
    title: '',
    description: '',
    urgency: 'medium',
    requiredSkills: []
  });
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState('');

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

    if (!formData.title.trim() || !formData.description.trim()) {
      showErrorToast('Por favor completa todos los campos');
      return;
    }

    setLoading(true);

    try {
      const result = createNeed({
        userId: user.id,
        neighborhoodId: user.neighborhoodId,
        type: formData.type,
        title: formData.title,
        description: formData.description,
        urgency: formData.urgency,
        requiredSkills: formData.requiredSkills,
        latitude: user.latitude,
        longitude: user.longitude,
        radiusMeters: 500
      });

      if (result.success) {
        showSuccessToast('¡Necesidad creada exitosamente!');
        onSuccess();
      } else {
        showErrorToast(result.error || 'Error al crear la necesidad');
      }
    } catch (error) {
      showErrorToast('Error al crear la necesidad');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Crear Necesidad Local</h2>
          <button className="close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="need-form">
          <div className="form-group">
            <label>Tipo de Necesidad</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="form-input"
            >
              <option value="help_request">Solicitud de Ayuda</option>
              <option value="resource_needed">Recurso Necesario</option>
              <option value="skill_sought">Habilidad Buscada</option>
            </select>
          </div>

          <div className="form-group">
            <label>Título</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Ej: Necesito ayuda para mudanza"
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
              placeholder="Describe tu necesidad con detalle..."
              className="form-input textarea"
              rows="4"
              maxLength="500"
            />
            <span className="char-count">{formData.description.length}/500</span>
          </div>

          <div className="form-group">
            <label>Urgencia</label>
            <div className="urgency-options">
              {['low', 'medium', 'high', 'critical'].map(urgency => (
                <label key={urgency} className="radio-option">
                  <input
                    type="radio"
                    name="urgency"
                    value={urgency}
                    checked={formData.urgency === urgency}
                    onChange={handleInputChange}
                  />
                  <span className={`urgency-label urgency-${urgency}`}>
                    {urgency === 'low' && 'Baja'}
                    {urgency === 'medium' && 'Media'}
                    {urgency === 'high' && 'Alta'}
                    {urgency === 'critical' && 'Crítica'}
                  </span>
                </label>
              ))}
            </div>
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
              {loading ? 'Creando...' : 'Crear Necesidad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateNeedModal;
