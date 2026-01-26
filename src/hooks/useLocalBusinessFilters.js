import React, { useState, useMemo } from 'react';

export function useLocalBusinessFilters(businesses, searchBusinesses) {
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBusinesses = useMemo(() => {
    let filtered = businesses;

    if (searchQuery) {
      filtered = searchBusinesses(searchQuery);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(b => b.category === categoryFilter);
    }

    return filtered.sort((a, b) => b.rating - a.rating);
  }, [businesses, searchQuery, categoryFilter, searchBusinesses]);

  return {
    categoryFilter,
    setCategoryFilter,
    searchQuery,
    setSearchQuery,
    filteredBusinesses
  };
}