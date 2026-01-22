import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createNotification } from './notificationsSlice';
import { showSuccessToast } from '../../utils/sweetalert';

// Helper: Generar slug único
const generateSlug = (title, existingSlugs) => {
  let baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9áéíóúñü\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  let slug = baseSlug;
  let counter = 1;
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
};

// Async Thunks
export const loadProjects = createAsyncThunk(
  'projects/loadProjects',
  async (_, { rejectWithValue }) => {
    try {
      const stored = localStorage.getItem('communityProjects');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createProject = createAsyncThunk(
  'projects/createProject',
  async ({ projectData, user }, { getState, rejectWithValue }) => {
    try {
      if (!user) throw new Error('Usuario no autenticado');

      const { projects } = getState().projects;
      const existingSlugs = projects.map(p => p.slug);
      const slug = generateSlug(projectData.title, existingSlugs);

      const newProject = {
        id: Date.now(),
        slug,
        title: projectData.title,
        description: projectData.description,
        category: projectData.category,
        status: 'propuesta',
        creatorId: user.id,
        creatorName: user.name,
        creatorAvatar: user.avatar,
        neighborhoodId: user.neighborhoodId,
        neighborhoodName: user.neighborhoodName,
        neighborhoodCode: user.neighborhoodCode,
        budget: projectData.budget || 0,
        fundingGoal: projectData.fundingGoal || 0,
        currentFunding: 0,
        volunteers: [],
        votes: 0,
        voters: [],
        updates: [],
        images: projectData.images || [],
        startDate: projectData.startDate || null,
        endDate: projectData.endDate || null,
        completionDate: null,
        priority: 'media',
        tags: projectData.tags || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const updated = [...projects, newProject];
      localStorage.setItem('communityProjects', JSON.stringify(updated));
      showSuccessToast('¡Proyecto creado exitosamente!');

      return newProject;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const voteProject = createAsyncThunk(
  'projects/voteProject',
  async ({ projectId, user }, { getState, dispatch, rejectWithValue }) => {
    try {
      if (!user) throw new Error('Usuario no autenticado');

      const { projects } = getState().projects;
      const project = projects.find(p => p.id === projectId);
      if (!project) throw new Error('Proyecto no encontrado');

      const hasVoted = project.voters.includes(user.id);
      const isRemoving = hasVoted;

      // Notificar al creador si es un nuevo voto
      if (!isRemoving && project.creatorId !== user.id) {
        dispatch(createNotification({
          userId: project.creatorId,
          type: 'project_vote',
          from: user.id,
          fromName: user.name,
          fromAvatar: user.avatar,
          projectId,
          message: `${user.name} votó por tu proyecto "${project.title}"`,
          read: false
        }));
      }

      const updated = projects.map(p => {
        if (p.id === projectId) {
          return {
            ...p,
            votes: isRemoving ? p.votes - 1 : p.votes + 1,
            voters: isRemoving 
              ? p.voters.filter(id => id !== user.id)
              : [...p.voters, user.id]
          };
        }
        return p;
      });

      localStorage.setItem('communityProjects', JSON.stringify(updated));
      return { projectId, userId: user.id, isRemoving };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const joinAsVolunteer = createAsyncThunk(
  'projects/joinAsVolunteer',
  async ({ projectId, user }, { getState, dispatch, rejectWithValue }) => {
    try {
      if (!user) throw new Error('Usuario no autenticado');

      const { projects } = getState().projects;
      const project = projects.find(p => p.id === projectId);
      if (!project) throw new Error('Proyecto no encontrado');

      const isVolunteer = project.volunteers.some(v => v.id === user.id);
      const isLeaving = isVolunteer;

      // Notificar al creador si se une
      if (!isLeaving && project.creatorId !== user.id) {
        dispatch(createNotification({
          userId: project.creatorId,
          type: 'project_volunteer',
          from: user.id,
          fromName: user.name,
          fromAvatar: user.avatar,
          projectId,
          message: `${user.name} se unió como voluntario a "${project.title}"`,
          read: false
        }));
      }

      const updated = projects.map(p => {
        if (p.id === projectId) {
          return {
            ...p,
            volunteers: isLeaving
              ? p.volunteers.filter(v => v.id !== user.id)
              : [...p.volunteers, {
                  id: user.id,
                  name: user.name,
                  avatar: user.avatar,
                  joinedAt: new Date().toISOString()
                }]
          };
        }
        return p;
      });

      localStorage.setItem('communityProjects', JSON.stringify(updated));
      if (!isLeaving) showSuccessToast('¡Te uniste como voluntario!');
      
      return { projectId, userId: user.id, isLeaving };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addProjectUpdate = createAsyncThunk(
  'projects/addProjectUpdate',
  async ({ projectId, updateData, user }, { getState, rejectWithValue }) => {
    try {
      if (!user) throw new Error('Usuario no autenticado');

      const newUpdate = {
        id: Date.now(),
        authorId: user.id,
        authorName: user.name,
        authorAvatar: user.avatar,
        content: updateData.content,
        images: updateData.images || [],
        createdAt: new Date().toISOString()
      };

      const { projects } = getState().projects;
      const updated = projects.map(p => {
        if (p.id === projectId) {
          return {
            ...p,
            updates: [...p.updates, newUpdate],
            updatedAt: new Date().toISOString()
          };
        }
        return p;
      });

      localStorage.setItem('communityProjects', JSON.stringify(updated));
      showSuccessToast('Actualización agregada');

      return { projectId, update: newUpdate };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateProjectStatus = createAsyncThunk(
  'projects/updateProjectStatus',
  async ({ projectId, newStatus, user }, { getState, rejectWithValue }) => {
    try {
      if (!user) throw new Error('Usuario no autenticado');

      const { projects } = getState().projects;
      const project = projects.find(p => p.id === projectId);
      
      if (!project) throw new Error('Proyecto no encontrado');
      if (project.creatorId !== user.id) throw new Error('No autorizado');

      const updates = {
        status: newStatus,
        updatedAt: new Date().toISOString()
      };

      if (newStatus === 'completado') {
        updates.completionDate = new Date().toISOString();
      }

      const updated = projects.map(p => 
        p.id === projectId ? { ...p, ...updates } : p
      );

      localStorage.setItem('communityProjects', JSON.stringify(updated));
      return { projectId, updates };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const projectsSlice = createSlice({
  name: 'projects',
  initialState: {
    projects: [],
    loading: false,
    error: null
  },
  reducers: {
    clearProjectsError: (state) => {
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
      .addCase(createProject.fulfilled, (state, action) => {
        state.projects.push(action.payload);
      })

      // Vote Project
      .addCase(voteProject.fulfilled, (state, action) => {
        const { projectId, userId, isRemoving } = action.payload;
        const project = state.projects.find(p => p.id === projectId);
        if (project) {
          project.votes = isRemoving ? project.votes - 1 : project.votes + 1;
          project.voters = isRemoving
            ? project.voters.filter(id => id !== userId)
            : [...project.voters, userId];
        }
      })

      // Join as Volunteer
      .addCase(joinAsVolunteer.fulfilled, (state, action) => {
        const { projectId, userId, isLeaving } = action.payload;
        const project = state.projects.find(p => p.id === projectId);
        if (project) {
          project.volunteers = isLeaving
            ? project.volunteers.filter(v => v.id !== userId)
            : action.meta.arg.user 
              ? [...project.volunteers, {
                  id: action.meta.arg.user.id,
                  name: action.meta.arg.user.name,
                  avatar: action.meta.arg.user.avatar,
                  joinedAt: new Date().toISOString()
                }]
              : project.volunteers;
        }
      })

      // Add Project Update
      .addCase(addProjectUpdate.fulfilled, (state, action) => {
        const { projectId, update } = action.payload;
        const project = state.projects.find(p => p.id === projectId);
        if (project) {
          project.updates.push(update);
          project.updatedAt = new Date().toISOString();
        }
      })

      // Update Project Status
      .addCase(updateProjectStatus.fulfilled, (state, action) => {
        const { projectId, updates } = action.payload;
        const project = state.projects.find(p => p.id === projectId);
        if (project) {
          Object.assign(project, updates);
        }
      });
  }
});

export const { clearProjectsError } = projectsSlice.actions;
export default projectsSlice.reducer;
