// Performance utilities for optimizing component loading

/**
 * Debounce function to limit how often a function can be called
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function to limit function calls to once per specified time
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Async function to load data with timeout and retry logic
 */
export const loadWithRetry = async (loadFunction, maxRetries = 3, timeout = 5000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), timeout)
      );
      
      const result = await Promise.race([
        loadFunction(),
        timeoutPromise
      ]);
      
      return result;
    } catch (error) {
      lastError = error;
      console.warn(`Attempt ${attempt} failed:`, error.message);
      
      if (attempt < maxRetries) {
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

/**
 * Lazy loading utility for heavy operations
 */
export const createLazyLoader = (loadFunction) => {
  let promise = null;
  let result = null;
  let error = null;
  
  return {
    load: async () => {
      if (result) return result;
      if (error) throw error;
      if (promise) return promise;
      
      promise = loadFunction()
        .then(data => {
          result = data;
          return data;
        })
        .catch(err => {
          error = err;
          throw err;
        });
      
      return promise;
    },
    reset: () => {
      promise = null;
      result = null;
      error = null;
    }
  };
};

/**
 * Performance monitoring utility with enhanced error handling
 */
export const performanceMonitor = {
  activeMarks: new Set(),
  
  start: function(label) {
    if (typeof performance !== 'undefined') {
      try {
        const markName = `${label}-start`;
        
        // Clear any existing marks with the same name
        if (performanceMonitor.activeMarks.has(label)) {
          performanceMonitor.clearMark(label);
        }
        
        performance.mark(markName);
        performanceMonitor.activeMarks.add(label);
      } catch (error) {
        console.warn(`⚠️ Performance mark failed for ${label}:`, error.message);
      }
    }
  },
  
  end: function(label) {
    if (typeof performance !== 'undefined') {
      try {
        // Verificar que el mark de inicio existe
        if (!performanceMonitor.activeMarks.has(label)) {
          console.warn(`⚠️ Performance start mark '${label}-start' not found. Skipping measurement.`);
          return;
        }
        
        const startMark = performance.getEntriesByName(`${label}-start`);
        if (startMark.length === 0) {
          console.warn(`⚠️ Performance start mark '${label}-start' not found in performance entries. Skipping measurement.`);
          performanceMonitor.activeMarks.delete(label);
          return;
        }
        
        performance.mark(`${label}-end`);
        performance.measure(label, `${label}-start`, `${label}-end`);
        
        const measure = performance.getEntriesByName(label)[0];
        if (measure) {
          console.log(`⏱️ ${label}: ${measure.duration.toFixed(2)}ms`);
        }
        
        // Clean up
        performanceMonitor.clearMark(label);
      } catch (error) {
        console.warn(`⚠️ Performance measurement failed for ${label}:`, error.message);
        performanceMonitor.activeMarks.delete(label);
      }
    }
  },
  
  clearMark: function(label) {
    if (typeof performance !== 'undefined') {
      try {
        performance.clearMarks(`${label}-start`);
        performance.clearMarks(`${label}-end`);
        performance.clearMeasures(label);
        performanceMonitor.activeMarks.delete(label);
      } catch (error) {
        console.warn(`⚠️ Performance clear failed for ${label}:`, error.message);
      }
    }
  },
  
  clearAll: function() {
    if (typeof performance !== 'undefined') {
      try {
        performanceMonitor.activeMarks.forEach(label => {
          performanceMonitor.clearMark(label);
        });
        performanceMonitor.activeMarks.clear();
      } catch (error) {
        console.warn('⚠️ Performance clear all failed:', error.message);
      }
    }
  }
};

/**
 * Memory-efficient array chunking for large datasets
 */
export const chunkArray = (array, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

/**
 * Virtual scrolling helper for large lists
 */
export const createVirtualScrollHelper = (itemHeight, containerHeight, buffer = 5) => {
  return {
    getVisibleRange: (scrollTop, totalItems) => {
      const visibleCount = Math.ceil(containerHeight / itemHeight);
      const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
      const endIndex = Math.min(totalItems - 1, startIndex + visibleCount + buffer * 2);
      
      return { startIndex, endIndex, visibleCount };
    },
    
    getTotalHeight: (totalItems) => totalItems * itemHeight,
    
    getItemTop: (index) => index * itemHeight
  };
};

/**
 * Intersection Observer helper for lazy loading
 */
export const createIntersectionObserver = (callback, options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1
  };
  
  if (typeof IntersectionObserver === 'undefined') {
    // Fallback for environments without IntersectionObserver
    return {
      observe: () => {},
      unobserve: () => {},
      disconnect: () => {}
    };
  }
  
  return new IntersectionObserver(callback, { ...defaultOptions, ...options });
};