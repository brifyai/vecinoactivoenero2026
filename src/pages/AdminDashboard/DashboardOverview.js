/**
 * Dashboard Overview - Panel Principal Administrativo
 * Vista principal con métricas, estadísticas y accesos rápidos
 */
import React, { useEffect, useState } from 'react';
import { useReduxAdmin } from '../../hooks/useReduxAdmin';
import { useReduxTickets } from '../../hooks/useReduxTickets';
import { useReduxCampaigns } from '../../hooks/useReduxCampaigns';
import { useReduxPosts } from '../../hooks/useReduxPosts';

// Material UI Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import CampaignIcon from '@mui/icons-material/Campaign';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ScheduleIcon from '@mui/icons-material/Schedule';
import DraftsIcon from '@mui/icons-material/Drafts';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import RefreshIcon from '@mui/icons-material/Refresh';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ImageIcon from '@mui/icons-material/Image';

import './DashboardOverview.css';

const DashboardOverview = () => {
  console.log('🏠 DashboardOverview component MONTADO');
  
  const {
    currentNeighborhood,
    dashboardStats,
    statsLoading,
    fetchDashboardStats,
    getCurrentNeighborhoodId,
    getCurrentNeighborhoodName,
    getTotalTickets,
    getPendingTickets,
    getResolvedTickets,
    getUrgentTickets,
    getTotalCampaigns,
    getSentCampaigns,
    getScheduledCampaigns,
    getTotalUsers,
    getVerifiedUsers
  } = useReduxAdmin();

  const {
    tickets,
    fetchTickets,
    getTicketStats
  } = useReduxTickets();

  const {
    campaigns,
    fetchCampaigns,
    getCampaignMetrics
  } = useReduxCampaigns();

  const {
    posts,
    loading: postsLoading,
    refresh: refreshPosts
  } = useReduxPosts();
  
  // DEBUG: Log posts data
  useEffect(() => {
    if (posts && posts.length > 0) {
      console.log('🟢 DASHBOARD - Total posts:', posts.length);
      console.log('🟢 DASHBOARD - Primeros 3 posts:', posts.slice(0, 3).map(p => ({
        id: p.id,
        content: p.content?.substring(0, 40),
        media: p.media,
        mediaType: typeof p.media,
        mediaIsArray: Array.isArray(p.media),
        mediaLength: p.media?.length,
        hasMedia: !!p.media && p.media?.length > 0,
        allKeys: Object.keys(p)
      })));
    }
  }, [posts]);

  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Cargar datos iniciales
  useEffect(() => {
    const neighborhoodId = getCurrentNeighborhoodId();
    if (neighborhoodId) {
      loadDashboardData(neighborhoodId);
    }
  }, [currentNeighborhood]);

  const loadDashboardData = async (neighborhoodId) => {
    console.log('📊 Cargando datos del dashboard para:', neighborhoodId);
    
    try {
      // Cargar estadísticas generales
      await fetchDashboardStats(neighborhoodId);
      
      // Cargar tickets recientes
      await fetchTickets({ neighborhood_id: neighborhoodId, limit: 10 });
      
      // Cargar campañas recientes
      await fetchCampaigns({ neighborhood_id: neighborhoodId, limit: 10 });
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('❌ Error cargando datos del dashboard:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    const neighborhoodId = getCurrentNeighborhoodId();
    if (neighborhoodId) {
      await loadDashboardData(neighborhoodId);
    }
    // Forzar recarga de posts
    if (refreshPosts) {
      refreshPosts();
    }
    setRefreshing(false);
  };

  // Calcular métricas locales
  const ticketStats = getTicketStats();
  const campaignMetrics = getCampaignMetrics();

  // Datos para las tarjetas de métricas
  const metricsCards = [
    {
      title: 'Total Tickets',
      value: getTotalTickets(),
      icon: ConfirmationNumberIcon,
      color: '#667eea',
      trend: ticketStats.total > 0 ? '+12%' : '0%',
      trendUp: true,
      subtitle: `${getPendingTickets()} pendientes`
    },
    {
      title: 'Campañas Enviadas',
      value: getSentCampaigns(),
      icon: CampaignIcon,
      color: '#f093fb',
      trend: campaignMetrics.sent > 0 ? '+8%' : '0%',
      trendUp: true,
      subtitle: `${getScheduledCampaigns()} programadas`
    },
    {
      title: 'Usuarios Activos',
      value: getTotalUsers(),
      icon: PeopleIcon,
      color: '#4facfe',
      trend: getTotalUsers() > 0 ? '+5%' : '0%',
      trendUp: true,
      subtitle: `${getVerifiedUsers()} verificados`
    },
    {
      title: 'Tasa Resolución',
      value: ticketStats.completion_rate || 0,
      icon: CheckCircleIcon,
      color: '#43e97b',
      trend: ticketStats.completion_rate > 70 ? '+3%' : '-2%',
      trendUp: ticketStats.completion_rate > 70,
      subtitle: 'Últimos 30 días',
      isPercentage: true
    }
  ];

  return (
    <div className="dashboard-overview">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-info">
            <DashboardIcon className="header-icon" />
            <div>
              <h1>Dashboard Administrativo</h1>
              <p>Unidad Vecinal: {getCurrentNeighborhoodName()}</p>
            </div>
          </div>
          <div className="header-actions">
            <div className="last-updated">
              Actualizado: {lastUpdated.toLocaleTimeString()}
            </div>
            <button 
              className={`refresh-btn ${refreshing ? 'refreshing' : ''}`}
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshIcon />
              {refreshing ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="metrics-grid">
        {metricsCards.map((metric, index) => (
          <div key={index} className="metric-card">
            <div className="metric-header">
              <div className="metric-icon" style={{ backgroundColor: metric.color }}>
                <metric.icon />
              </div>
              <div className="metric-menu">
                <MoreVertIcon />
              </div>
            </div>
            <div className="metric-content">
              <div className="metric-value">
                {metric.isPercentage ? `${metric.value}%` : metric.value.toLocaleString()}
              </div>
              <div className="metric-title">{metric.title}</div>
              <div className="metric-footer">
                <div className="metric-subtitle">{metric.subtitle}</div>
                <div className={`metric-trend ${metric.trendUp ? 'up' : 'down'}`}>
                  {metric.trendUp ? <TrendingUpIcon /> : <TrendingDownIcon />}
                  {metric.trend}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Contenido principal */}
      <div className="dashboard-content">
        {/* Columna izquierda */}
        <div className="content-left">
          {/* Tickets recientes */}
          <div className="dashboard-widget">
            <div className="widget-header">
              <h3>Tickets Recientes</h3>
              <button className="widget-action">Ver todos</button>
            </div>
            <div className="widget-content">
              {statsLoading ? (
                <div className="widget-loading">
                  <div className="loading-spinner"></div>
                  <span>Cargando tickets...</span>
                </div>
              ) : tickets.length > 0 ? (
                <div className="tickets-list">
                  {tickets.slice(0, 5).map((ticket) => (
                    <div key={ticket.id} className="ticket-item">
                      <div className="ticket-info">
                        <div className="ticket-title">{ticket.title}</div>
                        <div className="ticket-meta">
                          <span className={`ticket-priority ${ticket.priority}`}>
                            {ticket.priority === 'urgent' && <WarningIcon />}
                            {ticket.priority}
                          </span>
                          <span className={`ticket-status ${ticket.status}`}>
                            {ticket.status === 'pending' && <PendingIcon />}
                            {ticket.status === 'resolved' && <CheckCircleIcon />}
                            {ticket.status}
                          </span>
                        </div>
                      </div>
                      <div className="ticket-date">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="widget-empty">
                  <ConfirmationNumberIcon />
                  <span>No hay tickets recientes</span>
                </div>
              )}
            </div>
          </div>

          {/* Estadísticas de tickets */}
          <div className="dashboard-widget">
            <div className="widget-header">
              <h3>Estado de Tickets</h3>
            </div>
            <div className="widget-content">
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-icon pending">
                    <PendingIcon />
                  </div>
                  <div className="stat-info">
                    <div className="stat-value">{getPendingTickets()}</div>
                    <div className="stat-label">Pendientes</div>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon progress">
                    <PlayArrowIcon />
                  </div>
                  <div className="stat-info">
                    <div className="stat-value">{dashboardStats.tickets.in_progress}</div>
                    <div className="stat-label">En Progreso</div>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon resolved">
                    <CheckCircleIcon />
                  </div>
                  <div className="stat-info">
                    <div className="stat-value">{getResolvedTickets()}</div>
                    <div className="stat-label">Resueltos</div>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon urgent">
                    <WarningIcon />
                  </div>
                  <div className="stat-info">
                    <div className="stat-value">{getUrgentTickets()}</div>
                    <div className="stat-label">Urgentes</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha */}
        <div className="content-right">
          {/* Campañas recientes */}
          <div className="dashboard-widget">
            <div className="widget-header">
              <h3>Campañas Recientes</h3>
              <button className="widget-action">Ver todas</button>
            </div>
            <div className="widget-content">
              {campaigns.length > 0 ? (
                <div className="campaigns-list">
                  {campaigns.slice(0, 5).map((campaign) => (
                    <div key={campaign.id} className="campaign-item">
                      <div className="campaign-info">
                        <div className="campaign-title">{campaign.name}</div>
                        <div className="campaign-meta">
                          <span className={`campaign-status ${campaign.status}`}>
                            {campaign.status === 'draft' && <DraftsIcon />}
                            {campaign.status === 'scheduled' && <ScheduleIcon />}
                            {campaign.status === 'sent' && <CheckCircleIcon />}
                            {campaign.status}
                          </span>
                          <span className="campaign-type">{campaign.campaign_type}</span>
                        </div>
                      </div>
                      <div className="campaign-stats">
                        {campaign.total_sent > 0 && (
                          <div className="campaign-stat">
                            <span>{campaign.total_sent}</span>
                            <small>enviados</small>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="widget-empty">
                  <CampaignIcon />
                  <span>No hay campañas recientes</span>
                </div>
              )}
            </div>
          </div>

          {/* Estadísticas de usuarios */}
          <div className="dashboard-widget">
            <div className="widget-header">
              <h3>Usuarios del Vecindario</h3>
            </div>
            <div className="widget-content">
              <div className="user-stats">
                <div className="user-stat-item">
                  <div className="user-stat-icon">
                    <PeopleIcon />
                  </div>
                  <div className="user-stat-info">
                    <div className="user-stat-value">{getTotalUsers()}</div>
                    <div className="user-stat-label">Total Usuarios</div>
                  </div>
                </div>
                <div className="user-stat-item">
                  <div className="user-stat-icon verified">
                    <VerifiedUserIcon />
                  </div>
                  <div className="user-stat-info">
                    <div className="user-stat-value">{getVerifiedUsers()}</div>
                    <div className="user-stat-label">Verificados</div>
                    <div className="user-stat-percentage">
                      {getTotalUsers() > 0 ? Math.round((getVerifiedUsers() / getTotalUsers()) * 100) : 0}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="dashboard-widget">
            <div className="widget-header">
              <h3>Acciones Rápidas</h3>
            </div>
            <div className="widget-content">
              <div className="quick-actions">
                <button className="quick-action-btn">
                  <ConfirmationNumberIcon />
                  <span>Crear Ticket</span>
                </button>
                <button className="quick-action-btn">
                  <CampaignIcon />
                  <span>Nueva Campaña</span>
                </button>
                <button className="quick-action-btn">
                  <PeopleIcon />
                  <span>Gestionar Usuarios</span>
                </button>
                <button className="quick-action-btn">
                  <TrendingUpIcon />
                  <span>Ver Reportes</span>
                </button>
              </div>
            </div>
          </div>

          {/* Línea de Tiempo - Posts Recientes */}
          <div className="dashboard-widget">
            <div className="widget-header">
              <h3><AccessTimeIcon /> Línea de Tiempo</h3>
              <button className="widget-action">Ver todos</button>
            </div>
            <div className="widget-content">
              {postsLoading ? (
                <div className="widget-loading">
                  <div className="loading-spinner"></div>
                  <span>Cargando posts...</span>
                </div>
              ) : posts.length > 0 ? (
                <div className="timeline-posts">
                  {(() => {
                    console.log('🎯 DASHBOARD RENDER - Total posts:', posts.length);
                    if (posts.length > 0) {
                      console.log('🎯 DASHBOARD RENDER - Primer post:', {
                        id: posts[0].id,
                        content: posts[0].content?.substring(0, 40),
                        media: posts[0].media,
                        mediaType: typeof posts[0].media,
                        mediaIsArray: Array.isArray(posts[0].media),
                        mediaLength: posts[0].media?.length,
                        allKeys: Object.keys(posts[0])
                      });
                    }
                    return null;
                  })()}
                  {posts.slice(0, 5).map((post) => (
                    <div key={post.id} className="timeline-post-item">
                      <div className="post-author">
                        <img 
                          src={post.author?.avatar || '/default-avatar.png'} 
                          alt={post.author?.name || 'Usuario'} 
                          className="post-avatar"
                        />
                        <div className="post-author-info">
                          <div className="post-author-name">{post.author?.name || 'Usuario'}</div>
                          <div className="post-date">
                            {new Date(post.created_at).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="post-content-preview">
                        {post.content?.substring(0, 150)}
                        {post.content?.length > 150 && '...'}
                      </div>
                      {post.media && post.media.length > 0 && (
                        <div className="post-media-preview">
                          {post.media.length === 1 ? (
                            <img src={post.media[0]} alt="Post" className="post-single-image" />
                          ) : (
                            <div className="post-media-grid">
                              {post.media.slice(0, 3).map((imageUrl, index) => (
                                <img 
                                  key={index} 
                                  src={imageUrl} 
                                  alt={`Post imagen ${index + 1}`} 
                                  className="post-grid-image"
                                />
                              ))}
                              {post.media.length > 3 && (
                                <div className="post-media-more">
                                  <ImageIcon />
                                  <span>+{post.media.length - 3}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      <div className="post-stats">
                        <span>{post.likes || 0} reacciones</span>
                        <span>{post.comments || 0} comentarios</span>
                        <span>{post.shares || 0} compartidos</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="widget-empty">
                  <AccessTimeIcon />
                  <span>No hay posts recientes</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;