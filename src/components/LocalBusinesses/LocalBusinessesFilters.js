import React from 'react';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BuildIcon from '@mui/icons-material/Build';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

const LocalBusinessesFilters = ({ 
  searchQuery, 
  setSearchQuery, 
  categoryFilter, 
  setCategoryFilter 
}) => {
  const categories = [
    { value: 'all', label: 'Todos', icon: <ListAltIcon /> },
    { value: 'comercio', label: 'Comercio', icon: <ShoppingCartIcon />, color: '#3b82f6' },
    { value: 'servicio', label: 'Servicio', icon: <BuildIcon />, color: '#10b981' },
    { value: 'profesional', label: 'Profesional', icon: <MedicalServicesIcon />, color: '#8b5cf6' },
    { value: 'emprendimiento', label: 'Emprendimiento', icon: <LightbulbIcon />, color: '#f59e0b' }
  ];

  return (
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
  );
};

export default LocalBusinessesFilters;