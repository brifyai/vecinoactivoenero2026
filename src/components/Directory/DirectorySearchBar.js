import SearchIcon from '@mui/icons-material/Search';

const DirectorySearchBar = ({ 
  searchTerm, 
  onSearchChange, 
  categories, 
  selectedCategory, 
  showCategoryDropdown, 
  onToggleDropdown, 
  onCategorySelect, 
  getCategoryCount, 
  activeTab, 
  totalServices, 
  totalBusinesses 
}) => {
  return (
    <div className="search-filter-bar">
      <div style={{ position: 'relative', flex: 1 }}>
        <SearchIcon className="search-icon" />
        <input
          type="text"
          placeholder="Buscar por nombre o servicio..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
      </div>
      
      <div className="category-dropdown-wrapper">
        <button 
          className="category-dropdown-btn"
          onClick={onToggleDropdown}
        >
          <span className="category-label">
            {categories.find(c => c.value === selectedCategory)?.label}
          </span>
          <span className="category-count">
            {selectedCategory === 'all' ? (activeTab === 'services' ? totalServices : totalBusinesses) : getCategoryCount(selectedCategory)}
          </span>
        </button>
        
        {showCategoryDropdown && (
          <div className="category-dropdown-menu">
            {categories.map(category => {
              const count = category.value === 'all' ? (activeTab === 'services' ? totalServices : totalBusinesses) : getCategoryCount(category.value);
              const isSelected = selectedCategory === category.value;
              
              return (
                <button
                  key={category.value}
                  className={`category-dropdown-item ${isSelected ? 'active' : ''}`}
                  onClick={() => onCategorySelect(category.value)}
                >
                  <span className="item-icon">{category.icon}</span>
                  <span className="item-label">{category.label}</span>
                  <span className="item-count">{count}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectorySearchBar;