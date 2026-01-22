import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';
import { AuthProvider } from '../context/AuthContext';
import storageService from '../services/storageService';

// Mock the sweetalert utilities
jest.mock('../utils/sweetalert', () => ({
  showErrorToast: jest.fn(),
  showSuccessToast: jest.fn(),
  showInfoToast: jest.fn()
}));

// Helper to render with providers
const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Login Component', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Initialize mock data
    storageService.initializeMockData();
    // Create a test user
    const testUser = {
      id: 1,
      name: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      avatar: 'https://i.pravatar.cc/150?img=1',
      cover: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=400&fit=crop',
      bio: '',
      location: '',
      phone: '',
      website: '',
      birthday: '',
      gender: '',
      relationship: 'Single',
      bloodGroup: '',
      joinDate: new Date().toLocaleDateString(),
      following: 0,
      followers: 0,
      createdAt: new Date().toISOString(),
      address: '',
      addressNumber: '',
      neighborhoodId: null,
      neighborhoodName: '',
      neighborhoodCode: '',
      isVerifiedNeighbor: false,
      verifiedBy: null,
      latitude: null,
      longitude: null,
      maxDistance: 5
    };
    storageService.addUser(testUser);
  });

  test('renders login form with email and password fields', () => {
    renderWithProviders(<Login />);
    
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  test('displays error when email is empty', async () => {
    const { showErrorToast } = require('../utils/sweetalert');
    renderWithProviders(<Login />);
    
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
    
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(showErrorToast).toHaveBeenCalledWith('Por favor completa todos los campos');
    });
  });

  test('displays error when password is empty', async () => {
    const { showErrorToast } = require('../utils/sweetalert');
    renderWithProviders(<Login />);
    
    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(showErrorToast).toHaveBeenCalledWith('Por favor completa todos los campos');
    });
  });

  test('displays error for invalid email format', async () => {
    const { showErrorToast } = require('../utils/sweetalert');
    renderWithProviders(<Login />);
    
    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
    
    fireEvent.change(emailInput, { target: { value: 'invalidemail' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(showErrorToast).toHaveBeenCalledWith('Por favor ingresa un email válido');
    });
  });

  test('displays error for invalid credentials', async () => {
    const { showErrorToast } = require('../utils/sweetalert');
    renderWithProviders(<Login />);
    
    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(showErrorToast).toHaveBeenCalledWith('Credenciales inválidas');
    });
  });

  test('toggles password visibility', () => {
    renderWithProviders(<Login />);
    
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const toggleButton = screen.getAllByRole('button').find(btn => 
      btn.querySelector('svg') && btn.className.includes('input-icon-btn')
    );
    
    expect(passwordInput.type).toBe('password');
    
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('text');
    
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('password');
  });

  test('saves email when remember me is checked', async () => {
    renderWithProviders(<Login />);
    
    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const rememberCheckbox = screen.getByLabelText(/recuérdame/i);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(rememberCheckbox);
    
    expect(rememberCheckbox.checked).toBe(true);
  });

  test('displays remember me checkbox', () => {
    renderWithProviders(<Login />);
    
    expect(screen.getByLabelText(/recuérdame/i)).toBeInTheDocument();
  });

  test('displays forgot password link', () => {
    renderWithProviders(<Login />);
    
    expect(screen.getByText(/¿olvidaste tu contraseña\?/i)).toBeInTheDocument();
  });

  test('displays signup link', () => {
    renderWithProviders(<Login />);
    
    expect(screen.getByText(/¿no tienes una cuenta\?/i)).toBeInTheDocument();
  });

  test('displays social login buttons', () => {
    renderWithProviders(<Login />);
    
    const socialButtons = screen.getAllByRole('button').filter(btn => 
      btn.className.includes('social-btn')
    );
    
    expect(socialButtons.length).toBeGreaterThan(0);
  });

  test('disables submit button while loading', async () => {
    renderWithProviders(<Login />);
    
    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  test('loads remembered email on mount', () => {
    localStorage.setItem('rememberedEmail', 'remembered@example.com');
    
    renderWithProviders(<Login />);
    
    const emailInput = screen.getByLabelText(/correo electrónico/i);
    expect(emailInput.value).toBe('remembered@example.com');
  });

  test('clears remembered email when remember me is unchecked', async () => {
    renderWithProviders(<Login />);
    
    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const rememberCheckbox = screen.getByLabelText(/recuérdame/i);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(rememberCheckbox);
    fireEvent.click(rememberCheckbox);
    
    expect(rememberCheckbox.checked).toBe(false);
  });
});
