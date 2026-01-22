import { createContext, useContext, useState, useEffect } from 'react';
import storageService from '../services/storageService';

const ModerationContext = createContext();

export const useModeration = () => {
  const context = useContext(ModerationContext);
  if (!context) {
    throw new Error('useModeration must be used within a ModerationProvider');
  }
  return context;
};

export const ModerationProvider = ({ children }) => {
  const [reports, setReports] = useState([]);
  const [moderators, setModerators] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedReports = storageService.getReports();
    const savedModerators = storageService.getModerators();
    setReports(savedReports);
    setModerators(savedModerators);
    setLoading(false);
  }, []);

  const createReport = (reporterUserId, contentId, contentType, reason, description) => {
    if (!reason || !description.trim()) {
      return { success: false, error: 'Por favor completa todos los campos' };
    }

    const newReport = {
      id: `report-${Date.now()}`,
      reporterUserId,
      contentId,
      contentType, // 'need', 'action', 'message', 'profile'
      reason,
      description,
      status: 'pending', // 'pending', 'reviewing', 'resolved', 'rejected'
      moderatorId: null,
      action: null, // 'warning', 'deletion', 'suspension', 'none'
      createdAt: new Date().toISOString(),
      resolvedAt: null
    };

    const updated = [...reports, newReport];
    storageService.saveReports(updated);
    setReports(updated);

    return { success: true, report: newReport };
  };

  const assignToModerator = (reportId, moderatorId) => {
    const updated = reports.map(r =>
      r.id === reportId
        ? { ...r, status: 'reviewing', moderatorId }
        : r
    );
    storageService.saveReports(updated);
    setReports(updated);
    return { success: true };
  };

  const resolveReport = (reportId, action, notes = '') => {
    const updated = reports.map(r =>
      r.id === reportId
        ? {
            ...r,
            status: 'resolved',
            action,
            resolvedAt: new Date().toISOString()
          }
        : r
    );
    storageService.saveReports(updated);
    setReports(updated);

    // Aplicar acción si es necesario
    if (action === 'suspension') {
      // Suspender usuario
      const report = reports.find(r => r.id === reportId);
      if (report) {
        storageService.updateUser(report.reporterUserId, {
          status: 'suspended'
        });
      }
    }

    return { success: true };
  };

  const rejectReport = (reportId) => {
    const updated = reports.map(r =>
      r.id === reportId
        ? { ...r, status: 'rejected', resolvedAt: new Date().toISOString() }
        : r
    );
    storageService.saveReports(updated);
    setReports(updated);
    return { success: true };
  };

  const getPendingReports = () => {
    return reports.filter(r => r.status === 'pending');
  };

  const getModeratorReports = (moderatorId) => {
    return reports.filter(r => r.moderatorId === moderatorId);
  };

  const addModerator = (userId) => {
    const newModerator = {
      id: `mod-${Date.now()}`,
      userId,
      reputation: 0,
      actionsCount: 0,
      createdAt: new Date().toISOString()
    };

    const updated = [...moderators, newModerator];
    storageService.saveModerators(updated);
    setModerators(updated);

    return { success: true, moderator: newModerator };
  };

  const removeModerator = (userId) => {
    const updated = moderators.filter(m => m.userId !== userId);
    storageService.saveModerators(updated);
    setModerators(updated);
    return { success: true };
  };

  const updateModeratorReputation = (userId, delta) => {
    const updated = moderators.map(m =>
      m.userId === userId
        ? { ...m, reputation: m.reputation + delta, actionsCount: m.actionsCount + 1 }
        : m
    );
    storageService.saveModerators(updated);
    setModerators(updated);
  };

  const value = {
    reports,
    moderators,
    loading,
    createReport,
    assignToModerator,
    resolveReport,
    rejectReport,
    getPendingReports,
    getModeratorReports,
    addModerator,
    removeModerator,
    updateModeratorReputation
  };

  return (
    <ModerationContext.Provider value={value}>
      {children}
    </ModerationContext.Provider>
  );
};
