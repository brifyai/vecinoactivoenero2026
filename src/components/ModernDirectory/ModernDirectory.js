import React, { useState } from 'react';
import { useServices } from '../../context/ServicesContext';
import { useSidebar } from '../../context/SidebarContext';
import { useAuth } from '../../context/AuthContext';
import SearchIcon from '@mui/icons-material/Search';
import StarIcon from '@mui/icons-material/Star';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import PlaceIcon from '@mui/icons-material/Place';
import VerifiedIcon from '@mui/icons-material/Verified';
import CloseIcon from '@mui/icons-material/Close';
import './ModernDirectory.css';

const ModernDirectory = () => {
  const { services, addService } = useServices();
  const { isRightSidebarCollapsed } = useSidebar();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'plomero',
    description: '',
    phone: '',
    email: '',
    address: ''
  });

  const handleCreateService = () => {
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newService = {
      id: Date.now(),
      ...formData,
      rating: 5.0,
      reviews: 0,
      verified: false,
      avatar: user?.avatar || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
      createdAt: new Date().toISOString()
    };
    addService(newService);
    setShowModal(false);
    setFormData({
      name: '',
      category: 'plomero',
      description: '',
      phone: '',
      email: '',
      address: ''
    });
  };

  const categories = [
    { value: 'all', label: 'Todos' },
    { value: 'plomero', label: 'Plomería' },
    { value: 'electricista', label: 'Electricidad' },
    { value: 'carpintero', label: 'Carpintería' },
    { value: 'pintor', label: 'Pintura' },
    { value: 'jardinero', label: 'Jardinería' },
    { value: 'limpieza', label: 'Limpieza' }
  ];

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={`modern-directory ${isRightSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Search and Filters */}
      <div className="directory-controls">
        <div className="controls-header">
          <div className="search-box-modern">
            <SearchIcon className="search-icon" />
            <input
              type="text"
              placeholder="Buscar servicios o profesionales..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-create" onClick={handleCreateService}>
            + Agregar Servicio
          </button>
        </div>

        <div className="category-pills">
          {categories.map(cat => (
            <button
              key={cat.value}
              className={`category-pill ${selectedCategory === cat.value ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="services-grid-modern">
        {filteredServices.length === 0 ? (
          <div className="empty-state">
            <p>No se encontraron servicios</p>
          </div>
        ) : (
          filteredServices.map(service => (
            <div key={service.id} className="service-card-modern">
              <div className="service-header">
                <div className="service-avatar">
                  {service.avatar ? (
                    <img src={service.avatar} alt={service.name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {service.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="service-info">
                  <h3 className="service-name">
                    {service.name}
                    {service.verified && (
                      <VerifiedIcon className="verified-badge" />
                    )}
                  </h3>
                  <p className="service-category">{service.category}</p>
                </div>
              </div>

              {service.description && (
                <p className="service-description">{service.description}</p>
              )}

              <div className="service-rating">
                <StarIcon className="star-icon" />
                <span className="rating-value">{service.rating || 4.5}</span>
                <span className="rating-count">({service.reviews || 12} reseñas)</span>
              </div>

              <div className="service-details">
                {service.phone && (
                  <div className="detail-item">
                    <PhoneIcon />
                    <span>{service.phone}</span>
                  </div>
                )}
                {service.email && (
                  <div className="detail-item">
                    <EmailIcon />
                    <span>{service.email}</span>
                  </div>
                )}
                {service.address && (
                  <div className="detail-item">
                    <PlaceIcon />
                    <span>{service.address}</span>
                  </div>
                )}
              </div>

              <div className="service-actions">
                <button className="btn-contact">Contactar</button>
                <button className="btn-details">Ver más</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal para crear servicio */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Agregar Nuevo Servicio</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <CloseIcon />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Nombre del Profesional o Negocio *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Juan Pérez"
                  required
                />
              </div>

              <div className="form-group">
                <label>Categoría *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="plomero">Plomería</option>
                  <option value="electricista">Electricidad</option>
                  <option value="carpintero">Carpintería</option>
                  <option value="pintor">Pintura</option>
                  <option value="jardinero">Jardinería</option>
                  <option value="limpieza">Limpieza</option>
                </select>
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe el servicio que ofreces..."
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+56 9 1234 5678"
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="correo@ejemplo.com"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Dirección</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Calle, número, comuna"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit">
                  Agregar Servicio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernDirectory;
