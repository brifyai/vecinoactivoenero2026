import React, { useState, useMemo } from 'react';

export function useSharedResourcesFilters(resources, reservations, getMyResources, getMyReservations, getPendingRequests) {
  const [view, setView] = useState('all'); // all, my-resources, my-reservations, pending
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = useMemo(() => {
    let filtered = [];

    if (view === 'my-resources') {
      filtered = getMyResources();
    } else if (view === 'my-reservations') {
      return getMyReservations();
    } else if (view === 'pending') {
      return getPendingRequests();
    } else {
      filtered = resources.filter(r => r.isAvailable);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(r => r.category === categoryFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [view, categoryFilter, searchTerm, resources, reservations, getMyResources, getMyReservations, getPendingRequests]);

  return {
    view,
    setView,
    categoryFilter,
    setCategoryFilter,
    searchTerm,
    setSearchTerm,
    filteredItems
  };
}