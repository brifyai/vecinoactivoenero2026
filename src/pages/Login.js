import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useReduxAuth as useAuth } from '../hooks/useReduxAuth';
import { showErrorToast, showSuccessToast, showInfoToast } from '../utils/sweetalert';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SecurityIcon from '@mui/icons-material/Security';
import GroupsIcon from '@mui/icons-material/Groups';
import ErrorIcon from '@mui/icons-material/Error';
import './Login.css';

const Login = () => {
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

  // Si el usuario ya está autenticado y está en la página de login, redirigir a app
  useEffect(() => {
    if (isAuthenticated && location.pathname === '/iniciar-sesion-vecinos') {
      navigate('/app');
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
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        // Si "Recuérdame" está marcado, guardar email en localStorage
        if (formData.rememberMe) {
          localStorage.setItem('rememberedEmail', formData.email);
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

  const handleSocialLogin = (provider) => {
    showInfoToast(`Inicio de sesión con ${provider} próximamente!`);
  };

  // Cargar email recordado si existe
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setFormData(prev => ({
        ...prev,
        email: rememberedEmail,
        rememberMe: true
      }));
    }
  }, []);

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Lado izquierdo - Bienvenida */}
        <div className="login-welcome">
          <div className="welcome-logo">
            <PeopleIcon />
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
            <h2 className="form-title">Iniciar Sesión</h2>
            <p className="form-subtitle">Accede a tu cuenta para continuar</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
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
                placeholder="Contraseña" 
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

            <div className="divider">
              <span>O continúa con</span>
            </div>

            <div className="social-login">
              <button 
                type="button" 
                className="social-button google" 
                onClick={() => handleSocialLogin('Google')} 
                disabled={loading}
              >
                <GoogleIcon />
              </button>
              <button 
                type="button" 
                className="social-button facebook" 
                onClick={() => handleSocialLogin('Facebook')} 
                disabled={loading}
              >
                <FacebookIcon />
              </button>
              <button 
                type="button" 
                className="social-button twitter" 
                onClick={() => handleSocialLogin('Twitter')} 
                disabled={loading}
              >
                <TwitterIcon />
              </button>
            </div>

            <div className="register-link">
              ¿No tienes una cuenta? <a href="/registrarse">Registrarse</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
