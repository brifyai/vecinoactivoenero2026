import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import storageService from '../../services/storageService';

// Async thunks
export const loadModerationData = createAsyncThunk('moderation/load', async () => {
  const reports = storageService.getReports();
  const moderators = storageService.getModerators();
  return { reports, moderators };
});

export const createModerationReport = createAsyncThunk(
  'moderation/createReport',
  async ({ reporterUserId, contentId, contentType, reason, description }, { rejectWithValue }) => {
    if (!reason || !description.trim()) {
      return rejectWithValue('Por favor completa todos los campos');
    }

    const newReport = {
      id: `report-${Date.now()}`,
      reporterUserId,
      contentId,
      contentType,
      reason,
      description,
      status: 'pending',
      moderatorId: null,
      action: null,
      createdAt: new Date().toISOString(),
      resolvedAt: null
    };

    const reports = storageService.getReports();
    const updated = [...reports, newReport];
    storageService.saveReports(updated);
    return newReport;
  }
);

export const assignToModerator = createAsyncThunk(
  'moderation/assignToModerator',
  async ({ reportId, moderatorId }) => {
    const reports = storageService.getReports();
    const updated = reports.map(r =>
      r.id === reportId
        ? { ...r, status: 'reviewing', moderatorId }
        : r
    );
    storageService.saveReports(updated);
    return { reportId, moderatorId };
  }
);

export const resolveReport = createAsyncThunk(
  'moderation/resolveReport',
  async ({ reportId, action, notes = '' }) => {
    const reports = storageService.getReports();
    const updated = reports.map(r =>
      r.id === reportId
        ? {
            ...r,
            status: 'resolved',
            action,
            resolvedAt: new Date().toISOString(),
            notes
          }
        : r
    );
    storageService.saveReports(updated);

    // Aplicar acción si es necesario
    if (action === 'suspension') {
      const report = reports.find(r => r.id === reportId);
      if (report) {
        storageService.updateUser(report.reporterUserId, {
          status: 'suspended'
        });
      }
    }

    return { reportId, action, notes };
  }
);

export const rejectReport = createAsyncThunk(
  'moderation/rejectReport',
  async ({ reportId }) => {
    const reports = storageService.getReports();
    const updated = reports.map(r =>
      r.id === reportId
        ? { ...r, status: 'rejected', resolvedAt: new Date().toISOString() }
        : r
    );
    storageService.saveReports(updated);
    return { reportId };
  }
);

export const addModerator = createAsyncThunk(
  'moderation/addModerator',
  async ({ userId }) => {
    const newModerator = {
      id: `mod-${Date.now()}`,
      userId,
      reputation: 0,
      actionsCount: 0,
      createdAt: new Date().toISOString()
    };

    const moderators = storageService.getModerators();
    const updated = [...moderators, newModerator];
    storageService.saveModerators(updated);
    return newModerator;
  }
);

export const removeModerator = createAsyncThunk(
  'moderation/removeModerator',
  async ({ userId }) => {
    const moderators = storageService.getModerators();
    const updated = moderators.filter(m => m.userId !== userId);
    storageService.saveModerators(updated);
    return { userId };
  }
);

export const updateModeratorReputation = createAsyncThunk(
  'moderation/updateReputation',
  async ({ userId, delta }) => {
    const moderators = storageService.getModerators();
    const updated = moderators.map(m =>
      m.userId === userId
        ? { ...m, reputation: m.reputation + delta, actionsCount: m.actionsCount + 1 }
        : m
    );
    storageService.saveModerators(updated);
    return { userId, delta };
  }
);

const moderationSlice = createSlice({
  name: 'moderation',
  initialState: { 
    reports: [], 
    moderators: [], 
    loading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Load moderation data
      .addCase(loadModerationData.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadModerationData.fulfilled, (state, action) => {
        state.reports = action.payload.reports;
        state.moderators = action.payload.moderators;
        state.loading = false;
      })
      .addCase(loadModerationData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Create report
      .addCase(createModerationReport.fulfilled, (state, action) => {
        state.reports.push(action.payload);
      })
      .addCase(createModerationReport.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Assign to moderator
      .addCase(assignToModerator.fulfilled, (state, action) => {
        const report = state.reports.find(r => r.id === action.payload.reportId);
        if (report) {
          report.status = 'reviewing';
          report.moderatorId = action.payload.moderatorId;
        }
      })
      // Resolve report
      .addCase(resolveReport.fulfilled, (state, action) => {
        const report = state.reports.find(r => r.id === action.payload.reportId);
        if (report) {
          report.status = 'resolved';
          report.action = action.payload.action;
          report.notes = action.payload.notes;
          report.resolvedAt = new Date().toISOString();
        }
      })
      // Reject report
      .addCase(rejectReport.fulfilled, (state, action) => {
        const report = state.reports.find(r => r.id === action.payload.reportId);
        if (report) {
          report.status = 'rejected';
          report.resolvedAt = new Date().toISOString();
        }
      })
      // Add moderator
      .addCase(addModerator.fulfilled, (state, action) => {
        state.moderators.push(action.payload);
      })
      // Remove moderator
      .addCase(removeModerator.fulfilled, (state, action) => {
        state.moderators = state.moderators.filter(m => m.userId !== action.payload.userId);
      })
      // Update moderator reputation
      .addCase(updateModeratorReputation.fulfilled, (state, action) => {
        const moderator = state.moderators.find(m => m.userId === action.payload.userId);
        if (moderator) {
          moderator.reputation += action.payload.delta;
          moderator.actionsCount += 1;
        }
      });
  }
});

export const { clearError } = moderationSlice.actions;
export default moderationSlice.reducer;
