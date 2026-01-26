import React from 'react';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import './AdminPages.css';

const AnalyticsPage = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-section">
          <AnalyticsIcon className="page-icon" />
          <div>
            <h1>Analytics</h1>
            <p>Métricas, reportes y visualización de datos</p>
          </div>
        </div>
      </div>
      
      <div className="page-content">
        <div className="coming-soon-card">
          <h3>🚧 En Desarrollo</h3>
          <p>El sistema completo de analytics estará disponible próximamente.</p>
          <div className="features-preview">
            <h4>Funcionalidades incluidas:</h4>
            <ul>
              <li>✅ Mapas con heatmaps</li>
              <li>✅ Métricas en tiempo real</li>
              <li>✅ Reportes personalizables</li>
              <li>✅ Dashboards interactivos</li>
              <li>✅ Exportación de datos</li>
              <li>✅ Análisis de engagement</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;