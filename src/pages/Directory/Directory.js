import { useReduxServices } from '../../hooks/useReduxServices';
import { useReduxLocalBusiness } from '../../hooks/useReduxLocalBusiness';
import { useReduxAuth as useAuth } from '../../hooks/useReduxAuth';
import { useSidebar } from '../../context/SidebarContext';
import { useReduxGamification } from '../../hooks/useReduxGamification';
import { useDirectoryState } from '../../hooks/useDirectoryState';
import { useDirectoryFilters } from '../../hooks/useDirectoryFilters';
import { useDirectoryForms } from '../../hooks/useDirectoryForms';
import DirectoryHeader from '../../components/Directory/DirectoryHeader';
import DirectoryTabs from '../../components/Directory/DirectoryTabs';
import DirectoryInfoBanner from '../../components/Directory/DirectoryInfoBanner';
import DirectorySearchBar from '../../components/Directory/DirectorySearchBar';
import DirectoryItemsList from '../../components/Directory/DirectoryItemsList';
import AddItemModal from '../../components/Directory/AddItemModal';
import { directoryCategories } from '../../utils/directoryCategories';
import './Directory.css';

const Directory = () => {
  const { user } = useAuth();
  const { services, addService } = useReduxServices();
  const { businesses, registerBusiness } = useReduxLocalBusiness();
  const { addPoints, updateActivity } = useReduxGamification();
  const { isRightSidebarCollapsed } = useSidebar();
  
  // Custom hooks
  const {
    activeTab,
    selectedCategory,
    setSelectedCategory,
    searchTerm,
    setSearchTerm,
    showAddModal,
    setShowAddModal,
    showCategoryDropdown,
    setShowCategoryDropdown,
    handleTabChange
  } = useDirectoryState();

  const {
    newService,
    setNewService,
    newBusiness,
    setNewBusiness,
    resetServiceForm,
    resetBusinessForm
  } = useDirectoryForms();

  const {
    filteredItems,
    getCategoryCount
  } = useDirectoryFilters(services, businesses, selectedCategory, searchTerm, 'all', activeTab);

  // Get categories based on active tab
  const { serviceCategories, businessCategories } = directoryCategories;
  const categories = activeTab === 'services' ? serviceCategories : businessCategories;
  
  const totalServices = services.length;
  const totalBusinesses = businesses.length;

  // Event handlers
  const handleAddService = () => {
    if (!newService.name || !newService.phone) return;

    const serviceData = {
      ...newService,
      providerId: user?.id,
      providerName: user?.name,
      providerAvatar: user?.avatar,
      neighborhoodId: user?.neighborhoodId,
      neighborhoodName: user?.neighborhoodName,
      rating: 0,
      reviews: [],
      verified: false
    };

    addService(serviceData);
    setShowAddModal(false);
    resetServiceForm();
  };

  const handleAddBusiness = () => {
    if (!newBusiness.name || !newBusiness.description) return;

    const result = registerBusiness(newBusiness);
    if (result.success) {
      addPoints('RESOURCE_SHARED');
      updateActivity('resourcesShared');
      setShowAddModal(false);
      resetBusinessForm();
    }
  };

  const handleCategorySelect = (categoryValue) => {
    setSelectedCategory(categoryValue);
    setShowCategoryDropdown(false);
  };

  const handleToggleDropdown = () => {
    setShowCategoryDropdown(!showCategoryDropdown);
  };

  return (
    <div className={`directory-page ${isRightSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <DirectoryHeader 
        activeTab={activeTab} 
        onAddClick={() => setShowAddModal(true)} 
      />

      <DirectoryTabs 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
      />

      <DirectoryInfoBanner activeTab={activeTab} />

      <DirectorySearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        categories={categories}
        selectedCategory={selectedCategory}
        showCategoryDropdown={showCategoryDropdown}
        onToggleDropdown={handleToggleDropdown}
        onCategorySelect={handleCategorySelect}
        getCategoryCount={getCategoryCount}
        activeTab={activeTab}
        totalServices={totalServices}
        totalBusinesses={totalBusinesses}
      />

      <DirectoryItemsList
        filteredItems={filteredItems}
        activeTab={activeTab}
        categories={categories}
        selectedCategory={selectedCategory}
        user={user}
      />

      <AddItemModal
        showModal={showAddModal}
        activeTab={activeTab}
        onClose={() => setShowAddModal(false)}
        newService={newService}
        setNewService={setNewService}
        newBusiness={newBusiness}
        setNewBusiness={setNewBusiness}
        onAddService={handleAddService}
        onAddBusiness={handleAddBusiness}
        serviceCategories={serviceCategories}
        businessCategories={businessCategories}
      />
    </div>
  );
};

export default Directory;
