import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LanguageIcon from '@mui/icons-material/Language';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

const BusinessDetailsModal = ({ 
  show, 
  onClose, 
  selectedBusiness 
}) => {
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon 
        key={i} 
        fontSize="small"
        style={{ color: i < rating ? '#f59e0b' : '#e4e6eb' }}
      />
    ));
  };

  if (!show || !selectedBusiness) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{selectedBusiness.name}</h2>
          <button className="close-modal" onClick={onClose}>
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
                  <a 
                    href={`https://wa.me/${selectedBusiness.whatsapp.replace(/\D/g, '')}`} 
                    className="contact-item" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <WhatsAppIcon />
                    <span>WhatsApp</span>
                  </a>
                )}
                {selectedBusiness.instagram && (
                  <a 
                    href={`https://instagram.com/${selectedBusiness.instagram.replace('@', '')}`} 
                    className="contact-item" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <InstagramIcon />
                    <span>{selectedBusiness.instagram}</span>
                  </a>
                )}
                {selectedBusiness.facebook && (
                  <a 
                    href={selectedBusiness.facebook} 
                    className="contact-item" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <FacebookIcon />
                    <span>Facebook</span>
                  </a>
                )}
                {selectedBusiness.website && (
                  <a 
                    href={selectedBusiness.website} 
                    className="contact-item" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <LanguageIcon />
                    <span>Sitio Web</span>
                  </a>
                )}
              </div>
            </div>

            {selectedBusiness.offers && selectedBusiness.offers.length > 0 && (
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
                        <span className="offer-validity">
                          Válido hasta: {new Date(offer.validUntil).toLocaleDateString('es-CL')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedBusiness.reviews && selectedBusiness.reviews.length > 0 && (
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
          <button className="cancel-btn" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default BusinessDetailsModal;