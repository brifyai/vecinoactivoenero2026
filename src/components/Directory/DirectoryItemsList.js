import ServiceCard from '../ServiceCard/ServiceCard';
import BusinessCard from './BusinessCard';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';

const DirectoryItemsList = ({ 
  filteredItems, 
  activeTab, 
  categories, 
  selectedCategory, 
  user 
}) => {
  return (
    <div className="services-section">
      <div className="section-header">
        <h2>
          {selectedCategory === 'all' 
            ? `${activeTab === 'services' ? 'Todos los Servicios' : 'Todos los Negocios'} (${filteredItems.length})`
            : `${categories.find(c => c.value === selectedCategory)?.label} (${filteredItems.length})`
          }
        </h2>
      </div>

      {filteredItems.length > 0 ? (
        <div className="services-grid">
          {activeTab === 'services' ? (
            filteredItems.map(service => (
              <ServiceCard key={service.id} service={service} />
            ))
          ) : (
            filteredItems.map(business => (
              <BusinessCard 
                key={business.id} 
                business={business} 
                categories={categories} 
                user={user} 
              />
            ))
          )}
        </div>
      ) : (
        <div className="no-results">
          <div className="no-results-icon">
            <SentimentDissatisfiedIcon style={{ fontSize: '64px', opacity: 0.5 }} />
          </div>
          <h3>No se encontraron {activeTab === 'services' ? 'servicios' : 'negocios'}</h3>
          <p>Intenta con otra categoría o término de búsqueda</p>
        </div>
      )}
    </div>
  );
};

export default DirectoryItemsList;