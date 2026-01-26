import React, { useState, useEffect, useCallback, useRef } from 'react';

const useInfiniteScroll = (items, itemsPerPage = 10) => {
  const [displayedItems, setDisplayedItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);
  
  // Usar refs para evitar recrear callbacks
  const pageRef = useRef(page);
  const hasMoreRef = useRef(hasMore);
  const isLoadingRef = useRef(isLoading);
  
  // Mantener refs sincronizados
  useEffect(() => { pageRef.current = page; }, [page]);
  useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);
  useEffect(() => { isLoadingRef.current = isLoading; }, [isLoading]);

  // Inicializar items
  useEffect(() => {
    setDisplayedItems(items.slice(0, itemsPerPage));
    setPage(1);
    setHasMore(items.length > itemsPerPage);
  }, [items, itemsPerPage]);

  // Cargar más items
  const loadMore = useCallback(() => {
    if (isLoadingRef.current || !hasMoreRef.current) return;

    setIsLoading(true);
    
    // Simular delay de carga más corto
    setTimeout(() => {
      const nextPage = pageRef.current + 1;
      const startIndex = 0;
      const endIndex = nextPage * itemsPerPage;
      const newItems = items.slice(startIndex, endIndex);
      
      setDisplayedItems(newItems);
      setPage(nextPage);
      setHasMore(endIndex < items.length);
      setIsLoading(false);
    }, 300); // Reducido de 500ms a 300ms
  }, [items, itemsPerPage]);

  // Configurar Intersection Observer
  useEffect(() => {
    // Si no hay más items, no configurar el observer
    if (!hasMoreRef.current) {
      if (observerRef.current && loadMoreRef.current) {
        observerRef.current.unobserve(loadMoreRef.current);
      }
      return;
    }

    const options = {
      root: null,
      rootMargin: '100px',
      threshold: 0.1
    };

    observerRef.current = new IntersectionObserver((entries) => {
      const target = entries[0];
      if (target.isIntersecting && hasMoreRef.current && !isLoadingRef.current) {
        loadMore();
      }
    }, options);

    const currentLoadMoreRef = loadMoreRef.current;
    if (currentLoadMoreRef) {
      observerRef.current.observe(currentLoadMoreRef);
    }

    return () => {
      if (observerRef.current && currentLoadMoreRef) {
        observerRef.current.unobserve(currentLoadMoreRef);
      }
    };
  }, [loadMore]);

  return {
    displayedItems,
    hasMore,
    isLoading,
    loadMoreRef
  };
};

export default useInfiniteScroll;
