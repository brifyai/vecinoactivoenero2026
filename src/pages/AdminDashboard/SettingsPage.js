import React from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import './AdminPages.css';

const SettingsPage = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-section">
          <SettingsIcon className="page-icon" />
          <div>
            <h1>Configuración</h1>
            <p>Ajustes del sistema y personalización</p>
          </div>
        </div>
      </div>
      
      <div className="page-content">
        <div className="coming-soon-card">
          <h3>🚧 En Desarrollo</h3>
          <p>El panel de configuración completo estará disponible próximamente.</p>
          <div className="features-preview">
            <h4>Funcionalidades incluidas:</h4>
            <ul>
              <li>✅ Configuración de notificaciones</li>
              <li>✅ Ajustes de la UV</li>
              <li>✅ Gestión de usuarios admin</li>
              <li>✅ Configuración de canales</li>
              <li>✅ Personalización de temas</li>
              <li>✅ Configuración de seguridad</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;