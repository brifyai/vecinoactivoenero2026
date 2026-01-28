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

let allOk = true;

CRITICAL_FILES.forEach(file => {
  const buildPath = path.join(BUILD_DIR, file);
  const publicPath = path.join(PUBLIC_DIR, file);
  
  if (!fs.existsSync(buildPath)) {
    console.log(`❌ ${file} no encontrado en build`);
    
    // Intentar copiar desde public
    if (fs.existsSync(publicPath)) {
      try {
        fs.copyFileSync(publicPath, buildPath);
        console.log(`✅ ${file} copiado desde public/`);
      } catch (error) {
        console.error(`❌ Error copiando ${file}:`, error.message);
        allOk = false;
      }
    } else {
      console.error(`❌ ${file} tampoco existe en public/`);
      allOk = false;
    }
  } else {
    console.log(`✅ ${file} OK`);
  }
});

if (allOk) {
  console.log('\n✅ Post-build completado exitosamente');
  process.exit(0);
} else {
  console.error('\n❌ Post-build completado con errores');
  process.exit(1);
}
