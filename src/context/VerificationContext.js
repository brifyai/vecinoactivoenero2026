import { createContext, useContext, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/selectors/authSelectors';
import { useNotifications } from './NotificationsContext';

const VerificationContext = createContext();

export const useVerification = () => {
  const context = useContext(VerificationContext);
  if (!context) {
    throw new Error('useVerification must be used within VerificationProvider');
  }
  return context;
};

export const VerificationProvider = ({ children }) => {
  const { user, updateUser } = useAuth();
  const { addNotification } = useNotifications();
  const [verificationRequests, setVerificationRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar solicitudes de verificación
  useEffect(() => {
    loadVerificationRequests();
  }, []);

  const loadVerificationRequests = () => {
    const stored = localStorage.getItem('verificationRequests');
    if (stored) {
      setVerificationRequests(JSON.parse(stored));
    }
  };

  const saveVerificationRequests = (requests) => {
    localStorage.setItem('verificationRequests', JSON.stringify(requests));
    setVerificationRequests(requests);
  };

  // Solicitar verificación
  const requestVerification = async (data) => {
    setLoading(true);
    try {
      const request = {
        id: Date.now().toString(),
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        neighborhoodId: user.neighborhoodId,
        neighborhoodName: user.neighborhoodName,
        neighborhoodCode: user.neighborhoodCode,
        documentType: data.documentType,
        documentNumber: data.documentNumber,
        address: data.address,
        proofImage: data.proofImage,
        additionalInfo: data.additionalInfo,
        status: 'pending', // pending, approved, rejected
        requestDate: new Date().toISOString(),
        reviewDate: null,
        reviewedBy: null,
        reviewNotes: null
      };

      const updated = [...verificationRequests, request];
      saveVerificationRequests(updated);

      // Actualizar estado del usuario
      updateUser({
        ...user,
        verificationStatus: 'pending',
        verificationRequestId: request.id
      });

      setLoading(false);
      return { success: true, request };
    } catch (error) {
      console.error('Error requesting verification:', error);
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  // Aprobar verificación (solo admin)
  const approveVerification = (requestId, reviewNotes = '') => {
    const updated = verificationRequests.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          status: 'approved',
          reviewDate: new Date().toISOString(),
          reviewedBy: user.id,
          reviewNotes
        };
      }
      return req;
    });
    saveVerificationRequests(updated);

    // Actualizar usuario verificado
    const request = updated.find(r => r.id === requestId);
    if (request) {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex(u => u.id === request.userId);
      if (userIndex !== -1) {
        users[userIndex].isVerifiedNeighbor = true;
        users[userIndex].verifiedBy = user.id;
        users[userIndex].verifiedDate = new Date().toISOString();
        users[userIndex].verificationStatus = 'approved';
        localStorage.setItem('users', JSON.stringify(users));
        
        // Crear notificación para el usuario
        addNotification(request.userId, {
          type: 'verification_approved',
          message: '¡Tu verificación ha sido aprobada! Ahora eres un Vecino Verificado',
          read: false
        });
      }
    }

    return { success: true };
  };

  // Rechazar verificación (solo admin)
  const rejectVerification = (requestId, reviewNotes = '') => {
    const updated = verificationRequests.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          status: 'rejected',
          reviewDate: new Date().toISOString(),
          reviewedBy: user.id,
          reviewNotes
        };
      }
      return req;
    });
    saveVerificationRequests(updated);

    // Actualizar usuario
    const request = updated.find(r => r.id === requestId);
    if (request) {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex(u => u.id === request.userId);
      if (userIndex !== -1) {
        users[userIndex].verificationStatus = 'rejected';
        localStorage.setItem('users', JSON.stringify(users));
        
        // Crear notificación para el usuario
        addNotification(request.userId, {
          type: 'verification_rejected',
          message: `Tu solicitud de verificación fue rechazada. Motivo: ${reviewNotes || 'No especificado'}`,
          read: false
        });
      }
    }

    return { success: true };
  };

  // Obtener solicitud del usuario actual
  const getUserVerificationRequest = () => {
    if (!user) return null;
    return verificationRequests.find(
      req => req.userId === user.id && req.status === 'pending'
    );
  };

  // Obtener solicitudes pendientes (para admin)
  const getPendingRequests = () => {
    return verificationRequests.filter(req => req.status === 'pending');
  };

  // Obtener estado de verificación de un usuario
  const getVerificationStatus = (userId) => {
    if (!userId) return null;
    
    // Buscar en usuarios
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const targetUser = users.find(u => u.id === userId);
    
    if (!targetUser) return null;
    
    // Si el usuario está verificado
    if (targetUser.isVerifiedNeighbor) {
      return {
        verified: true,
        status: 'approved',
        verifiedDate: targetUser.verifiedDate
      };
    }
    
    // Buscar solicitud pendiente o rechazada
    const request = verificationRequests.find(req => req.userId === userId);
    if (request) {
      return {
        verified: false,
        status: request.status,
        requestDate: request.requestDate,
        reviewDate: request.reviewDate,
        reviewNotes: request.reviewNotes
      };
    }
    
    return {
      verified: false,
      status: null
    };
  };

  const value = {
    verificationRequests,
    loading,
    requestVerification,
    approveVerification,
    rejectVerification,
    getUserVerificationRequest,
    getPendingRequests,
    getVerificationStatus
  };

  return (
    <VerificationContext.Provider value={value}>
      {children}
    </VerificationContext.Provider>
  );
};
