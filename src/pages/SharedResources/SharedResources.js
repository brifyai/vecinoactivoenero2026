import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useReduxSharedResources } from '../../hooks/useReduxSharedResources';
import { useReduxAuth as useAuth } from '../../hooks/useReduxAuth';
import { useSidebar } from '../../context/SidebarContext';
import { useReduxGamification } from '../../hooks/useReduxGamification';
import { useSharedResourcesFilters } from '../../hooks/useSharedResourcesFilters';
import { useSharedResourcesModals } from '../../hooks/useSharedResourcesModals';
import SharedResourcesHeader from '../../components/SharedResources/SharedResourcesHeader';
import SharedResourcesStats from '../../components/SharedResources/SharedResourcesStats';
import SharedResourcesControls from '../../components/SharedResources/SharedResourcesControls';
import ResourcesList from '../../components/SharedResources/ResourcesList';
import ReservationsList from '../../components/SharedResources/ReservationsList';
import AddResourceModal from '../../components/SharedResources/AddResourceModal';
import ReserveResourceModal from '../../components/SharedResources/ReserveResourceModal';
import CompleteReservationModal from '../../components/SharedResources/CompleteReservationModal';
import './SharedResources.css';

const SharedResources = ({ hideHeader = false, hideStats = false }) => {
  const { user } = useAuth();
  const { isRightSidebarCollapsed } = useSidebar();
  const {
    resources,
    reservations,
    addResource,
    reserveResource,
    approveReservation,
    completeReservation,
    cancelReservation,
    getMyResources,
    getMyReservations,
    getPendingRequests
  } = useReduxSharedResources();
  const { addPoints, updateActivity } = useReduxGamification();
  const navigate = useNavigate();

  // Use custom hooks for filters and modals
  const {
    view,
    setView,
    categoryFilter,
    setCategoryFilter,
    searchTerm,
    setSearchTerm,
    filteredItems
  } = useSharedResourcesFilters(resources, reservations, getMyResources, getMyReservations, getPendingRequests);

  const {
    showAddModal,
    openAddModal,
    closeAddModal,
    newResource,
    setNewResource,
    showReserveModal,
    openReserveModal,
    closeReserveModal,
    selectedResource,
    reservationData,
    setReservationData,
    showCompleteModal,
    openCompleteModal,
    closeCompleteModal,
    selectedReservation,
    completeData,
    setCompleteData
  } = useSharedResourcesModals();

  // Event handlers
  const handleAddResource = () => {
    if (!newResource.name || !newResource.description) return;

    const result = addResource(newResource);
    if (result.success) {
      addPoints('RESOURCE_SHARED');
      updateActivity('resourcesShared');
      closeAddModal();
      navigate(`/recursos/${result.resource.slug}`);
    }
  };

  const handleReserve = () => {
    if (!reservationData.startDate || !reservationData.endDate || !selectedResource) return;

    const result = reserveResource(selectedResource.id, reservationData);
    if (result.success) {
      closeReserveModal();
    }
  };

  const handleComplete = () => {
    if (!selectedReservation) return;

    completeReservation(selectedReservation.id, completeData);
    closeCompleteModal();
  };

  return (
    <div className={`shared-resources-page ${isRightSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {!hideHeader && (
        <SharedResourcesHeader onAddResource={openAddModal} />
      )}

      {!hideStats && (
        <SharedResourcesStats 
          resources={resources}
          reservations={reservations}
          getPendingRequests={getPendingRequests}
        />
      )}

      <SharedResourcesControls
        view={view}
        setView={setView}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        getPendingRequests={getPendingRequests}
      />

      {(view === 'my-reservations' || view === 'pending') ? (
        <ReservationsList
          reservations={filteredItems}
          resources={resources}
          user={user}
          view={view}
          onApproveReservation={approveReservation}
          onCancelReservation={cancelReservation}
          onCompleteReservation={openCompleteModal}
        />
      ) : (
        <ResourcesList
          resources={filteredItems}
          user={user}
          onReserveResource={openReserveModal}
        />
      )}

      <AddResourceModal
        show={showAddModal}
        onClose={closeAddModal}
        newResource={newResource}
        setNewResource={setNewResource}
        onSubmit={handleAddResource}
      />

      <ReserveResourceModal
        show={showReserveModal}
        onClose={closeReserveModal}
        selectedResource={selectedResource}
        reservationData={reservationData}
        setReservationData={setReservationData}
        onSubmit={handleReserve}
      />

      <CompleteReservationModal
        show={showCompleteModal}
        onClose={closeCompleteModal}
        selectedReservation={selectedReservation}
        completeData={completeData}
        setCompleteData={setCompleteData}
        onSubmit={handleComplete}
      />
    </div>
  );
};

export default SharedResources;
