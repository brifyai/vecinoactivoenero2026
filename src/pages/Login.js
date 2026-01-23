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

  // Si el usuario ya está autenticado y está en la página de login, redirigir a home
  useEffect(() => {
    if (isAuthenticated && location.pathname === '/iniciar-sesion') {
      navigate('/');
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
      const result = login(formData.email, formData.password);
      
      if (result.success) {
        // Si "Recuérdame" está marcado, guardar email en localStorage
        if (formData.rememberMe) {
          localStorage.setItem('rememberedEmail', formData.email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        
        showSuccessToast('¡Bienvenido de vuelta!');
        navigate('/');
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
      <div className="login-header">
        <div className="login-logo">Vecino Activo</div>
        <div className="login-nav">
          <button onClick={() => navigate('/registrarse')}>Registrarse</button>
        </div>
      </div>

      <div className="login-content">
        <div className="login-left">
          <div className="login-illustration">
            <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop" alt="Inicia sesión" />
          </div>
          <h1>¡Bienvenido de vuelta!</h1>
          <p>Inicia sesión para conectar con tus vecinos y tu comunidad.</p>
        </div>

        <div className="login-right">
          <div className="login-card">
            <h2>Iniciar sesión</h2>
            <p className="login-subtitle">Accede a tu cuenta</p>

            <form onSubmit={handleLogin}>
              {error && <div className="error-message">{error}</div>}
              
              <div className="form-group">
                <label>Correo electrónico</label>
                <div className="input-with-icon">
                  <input 
                    type="email" 
                    name="email"
                    placeholder="Ingresa tu correo" 
                    value={formData.email}
                    onChange={handleChange}
                    required 
                    disabled={loading}
                  />
                  <EmailIcon className="input-icon" />
                </div>
              </div>

              <div className="form-group">
                <label>Contraseña</label>
                <div className="input-with-icon">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password"
                    placeholder="Ingresa tu contraseña" 
                    value={formData.password}
                    onChange={handleChange}
                    required 
                    disabled={loading}
                  />
                  <button 
                    type="button" 
                    className="input-icon-btn" 
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="remember-me">
                  <input 
                    type="checkbox" 
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <span>Recuérdame</span>
                </label>
                <a href="/recuperar-contrasena" className="forgot-password">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <button type="submit" className="btn-login" disabled={loading}>
                {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </button>

              <div className="social-login">
                <p>O inicia sesión con</p>
                <div className="social-buttons">
                  <button type="button" className="social-btn google" onClick={() => handleSocialLogin('Google')} disabled={loading}><GoogleIcon /></button>
                  <button type="button" className="social-btn facebook" onClick={() => handleSocialLogin('Facebook')} disabled={loading}><FacebookIcon /></button>
                  <button type="button" className="social-btn twitter" onClick={() => handleSocialLogin('Twitter')} disabled={loading}><TwitterIcon /></button>
                </div>
              </div>

              <div className="signup-link">
                ¿No tienes una cuenta? <a href="/registrarse">Registrarse</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
