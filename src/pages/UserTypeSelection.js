/**
 * Sistema de Login Integrado - Vecino Activo
 * Permite login de Vecinos y Unidad Vecinal en una sola página
 * Última actualización: 2026-01-25 - VERSIÓN INTEGRADA FUNCIONAL
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReduxAuth as useAuth } from '../hooks/useReduxAuth';
import { showErrorToast, showSuccessToast } from '../utils/sweetalert';

// Material UI Icons
import PeopleIcon from '@mui/icons-material/People';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import GroupsIcon from '@mui/icons-material/Groups';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import BusinessIcon from '@mui/icons-material/Business';
import SecurityIcon from '@mui/icons-material/Security';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import CampaignIcon from '@mui/icons-material/Campaign';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import './UserTypeSelection.css';

const UserTypeSelection = () => {
  console.log('🔄 UserTypeSelection component loading - INTEGRATED VERSION');
  
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  
  // Estados para el tipo de usuario seleccionado
  const [selectedUserType, setSelectedUserType] = useState('vecinos'); // Por defecto 'vecinos'
  
  // Estados para el formulario de vecinos
  const [vecinosForm, setVecinosForm] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  // Estados para el formulario de admin
  const [adminForm, setAdminForm] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  // Estados generales
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Si el usuario ya está autenticado, redirigir
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app');
    }
  }, [isAuthenticated, navigate]);

  // Cargar emails recordados
  useEffect(() => {
    const rememberedVecinosEmail = localStorage.getItem('rememberedEmail');
    const rememberedAdminEmail = localStorage.getItem('rememberedAdminEmail');
    
    if (rememberedVecinosEmail) {
      setVecinosForm(prev => ({
        ...prev,
        email: rememberedVecinosEmail,
        rememberMe: true
      }));
    }
    
    if (rememberedAdminEmail) {
      setAdminForm(prev => ({
        ...prev,
        email: rememberedAdminEmail,
        rememberMe: true
      }));
    }
  }, []);

  const handleUserTypeSelect = (type) => {
    setSelectedUserType(type);
    setError('');
  };

  const handleVecinosChange = (e) => {
    const { name, value, type, checked } = e.target;
    setVecinosForm({
      ...vecinosForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleAdminChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAdminForm({
      ...adminForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleVecinosLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validaciones
    if (!vecinosForm.email || !vecinosForm.password) {
      showErrorToast('Por favor completa todos los campos');
      setLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vecinosForm.email)) {
      showErrorToast('Por favor ingresa un email válido');
      setLoading(false);
      return;
    }

    try {
      const result = await login(vecinosForm.email, vecinosForm.password);
      
      if (result.success) {
        if (vecinosForm.rememberMe) {
          localStorage.setItem('rememberedEmail', vecinosForm.email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        
        showSuccessToast('¡Bienvenido de vuelta!');
        navigate('/app');
      } else {
        showErrorToast(result.error || 'Credenciales inválidas');
        setError(result.error || 'Credenciales inválidas');
      }
    } catch (err) {
      showErrorToast('Error al iniciar sesión. Por favor intenta de nuevo.');
      setError('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validaciones
    if (!adminForm.email || !adminForm.password) {
      showErrorToast('Por favor completa todos los campos');
      setLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminForm.email)) {
      showErrorToast('Por favor ingresa un email válido');
      setLoading(false);
      return;
    }

    try {
      const result = await login(adminForm.email, adminForm.password, 'admin');
      
      if (result.success) {
        // Verificar que el usuario tenga permisos de administrador
        if (result.user && result.user.role === 'admin') {
          if (adminForm.rememberMe) {
            localStorage.setItem('rememberedAdminEmail', adminForm.email);
          } else {
            localStorage.removeItem('rememberedAdminEmail');
          }
          
          showSuccessToast('¡Bienvenido al Panel Administrativo!');
          navigate('/admin/dashboard');
        } else {
          showErrorToast('No tienes permisos de administrador');
          setError('Acceso denegado: Se requieren permisos de administrador');
        }
      } else {
        showErrorToast(result.error || 'Credenciales inválidas');
        setError(result.error || 'Credenciales inválidas');
      }
    } catch (err) {
      showErrorToast('Error al iniciar sesión. Por favor intenta de nuevo.');
      setError('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  // Renderizar formulario de login para vecinos (por defecto)
  if (selectedUserType === 'vecinos') {
    return (
      <div className="login-page vecinos-login">
        {/* Pestañas de navegación */}
        <div className="login-tabs-wrapper">
          <div className="login-tabs">
            <button 
              className={`tab-button ${selectedUserType === 'vecinos' ? 'active' : ''}`}
              onClick={() => setSelectedUserType('vecinos')}
            >
              <GroupsIcon />
              Vecinos
            </button>
            <button 
              className={`tab-button ${selectedUserType === 'admin' ? 'active' : ''}`}
              onClick={() => setSelectedUserType('admin')}
            >
              <AdminPanelSettingsIcon />
              Unidad Vecinal
            </button>
          </div>
        </div>

        <div className="login-container">
          {/* Lado izquierdo - Bienvenida */}
          <div className="login-welcome">
            <div className="welcome-logo">
              <GroupsIcon />
            </div>
            <h1 className="welcome-title">¡Bienvenido a Vecino Activo!</h1>
            <p className="welcome-subtitle">
              Conecta con tu comunidad, participa en actividades locales y construye relaciones duraderas con tus vecinos.
            </p>
            
            <div className="welcome-features">
              <div className="feature-item">
                <div className="feature-icon">
                  <GroupsIcon style={{ fontSize: 32, color: 'white' }} />
                </div>
                <span>Conecta con vecinos cercanos</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <CheckCircleIcon style={{ fontSize: 32, color: 'white' }} />
                </div>
                <span>Participa en eventos locales</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <SecurityIcon style={{ fontSize: 32, color: 'white' }} />
                </div>
                <span>Comunidad segura y verificada</span>
              </div>
            </div>
          </div>

          {/* Lado derecho - Formulario */}
          <div className="login-form-section">
            <div className="form-header">
              <h2 className="form-title">Iniciar Sesión - Vecinos</h2>
              <p className="form-subtitle">Accede a tu cuenta para continuar</p>
            </div>

            <form onSubmit={handleVecinosLogin} className="login-form">
              {error && (
                <div className="error-message">
                  <ErrorIcon className="error-icon" />
                  <span>{error}</span>
                </div>
              )}
              
              <div className="input-group">
                <input 
                  type="email" 
                  name="email"
                  placeholder="Correo electrónico" 
                  value={vecinosForm.email}
                  onChange={handleVecinosChange}
                  required 
                  disabled={loading}
                  className="input-field"
                />
                <EmailIcon className="input-icon" />
              </div>

              <div className="input-group">
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password"
                  placeholder="Contraseña" 
                  value={vecinosForm.password}
                  onChange={handleVecinosChange}
                  required 
                  disabled={loading}
                  className="input-field"
                />
                <LockIcon className="input-icon" />
                <button 
                  type="button" 
                  className="password-toggle" 
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </button>
              </div>

              <div className="form-options">
                <label className="checkbox-group">
                  <input 
                    type="checkbox" 
                    name="rememberMe"
                    checked={vecinosForm.rememberMe}
                    onChange={handleVecinosChange}
                    disabled={loading}
                  />
                  <span>Recuérdame</span>
                </label>
                <a href="/recuperar-contrasena" className="forgot-link">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <button type="submit" className="login-button" disabled={loading}>
                {loading && <div className="loading-spinner"></div>}
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>

              <div className="register-link">
                ¿No tienes una cuenta? <a href="/registrarse">Registrarse</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar formulario de login para admin
  if (selectedUserType === 'admin') {
    return (
      <div className="admin-login-page">
        {/* Pestañas de navegación */}
        <div className="login-tabs-wrapper admin-tabs-wrapper">
          <div className="login-tabs admin-tabs">
            <button 
              className={`tab-button ${selectedUserType === 'vecinos' ? 'active' : ''}`}
              onClick={() => setSelectedUserType('vecinos')}
            >
              <GroupsIcon />
              Vecinos
            </button>
            <button 
              className={`tab-button ${selectedUserType === 'admin' ? 'active' : ''}`}
              onClick={() => setSelectedUserType('admin')}
            >
              <AdminPanelSettingsIcon />
              Unidad Vecinal
            </button>
          </div>
        </div>

        <div className="admin-login-container">
          {/* Lado izquierdo - Panel Administrativo */}
          <div className="admin-welcome">
            <div className="welcome-logo">
              <AdminPanelSettingsIcon />
            </div>
            <h1 className="welcome-title">Panel Administrativo</h1>
            <h2 className="welcome-subtitle">Unidad Vecinal</h2>
            <p className="welcome-description">
              Acceso exclusivo para dirigentes y administradores de unidades vecinales. 
              Gestiona tu comunidad con herramientas profesionales.
            </p>
            
            <div className="admin-features">
              <div className="feature-item">
                <div className="feature-icon">
                  <AnalyticsIcon style={{ fontSize: 28, color: 'white' }} />
                </div>
                <div className="feature-content">
                  <span className="feature-title">Dashboard Analytics</span>
                  <span className="feature-desc">Métricas y estadísticas en tiempo real</span>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <CampaignIcon style={{ fontSize: 28, color: 'white' }} />
                </div>
                <div className="feature-content">
                  <span className="feature-title">Comunicación Masiva</span>
                  <span className="feature-desc">Push, Email y WhatsApp integrados</span>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <BusinessIcon style={{ fontSize: 28, color: 'white' }} />
                </div>
                <div className="feature-content">
                  <span className="feature-title">Gestión de Reportes</span>
                  <span className="feature-desc">Sistema de tickets profesional</span>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <SecurityIcon style={{ fontSize: 28, color: 'white' }} />
                </div>
                <div className="feature-content">
                  <span className="feature-title">Seguridad Avanzada</span>
                  <span className="feature-desc">Control de acceso y auditoría</span>
                </div>
              </div>
            </div>
          </div>

          {/* Lado derecho - Formulario */}
          <div className="admin-form-section">
            <div className="form-header">
              <h2 className="form-title">Acceso Administrativo</h2>
              <p className="form-subtitle">Ingresa tus credenciales de administrador</p>
            </div>

            <form onSubmit={handleAdminLogin} className="admin-form">
              {error && (
                <div className="error-message">
                  <ErrorIcon className="error-icon" />
                  <span>{error}</span>
                </div>
              )}
              
              <div className="input-group">
                <input 
                  type="email" 
                  name="email"
                  placeholder="Email administrativo" 
                  value={adminForm.email}
                  onChange={handleAdminChange}
                  required 
                  disabled={loading}
                  className="input-field"
                />
                <EmailIcon className="input-icon" />
              </div>

              <div className="input-group">
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password"
                  placeholder="Contraseña administrativa" 
                  value={adminForm.password}
                  onChange={handleAdminChange}
                  required 
                  disabled={loading}
                  className="input-field"
                />
                <LockIcon className="input-icon" />
                <button 
                  type="button" 
                  className="password-toggle" 
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </button>
              </div>

              <div className="form-options">
                <label className="checkbox-group">
                  <input 
                    type="checkbox" 
                    name="rememberMe"
                    checked={adminForm.rememberMe}
                    onChange={handleAdminChange}
                    disabled={loading}
                  />
                  <span>Recordar en este dispositivo</span>
                </label>
              </div>

              <button type="submit" className="admin-login-button" disabled={loading}>
                {loading && <div className="loading-spinner"></div>}
                {loading ? 'Verificando acceso...' : 'Acceder al Panel'}
              </button>

              <div className="security-notice">
                <SecurityIcon className="security-icon" />
                <div className="security-text">
                  <strong>Acceso Seguro</strong>
                  <span>Este panel está protegido con autenticación de dos factores y auditoría completa.</span>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default UserTypeSelection;