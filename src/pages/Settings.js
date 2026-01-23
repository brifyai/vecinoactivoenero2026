import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReduxAuth as useAuth } from '../hooks/useReduxAuth';
import { useSidebar } from '../context/SidebarContext';
import { showSuccessToast, showErrorToast, showInfoToast, showConfirmDialog, showInputDialog } from '../utils/sweetalert';
import imageService from '../services/imageService';
import ImageUploader from '../components/ImageUploader/ImageUploader';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';
import LanguageIcon from '@mui/icons-material/Language';
import HelpIcon from '@mui/icons-material/Help';
import InfoIcon from '@mui/icons-material/Info';
import LogoutIcon from '@mui/icons-material/Logout';
import SaveIcon from '@mui/icons-material/Save';
import './Settings.css';

const Settings = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const { isRightSidebarCollapsed } = useSidebar();
  const [activeTab, setActiveTab] = useState('account');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    location: user?.location || '',
    phone: '',
    website: ''
  });
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [usernameChecking, setUsernameChecking] = useState(false);

  // Sincronizar formData cuando user cambia
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        location: user.location || '',
        phone: '',
        website: ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Si es el username, validar formato y disponibilidad
    if (name === 'username') {
      const cleanUsername = value.toLowerCase().replace(/[^a-z0-9]/g, '');
      setFormData({
        ...formData,
        username: cleanUsername
      });
      
      // Validar disponibilidad (si es diferente al actual)
      if (cleanUsername.length >= 3 && cleanUsername !== user?.username) {
        setUsernameChecking(true);
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const exists = users.some(u => u.username === cleanUsername);
        setUsernameAvailable(!exists);
        setUsernameChecking(false);
      } else if (cleanUsername === user?.username) {
        setUsernameAvailable(true);
      } else {
        setUsernameAvailable(null);
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSave = () => {
    // Validar username si se cambió
    if (formData.username && formData.username.length < 3) {
      showErrorToast('El nombre de usuario debe tener al menos 3 caracteres');
      return;
    }
    
    if (usernameAvailable === false) {
      showErrorToast('Este nombre de usuario ya está en uso');
      return;
    }
    
    const result = updateUser(formData);
    if (result?.success) {
      showSuccessToast('¡Configuración guardada exitosamente!');
      
      // Si el username cambió, navegar al nuevo perfil
      if (formData.username !== user?.username) {
        navigate(`/${formData.username}`);
      }
    } else if (result?.error) {
      showErrorToast(result.error);
    }
  };

  const handleLogout = async () => {
    const result = await showConfirmDialog(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      'Sí, cerrar sesión',
      'Cancelar'
    );
    if (result.isConfirmed) {
      logout();
      setTimeout(() => {
        navigate('/iniciar-sesion', { replace: true });
        window.location.reload();
      }, 500);
    }
  };

  const handleChangePhoto = async (imageData) => {
    try {
      await imageService.saveProfileImage(user.id, imageData);
      updateUser({ avatar: imageData });
      showSuccessToast('¡Foto de perfil actualizada!');
    } catch (error) {
      showInfoToast(error.message || 'Error al actualizar foto');
    }
  };

  const handleSecurityAction = (action) => {
    showInfoToast(`Función de ${action} próximamente!`);
  };

  const handleReportProblem = async () => {
    const result = await showInputDialog('Reportar Problema', 'Describe el problema que encontraste', 'textarea');
    if (result.isConfirmed && result.value) {
      showSuccessToast('¡Problema reportado! Nuestro equipo lo revisará pronto.');
    }
  };

  const menuItems = [
    { id: 'account', icon: <PersonIcon />, label: 'Configuración de cuenta' },
    { id: 'security', icon: <LockIcon />, label: 'Seguridad e inicio de sesión' },
    { id: 'notifications', icon: <NotificationsIcon />, label: 'Notificaciones' },
    { id: 'privacy', icon: <PrivacyTipIcon />, label: 'Privacidad' },
    { id: 'language', icon: <LanguageIcon />, label: 'Idioma y región' },
    { id: 'help', icon: <HelpIcon />, label: 'Ayuda y soporte' },
    { id: 'about', icon: <InfoIcon />, label: 'Acerca de' },
  ];

  return (
    <div className={`settings-page ${isRightSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="settings-header">
        <h1>Configuración</h1>
        <p>Administra la configuración y preferencias de tu cuenta</p>
      </div>

      <div className="settings-container">
        <div className="settings-sidebar">
          <div className="settings-menu">
            {menuItems.map(item => (
              <button
                key={item.id}
                className={`settings-menu-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
            <button className="settings-menu-item logout" onClick={handleLogout}>
              <LogoutIcon />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>

        <div className="settings-content">
          {activeTab === 'account' && (
            <div className="settings-section">
              <h2>Configuración de Cuenta</h2>
              <p className="section-description">Actualiza la información de tu cuenta</p>

              <div className="profile-picture-section">
                <ImageUploader
                  currentImage={user?.avatar}
                  onImageSelect={handleChangePhoto}
                  type="profile"
                  buttonText="Cambiar Foto de Perfil"
                />
              </div>

              <div className="form-group">
                <label>Nombre Completo</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ingresa tu nombre completo"
                />
              </div>

              <div className="form-group">
                <label>Nombre de Usuario</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="tu-nombre-de-usuario"
                  maxLength="30"
                />
                <div className="username-preview">
                  vecinoactivo.cl/<strong>{formData.username || 'tu-username'}</strong>
                </div>
                {usernameAvailable === true && formData.username.length >= 3 && (
                  <div className="username-status available">✓ Nombre de usuario disponible</div>
                )}
                {usernameAvailable === false && (
                  <div className="username-status unavailable">✗ Este nombre de usuario ya está en uso</div>
                )}
                {formData.username && formData.username.length < 3 && (
                  <div className="username-status info">Mínimo 3 caracteres (solo letras y números)</div>
                )}
              </div>

              <div className="form-group">
                <label>Correo Electrónico</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Ingresa tu correo"
                />
              </div>

              <div className="form-group">
                <label>Biografía</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Cuéntanos sobre ti"
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label>Ubicación</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Ciudad, País"
                />
              </div>

              <div className="form-group">
                <label>Número de Teléfono</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="form-group">
                <label>Sitio Web</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://tusitio.com"
                />
              </div>

              <button className="save-btn" onClick={handleSave}>
                <SaveIcon fontSize="small" /> Guardar Cambios
              </button>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="settings-section">
              <h2>Seguridad e Inicio de Sesión</h2>
              <p className="section-description">Administra tu contraseña y configuración de seguridad</p>

              <div className="security-item">
                <div className="security-info">
                  <h4>Cambiar Contraseña</h4>
                  <p>Actualiza tu contraseña regularmente para mantener tu cuenta segura</p>
                </div>
                <button className="action-btn" onClick={() => handleSecurityAction('Cambiar Contraseña')}>Cambiar</button>
              </div>

              <div className="security-item">
                <div className="security-info">
                  <h4>Autenticación de Dos Factores</h4>
                  <p>Agrega una capa extra de seguridad a tu cuenta</p>
                </div>
                <button className="action-btn" onClick={() => handleSecurityAction('Autenticación de Dos Factores')}>Activar</button>
              </div>

              <div className="security-item">
                <div className="security-info">
                  <h4>Alertas de Inicio de Sesión</h4>
                  <p>Recibe notificaciones cuando alguien inicie sesión en tu cuenta</p>
                </div>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="security-item">
                <div className="security-info">
                  <h4>Sesiones Activas</h4>
                  <p>Ve dónde has iniciado sesión y administra tus sesiones</p>
                </div>
                <button className="action-btn" onClick={() => handleSecurityAction('Sesiones Activas')}>Ver</button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2>Notificaciones</h2>
              <p className="section-description">Elige qué notificaciones quieres recibir</p>

              <div className="notification-item">
                <div className="notification-info">
                  <h4>Comentarios</h4>
                  <p>Recibe notificaciones cuando alguien comente en tus publicaciones</p>
                </div>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="notification-item">
                <div className="notification-info">
                  <h4>Me gusta y Reacciones</h4>
                  <p>Recibe notificaciones cuando alguien reaccione a tus publicaciones</p>
                </div>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="notification-item">
                <div className="notification-info">
                  <h4>Solicitudes de Vecinos</h4>
                  <p>Recibe notificaciones cuando alguien te envíe una solicitud de vecinos</p>
                </div>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="notification-item">
                <div className="notification-info">
                  <h4>Mensajes</h4>
                  <p>Recibe notificaciones cuando recibas un nuevo mensaje</p>
                </div>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="notification-item">
                <div className="notification-info">
                  <h4>Notificaciones por Correo</h4>
                  <p>Recibe notificaciones por correo electrónico</p>
                </div>
                <label className="switch">
                  <input type="checkbox" />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="settings-section">
              <h2>Privacidad</h2>
              <p className="section-description">Controla quién puede ver tu contenido y contactarte</p>

              <div className="privacy-item">
                <div className="privacy-info">
                  <h4>Visibilidad del Perfil</h4>
                  <p>Quién puede ver tu perfil</p>
                </div>
                <select className="privacy-select">
                  <option>Todos</option>
                  <option>Vecinos</option>
                  <option>Solo yo</option>
                </select>
              </div>

              <div className="privacy-item">
                <div className="privacy-info">
                  <h4>Visibilidad de Publicaciones</h4>
                  <p>Visibilidad predeterminada para tus publicaciones</p>
                </div>
                <select className="privacy-select">
                  <option>Público</option>
                  <option>Amigos</option>
                  <option>Solo yo</option>
                  <option>Personalizado</option>
                </select>
              </div>

              <div className="privacy-item">
                <div className="privacy-info">
                  <h4>Solicitudes de Vecinos</h4>
                  <p>Quién puede enviarte solicitudes de vecinos</p>
                </div>
                <select className="privacy-select">
                  <option>Todos</option>
                  <option>Vecinos de vecinos</option>
                  <option>Nadie</option>
                </select>
              </div>

              <div className="privacy-item">
                <div className="privacy-info">
                  <h4>Lista de Amigos</h4>
                  <p>Quién puede ver tu lista de amigos</p>
                </div>
                <select className="privacy-select">
                  <option>Todos</option>
                  <option>Vecinos</option>
                  <option>Solo yo</option>
                </select>
              </div>

              <div className="privacy-item">
                <div className="privacy-info">
                  <h4>Etiquetas</h4>
                  <p>Quién puede etiquetarte en publicaciones</p>
                </div>
                <select className="privacy-select">
                  <option>Todos</option>
                  <option>Vecinos</option>
                  <option>Nadie</option>
                </select>
              </div>

              <div className="privacy-item">
                <div className="privacy-info">
                  <h4>Fotos y Videos</h4>
                  <p>Quién puede ver tus fotos y videos</p>
                </div>
                <select className="privacy-select">
                  <option>Público</option>
                  <option>Vecinos</option>
                  <option>Solo yo</option>
                </select>
              </div>

              <div className="privacy-item">
                <div className="privacy-info">
                  <h4>Mensajes</h4>
                  <p>Quién puede enviarte mensajes directos</p>
                </div>
                <select className="privacy-select">
                  <option>Todos</option>
                  <option>Vecinos</option>
                  <option>Nadie</option>
                </select>
              </div>

              <div className="privacy-item">
                <div className="privacy-info">
                  <h4>Visibilidad en Búsquedas</h4>
                  <p>Permitir que los motores de búsqueda enlacen a tu perfil</p>
                </div>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="privacy-item">
                <div className="privacy-info">
                  <h4>Actividad en Línea</h4>
                  <p>Mostrar cuando estás activo</p>
                </div>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="privacy-section-divider">
                <h3>Usuarios Bloqueados</h3>
                <p>Administra los usuarios que has bloqueado</p>
              </div>

              <div className="blocked-users-list">
                <p className="no-blocked-users">No has bloqueado a ningún usuario</p>
                <button className="action-btn" onClick={() => handleSecurityAction('Bloquear Usuario')}>
                  Bloquear Usuario
                </button>
              </div>

              <div className="privacy-section-divider">
                <h3>Reportar Contenido</h3>
                <p>Reporta contenido inapropiado o que viole nuestras normas</p>
              </div>

              <div className="report-options">
                <button className="report-btn" onClick={() => handleSecurityAction('Reportar Publicación')}>
                  Reportar Publicación
                </button>
                <button className="report-btn" onClick={() => handleSecurityAction('Reportar Usuario')}>
                  Reportar Usuario
                </button>
                <button className="report-btn" onClick={() => handleSecurityAction('Reportar Grupo')}>
                  Reportar Grupo
                </button>
              </div>

              <button className="save-btn" onClick={handleSave}>
                <SaveIcon fontSize="small" /> Guardar Configuración de Privacidad
              </button>
            </div>
          )}

          {activeTab === 'language' && (
            <div className="settings-section">
              <h2>Idioma y Región</h2>
              <p className="section-description">Personaliza tus preferencias de idioma y región</p>

              <div className="form-group">
                <label>Idioma</label>
                <select>
                  <option>Español</option>
                  <option>English (US)</option>
                  <option>Français</option>
                  <option>Deutsch</option>
                  <option>Português</option>
                </select>
              </div>

              <div className="form-group">
                <label>Zona Horaria</label>
                <select>
                  <option>Hora del Pacífico (PT)</option>
                  <option>Hora de la Montaña (MT)</option>
                  <option>Hora Central (CT)</option>
                  <option>Hora del Este (ET)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Formato de Fecha</label>
                <select>
                  <option>DD/MM/AAAA</option>
                  <option>MM/DD/AAAA</option>
                  <option>AAAA/MM/DD</option>
                </select>
              </div>

              <button className="save-btn">
                <SaveIcon fontSize="small" /> Guardar Cambios
              </button>
            </div>
          )}

          {activeTab === 'help' && (
            <div className="settings-section">
              <h2>Ayuda y Soporte</h2>
              <p className="section-description">Obtén ayuda y soporte para tu cuenta</p>

              <div className="help-item">
                <HelpIcon className="help-icon" />
                <div className="help-info">
                  <h4>Centro de Ayuda</h4>
                  <p>Encuentra respuestas a preguntas comunes</p>
                  <button className="link-btn" onClick={() => navigate('/ayuda')}>Visitar Centro de Ayuda →</button>
                </div>
              </div>

              <div className="help-item">
                <HelpIcon className="help-icon" />
                <div className="help-info">
                  <h4>Contactar Soporte</h4>
                  <p>Ponte en contacto con nuestro equipo de soporte</p>
                  <button className="link-btn" onClick={() => navigate('/contacto')}>Contáctanos →</button>
                </div>
              </div>

              <div className="help-item">
                <HelpIcon className="help-icon" />
                <div className="help-info">
                  <h4>Reportar un Problema</h4>
                  <p>Déjanos saber si algo no funciona</p>
                  <button className="link-btn" onClick={handleReportProblem}>Reportar →</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="settings-section">
              <h2>Acerca de Vecino Activo</h2>
              <p className="section-description">Aprende más sobre Vecino Activo</p>

              <div className="about-info">
                <h3>Vecino Activo v1.0.0</h3>
                <p>Conéctate con tus vecinos y tu comunidad en Vecino Activo.</p>
                
                <div className="about-links">
                  <a href="#terms">Términos de Servicio</a>
                  <a href="#privacy">Política de Privacidad</a>
                  <a href="#cookies">Política de Cookies</a>
                  <a href="#community">Normas de la Comunidad</a>
                </div>

                <p className="copyright">© 2026 Vecino Activo. Todos los derechos reservados.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
