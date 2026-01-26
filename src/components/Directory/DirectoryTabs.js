import WorkIcon from '@mui/icons-material/Work';
import StorefrontIcon from '@mui/icons-material/Storefront';

const DirectoryTabs = ({ activeTab, onTabChange }) => {
  return (
    <div className="directory-tabs">
      <button 
        className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`}
        onClick={() => onTabChange('services')}
      >
        <WorkIcon />
        Servicios Profesionales
      </button>
      <button 
        className={`tab-btn ${activeTab === 'businesses' ? 'active' : ''}`}
        onClick={() => onTabChange('businesses')}
      >
        <StorefrontIcon />
        Negocios Locales
      </button>
    </div>
  );
};

export default DirectoryTabs;