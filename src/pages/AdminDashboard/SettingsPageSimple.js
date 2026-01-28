import React from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import './SettingsPage.css';

const SettingsPageSimple = () => {
  return (
    <div className="settings-page">
      <div className="settings-header">
        <div className="header-content">
          <SettingsIcon style={{ fontSize: 40, color: '#3b82f6' }} />
          <div>
            <h1>Configuración</h1>
            <p>Ajustes y configuración del sistema</p>
          </div>
        </div>
      </div>
      <div className="settings-content" style={{ padding: '40px', textAlign: 'center' }}>
        <SettingsIcon style={{ fontSize: 80, opacity: 0.3, marginBottom: 20 }} />
        <h2 style={{ color: '#4a5568', marginBottom: 10 }}>Página de Configuración</h2>
        <p style={{ color: '#718096' }}>Esta sección estará disponible próximamente</p>
      </div>
    </div>
  );
};

export default SettingsPageSimple;
