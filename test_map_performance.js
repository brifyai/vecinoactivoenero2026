#!/usr/bin/env node

// Script para probar el rendimiento del mapa optimizado
const fs = require('fs');

console.log('🗺️ PRUEBA DE RENDIMIENTO DEL MAPA OPTIMIZADO');
console.log('=============================================');

// 1. Verificar archivo optimizado
const GEOJSON_PATH = './public/data/geo/unidades_vecinales_simple.geojson';
const BACKUP_PATH = './public/data/geo/unidades_vecinales_simple.geojson.backup';

console.log('1. Verificando optimización del archivo...');

if (fs.existsSync(GEOJSON_PATH) && fs.existsSync(BACKUP_PATH)) {
  const currentStats = fs.statSync(GEOJSON_PATH);
  const backupStats = fs.statSync(BACKUP_PATH);
  
  const currentSizeMB = (currentStats.size / 1024 / 1024).toFixed(2);
  const backupSizeMB = (backupStats.size / 1024 / 1024).toFixed(2);
  const reduction = ((backupStats.size - currentStats.size) / backupStats.size * 100).toFixed(1);
  
  console.log(`📊 Archivo original: ${backupSizeMB} MB`);
  console.log(`📊 Archivo optimizado: ${currentSizeMB} MB`);
  console.log(`📉 Reducción: ${reduction}%`);
  
  if (parseFloat(reduction) > 30) {
    console.log('✅ Optimización significativa aplicada');
  } else {
    console.log('⚠️ Optimización menor');
  }
} else {
  console.log('❌ No se encontraron archivos de comparación');
}

// 2. Verificar estructura del archivo optimizado
console.log('\n2. Verificando estructura optimizada...');

try {
  // Leer solo una muestra para verificar estructura
  const fd = fs.openSync(GEOJSON_PATH, 'r');
  const buffer = Buffer.alloc(2000);
  fs.readSync(fd, buffer, 0, 2000, 0);
  fs.closeSync(fd);
  
  const preview = buffer.toString('utf8');
  
  // Verificar propiedades optimizadas
  const hasEssentialProps = preview.includes('t_id_uv_ca') && 
                           preview.includes('uv_carto') && 
                           preview.includes('t_uv_nom');
  
  if (hasEssentialProps) {
    console.log('✅ Propiedades esenciales preservadas');
  } else {
    console.log('⚠️ Posible pérdida de propiedades importantes');
  }
  
  // Verificar formato compacto
  const isCompact = !preview.includes('  ') && !preview.includes('\n  ');
  if (isCompact) {
    console.log('✅ Formato JSON compacto aplicado');
  } else {
    console.log('ℹ️ Formato JSON con espacios (normal)');
  }
  
} catch (error) {
  console.error('❌ Error verificando estructura:', error.message);
}

// 3. Simular filtrado por viewport
console.log('\n3. Simulando filtrado por viewport...');

try {
  console.log('📖 Cargando datos para simulación...');
  const startTime = Date.now();
  
  // Leer archivo completo para simulación
  const content = fs.readFileSync(GEOJSON_PATH, 'utf8');
  const data = JSON.parse(content);
  
  const loadTime = Date.now() - startTime;
  console.log(`⏱️ Tiempo de carga: ${loadTime}ms`);
  console.log(`📊 Total de features: ${data.features.length}`);
  
  // Simular viewport de Santiago centro
  const santiagoBounds = {
    north: -33.4,
    south: -33.5,
    east: -70.6,
    west: -70.7
  };
  
  console.log('🔍 Filtrando features visibles en Santiago centro...');
  const filterStart = Date.now();
  
  const visibleFeatures = data.features.filter(feature => {
    if (!feature.geometry || !feature.geometry.coordinates) return false;
    
    const coords = feature.geometry.type === 'Polygon' 
      ? feature.geometry.coordinates[0] 
      : feature.geometry.coordinates[0][0];
    
    let minLng = Infinity, maxLng = -Infinity;
    let minLat = Infinity, maxLat = -Infinity;
    
    coords.forEach(([lng, lat]) => {
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
    });
    
    return !(maxLng < santiagoBounds.west || 
             minLng > santiagoBounds.east || 
             maxLat < santiagoBounds.south || 
             minLat > santiagoBounds.north);
  }).slice(0, 500); // Límite de 500 features
  
  const filterTime = Date.now() - filterStart;
  const reductionPercent = ((data.features.length - visibleFeatures.length) / data.features.length * 100).toFixed(1);
  
  console.log(`✅ ${visibleFeatures.length} features visibles (${reductionPercent}% reducción)`);
  console.log(`⏱️ Tiempo de filtrado: ${filterTime}ms`);
  
  // Calcular memoria estimada
  const originalMemoryMB = (JSON.stringify(data).length / 1024 / 1024).toFixed(2);
  const filteredMemoryMB = (JSON.stringify({type: 'FeatureCollection', features: visibleFeatures}).length / 1024 / 1024).toFixed(2);
  
  console.log(`💾 Memoria original estimada: ${originalMemoryMB} MB`);
  console.log(`💾 Memoria filtrada estimada: ${filteredMemoryMB} MB`);
  
} catch (error) {
  console.error('❌ Error en simulación:', error.message);
}

// 4. Recomendaciones de rendimiento
console.log('\n4. Análisis de rendimiento...');

const currentStats = fs.statSync(GEOJSON_PATH);
const fileSizeMB = currentStats.size / 1024 / 1024;

if (fileSizeMB < 30) {
  console.log('✅ Tamaño de archivo óptimo (<30MB)');
} else if (fileSizeMB < 50) {
  console.log('⚠️ Tamaño de archivo aceptable (30-50MB)');
} else {
  console.log('❌ Archivo aún muy grande (>50MB)');
}

console.log('\n💡 Recomendaciones:');
console.log('   - El filtrado por viewport debería reducir 80-90% de polígonos');
console.log('   - Tiempo de renderizado esperado: <1 segundo');
console.log('   - Uso de memoria esperado: <200MB');
console.log('   - Prueba el mapa en http://localhost:3000');

console.log('\n🎯 Métricas a observar en el navegador:');
console.log('   - DevTools > Performance: Tiempo de renderizado');
console.log('   - DevTools > Memory: Uso de heap');
console.log('   - Console: Logs de filtrado de UVs');