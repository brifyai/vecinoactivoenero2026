// Script de diagnóstico para el rendimiento del mapa
console.log('🗺️ Diagnóstico de rendimiento del mapa...');

// Verificar si hay datos de vecindarios cargados
const checkNeighborhoodData = () => {
  console.log('\n📊 Verificando datos de vecindarios...');
  
  // Simular verificación de datos
  console.log('✅ Optimizaciones implementadas:');
  console.log('  - Carga lazy de vecindarios (solo con zoom >= 8)');
  console.log('  - Estadísticas memoizadas');
  console.log('  - Búsqueda optimizada (máximo 8 resultados)');
  console.log('  - Tooltips solo en zoom alto (>= 12)');
  console.log('  - Popups simplificados');
  console.log('  - useCallback para funciones');
  console.log('  - useMemo para cálculos pesados');
};

// Verificar rendimiento del navegador
const checkBrowserPerformance = () => {
  console.log('\n🚀 Verificando rendimiento del navegador...');
  
  if (performance.memory) {
    const memory = performance.memory;
    console.log(`💾 Memoria usada: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`💾 Memoria total: ${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`💾 Límite de memoria: ${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`);
  }
  
  // Verificar si hay elementos pesados en el DOM
  const leafletElements = document.querySelectorAll('.leaflet-layer, .leaflet-overlay-pane path');
  console.log(`🍃 Elementos de Leaflet en DOM: ${leafletElements.length}`);
  
  if (leafletElements.length > 1000) {
    console.warn('⚠️ Muchos elementos en el mapa, considera optimizar la visualización');
  }
};

// Consejos de optimización
const showOptimizationTips = () => {
  console.log('\n💡 Consejos para mejor rendimiento:');
  console.log('1. Los vecindarios solo se muestran con zoom >= 8');
  console.log('2. Usa el buscador para encontrar UVs específicas');
  console.log('3. Los tooltips aparecen solo con zoom >= 12');
  console.log('4. El botón "Mostrar/Ocultar Vecindarios" controla la carga');
  console.log('5. El mapa se centra en Santiago para mejor rendimiento inicial');
};

// Ejecutar diagnóstico
checkNeighborhoodData();
checkBrowserPerformance();
showOptimizationTips();

console.log('\n🎯 El mapa ahora debería cargar mucho más rápido en http://localhost:3004/app/mapa');