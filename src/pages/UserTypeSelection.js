import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReduxAuth as useAuth } from '../hooks/useReduxAuth';
import { showErrorToast, showSuccessToast } from '../utils/sweetalert';

// Material UI Icons
import PeopleIcon from '@mui/icons-material/People';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import GroupsIcon from '@mui/icons-material/Groups';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

import './UserTypeSelection.css';

const UserTypeSelection = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  
  // Estados para el tipo de usuario seleccionado
  const [selectedUserType, setSelectedUserType] = useState('vecinos');
  
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

  return (
    <div className="modern-login-container">
      {/* Lado izquierdo - Imagen de fondo con texto */}
      <div className="login-hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Conecta con tu comunidad en la plataforma vecinal más grande del mundo.
          </h1>
        </div>
      </div>

      {/* Lado derecho - Formulario de login */}
      <div className="login-form-container">
        <div className="form-wrapper">
          {/* Header con logo */}
          <div className="login-header">
            <div className="logo-container">
              <PeopleIcon className="logo-icon" />
              <span className="logo-text">Vecino Activo</span>
            </div>
          </div>

          {/* Pestañas de tipo de usuario */}
          <div className="user-type-tabs">
            <button 
              className={`type-tab ${selectedUserType === 'vecinos' ? 'active' : ''}`}
              onClick={() => setSelectedUserType('vecinos')}
            >
              <GroupsIcon />
              Vecinos
            </button>
            <button 
              className={`type-tab ${selectedUserType === 'admin' ? 'active' : ''}`}
              onClick={() => setSelectedUserType('admin')}
            >
              <AdminPanelSettingsIcon />
              Unidad Vecinal
            </button>
          </div>

          {/* Formulario */}
          <div className="login-form-section">
            <h2 className="form-title">Iniciar Sesión</h2>
            
            <form onSubmit={selectedUserType === 'vecinos' ? handleVecinosLogin : handleAdminLogin}>
              {error && (
                <div className="error-alert">
                  {error}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Email</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email o Username"
                    value={selectedUserType === 'vecinos' ? vecinosForm.email : adminForm.email}
                    onChange={selectedUserType === 'vecinos' ? handleVecinosChange : handleAdminChange}
                    className="form-input"
                    required
                    disabled={loading}
                  />
                  <EmailIcon className="input-icon" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Contraseña</label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Contraseña"
                    value={selectedUserType === 'vecinos' ? vecinosForm.password : adminForm.password}
                    onChange={selectedUserType === 'vecinos' ? handleVecinosChange : handleAdminChange}
                    className="form-input"
                    required
                    disabled={loading}
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
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={selectedUserType === 'vecinos' ? vecinosForm.rememberMe : adminForm.rememberMe}
                    onChange={selectedUserType === 'vecinos' ? handleVecinosChange : handleAdminChange}
                    disabled={loading}
                  />
                  <span className="checkmark"></span>
                  Recordarme
                </label>
                <a href="/recuperar-contrasena" className="forgot-password">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <button type="submit" className="signin-button" disabled={loading}>
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
            </form>

            <div className="signup-link">
              ¿No tienes cuenta? <a href="/registrarse">Regístrate ahora</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserTypeSelection;
