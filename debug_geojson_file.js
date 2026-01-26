#!/usr/bin/env node

// Script para diagnosticar el archivo GeoJSON de unidades vecinales
const fs = require('fs');
const path = require('path');

const GEOJSON_PATH = './public/data/geo/unidades_vecinales_simple.geojson';

console.log('🔍 DIAGNÓSTICO DEL ARCHIVO GEOJSON');
console.log('=====================================');

// 1. Verificar si el archivo existe
console.log('1. Verificando existencia del archivo...');
if (!fs.existsSync(GEOJSON_PATH)) {
  console.error('❌ El archivo no existe:', GEOJSON_PATH);
  process.exit(1);
}
console.log('✅ Archivo encontrado');

// 2. Verificar tamaño del archivo
console.log('\n2. Verificando tamaño del archivo...');
const stats = fs.statSync(GEOJSON_PATH);
const fileSizeMB = (stats.size / 1024 / 1024).toFixed(2);
console.log(`📊 Tamaño: ${fileSizeMB} MB (${stats.size.toLocaleString()} bytes)`);

if (stats.size > 100 * 1024 * 1024) { // 100MB
  console.warn('⚠️ Archivo muy grande (>100MB) - puede causar problemas de carga');
} else if (stats.size > 50 * 1024 * 1024) { // 50MB
  console.warn('⚠️ Archivo grande (>50MB) - carga puede ser lenta');
} else {
  console.log('✅ Tamaño del archivo es manejable');
}

// 3. Verificar permisos de lectura
console.log('\n3. Verificando permisos...');
try {
  fs.accessSync(GEOJSON_PATH, fs.constants.R_OK);
  console.log('✅ Archivo legible');
} catch (error) {
  console.error('❌ Error de permisos:', error.message);
  process.exit(1);
}

// 4. Verificar estructura JSON básica
console.log('\n4. Verificando estructura JSON...');
try {
  console.log('📖 Leyendo archivo (esto puede tomar tiempo para archivos grandes)...');
  const startTime = Date.now();
  
  // Leer solo los primeros 1000 caracteres para verificar estructura básica
  const fd = fs.openSync(GEOJSON_PATH, 'r');
  const buffer = Buffer.alloc(1000);
  fs.readSync(fd, buffer, 0, 1000, 0);
  fs.closeSync(fd);
  
  const preview = buffer.toString('utf8');
  console.log('📝 Vista previa (primeros 200 caracteres):');
  console.log(preview.substring(0, 200) + '...');
  
  // Verificar que empiece como GeoJSON válido
  if (preview.includes('"type"') && preview.includes('"FeatureCollection"')) {
    console.log('✅ Estructura GeoJSON válida detectada');
  } else {
    console.warn('⚠️ No se detectó estructura GeoJSON válida en el inicio del archivo');
  }
  
  // Intentar parsear el archivo completo (solo si es pequeño)
  if (stats.size < 10 * 1024 * 1024) { // Solo si es menor a 10MB
    console.log('📊 Parseando archivo completo...');
    const content = fs.readFileSync(GEOJSON_PATH, 'utf8');
    const data = JSON.parse(content);
    
    console.log(`✅ JSON válido con ${data.features?.length || 0} features`);
    
    if (data.features && data.features.length > 0) {
      const firstFeature = data.features[0];
      console.log('📋 Estructura de la primera feature:');
      console.log('   - Propiedades:', Object.keys(firstFeature.properties || {}));
      console.log('   - Geometría:', firstFeature.geometry?.type);
    }
  } else {
    console.log('⏭️ Archivo muy grande - omitiendo parseo completo');
  }
  
} catch (error) {
  console.error('❌ Error al leer/parsear archivo:', error.message);
  
  if (error.message.includes('JSON')) {
    console.log('💡 Sugerencia: El archivo puede estar corrupto o no ser JSON válido');
  } else if (error.message.includes('EMFILE') || error.message.includes('ENOMEM')) {
    console.log('💡 Sugerencia: Archivo demasiado grande para la memoria disponible');
  }
}

// 5. Verificar accesibilidad desde servidor web
console.log('\n5. Verificando accesibilidad web...');
const http = require('http');
const url = require('url');

// Solo hacer test si hay un servidor corriendo
const testUrl = 'http://localhost:3000/data/geo/unidades_vecinales_simple.geojson';
console.log(`🌐 Probando acceso desde: ${testUrl}`);

const req = http.get(testUrl, (res) => {
  console.log(`📡 Status: ${res.statusCode} ${res.statusMessage}`);
  console.log(`📊 Content-Length: ${res.headers['content-length']} bytes`);
  console.log(`📄 Content-Type: ${res.headers['content-type']}`);
  
  if (res.statusCode === 200) {
    console.log('✅ Archivo accesible desde servidor web');
  } else {
    console.warn(`⚠️ Problema de acceso: ${res.statusCode}`);
  }
  
  res.destroy(); // No necesitamos leer el contenido completo
}).on('error', (error) => {
  console.warn('⚠️ No se pudo probar acceso web (servidor no corriendo?):', error.message);
  console.log('💡 Asegúrate de que el servidor de desarrollo esté corriendo (npm start)');
});

// Timeout para la prueba web
setTimeout(() => {
  req.destroy();
}, 5000);

console.log('\n=====================================');
console.log('🏁 Diagnóstico completado');
console.log('\n💡 Recomendaciones:');
console.log('   - Si el archivo es >50MB, considera comprimirlo más');
console.log('   - Asegúrate de que el servidor esté corriendo para pruebas web');
console.log('   - Si hay errores JSON, verifica la integridad del archivo');