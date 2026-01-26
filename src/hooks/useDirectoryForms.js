import React, { useState } from 'react';

export function useDirectoryForms() {
  const [newService, setNewService] = useState({
    name: '',
    category: 'plomero',
    description: '',
    phone: '',
    email: '',
    address: '',
    hourlyRate: '',
    availability: 'disponible'
  });

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

  const resetServiceForm = () => {
    setNewService({
      name: '',
      category: 'plomero',
      description: '',
      phone: '',
      email: '',
      address: '',
      hourlyRate: '',
      availability: 'disponible'
    });
  };

  const resetBusinessForm = () => {
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

  return {
    newService,
    setNewService,
    newBusiness,
    setNewBusiness,
    resetServiceForm,
    resetBusinessForm
  };
}