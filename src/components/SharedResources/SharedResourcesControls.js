import React from 'react';
import ListAltIcon from '@mui/icons-material/ListAlt';
import BuildIcon from '@mui/icons-material/Build';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import HomeIcon from '@mui/icons-material/Home';
import HelpIcon from '@mui/icons-material/Help';

const SharedResourcesControls = ({ 
  view, 
  setView, 
  searchTerm, 
  setSearchTerm, 
  categoryFilter, 
  setCategoryFilter, 
  getPendingRequests 
}) => {
  const categories = [
    { value: 'all', label: 'Todos', icon: <ListAltIcon /> },
    { value: 'herramienta', label: 'Herramientas', icon: <BuildIcon /> },
    { value: 'equipo', label: 'Equipos', icon: <Inventory2Icon /> },
    { value: 'libro', label: 'Libros', icon: <MenuBookIcon /> },
    { value: 'juego', label: 'Juegos', icon: <SportsEsportsIcon /> },
    { value: 'espacio', label: 'Espacios', icon: <HomeIcon /> },
    { value: 'otro', label: 'Otro', icon: <HelpIcon /> }
  ];

  return (
    <>
      <div className="resources-controls">
        <div className="view-tabs">
          <button
            className={view === 'all' ? 'active' : ''}
            onClick={() => setView('all')}
          >
            Todos los Recursos
          </button>
          <button
            className={view === 'my-resources' ? 'active' : ''}
            onClick={() => setView('my-resources')}
          >
            Mis Recursos
          </button>
          <button
            className={view === 'my-reservations' ? 'active' : ''}
            onClick={() => setView('my-reservations')}
          >
            Mis Reservas
          </button>
          <button
            className={view === 'pending' ? 'active' : ''}
            onClick={() => setView('pending')}
          >
            Solicitudes Pendientes
            {getPendingRequests().length > 0 && (
              <span className="badge">{getPendingRequests().length}</span>
            )}
          </button>
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar recursos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {(view === 'all' || view === 'my-resources') && (
        <div className="category-filters">
          {categories.map(cat => (
            <button
              key={cat.value}
              className={`category-btn ${categoryFilter === cat.value ? 'active' : ''}`}
              onClick={() => setCategoryFilter(cat.value)}
            >
              <span className="cat-icon">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
};

export default SharedResourcesControls;