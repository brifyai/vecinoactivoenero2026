import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { showSuccessToast, showErrorToast } from '../../utils/sweetalert';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import LinkIcon from '@mui/icons-material/Link';
import CakeIcon from '@mui/icons-material/Cake';
import './EditProfileModal.css';

const EditProfileModal = ({ onClose }) => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    location: user?.location || '',
    work: user?.work || '',
    education: user?.education || '',
    website: user?.website || '',
    birthday: user?.birthday || '',
    phone: user?.phone || '',
    relationship: user?.relationship || 'single'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      showErrorToast('Nombre y email son requeridos');
      return;
    }

    updateUser({ ...user, ...formData });
    showSuccessToast('¡Perfil actualizado exitosamente!');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="edit-profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Editar Perfil</h2>
          <button className="close-modal-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-profile-form">
          <div className="form-section">
            <h3>Información Básica</h3>
            
            <div className="form-group">
              <label><PersonIcon fontSize="small" /> Nombre Completo</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Tu nombre completo"
                required
              />
            </div>

            <div className="form-group">
              <label><EmailIcon fontSize="small" /> Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Biografía</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Cuéntanos sobre ti..."
                rows="3"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Información de Contacto</h3>
            
            <div className="form-group">
              <label><LocationOnIcon fontSize="small" /> Ubicación</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Ciudad, País"
              />
            </div>

            <div className="form-group">
              <label>Teléfono</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 234 567 8900"
              />
            </div>

            <div className="form-group">
              <label><LinkIcon fontSize="small" /> Sitio Web</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://tusitio.com"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Trabajo y Educación</h3>
            
            <div className="form-group">
              <label><WorkIcon fontSize="small" /> Trabajo</label>
              <input
                type="text"
                name="work"
                value={formData.work}
                onChange={handleChange}
                placeholder="Empresa o puesto"
              />
            </div>

            <div className="form-group">
              <label><SchoolIcon fontSize="small" /> Educación</label>
              <input
                type="text"
                name="education"
                value={formData.education}
                onChange={handleChange}
                placeholder="Universidad o institución"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Información Personal</h3>
            
            <div className="form-group">
              <label><CakeIcon fontSize="small" /> Fecha de Nacimiento</label>
              <input
                type="date"
                name="birthday"
                value={formData.birthday}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Estado de Relación</label>
              <select
                name="relationship"
                value={formData.relationship}
                onChange={handleChange}
              >
                <option value="single">Soltero/a</option>
                <option value="relationship">En una relación</option>
                <option value="engaged">Comprometido/a</option>
                <option value="married">Casado/a</option>
                <option value="complicated">Es complicado</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="save-btn">
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
