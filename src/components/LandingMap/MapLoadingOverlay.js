const MapLoadingOverlay = ({ loading }) => {
  if (!loading) return null;

  return (
    <div className="demo-map-loading">
      <div className="demo-loading-spinner"></div>
      <p>Cargando unidades vecinales...</p>
      <p className="demo-loading-tip">💡 Archivo de 75MB - puede tomar 30-60 segundos</p>
      <p className="demo-loading-detail">📊 6,891 unidades vecinales de Santiago</p>
      <div className="demo-loading-progress">
        <div className="progress-bar">
          <div className="progress-fill"></div>
        </div>
        <p className="progress-text">Descargando datos geográficos...</p>
      </div>
    </div>
  );
};

export default MapLoadingOverlay;