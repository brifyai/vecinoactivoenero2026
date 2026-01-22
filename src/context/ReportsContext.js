import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/selectors/authSelectors';

const ReportsContext = createContext();

export const useReports = () => {
  const context = useContext(ReportsContext);
  if (!context) {
    throw new Error('useReports must be used within ReportsProvider');
  }
  return context;
};

export const ReportsProvider = ({ children }) => {
  const user = useSelector(selectUser);
  const [reports, setReports] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);

  useEffect(() => {
    loadReports();
    loadBlockedUsers();
  }, []);

  const loadReports = () => {
    const stored = localStorage.getItem('reports');
    if (stored) {
      setReports(JSON.parse(stored));
    }
  };

  const loadBlockedUsers = () => {
    const stored = localStorage.getItem('blockedUsers');
    if (stored) {
      setBlockedUsers(JSON.parse(stored));
    }
  };

  const saveReports = (newReports) => {
    localStorage.setItem('reports', JSON.stringify(newReports));
    setReports(newReports);
  };

  const saveBlockedUsers = (blocked) => {
    localStorage.setItem('blockedUsers', JSON.stringify(blocked));
    setBlockedUsers(blocked);
  };

  // Reportar contenido
  const reportContent = (data) => {
    const report = {
      id: Date.now().toString(),
      reporterId: user.id,
      reporterName: user.name,
      type: data.type, // post, comment, user, message
      targetId: data.targetId,
      targetType: data.targetType,
      reason: data.reason,
      description: data.description,
      status: 'pending', // pending, reviewed, resolved, dismissed
      createdAt: new Date().toISOString(),
      reviewedAt: null,
      reviewedBy: null,
      action: null // warning, content_removed, user_suspended, dismissed
    };

    const updated = [...reports, report];
    saveReports(updated);
    return { success: true, report };
  };

  // Bloquear usuario
  const blockUser = (userId) => {
    if (!user) return { success: false };
    
    const block = {
      id: Date.now().toString(),
      blockerId: user.id,
      blockedUserId: userId,
      createdAt: new Date().toISOString()
    };

    const updated = [...blockedUsers, block];
    saveBlockedUsers(updated);
    return { success: true };
  };

  // Desbloquear usuario
  const unblockUser = (userId) => {
    const updated = blockedUsers.filter(
      b => !(b.blockerId === user.id && b.blockedUserId === userId)
    );
    saveBlockedUsers(updated);
    return { success: true };
  };

  // Verificar si un usuario está bloqueado
  const isUserBlocked = (userId) => {
    return blockedUsers.some(
      b => b.blockerId === user?.id && b.blockedUserId === userId
    );
  };

  // Obtener usuarios bloqueados por el usuario actual
  const getBlockedUsers = () => {
    return blockedUsers.filter(b => b.blockerId === user?.id);
  };

  // Revisar reporte (admin)
  const reviewReport = (reportId, action, notes = '') => {
    const updated = reports.map(r => {
      if (r.id === reportId) {
        return {
          ...r,
          status: 'reviewed',
          reviewedAt: new Date().toISOString(),
          reviewedBy: user.id,
          action,
          reviewNotes: notes
        };
      }
      return r;
    });
    saveReports(updated);
    return { success: true };
  };

  // Obtener reportes pendientes (admin)
  const getPendingReports = () => {
    return reports.filter(r => r.status === 'pending');
  };

  // Obtener reportes del usuario
  const getUserReports = () => {
    return reports.filter(r => r.reporterId === user?.id);
  };

  const value = {
    reports,
    blockedUsers,
    reportContent,
    blockUser,
    unblockUser,
    isUserBlocked,
    getBlockedUsers,
    reviewReport,
    getPendingReports,
    getUserReports
  };

  return (
    <ReportsContext.Provider value={value}>
      {children}
    </ReportsContext.Provider>
  );
};
