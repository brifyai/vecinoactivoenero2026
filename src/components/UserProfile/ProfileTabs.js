import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';

const ProfileTabs = ({ activeTab, setActiveTab, searchQuery, setSearchQuery }) => {
  return (
    <div className="timeline-tabs">
      <button 
        className={`tab ${activeTab === 'timeline' ? 'active' : ''}`}
        onClick={() => setActiveTab('timeline')}
      >
        <AccessTimeIcon fontSize="small" /> Línea de tiempo
      </button>
      <button 
        className={`tab ${activeTab === 'photos' ? 'active' : ''}`}
        onClick={() => setActiveTab('photos')}
      >
        <PhotoLibraryIcon fontSize="small" /> Fotos
      </button>
      <div className="tab-right">
        <input 
          type="text" 
          placeholder="Buscar aquí..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </div>
  );
};

export default ProfileTabs;