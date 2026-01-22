import React, { useState } from 'react';
import { useSidebar } from '../../context/SidebarContext';
import { useProjects } from '../../context/ProjectsContext';
import { useAuth } from '../../context/AuthContext';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';
import './ModernProjects.css';

const ModernProjects = () => {
  const { isRightSidebarCollapsed } = useSidebar();
  const { projects, createProject } = useProjects();
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'infraestructura',
    startDate: '',
    budget: '',
    fundingGoal: ''
  });

  const handleCreateProject = () => {
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createProject(formData);
    setShowModal(false);
    setFormData({
      title: '',
      description: '',
      category: 'infraestructura',
      startDate: '',
      budget: '',
      fundingGoal: ''
    });
  };

  const filters = [
    { value: 'all', label: 'Todos' },
    { value: 'active', label: 'En Progreso' },
    { value: 'completed', label: 'Completados' }
  ];

  const categories = [
    { value: 'infraestructura', label: 'Infraestructura' },
    { value: 'limpieza', label: 'Limpieza' },
    { value: 'social', label: 'Social' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'deportivo', label: 'Deportivo' },
    { value: 'medio_ambiente', label: 'Medio Ambiente' }
  ];

  const filteredProjects = projects.filter(project => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'active') return project.status === 'en_progreso' || project.status === 'aprobado';
    if (selectedFilter === 'completed') return project.status === 'completado';
    return true;
  });

  return (
    <div className={`modern-projects ${isRightSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="projects-controls">
        <div className="controls-header">
          <div className="filter-pills">
            {filters.map(filter => (
              <button
                key={filter.value}
                className={`filter-pill ${selectedFilter === filter.value ? 'active' : ''}`}
                onClick={() => setSelectedFilter(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <button className="btn-create" onClick={handleCreateProject}>
            + Nuevo Proyecto
          </button>
        </div>
      </div>

      <div className="projects-grid">
        {filteredProjects.map(project => {
          // Calculate progress based on status
          let progress = 0;
          if (project.status === 'propuesta') progress = 10;
          else if (project.status === 'votacion') progress = 25;
          else if (project.status === 'aprobado') progress = 40;
          else if (project.status === 'en_progreso') progress = 65;
          else if (project.status === 'completado') progress = 100;

          return (
            <div key={project.id} className="project-card-modern">
              <div className="project-header">
                <div className="project-icon">
                  <AccountTreeIcon />
                </div>
                <span className="project-category">
                  {categories.find(c => c.value === project.category)?.label || project.category}
                </span>
              </div>

              <h3 className="project-title">{project.title}</h3>
              <p className="project-description">{project.description}</p>

              <div className="project-progress">
                <div className="progress-header">
                  <span className="progress-label">Progreso</span>
                  <span className="progress-value">{progress}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="project-footer">
                <div className="project-stat">
                  <PeopleIcon />
                  <span>{project.volunteers?.length || 0} participantes</span>
                </div>
                <div className="project-stat">
                  <CalendarTodayIcon />
                  <span>{project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Por definir'}</span>
                </div>
              </div>

              <button className="btn-join">
                {project.status === 'completado' ? 'Ver Detalles' : 'Unirse al Proyecto'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Modal para crear proyecto */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Crear Nuevo Proyecto</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <CloseIcon />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Título del Proyecto *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej: Mejora de Áreas Verdes"
                  required
                />
              </div>

              <div className="form-group">
                <label>Descripción *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe el proyecto y sus objetivos..."
                  rows="4"
                  required
                />
              </div>

              <div className="form-group">
                <label>Categoría *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Fecha de Inicio</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="form-group">
                  <label>Presupuesto Estimado</label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Meta de Financiamiento</label>
                <input
                  type="number"
                  value={formData.fundingGoal}
                  onChange={(e) => setFormData({ ...formData, fundingGoal: e.target.value })}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit">
                  Crear Proyecto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernProjects;
