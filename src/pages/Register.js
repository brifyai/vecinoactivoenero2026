import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useReduxAuth as useAuth } from '../hooks/useReduxAuth';
import { showErrorToast, showSuccessToast, showInfoToast } from '../utils/sweetalert';
import NeighborhoodSelector from '../components/NeighborhoodSelector/NeighborhoodSelector';
import EmailVerificationModal from '../components/EmailVerificationModal/EmailVerificationModal';
import emailVerificationService from '../services/emailVerificationService';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import HomeIcon from '@mui/icons-material/Home';
import PlaceIcon from '@mui/icons-material/Place';
import './Register.css';

// Opciones de distancia para conocer vecinos
const DISTANCE_OPTIONS = [
  { value: 0.5, label: '500 metros' },
  { value: 1, label: '1 km' },
  { value: 2, label: '2 km' },
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 20, label: '20 km' },
  { value: 50, label: '50 km' },
];

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, verifyUserEmail, isAuthenticated } = useAuth();

  // Si el usuario ya está autenticado y está en la página de registro, redirigir a app
  useEffect(() => {
    if (isAuthenticated && location.pathname === '/registrarse') {
      navigate('/app');
    }
  }, [isAuthenticated, navigate, location.pathname]);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [registrationEmail, setRegistrationEmail] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Si es el username, validar formato y disponibilidad
    if (name === 'username') {
      const cleanUsername = value.toLowerCase().replace(/[^a-z0-9]/g, '');
      setFormData({
        ...formData,
        [name]: cleanUsername
      });
      
      // Validar disponibilidad
      if (cleanUsername.length >= 3) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const exists = users.some(u => u.username === cleanUsername);
        setUsernameAvailable(!exists);
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

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validaciones básicas
    if (!formData.name || !formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Por favor completa todos los campos');
      setLoading(false);
      return;
    }

    if (formData.username.length < 3) {
      setError('El nombre de usuario debe tener al menos 3 caracteres');
      setLoading(false);
      return;
    }

    if (usernameAvailable === false) {
      setError('Este nombre de usuario ya está en uso');
      setLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Por favor ingresa un email válido');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    try {
      // Crear cuenta básica con perfil incompleto
      const basicUserData = {
        ...formData,
        profileComplete: false, // Marcar que el perfil está incompleto
        needsOnboarding: true   // Necesita completar onboarding
      };
      
      const result = register(basicUserData);
      if (result.success) {
        // Send verification code
        const verificationResult = emailVerificationService.sendVerificationCode(formData.email);
        if (verificationResult.success) {
          setRegistrationEmail(formData.email);
          setShowEmailVerification(true);
          showSuccessToast('Cuenta creada. Por favor verifica tu email.');
        } else {
          showErrorToast('Error al enviar código de verificación');
        }
      }
    } catch (err) {
      showErrorToast('Registro fallido. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailVerificationComplete = () => {
    // Mark email as verified in the user record
    if (verifyUserEmail) {
      verifyUserEmail(registrationEmail);
    }
    
    setShowEmailVerification(false);
    showSuccessToast('¡Bienvenido a Vecino Activo!');
    // Redirigir a onboarding dentro de la app
    navigate('/app/onboarding');
  };

  const handleSocialSignup = (provider) => {
    showInfoToast(`Registro con ${provider} próximamente!`);
  };

  return (
    <div className="register-page">
      {showEmailVerification && (
        <EmailVerificationModal
          email={registrationEmail}
          onVerificationComplete={handleEmailVerificationComplete}
          onCancel={() => setShowEmailVerification(false)}
        />
      )}
      
      <div className="register-container">
        {/* Lado izquierdo - Bienvenida */}
        <div className="register-left">
          <div className="register-welcome">
            <h1>¡Únete a Vecino Activo!</h1>
            <p>Crea tu cuenta y conecta con tu comunidad local.</p>
          </div>
          
          <div className="register-benefits">
            <div className="benefit-item">
              <div className="benefit-icon">
                <PersonIcon />
              </div>
              <span>Conecta con vecinos cercanos</span>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">
                <HomeIcon />
              </div>
              <span>Descubre eventos locales</span>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">
                <PlaceIcon />
              </div>
              <span>Comunidad segura y verificada</span>
            </div>
          </div>
        </div>

        {/* Lado derecho - Formulario */}
        <div className="register-right">
          <div className="register-header">
            <h2>Crear Cuenta</h2>
            <p className="register-subtitle">Información básica para comenzar</p>
          </div>

          {error && (
            <div className="error-message">
              <span>{error}</span>
            </div>
          )}

          <div className="step-content">
            <form onSubmit={handleRegister} className="register-form">
              <div className="input-group">
                <input 
                  type="text" 
                  name="name"
                  placeholder="Nombre completo" 
                  value={formData.name}
                  onChange={handleChange}
                  required 
                  className="input-field"
                />
                <PersonIcon className="input-icon" />
              </div>

              <div className="input-group">
                <input 
                  type="text" 
                  name="username"
                  placeholder="Nombre de usuario" 
                  value={formData.username}
                  onChange={handleChange}
                  required 
                  maxLength="30"
                  className="input-field"
                />
                <PersonIcon className="input-icon" />
                {formData.username && (
                  <div className="username-preview">
                    vecinoactivo.cl/<strong>{formData.username}</strong>
                  </div>
                )}
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

              <div className="input-group">
                <input 
                  type="email" 
                  name="email"
                  placeholder="Correo electrónico" 
                  value={formData.email}
                  onChange={handleChange}
                  required 
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
                  className="input-field"
                />
                <LockIcon className="input-icon" />
                <button 
                  type="button" 
                  className="password-toggle" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </button>
              </div>

              <div className="input-group">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  name="confirmPassword"
                  placeholder="Confirmar contraseña" 
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required 
                  className="input-field"
                />
                <LockIcon className="input-icon" />
                <button 
                  type="button" 
                  className="password-toggle" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </button>
              </div>

              <button type="submit" className="btn-register" disabled={loading}>
                {loading && <div className="loading-spinner"></div>}
                {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </button>

              <div className="divider">
                <span>O regístrate con</span>
              </div>

              <div className="social-register">
                <button type="button" className="social-button google" onClick={() => handleSocialSignup('Google')}>
                  <GoogleIcon />
                </button>
                <button type="button" className="social-button facebook" onClick={() => handleSocialSignup('Facebook')}>
                  <FacebookIcon />
                </button>
                <button type="button" className="social-button twitter" onClick={() => handleSocialSignup('Twitter')}>
                  <TwitterIcon />
                </button>
              </div>

              <div className="login-link">
                ¿Ya tienes una cuenta? <a href="/iniciar-sesion">Iniciar sesión</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
