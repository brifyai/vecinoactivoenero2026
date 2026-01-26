export function useDirectoryFilters(services, businesses, selectedCategory, searchTerm, ratingFilter, activeTab) {
  const filteredServices = services.filter(service => {
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = ratingFilter === 'all' || service.rating >= parseInt(ratingFilter);
    return matchesCategory && matchesSearch && matchesRating;
  });

  const filteredBusinesses = businesses.filter(business => {
    const matchesCategory = selectedCategory === 'all' || business.category === selectedCategory;
    const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         business.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = ratingFilter === 'all' || business.rating >= parseInt(ratingFilter);
    return matchesCategory && matchesSearch && matchesRating;
  });

  const filteredItems = activeTab === 'services' ? filteredServices : filteredBusinesses;

  const getCategoryCount = (categoryValue) => {
    const items = activeTab === 'services' ? services : businesses;
    return items.filter(s => s.category === categoryValue).length;
  };

  return {
    filteredServices,
    filteredBusinesses,
    filteredItems,
    getCategoryCount
  };
}