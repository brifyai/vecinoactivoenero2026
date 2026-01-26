import { GeoJSON } from 'react-leaflet';

const NeighborhoodsLayer = ({ showNeighborhoods, visibleFeatures, currentZoom, MIN_ZOOM_FOR_UVS }) => {
  if (!showNeighborhoods || visibleFeatures.length === 0 || currentZoom < MIN_ZOOM_FOR_UVS) {
    return null;
  }

  const onEachFeature = (feature, layer) => {
    console.log('🗺️ Renderizando feature:', feature.properties?.uv_carto);
    
    if (!feature.properties) return;
    
    const props = feature.properties;
    let nombre = props.t_uv_nom || 'Unidad Vecinal';
    const codigoUV = props.uv_carto || '';
    
    // Limpiar el nombre si ya contiene el código UV
    if (codigoUV && nombre.startsWith(codigoUV)) {
      nombre = nombre.substring(codigoUV.length).replace(/^[-\s]+/, '').trim();
    }
    
    const comuna = props.t_com_nom || '';
    const region = props.t_reg_nom || '';
    
    // Tooltip simple en hover
    if (codigoUV) {
      layer.bindTooltip(`UV ${codigoUV} - ${nombre}`, {
        permanent: false,
        direction: 'top',
        className: 'demo-uv-label',
        opacity: 0.9
      });
    }
    
    // Efecto hover
    layer.on('mouseover', function() {
      this.setStyle({ fillOpacity: 0.4, weight: 3 });
    });
    
    layer.on('mouseout', function() {
      this.setStyle({ fillOpacity: 0.2, weight: 2 });
    });
    
    // Popup con datos completos
    layer.on('click', function() {
      const personas = props.PERSONAS ? parseInt(props.PERSONAS).toLocaleString('es-CL') : '';
      const hogares = props.HOGARES ? parseInt(props.HOGARES).toLocaleString('es-CL') : '';
      const hombres = props.HOMBRE ? parseInt(props.HOMBRE).toLocaleString('es-CL') : '';
      const mujeres = props.MUJER ? parseInt(props.MUJER).toLocaleString('es-CL') : '';
      
      const popupContent = `
        <div class="demo-neighborhood-popup">
          <h4>UV ${codigoUV} - ${nombre}</h4>
          <p class="demo-popup-location">📍 ${comuna}, ${region}</p>
          
          ${personas && parseInt(personas.replace(/\./g, '')) > 0 ? `
          <div class="demo-popup-compact">
            <p><strong>👥 ${personas}</strong> personas</p>
            ${hombres && mujeres ? `<p>${hombres} hombres • ${mujeres} mujeres</p>` : ''}
            <p>🏠 ${hogares} hogares</p>
            <p class="demo-popup-census">📊 Censo 2017</p>
          </div>
          ` : `
          <div class="demo-popup-info">
            <p class="demo-popup-note">ℹ️ Datos demográficos no disponibles</p>
          </div>
          `}
          
          <p class="demo-popup-note">💡 Únete a Vecino Activo para ver más detalles y conectar con tus vecinos</p>
        </div>
      `;
      
      this.bindPopup(popupContent, {
        maxWidth: 280,
        className: 'demo-compact-popup'
      }).openPopup();
    });
  };

  return (
    <GeoJSON
      key={`geojson-${currentZoom}-${visibleFeatures.length}`}
      data={{
        type: 'FeatureCollection',
        features: visibleFeatures
      }}
      style={{
        fillColor: '#f97316',
        fillOpacity: 0.2,
        color: '#f97316',
        weight: 2
      }}
      onEachFeature={onEachFeature}
    />
  );
};

export default NeighborhoodsLayer;