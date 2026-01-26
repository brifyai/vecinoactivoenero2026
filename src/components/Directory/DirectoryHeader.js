import AddIcon from '@mui/icons-material/Add';
import WorkIcon from '@mui/icons-material/Work';
import StorefrontIcon from '@mui/icons-material/Storefront';

const DirectoryHeader = ({ activeTab, onAddClick }) => {
  return (
    <div className="directory-header">
      <div className="header-content">
        <div className="header-title-section">
          <h1>
            {activeTab === 'services' ? (
              <><WorkIcon className="page-title-icon" /> Directorio de Servicios</>
            ) : (
              <><StorefrontIcon className="page-title-icon" /> Negocios Locales</>
            )}
          </h1>
          <p>
            {activeTab === 'services' 
              ? 'Encuentra profesionales verificados por tus vecinos'
              : 'Apoya la economía de tu barrio'
            }
          </p>
        </div>
      </div>
      <button className="add-service-btn" onClick={onAddClick}>
        <AddIcon />
        <span>{activeTab === 'services' ? 'Agregar Servicio' : 'Registrar Negocio'}</span>
      </button>
    </div>
  );
};

export default DirectoryHeader;