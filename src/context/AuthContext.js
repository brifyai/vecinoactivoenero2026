import { createContext, useContext, useState, useEffect } from 'react';
import storageService from '../services/storageService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Inicializar datos mock si es necesario
    storageService.initializeMockData();
    
    // Verificar si hay un usuario guardado
    const savedUser = storageService.getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
      // Asegurarse de que el usuario actual esté en la lista de usuarios
      const users = JSON.parse(localStorage.getItem('friendbook_users') || '[]');
      const existingUser = users.find(u => u.id === savedUser.id);
      if (!existingUser) {
        // Agregar el usuario actual a la lista de usuarios
        users.push(savedUser);
        localStorage.setItem('friendbook_users', JSON.stringify(users));
      }
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    // Buscar usuario en localStorage
    const foundUser = storageService.getUserByEmail(email);
    
    if (foundUser && foundUser.password === password) {
      const userSession = {
        id: foundUser.id,
        name: foundUser.name,
        username: foundUser.username,
        email: foundUser.email,
        avatar: foundUser.avatar,
        coverPhoto: foundUser.cover,
        bio: foundUser.bio,
        location: foundUser.location,
        phone: foundUser.phone,
        website: foundUser.website,
        birthday: foundUser.birthday,
        gender: foundUser.gender,
        relationship: foundUser.relationship,
        bloodGroup: foundUser.bloodGroup,
        joinDate: foundUser.joinDate,
        following: foundUser.following,
        followers: foundUser.followers,
        verified: true,
        // Campos vecinales
        neighborhoodId: foundUser.neighborhoodId || null,
        neighborhoodName: foundUser.neighborhoodName || '',
        neighborhoodCode: foundUser.neighborhoodCode || '',
        isVerifiedNeighbor: foundUser.isVerifiedNeighbor || false,
        verifiedBy: foundUser.verifiedBy || [],
        latitude: foundUser.latitude || null,
        longitude: foundUser.longitude || null
      };
      
      setUser(userSession);
      storageService.setCurrentUser(userSession);
      return { success: true, user: userSession };
    }
    
    return { success: false, error: 'Credenciales inválidas' };
  };

  const register = (userData) => {
    // Verificar si el email ya existe
    const existingUser = storageService.getUserByEmail(userData.email);
    if (existingUser) {
      return { success: false, error: 'El email ya está registrado' };
    }
    
    // Verificar si el username ya existe
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const existingUsername = users.find(u => u.username === userData.username);
    if (existingUsername) {
      return { success: false, error: 'El nombre de usuario ya está en uso' };
    }
    
    // Crear nuevo usuario
    const newUser = {
      id: Date.now(),
      name: userData.name,
      username: userData.username,
      email: userData.email,
      password: userData.password,
      avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
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
      // Campos de dirección
      address: userData.address || '',
      addressNumber: userData.addressNumber || '',
      // Campos vecinales
      neighborhoodId: userData.neighborhoodId || null,
      neighborhoodName: userData.neighborhoodName || '',
      neighborhoodCode: userData.neighborhoodCode || '',
      isVerifiedNeighbor: false,
      verifiedBy: null,
      verifiedDate: null,
      verificationStatus: null, // null, pending, approved, rejected
      verificationRequestId: null,
      latitude: userData.latitude || null,
      longitude: userData.longitude || null,
      // Preferencia de distancia para conocer vecinos
      maxDistance: userData.maxDistance || 5
    };
    
    storageService.addUser(newUser);
    
    const userSession = {
      id: newUser.id,
      name: newUser.name,
      username: newUser.username,
      email: newUser.email,
      avatar: newUser.avatar,
      coverPhoto: newUser.cover,
      bio: newUser.bio,
      location: newUser.location,
      following: newUser.following,
      followers: newUser.followers,
      verified: false,
      joinDate: newUser.joinDate,
      // Campos de dirección
      address: newUser.address,
      addressNumber: newUser.addressNumber,
      // Campos vecinales
      neighborhoodId: newUser.neighborhoodId,
      neighborhoodName: newUser.neighborhoodName,
      neighborhoodCode: newUser.neighborhoodCode,
      isVerifiedNeighbor: newUser.isVerifiedNeighbor,
      verifiedBy: newUser.verifiedBy,
      latitude: newUser.latitude,
      longitude: newUser.longitude,
      // Preferencia de distancia
      maxDistance: newUser.maxDistance
    };
    
    setUser(userSession);
    storageService.setCurrentUser(userSession);
    return { success: true, user: userSession };
  };

  const logout = () => {
    setUser(null);
    storageService.clearCurrentUser();
  };

  const updateUser = (updates) => {
    if (!user) return;
    
    // Si se está actualizando el username, verificar disponibilidad
    if (updates.username && updates.username !== user.username) {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const existingUser = users.find(u => u.username === updates.username && u.id !== user.id);
      if (existingUser) {
        return { success: false, error: 'El nombre de usuario ya está en uso' };
      }
    }
    
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    storageService.setCurrentUser(updatedUser);
    storageService.updateUser(user.id, updates);
    return { success: true };
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
