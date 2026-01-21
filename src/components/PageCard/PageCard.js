import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PageCard.css';

const PageCard = ({ page, isLiked, onToggleFollow, onInvite }) => {
  const navigate = useNavigate();

  const handlePageClick = (e) => {
    // Si se hace click en los botones, no navegar
    if (e.target.closest('.btn-follow') || e.target.closest('.btn-invite')) {
      return;
    }
    navigate(`/paginas/${page.id}`);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num?.toLocaleString() || '0';
  };

  return (
    <div className="page-card" onClick={handlePageClick} style={{ cursor: 'pointer' }}>
      <div className="page-image">
        <img src={page.cover || page.image} alt={page.name} />
        <div className="page-avatar">
          <img src={page.avatar} alt={page.name} />
        </div>
      </div>
      
      <div className="page-info">
        <h3>{page.name}</h3>
        <p className="page-category">{page.category}</p>
        
        <div className="page-stats">
          <div className="page-stat">
            <span className="stat-number">{formatNumber(page.likes)}</span>
            <span className="stat-label">Me gusta</span>
          </div>
        </div>
        
        <div className="page-actions">
          <button 
            className={`btn-follow ${isLiked ? 'followed' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFollow();
            }}
          >
            {isLiked ? 'Siguiendo' : 'Seguir'}
          </button>
          <button 
            className="btn-invite" 
            onClick={(e) => {
              e.stopPropagation();
              onInvite();
            }}
          >
            Invitar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PageCard;
