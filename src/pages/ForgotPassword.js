import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { showSuccessToast } from '../utils/sweetalert';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simular envío de email
    setTimeout(() => {
      setSent(true);
      setLoading(false);
      showSuccessToast('¡Enlace de restablecimiento enviado a tu correo!');
    }, 1500);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '32px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '480px',
        position: 'relative'
      }}>
        {/* Header con botón volver */}
        <div style={{
          padding: '32px 32px 24px 32px',
          borderBottom: '1px solid #f1f5f9'
        }}>
          <button 
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: 'transparent',
              color: '#64748b',
              border: '2px solid #e2e8f0',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#000';
              e.target.style.color = '#000';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.color = '#64748b';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Volver
          </button>
        </div>

        {/* Contenido principal */}
        <div style={{ padding: '32px' }}>
          {!sent ? (
            <>
              {/* Icono y título */}
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: '#000',
                  borderRadius: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)'
                }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <h2 style={{
                  fontSize: '28px',
                  fontWeight: '900',
                  color: '#000',
                  margin: '0 0 12px 0',
                  letterSpacing: '-0.02em'
                }}>
                  ¿Olvidaste tu contraseña?
                </h2>
                <p style={{
                  fontSize: '15px',
                  color: '#64748b',
                  margin: 0,
                  lineHeight: '1.5'
                }}>
                  Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
                </p>
              </div>

              {/* Formulario */}
              <form onSubmit={handleSubmit} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    color: '#374151'
                  }}>
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: '2px solid #e5e7eb',
                      fontSize: '15px',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      opacity: loading ? 0.6 : 1,
                      cursor: loading ? 'not-allowed' : 'text'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#000'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
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
                    opacity: loading ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    fontSize: '15px'
                  }}
                  onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#1f2937')}
                  onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#000')}
                >
                  {loading && (
                    <div style={{
                      width: '18px',
                      height: '18px',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                  )}
                  {loading ? 'Enviando...' : 'Enviar enlace de restablecimiento'}
                </button>
              </form>

              {/* Info adicional */}
              <div style={{
                marginTop: '24px',
                padding: '16px',
                background: '#f8fafc',
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}>
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  <p style={{
                    fontSize: '13px',
                    color: '#64748b',
                    margin: 0,
                    lineHeight: '1.5'
                  }}>
                    El enlace de restablecimiento expirará en 15 minutos. Si no recibes el correo, revisa tu carpeta de spam.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              {/* Icono de éxito */}
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)'
              }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>

              <h2 style={{
                fontSize: '28px',
                fontWeight: '900',
                color: '#000',
                margin: '0 0 12px 0',
                letterSpacing: '-0.02em'
              }}>
                ¡Revisa tu correo!
              </h2>
              
              <p style={{
                fontSize: '15px',
                color: '#64748b',
                margin: '0 0 24px 0',
                lineHeight: '1.5'
              }}>
                Hemos enviado un enlace de restablecimiento a <strong style={{ color: '#000' }}>{email}</strong>
              </p>

              {/* Info box */}
              <div style={{
                background: '#f0f9ff',
                border: '1px solid #7dd3fc',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '24px',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <p style={{ fontSize: '14px', color: '#0369a1', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>•</span> El enlace expira en 15 minutos
                  </p>
                  <p style={{ fontSize: '14px', color: '#0369a1', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>•</span> Revisa también tu carpeta de spam
                  </p>
                  <p style={{ fontSize: '14px', color: '#0369a1', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>•</span> Si no lo recibes, puedes reenviar el enlace
                  </p>
                </div>
              </div>

              {/* Botones de acción */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={() => setSent(false)}
                  style={{
                    width: '100%',
                    backgroundColor: '#000',
                    color: '#fff',
                    padding: '14px',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    fontSize: '15px'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#1f2937'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#000'}
                >
                  Reenviar enlace
                </button>
                
                <button
                  onClick={() => navigate('/')}
                  style={{
                    width: '100%',
                    backgroundColor: 'transparent',
                    color: '#64748b',
                    padding: '14px',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    border: '2px solid #e2e8f0',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '15px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = '#000';
                    e.target.style.color = '#000';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.color = '#64748b';
                  }}
                >
                  Volver al inicio de sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;
