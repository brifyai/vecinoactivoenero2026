import { useSelector, useDispatch } from 'react-redux';
import { useMemo } from 'react';
import {
  loadVerificationRequests,
  submitVerificationRequest
} from '../store/slices/verificationSlice';
import {
  selectAllVerificationRequests,
  selectVerificationLoading,
  selectVerificationError,
  selectVerificationRequestsCount
} from '../store/selectors/verificationSelectors';
import { selectUser } from '../store/selectors/authSelectors';
import { showSuccessToast } from '../utils/sweetalert';

export const useReduxVerification = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const verificationRequests = useSelector(selectAllVerificationRequests);
  const loading = useSelector(selectVerificationLoading);
  const error = useSelector(selectVerificationError);
  const requestsCount = useSelector(selectVerificationRequestsCount);

  const loadRequests = () => {
    dispatch(loadVerificationRequests());
  };

  const submitVerificationRequest = async (data) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    try {
      const result = await dispatch(submitVerificationRequest({ data, user })).unwrap();
      showSuccessToast('Solicitud de verificación enviada exitosamente');
      return { success: true, request: result };
    } catch (error) {
      return { success: false, error };
    }
  };

  // Funciones simuladas para compatibilidad (usando localStorage directamente)
  const approveRequest = async (requestId, reviewNotes = '') => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    try {
      const storedRequests = JSON.parse(localStorage.getItem('verificationRequests') || '[]');
      const updatedRequests = storedRequests.map(req => {
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
      localStorage.setItem('verificationRequests', JSON.stringify(updatedRequests));
      dispatch(loadVerificationRequests());
      showSuccessToast('Solicitud de verificación aprobada');
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const rejectRequest = async (requestId, reviewNotes = '') => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    try {
      const storedRequests = JSON.parse(localStorage.getItem('verificationRequests') || '[]');
      const updatedRequests = storedRequests.map(req => {
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
      localStorage.setItem('verificationRequests', JSON.stringify(updatedRequests));
      dispatch(loadVerificationRequests());
      showSuccessToast('Solicitud de verificación rechazada');
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  // Helper functions - usando useMemo para optimización
  const getUserVerificationRequest = useMemo(() => {
    if (!user) return null;
    return verificationRequests.find(
      req => req.userId === user.id && req.status === 'pending'
    );
  }, [verificationRequests, user]);

  const getPendingRequests = useMemo(() => {
    return verificationRequests.filter(req => req.status === 'pending');
  }, [verificationRequests]);

  const getVerificationStatus = useMemo(() => {
    return (userId) => {
      if (!userId) return null;
      
      // Buscar solicitud del usuario
      const request = verificationRequests.find(req => req.userId === userId);
      if (request) {
        return {
          verified: request.status === 'approved',
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
  }, [verificationRequests]);

  const getApprovedRequests = useMemo(() => {
    return verificationRequests.filter(req => req.status === 'approved');
  }, [verificationRequests]);

  const getRejectedRequests = useMemo(() => {
    return verificationRequests.filter(req => req.status === 'rejected');
  }, [verificationRequests]);

  return {
    verificationRequests,
    loading,
    error,
    requestsCount,
    loadRequests,
    requestVerification: submitVerificationRequest,
    approveVerification: approveRequest,
    rejectVerification: rejectRequest,
    // Helper functions
    getUserVerificationRequest,
    getPendingRequests,
    getVerificationStatus,
    getApprovedRequests,
    getRejectedRequests
  };
};