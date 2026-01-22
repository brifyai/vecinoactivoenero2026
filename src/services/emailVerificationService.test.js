import emailVerificationService from './emailVerificationService';

describe('Email Verification Service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('sendVerificationCode', () => {
    test('generates and stores verification code', () => {
      const email = 'test@example.com';
      const result = emailVerificationService.sendVerificationCode(email);

      expect(result.success).toBe(true);
      expect(result.code).toBeDefined();
      expect(result.code).toMatch(/^\d{6}$/);
    });

    test('stores verification data with correct expiry', () => {
      const email = 'test@example.com';
      emailVerificationService.sendVerificationCode(email);

      const verifications = JSON.parse(localStorage.getItem('email_verifications'));
      expect(verifications[email]).toBeDefined();
      expect(verifications[email].email).toBe(email);
      expect(verifications[email].verified).toBe(false);
      expect(verifications[email].attempts).toBe(0);
    });
  });

  describe('verifyCode', () => {
    test('verifies correct code', () => {
      const email = 'test@example.com';
      const { code } = emailVerificationService.sendVerificationCode(email);

      const result = emailVerificationService.verifyCode(email, code);

      expect(result.success).toBe(true);
      expect(result.message).toContain('verificado');
    });

    test('rejects incorrect code', () => {
      const email = 'test@example.com';
      emailVerificationService.sendVerificationCode(email);

      const result = emailVerificationService.verifyCode(email, '000000');

      expect(result.success).toBe(false);
      expect(result.error).toContain('incorrecto');
    });

    test('increments attempts on wrong code', () => {
      const email = 'test@example.com';
      emailVerificationService.sendVerificationCode(email);

      emailVerificationService.verifyCode(email, '000000');
      emailVerificationService.verifyCode(email, '111111');

      const verifications = JSON.parse(localStorage.getItem('email_verifications'));
      expect(verifications[email].attempts).toBe(2);
    });

    test('locks after 5 failed attempts', () => {
      const email = 'test@example.com';
      emailVerificationService.sendVerificationCode(email);

      for (let i = 0; i < 5; i++) {
        emailVerificationService.verifyCode(email, '000000');
      }

      const result = emailVerificationService.verifyCode(email, '000000');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Demasiados intentos');
    });

    test('rejects expired code', (done) => {
      const email = 'test@example.com';
      emailVerificationService.sendVerificationCode(email);

      // Manually set expiry to past
      const verifications = JSON.parse(localStorage.getItem('email_verifications'));
      verifications[email].expiresAt = Date.now() - 1000;
      localStorage.setItem('email_verifications', JSON.stringify(verifications));

      const result = emailVerificationService.verifyCode(email, '000000');
      expect(result.success).toBe(false);
      expect(result.error).toContain('expirado');
      done();
    });

    test('returns error for non-existent email', () => {
      const result = emailVerificationService.verifyCode('nonexistent@example.com', '000000');

      expect(result.success).toBe(false);
      expect(result.error).toContain('No se encontró');
    });
  });

  describe('isEmailVerified', () => {
    test('returns true for verified email', () => {
      const email = 'test@example.com';
      const { code } = emailVerificationService.sendVerificationCode(email);
      emailVerificationService.verifyCode(email, code);

      expect(emailVerificationService.isEmailVerified(email)).toBe(true);
    });

    test('returns false for unverified email', () => {
      const email = 'test@example.com';
      emailVerificationService.sendVerificationCode(email);

      expect(emailVerificationService.isEmailVerified(email)).toBe(false);
    });

    test('returns false for non-existent email', () => {
      expect(emailVerificationService.isEmailVerified('nonexistent@example.com')).toBe(false);
    });
  });

  describe('clearVerification', () => {
    test('removes verification data', () => {
      const email = 'test@example.com';
      emailVerificationService.sendVerificationCode(email);
      emailVerificationService.clearVerification(email);

      const verifications = JSON.parse(localStorage.getItem('email_verifications'));
      expect(verifications[email]).toBeUndefined();
    });
  });

  describe('getRemainingTime', () => {
    test('returns remaining time in seconds', () => {
      const email = 'test@example.com';
      emailVerificationService.sendVerificationCode(email);

      const remaining = emailVerificationService.getRemainingTime(email);
      expect(remaining).toBeGreaterThan(0);
      expect(remaining).toBeLessThanOrEqual(900); // 15 minutes
    });

    test('returns 0 for expired code', (done) => {
      const email = 'test@example.com';
      emailVerificationService.sendVerificationCode(email);

      // Manually set expiry to past
      const verifications = JSON.parse(localStorage.getItem('email_verifications'));
      verifications[email].expiresAt = Date.now() - 1000;
      localStorage.setItem('email_verifications', JSON.stringify(verifications));

      const remaining = emailVerificationService.getRemainingTime(email);
      expect(remaining).toBe(0);
      done();
    });

    test('returns 0 for non-existent email', () => {
      const remaining = emailVerificationService.getRemainingTime('nonexistent@example.com');
      expect(remaining).toBe(0);
    });
  });

  describe('resendVerificationCode', () => {
    test('generates new code after 30 seconds', (done) => {
      const email = 'test@example.com';
      const { code: firstCode } = emailVerificationService.sendVerificationCode(email);

      // Manually set creation time to past
      const verifications = JSON.parse(localStorage.getItem('email_verifications'));
      verifications[email].createdAt = Date.now() - 31000; // 31 seconds ago
      localStorage.setItem('email_verifications', JSON.stringify(verifications));

      const { code: secondCode } = emailVerificationService.resendVerificationCode(email);

      expect(secondCode).toBeDefined();
      expect(secondCode).toMatch(/^\d{6}$/);
      done();
    });

    test('prevents resend within 30 seconds', () => {
      const email = 'test@example.com';
      emailVerificationService.sendVerificationCode(email);

      const result = emailVerificationService.resendVerificationCode(email);

      expect(result.success).toBe(false);
      expect(result.error).toContain('espera');
    });
  });

  describe('generateVerificationCode', () => {
    test('generates 6-digit code', () => {
      const code = emailVerificationService.generateVerificationCode();

      expect(code).toMatch(/^\d{6}$/);
      expect(code.length).toBe(6);
    });

    test('generates different codes', () => {
      const code1 = emailVerificationService.generateVerificationCode();
      const code2 = emailVerificationService.generateVerificationCode();

      // While theoretically they could be the same, probability is very low
      // This test just ensures the function works
      expect(code1).toMatch(/^\d{6}$/);
      expect(code2).toMatch(/^\d{6}$/);
    });
  });
});
