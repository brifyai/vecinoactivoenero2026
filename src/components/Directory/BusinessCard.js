import StarIcon from '@mui/icons-material/Star';
import PhoneIcon from '@mui/icons-material/Phone';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

const BusinessCard = ({ business, categories, user }) => {
  const categoryInfo = categories.find(c => c.value === business.category);
  const isOwner = business.ownerId === user?.id;

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
    <div className="business-card">
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
};

export default BusinessCard;