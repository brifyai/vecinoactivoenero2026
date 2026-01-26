import HomeWorkIcon from '@mui/icons-material/HomeWork';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const MapControls = ({
  searchMode,
  showNeighborhoods,
  searchTerm,
  searchingAddress,
  searchResults,
  showSearchResults,
  onSearchModeChange,
  onToggleNeighborhoods,
  onSearch,
  onAddressSearch,
  onClearSearch,
  onSelectUV,
  onFocusSearch
}) => {
  return (
    <div className="landing-map-controls">
      <div className="demo-search-modes">
        <button
          className={`demo-mode-btn ${searchMode === 'uv' ? 'active' : ''}`}
          onClick={() => onSearchModeChange('uv')}
        >
          <HomeWorkIcon fontSize="small" /> Buscar UV
        </button>
        <button
          className={`demo-mode-btn ${searchMode === 'address' ? 'active' : ''}`}
          onClick={() => onSearchModeChange('address')}
        >
          <LocationOnIcon fontSize="small" /> Buscar por Dirección
        </button>
        <button 
          className={`demo-mode-btn ${showNeighborhoods ? 'active' : ''}`}
          onClick={onToggleNeighborhoods}
        >
          {showNeighborhoods ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
          {' '}{showNeighborhoods ? 'Ocultar' : 'Mostrar'} Vecindarios
        </button>
      </div>

      <div className="demo-search-wrapper">
        <input
          type="text"
          className="demo-search-input"
          placeholder={
            searchMode === 'uv'
              ? "Buscar por región, comuna, nombre o código de UV..."
              : "Ingresa tu dirección (ej: Av. Libertador 1234, Santiago)..."
          }
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
          onFocus={onFocusSearch}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && searchMode === 'address') {
              onAddressSearch();
            }
          }}
        />
        {searchTerm && (
          <button className="demo-search-clear" onClick={onClearSearch}>
            <CloseIcon fontSize="small" />
          </button>
        )}
        {searchMode === 'address' ? (
          <button 
            className="demo-search-btn" 
            onClick={onAddressSearch}
            disabled={searchingAddress}
          >
            {searchingAddress ? <HourglassEmptyIcon fontSize="small" /> : <SearchIcon fontSize="small" />}
          </button>
        ) : (
          <span className="demo-search-icon">
            <SearchIcon fontSize="small" />
          </span>
        )}
      </div>

      {showSearchResults && searchResults.length > 0 && (
        <div className="demo-search-results">
          {searchResults.map(uv => (
            <div
              key={uv.id}
              className="demo-search-result-item"
              onClick={() => onSelectUV(uv)}
            >
              <div className="demo-search-result-main">
                <span className="demo-search-result-code">UV {uv.codigo}</span>
                <span className="demo-search-result-name">{uv.nombre}</span>
              </div>
              <div className="demo-search-result-location">
                📍 {uv.comuna}, {uv.region}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MapControls;