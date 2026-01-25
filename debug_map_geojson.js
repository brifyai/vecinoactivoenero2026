// Script para diagnosticar la carga del GeoJSON
console.log('🔍 Diagnosticando carga de GeoJSON...');

// Verificar si el archivo existe
fetch('/data/geo/unidades_vecinales_simple.geojson')
  .then(response => {
    console.log('📁 Respuesta del archivo:', response.status, response.statusText);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('✅ GeoJSON cargado exitosamente');
    console.log('📊 Número de features:', data.features?.length || 0);
    console.log('🗺️ Tipo de geometría:', data.features?.[0]?.geometry?.type);
    console.log('📋 Propiedades de ejemplo:', data.features?.[0]?.properties);
    
    // Verificar estructura
    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      console.log('🔍 Estructura de feature:');
      console.log('- ID:', feature.properties?.t_id_uv_ca);
      console.log('- Código UV:', feature.properties?.uv_carto);
      console.log('- Nombre:', feature.properties?.t_uv_nom);
      console.log('- Comuna:', feature.properties?.t_com_nom);
      console.log('- Región:', feature.properties?.t_reg_nom);
    }
  })
  .catch(error => {
    console.error('❌ Error cargando GeoJSON:', error);
  });