import React, { useState, useEffect } from 'react';
import emailVerificationService from '../../services/emailVerificationService';
import { showErrorToast, showSuccessToast } from '../../utils/sweetalert';
import MailIcon from '@mui/icons-material/Mail';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import './EmailVerificationModal.css';

const EmailVerificationModal = ({ email, onVerificationComplete, onCancel }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  // Initialize timer for remaining time
  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = emailVerificationService.getRemainingTime(email);
      setRemainingTime(remaining);
      setCanResend(remaining === 0);
    }, 1000);

    return () => clearInterval(timer);
  }, [email]);

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!verificationCode || verificationCode.length !== 6) {
      showErrorToast('Por favor ingresa un código de 6 dígitos');
      setLoading(false);
      return;
    }

    const result = emailVerificationService.verifyCode(email, verificationCode);

    if (result.success) {
      showSuccessToast(result.message);
      setVerified(true);
      setTimeout(() => {
        onVerificationComplete();
      }, 1500);
    } else {
      showErrorToast(result.error);
    }

    setLoading(false);
  };

  const handleResendCode = async () => {
    setResendLoading(true);

    const result = emailVerificationService.resendVerificationCode(email);

    if (result.success) {
      showSuccessToast(result.message);
      setVerificationCode('');
      setRemainingTime(emailVerificationService.getRemainingTime(email));
    } else {
      showErrorToast(result.error);
    }

    setResendLoading(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (verified) {
    return (
      <div className="email-verification-modal">
        <div className="verification-overlay" onClick={onCancel} />
        <div className="verification-card verified">
          <div className="verification-icon success">
            <CheckCircleIcon />
          </div>
          <h2>¡Email Verificado!</h2>
          <p>Tu email ha sido verificado exitosamente.</p>
          <p className="verified-email">{email}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="email-verification-modal">
      <div className="verification-overlay" onClick={onCancel} />
      <div className="verification-card">
        <button className="close-btn" onClick={onCancel}>×</button>

        <div className="verification-header">
          <div className="verification-icon">
            <MailIcon />
          </div>
          <h2>Verificar Email</h2>
          <p>Hemos enviado un código de verificación a:</p>
          <p className="email-display">{email}</p>
        </div>

        <form onSubmit={handleVerifyCode} className="verification-form">
          <div className="form-group">
            <label>Código de Verificación</label>
            <input
              type="text"
              placeholder="000000"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength="6"
              disabled={loading}
              className="code-input"
            />
            <p className="code-help">Ingresa el código de 6 dígitos que recibiste</p>
          </div>

          {remainingTime > 0 && (
            <div className="timer-info">
              <p>El código expira en: <strong>{formatTime(remainingTime)}</strong></p>
            </div>
          )}

          <button
            type="submit"
            className="btn-verify"
            disabled={loading || verificationCode.length !== 6}
          >
            {loading ? 'Verificando...' : 'Verificar Email'}
          </button>
        </form>

        <div className="resend-section">
          <p>¿No recibiste el código?</p>
          <button
            type="button"
            className="btn-resend"
            onClick={handleResendCode}
            disabled={!canResend || resendLoading}
          >
            {resendLoading ? 'Reenviando...' : 'Reenviar Código'}
          </button>
          {!canResend && remainingTime > 0 && (
            <p className="resend-timer">Puedes reenviar en {formatTime(remainingTime)}</p>
          )}
        </div>

        <div className="verification-info">
          <p>💡 Revisa tu carpeta de spam si no ves el email</p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationModal;
