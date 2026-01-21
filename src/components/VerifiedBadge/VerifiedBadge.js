import React from 'react';
import VerifiedIcon from '@mui/icons-material/Verified';
import './VerifiedBadge.css';

const VerifiedBadge = ({ size = 'small', showText = false, className = '' }) => {
  const sizeMap = {
    small: 16,
    medium: 20,
    large: 24
  };

  return (
    <span className={`verified-badge ${className}`} title="Vecino Verificado">
      <VerifiedIcon 
        style={{ 
          fontSize: sizeMap[size], 
          color: '#f97316' 
        }} 
      />
      {showText && <span className="verified-text">Verificado</span>}
    </span>
  );
};

export default VerifiedBadge;
