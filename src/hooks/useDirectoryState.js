import React, { useState } from 'react';

export function useDirectoryState() {
  const [activeTab, setActiveTab] = useState('services'); // 'services' o 'businesses'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedCategory('all');
    setSearchTerm('');
    setRatingFilter('all');
  };

  return {
    activeTab,
    setActiveTab,
    selectedCategory,
    setSelectedCategory,
    searchTerm,
    setSearchTerm,
    ratingFilter,
    setRatingFilter,
    showAddModal,
    setShowAddModal,
    showFilters,
    setShowFilters,
    showCategoryDropdown,
    setShowCategoryDropdown,
    handleTabChange
  };
}