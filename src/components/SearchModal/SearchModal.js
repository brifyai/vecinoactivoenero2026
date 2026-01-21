import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../../context/SearchContext';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PersonIcon from '@mui/icons-material/Person';
import ArticleIcon from '@mui/icons-material/Article';
import './SearchModal.css';

const SearchModal = ({ onClose }) => {
  const navigate = useNavigate();
  const { 
    searchResults, 
    searchHistory, 
    loading, 
    search, 
    loadSearchHistory, 
    clearSearchHistory, 
    getTrendingSearches 
  } = useSearch();
  
  const [searchQuery, setSearchQuery] = useState('');
  const trendingSearches = getTrendingSearches();

  useEffect(() => {
    loadSearchHistory();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      search(query);
    }
  };

  const handleResultClick = (result) => {
    if (result.type === 'user') {
      navigate(`/timeline`);
      onClose();
    } else if (result.type === 'post') {
      navigate('/');
      onClose();
    }
  };

  const handleTrendingClick = (term) => {
    setSearchQuery(term);
    search(term);
  };

  return (
    <div className="search-modal-overlay" onClick={onClose}>
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="search-modal-header">
          <div className="search-input-container">
            <SearchIcon className="search-input-icon" />
            <input
              type="text"
              placeholder="Buscar en Vecino Activo..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              autoFocus
            />
            {searchQuery && (
              <button className="clear-search-btn" onClick={() => handleSearch('')}>
                <CloseIcon fontSize="small" />
              </button>
            )}
          </div>
          <button className="close-modal-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="search-modal-content">
          {loading ? (
            <div className="search-loading">
              <p>Buscando...</p>
            </div>
          ) : searchQuery && searchResults.length > 0 ? (
            <div className="search-results">
              <h4>Resultados</h4>
              {searchResults.map((result) => (
                <div 
                  key={`${result.type}-${result.id}`} 
                  className="search-result-item"
                  onClick={() => handleResultClick(result)}
                >
                  {result.type === 'user' ? (
                    <PersonIcon className="result-icon" />
                  ) : (
                    <ArticleIcon className="result-icon" />
                  )}
                  <img src={result.avatar} alt={result.name} />
                  <div className="result-info">
                    <span className="result-name">{result.name}</span>
                    <span className="result-subtitle">{result.subtitle}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : searchQuery && searchResults.length === 0 ? (
            <div className="no-results">
              <p>No se encontraron resultados para "{searchQuery}"</p>
            </div>
          ) : (
            <>
              {searchHistory.length > 0 && (
                <div className="search-section">
                  <div className="section-header-search">
                    <h4>Búsquedas recientes</h4>
                    <button onClick={clearSearchHistory} className="clear-history-btn">
                      Limpiar
                    </button>
                  </div>
                  <div className="recent-searches">
                    {searchHistory.map((term, index) => (
                      <button 
                        key={index} 
                        className="recent-search-item"
                        onClick={() => handleTrendingClick(term)}
                      >
                        <SearchIcon fontSize="small" />
                        <span>{term}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="search-section">
                <h4><TrendingUpIcon fontSize="small" /> Tendencias</h4>
                <div className="trending-searches">
                  {trendingSearches.map((term, index) => (
                    <button 
                      key={index} 
                      className="trending-item"
                      onClick={() => handleTrendingClick(term)}
                    >
                      <TrendingUpIcon fontSize="small" />
                      <span>{term}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
