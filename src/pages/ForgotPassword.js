import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { showSuccessToast } from '../utils/sweetalert';
import EmailIcon from '@mui/icons-material/Email';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockResetIcon from '@mui/icons-material/LockReset';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SecurityIcon from '@mui/icons-material/Security';
import './ForgotPassword.css';

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
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        {/* Lado izquierdo - Información */}
        <div className="forgot-left">
          <div className="forgot-welcome">
            <div className="forgot-illustration">
              <LockResetIcon />
            </div>
            <h1>Recupera tu Acceso</h1>
            <p>Te ayudamos a restablecer tu contraseña de forma segura.</p>
          </div>
          
          <div className="security-features">
            <div className="security-item">
              <div className="security-icon">
                <SecurityIcon />
              </div>
              <span>Proceso 100% seguro</span>
            </div>
            <div className="security-item">
              <div className="security-icon">
                <EmailIcon />
              </div>
              <span>Enlace temporal por email</span>
            </div>
            <div className="security-item">
              <div className="security-icon">
                <CheckCircleIcon />
              </div>
              <span>Verificación instantánea</span>
            </div>
          </div>
        </div>

        {/* Lado derecho - Formulario */}
        <div className="forgot-right">
          <button className="back-btn" onClick={() => navigate('/')}>
            <ArrowBackIcon />
            Volver al inicio de sesión
          </button>

          <div className="forgot-content">
            {!sent ? (
              <>
                <div className="forgot-header">
                  <h2>¿Olvidaste tu contraseña?</h2>
                  <p className="forgot-subtitle">
                    Ingresa tu correo electrónico y te enviaremos un enlace para crear una nueva contraseña.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="forgot-form">
                  <div className="input-group">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Correo electrónico"
                      required
                      disabled={loading}
                      className="input-field"
                    />
                    <EmailIcon className="input-icon" />
                  </div>

                  <button type="submit" className="reset-btn" disabled={loading}>
                    {loading && <div className="loading-spinner"></div>}
                    {loading ? 'Enviando...' : 'Enviar enlace de restablecimiento'}
                  </button>
                </form>
              </>
            ) : (
              <div className="success-content">
                <div className="success-icon">
                  <CheckCircleIcon />
                </div>
                
                <h2>¡Revisa tu correo!</h2>
                <p className="success-description">
                  Hemos enviado un enlace de restablecimiento a <strong>{email}</strong>
                </p>
                
                <div className="success-info">
                  <p>• El enlace expira en 15 minutos</p>
                  <p>• Revisa también tu carpeta de spam</p>
                  <p>• Si no lo recibes, puedes reenviar el enlace</p>
                </div>

                <div className="success-actions">
                  <button className="resend-btn" onClick={() => setSent(false)}>
                    Reenviar enlace
                  </button>
                  <button className="login-btn" onClick={() => navigate('/')}>
                    Volver al inicio de sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
