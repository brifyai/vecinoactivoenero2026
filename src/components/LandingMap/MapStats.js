const MapStats = ({ neighborhoodsData, currentZoom, visibleFeatures, MIN_ZOOM_FOR_UVS }) => {
  if (!neighborhoodsData) return null;

  return (
    <div className="landing-map-stats">
      <div className="demo-stat-card">
        <span className="demo-stat-number">{neighborhoodsData.features.length.toLocaleString('es-CL')}</span>
        <span className="demo-stat-label">Unidades Vecinales</span>
        <span className="demo-stat-note">Datos Reales</span>
      </div>
      <div className="demo-stat-card">
        <span className="demo-stat-number">
          {currentZoom >= MIN_ZOOM_FOR_UVS ? visibleFeatures.length : 0}
        </span>
        <span className="demo-stat-label">Visibles</span>
        <span className="demo-stat-note">En Pantalla</span>
      </div>
      <div className="demo-stat-card">
        <span className="demo-stat-number">
          {neighborhoodsData.features
            .filter(f => f.properties.PERSONAS && parseInt(f.properties.PERSONAS) > 0)
            .reduce((sum, f) => sum + (parseInt(f.properties.PERSONAS) || 0), 0)
            .toLocaleString('es-CL')}
        </span>
        <span className="demo-stat-label">Habitantes</span>
        <span className="demo-stat-note">Censo 2017</span>
      </div>
    </div>
  );
};

export default MapStats;