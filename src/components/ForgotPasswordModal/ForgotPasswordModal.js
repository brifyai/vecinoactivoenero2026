import React, { useState } from 'react';
import { showSuccessToast } from '../../utils/sweetalert';
import CloseIcon from '@mui/icons-material/Close';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import './ForgotPasswordModal.css';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
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

  const handleClose = () => {
    setEmail('');
    setSent(false);
    setLoading(false);
    onClose();
  };

  const handleResend = () => {
    setSent(false);
    setEmail('');
  };

  if (!isOpen) return null;

  return (
    <div className="forgot-password-modal-overlay" onClick={handleClose}>
      <div className="forgot-password-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={handleClose}>
          <CloseIcon />
        </button>

        {!sent ? (
          <>
            {/* Header */}
            <div className="modal-header">
              <div className="modal-icon">
                <LockIcon style={{ fontSize: 40, color: 'white' }} />
              </div>
              <h2 className="modal-title">¿Olvidaste tu contraseña?</h2>
              <p className="modal-subtitle">
                Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="forgot-password-form">
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

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading && <div className="loading-spinner"></div>}
                {loading ? 'Enviando...' : 'Enviar enlace de restablecimiento'}
              </button>
            </form>

            {/* Info box */}
            <div className="info-box">
              <InfoIcon className="info-icon" />
              <p>
                El enlace de restablecimiento expirará en 15 minutos. Si no recibes el correo, revisa tu carpeta de spam.
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Success state */}
            <div className="success-content">
              <div className="success-icon">
                <CheckCircleIcon style={{ fontSize: 60, color: 'white' }} />
              </div>
              
              <h2 className="success-title">¡Revisa tu correo!</h2>
              
              <p className="success-message">
                Hemos enviado un enlace de restablecimiento a <strong>{email}</strong>
              </p>

              {/* Info list */}
              <div className="success-info-box">
                <ul className="success-info-list">
                  <li>El enlace expira en 15 minutos</li>
                  <li>Revisa también tu carpeta de spam</li>
                  <li>Si no lo recibes, puedes reenviar el enlace</li>
                </ul>
              </div>

              {/* Action buttons */}
              <div className="success-actions">
                <button className="resend-btn" onClick={handleResend}>
                  Reenviar enlace
                </button>
                <button className="back-btn" onClick={handleClose}>
                  Volver al inicio de sesión
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
