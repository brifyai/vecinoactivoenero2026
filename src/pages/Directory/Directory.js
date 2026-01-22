import React, { useState } from 'react';
import { useServices } from '../../context/ServicesContext';
import { useLocalBusiness } from '../../context/LocalBusinessContext';
import { useReduxAuth as useAuth } from '../../hooks/useReduxAuth';
import { useSidebar } from '../../context/SidebarContext';
import { useGamification } from '../../context/GamificationContext';
import { formatNumber } from '../../utils/formatNumber';
import ServiceCard from '../../components/ServiceCard/ServiceCard';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import StarIcon from '@mui/icons-material/Star';
import VerifiedIcon from '@mui/icons-material/Verified';
import CloseIcon from '@mui/icons-material/Close';
import StoreIcon from '@mui/icons-material/Store';
import PlumbingIcon from '@mui/icons-material/Plumbing';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import CarpenterIcon from '@mui/icons-material/Carpenter';
import FormatPaintIcon from '@mui/icons-material/FormatPaint';
import YardIcon from '@mui/icons-material/Yard';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import BuildIcon from '@mui/icons-material/Build';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import HandymanIcon from '@mui/icons-material/Handyman';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import RateReviewIcon from '@mui/icons-material/RateReview';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import WorkIcon from '@mui/icons-material/Work';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import BarChartIcon from '@mui/icons-material/BarChart';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LanguageIcon from '@mui/icons-material/Language';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import './Directory.css';

const Directory = () => {
  const { user } = useAuth();
  const { services, addService } = useServices();
  const { businesses, registerBusiness, addReview, searchBusinesses } = useLocalBusiness();
  const { addPoints, updateActivity } = useGamification();
  const { isRightSidebarCollapsed } = useSidebar();
  
  const [activeTab, setActiveTab] = useState('services'); // 'services' o 'businesses'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  
  const [newService, setNewService] = useState({
    name: '',
    category: 'plomero',
    description: '',
    phone: '',
    email: '',
    address: '',
    hourlyRate: '',
    availability: 'disponible'
  });

  const [newBusiness, setNewBusiness] = useState({
    name: '',
    description: '',
    category: 'comercio',
    subcategory: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    whatsapp: '',
    instagram: '',
    facebook: '',
    priceRange: 'medio',
    acceptsCards: false,
    hasDelivery: false
  });

  const serviceCategories = [
    { value: 'all', label: 'Todos', icon: <ListAltIcon />, color: '#6b7280' },
    { value: 'plomero', label: 'Plomeros', icon: <PlumbingIcon />, color: '#3b82f6' },
    { value: 'electricista', label: 'Electricistas', icon: <ElectricalServicesIcon />, color: '#f59e0b' },
    { value: 'gasfiter', label: 'Gasfiters', icon: <WaterDropIcon />, color: '#06b6d4' },
    { value: 'carpintero', label: 'Carpinteros', icon: <CarpenterIcon />, color: '#8b5cf6' },
    { value: 'pintor', label: 'Pintores', icon: <FormatPaintIcon />, color: '#ec4899' },
    { value: 'jardinero', label: 'Jardineros', icon: <YardIcon />, color: '#10b981' },
    { value: 'cerrajero', label: 'Cerrajeros', icon: <VpnKeyIcon />, color: '#f97316' },
    { value: 'tecnico', label: 'Técnicos', icon: <BuildIcon />, color: '#14b8a6' },
    { value: 'limpieza', label: 'Limpieza', icon: <CleaningServicesIcon />, color: '#a855f7' },
    { value: 'otro', label: 'Otros', icon: <HandymanIcon />, color: '#64748b' }
  ];

  const businessCategories = [
    { value: 'all', label: 'Todos', icon: <ListAltIcon /> },
    { value: 'comercio', label: 'Comercio', icon: <ShoppingCartIcon />, color: '#3b82f6' },
    { value: 'servicio', label: 'Servicio', icon: <BuildIcon />, color: '#10b981' },
    { value: 'profesional', label: 'Profesional', icon: <MedicalServicesIcon />, color: '#8b5cf6' },
    { value: 'emprendimiento', label: 'Emprendimiento', icon: <LightbulbIcon />, color: '#f59e0b' }
  ];

  const categories = activeTab === 'services' ? serviceCategories : businessCategories;

  const getCategoryCount = (categoryValue) => {
    const items = activeTab === 'services' ? services : businesses;
    return items.filter(s => s.category === categoryValue).length;
  };

  const filteredServices = services.filter(service => {
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = ratingFilter === 'all' || service.rating >= parseInt(ratingFilter);
    return matchesCategory && matchesSearch && matchesRating;
  });

  const filteredBusinesses = businesses.filter(business => {
    const matchesCategory = selectedCategory === 'all' || business.category === selectedCategory;
    const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         business.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = ratingFilter === 'all' || business.rating >= parseInt(ratingFilter);
    return matchesCategory && matchesSearch && matchesRating;
  });

  const filteredItems = activeTab === 'services' ? filteredServices : filteredBusinesses;

  const topRatedServices = [...services]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  const totalServices = services.length;
  const averageRating = services.length > 0 
    ? (services.reduce((sum, s) => sum + s.rating, 0) / services.length).toFixed(1)
    : 0;
  const verifiedServices = services.filter(s => s.verified).length;

  const totalBusinesses = businesses.length;
  const averageBusinessRating = businesses.length > 0 
    ? (businesses.reduce((sum, b) => sum + b.rating, 0) / businesses.length).toFixed(1)
    : 0;
  const totalBusinessReviews = businesses.reduce((sum, b) => sum + b.totalReviews, 0);

  const handleAddService = () => {
    if (!newService.name || !newService.phone) return;

    const serviceData = {
      ...newService,
      providerId: user?.id,
      providerName: user?.name,
      providerAvatar: user?.avatar,
      neighborhoodId: user?.neighborhoodId,
      neighborhoodName: user?.neighborhoodName,
      rating: 0,
      reviews: [],
      verified: false
    };

    addService(serviceData);
    setShowAddModal(false);
    setNewService({
      name: '',
      category: 'plomero',
      description: '',
      phone: '',
      email: '',
      address: '',
      hourlyRate: '',
      availability: 'disponible'
    });
  };

  const handleAddBusiness = () => {
    if (!newBusiness.name || !newBusiness.description) return;

    const result = registerBusiness(newBusiness);
    if (result.success) {
      addPoints('RESOURCE_SHARED');
      updateActivity('resourcesShared');
      setShowAddModal(false);
      setNewBusiness({
        name: '',
        description: '',
        category: 'comercio',
        subcategory: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        whatsapp: '',
        instagram: '',
        facebook: '',
        priceRange: 'medio',
        acceptsCards: false,
        hasDelivery: false
      });
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedCategory('all');
    setSearchTerm('');
    setRatingFilter('all');
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon 
        key={i} 
        fontSize="small"
        style={{ color: i < rating ? '#f59e0b' : '#e4e6eb' }}
      />
    ));
  };

  return (
    <div className={`directory-page ${isRightSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="directory-header">
        <div className="header-content">
          <div className="header-title-section">
            <h1>
              {activeTab === 'services' ? (
                <><WorkIcon className="page-title-icon" /> Directorio de Servicios</>
              ) : (
                <><StorefrontIcon className="page-title-icon" /> Negocios Locales</>
              )}
            </h1>
            <p>
              {activeTab === 'services' 
                ? 'Encuentra profesionales verificados por tus vecinos'
                : 'Apoya la economía de tu barrio'
              }
            </p>
          </div>
        </div>
        <button className="add-service-btn" onClick={() => setShowAddModal(true)}>
          <AddIcon />
          <span>{activeTab === 'services' ? 'Agregar Servicio' : 'Registrar Negocio'}</span>
        </button>
      </div>

      {/* Pestañas */}
      <div className="directory-tabs">
        <button 
          className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`}
          onClick={() => handleTabChange('services')}
        >
          <WorkIcon />
          Servicios Profesionales
        </button>
        <button 
          className={`tab-btn ${activeTab === 'businesses' ? 'active' : ''}`}
          onClick={() => handleTabChange('businesses')}
        >
          <StorefrontIcon />
          Negocios Locales
        </button>
      </div>

      {/* Info adicional - ¿Cómo funciona? */}
      {activeTab === 'services' && (
        <div className="info-banner">
          <h3><LightbulbIcon /> ¿Cómo funciona?</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-icon"><CheckCircleIcon /></span>
              <p>Todos los servicios son verificados por vecinos del barrio</p>
            </div>
            <div className="info-item">
              <span className="info-icon"><StarIcon /></span>
              <p>Las calificaciones son reales de trabajos realizados</p>
            </div>
            <div className="info-item">
              <span className="info-icon"><LockIcon /></span>
              <p>Contacta directamente con el profesional</p>
            </div>
            <div className="info-item">
              <span className="info-icon"><RateReviewIcon /></span>
              <p>Deja tu reseña después de contratar un servicio</p>
            </div>
          </div>
        </div>
      )}

      {/* Barra de búsqueda y selector */}
      <div className="search-filter-bar">
        <div style={{ position: 'relative', flex: 1 }}>
          <SearchIcon className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por nombre o servicio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        {/* Dropdown personalizado */}
        <div className="category-dropdown-wrapper">
          <button 
            className="category-dropdown-btn"
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
          >
            <span className="category-label">
              {categories.find(c => c.value === selectedCategory)?.label}
            </span>
            <span className="category-count">
              {selectedCategory === 'all' ? (activeTab === 'services' ? totalServices : totalBusinesses) : getCategoryCount(selectedCategory)}
            </span>
          </button>
          
          {showCategoryDropdown && (
            <div className="category-dropdown-menu">
              {categories.map(category => {
                const count = category.value === 'all' ? (activeTab === 'services' ? totalServices : totalBusinesses) : getCategoryCount(category.value);
                const isSelected = selectedCategory === category.value;
                
                return (
                  <button
                    key={category.value}
                    className={`category-dropdown-item ${isSelected ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedCategory(category.value);
                      setShowCategoryDropdown(false);
                    }}
                  >
                    <span className="item-icon">{category.icon}</span>
                    <span className="item-label">{category.label}</span>
                    <span className="item-count">{count}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>



      {/* Lista de items */}
      <div className="services-section">
        <div className="section-header">
          <h2>
            {selectedCategory === 'all' 
              ? `${activeTab === 'services' ? 'Todos los Servicios' : 'Todos los Negocios'} (${filteredItems.length})`
              : `${categories.find(c => c.value === selectedCategory)?.label} (${filteredItems.length})`
            }
          </h2>
        </div>

        {filteredItems.length > 0 ? (
          activeTab === 'services' ? (
            <div className="services-grid">
              {filteredItems.map(service => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          ) : (
            <div className="services-grid">
              {filteredItems.map(business => {
                const categoryInfo = categories.find(c => c.value === business.category);
                const isOwner = business.ownerId === user?.id;

                return (
                  <div key={business.id} className="business-card">
                    {business.logo && (
                      <div className="business-logo">
                        <img src={business.logo} alt={business.name} />
                      </div>
                    )}

                    <div className="business-category-badge" style={{ background: categoryInfo?.color }}>
                      {categoryInfo?.icon} {categoryInfo?.label}
                    </div>

                    <h3 className="business-name">{business.name}</h3>
                    
                    <div className="business-rating">
                      {renderStars(Math.round(business.rating))}
                      <span className="rating-value">{business.rating.toFixed(1)}</span>
                      <span className="reviews-count">({business.totalReviews} reseñas)</span>
                    </div>

                    <p className="business-description">{business.description}</p>

                    <div className="business-info">
                      {business.address && (
                        <div className="info-item">
                          <span>📍 {business.address}</span>
                        </div>
                      )}
                      {business.phone && (
                        <div className="info-item">
                          <PhoneIcon fontSize="small" />
                          <span>{business.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="business-features">
                      {business.acceptsCards && <span className="feature-badge">💳 Acepta Tarjetas</span>}
                      {business.hasDelivery && <span className="feature-badge">🚚 Delivery</span>}
                      <span className="price-badge">
                        {business.priceRange === 'bajo' ? '$' : business.priceRange === 'medio' ? '$$' : '$$$'}
                      </span>
                    </div>

                    {business.offers && business.offers.length > 0 && (
                      <div className="offers-indicator">
                        <LocalOfferIcon fontSize="small" />
                        <span>{business.offers.length} {business.offers.length === 1 ? 'oferta' : 'ofertas'} disponibles</span>
                      </div>
                    )}

                    <div className="business-footer">
                      <span className="neighborhood-badge">{business.neighborhoodName}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <div className="no-results">
            <div className="no-results-icon">
              <SentimentDissatisfiedIcon style={{ fontSize: '64px', opacity: 0.5 }} />
            </div>
            <h3>No se encontraron {activeTab === 'services' ? 'servicios' : 'negocios'}</h3>
            <p>Intenta con otra categoría o término de búsqueda</p>
          </div>
        )}
      </div>

      {/* Modal Agregar Servicio o Negocio */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{activeTab === 'services' ? 'Agregar Servicio' : 'Registrar Negocio'}</h2>
              <button className="close-modal" onClick={() => setShowAddModal(false)}>
                <CloseIcon />
              </button>
            </div>
            <div className="modal-body">
              {activeTab === 'services' ? (
                <>
                  <div className="form-group">
                    <label>Nombre del Servicio</label>
                    <input
                      type="text"
                      value={newService.name}
                      onChange={(e) => setNewService({...newService, name: e.target.value})}
                      placeholder="Ej: Juan Pérez - Plomería"
                    />
                  </div>
                  <div className="form-group">
                    <label>Categoría</label>
                    <select
                      value={newService.category}
                      onChange={(e) => setNewService({...newService, category: e.target.value})}
                    >
                      {serviceCategories.filter(c => c.value !== 'all').map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Descripción</label>
                    <textarea
                      value={newService.description}
                      onChange={(e) => setNewService({...newService, description: e.target.value})}
                      placeholder="Describe los servicios que ofreces..."
                      rows="3"
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Teléfono</label>
                      <input
                        type="tel"
                        value={newService.phone}
                        onChange={(e) => setNewService({...newService, phone: e.target.value})}
                        placeholder="+56 9 1234 5678"
                      />
                    </div>
                    <div className="form-group">
                      <label>Email (Opcional)</label>
                      <input
                        type="email"
                        value={newService.email}
                        onChange={(e) => setNewService({...newService, email: e.target.value})}
                        placeholder="correo@ejemplo.com"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Dirección (Opcional)</label>
                    <input
                      type="text"
                      value={newService.address}
                      onChange={(e) => setNewService({...newService, address: e.target.value})}
                      placeholder="Calle Principal #123"
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Tarifa por Hora (Opcional)</label>
                      <input
                        type="number"
                        value={newService.hourlyRate}
                        onChange={(e) => setNewService({...newService, hourlyRate: e.target.value})}
                        placeholder="15000"
                      />
                    </div>
                    <div className="form-group">
                      <label>Disponibilidad</label>
                      <select
                        value={newService.availability}
                        onChange={(e) => setNewService({...newService, availability: e.target.value})}
                      >
                        <option value="disponible">Disponible</option>
                        <option value="ocupado">Ocupado</option>
                        <option value="no_disponible">No Disponible</option>
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label>Categoría</label>
                    <select value={newBusiness.category} onChange={(e) => setNewBusiness({...newBusiness, category: e.target.value})}>
                      {businessCategories.filter(c => c.value !== 'all').map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Nombre del Negocio</label>
                    <input
                      type="text"
                      value={newBusiness.name}
                      onChange={(e) => setNewBusiness({...newBusiness, name: e.target.value})}
                      placeholder="Ej: Almacén Don Pedro"
                    />
                  </div>

                  <div className="form-group">
                    <label>Descripción</label>
                    <textarea
                      value={newBusiness.description}
                      onChange={(e) => setNewBusiness({...newBusiness, description: e.target.value})}
                      placeholder="Describe tu negocio..."
                      rows="3"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Dirección</label>
                      <input
                        type="text"
                        value={newBusiness.address}
                        onChange={(e) => setNewBusiness({...newBusiness, address: e.target.value})}
                        placeholder="Calle y número"
                      />
                    </div>
                    <div className="form-group">
                      <label>Teléfono</label>
                      <input
                        type="tel"
                        value={newBusiness.phone}
                        onChange={(e) => setNewBusiness({...newBusiness, phone: e.target.value})}
                        placeholder="+56 9 1234 5678"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        value={newBusiness.email}
                        onChange={(e) => setNewBusiness({...newBusiness, email: e.target.value})}
                        placeholder="contacto@negocio.cl"
                      />
                    </div>
                    <div className="form-group">
                      <label>WhatsApp</label>
                      <input
                        type="tel"
                        value={newBusiness.whatsapp}
                        onChange={(e) => setNewBusiness({...newBusiness, whatsapp: e.target.value})}
                        placeholder="+56 9 1234 5678"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Instagram</label>
                      <input
                        type="text"
                        value={newBusiness.instagram}
                        onChange={(e) => setNewBusiness({...newBusiness, instagram: e.target.value})}
                        placeholder="@usuario"
                      />
                    </div>
                    <div className="form-group">
                      <label>Facebook</label>
                      <input
                        type="text"
                        value={newBusiness.facebook}
                        onChange={(e) => setNewBusiness({...newBusiness, facebook: e.target.value})}
                        placeholder="facebook.com/pagina"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Rango de Precios</label>
                    <select value={newBusiness.priceRange} onChange={(e) => setNewBusiness({...newBusiness, priceRange: e.target.value})}>
                      <option value="bajo">$ Económico</option>
                      <option value="medio">$$ Moderado</option>
                      <option value="alto">$$$ Premium</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={newBusiness.acceptsCards}
                        onChange={(e) => setNewBusiness({...newBusiness, acceptsCards: e.target.checked})}
                      />
                      Acepta tarjetas de crédito/débito
                    </label>
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={newBusiness.hasDelivery}
                        onChange={(e) => setNewBusiness({...newBusiness, hasDelivery: e.target.checked})}
                      />
                      Ofrece servicio de delivery
                    </label>
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowAddModal(false)}>
                Cancelar
              </button>
              <button 
                className="submit-btn" 
                onClick={activeTab === 'services' ? handleAddService : handleAddBusiness}
              >
                {activeTab === 'services' ? 'Agregar Servicio' : 'Registrar Negocio'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Directory;
