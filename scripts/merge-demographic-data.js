#!/usr/bin/env node

/**
 * Script para hacer merge de datos demográficos del Censo 2017
 * con las geometrías actualizadas de 2024v4
 * 
 * Este script:
 * 1. Lee el archivo antiguo (con datos demográficos)
 * 2. Lee el archivo nuevo (con geometrías actualizadas)
 * 3. Hace match por código de UV
 * 4. Combina los datos demográficos con las geometrías nuevas
 * 5. Guarda el resultado
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 Iniciando merge de datos demográficos...\n');

// Rutas de archivos
const oldFile = path.join(__dirname, '../public/data/geo/unidades_vecinales_simple_old.geojson');
const newFile = path.join(__dirname, '../public/data/geo/unidades_vecinales_simple.geojson');
const outputFile = path.join(__dirname, '../public/data/geo/unidades_vecinales_merged.geojson');

// Verificar que los archivos existen
if (!fs.existsSync(oldFile)) {
  console.error('❌ Error: No se encuentra el archivo antiguo:', oldFile);
  process.exit(1);
}

if (!fs.existsSync(newFile)) {
  console.error('❌ Error: No se encuentra el archivo nuevo:', newFile);
  process.exit(1);
}

console.log('📂 Leyendo archivo antiguo (Censo 2017)...');
const oldData = JSON.parse(fs.readFileSync(oldFile, 'utf8'));
console.log(`   ✅ ${oldData.features.length} UVs con datos demográficos\n`);

console.log('📂 Leyendo archivo nuevo (2024v4)...');
const newData = JSON.parse(fs.readFileSync(newFile, 'utf8'));
console.log(`   ✅ ${newData.features.length} UVs con geometrías actualizadas\n`);

// Crear índice del archivo antiguo por código de UV
console.log('🔍 Creando índice de datos demográficos...');
const demographicIndex = {};
let indexedCount = 0;

oldData.features.forEach(feature => {
  const codigo = feature.properties.CODIGO_UV || feature.properties.COD_UNICO_;
  if (codigo) {
    demographicIndex[codigo] = {
      personas: feature.properties.PERSONAS || 0,
      hogares: feature.properties.HOGARES || 0,
      hombres: feature.properties.HOMBRE || 0,
      mujeres: feature.properties.MUJER || 0,
      areaVerde: feature.properties.AREA_VERDE || 0,
      educacion: feature.properties.T_EDUCACIO || 0,
      salud: feature.properties.TOTAL_SALU || 0,
      deportes: feature.properties.DEPORTE || 0
    };
    indexedCount++;
  }
});
console.log(`   ✅ ${indexedCount} UVs indexadas\n`);

// Hacer merge
console.log('🔀 Haciendo merge de datos...');
let matchedCount = 0;
let notMatchedCount = 0;
const notMatched = [];

newData.features.forEach(feature => {
  const codigo = feature.properties.uv_carto;
  
  if (codigo && demographicIndex[codigo]) {
    // Agregar datos demográficos al feature nuevo
    const demo = demographicIndex[codigo];
    feature.properties.PERSONAS = demo.personas;
    feature.properties.HOGARES = demo.hogares;
    feature.properties.HOMBRE = demo.hombres;
    feature.properties.MUJER = demo.mujeres;
    feature.properties.AREA_VERDE = demo.areaVerde;
    feature.properties.T_EDUCACIO = demo.educacion;
    feature.properties.TOTAL_SALU = demo.salud;
    feature.properties.DEPORTE = demo.deportes;
    matchedCount++;
  } else {
    // No se encontró match
    feature.properties.PERSONAS = 0;
    feature.properties.HOGARES = 0;
    feature.properties.HOMBRE = 0;
    feature.properties.MUJER = 0;
    feature.properties.AREA_VERDE = 0;
    feature.properties.T_EDUCACIO = 0;
    feature.properties.TOTAL_SALU = 0;
    feature.properties.DEPORTE = 0;
    notMatchedCount++;
    notMatched.push({
      codigo: codigo,
      nombre: feature.properties.t_uv_nom,
      comuna: feature.properties.t_com_nom
    });
  }
});

console.log(`   ✅ ${matchedCount} UVs con datos demográficos`);
console.log(`   ⚠️  ${notMatchedCount} UVs sin datos demográficos\n`);

if (notMatched.length > 0 && notMatched.length <= 20) {
  console.log('📋 UVs sin datos demográficos:');
  notMatched.forEach(uv => {
    console.log(`   - UV ${uv.codigo}: ${uv.nombre} (${uv.comuna})`);
  });
  console.log('');
}

// Guardar resultado
console.log('💾 Guardando archivo merged...');
fs.writeFileSync(outputFile, JSON.stringify(newData, null, 2));
const stats = fs.statSync(outputFile);
const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
console.log(`   ✅ Archivo guardado: ${outputFile}`);
console.log(`   📊 Tamaño: ${sizeMB} MB\n`);

// Estadísticas finales
console.log('📊 ESTADÍSTICAS FINALES:');
console.log(`   Total UVs: ${newData.features.length}`);
console.log(`   Con datos demográficos: ${matchedCount} (${(matchedCount/newData.features.length*100).toFixed(1)}%)`);
console.log(`   Sin datos demográficos: ${notMatchedCount} (${(notMatchedCount/newData.features.length*100).toFixed(1)}%)`);

// Calcular totales
let totalPersonas = 0;
let totalHogares = 0;
newData.features.forEach(f => {
  totalPersonas += parseInt(f.properties.PERSONAS) || 0;
  totalHogares += parseInt(f.properties.HOGARES) || 0;
});

console.log(`   Total población: ${totalPersonas.toLocaleString('es-CL')}`);
console.log(`   Total hogares: ${totalHogares.toLocaleString('es-CL')}\n`);

console.log('✅ Merge completado exitosamente!');
console.log('\n📝 PRÓXIMO PASO:');
console.log('   Reemplaza el archivo actual con el merged:');
console.log('   cp public/data/geo/unidades_vecinales_merged.geojson public/data/geo/unidades_vecinales_simple.geojson');
console.log('   Y reinicia el servidor frontend.\n');
