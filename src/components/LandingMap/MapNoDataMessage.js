const MapNoDataMessage = ({ loading, neighborhoodsData, onRetry }) => {
  if (loading || neighborhoodsData) return null;

  return (
    <div className="landing-map-no-data">
      <div className="no-data-message">
        <h3>⚠️ Datos de Unidades Vecinales No Disponibles</h3>
        <p>No se pudieron cargar los datos de las unidades vecinales.</p>
        <p>El mapa funciona solo con búsqueda de direcciones.</p>
        <button 
          className="retry-button"
          onClick={onRetry}
        >
          🔄 Reintentar Carga
        </button>
      </div>
    </div>
  );
};

export default MapNoDataMessage;