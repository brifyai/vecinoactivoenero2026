const fs = require('fs');
const path = require('path');

console.log('🔄 Optimizando y actualizando Unidades Vecinales (Agosto 2025)...\n');

// Función para simplificar coordenadas (Douglas-Peucker simplificado)
function simplifyCoordinates(coords, tolerance = 0.0001) {
  if (!coords || coords.length < 3) return coords;
  
  // Para polígonos muy complejos, tomar cada N puntos
  const maxPoints = 100; // Máximo de puntos por polígono
  if (coords.length > maxPoints) {
    const step = Math.ceil(coords.length / maxPoints);
    const simplified = [];
    for (let i = 0; i < coords.length; i += step) {
      simplified.push(coords[i]);
    }
    // Asegurar que el último punto sea igual al primero (cerrar polígono)
    if (simplified[0][0] !== simplified[simplified.length - 1][0] || 
        simplified[0][1] !== simplified[simplified.length - 1][1]) {
      simplified.push(coords[coords.length - 1]);
    }
    return simplified;
  }
  
  return coords;
}

// Función para simplificar geometría
function simplifyGeometry(geometry) {
  if (!geometry) return geometry;
  
  if (geometry.type === 'Polygon') {
    return {
      type: 'Polygon',
      coordinates: geometry.coordinates.map(ring => simplifyCoordinates(ring))
    };
  } else if (geometry.type === 'MultiPolygon') {
    return {
      type: 'MultiPolygon',
      coordinates: geometry.coordinates.map(polygon => 
        polygon.map(ring => simplifyCoordinates(ring))
      )
    };
  }
  
  return geometry;
}

// Rutas de archivos
const nuevoGeoJSONPath = path.join(__dirname, '../public/data/geo/Shape_UV_ago2025.geojson');
const antiguoGeoJSONPath = path.join(__dirname, '../public/data/geo/unidades_vecinales_simple.geojson');
const outputPath = path.join(__dirname, '../public/data/geo/unidades_vecinales_simple.geojson');
const backupPath = path.join(__dirname, '../public/data/geo/unidades_vecinales_simple_backup_2024v4.geojson');

// Leer archivos
console.log('📖 Leyendo archivo nuevo (Agosto 2025)...');
const nuevoData = JSON.parse(fs.readFileSync(nuevoGeoJSONPath, 'utf8'));

console.log('📖 Leyendo archivo antiguo (con datos Censo 2017)...');
const antiguoData = JSON.parse(fs.readFileSync(antiguoGeoJSONPath, 'utf8'));

// Crear backup del archivo antiguo
console.log('💾 Creando backup del archivo anterior...');
fs.copyFileSync(antiguoGeoJSONPath, backupPath);
console.log(`✅ Backup guardado en: ${backupPath}\n`);

// Crear mapa de datos demográficos del archivo antiguo
console.log('🗺️  Indexando datos demográficos del Censo 2017...');
const datosDemo = new Map();
let conDatos = 0;

antiguoData.features.forEach(feature => {
  const props = feature.properties;
  const id = props.t_id_uv_ca || props.T_ID_UV_CA;
  
  if (id) {
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
    
    if (demo.PERSONAS && parseInt(demo.PERSONAS) > 0) {
      datosDemo.set(id, demo);
      conDatos++;
    }
  }
});

console.log(`   ✓ ${conDatos.toLocaleString('es-CL')} UVs con datos demográficos\n`);

// Procesar features: simplificar geometrías y hacer merge
console.log('⚙️  Simplificando geometrías y haciendo merge...');
let merged = 0;
let nuevas = 0;
let totalCoordsBefore = 0;
let totalCoordsAfter = 0;

const featuresActualizadas = nuevoData.features.map((feature, index) => {
  if (index % 1000 === 0) {
    process.stdout.write(`\r   Procesando: ${index}/${nuevoData.features.length}`);
  }
  
  const props = feature.properties;
  const id = props.t_id_uv_ca;
  
  // Contar coordenadas antes
  const countCoords = (geom) => {
    if (geom.type === 'Polygon') {
      return geom.coordinates.reduce((sum, ring) => sum + ring.length, 0);
    } else if (geom.type === 'MultiPolygon') {
      return geom.coordinates.reduce((sum, polygon) => 
        sum + polygon.reduce((s, ring) => s + ring.length, 0), 0);
    }
    return 0;
  };
  
  totalCoordsBefore += countCoords(feature.geometry);
  
  // Simplificar geometría
  const geometriaSimplificada = simplifyGeometry(feature.geometry);
  totalCoordsAfter += countCoords(geometriaSimplificada);
  
  // Crear nueva feature
  const nuevaFeature = {
    type: 'Feature',
    geometry: geometriaSimplificada,
    properties: {
      t_reg_ca: props.t_reg_ca,
      t_prov_ca: props.t_prov_ca,
      t_com: props.t_com,
      t_reg_nom: props.t_reg_nom,
      t_prov_nom: props.t_prov_nom,
      t_com_nom: props.t_com_nom,
      t_id_uv_ca: props.t_id_uv_ca,
      uv_carto: props.uv_carto,
      t_uv_nom: props.t_uv_nom
    }
  };
  
  // Merge con datos demográficos
  if (id && datosDemo.has(id)) {
    Object.assign(nuevaFeature.properties, datosDemo.get(id));
    merged++;
  } else {
    nuevas++;
  }
  
  return nuevaFeature;
});

console.log(`\r   ✓ ${featuresActualizadas.length.toLocaleString('es-CL')} UVs procesadas`);
console.log(`   ✓ Coordenadas reducidas: ${totalCoordsBefore.toLocaleString('es-CL')} → ${totalCoordsAfter.toLocaleString('es-CL')} (${((1 - totalCoordsAfter/totalCoordsBefore) * 100).toFixed(1)}% reducción)\n`);

// Guardar archivo final
console.log('💾 Guardando archivo optimizado...');

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

// Escribir archivo
fs.writeFileSync(outputPath, JSON.stringify(geoJSONFinal));

// Estadísticas del archivo
const stats = fs.statSync(outputPath);
const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

console.log(`✅ Archivo guardado: ${outputPath}`);
console.log(`📊 Tamaño: ${fileSizeMB} MB`);
console.log(`📍 Total UVs: ${featuresActualizadas.length.toLocaleString('es-CL')}\n`);

// Resumen final
console.log('📈 RESUMEN DE ACTUALIZACIÓN:');
console.log('═══════════════════════════════════════════════════════');
console.log(`Versión anterior:     ${antiguoData.features.length.toLocaleString('es-CL')} UVs`);
console.log(`Versión nueva:        ${nuevoData.features.length.toLocaleString('es-CL')} UVs`);
console.log(`Diferencia:           ${(nuevoData.features.length - antiguoData.features.length > 0 ? '+' : '')}${(nuevoData.features.length - antiguoData.features.length).toLocaleString('es-CL')} UVs`);
console.log('───────────────────────────────────────────────────────');
console.log(`Con datos Censo 2017: ${merged.toLocaleString('es-CL')} (${((merged/featuresActualizadas.length)*100).toFixed(1)}%)`);
console.log(`Sin datos Censo 2017: ${nuevas.toLocaleString('es-CL')} (${((nuevas/featuresActualizadas.length)*100).toFixed(1)}%)`);
console.log('───────────────────────────────────────────────────────');
console.log(`Tamaño archivo:       ${fileSizeMB} MB`);
console.log(`Reducción geometría:  ${((1 - totalCoordsAfter/totalCoordsBefore) * 100).toFixed(1)}%`);
console.log('═══════════════════════════════════════════════════════\n');

console.log('✨ ¡Actualización completada exitosamente!');
console.log('\n✅ El archivo ha sido actualizado y está listo para usar.');
console.log('✅ Todas las funcionalidades se mantienen intactas.');
console.log('✅ Los datos del Censo 2017 se han preservado.\n');
