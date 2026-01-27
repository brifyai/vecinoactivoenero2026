import { GeoJSON } from 'react-leaflet';

const NeighborhoodsLayer = ({ showNeighborhoods, visibleFeatures, currentZoom, MIN_ZOOM_FOR_UVS }) => {
  if (!showNeighborhoods || visibleFeatures.length === 0 || currentZoom < MIN_ZOOM_FOR_UVS) {
    return null;
  }

  const onEachFeature = (feature, layer) => {
    if (!feature.properties) {
      console.warn('⚠️ Feature sin propiedades:', feature);
      return;
    }
    
    const props = feature.properties;
    
    // Usar las propiedades correctas del GeoJSON
    const codigoUV = props.uv_carto || 'S/N';
    const nombre = props.t_uv_nom || 'Sin nombre';
    const comuna = props.t_com_nom || 'Sin comuna';
    const region = props.t_reg_nom || 'Sin región';
    
    console.log('🗺️ Procesando UV:', {
      codigoUV,
      nombre,
      comuna,
      region,
      propiedadesOriginales: props
    });
    
    // Tooltip simple en hover
    layer.bindTooltip(`UV ${codigoUV} - ${nombre}`, {
      permanent: false,
      direction: 'top',
      className: 'demo-uv-label',
      opacity: 0.9
    });
    
    // Efecto hover
    layer.on('mouseover', function() {
      this.setStyle({ fillOpacity: 0.4, weight: 3 });
    });
    
    layer.on('mouseout', function() {
      this.setStyle({ fillOpacity: 0.2, weight: 2 });
    });
    
    // Popup con datos completos
    layer.on('click', function() {
      console.log('🖱️ Click en UV, propiedades:', props);
      
      // Formatear números con separador de miles
      const personas = props.PERSONAS ? parseInt(props.PERSONAS).toLocaleString('es-CL') : null;
      const hogares = props.HOGARES ? parseInt(props.HOGARES).toLocaleString('es-CL') : null;
      const hombres = props.HOMBRE ? parseInt(props.HOMBRE).toLocaleString('es-CL') : null;
      const mujeres = props.MUJER ? parseInt(props.MUJER).toLocaleString('es-CL') : null;
      
      console.log('📊 Datos formateados:', {
        personas,
        hogares,
        hombres,
        mujeres
      });
      
      const popupContent = `
        <div class="demo-neighborhood-popup">
          <h4>UV ${codigoUV}</h4>
          <p style="margin: 5px 0; font-size: 14px;"><strong>${nombre}</strong></p>
          <p class="demo-popup-location">📍 ${comuna}, ${region}</p>
          
          ${personas ? `
          <div class="demo-popup-compact">
            <p><strong>👥 ${personas}</strong> personas</p>
            ${hombres && mujeres ? `<p style="font-size: 13px; color: #666;">${hombres} hombres • ${mujeres} mujeres</p>` : ''}
            ${hogares ? `<p>🏠 ${hogares} hogares</p>` : ''}
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
      
      console.log('📝 Popup HTML generado:', popupContent);
      
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