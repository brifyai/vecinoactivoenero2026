import React from 'react';
import VerifiedIcon from '@mui/icons-material/Verified';
import StarIcon from '@mui/icons-material/Star';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CancelIcon from '@mui/icons-material/Cancel';
import { serviceIcons } from '../../utils/iconMapping';
import './ServiceCard.css';

const ServiceCard = ({ service, featured }) => {
  const categoryLabels = {
    plomero: 'Plomero',
    electricista: 'Electricista',
    gasfiter: 'Gasfiter',
    carpintero: 'Carpintero',
    pintor: 'Pintor',
    jardinero: 'Jardinero',
    cerrajero: 'Cerrajero',
    tecnico: 'Técnico',
    limpieza: 'Limpieza',
    otro: 'Otro'
  };

  const getCategoryIcon = () => {
    return serviceIcons[service.category] || serviceIcons.otro;
  };

  const getAvatar = () => {
    if (service.avatar) return service.avatar;
    if (service.providerAvatar) return service.providerAvatar;
    return `https://i.pravatar.cc/100?img=${service.id || Math.floor(Math.random() * 70)}`;
  };

  const getDisplayName = () => {
    return service.name || service.providerName || 'Sin nombre';
  };

  const formatAvailability = () => {
    if (service.availability === 'disponible') return { icon: <CheckCircleIcon />, text: 'Disponible' };
    if (service.availability === 'ocupado') return { icon: <HourglassEmptyIcon />, text: 'Ocupado' };
    if (service.availability === 'no_disponible') return { icon: <CancelIcon />, text: 'No disponible' };
    return { icon: <AccessTimeIcon />, text: service.availability || 'No especificado' };
  };

  const formatPrice = () => {
    if (service.hourlyRate) {
      return `$${parseInt(service.hourlyRate).toLocaleString('es-CL')}/hora`;
    }
    return service.priceRange || 'Consultar';
  };

  return (
    <div className={`service-card ${featured ? 'featured' : ''}`}>
      <div className="service-header">
        <img src={getAvatar()} alt={getDisplayName()} className="service-avatar" />
        <div className="service-info">
          <div className="service-name-row">
            <h3>{getDisplayName()}</h3>
            {service.verified && (
              <VerifiedIcon className="verified-icon" titleAccess="Verificado por vecinos" />
            )}
          </div>
          <p className="service-category">
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {getCategoryIcon()}
              {categoryLabels[service.category] || service.category}
            </span>
          </p>
          <div className="service-rating">
            <StarIcon className="star-icon" />
            <span className="rating-value">{(service.rating || 0).toFixed(1)}</span>
            <span className="rating-count">({service.reviews || 0} reseñas)</span>
          </div>
        </div>
      </div>

      {service.description && (
        <p className="service-description">{service.description}</p>
      )}

      <div className="service-details">
        {service.yearsInNeighborhood && (
          <div className="detail-item">
            <span className="detail-label">
              <LocationOnIcon fontSize="small" />
              En el barrio
            </span>
            <span className="detail-value">{service.yearsInNeighborhood} años</span>
          </div>
        )}
        {service.verifiedBy && (
          <div className="detail-item">
            <span className="detail-label">
              <CheckCircleIcon fontSize="small" />
              Verificado por
            </span>
            <span className="detail-value">{service.verifiedBy} vecinos</span>
          </div>
        )}
        <div className="detail-item">
          <span className="detail-label">
            <AttachMoneyIcon fontSize="small" />
            Precio
          </span>
          <span className="detail-value">${formatPrice()}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">
            <AccessTimeIcon fontSize="small" />
            Estado
          </span>
          <span className="detail-value">
            {formatAvailability().text}
          </span>
        </div>
        {service.address && (
          <div className="detail-item">
            <span className="detail-label">
              <LocationOnIcon fontSize="small" />
              Dirección
            </span>
            <span className="detail-value">{service.address}</span>
          </div>
        )}
      </div>

      <div className="service-actions">
        {service.phone && (
          <a href={`tel:${service.phone}`} className="action-btn phone-btn">
            <PhoneIcon />
            <span>Llamar</span>
          </a>
        )}
        {service.email && (
          <a href={`mailto:${service.email}`} className="action-btn email-btn">
            <EmailIcon />
            <span>Email</span>
          </a>
        )}
      </div>
    </div>
  );
};

export default ServiceCard;
