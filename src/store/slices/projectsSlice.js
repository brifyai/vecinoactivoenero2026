import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import supabaseProjectsService from '../../services/supabaseProjectsService';

// Async Thunks
export const loadProjects = createAsyncThunk(
  'projects/loadProjects',
  async (neighborhoodId, { rejectWithValue }) => {
    try {
      const projects = await supabaseProjectsService.getProjects(neighborhoodId);
      return projects;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createProject = createAsyncThunk(
  'projects/createProject',
  async (projectData, { rejectWithValue }) => {
    try {
      const newProject = await supabaseProjectsService.createProject(projectData);
      return newProject;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const voteProject = createAsyncThunk(
  'projects/voteProject',
  async ({ projectId, userId }, { rejectWithValue }) => {
    try {
      const result = await supabaseProjectsService.voteProject(projectId, userId);
      return { projectId, ...result };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const joinAsVolunteer = createAsyncThunk(
  'projects/joinAsVolunteer',
  async ({ projectId, userId }, { rejectWithValue }) => {
    try {
      const result = await supabaseProjectsService.joinAsVolunteer(projectId, userId);
      return { projectId, ...result };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addUpdate = createAsyncThunk(
  'projects/addUpdate',
  async ({ projectId, authorId, content, images }, { rejectWithValue }) => {
    try {
      const update = await supabaseProjectsService.addUpdate(projectId, authorId, content, images);
      return { projectId, update };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getUpdates = createAsyncThunk(
  'projects/getUpdates',
  async (projectId, { rejectWithValue }) => {
    try {
      const updates = await supabaseProjectsService.getUpdates(projectId);
      return { projectId, updates };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateStatus = createAsyncThunk(
  'projects/updateStatus',
  async ({ projectId, newStatus }, { rejectWithValue }) => {
    try {
      const updatedProject = await supabaseProjectsService.updateStatus(projectId, newStatus);
      return updatedProject;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async ({ projectId, updates }, { rejectWithValue }) => {
    try {
      const updatedProject = await supabaseProjectsService.updateProject(projectId, updates);
      return updatedProject;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async (projectId, { rejectWithValue }) => {
    try {
      await supabaseProjectsService.deleteProject(projectId);
      return projectId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const projectsSlice = createSlice({
  name: 'projects',
  initialState: {
    projects: [],
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
      // Load Projects
      .addCase(loadProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(loadProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Project
      .addCase(createProject.pending, (state) => {
        state.loading = true;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects.push(action.payload);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Vote Project
      .addCase(voteProject.fulfilled, (state, action) => {
        const { projectId, added } = action.payload;
        const project = state.projects.find(p => p.id === projectId);
        if (project) {
          project.votes = (project.votes || 0) + (added ? 1 : -1);
        }
      })
      // Join as Volunteer
      .addCase(joinAsVolunteer.fulfilled, (state, action) => {
        const { projectId, added } = action.payload;
        const project = state.projects.find(p => p.id === projectId);
        if (project) {
          project.volunteer_count = (project.volunteer_count || 0) + (added ? 1 : -1);
        }
      })
      // Add Update
      .addCase(addUpdate.fulfilled, (state, action) => {
        const { projectId, update } = action.payload;
        const project = state.projects.find(p => p.id === projectId);
        if (project) {
          if (!project.updates) project.updates = [];
          project.updates.unshift(update);
        }
      })
      // Get Updates
      .addCase(getUpdates.fulfilled, (state, action) => {
        const { projectId, updates } = action.payload;
        const project = state.projects.find(p => p.id === projectId);
        if (project) {
          project.updates = updates;
        }
      })
      // Update Status
      .addCase(updateStatus.fulfilled, (state, action) => {
        const projectIndex = state.projects.findIndex(p => p.id === action.payload.id);
        if (projectIndex !== -1) {
          state.projects[projectIndex] = action.payload;
        }
      })
      // Update Project
      .addCase(updateProject.fulfilled, (state, action) => {
        const projectIndex = state.projects.findIndex(p => p.id === action.payload.id);
        if (projectIndex !== -1) {
          state.projects[projectIndex] = action.payload;
        }
      })
      // Delete Project
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter(p => p.id !== action.payload);
      });
  }
});

export const { clearError } = projectsSlice.actions;
export default projectsSlice.reducer;
