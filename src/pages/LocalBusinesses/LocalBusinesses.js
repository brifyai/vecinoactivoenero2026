import { useState } from 'react';
import { useLocalBusiness } from '../../context/LocalBusinessContext';
import { useReduxAuth as useAuth } from '../../hooks/useReduxAuth';
import { useSidebar } from '../../context/SidebarContext';
import { useGamification } from '../../context/GamificationContext';
import { formatNumber } from '../../utils/formatNumber';
import AddIcon from '@mui/icons-material/Add';
import StarIcon from '@mui/icons-material/Star';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LanguageIcon from '@mui/icons-material/Language';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CloseIcon from '@mui/icons-material/Close';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BuildIcon from '@mui/icons-material/Build';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import BarChartIcon from '@mui/icons-material/BarChart';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import './LocalBusinesses.css';

const LocalBusinesses = () => {
  const { user } = useAuth();
  const { isRightSidebarCollapsed } = useSidebar();
  const { businesses, registerBusiness, addReview, createOffer, searchBusinesses } = useLocalBusiness();
  const { addPoints, updateActivity } = useGamification();
  
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  
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

  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: ''
  });

  const [newOffer, setNewOffer] = useState({
    title: '',
    description: '',
    discount: '',
    validUntil: '',
    code: ''
  });

  const categories = [
    { value: 'all', label: 'Todos', icon: <ListAltIcon /> },
    { value: 'comercio', label: 'Comercio', icon: <ShoppingCartIcon />, color: '#3b82f6' },
    { value: 'servicio', label: 'Servicio', icon: <BuildIcon />, color: '#10b981' },
    { value: 'profesional', label: 'Profesional', icon: <MedicalServicesIcon />, color: '#8b5cf6' },
    { value: 'emprendimiento', label: 'Emprendimiento', icon: <LightbulbIcon />, color: '#f59e0b' }
  ];

  const getFilteredBusinesses = () => {
    let filtered = businesses;

    if (searchQuery) {
      filtered = searchBusinesses(searchQuery);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(b => b.category === categoryFilter);
    }

    return filtered.sort((a, b) => b.rating - a.rating);
  };

  const filteredBusinesses = getFilteredBusinesses();

  const handleRegisterBusiness = () => {
    if (!newBusiness.name || !newBusiness.description) return;

    const result = registerBusiness(newBusiness);
    if (result.success) {
      addPoints('RESOURCE_SHARED');
      updateActivity('resourcesShared');
      setShowRegisterModal(false);
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

  const handleAddReview = () => {
    if (!newReview.comment || !selectedBusiness) return;

    addReview(selectedBusiness.id, newReview);
    addPoints('REVIEW_WRITTEN');
    updateActivity('reviewsWritten');
    setShowReviewModal(false);
    setNewReview({ rating: 5, comment: '' });
    setSelectedBusiness(null);
  };

  const handleCreateOffer = () => {
    if (!newOffer.title || !selectedBusiness) return;

    createOffer(selectedBusiness.id, newOffer);
    setShowOfferModal(false);
    setNewOffer({
      title: '',
      description: '',
      discount: '',
      validUntil: '',
      code: ''
    });
    setSelectedBusiness(null);
  };

  const openReviewModal = (business) => {
    setSelectedBusiness(business);
    setShowReviewModal(true);
  };

  const openOfferModal = (business) => {
    setSelectedBusiness(business);
    setShowOfferModal(true);
  };

  const openDetailsModal = (business) => {
    setSelectedBusiness(business);
    setShowDetailsModal(true);
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
    <div className={`businesses-page ${isRightSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="businesses-header">
        <div>
          <h1><StorefrontIcon className="page-title-icon" /> Negocios Locales</h1>
          <p>Apoya la economía de tu barrio</p>
        </div>
        <button className="register-business-btn" onClick={() => setShowRegisterModal(true)}>
          <AddIcon /> Registrar Negocio
        </button>
      </div>

      <div className="businesses-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <BarChartIcon style={{ fontSize: '28px', color: '#3b82f6' }} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{formatNumber(businesses.length)}</span>
            <span className="stat-label">Negocios Registrados</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <StarIcon style={{ fontSize: '28px', color: '#f59e0b' }} />
          </div>
          <div className="stat-info">
            <span className="stat-value">
              {businesses.length > 0 
                ? (businesses.reduce((sum, b) => sum + b.rating, 0) / businesses.length).toFixed(1)
                : '0.0'}
            </span>
            <span className="stat-label">Calificación Promedio</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <ChatBubbleIcon style={{ fontSize: '28px', color: '#10b981' }} />
          </div>
          <div className="stat-info">
            <span className="stat-value">
              {formatNumber(businesses.reduce((sum, b) => sum + b.totalReviews, 0))}
            </span>
            <span className="stat-label">Reseñas Totales</span>
          </div>
        </div>
      </div>

      <div className="businesses-filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar negocios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="category-filters">
          {categories.map(cat => (
            <button
              key={cat.value}
              className={`category-filter-btn ${categoryFilter === cat.value ? 'active' : ''}`}
              onClick={() => setCategoryFilter(cat.value)}
              style={categoryFilter === cat.value && cat.color ? { 
                background: cat.color + '20', 
                borderColor: cat.color,
                color: cat.color 
              } : {}}
            >
              <span className="category-icon">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="businesses-grid">
        {filteredBusinesses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <StorefrontIcon style={{ fontSize: '64px', opacity: 0.3 }} />
            </div>
            <h3>No hay negocios registrados</h3>
            <p>Sé el primero en registrar tu negocio</p>
          </div>
        ) : (
          filteredBusinesses.map(business => {
            const categoryInfo = categories.find(c => c.value === business.category);
            const isOwner = business.ownerId === user?.id;

            return (
              <div 
                key={business.id} 
                className="business-card"
                onClick={() => openDetailsModal(business)}
              >
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
                  <span className="price-badge">{business.priceRange === 'bajo' ? '$' : business.priceRange === 'medio' ? '$$' : '$$$'}</span>
                </div>

                {business.offers.length > 0 && (
                  <div className="offers-indicator">
                    <LocalOfferIcon fontSize="small" />
                    <span>{business.offers.length} {business.offers.length === 1 ? 'oferta' : 'ofertas'} disponibles</span>
                  </div>
                )}

                <div className="business-actions" onClick={(e) => e.stopPropagation()}>
                  {!isOwner && (
                    <button 
                      className="review-btn"
                      onClick={() => openReviewModal(business)}
                    >
                      <StarIcon fontSize="small" />
                      Dejar Reseña
                    </button>
                  )}
                  {isOwner && (
                    <button 
                      className="offer-btn"
                      onClick={() => openOfferModal(business)}
                    >
                      <LocalOfferIcon fontSize="small" />
                      Crear Oferta
                    </button>
                  )}
                </div>

                <div className="business-footer">
                  <span className="neighborhood-badge">{business.neighborhoodName}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Registrar Negocio */}
      {showRegisterModal && (
        <div className="modal-overlay" onClick={() => setShowRegisterModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Registrar Negocio</h2>
              <button className="close-modal" onClick={() => setShowRegisterModal(false)}>
                <CloseIcon />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Categoría</label>
                <select value={newBusiness.category} onChange={(e) => setNewBusiness({...newBusiness, category: e.target.value})}>
                  {categories.filter(c => c.value !== 'all').map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
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
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowRegisterModal(false)}>Cancelar</button>
              <button className="submit-btn" onClick={handleRegisterBusiness}>Registrar Negocio</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dejar Reseña */}
      {showReviewModal && selectedBusiness && (
        <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Dejar Reseña</h2>
              <button className="close-modal" onClick={() => setShowReviewModal(false)}>
                <CloseIcon />
              </button>
            </div>

            <div className="modal-body">
              <div className="business-summary">
                <h3>{selectedBusiness.name}</h3>
                <p>{selectedBusiness.description}</p>
              </div>

              <div className="form-group">
                <label>Calificación</label>
                <div className="rating-selector">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      className="star-btn"
                      onClick={() => setNewReview({...newReview, rating: star})}
                    >
                      <StarIcon 
                        fontSize="large"
                        style={{ color: star <= newReview.rating ? '#f59e0b' : '#e4e6eb' }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Tu Reseña</label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                  placeholder="Comparte tu experiencia..."
                  rows="5"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowReviewModal(false)}>Cancelar</button>
              <button className="submit-btn" onClick={handleAddReview}>Publicar Reseña</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear Oferta */}
      {showOfferModal && selectedBusiness && (
        <div className="modal-overlay" onClick={() => setShowOfferModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Crear Oferta</h2>
              <button className="close-modal" onClick={() => setShowOfferModal(false)}>
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
              <button className="cancel-btn" onClick={() => setShowOfferModal(false)}>Cancelar</button>
              <button className="submit-btn" onClick={handleCreateOffer}>Crear Oferta</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalles */}
      {showDetailsModal && selectedBusiness && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedBusiness.name}</h2>
              <button className="close-modal" onClick={() => setShowDetailsModal(false)}>
                <CloseIcon />
              </button>
            </div>

            <div className="modal-body">
              <div className="business-full-details">
                <div className="detail-rating">
                  {renderStars(Math.round(selectedBusiness.rating))}
                  <span className="rating-value">{selectedBusiness.rating.toFixed(1)}</span>
                  <span className="reviews-count">({selectedBusiness.totalReviews} reseñas)</span>
                </div>

                <p className="detail-description">{selectedBusiness.description}</p>

                <div className="contact-info">
                  <h4>Información de Contacto</h4>
                  <div className="contact-grid">
                    {selectedBusiness.phone && (
                      <a href={`tel:${selectedBusiness.phone}`} className="contact-item">
                        <PhoneIcon />
                        <span>{selectedBusiness.phone}</span>
                      </a>
                    )}
                    {selectedBusiness.email && (
                      <a href={`mailto:${selectedBusiness.email}`} className="contact-item">
                        <EmailIcon />
                        <span>{selectedBusiness.email}</span>
                      </a>
                    )}
                    {selectedBusiness.whatsapp && (
                      <a href={`https://wa.me/${selectedBusiness.whatsapp.replace(/\D/g, '')}`} className="contact-item" target="_blank" rel="noopener noreferrer">
                        <WhatsAppIcon />
                        <span>WhatsApp</span>
                      </a>
                    )}
                    {selectedBusiness.instagram && (
                      <a href={`https://instagram.com/${selectedBusiness.instagram.replace('@', '')}`} className="contact-item" target="_blank" rel="noopener noreferrer">
                        <InstagramIcon />
                        <span>{selectedBusiness.instagram}</span>
                      </a>
                    )}
                    {selectedBusiness.facebook && (
                      <a href={selectedBusiness.facebook} className="contact-item" target="_blank" rel="noopener noreferrer">
                        <FacebookIcon />
                        <span>Facebook</span>
                      </a>
                    )}
                    {selectedBusiness.website && (
                      <a href={selectedBusiness.website} className="contact-item" target="_blank" rel="noopener noreferrer">
                        <LanguageIcon />
                        <span>Sitio Web</span>
                      </a>
                    )}
                  </div>
                </div>

                {selectedBusiness.offers.length > 0 && (
                  <div className="offers-section">
                    <h4>Ofertas Disponibles</h4>
                    <div className="offers-list">
                      {selectedBusiness.offers.map(offer => (
                        <div key={offer.id} className="offer-card">
                          <div className="offer-header">
                            <LocalOfferIcon />
                            <h5>{offer.title}</h5>
                          </div>
                          <p>{offer.description}</p>
                          <div className="offer-details">
                            <span className="offer-discount">{offer.discount}</span>
                            {offer.code && <span className="offer-code">Código: {offer.code}</span>}
                            <span className="offer-validity">Válido hasta: {new Date(offer.validUntil).toLocaleDateString('es-CL')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedBusiness.reviews.length > 0 && (
                  <div className="reviews-section">
                    <h4>Reseñas</h4>
                    <div className="reviews-list">
                      {selectedBusiness.reviews.map(review => (
                        <div key={review.id} className="review-item">
                          <div className="review-header">
                            <img src={review.userAvatar} alt={review.userName} />
                            <div>
                              <span className="review-author">{review.userName}</span>
                              <div className="review-rating">
                                {renderStars(review.rating)}
                              </div>
                            </div>
                          </div>
                          <p className="review-comment">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowDetailsModal(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocalBusinesses;
