import React, { useState } from 'react';

export function useSharedResourcesModals() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);

  const [newResource, setNewResource] = useState({
    name: '',
    description: '',
    category: 'herramienta',
    subcategory: '',
    condition: 'bueno',
    requiresDeposit: false,
    depositAmount: 0,
    maxLoanDays: 7,
    rules: ''
  });

  const [reservationData, setReservationData] = useState({
    startDate: '',
    endDate: '',
    purpose: ''
  });

  const [completeData, setCompleteData] = useState({
    inGoodCondition: true,
    rating: 5
  });

  const openAddModal = () => setShowAddModal(true);
  const closeAddModal = () => {
    setShowAddModal(false);
    setNewResource({
      name: '',
      description: '',
      category: 'herramienta',
      subcategory: '',
      condition: 'bueno',
      requiresDeposit: false,
      depositAmount: 0,
      maxLoanDays: 7,
      rules: ''
    });
  };

  const openReserveModal = (resource) => {
    setSelectedResource(resource);
    setShowReserveModal(true);
  };

  const closeReserveModal = () => {
    setShowReserveModal(false);
    setReservationData({ startDate: '', endDate: '', purpose: '' });
    setSelectedResource(null);
  };

  const openCompleteModal = (reservation) => {
    setSelectedReservation(reservation);
    setShowCompleteModal(true);
  };

  const closeCompleteModal = () => {
    setShowCompleteModal(false);
    setCompleteData({ inGoodCondition: true, rating: 5 });
    setSelectedReservation(null);
  };

  return {
    // Add Modal
    showAddModal,
    openAddModal,
    closeAddModal,
    newResource,
    setNewResource,

    // Reserve Modal
    showReserveModal,
    openReserveModal,
    closeReserveModal,
    selectedResource,
    reservationData,
    setReservationData,

    // Complete Modal
    showCompleteModal,
    openCompleteModal,
    closeCompleteModal,
    selectedReservation,
    completeData,
    setCompleteData
  };
}