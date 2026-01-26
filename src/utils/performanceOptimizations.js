// ============================================
// OPTIMIZACIONES DE PERFORMANCE
// Utilidades para mejorar el rendimiento de la aplicación
// ============================================

import { memo, useMemo, useCallback, useRef, useEffect, useState } from 'react';

// ============================================
// DEBOUNCE Y THROTTLE
// ============================================

export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useThrottle = (callback, delay) => {
  const lastRun = useRef(Date.now());

  return useCallback((...args) => {
    if (Date.now() - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = Date.now();
    }
  }, [callback, delay]);
};

// ============================================
// INTERSECTION OBSERVER (LAZY LOADING)
// ============================================

export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      if (entry.isIntersecting && !hasIntersected) {
        setHasIntersected(true);
      }
    }, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    });

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [hasIntersected, options]);

  return { elementRef, isIntersecting, hasIntersected };
};

// ============================================
// COMPONENTE DE IMAGEN LAZY
// ============================================

export const LazyImage = memo(({ src, alt, className, placeholder, ...props }) => {
  const { elementRef, hasIntersected } = useIntersectionObserver();
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  return (
    <div ref={elementRef} className={`lazy-image-container ${className || ''}`}>
      {hasIntersected && !hasError && (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`lazy-image ${isLoaded ? 'loaded' : 'loading'}`}
          {...props}
        />
      )}
      {(!hasIntersected || !isLoaded) && !hasError && (
        <div className="lazy-image-placeholder">
          {placeholder || <div className="placeholder-shimmer" />}
        </div>
      )}
      {hasError && (
        <div className="lazy-image-error">
          <span>❌ Error cargando imagen</span>
        </div>
      )}
    </div>
  );
});

// ============================================
// VIRTUAL SCROLLING
// ============================================

export const useVirtualScroll = (items, itemHeight, containerHeight) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    return {
      startIndex,
      endIndex,
      items: items.slice(startIndex, endIndex),
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight
    };
  }, [items, itemHeight, containerHeight, scrollTop]);

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  return { visibleItems, handleScroll };
};

// ============================================
// MEMOIZACIÓN AVANZADA
// ============================================

// HOC para memoización profunda
export const withDeepMemo = (Component) => {
  return memo(Component, (prevProps, nextProps) => {
    return JSON.stringify(prevProps) === JSON.stringify(nextProps);
  });
};

// Hook para memoización de objetos complejos
export const useDeepMemo = (value, deps) => {
  return useMemo(() => value, [JSON.stringify(value), ...deps]);
};

// ============================================
// OPTIMIZACIÓN DE RENDERS
// ============================================

// Hook para prevenir renders innecesarios
export const useStableCallback = (callback, deps) => {
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, deps);
  
  return useCallback((...args) => {
    return callbackRef.current(...args);
  }, []);
};

// Hook para valores estables
export const useStableValue = (value) => {
  const valueRef = useRef(value);
  const [, forceUpdate] = useState({});
  
  if (JSON.stringify(valueRef.current) !== JSON.stringify(value)) {
    valueRef.current = value;
    forceUpdate({});
  }
  
  return valueRef.current;
};

// ============================================
// GESTIÓN DE MEMORIA
// ============================================

// Hook para limpiar recursos
export const useCleanup = (cleanupFn) => {
  const cleanupRef = useRef(cleanupFn);
  
  useEffect(() => {
    cleanupRef.current = cleanupFn;
  }, [cleanupFn]);
  
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);
};

// Hook para detectar memory leaks
export const useMemoryMonitor = (componentName) => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 ${componentName} montado`);
      
      return () => {
        console.log(`🧹 ${componentName} desmontado`);
      };
    }
  }, [componentName]);
};

// ============================================
// OPTIMIZACIÓN DE LISTAS
// ============================================

// Componente optimizado para listas grandes
export const OptimizedList = memo(({ 
  items, 
  renderItem, 
  keyExtractor, 
  itemHeight = 60,
  containerHeight = 400,
  className = ''
}) => {
  const { visibleItems, handleScroll } = useVirtualScroll(items, itemHeight, containerHeight);
  
  return (
    <div 
      className={`optimized-list ${className}`}
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: visibleItems.totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${visibleItems.offsetY}px)` }}>
          {visibleItems.items.map((item, index) => (
            <div key={keyExtractor(item, visibleItems.startIndex + index)}>
              {renderItem(item, visibleItems.startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

// ============================================
// UTILIDADES DE PERFORMANCE
// ============================================

// Medir tiempo de ejecución
export const measurePerformance = (name, fn) => {
  return (...args) => {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ ${name}: ${(end - start).toFixed(2)}ms`);
    }
    
    return result;
  };
};

// Reportar métricas de performance
export const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};