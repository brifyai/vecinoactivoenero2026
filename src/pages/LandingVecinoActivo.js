import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, registerUser } from '../store/slices/authSlice';
import { selectAuthLoading, selectAuthError } from '../store/selectors/authSelectors';

const LandingVecinoActivo = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [loginType, setLoginType] = useState('vecino'); // 'vecino' o 'admin'
  const [registerType, setRegisterType] = useState('vecino');
  const [iframeLoaded, setIframeLoaded] = useState(false);
  
  const [loginForm, setLoginForm] = useState({ email: '', password: '', remember: false });
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    terms: false
  });

  // Exponer funciones globalmente para que el iframe pueda llamarlas
  useEffect(() => {
    // Escuchar mensajes postMessage
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'OPEN_LOGIN_MODAL') {
        setShowLoginModal(true);
      } else if (event.data && event.data.type === 'OPEN_REGISTER_MODAL') {
        setShowRegisterModal(true);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  useEffect(() => {
    // Cargar Lucide icons cuando los modales se abren
    if ((showLoginModal || showRegisterModal) && window.lucide) {
      setTimeout(() => window.lucide.createIcons(), 100);
    }
  }, [showLoginModal, showRegisterModal]);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const userType = loginType === 'admin' ? 'admin' : 'user';
      const result = await dispatch(loginUser({
        email: loginForm.email,
        password: loginForm.password,
        userType
      })).unwrap();

      if (result) {
        // Redirigir según el tipo de usuario
        if (userType === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/app');
        }
      }
    } catch (err) {
      console.error('Error en login:', err);
      alert(err.message || 'Error al iniciar sesión');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (registerForm.password !== registerForm.passwordConfirm) {
      alert('Las contraseñas no coinciden');
      return;
    }

    if (!registerForm.terms) {
      alert('Debes aceptar los términos y condiciones');
      return;
    }

    try {
      const result = await dispatch(registerUser({
        email: registerForm.email,
        password: registerForm.password,
        name: registerForm.name,
        userType: registerType === 'admin' ? 'admin' : 'user'
      })).unwrap();

      if (result) {
        alert('¡Registro exitoso! Ahora puedes iniciar sesión');
        setShowRegisterModal(false);
        setShowLoginModal(true);
      }
    } catch (err) {
      console.error('Error en registro:', err);
      alert(err.message || 'Error al registrarse');
    }
  };

  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'auto', position: 'relative' }}>
      <iframe 
        src="/index-landing-vecino-activo.html" 
        style={{
          width: '100%',
          height: '100%',
          border: 'none'
        }}
        title="Vecino Activo - Landing Page"
        onLoad={() => setIframeLoaded(true)}
      />

      {/* Login Modal */}
      {showLoginModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 10000
          }}
          onClick={() => setShowLoginModal(false)}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '32px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              maxWidth: '448px',
              width: '100%',
              padding: '32px',
              position: 'relative',
              animation: 'fadeIn 0.2s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowLoginModal(false)}
              style={{
                position: 'absolute',
                top: '24px',
                right: '24px',
                color: '#9ca3af',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#000'}
              onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '30px', fontWeight: '900', marginBottom: '8px', color: '#000' }}>Iniciar Sesión</h2>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>Selecciona tu tipo de acceso</p>
            </div>

            {/* Selector de tipo de usuario */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', backgroundColor: '#f3f4f6', padding: '6px', borderRadius: '12px' }}>
              <button 
                onClick={() => setLoginType('vecino')}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: loginType === 'vecino' ? '#000' : 'transparent',
                  color: loginType === 'vecino' ? '#fff' : '#6b7280',
                  boxShadow: loginType === 'vecino' ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
                }}
              >
                Ingreso Vecino
              </button>
              <button 
                onClick={() => setLoginType('admin')}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: loginType === 'admin' ? 'linear-gradient(to right, #F8E158, #F59ABC)' : 'transparent',
                  color: loginType === 'admin' ? '#000' : '#6b7280',
                  boxShadow: loginType === 'admin' ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
                }}
              >
                Ingreso UV
              </button>
            </div>

            {error && (
              <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#dc2626', fontSize: '14px' }}>
                {error}
              </div>
            )}

            {/* Formulario de Login */}
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: '#374151' }}>Email</label>
                <input 
                  type="email" 
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                  placeholder="tu@email.com"
                  required
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '2px solid #e5e7eb', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' }}
                  onFocus={(e) => e.target.style.borderColor = '#000'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: '#374151' }}>Contraseña</label>
                <input 
                  type="password" 
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  placeholder="••••••••"
                  required
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '2px solid #e5e7eb', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' }}
                  onFocus={(e) => e.target.style.borderColor = '#000'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={loginForm.remember}
                    onChange={(e) => setLoginForm({...loginForm, remember: e.target.checked})}
                    style={{ width: '16px', height: '16px', borderRadius: '4px' }}
                  />
                  <span style={{ color: '#6b7280' }}>Recordarme</span>
                </label>
                <a href="/recuperar-contrasena" style={{ color: '#000', fontWeight: '600', textDecoration: 'none' }}>
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <button 
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  backgroundColor: loading ? '#6b7280' : '#000',
                  color: '#fff',
                  padding: '14px',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  opacity: loading ? 0.5 : 1
                }}
                onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#1f2937')}
                onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#000')}
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>

              <div style={{ textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
                ¿No tienes cuenta? 
                <button 
                  type="button" 
                  onClick={() => {
                    setShowLoginModal(false);
                    setShowRegisterModal(true);
                  }}
                  style={{ color: '#000', fontWeight: 'bold', background: 'none', border: 'none', cursor: 'pointer', marginLeft: '4px', textDecoration: 'underline' }}
                >
                  Regístrate aquí
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {showRegisterModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 10000
          }}
          onClick={() => setShowRegisterModal(false)}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '32px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              maxWidth: '448px',
              width: '100%',
              padding: '32px',
              position: 'relative',
              animation: 'fadeIn 0.2s ease-out',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowRegisterModal(false)}
              style={{
                position: 'absolute',
                top: '24px',
                right: '24px',
                color: '#9ca3af',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#000'}
              onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '30px', fontWeight: '900', marginBottom: '8px', color: '#000' }}>Registrarse</h2>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>Selecciona tu tipo de cuenta</p>
            </div>

            {/* Selector de tipo de usuario */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', backgroundColor: '#f3f4f6', padding: '6px', borderRadius: '12px' }}>
              <button 
                onClick={() => setRegisterType('vecino')}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: registerType === 'vecino' ? '#000' : 'transparent',
                  color: registerType === 'vecino' ? '#fff' : '#6b7280',
                  boxShadow: registerType === 'vecino' ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
                }}
              >
                Registro Vecino
              </button>
              <button 
                onClick={() => setRegisterType('admin')}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: registerType === 'admin' ? 'linear-gradient(to right, #F8E158, #F59ABC)' : 'transparent',
                  color: registerType === 'admin' ? '#000' : '#6b7280',
                  boxShadow: registerType === 'admin' ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
                }}
              >
                Registro UV
              </button>
            </div>

            {error && (
              <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#dc2626', fontSize: '14px' }}>
                {error}
              </div>
            )}

            {/* Formulario de Registro */}
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: '#374151' }}>Nombre Completo</label>
                <input 
                  type="text" 
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
                  placeholder="Tu nombre"
                  required
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '2px solid #e5e7eb', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' }}
                  onFocus={(e) => e.target.style.borderColor = '#000'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: '#374151' }}>Email</label>
                <input 
                  type="email" 
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                  placeholder="tu@email.com"
                  required
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '2px solid #e5e7eb', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' }}
                  onFocus={(e) => e.target.style.borderColor = '#000'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: '#374151' }}>Contraseña</label>
                <input 
                  type="password" 
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                  placeholder="••••••••"
                  required
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '2px solid #e5e7eb', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' }}
                  onFocus={(e) => e.target.style.borderColor = '#000'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: '#374151' }}>Confirmar Contraseña</label>
                <input 
                  type="password" 
                  value={registerForm.passwordConfirm}
                  onChange={(e) => setRegisterForm({...registerForm, passwordConfirm: e.target.value})}
                  placeholder="••••••••"
                  required
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '2px solid #e5e7eb', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' }}
                  onFocus={(e) => e.target.style.borderColor = '#000'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={registerForm.terms}
                    onChange={(e) => setRegisterForm({...registerForm, terms: e.target.checked})}
                    style={{ width: '16px', height: '16px', borderRadius: '4px', marginTop: '2px' }}
                    required
                  />
                  <span>Acepto los <a href="/terminos" style={{ color: '#000', fontWeight: '600', textDecoration: 'underline' }}>términos y condiciones</a> y la <a href="/privacidad" style={{ color: '#000', fontWeight: '600', textDecoration: 'underline' }}>política de privacidad</a></span>
                </label>
              </div>

              <button 
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  backgroundColor: loading ? '#6b7280' : '#000',
                  color: '#fff',
                  padding: '14px',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  opacity: loading ? 0.5 : 1
                }}
                onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#1f2937')}
                onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#000')}
              >
                {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </button>

              <div style={{ textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
                ¿Ya tienes cuenta? 
                <button 
                  type="button" 
                  onClick={() => {
                    setShowRegisterModal(false);
                    setShowLoginModal(true);
                  }}
                  style={{ color: '#000', fontWeight: 'bold', background: 'none', border: 'none', cursor: 'pointer', marginLeft: '4px', textDecoration: 'underline' }}
                >
                  Inicia sesión aquí
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default LandingVecinoActivo;
