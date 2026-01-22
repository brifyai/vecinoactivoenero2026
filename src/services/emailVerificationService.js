/**
 * Email Verification Service
 * Handles email verification codes and validation
 */

const EMAIL_VERIFICATION_STORAGE_KEY = 'email_verifications';
const VERIFICATION_CODE_EXPIRY = 15 * 60 * 1000; // 15 minutes in milliseconds

class EmailVerificationService {
  /**
   * Generate a random 6-digit verification code
   */
  generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send verification code to email (simulated)
   * In production, this would call an email service API
   */
  sendVerificationCode(email) {
    const code = this.generateVerificationCode();
    const verificationData = {
      email,
      code,
      createdAt: Date.now(),
      expiresAt: Date.now() + VERIFICATION_CODE_EXPIRY,
      attempts: 0,
      verified: false
    };

    // Store verification data
    const verifications = JSON.parse(
      localStorage.getItem(EMAIL_VERIFICATION_STORAGE_KEY) || '{}'
    );
    verifications[email] = verificationData;
    localStorage.setItem(EMAIL_VERIFICATION_STORAGE_KEY, JSON.stringify(verifications));

    // In production, send email here
    console.log(`[EMAIL SERVICE] Verification code for ${email}: ${code}`);

    return {
      success: true,
      message: `Código de verificación enviado a ${email}`,
      code // Return code for testing purposes (remove in production)
    };
  }

  /**
   * Verify the code provided by user
   */
  verifyCode(email, code) {
    const verifications = JSON.parse(
      localStorage.getItem(EMAIL_VERIFICATION_STORAGE_KEY) || '{}'
    );

    const verification = verifications[email];

    if (!verification) {
      return {
        success: false,
        error: 'No se encontró solicitud de verificación para este email'
      };
    }

    // Check if code has expired
    if (Date.now() > verification.expiresAt) {
      delete verifications[email];
      localStorage.setItem(EMAIL_VERIFICATION_STORAGE_KEY, JSON.stringify(verifications));
      return {
        success: false,
        error: 'El código de verificación ha expirado. Por favor solicita uno nuevo.'
      };
    }

    // Check if code matches
    if (verification.code !== code) {
      verification.attempts += 1;
      localStorage.setItem(EMAIL_VERIFICATION_STORAGE_KEY, JSON.stringify(verifications));

      // Lock after 5 attempts
      if (verification.attempts >= 5) {
        delete verifications[email];
        localStorage.setItem(EMAIL_VERIFICATION_STORAGE_KEY, JSON.stringify(verifications));
        return {
          success: false,
          error: 'Demasiados intentos fallidos. Por favor solicita un nuevo código.'
        };
      }

      return {
        success: false,
        error: `Código incorrecto. Intentos restantes: ${5 - verification.attempts}`
      };
    }

    // Code is correct, mark as verified
    verification.verified = true;
    localStorage.setItem(EMAIL_VERIFICATION_STORAGE_KEY, JSON.stringify(verifications));

    return {
      success: true,
      message: 'Email verificado exitosamente'
    };
  }

  /**
   * Check if email is verified
   */
  isEmailVerified(email) {
    const verifications = JSON.parse(
      localStorage.getItem(EMAIL_VERIFICATION_STORAGE_KEY) || '{}'
    );

    const verification = verifications[email];
    return verification && verification.verified === true;
  }

  /**
   * Clear verification data for email
   */
  clearVerification(email) {
    const verifications = JSON.parse(
      localStorage.getItem(EMAIL_VERIFICATION_STORAGE_KEY) || '{}'
    );
    delete verifications[email];
    localStorage.setItem(EMAIL_VERIFICATION_STORAGE_KEY, JSON.stringify(verifications));
  }

  /**
   * Get remaining time for verification code (in seconds)
   */
  getRemainingTime(email) {
    const verifications = JSON.parse(
      localStorage.getItem(EMAIL_VERIFICATION_STORAGE_KEY) || '{}'
    );

    const verification = verifications[email];
    if (!verification) return 0;

    const remaining = verification.expiresAt - Date.now();
    return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
  }

  /**
   * Resend verification code
   */
  resendVerificationCode(email) {
    const verifications = JSON.parse(
      localStorage.getItem(EMAIL_VERIFICATION_STORAGE_KEY) || '{}'
    );

    // Check if there's an existing verification
    if (verifications[email]) {
      const timeSinceCreation = Date.now() - verifications[email].createdAt;
      // Allow resend after 30 seconds
      if (timeSinceCreation < 30000) {
        return {
          success: false,
          error: 'Por favor espera antes de solicitar un nuevo código'
        };
      }
    }

    // Generate new code
    return this.sendVerificationCode(email);
  }
}

export default new EmailVerificationService();
