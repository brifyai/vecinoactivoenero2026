import React from 'react';
import { useReduxLocalBusiness } from '../../hooks/useReduxLocalBusiness';
import { useReduxAuth as useAuth } from '../../hooks/useReduxAuth';
import { useSidebar } from '../../context/SidebarContext';
import { useReduxGamification } from '../../hooks/useReduxGamification';
import { useLocalBusinessFilters } from '../../hooks/useLocalBusinessFilters';
import { useLocalBusinessModals } from '../../hooks/useLocalBusinessModals';
import LocalBusinessesHeader from '../../components/LocalBusinesses/LocalBusinessesHeader';
import LocalBusinessesStats from '../../components/LocalBusinesses/LocalBusinessesStats';
import LocalBusinessesFilters from '../../components/LocalBusinesses/LocalBusinessesFilters';
import BusinessesList from '../../components/LocalBusinesses/BusinessesList';
import RegisterBusinessModal from '../../components/LocalBusinesses/RegisterBusinessModal';
import ReviewModal from '../../components/LocalBusinesses/ReviewModal';
import OfferModal from '../../components/LocalBusinesses/OfferModal';
import BusinessDetailsModal from '../../components/LocalBusinesses/BusinessDetailsModal';
import './LocalBusinesses.css';

const LocalBusinesses = () => {
  const { user } = useAuth();
  const { isRightSidebarCollapsed } = useSidebar();
  const { businesses, registerBusiness, addReview, createOffer, searchBusinesses } = useReduxLocalBusiness();
  const { addPoints, updateActivity } = useReduxGamification();
  
  // Use custom hooks for filters and modals
  const {
    categoryFilter,
    setCategoryFilter,
    searchQuery,
    setSearchQuery,
    filteredBusinesses
  } = useLocalBusinessFilters(businesses, searchBusinesses);

  const {
    showRegisterModal,
    openRegisterModal,
    closeRegisterModal,
    newBusiness,
    setNewBusiness,
    showReviewModal,
    openReviewModal,
    closeReviewModal,
    newReview,
    setNewReview,
    showOfferModal,
    openOfferModal,
    closeOfferModal,
    newOffer,
    setNewOffer,
    showDetailsModal,
    openDetailsModal,
    closeDetailsModal,
    selectedBusiness
  } = useLocalBusinessModals();

  // Event handlers
  const handleRegisterBusiness = () => {
    if (!newBusiness.name || !newBusiness.description) return;

    const result = registerBusiness(newBusiness);
    if (result.success) {
      addPoints('RESOURCE_SHARED');
      updateActivity('resourcesShared');
      closeRegisterModal();
    }
  };

  const handleAddReview = () => {
    if (!newReview.comment || !selectedBusiness) return;

    addReview(selectedBusiness.id, newReview);
    addPoints('REVIEW_WRITTEN');
    updateActivity('reviewsWritten');
    closeReviewModal();
  };

  const handleCreateOffer = () => {
    if (!newOffer.title || !selectedBusiness) return;

    createOffer(selectedBusiness.id, newOffer);
    closeOfferModal();
  };

  return (
    <div className={`businesses-page ${isRightSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <LocalBusinessesHeader onRegisterBusiness={openRegisterModal} />

      <LocalBusinessesStats businesses={businesses} />

      <LocalBusinessesFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
      />

      <BusinessesList
        businesses={filteredBusinesses}
        user={user}
        onOpenDetails={openDetailsModal}
        onOpenReview={openReviewModal}
        onOpenOffer={openOfferModal}
      />

      <RegisterBusinessModal
        show={showRegisterModal}
        onClose={closeRegisterModal}
        newBusiness={newBusiness}
        setNewBusiness={setNewBusiness}
        onSubmit={handleRegisterBusiness}
      />

      <ReviewModal
        show={showReviewModal}
        onClose={closeReviewModal}
        selectedBusiness={selectedBusiness}
        newReview={newReview}
        setNewReview={setNewReview}
        onSubmit={handleAddReview}
      />

      <OfferModal
        show={showOfferModal}
        onClose={closeOfferModal}
        selectedBusiness={selectedBusiness}
        newOffer={newOffer}
        setNewOffer={setNewOffer}
        onSubmit={handleCreateOffer}
      />

      <BusinessDetailsModal
        show={showDetailsModal}
        onClose={closeDetailsModal}
        selectedBusiness={selectedBusiness}
      />
    </div>
  );
};

export default LocalBusinesses;