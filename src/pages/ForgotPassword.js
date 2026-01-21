import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { showSuccessToast } from '../utils/sweetalert';
import EmailIcon from '@mui/icons-material/Email';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    showSuccessToast('¡Enlace de restablecimiento enviado a tu correo!');
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <button className="back-btn" onClick={() => navigate('/iniciar-sesion')}>
          <ArrowBackIcon /> Volver al inicio de sesión
        </button>

        <div className="forgot-password-card">
          <div className="forgot-icon">
            <EmailIcon />
          </div>
          
          <h1>¿Olvidaste tu contraseña?</h1>
          <p>Ingresa tu dirección de correo y te enviaremos un enlace para restablecer tu contraseña.</p>

          {!sent ? (
            <form onSubmit={handleSubmit} className="forgot-form">
              <div className="form-group">
                <label>Correo electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ingresa tu correo"
                  required
                />
              </div>
              <button type="submit" className="reset-btn">
                Enviar enlace de restablecimiento
              </button>
            </form>
          ) : (
            <div className="success-message">
              <div className="success-icon">✓</div>
              <h3>¡Revisa tu correo!</h3>
              <p>Hemos enviado un enlace de restablecimiento a <strong>{email}</strong></p>
              <button className="resend-btn" onClick={() => setSent(false)}>
                Reenviar enlace
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
