const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🔄 Cargando Unidades Vecinales a la base de datos...\n');

// Configurar Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERROR: Variables de entorno no configuradas');
  console.error('Necesitas REACT_APP_SUPABASE_URL y REACT_APP_SUPABASE_ANON_KEY en .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Leer archivo GeoJSON
const geoJSONPath = path.join(__dirname, '../public/data/geo/unidades_vecinales_simple.geojson');
console.log('📖 Leyendo archivo:', geoJSONPath);

const data = JSON.parse(fs.readFileSync(geoJSONPath, 'utf8'));
console.log(`✅ Archivo leído: ${data.features.length} unidades vecinales encontradas\n`);

// Función para cargar vecindarios
async function cargarVecindarios() {
  let insertados = 0;
  let errores = 0;

  for (const feature of data.features) {
    const props = feature.properties;
    
    // Crear ID único basado en código
    const id = props.codigo || props.t_id_uv_ca || `UV-${insertados}`;
    const nombre = props.nombre || props.nom_uv || 'Sin nombre';
    const codigo = props.codigo || props.t_id_uv_ca || id;
    const comuna = props.comuna || props.nom_comuna || null;
    const region = props.region || 'Región Metropolitana';
    const personas = parseInt(props.personas || props.total_pers || 0);
    const hogares = parseInt(props.hogares || props.total_hoga || 0);

    // Función para eliminar dimensión Z de las coordenadas
    function removeZDimension(coords) {
      if (!coords) return coords;
      
      if (typeof coords[0] === 'number') {
        // Es un punto [x, y, z] -> [x, y]
        return [coords[0], coords[1]];
      }
      
      // Es un array de coordenadas, procesar recursivamente
      return coords.map(removeZDimension);
    }

    // Convertir Polygon a MultiPolygon y eliminar dimensión Z
    let geometry = feature.geometry;
    if (geometry) {
      // Eliminar dimensión Z
      if (geometry.coordinates) {
        geometry.coordinates = removeZDimension(geometry.coordinates);
      }
      
      // Convertir Polygon a MultiPolygon
      if (geometry.type === 'Polygon') {
        geometry = {
          type: 'MultiPolygon',
          coordinates: [geometry.coordinates]
        };
      }
    }

    try {
      const { error } = await supabase
        .from('neighborhoods')
        .upsert({
          id: id,
          codigo: codigo,
          nombre: nombre,
          comuna: comuna,
          region: region,
          personas: personas,
          hogares: hogares,
          geometry: geometry,
          properties: props
        }, {
          onConflict: 'id'
        });

      if (error) {
        console.error(`  ✗ Error en ${nombre}:`, error.message);
        errores++;
      } else {
        insertados++;
        if (insertados % 10 === 0) {
          console.log(`  ✓ Procesados: ${insertados}/${data.features.length}`);
        }
      }
    } catch (err) {
      console.error(`  ✗ Excepción en ${nombre}:`, err.message);
      errores++;
    }
  }

  console.log('\n========================================');
  console.log(`✅ COMPLETADO:`);
  console.log(`   - Insertados: ${insertados}`);
  console.log(`   - Errores: ${errores}`);
  console.log(`   - Total: ${data.features.length}`);
  console.log('========================================\n');
}

// Ejecutar
cargarVecindarios()
  .then(() => {
    console.log('✅ Proceso completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
