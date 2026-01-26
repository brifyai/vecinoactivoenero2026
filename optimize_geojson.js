#!/usr/bin/env node

// Script para optimizar el archivo GeoJSON reduciendo su tamaño
const fs = require('fs');
const path = require('path');

const INPUT_PATH = './public/data/geo/unidades_vecinales_simple.geojson';
const OUTPUT_PATH = './public/data/geo/unidades_vecinales_optimized.geojson';
const BACKUP_PATH = './public/data/geo/unidades_vecinales_simple.geojson.backup';

console.log('🔧 OPTIMIZADOR DE GEOJSON');
console.log('=========================');

// 1. Verificar archivo de entrada
if (!fs.existsSync(INPUT_PATH)) {
  console.error('❌ Archivo no encontrado:', INPUT_PATH);
  process.exit(1);
}

const inputStats = fs.statSync(INPUT_PATH);
console.log(`📊 Tamaño original: ${(inputStats.size / 1024 / 1024).toFixed(2)} MB`);

// 2. Crear backup
console.log('💾 Creando backup...');
fs.copyFileSync(INPUT_PATH, BACKUP_PATH);
console.log('✅ Backup creado:', BACKUP_PATH);

// 3. Leer y parsear archivo
console.log('📖 Leyendo archivo original...');
const startTime = Date.now();

try {
  const content = fs.readFileSync(INPUT_PATH, 'utf8');
  const data = JSON.parse(content);
  
  console.log(`✅ Archivo parseado en ${Date.now() - startTime}ms`);
  console.log(`📋 Features encontradas: ${data.features?.length || 0}`);
  
  if (!data.features || !Array.isArray(data.features)) {
    throw new Error('Estructura GeoJSON inválida');
  }
  
  // 4. Optimizar datos
  console.log('🔧 Optimizando datos...');
  
  let optimizedFeatures = data.features.map((feature, index) => {
    if (index % 1000 === 0) {
      console.log(`   Procesando feature ${index + 1}/${data.features.length}...`);
    }
    
    const props = feature.properties || {};
    
    // Mantener solo propiedades esenciales
    const optimizedProps = {
      t_id_uv_ca: props.t_id_uv_ca,
      uv_carto: props.uv_carto,
      t_uv_nom: props.t_uv_nom,
      t_com_nom: props.t_com_nom,
      t_reg_nom: props.t_reg_nom,
      PERSONAS: props.PERSONAS,
      HOGARES: props.HOGARES,
      HOMBRE: props.HOMBRE,
      MUJER: props.MUJER
    };
    
    // Limpiar propiedades undefined/null
    Object.keys(optimizedProps).forEach(key => {
      if (optimizedProps[key] === undefined || optimizedProps[key] === null || optimizedProps[key] === '') {
        delete optimizedProps[key];
      }
    });
    
    // Simplificar geometría si es muy compleja (reducir precisión decimal)
    let optimizedGeometry = feature.geometry;
    if (feature.geometry && feature.geometry.coordinates) {
      optimizedGeometry = {
        ...feature.geometry,
        coordinates: simplifyCoordinates(feature.geometry.coordinates)
      };
    }
    
    return {
      type: 'Feature',
      properties: optimizedProps,
      geometry: optimizedGeometry
    };
  });
  
  // 5. Crear archivo optimizado
  const optimizedData = {
    type: 'FeatureCollection',
    name: data.name || 'Unidades_Vecinales_Optimized',
    crs: data.crs,
    features: optimizedFeatures
  };
  
  console.log('💾 Guardando archivo optimizado...');
  
  // Guardar con formato compacto (sin espacios)
  const optimizedContent = JSON.stringify(optimizedData);
  fs.writeFileSync(OUTPUT_PATH, optimizedContent);
  
  const outputStats = fs.statSync(OUTPUT_PATH);
  const reduction = ((inputStats.size - outputStats.size) / inputStats.size * 100).toFixed(1);
  
  console.log('✅ Optimización completada!');
  console.log(`📊 Tamaño optimizado: ${(outputStats.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`📉 Reducción: ${reduction}% (${((inputStats.size - outputStats.size) / 1024 / 1024).toFixed(2)} MB ahorrados)`);
  
  // 6. Reemplazar archivo original si la reducción es significativa
  if (parseFloat(reduction) > 10) {
    console.log('🔄 Reemplazando archivo original...');
    fs.copyFileSync(OUTPUT_PATH, INPUT_PATH);
    fs.unlinkSync(OUTPUT_PATH);
    console.log('✅ Archivo original reemplazado con versión optimizada');
  } else {
    console.log('ℹ️ Reducción menor al 10% - manteniendo ambos archivos');
  }
  
  console.log(`⏱️ Tiempo total: ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
  
} catch (error) {
  console.error('❌ Error durante optimización:', error.message);
  
  // Restaurar backup si algo salió mal
  if (fs.existsSync(BACKUP_PATH)) {
    console.log('🔄 Restaurando backup...');
    fs.copyFileSync(BACKUP_PATH, INPUT_PATH);
  }
  
  process.exit(1);
}

// Función para simplificar coordenadas (reducir precisión decimal)
function simplifyCoordinates(coords, precision = 6) {
  if (typeof coords[0] === 'number') {
    // Es un punto [lng, lat]
    return coords.map(coord => parseFloat(coord.toFixed(precision)));
  } else if (Array.isArray(coords[0])) {
    // Es un array de coordenadas
    return coords.map(coord => simplifyCoordinates(coord, precision));
  }
  return coords;
}

console.log('\n💡 Recomendaciones:');
console.log('   - El backup está en:', BACKUP_PATH);
console.log('   - Prueba la aplicación para verificar que todo funciona');
console.log('   - Si hay problemas, restaura el backup manualmente');