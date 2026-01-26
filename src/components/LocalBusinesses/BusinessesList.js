import React from 'react';
import StarIcon from '@mui/icons-material/Star';
import PhoneIcon from '@mui/icons-material/Phone';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BuildIcon from '@mui/icons-material/Build';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

const BusinessesList = ({ 
  businesses, 
  user, 
  onOpenDetails, 
  onOpenReview, 
  onOpenOffer 
}) => {
  const categories = [
    { value: 'all', label: 'Todos', icon: <ListAltIcon /> },
    { value: 'comercio', label: 'Comercio', icon: <ShoppingCartIcon />, color: '#3b82f6' },
    { value: 'servicio', label: 'Servicio', icon: <BuildIcon />, color: '#10b981' },
    { value: 'profesional', label: 'Profesional', icon: <MedicalServicesIcon />, color: '#8b5cf6' },
    { value: 'emprendimiento', label: 'Emprendimiento', icon: <LightbulbIcon />, color: '#f59e0b' }
  ];

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon 
        key={i} 
        fontSize="small"
        style={{ color: i < rating ? '#f59e0b' : '#e4e6eb' }}
      />
    ));
  };

  const getPriceSymbol = (priceRange) => {
    switch (priceRange) {
      case 'bajo': return '$';
      case 'medio': return '$$';
      case 'alto': return '$$$';
      default: return '$';
    }
  };

  if (businesses.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <StorefrontIcon style={{ fontSize: '64px', opacity: 0.3 }} />
        </div>
        <h3>No hay negocios registrados</h3>
        <p>Sé el primero en registrar tu negocio</p>
      </div>
    );
  }

  return (
    <div className="businesses-grid">
      {businesses.map(business => {
        const categoryInfo = categories.find(c => c.value === business.category);
        const isOwner = business.ownerId === user?.id;

        return (
          <div 
            key={business.id} 
            className="business-card"
            onClick={() => onOpenDetails(business)}
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
              <span className="price-badge">{getPriceSymbol(business.priceRange)}</span>
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
                  onClick={() => onOpenReview(business)}
                >
                  <StarIcon fontSize="small" />
                  Dejar Reseña
                </button>
              )}
              {isOwner && (
                <button 
                  className="offer-btn"
                  onClick={() => onOpenOffer(business)}
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
      })}
    </div>
  );
};

export default BusinessesList;