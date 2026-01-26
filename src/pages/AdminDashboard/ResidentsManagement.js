import React from 'react';
import PeopleIcon from '@mui/icons-material/People';
import './AdminPages.css';

const ResidentsManagement = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-section">
          <PeopleIcon className="page-icon" />
          <div>
            <h1>Gestión de Vecinos</h1>
            <p>Audiencia, verificación y administración de residentes</p>
          </div>
        </div>
      </div>
      
      <div className="page-content">
        <div className="coming-soon-card">
          <h3>🚧 En Desarrollo</h3>
          <p>El sistema completo de gestión de vecinos estará disponible próximamente.</p>
          <div className="features-preview">
            <h4>Funcionalidades incluidas:</h4>
            <ul>
              <li>✅ Tabla avanzada de vecinos</li>
              <li>✅ Sistema de badges de verificación</li>
              <li>✅ Exportación/importación</li>
              <li>✅ Filtros dinámicos</li>
              <li>✅ Gestión de permisos</li>
              <li>✅ Historial de actividad</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResidentsManagement;