import React, { useState } from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import BusinessIcon from '@mui/icons-material/Business';
import SecurityIcon from '@mui/icons-material/Security';
import SaveIcon from '@mui/icons-material/Save';
import './SettingsPage.css';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [saved, setSaved] = useState(false);
  
  const [settings, setSettings] = useState({
    // General
    uvName: 'Unidad Vecinal Las Condes Centro',
    uvAddress: 'Av. Apoquindo 4500',
    uvPhone: '+56 2 2345 6789',
    uvEmail: 'contacto@uvlascondes.cl',
    
    // Notificaciones
    emailNotifications: true,
    pushNotifications: true,
    ticketAlerts: true,
    emergencyAlerts: true,
    
    // Seguridad
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90
  });

  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
    setSaved(false);
  };

  const handleSave = () => {
    // Aquí iría la lógica para guardar en la base de datos
    console.log('Guardando configuración:', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: <BusinessIcon /> },
    { id: 'notifications', label: 'Notificaciones', icon: <NotificationsIcon /> },
    { id: 'security', label: 'Seguridad', icon: <SecurityIcon /> }
  ];

  return (
    <div className="settings-page">
      {/* Header */}
      <div className="settings-header">
        <div className="header-content">
          <SettingsIcon style={{ fontSize: 40, color: '#3b82f6' }} />
          <div>
            <h1>Configuración</h1>
            <p>Administra la configuración de tu unidad vecinal</p>
          </div>
        </div>
        <button 
          className={`save-btn ${saved ? 'saved' : ''}`}
          onClick={handleSave}
        >
          <SaveIcon />
          {saved ? 'Guardado' : 'Guardar Cambios'}
        </button>
      </div>

      {/* Tabs */}
      <div className="settings-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="settings-content">
        {/* General */}
        {activeTab === 'general' && (
          <div className="settings-section">
            <h2>Información General</h2>
            <p className="section-description">
              Configura los datos básicos de tu unidad vecinal
            </p>

            <div className="form-grid">
              <div className="form-group">
                <label>Nombre de la Unidad Vecinal</label>
                <input
                  type="text"
                  value={settings.uvName}
                  onChange={(e) => handleChange('uvName', e.target.value)}
                  placeholder="Ej: Unidad Vecinal Las Condes Centro"
                />
              </div>

              <div className="form-group">
                <label>Dirección</label>
                <input
                  type="text"
                  value={settings.uvAddress}
                  onChange={(e) => handleChange('uvAddress', e.target.value)}
                  placeholder="Dirección de la sede"
                />
              </div>

              <div className="form-group">
                <label>Teléfono</label>
                <input
                  type="tel"
                  value={settings.uvPhone}
                  onChange={(e) => handleChange('uvPhone', e.target.value)}
                  placeholder="+56 2 2345 6789"
                />
              </div>

              <div className="form-group">
                <label>Email de Contacto</label>
                <input
                  type="email"
                  value={settings.uvEmail}
                  onChange={(e) => handleChange('uvEmail', e.target.value)}
                  placeholder="contacto@unidadvecinal.cl"
                />
              </div>
            </div>
          </div>
        )}

        {/* Notificaciones */}
        {activeTab === 'notifications' && (
          <div className="settings-section">
            <h2>Preferencias de Notificaciones</h2>
            <p className="section-description">
              Configura cómo y cuándo recibir notificaciones
            </p>

            <div className="form-group-vertical">
              <div className="toggle-item">
                <div className="toggle-info">
                  <h4>Notificaciones por Email</h4>
                  <p>Recibe alertas importantes por correo electrónico</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="toggle-item">
                <div className="toggle-info">
                  <h4>Notificaciones Push</h4>
                  <p>Recibe notificaciones en tiempo real en tu navegador</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.pushNotifications}
                    onChange={(e) => handleChange('pushNotifications', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="toggle-item">
                <div className="toggle-info">
                  <h4>Alertas de Tickets</h4>
                  <p>Notificaciones cuando se crean o actualizan tickets</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.ticketAlerts}
                    onChange={(e) => handleChange('ticketAlerts', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="toggle-item">
                <div className="toggle-info">
                  <h4>Alertas de Emergencia</h4>
                  <p>Notificaciones inmediatas para situaciones de emergencia</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.emergencyAlerts}
                    onChange={(e) => handleChange('emergencyAlerts', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Seguridad */}
        {activeTab === 'security' && (
          <div className="settings-section">
            <h2>Configuración de Seguridad</h2>
            <p className="section-description">
              Protege tu cuenta y datos sensibles
            </p>

            <div className="form-group-vertical">
              <div className="toggle-item">
                <div className="toggle-info">
                  <h4>Autenticación de Dos Factores</h4>
                  <p>Agrega una capa extra de seguridad a tu cuenta</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.twoFactorAuth}
                    onChange={(e) => handleChange('twoFactorAuth', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="form-group">
                <label>Tiempo de Sesión (minutos)</label>
                <input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
                  min="5"
                  max="120"
                />
                <span className="form-hint">
                  La sesión se cerrará automáticamente después de este tiempo de inactividad
                </span>
              </div>

              <div className="form-group">
                <label>Expiración de Contraseña (días)</label>
                <input
                  type="number"
                  value={settings.passwordExpiry}
                  onChange={(e) => handleChange('passwordExpiry', parseInt(e.target.value))}
                  min="30"
                  max="365"
                />
                <span className="form-hint">
                  Se solicitará cambiar la contraseña después de este período
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
