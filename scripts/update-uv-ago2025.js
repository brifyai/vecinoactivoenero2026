const fs = require('fs');
const path = require('path');

console.log('🔄 Actualizando Unidades Vecinales con datos de Agosto 2025...\n');

// Rutas de archivos
const nuevoGeoJSONPath = path.join(__dirname, '../public/data/geo/Shape_UV_ago2025.geojson');
const antiguoGeoJSONPath = path.join(__dirname, '../public/data/geo/unidades_vecinales_simple.geojson');
const outputPath = path.join(__dirname, '../public/data/geo/unidades_vecinales_simple_ago2025.geojson');
const backupPath = path.join(__dirname, '../public/data/geo/unidades_vecinales_simple_backup_2024v4.geojson');

// Leer archivos
console.log('📖 Leyendo archivo nuevo (Agosto 2025)...');
const nuevoData = JSON.parse(fs.readFileSync(nuevoGeoJSONPath, 'utf8'));

console.log('📖 Leyendo archivo antiguo (con datos Censo 2017)...');
const antiguoData = JSON.parse(fs.readFileSync(antiguoGeoJSONPath, 'utf8'));

// Crear backup del archivo antiguo
console.log('💾 Creando backup del archivo anterior...');
fs.writeFileSync(backupPath, JSON.stringify(antiguoData, null, 2));
console.log(`✅ Backup guardado en: ${backupPath}\n`);

// Crear mapa de datos demográficos del archivo antiguo usando t_id_uv_ca como clave
console.log('🗺️  Creando índice de datos demográficos del Censo 2017...');
const datosDemo = new Map();
let conDatos = 0;
let sinDatos = 0;

antiguoData.features.forEach(feature => {
  const props = feature.properties;
  const id = props.t_id_uv_ca || props.T_ID_UV_CA;
  
  if (id) {
    // Guardar solo los datos demográficos
    const demo = {
      PERSONAS: props.PERSONAS,
      HOGARES: props.HOGARES,
      HOMBRE: props.HOMBRE,
      MUJER: props.MUJER,
      AREA_VERDE: props.AREA_VERDE,
      T_EDUCACIO: props.T_EDUCACIO,
      TOTAL_SALU: props.TOTAL_SALU,
      DEPORTE: props.DEPORTE
    };
    
    // Solo guardar si tiene al menos población
    if (demo.PERSONAS && parseInt(demo.PERSONAS) > 0) {
      datosDemo.set(id, demo);
      conDatos++;
    } else {
      sinDatos++;
    }
  }
});

console.log(`   ✓ ${conDatos.toLocaleString('es-CL')} UVs con datos demográficos`);
console.log(`   ✓ ${sinDatos.toLocaleString('es-CL')} UVs sin datos demográficos\n`);

// Procesar features nuevas y hacer merge con datos demográficos
console.log('🔀 Haciendo merge de geometrías nuevas con datos del Censo 2017...');
let merged = 0;
let nuevas = 0;
let actualizadas = 0;

const featuresActualizadas = nuevoData.features.map(feature => {
  const props = feature.properties;
  const id = props.t_id_uv_ca;
  
  // Crear nueva feature con propiedades actualizadas
  const nuevaFeature = {
    type: 'Feature',
    geometry: feature.geometry,
    properties: {
      // Datos administrativos actualizados (Agosto 2025)
      t_reg_ca: props.t_reg_ca,
      t_prov_ca: props.t_prov_ca,
      t_com: props.t_com,
      t_reg_nom: props.t_reg_nom,
      t_prov_nom: props.t_prov_nom,
      t_com_nom: props.t_com_nom,
      t_id_uv_ca: props.t_id_uv_ca,
      uv_carto: props.uv_carto,
      t_uv_nom: props.t_uv_nom,
      Shape_Leng: props.Shape_Leng,
      Shape_Area: props.Shape_Area
    }
  };
  
  // Intentar hacer merge con datos demográficos
  if (id && datosDemo.has(id)) {
    const demo = datosDemo.get(id);
    Object.assign(nuevaFeature.properties, demo);
    merged++;
  } else {
    nuevas++;
  }
  
  actualizadas++;
  return nuevaFeature;
});

console.log(`   ✓ ${actualizadas.toLocaleString('es-CL')} UVs procesadas`);
console.log(`   ✓ ${merged.toLocaleString('es-CL')} UVs con datos demográficos (${((merged/actualizadas)*100).toFixed(1)}%)`);
console.log(`   ✓ ${nuevas.toLocaleString('es-CL')} UVs nuevas sin datos demográficos\n`);

// Crear GeoJSON final
const geoJSONFinal = {
  type: 'FeatureCollection',
  name: 'Unidades_Vecinales_Agosto_2025',
  crs: {
    type: 'name',
    properties: {
      name: 'urn:ogc:def:crs:OGC:1.3:CRS84'
    }
  },
  features: featuresActualizadas
};

// Guardar archivo final
console.log('💾 Guardando archivo actualizado...');

// Escribir el archivo en partes para evitar problemas de memoria
const writeStream = fs.createWriteStream(outputPath);
writeStream.write('{\n');
writeStream.write('  "type": "FeatureCollection",\n');
writeStream.write('  "name": "Unidades_Vecinales_Agosto_2025",\n');
writeStream.write('  "crs": {\n');
writeStream.write('    "type": "name",\n');
writeStream.write('    "properties": {\n');
writeStream.write('      "name": "urn:ogc:def:crs:OGC:1.3:CRS84"\n');
writeStream.write('    }\n');
writeStream.write('  },\n');
writeStream.write('  "features": [\n');

// Escribir features en chunks
for (let i = 0; i < featuresActualizadas.length; i++) {
  const featureStr = JSON.stringify(featuresActualizadas[i], null, 4);
  writeStream.write('    ' + featureStr);
  if (i < featuresActualizadas.length - 1) {
    writeStream.write(',\n');
  } else {
    writeStream.write('\n');
  }
}

writeStream.write('  ]\n');
writeStream.write('}\n');
writeStream.end();

// Esperar a que termine de escribir
writeStream.on('finish', () => {
  // Calcular tamaño del archivo
  const stats = fs.statSync(outputPath);
  const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

  console.log(`✅ Archivo guardado: ${outputPath}`);
  console.log(`📊 Tamaño: ${fileSizeMB} MB`);
  console.log(`📍 Total UVs: ${featuresActualizadas.length.toLocaleString('es-CL')}\n`);

  // Estadísticas finales
  console.log('📈 RESUMEN DE ACTUALIZACIÓN:');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Versión anterior: ${antiguoData.features.length.toLocaleString('es-CL')} UVs`);
  console.log(`Versión nueva:    ${nuevoData.features.length.toLocaleString('es-CL')} UVs`);
  console.log(`Diferencia:       ${(nuevoData.features.length - antiguoData.features.length > 0 ? '+' : '')}${(nuevoData.features.length - antiguoData.features.length).toLocaleString('es-CL')} UVs`);
  console.log('───────────────────────────────────────────────────────');
  console.log(`UVs con datos demográficos: ${merged.toLocaleString('es-CL')} (${((merged/actualizadas)*100).toFixed(1)}%)`);
  console.log(`UVs sin datos demográficos: ${nuevas.toLocaleString('es-CL')} (${((nuevas/actualizadas)*100).toFixed(1)}%)`);
  console.log('═══════════════════════════════════════════════════════\n');

  console.log('✨ ¡Actualización completada exitosamente!');
  console.log('\n📝 Próximos pasos:');
  console.log('   1. Revisar el archivo: public/data/geo/unidades_vecinales_simple_ago2025.geojson');
  console.log('   2. Si todo está correcto, reemplazar el archivo actual');
  console.log('   3. Actualizar la aplicación para usar el nuevo archivo\n');
});
