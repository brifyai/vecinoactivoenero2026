import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { showErrorToast, showSuccessToast, showInfoToast } from '../utils/sweetalert';
import NeighborhoodSelector from '../components/NeighborhoodSelector/NeighborhoodSelector';
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
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Dirección del usuario
    address: '',
    addressNumber: '',
    // Unidad vecinal
    neighborhoodId: null,
    neighborhoodName: '',
    neighborhoodCode: '',
    // Coordenadas
    latitude: null,
    longitude: null,
    // Preferencia de distancia para conocer vecinos
    maxDistance: 5
  });
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

    // Validaciones
    if (!formData.name || !formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      showErrorToast('Por favor completa todos los campos');
      setLoading(false);
      return;
    }

    if (formData.username.length < 3) {
      showErrorToast('El nombre de usuario debe tener al menos 3 caracteres');
      setLoading(false);
      return;
    }

    if (usernameAvailable === false) {
      showErrorToast('Este nombre de usuario ya está en uso');
      setLoading(false);
      return;
    }

    if (!formData.neighborhoodId) {
      showErrorToast('Por favor selecciona tu unidad vecinal');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      showErrorToast('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showErrorToast('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    try {
      const result = register(formData);
      if (result.success) {
        showSuccessToast('¡Cuenta creada exitosamente!');
        navigate('/');
      }
    } catch (err) {
      showErrorToast('Registro fallido. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleNeighborhoodSelect = (neighborhoodData) => {
    setFormData({
      ...formData,
      ...neighborhoodData
    });
  };

  const handleSocialSignup = (provider) => {
    showInfoToast(`Registro con ${provider} próximamente!`);
  };

  return (
    <div className="register-page">
      <div className="register-header">
        <div className="register-logo">Vecino Activo</div>
        <div className="register-nav">
          <button onClick={() => navigate('/iniciar-sesion')}>Iniciar sesión</button>
        </div>
      </div>

      <div className="register-content">
        <div className="register-left">
          <div className="register-illustration">
            <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=400&fit=crop" alt="Únete" />
          </div>
          <h1>¡Únete a Vecino Activo!</h1>
          <p>Conéctate con tus vecinos y tu comunidad en Vecino Activo.</p>
        </div>

        <div className="register-right">
          <div className="register-card">
            <h2>Registrarse</h2>
            <p className="register-subtitle">Crea tu cuenta</p>
            <p className="register-desc">Únete a millones de personas compartiendo y conectando</p>

            <form onSubmit={handleRegister}>
              {error && <div className="error-message">{error}</div>}
              
              <div className="form-group">
                <label>Nombre completo</label>
                <div className="input-with-icon">
                  <input 
                    type="text" 
                    name="name"
                    placeholder="Ingresa tu nombre" 
                    value={formData.name}
                    onChange={handleChange}
                    required 
                  />
                  <PersonIcon className="input-icon" />
                </div>
              </div>

              <div className="form-group">
                <label>Nombre de usuario</label>
                <div className="input-with-icon">
                  <input 
                    type="text" 
                    name="username"
                    placeholder="camiloalegria" 
                    value={formData.username}
                    onChange={handleChange}
                    required 
                    maxLength="30"
                  />
                  <PersonIcon className="input-icon" />
                </div>
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
                  />
                  <EmailIcon className="input-icon" />
                </div>
              </div>

              {/* Sección de Dirección */}
              <div className="form-section-title">
                <PlaceIcon />
                <span>Tu Dirección</span>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Calle</label>
                  <div className="input-with-icon">
                    <input 
                      type="text" 
                      name="address"
                      placeholder="Ej: Avenida Providencia" 
                      value={formData.address}
                      onChange={handleChange}
                      required 
                    />
                    <HomeIcon className="input-icon" />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Número</label>
                  <div className="input-with-icon">
                    <input 
                      type="text" 
                      name="addressNumber"
                      placeholder="Ej: 1234" 
                      value={formData.addressNumber}
                      onChange={handleChange}
                      required 
                    />
                    <PlaceIcon className="input-icon" />
                  </div>
                </div>
              </div>

              <NeighborhoodSelector 
                onSelect={handleNeighborhoodSelect}
                selectedNeighborhood={formData}
              />

              {/* Sección de Preferencia de Distancia */}
              <div className="form-section-title">
                <PlaceIcon />
                <span>¿Qué distancia te interesa?</span>
              </div>
              
              <div className="form-group">
                <label>Quiero conocer vecinos que vivan a máximo:</label>
                <div className="distance-selector">
                  {DISTANCE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`distance-option ${formData.maxDistance === option.value ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, maxDistance: option.value })}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <p className="distance-help">
                  💡 Esto determinará qué vecinos verás en tus sugerencias de amistad
                </p>
              </div>

              <div className="form-group">
                <label>Contraseña</label>
                <div className="input-with-icon">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password"
                    placeholder="Crea una contraseña" 
                    value={formData.password}
                    onChange={handleChange}
                    required 
                  />
                  <button 
                    type="button" 
                    className="input-icon-btn" 
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Confirmar contraseña</label>
                <div className="input-with-icon">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    name="confirmPassword"
                    placeholder="Confirma tu contraseña" 
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required 
                  />
                  <button 
                    type="button" 
                    className="input-icon-btn" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-register" disabled={loading}>
                {loading ? 'Creando cuenta...' : 'Registrarse'}
              </button>

              <div className="social-login">
                <p>O regístrate con</p>
                <div className="social-buttons">
                  <button type="button" className="social-btn google" onClick={() => handleSocialSignup('Google')}><GoogleIcon /></button>
                  <button type="button" className="social-btn facebook" onClick={() => handleSocialSignup('Facebook')}><FacebookIcon /></button>
                  <button type="button" className="social-btn twitter" onClick={() => handleSocialSignup('Twitter')}><TwitterIcon /></button>
                </div>
              </div>

              <div className="login-link">
                ¿Ya tienes una cuenta? <a href="/login">Iniciar sesión</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
