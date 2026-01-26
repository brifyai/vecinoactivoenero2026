import React, { useState, useEffect } from 'react';
import { useReduxAdmin } from '../../hooks/useReduxAdmin';
import supabaseSettingsService from '../../services/supabaseSettingsService';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import BusinessIcon from '@mui/icons-material/Business';
import SecurityIcon from '@mui/icons-material/Security';
import PaletteIcon from '@mui/icons-material/Palette';
import CampaignIcon from '@mui/icons-material/Campaign';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SaveIcon from '@mui/icons-material/Save';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import './SettingsPage.css';

const SettingsPage = () => {
  const { getCurrentNeighborhoodName, getCurrentNeighborhoodId } = useReduxAdmin();
  
  const [activeTab, setActiveTab] = useState('notifications');
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    // Notificaciones
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    ticketAlerts: true,
    campaignAlerts: true,
    emergencyAlerts: true,
    
    // Unidad Vecinal
    uvName: getCurrentNeighborhoodName() || 'Mi Unidad Vecinal',
    uvAddress: '',
    uvPhone: '',
    uvEmail: '',
    uvWebsite: '',
    
    // Canales
    enableEmail: true,
    enablePush: true,
    enableWhatsApp: false,
    enableSMS: false,
    
    // Tema
    theme: 'light',
    primaryColor: '#3b82f6',
    accentColor: '#10b981',
    
    // Seguridad
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginAttempts: 5
  });

  const [saved, setSaved] = useState(false);
  const [adminUsers, setAdminUsers] = useState([]);

  // Cargar configuración al montar
  useEffect(() => {
    loadSettings();
    loadAdminUsers();
  }, []);

  const loadSettings = async () => {
    const neighborhoodId = getCurrentNeighborhoodId();
    if (!neighborhoodId) return;

    setLoading(true);
    try {
      const result = await supabaseSettingsService.getSettings(neighborhoodId);
      
      if (result.success && result.data) {
        // Mapear datos de la BD al estado local
        setSettings({
          emailNotifications: result.data.email_notifications,
          pushNotifications: result.data.push_notifications,
          smsNotifications: result.data.sms_notifications,
          ticketAlerts: result.data.ticket_alerts,
          campaignAlerts: result.data.campaign_alerts,
          emergencyAlerts: result.data.emergency_alerts,
          
          uvName: result.data.uv_name || getCurrentNeighborhoodName(),
          uvAddress: result.data.uv_address || '',
          uvPhone: result.data.uv_phone || '',
          uvEmail: result.data.uv_email || '',
          uvWebsite: result.data.uv_website || '',
          
          enableEmail: result.data.enable_email,
          enablePush: result.data.enable_push,
          enableWhatsApp: result.data.enable_whatsapp,
          enableSMS: result.data.enable_sms,
          
          theme: result.data.theme,
          primaryColor: result.data.primary_color,
          accentColor: result.data.accent_color,
          
          twoFactorAuth: result.data.two_factor_auth,
          sessionTimeout: result.data.session_timeout,
          passwordExpiry: result.data.password_expiry,
          loginAttempts: result.data.login_attempts
        });
      }
    } catch (error) {
      console.error('Error cargando configuración:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAdminUsers = async () => {
    const neighborhoodId = getCurrentNeighborhoodId();
    if (!neighborhoodId) return;

    try {
      const result = await supabaseSettingsService.getAdminUsers(neighborhoodId);
      if (result.success) {
        setAdminUsers(result.data);
      }
    } catch (error) {
      console.error('Error cargando administradores:', error);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    const neighborhoodId = getCurrentNeighborhoodId();
    if (!neighborhoodId) {
      alert('❌ Error: No se pudo identificar la unidad vecinal');
      return;
    }

    try {
      const result = await supabaseSettingsService.updateSettings(
        neighborhoodId,
        settings,
        'current-user-id' // TODO: Obtener del contexto de auth
      );
      
      if (result.success) {
        console.log('✅ Configuración guardada exitosamente');
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert(`❌ Error al guardar: ${result.error}`);
      }
    } catch (error) {
      console.error('Error guardando configuración:', error);
      alert('❌ Error al guardar la configuración');
    }
  };

  const handleRemoveAdmin = async (adminId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este administrador?')) {
      return;
    }

    try {
      const result = await supabaseSettingsService.removeAdminUser(adminId);
      if (result.success) {
        alert('✅ Administrador eliminado correctamente');
        loadAdminUsers(); // Recargar lista
      } else {
        alert(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error eliminando administrador:', error);
      alert('❌ Error al eliminar el administrador');
    }
  };

  const tabs = [
    { id: 'notifications', label: 'Notificaciones', icon: <NotificationsIcon /> },
    { id: 'uv', label: 'Unidad Vecinal', icon: <BusinessIcon /> },
    { id: 'admins', label: 'Administradores', icon: <AdminPanelSettingsIcon /> },
    { id: 'channels', label: 'Canales', icon: <CampaignIcon /> },
    { id: 'theme', label: 'Tema', icon: <PaletteIcon /> },
    { id: 'security', label: 'Seguridad', icon: <SecurityIcon /> }
  ];

  return (
    <div className="settings-page">
      {loading ? (
        <div className="settings-loading">
          <div className="loading-spinner"></div>
          <span>Cargando configuración...</span>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="settings-header">
        <div className="header-info">
          <SettingsIcon className="header-icon" />
          <div>
            <h1>Configuración</h1>
            <p>Ajustes del sistema y personalización</p>
          </div>
        </div>
        <button 
          className={`save-btn ${saved ? 'saved' : ''}`}
          onClick={handleSave}
        >
          <SaveIcon />
          {saved ? 'Guardado ✓' : 'Guardar Cambios'}
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
        {/* Notificaciones */}
        {activeTab === 'notifications' && (
          <div className="settings-section">
            <h2>Configuración de Notificaciones</h2>
            <p className="section-description">
              Gestiona cómo y cuándo recibes notificaciones del sistema
            </p>

            <div className="settings-group">
              <h3>Canales de Notificación</h3>
              <div className="setting-item">
                <div className="setting-info">
                  <label>Notificaciones por Email</label>
                  <span>Recibe alertas importantes por correo electrónico</span>
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

              <div className="setting-item">
                <div className="setting-info">
                  <label>Notificaciones Push</label>
                  <span>Recibe notificaciones en tiempo real en tu navegador</span>
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

              <div className="setting-item">
                <div className="setting-info">
                  <label>Notificaciones SMS</label>
                  <span>Recibe alertas urgentes por mensaje de texto</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.smsNotifications}
                    onChange={(e) => handleChange('smsNotifications', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="settings-group">
              <h3>Tipos de Alertas</h3>
              <div className="setting-item">
                <div className="setting-info">
                  <label>Alertas de Tickets</label>
                  <span>Notificar cuando se creen o actualicen tickets</span>
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

              <div className="setting-item">
                <div className="setting-info">
                  <label>Alertas de Campañas</label>
                  <span>Notificar sobre el estado de las campañas</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.campaignAlerts}
                    onChange={(e) => handleChange('campaignAlerts', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <label>Alertas de Emergencia</label>
                  <span>Notificar inmediatamente sobre emergencias</span>
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

        {/* Unidad Vecinal */}
        {activeTab === 'uv' && (
          <div className="settings-section">
            <h2>Información de la Unidad Vecinal</h2>
            <p className="section-description">
              Configura los datos de tu unidad vecinal
            </p>

            <div className="settings-group">
              <div className="form-group">
                <label>Nombre de la UV</label>
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
                  placeholder="Ej: Av. Apoquindo 4800, Las Condes"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    value={settings.uvPhone}
                    onChange={(e) => handleChange('uvPhone', e.target.value)}
                    placeholder="+56 9 1234 5678"
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={settings.uvEmail}
                    onChange={(e) => handleChange('uvEmail', e.target.value)}
                    placeholder="contacto@uv.cl"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Sitio Web (Opcional)</label>
                <input
                  type="url"
                  value={settings.uvWebsite}
                  onChange={(e) => handleChange('uvWebsite', e.target.value)}
                  placeholder="https://www.uv.cl"
                />
              </div>
            </div>
          </div>
        )}

        {/* Administradores */}
        {activeTab === 'admins' && (
          <div className="settings-section">
            <h2>Gestión de Administradores</h2>
            <p className="section-description">
              Administra los usuarios con permisos administrativos
            </p>

            <div className="admins-list">
              {adminUsers.length > 0 ? (
                adminUsers.map(admin => (
                  <div key={admin.id} className="admin-card">
                    <div className="admin-avatar">
                      {admin.user_avatar ? (
                        <img src={admin.user_avatar} alt={admin.user_name} />
                      ) : (
                        <AdminPanelSettingsIcon />
                      )}
                    </div>
                    <div className="admin-info">
                      <div className="admin-name">{admin.user_name}</div>
                      <div className="admin-email">{admin.user_email}</div>
                      <div className="admin-role">{admin.role}</div>
                    </div>
                    <div className="admin-actions">
                      <button 
                        className="admin-action-btn delete"
                        onClick={() => handleRemoveAdmin(admin.id)}
                        title="Eliminar administrador"
                      >
                        <DeleteIcon />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="coming-soon-box">
                  <AdminPanelSettingsIcon />
                  <h3>No hay administradores</h3>
                  <p>Agrega usuarios con permisos administrativos</p>
                  <button className="add-admin-btn">
                    <PersonAddIcon />
                    Agregar Administrador
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Canales */}
        {activeTab === 'channels' && (
          <div className="settings-section">
            <h2>Configuración de Canales</h2>
            <p className="section-description">
              Habilita o deshabilita los canales de comunicación
            </p>

            <div className="settings-group">
              <div className="setting-item">
                <div className="setting-info">
                  <label>Canal de Email</label>
                  <span>Permite enviar campañas por correo electrónico</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.enableEmail}
                    onChange={(e) => handleChange('enableEmail', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <label>Canal Push</label>
                  <span>Permite enviar notificaciones push</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.enablePush}
                    onChange={(e) => handleChange('enablePush', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <label>Canal WhatsApp</label>
                  <span>Permite enviar mensajes por WhatsApp</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.enableWhatsApp}
                    onChange={(e) => handleChange('enableWhatsApp', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <label>Canal SMS</label>
                  <span>Permite enviar mensajes de texto</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.enableSMS}
                    onChange={(e) => handleChange('enableSMS', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Tema */}
        {activeTab === 'theme' && (
          <div className="settings-section">
            <h2>Personalización de Tema</h2>
            <p className="section-description">
              Personaliza la apariencia del dashboard
            </p>

            <div className="settings-group">
              <div className="form-group">
                <label>Modo de Color</label>
                <select
                  value={settings.theme}
                  onChange={(e) => handleChange('theme', e.target.value)}
                >
                  <option value="light">Claro</option>
                  <option value="dark">Oscuro</option>
                  <option value="auto">Automático</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Color Primario</label>
                  <input
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) => handleChange('primaryColor', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Color de Acento</label>
                  <input
                    type="color"
                    value={settings.accentColor}
                    onChange={(e) => handleChange('accentColor', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Seguridad */}
        {activeTab === 'security' && (
          <div className="settings-section">
            <h2>Configuración de Seguridad</h2>
            <p className="section-description">
              Configura las opciones de seguridad del sistema
            </p>

            <div className="settings-group">
              <div className="setting-item">
                <div className="setting-info">
                  <label>Autenticación de Dos Factores</label>
                  <span>Requiere un código adicional al iniciar sesión</span>
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
                <span className="form-hint">La sesión se cerrará automáticamente después de este tiempo de inactividad</span>
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
                <span className="form-hint">Los usuarios deberán cambiar su contraseña después de este período</span>
              </div>

              <div className="form-group">
                <label>Intentos de Login Permitidos</label>
                <input
                  type="number"
                  value={settings.loginAttempts}
                  onChange={(e) => handleChange('loginAttempts', parseInt(e.target.value))}
                  min="3"
                  max="10"
                />
                <span className="form-hint">La cuenta se bloqueará temporalmente después de este número de intentos fallidos</span>
              </div>
            </div>
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
};

export default SettingsPage;