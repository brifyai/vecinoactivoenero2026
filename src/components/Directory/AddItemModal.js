import CloseIcon from '@mui/icons-material/Close';
import ServiceForm from './ServiceForm';
import BusinessForm from './BusinessForm';

const AddItemModal = ({ 
  showModal, 
  activeTab, 
  onClose, 
  newService, 
  setNewService, 
  newBusiness, 
  setNewBusiness, 
  onAddService, 
  onAddBusiness,
  serviceCategories,
  businessCategories 
}) => {
  if (!showModal) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{activeTab === 'services' ? 'Agregar Servicio' : 'Registrar Negocio'}</h2>
          <button className="close-modal" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <div className="modal-body">
          {activeTab === 'services' ? (
            <ServiceForm 
              newService={newService}
              setNewService={setNewService}
              serviceCategories={serviceCategories}
            />
          ) : (
            <BusinessForm 
              newBusiness={newBusiness}
              setNewBusiness={setNewBusiness}
              businessCategories={businessCategories}
            />
          )}
        </div>
        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancelar
          </button>
          <button 
            className="submit-btn" 
            onClick={activeTab === 'services' ? onAddService : onAddBusiness}
          >
            {activeTab === 'services' ? 'Agregar Servicio' : 'Registrar Negocio'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddItemModal;