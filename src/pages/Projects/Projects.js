import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../../context/ProjectsContext';
import { useHelpRequests } from '../../context/HelpRequestsContext';
import { useSharedResources } from '../../context/SharedResourcesContext';
import { useReduxAuth as useAuth } from '../../hooks/useReduxAuth';
import { useSidebar } from '../../context/SidebarContext';
import { useGamification } from '../../context/GamificationContext';
import { formatNumber } from '../../utils/formatNumber';
import AddIcon from '@mui/icons-material/Add';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ConstructionIcon from '@mui/icons-material/Construction';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import HandshakeIcon from '@mui/icons-material/Handshake';
import TheaterComedyIcon from '@mui/icons-material/TheaterComedy';
import SportsIcon from '@mui/icons-material/Sports';
import BarChartIcon from '@mui/icons-material/BarChart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LoopIcon from '@mui/icons-material/Loop';
import ShareIcon from '@mui/icons-material/Share';
import HelpRequests from '../HelpRequests/HelpRequests';
import SharedResources from '../SharedResources/SharedResources';
import './Projects.css';

const Projects = () => {
  const { user } = useAuth();
  const { isRightSidebarCollapsed } = useSidebar();
  const { projects, voteProject, joinAsVolunteer, createProject } = useProjects();
  const { addPoints, updateActivity } = useGamification();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('projects');
  const [filter, setFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    category: 'infraestructura',
    budget: 0,
    fundingGoal: 0
  });

  const categories = [
    { value: 'all', label: 'Todos', icon: <ListAltIcon /> },
    { value: 'infraestructura', label: 'Infraestructura', icon: <ConstructionIcon /> },
    { value: 'limpieza', label: 'Limpieza', icon: <CleaningServicesIcon /> },
    { value: 'social', label: 'Social', icon: <HandshakeIcon /> },
    { value: 'cultural', label: 'Cultural', icon: <TheaterComedyIcon /> },
    { value: 'deportivo', label: 'Deportivo', icon: <SportsIcon /> }
  ];

  const statusLabels = {
    propuesta: { label: 'Propuesta', color: '#3b82f6' },
    votacion: { label: 'En Votación', color: '#f59e0b' },
    aprobado: { label: 'Aprobado', color: '#10b981' },
    en_progreso: { label: 'En Progreso', color: '#8b5cf6' },
    completado: { label: 'Completado', color: '#059669' },
    cancelado: { label: 'Cancelado', color: '#ef4444' }
  };

  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(p => p.category === filter);

  const handleCreateProject = () => {
    if (!newProject.title || !newProject.description) return;

    const result = createProject(newProject);
    if (result.success) {
      addPoints('PROJECT_CREATED');
      updateActivity('projectsCreated');
      setShowCreateModal(false);
      setNewProject({
        title: '',
        description: '',
        category: 'infraestructura',
        budget: 0,
        fundingGoal: 0
      });
      navigate(`/proyecto/${result.project.slug}`);
    }
  };

  const handleVote = (projectId) => {
    voteProject(projectId);
    addPoints('PROJECT_VOTE');
    updateActivity('votesGiven');
  };

  const handleJoinVolunteer = (projectId) => {
    joinAsVolunteer(projectId);
    addPoints('HELP_OFFERED');
  };

  const getHeaderContent = () => {
    switch(activeTab) {
      case 'help':
        return {
          icon: <HandshakeIcon className="page-title-icon" />,
          title: 'Ayuda Mutua',
          subtitle: 'Red de apoyo entre vecinos - Juntos somos más fuertes',
          buttonText: 'Solicitar Ayuda'
        };
      case 'resources':
        return {
          icon: <ShareIcon className="page-title-icon" />,
          title: 'Recursos Compartidos',
          subtitle: 'Comparte y pide prestado entre vecinos - Economía colaborativa',
          buttonText: 'Agregar Recurso'
        };
      default:
        return {
          icon: <RocketLaunchIcon className="page-title-icon" />,
          title: 'Proyectos Vecinales',
          subtitle: 'Organiza, vota y completa proyectos que mejoren tu comunidad',
          buttonText: 'Crear Proyecto'
        };
    }
  };

  const headerContent = getHeaderContent();

  return (
    <div className={`projects-page ${isRightSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="projects-header">
        <div className="projects-title">
          <h1>{headerContent.icon} {headerContent.title}</h1>
          <p>{headerContent.subtitle}</p>
        </div>
        {activeTab === 'projects' && (
          <button className="create-project-btn" onClick={() => setShowCreateModal(true)}>
            <AddIcon /> {headerContent.buttonText}
          </button>
        )}
      </div>

      {/* Pestañas de Community */}
      <div className="community-tabs">
        <button 
          className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          <RocketLaunchIcon />
          Proyectos Comunitarios
        </button>
        <button 
          className={`tab-btn ${activeTab === 'help' ? 'active' : ''}`}
          onClick={() => setActiveTab('help')}
        >
          <HandshakeIcon />
          Ayuda Mutua
        </button>
        <button 
          className={`tab-btn ${activeTab === 'resources' ? 'active' : ''}`}
          onClick={() => setActiveTab('resources')}
        >
          <ShareIcon />
          Recursos Compartidos
        </button>
      </div>

      {activeTab === 'projects' && (
        <>
          <div className="projects-filters">
            {categories.map(cat => (
              <button
                key={cat.value}
                className={`filter-btn ${filter === cat.value ? 'active' : ''}`}
                onClick={() => setFilter(cat.value)}
              >
                <span className="filter-icon">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>

          <div className="projects-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <BarChartIcon style={{ fontSize: '28px', color: '#3b82f6' }} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{formatNumber(projects.length)}</span>
                <span className="stat-label">Proyectos Totales</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <CheckCircleIcon style={{ fontSize: '28px', color: '#10b981' }} />
              </div>
              <div className="stat-info">
                <span className="stat-value">
                  {formatNumber(projects.filter(p => p.status === 'completado').length)}
                </span>
                <span className="stat-label">Completados</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <LoopIcon style={{ fontSize: '28px', color: '#8b5cf6' }} />
              </div>
              <div className="stat-info">
                <span className="stat-value">
                  {formatNumber(projects.filter(p => p.status === 'en_progreso').length)}
                </span>
                <span className="stat-label">En Progreso</span>
              </div>
            </div>
          </div>

          <div className="projects-grid">
            {filteredProjects.map(project => (
              <div
                key={project.id}
                className="project-card"
                onClick={() => navigate(`/proyecto/${project.slug}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="project-header">
                  <div className="project-category">
                    {categories.find(c => c.value === project.category)?.icon}
                    {categories.find(c => c.value === project.category)?.label}
                  </div>
                  <div 
                    className="project-status"
                    style={{ backgroundColor: statusLabels[project.status].color }}
                  >
                    {statusLabels[project.status].label}
                  </div>
                </div>

                <h3 className="project-title">{project.title}</h3>
                <p className="project-description">{project.description}</p>

                <div className="project-meta">
                  <div className="meta-item">
                    <PeopleIcon fontSize="small" />
                    <span>{project.volunteers.length} voluntarios</span>
                  </div>
                  <div className="meta-item">
                    <ThumbUpIcon fontSize="small" />
                    <span>{formatNumber(project.votes)} votos</span>
                  </div>
                  {project.budget > 0 && (
                    <div className="meta-item">
                      <AttachMoneyIcon fontSize="small" />
                      <span>${formatNumber(project.budget)}</span>
                    </div>
                  )}
                </div>

                {project.fundingGoal > 0 && (
                  <div className="project-funding">
                    <div className="funding-bar">
                      <div 
                        className="funding-progress"
                        style={{ 
                          width: `${(project.currentFunding / project.fundingGoal) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="funding-text">
                      ${formatNumber(project.currentFunding)} / ${formatNumber(project.fundingGoal)}
                    </span>
                  </div>
                )}

                <div className="project-actions">
                  <button 
                    className={`vote-btn ${project.voters.includes(user?.id) ? 'voted' : ''}`}
                    onClick={() => handleVote(project.id)}
                  >
                    <ThumbUpIcon fontSize="small" />
                    {project.voters.includes(user?.id) ? 'Votado' : 'Votar'}
                  </button>
                  <button 
                    className={`volunteer-btn ${project.volunteers.some(v => v.id === user?.id) ? 'joined' : ''}`}
                    onClick={() => handleJoinVolunteer(project.id)}
                  >
                    <VolunteerActivismIcon fontSize="small" />
                    {project.volunteers.some(v => v.id === user?.id) ? 'Inscrito' : 'Ser Voluntario'}
                  </button>
                </div>

                <div className="project-footer">
                  <img src={project.creatorAvatar} alt={project.creatorName} />
                  <span>Por {project.creatorName}</span>
                  <span className="project-neighborhood">{project.neighborhoodName}</span>
                </div>
              </div>
            ))}
          </div>

          {showCreateModal && (
            <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Crear Nuevo Proyecto</h2>
                <div className="form-group">
                  <label>Título del Proyecto</label>
                  <input
                    type="text"
                    value={newProject.title}
                    onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                    placeholder="Ej: Arreglar Plaza Central"
                  />
                </div>
                <div className="form-group">
                  <label>Descripción</label>
                  <textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                    placeholder="Describe el proyecto y sus objetivos..."
                    rows="4"
                  />
                </div>
                <div className="form-group">
                  <label>Categoría</label>
                  <select
                    value={newProject.category}
                    onChange={(e) => setNewProject({...newProject, category: e.target.value})}
                  >
                    {categories.filter(c => c.value !== 'all').map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Presupuesto Estimado</label>
                    <input
                      type="number"
                      value={newProject.budget}
                      onChange={(e) => setNewProject({...newProject, budget: parseInt(e.target.value)})}
                      placeholder="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Meta de Financiamiento</label>
                    <input
                      type="number"
                      value={newProject.fundingGoal}
                      onChange={(e) => setNewProject({...newProject, fundingGoal: parseInt(e.target.value)})}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="modal-actions">
                  <button className="cancel-btn" onClick={() => setShowCreateModal(false)}>
                    Cancelar
                  </button>
                  <button className="submit-btn" onClick={handleCreateProject}>
                    Crear Proyecto
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'help' && <HelpRequests hideHeader={true} hideStats={true} />}
      {activeTab === 'resources' && <SharedResources hideHeader={true} hideStats={true} />}
    </div>
  );
};

export default Projects;
