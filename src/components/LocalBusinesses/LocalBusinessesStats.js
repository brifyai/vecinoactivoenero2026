import React from 'react';
import BarChartIcon from '@mui/icons-material/BarChart';
import StarIcon from '@mui/icons-material/Star';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import { formatNumber } from '../../utils/formatNumber';

const LocalBusinessesStats = ({ businesses }) => {
  const averageRating = businesses.length > 0 
    ? (businesses.reduce((sum, b) => sum + b.rating, 0) / businesses.length).toFixed(1)
    : '0.0';

  const totalReviews = businesses.reduce((sum, b) => sum + b.totalReviews, 0);

  return (
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
          <span className="stat-value">{averageRating}</span>
          <span className="stat-label">Calificación Promedio</span>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">
          <ChatBubbleIcon style={{ fontSize: '28px', color: '#10b981' }} />
        </div>
        <div className="stat-info">
          <span className="stat-value">{formatNumber(totalReviews)}</span>
          <span className="stat-label">Reseñas Totales</span>
        </div>
      </div>
    </div>
  );
};

export default LocalBusinessesStats;