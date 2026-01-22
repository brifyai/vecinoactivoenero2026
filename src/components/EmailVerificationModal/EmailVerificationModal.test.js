import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EmailVerificationModal from './EmailVerificationModal';
import emailVerificationService from '../../services/emailVerificationService';

// Mock the sweetalert utilities
jest.mock('../../utils/sweetalert', () => ({
  showErrorToast: jest.fn(),
  showSuccessToast: jest.fn(),
  showInfoToast: jest.fn()
}));

describe('EmailVerificationModal Component', () => {
  const mockEmail = 'test@example.com';
  const mockOnVerificationComplete = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    // Send verification code before each test
    emailVerificationService.sendVerificationCode(mockEmail);
  });

  test('renders verification modal with email', () => {
    render(
      <EmailVerificationModal
        email={mockEmail}
        onVerificationComplete={mockOnVerificationComplete}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Verificar Email')).toBeInTheDocument();
    expect(screen.getByText(mockEmail)).toBeInTheDocument();
  });

  test('renders code input field', () => {
    render(
      <EmailVerificationModal
        email={mockEmail}
        onVerificationComplete={mockOnVerificationComplete}
        onCancel={mockOnCancel}
      />
    );

    const input = screen.getByPlaceholderText('000000');
    expect(input).toBeInTheDocument();
  });

  test('accepts only numeric input', () => {
    render(
      <EmailVerificationModal
        email={mockEmail}
        onVerificationComplete={mockOnVerificationComplete}
        onCancel={mockOnCancel}
      />
    );

    const input = screen.getByPlaceholderText('000000');
    fireEvent.change(input, { target: { value: 'abc123' } });

    expect(input.value).toBe('123');
  });

  test('limits input to 6 digits', () => {
    render(
      <EmailVerificationModal
        email={mockEmail}
        onVerificationComplete={mockOnVerificationComplete}
        onCancel={mockOnCancel}
      />
    );

    const input = screen.getByPlaceholderText('000000');
    fireEvent.change(input, { target: { value: '1234567890' } });

    expect(input.value).toBe('123456');
  });

  test('disables verify button when code is incomplete', () => {
    render(
      <EmailVerificationModal
        email={mockEmail}
        onVerificationComplete={mockOnVerificationComplete}
        onCancel={mockOnCancel}
      />
    );

    const button = screen.getByRole('button', { name: /verificar email/i });
    expect(button).toBeDisabled();

    const input = screen.getByPlaceholderText('000000');
    fireEvent.change(input, { target: { value: '12345' } });

    expect(button).toBeDisabled();
  });

  test('enables verify button when code is complete', () => {
    render(
      <EmailVerificationModal
        email={mockEmail}
        onVerificationComplete={mockOnVerificationComplete}
        onCancel={mockOnCancel}
      />
    );

    const input = screen.getByPlaceholderText('000000');
    const button = screen.getByRole('button', { name: /verificar email/i });

    fireEvent.change(input, { target: { value: '123456' } });

    expect(button).not.toBeDisabled();
  });

  test('verifies correct code', async () => {
    const { code } = emailVerificationService.sendVerificationCode(mockEmail);

    render(
      <EmailVerificationModal
        email={mockEmail}
        onVerificationComplete={mockOnVerificationComplete}
        onCancel={mockOnCancel}
      />
    );

    const input = screen.getByPlaceholderText('000000');
    const button = screen.getByRole('button', { name: /verificar email/i });

    fireEvent.change(input, { target: { value: code } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockOnVerificationComplete).toHaveBeenCalled();
    });
  });

  test('shows error for incorrect code', async () => {
    const { showErrorToast } = require('../../utils/sweetalert');

    render(
      <EmailVerificationModal
        email={mockEmail}
        onVerificationComplete={mockOnVerificationComplete}
        onCancel={mockOnCancel}
      />
    );

    const input = screen.getByPlaceholderText('000000');
    const button = screen.getByRole('button', { name: /verificar email/i });

    fireEvent.change(input, { target: { value: '000000' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(showErrorToast).toHaveBeenCalledWith(expect.stringContaining('incorrecto'));
    });
  });

  test('displays resend button', () => {
    render(
      <EmailVerificationModal
        email={mockEmail}
        onVerificationComplete={mockOnVerificationComplete}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('¿No recibiste el código?')).toBeInTheDocument();
  });

  test('closes modal when cancel button is clicked', () => {
    render(
      <EmailVerificationModal
        email={mockEmail}
        onVerificationComplete={mockOnVerificationComplete}
        onCancel={mockOnCancel}
      />
    );

    const closeButton = screen.getByRole('button', { name: '×' });
    fireEvent.click(closeButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  test('closes modal when overlay is clicked', () => {
    const { container } = render(
      <EmailVerificationModal
        email={mockEmail}
        onVerificationComplete={mockOnVerificationComplete}
        onCancel={mockOnCancel}
      />
    );

    const overlay = container.querySelector('.verification-overlay');
    fireEvent.click(overlay);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  test('displays timer for code expiry', () => {
    render(
      <EmailVerificationModal
        email={mockEmail}
        onVerificationComplete={mockOnVerificationComplete}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText(/El código expira en:/i)).toBeInTheDocument();
  });

  test('shows verified state after successful verification', async () => {
    const { code } = emailVerificationService.sendVerificationCode(mockEmail);

    const { rerender } = render(
      <EmailVerificationModal
        email={mockEmail}
        onVerificationComplete={mockOnVerificationComplete}
        onCancel={mockOnCancel}
      />
    );

    const input = screen.getByPlaceholderText('000000');
    const button = screen.getByRole('button', { name: /verificar email/i });

    fireEvent.change(input, { target: { value: code } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockOnVerificationComplete).toHaveBeenCalled();
    });
  });

  test('displays help text about spam folder', () => {
    render(
      <EmailVerificationModal
        email={mockEmail}
        onVerificationComplete={mockOnVerificationComplete}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText(/Revisa tu carpeta de spam/i)).toBeInTheDocument();
  });
});
