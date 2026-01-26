import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks
export const loadReports = createAsyncThunk('reports/load', async () => {
  return JSON.parse(localStorage.getItem('reports') || '[]');
});

export const loadBlockedUsers = createAsyncThunk('reports/loadBlocked', async () => {
  return JSON.parse(localStorage.getItem('blockedUsers') || '[]');
});

export const createReport = createAsyncThunk('reports/create', async ({ reportData, user }) => {
  const report = {
    id: Date.now().toString(),
    reporterId: user.id,
    reporterName: user.name,
    type: reportData.type,
    targetId: reportData.targetId,
    targetType: reportData.targetType,
    reason: reportData.reason,
    description: reportData.description,
    status: 'pending',
    createdAt: new Date().toISOString(),
    reviewedAt: null,
    reviewedBy: null,
    action: null
  };

  const stored = JSON.parse(localStorage.getItem('reports') || '[]');
  const updated = [...stored, report];
  localStorage.setItem('reports', JSON.stringify(updated));
  return report;
});

export const blockUser = createAsyncThunk('reports/blockUser', async ({ userId, user }) => {
  const block = {
    id: Date.now().toString(),
    blockerId: user.id,
    blockedUserId: userId,
    createdAt: new Date().toISOString()
  };

  const stored = JSON.parse(localStorage.getItem('blockedUsers') || '[]');
  const updated = [...stored, block];
  localStorage.setItem('blockedUsers', JSON.stringify(updated));
  return block;
});

export const unblockUser = createAsyncThunk('reports/unblockUser', async ({ userId, user }) => {
  const stored = JSON.parse(localStorage.getItem('blockedUsers') || '[]');
  const updated = stored.filter(
    b => !(b.blockerId === user.id && b.blockedUserId === userId)
  );
  localStorage.setItem('blockedUsers', JSON.stringify(updated));
  return { userId, blockerId: user.id };
});

export const reviewReport = createAsyncThunk('reports/review', async ({ reportId, action, notes, user }) => {
  const stored = JSON.parse(localStorage.getItem('reports') || '[]');
  const updated = stored.map(r => {
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
  localStorage.setItem('reports', JSON.stringify(updated));
  return { reportId, action, notes };
});

const reportsSlice = createSlice({
  name: 'reports',
  initialState: { 
    reports: [], 
    blockedUsers: [], 
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
      // Load reports
      .addCase(loadReports.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadReports.fulfilled, (state, action) => {
        state.reports = action.payload;
        state.loading = false;
      })
      .addCase(loadReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Load blocked users
      .addCase(loadBlockedUsers.fulfilled, (state, action) => {
        state.blockedUsers = action.payload;
      })
      // Create report
      .addCase(createReport.fulfilled, (state, action) => {
        state.reports.push(action.payload);
      })
      // Block user
      .addCase(blockUser.fulfilled, (state, action) => {
        state.blockedUsers.push(action.payload);
      })
      // Unblock user
      .addCase(unblockUser.fulfilled, (state, action) => {
        state.blockedUsers = state.blockedUsers.filter(
          b => !(b.blockerId === action.payload.blockerId && b.blockedUserId === action.payload.userId)
        );
      })
      // Review report
      .addCase(reviewReport.fulfilled, (state, action) => {
        const report = state.reports.find(r => r.id === action.payload.reportId);
        if (report) {
          report.status = 'reviewed';
          report.action = action.payload.action;
          report.reviewNotes = action.payload.notes;
          report.reviewedAt = new Date().toISOString();
        }
      });
  }
});

export const { clearError } = reportsSlice.actions;
export default reportsSlice.reducer;
