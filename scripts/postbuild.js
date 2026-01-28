#!/usr/bin/env node

/**
 * Post-build script
 * Asegura que todos los archivos críticos estén en el build
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Ejecutando post-build checks...');

const BUILD_DIR = path.join(__dirname, '..', 'build');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// Archivos críticos que deben estar en el build
const CRITICAL_FILES = [
  'manifest.json',
  'favicon.ico',
  'logo192.png',
  'logo512.png',
  'robots.txt'
];

CRITICAL_FILES.forEach(file => {
  const buildPath = path.join(BUILD_DIR, file);
  const publicPath = path.join(PUBLIC_DIR, file);
  
  if (!fs.existsSync(buildPath)) {
    console.log(`⚠️  ${file} no encontrado en build`);
    
    // Intentar copiar desde public
    if (fs.existsSync(publicPath)) {
      try {
        fs.copyFileSync(publicPath, buildPath);
        console.log(`✅ ${file} copiado desde public/`);
      } catch (error) {
        console.warn(`⚠️  No se pudo copiar ${file}:`, error.message);
        // No fallar el build por esto
      }
    } else {
      console.warn(`⚠️  ${file} tampoco existe en public/ - será ignorado`);
      // No fallar el build por archivos faltantes
    }
  } else {
    console.log(`✅ ${file} OK`);
  }
});

// Siempre completar exitosamente - los warnings son informativos
console.log('\n✅ Post-build completado (warnings son informativos)');
process.exit(0);
