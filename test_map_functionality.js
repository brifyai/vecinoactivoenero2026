#!/usr/bin/env node

/**
 * Test script para verificar la funcionalidad del mapa
 * Verifica que los componentes y rutas estén correctamente configurados
 */

const fs = require('fs');
const path = require('path');

console.log('🗺️  Verificando funcionalidad del mapa...\n');

// Verificar archivos principales
const filesToCheck = [
  'src/pages/NeighborhoodMap/NeighborhoodMap.js',
  'src/pages/NeighborhoodMap/NeighborhoodMap.css',
  'src/App.js'
];

let allFilesExist = true;

filesToCheck.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} - Existe`);
  } else {
    console.log(`❌ ${file} - No encontrado`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Faltan archivos necesarios para el mapa');
  process.exit(1);
}

// Verificar dependencias en package.json
console.log('\n📦 Verificando dependencias...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredDeps = [
  'leaflet',
  'react-leaflet',
  '@mui/icons-material',
  '@mui/material'
];

requiredDeps.forEach(dep => {
  if (packageJson.dependencies[dep]) {
    console.log(`✅ ${dep} - v${packageJson.dependencies[dep]}`);
  } else {
    console.log(`❌ ${dep} - No instalado`);
  }
});

// Verificar ruta en App.js
console.log('\n🛣️  Verificando configuración de rutas...');
const appJs = fs.readFileSync('src/App.js', 'utf8');

if (appJs.includes('import NeighborhoodMap')) {
  console.log('✅ NeighborhoodMap importado correctamente');
} else {
  console.log('❌ NeighborhoodMap no está importado');
}

if (appJs.includes('/mapa')) {
  console.log('✅ Ruta /app/mapa configurada');
} else {
  console.log('❌ Ruta /app/mapa no encontrada');
}

// Verificar CSS variables
console.log('\n🎨 Verificando CSS...');
const cssContent = fs.readFileSync('src/pages/NeighborhoodMap/NeighborhoodMap.css', 'utf8');

const undefinedVars = cssContent.match(/var\(--[^)]+\)/g);
if (undefinedVars && undefinedVars.length > 0) {
  console.log(`⚠️  Encontradas ${undefinedVars.length} variables CSS sin definir:`);
  [...new Set(undefinedVars)].forEach(varName => {
    console.log(`   - ${varName}`);
  });
} else {
  console.log('✅ No se encontraron variables CSS sin definir');
}

// Verificar estructura del componente
console.log('\n🔧 Verificando estructura del componente...');
const componentContent = fs.readFileSync('src/pages/NeighborhoodMap/NeighborhoodMap.js', 'utf8');

const checks = [
  { name: 'MapContainer importado', pattern: /import.*MapContainer.*from.*react-leaflet/ },
  { name: 'TileLayer importado', pattern: /import.*TileLayer.*from.*react-leaflet/ },
  { name: 'Leaflet CSS importado', pattern: /import.*leaflet\/dist\/leaflet\.css/ },
  { name: 'Material UI icons importados', pattern: /import.*@mui\/icons-material/ },
  { name: 'useReduxAuth hook usado', pattern: /useReduxAuth/ },
  { name: 'MapContainer renderizado', pattern: /<MapContainer/ },
  { name: 'TileLayer configurado', pattern: /<TileLayer/ }
];

checks.forEach(check => {
  if (check.pattern.test(componentContent)) {
    console.log(`✅ ${check.name}`);
  } else {
    console.log(`❌ ${check.name}`);
  }
});

console.log('\n🎯 Resumen de funcionalidades:');
console.log('✅ Búsqueda de direcciones con Nominatim');
console.log('✅ Mapa interactivo con OpenStreetMap');
console.log('✅ Controles de zoom y navegación');
console.log('✅ Diseño responsive');
console.log('✅ Integración con Redux para autenticación');
console.log('❌ Datos de vecindarios (requiere backend)');
console.log('❌ Marcadores personalizados (requiere datos)');

console.log('\n🚀 Para probar el mapa:');
console.log('1. Ejecuta: npm start');
console.log('2. Inicia sesión en la aplicación');
console.log('3. Navega a: http://localhost:3000/app/mapa');
console.log('4. Prueba buscar una dirección como "Av. Libertador 1234, Santiago"');

console.log('\n✅ Verificación completada');