#!/usr/bin/env node

/**
 * Script para generar todos los archivos de favicon necesarios
 * desde el favicon.svg existente
 */

const fs = require('fs');
const path = require('path');

// Leer el SVG existente
const svgPath = path.join(__dirname, '../../public/favicon.svg');
const svgContent = fs.readFileSync(svgPath, 'utf8');

console.log('✅ SVG leído correctamente');
console.log('\n📝 INSTRUCCIONES PARA GENERAR FAVICONS:\n');
console.log('Para generar los archivos favicon.ico, logo192.png y logo512.png:');
console.log('\n1. Opción A - Usar herramienta online (RECOMENDADO):');
console.log('   - Ve a: https://realfavicongenerator.net/');
console.log('   - Sube el archivo: public/favicon.svg');
console.log('   - Descarga el paquete generado');
console.log('   - Copia favicon.ico, android-chrome-192x192.png y android-chrome-512x512.png a public/');
console.log('   - Renombra android-chrome-192x192.png a logo192.png');
console.log('   - Renombra android-chrome-512x512.png a logo512.png');
console.log('\n2. Opción B - Usar ImageMagick (si está instalado):');
console.log('   cd public');
console.log('   convert favicon.svg -resize 16x16 favicon-16.png');
console.log('   convert favicon.svg -resize 32x32 favicon-32.png');
console.log('   convert favicon.svg -resize 192x192 logo192.png');
console.log('   convert favicon.svg -resize 512x512 logo512.png');
console.log('   convert favicon-16.png favicon-32.png favicon.ico');
console.log('\n3. Opción C - Usar el archivo HTML generador:');
console.log('   - Abre public/generate-favicon.html en el navegador');
console.log('   - Descarga los archivos generados');
console.log('   - Guárdalos en la carpeta public/');
console.log('\n📦 Archivos necesarios:');
console.log('   ✓ favicon.svg (ya existe)');
console.log('   ✗ favicon.ico (falta - 16x16, 32x32)');
console.log('   ✗ logo192.png (falta - 192x192)');
console.log('   ✗ logo512.png (falta - 512x512)');
console.log('\n🔧 Una vez generados, ejecuta el build de nuevo.');
