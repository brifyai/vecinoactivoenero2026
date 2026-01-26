import React, { useState } from 'react';

export function useLocalBusinessModals() {
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  const [newBusiness, setNewBusiness] = useState({
    name: '',
    description: '',
    category: 'comercio',
    subcategory: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    whatsapp: '',
    instagram: '',
    facebook: '',
    priceRange: 'medio',
    acceptsCards: false,
    hasDelivery: false
  });

  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: ''
  });

  const [newOffer, setNewOffer] = useState({
    title: '',
    description: '',
    discount: '',
    validUntil: '',
    code: ''
  });

  const openRegisterModal = () => setShowRegisterModal(true);
  const closeRegisterModal = () => {
    setShowRegisterModal(false);
    setNewBusiness({
      name: '',
      description: '',
      category: 'comercio',
      subcategory: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      whatsapp: '',
      instagram: '',
      facebook: '',
      priceRange: 'medio',
      acceptsCards: false,
      hasDelivery: false
    });
  };

  const openReviewModal = (business) => {
    setSelectedBusiness(business);
    setShowReviewModal(true);
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
    setNewReview({ rating: 5, comment: '' });
    setSelectedBusiness(null);
  };

  const openOfferModal = (business) => {
    setSelectedBusiness(business);
    setShowOfferModal(true);
  };

  const closeOfferModal = () => {
    setShowOfferModal(false);
    setNewOffer({
      title: '',
      description: '',
      discount: '',
      validUntil: '',
      code: ''
    });
    setSelectedBusiness(null);
  };

  const openDetailsModal = (business) => {
    setSelectedBusiness(business);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedBusiness(null);
  };

  return {
    // Register Modal
    showRegisterModal,
    openRegisterModal,
    closeRegisterModal,
    newBusiness,
    setNewBusiness,

    // Review Modal
    showReviewModal,
    openReviewModal,
    closeReviewModal,
    newReview,
    setNewReview,

    // Offer Modal
    showOfferModal,
    openOfferModal,
    closeOfferModal,
    newOffer,
    setNewOffer,

    // Details Modal
    showDetailsModal,
    openDetailsModal,
    closeDetailsModal,

    // Selected Business
    selectedBusiness
  };
}