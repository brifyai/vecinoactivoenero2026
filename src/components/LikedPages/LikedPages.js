import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import storageService from '../../services/storageService';
import { useReduxAuth as useAuth } from '../../hooks/useReduxAuth';
import './LikedPages.css';

const LikedPages = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pages, setPages] = useState([]);

  useEffect(() => {
    if (user) {
      // Obtener páginas del usuario
      const allPages = storageService.getPages();
      const likedPageIds = storageService.getLikedPages(user.id);
      
      // Filtrar solo las páginas que le gustan al usuario
      const userLikedPages = allPages.filter(page => likedPageIds.includes(page.id));
      setPages(userLikedPages);
    }
  }, [user]);

  const handlePageClick = (pageId) => {
    navigate(`/paginas/${pageId}`);
  };

  return (
    <div className="liked-pages-widget">
      <h3>Páginas que Me Gustan</h3>
      <div className="pages-list">
        {pages.length > 0 ? (
          pages.map((page) => (
            <div 
              key={page.id} 
              className="page-item"
              onClick={() => handlePageClick(page.id)}
              style={{ cursor: 'pointer' }}
            >
              <div className="liked-page-avatar">
                <img src={page.avatar} alt={page.name} />
              </div>
              <div className="page-info">
                <span className="page-name">{page.name}</span>
                <span className="page-likes">{page.likes.toLocaleString()} Me gusta</span>
              </div>
            </div>
          ))
        ) : (
          <p className="no-pages">Aún no te gustan páginas</p>
        )}
      </div>
    </div>
  );
};

export default LikedPages;
