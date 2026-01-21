import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationsContext';
import { showSuccessToast } from '../utils/sweetalert';

const ProjectsContext = createContext();

export const useProjects = () => {
  const context = useContext(ProjectsContext);
  if (!context) {
    throw new Error('useProjects must be used within ProjectsProvider');
  }
  return context;
};

export const ProjectsProvider = ({ children }) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    const stored = localStorage.getItem('communityProjects');
    if (stored) {
      setProjects(JSON.parse(stored));
    }
    setLoading(false);
  };

  const saveProjects = (updatedProjects) => {
    localStorage.setItem('communityProjects', JSON.stringify(updatedProjects));
    setProjects(updatedProjects);
  };

  // Generar slug único
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

  // Crear proyecto
  const createProject = (projectData) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    const existingSlugs = projects.map(p => p.slug);
    const slug = generateSlug(projectData.title, existingSlugs);

    const newProject = {
      id: Date.now(),
      slug: slug,
      title: projectData.title,
      description: projectData.description,
      category: projectData.category, // infraestructura, limpieza, social, cultural, deportivo
      status: 'propuesta', // propuesta, votacion, aprobado, en_progreso, completado, cancelado
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
      priority: 'media', // baja, media, alta, urgente
      tags: projectData.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updated = [...projects, newProject];
    saveProjects(updated);
    showSuccessToast('¡Proyecto creado exitosamente!');
    
    return { success: true, project: newProject };
  };

  // Votar por proyecto
  const voteProject = (projectId) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    const updated = projects.map(project => {
      if (project.id === projectId) {
        if (project.voters.includes(user.id)) {
          return {
            ...project,
            votes: project.votes - 1,
            voters: project.voters.filter(id => id !== user.id)
          };
        } else {
          // Notificar al creador
          if (project.creatorId !== user.id) {
            addNotification(project.creatorId, {
              type: 'project_vote',
              from: user.id,
              fromName: user.name,
              fromAvatar: user.avatar,
              projectId: projectId,
              message: `${user.name} votó por tu proyecto "${project.title}"`,
              read: false
            });
          }
          
          return {
            ...project,
            votes: project.votes + 1,
            voters: [...project.voters, user.id]
          };
        }
      }
      return project;
    });

    saveProjects(updated);
    return { success: true };
  };

  // Unirse como voluntario
  const joinAsVolunteer = (projectId) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    const updated = projects.map(project => {
      if (project.id === projectId) {
        const isVolunteer = project.volunteers.some(v => v.id === user.id);
        
        if (isVolunteer) {
          return {
            ...project,
            volunteers: project.volunteers.filter(v => v.id !== user.id)
          };
        } else {
          // Notificar al creador
          if (project.creatorId !== user.id) {
            addNotification(project.creatorId, {
              type: 'project_volunteer',
              from: user.id,
              fromName: user.name,
              fromAvatar: user.avatar,
              projectId: projectId,
              message: `${user.name} se unió como voluntario a "${project.title}"`,
              read: false
            });
          }
          
          return {
            ...project,
            volunteers: [...project.volunteers, {
              id: user.id,
              name: user.name,
              avatar: user.avatar,
              joinedAt: new Date().toISOString()
            }]
          };
        }
      }
      return project;
    });

    saveProjects(updated);
    showSuccessToast('¡Te uniste como voluntario!');
    return { success: true };
  };

  // Agregar actualización al proyecto
  const addProjectUpdate = (projectId, updateData) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    const updated = projects.map(project => {
      if (project.id === projectId) {
        const newUpdate = {
          id: Date.now(),
          authorId: user.id,
          authorName: user.name,
          authorAvatar: user.avatar,
          content: updateData.content,
          images: updateData.images || [],
          createdAt: new Date().toISOString()
        };

        return {
          ...project,
          updates: [...project.updates, newUpdate],
          updatedAt: new Date().toISOString()
        };
      }
      return project;
    });

    saveProjects(updated);
    showSuccessToast('Actualización agregada');
    return { success: true };
  };

  // Cambiar estado del proyecto
  const updateProjectStatus = (projectId, newStatus) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    const updated = projects.map(project => {
      if (project.id === projectId && project.creatorId === user.id) {
        const updates = {
          status: newStatus,
          updatedAt: new Date().toISOString()
        };

        if (newStatus === 'completado') {
          updates.completionDate = new Date().toISOString();
        }

        return { ...project, ...updates };
      }
      return project;
    });

    saveProjects(updated);
    return { success: true };
  };

  // Filtrar proyectos
  const getProjectsByNeighborhood = (neighborhoodId) => {
    return projects.filter(p => p.neighborhoodId === neighborhoodId);
  };

  const getProjectsByStatus = (status) => {
    return projects.filter(p => p.status === status);
  };

  const getProjectsByCategory = (category) => {
    return projects.filter(p => p.category === category);
  };

  const value = {
    projects,
    loading,
    createProject,
    voteProject,
    joinAsVolunteer,
    addProjectUpdate,
    updateProjectStatus,
    getProjectsByNeighborhood,
    getProjectsByStatus,
    getProjectsByCategory,
    refreshProjects: loadProjects
  };

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
};
