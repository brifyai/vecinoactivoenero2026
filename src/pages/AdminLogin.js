import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useReduxAuth as useAuth } from '../hooks/useReduxAuth';
import { showErrorToast, showSuccessToast } from '../utils/sweetalert';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import BusinessIcon from '@mui/icons-material/Business';
import SecurityIcon from '@mui/icons-material/Security';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import CampaignIcon from '@mui/icons-material/Campaign';
import ErrorIcon from '@mui/icons-material/Error';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import './AdminLogin.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Si el usuario ya está autenticado, redirigir al dashboard admin
  useEffect(() => {
    if (isAuthenticated && location.pathname === '/iniciar-sesion-admin') {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate, location.pathname]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validaciones
    if (!formData.email || !formData.password) {
      showErrorToast('Por favor completa todos los campos');
      setLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      showErrorToast('Por favor ingresa un email válido');
      setLoading(false);
      return;
    }

    try {
      const result = await login(formData.email, formData.password, 'admin');
      
      if (result.success) {
        // Verificar que el usuario tenga permisos de administrador
        if (result.user && result.user.role === 'admin') {
          if (formData.rememberMe) {
            localStorage.setItem('rememberedAdminEmail', formData.email);
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

  // Cargar email recordado si existe
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedAdminEmail');
    if (rememberedEmail) {
      setFormData(prev => ({
        ...prev,
        email: rememberedEmail,
        rememberMe: true
      }));
    }
  }, []);

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        {/* Lado izquierdo - Panel Administrativo */}
        <div className="admin-welcome">
          <button 
            className="back-button"
            onClick={() => navigate('/iniciar-sesion')}
          >
            <ArrowBackIcon />
            Volver
          </button>
          
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

          <form onSubmit={handleLogin} className="admin-form">
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
                value={formData.email}
                onChange={handleChange}
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
                value={formData.password}
                onChange={handleChange}
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
                  checked={formData.rememberMe}
                  onChange={handleChange}
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
};

export default AdminLogin;