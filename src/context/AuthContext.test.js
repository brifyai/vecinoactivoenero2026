import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import storageService from '../services/storageService';

// Mock storageService
jest.mock('../services/storageService', () => ({
  initializeMockData: jest.fn(),
  getCurrentUser: jest.fn(),
  setCurrentUser: jest.fn(),
  clearCurrentUser: jest.fn(),
  getUserByEmail: jest.fn(),
  addUser: jest.fn(),
  updateUser: jest.fn(),
  getUsers: jest.fn(() => []),
}));

describe('AuthContext - Session Management', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('initializes with no user when no session exists', () => {
    storageService.getCurrentUser.mockReturnValue(null);
    
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  test('restores user from valid session', async () => {
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      username: 'testuser'
    };
    
    const session = {
      createdAt: Date.now(),
      userId: 1
    };
    
    localStorage.setItem('friendbook_session', JSON.stringify(session));
    storageService.getCurrentUser.mockReturnValue(mockUser);
    
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  test('clears expired session', async () => {
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com'
    };
    
    // Create an expired session (25 hours old)
    const expiredSession = {
      createdAt: Date.now() - (25 * 60 * 60 * 1000),
      userId: 1
    };
    
    localStorage.setItem('friendbook_session', JSON.stringify(expiredSession));
    storageService.getCurrentUser.mockReturnValue(mockUser);
    
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.sessionExpired).toBe(true);
      expect(result.current.user).toBeNull();
    });
  });

  test('login creates a session', async () => {
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      username: 'testuser',
      avatar: 'avatar.jpg',
      cover: 'cover.jpg',
      bio: '',
      location: '',
      phone: '',
      website: '',
      birthday: '',
      gender: '',
      relationship: 'Single',
      bloodGroup: '',
      joinDate: '2024-01-01',
      following: 0,
      followers: 0,
      neighborhoodId: null,
      neighborhoodName: '',
      neighborhoodCode: '',
      isVerifiedNeighbor: false,
      verifiedBy: [],
      latitude: null,
      longitude: null
    };
    
    storageService.getUserByEmail.mockReturnValue(mockUser);
    
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    act(() => {
      result.current.login('test@example.com', 'password123');
    });
    
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user.email).toBe('test@example.com');
    });
    
    // Check that session was created
    const session = JSON.parse(localStorage.getItem('friendbook_session'));
    expect(session).not.toBeNull();
    expect(session.userId).toBe(1);
  });

  test('login fails with invalid credentials', async () => {
    storageService.getUserByEmail.mockReturnValue(null);
    
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    const loginResult = result.current.login('test@example.com', 'wrongpassword');
    
    expect(loginResult.success).toBe(false);
    expect(loginResult.error).toBe('Credenciales inválidas');
    expect(result.current.isAuthenticated).toBe(false);
  });

  test('logout clears session', async () => {
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com'
    };
    
    const session = {
      createdAt: Date.now(),
      userId: 1
    };
    
    localStorage.setItem('friendbook_session', JSON.stringify(session));
    storageService.getCurrentUser.mockReturnValue(mockUser);
    
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });
    
    act(() => {
      result.current.logout();
    });
    
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem('friendbook_session')).toBeNull();
  });

  test('updateSessionTimestamp extends session', async () => {
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com'
    };
    
    const session = {
      createdAt: Date.now() - (10 * 60 * 1000), // 10 minutes old
      userId: 1
    };
    
    localStorage.setItem('friendbook_session', JSON.stringify(session));
    storageService.getCurrentUser.mockReturnValue(mockUser);
    
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });
    
    const oldSession = JSON.parse(localStorage.getItem('friendbook_session'));
    const oldTimestamp = oldSession.createdAt;
    
    act(() => {
      result.current.updateSessionTimestamp();
    });
    
    const newSession = JSON.parse(localStorage.getItem('friendbook_session'));
    expect(newSession.createdAt).toBeGreaterThan(oldTimestamp);
  });

  test('register creates user and session', async () => {
    const userData = {
      name: 'New User',
      username: 'newuser',
      email: 'new@example.com',
      password: 'password123',
      address: '123 Main St',
      addressNumber: '123',
      neighborhoodId: 1,
      neighborhoodName: 'Downtown',
      neighborhoodCode: 'DT001',
      latitude: 40.7128,
      longitude: -74.0060,
      maxDistance: 5
    };
    
    storageService.getUserByEmail.mockReturnValue(null);
    storageService.getUsers.mockReturnValue([]);
    
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    act(() => {
      result.current.register(userData);
    });
    
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user.email).toBe('new@example.com');
    });
  });

  test('register fails if email already exists', async () => {
    const existingUser = {
      id: 1,
      email: 'existing@example.com',
      name: 'Existing User'
    };
    
    const userData = {
      name: 'New User',
      username: 'newuser',
      email: 'existing@example.com',
      password: 'password123'
    };
    
    storageService.getUserByEmail.mockReturnValue(existingUser);
    
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    const registerResult = result.current.register(userData);
    
    expect(registerResult.success).toBe(false);
    expect(registerResult.error).toBe('El email ya está registrado');
  });

  test('updateUser updates user data', async () => {
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      username: 'testuser'
    };
    
    storageService.getCurrentUser.mockReturnValue(mockUser);
    
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.user).not.toBeNull();
    });
    
    act(() => {
      result.current.updateUser({ name: 'Updated Name' });
    });
    
    expect(result.current.user.name).toBe('Updated Name');
  });

  test('session check interval detects expired sessions', async () => {
    jest.useFakeTimers();
    
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com'
    };
    
    const session = {
      createdAt: Date.now() - (25 * 60 * 60 * 1000), // 25 hours old
      userId: 1
    };
    
    localStorage.setItem('friendbook_session', JSON.stringify(session));
    storageService.getCurrentUser.mockReturnValue(mockUser);
    
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });
    
    // Fast-forward time by 1 minute to trigger session check
    act(() => {
      jest.advanceTimersByTime(60000);
    });
    
    await waitFor(() => {
      expect(result.current.sessionExpired).toBe(true);
    });
    
    jest.useRealTimers();
  });
});
