/**
 * Analytics - Analíticas y Reportes Administrativos
 * Página completa para visualizar métricas y generar reportes
 */
import React, { useEffect, useState } from 'react';
import { useReduxAdmin } from '../../hooks/useReduxAdmin';
import { useReduxTickets } from '../../hooks/useReduxTickets';
import { useReduxCampaigns } from '../../hooks/useReduxCampaigns';

// Material UI Icons
import AnalyticsIcon from '@mui/icons-material/Analytics';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import DownloadIcon from '@mui/icons-material/Download';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FilterListIcon from '@mui/icons-material/FilterList';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import CampaignIcon from '@mui/icons-material/Campaign';
import PeopleIcon from '@mui/icons-material/People';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EmailIcon from '@mui/icons-material/Email';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import RefreshIcon from '@mui/icons-material/Refresh';

import './Analytics.css';

const Analytics = () => {
  console.log('📊 Analytics component loading');

  const {
    dashboardStats,
    statsLoading,
    fetchDashboardStats,
    getCurrentNeighborhoodId,
    getCurrentNeighborhoodName,
    canViewAnalytics
  } = useReduxAdmin();

  const {
    getTicketStats
  } = useReduxTickets();

  const {
    getCampaignMetrics
  } = useReduxCampaigns();

  const [dateRange, setDateRange] = useState('30'); // días
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('overview');

  // Cargar datos al montar el componente
  useEffect(() => {
    const neighborhoodId = getCurrentNeighborhoodId();
    if (neighborhoodId && canViewAnalytics()) {
      loadAnalytics(neighborhoodId);
    }
  }, [dateRange]);

  const loadAnalytics = async (neighborhoodId) => {
    console.log('📊 Cargando analíticas para:', neighborhoodId);
    await fetchDashboardStats(neighborhoodId);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    const neighborhoodId = getCurrentNeighborhoodId();
    if (neighborhoodId) {
      await loadAnalytics(neighborhoodId);
    }
    setRefreshing(false);
  };

  const handleExportReport = (type) => {
    console.log('📄 Exportando reporte:', type);
    // Implementar exportación de reportes
  };

  const ticketStats = getTicketStats();
  const campaignMetrics = getCampaignMetrics();

  // Datos simulados para gráficos (en implementación real vendrían del backend)
  const chartData = {
    ticketsOverTime: [
      { date: '2024-01-01', pending: 5, resolved: 8 },
      { date: '2024-01-02', pending: 3, resolved: 12 },
      { date: '2024-01-03', pending: 7, resolved: 6 },
      { date: '2024-01-04', pending: 2, resolved: 15 },
      { date: '2024-01-05', pending: 4, resolved: 9 }
    ],
    campaignPerformance: [
      { type: 'Email', sent: 150, opened: 120, clicked: 45 },
      { type: 'Push', sent: 200, opened: 180, clicked: 60 },
      { type: 'WhatsApp', sent: 80, opened: 75, clicked: 25 }
    ],
    userActivity: [
      { hour: '00:00', active: 5 },
      { hour: '06:00', active: 15 },
      { hour: '12:00', active: 45 },
      { hour: '18:00', active: 35 },
      { hour: '23:00', active: 10 }
    ]
  };

  if (!canViewAnalytics()) {
    return (
      <div className="analytics">
        <div className="access-denied">
          <AnalyticsIcon />
          <h2>Acceso Denegado</h2>
          <p>No tienes permisos para ver analíticas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics">
      {/* Header */}
      <div className="analytics-header">
        <div className="header-info">
          <AnalyticsIcon className="header-icon" />
          <div>
            <h1>Analíticas y Reportes</h1>
            <p>{getCurrentNeighborhoodName()} • Últimos {dateRange} días</p>
          </div>
        </div>
        <div className="header-actions">
          <div className="date-selector">
            <CalendarTodayIcon />
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="7">Últimos 7 días</option>
              <option value="30">Últimos 30 días</option>
              <option value="90">Últimos 90 días</option>
              <option value="365">Último año</option>
            </select>
          </div>
          <button 
            className={`refresh-btn ${refreshing ? 'refreshing' : ''}`}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshIcon />
            {refreshing ? 'Actualizando...' : 'Actualizar'}
          </button>
          <button className="export-btn" onClick={() => handleExportReport('general')}>
            <DownloadIcon />
            Exportar
          </button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="analytics-metrics">
        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon tickets">
              <ConfirmationNumberIcon />
            </div>
            <div className="metric-trend up">
              <TrendingUpIcon />
              +12%
            </div>
          </div>
          <div className="metric-content">
            <div className="metric-value">{ticketStats.total}</div>
            <div className="metric-label">Total Tickets</div>
            <div className="metric-breakdown">
              <span className="breakdown-item pending">
                {ticketStats.pending} pendientes
              </span>
              <span className="breakdown-item resolved">
                {ticketStats.resolved} resueltos
              </span>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon campaigns">
              <CampaignIcon />
            </div>
            <div className="metric-trend up">
              <TrendingUpIcon />
              +8%
            </div>
          </div>
          <div className="metric-content">
            <div className="metric-value">{campaignMetrics.sent}</div>
            <div className="metric-label">Campañas Enviadas</div>
            <div className="metric-breakdown">
              <span className="breakdown-item">
                {campaignMetrics.openRate}% tasa apertura
              </span>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon users">
              <PeopleIcon />
            </div>
            <div className="metric-trend up">
              <TrendingUpIcon />
              +5%
            </div>
          </div>
          <div className="metric-content">
            <div className="metric-value">{dashboardStats.users?.total || 0}</div>
            <div className="metric-label">Usuarios Activos</div>
            <div className="metric-breakdown">
              <span className="breakdown-item">
                {dashboardStats.users?.verified || 0} verificados
              </span>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon engagement">
              <VisibilityIcon />
            </div>
            <div className="metric-trend down">
              <TrendingDownIcon />
              -2%
            </div>
          </div>
          <div className="metric-content">
            <div className="metric-value">87%</div>
            <div className="metric-label">Engagement</div>
            <div className="metric-breakdown">
              <span className="breakdown-item">
                Promedio semanal
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navegación de secciones */}
      <div className="analytics-nav">
        <button 
          className={`nav-btn ${selectedMetric === 'overview' ? 'active' : ''}`}
          onClick={() => setSelectedMetric('overview')}
        >
          Resumen General
        </button>
        <button 
          className={`nav-btn ${selectedMetric === 'tickets' ? 'active' : ''}`}
          onClick={() => setSelectedMetric('tickets')}
        >
          Análisis de Tickets
        </button>
        <button 
          className={`nav-btn ${selectedMetric === 'campaigns' ? 'active' : ''}`}
          onClick={() => setSelectedMetric('campaigns')}
        >
          Rendimiento Campañas
        </button>
        <button 
          className={`nav-btn ${selectedMetric === 'users' ? 'active' : ''}`}
          onClick={() => setSelectedMetric('users')}
        >
          Actividad Usuarios
        </button>
      </div>

      {/* Contenido de analíticas */}
      <div className="analytics-content">
        {statsLoading ? (
          <div className="analytics-loading">
            <div className="loading-spinner"></div>
            <span>Cargando analíticas...</span>
          </div>
        ) : (
          <>
            {selectedMetric === 'overview' && (
              <div className="overview-section">
                <div className="charts-grid">
                  <div className="chart-card">
                    <div className="chart-header">
                      <h3>Tickets por Día</h3>
                      <button className="chart-export" onClick={() => handleExportReport('tickets')}>
                        <DownloadIcon />
                      </button>
                    </div>
                    <div className="chart-placeholder">
                      <div className="chart-mock">
                        <div className="chart-bars">
                          {chartData.ticketsOverTime.map((day, index) => (
                            <div key={index} className="bar-group">
                              <div 
                                className="bar pending" 
                                style={{ height: `${day.pending * 10}px` }}
                              ></div>
                              <div 
                                className="bar resolved" 
                                style={{ height: `${day.resolved * 8}px` }}
                              ></div>
                            </div>
                          ))}
                        </div>
                        <div className="chart-legend">
                          <span className="legend-item pending">Pendientes</span>
                          <span className="legend-item resolved">Resueltos</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="chart-card">
                    <div className="chart-header">
                      <h3>Rendimiento de Campañas</h3>
                      <button className="chart-export" onClick={() => handleExportReport('campaigns')}>
                        <DownloadIcon />
                      </button>
                    </div>
                    <div className="chart-placeholder">
                      <div className="performance-stats">
                        {chartData.campaignPerformance.map((campaign, index) => (
                          <div key={index} className="performance-item">
                            <div className="performance-type">
                              {campaign.type === 'Email' && <EmailIcon />}
                              {campaign.type === 'Push' && <NotificationsIcon />}
                              {campaign.type === 'WhatsApp' && <CampaignIcon />}
                              <span>{campaign.type}</span>
                            </div>
                            <div className="performance-metrics">
                              <div className="metric">
                                <span className="metric-value">{campaign.sent}</span>
                                <span className="metric-label">Enviados</span>
                              </div>
                              <div className="metric">
                                <span className="metric-value">{campaign.opened}</span>
                                <span className="metric-label">Abiertos</span>
                              </div>
                              <div className="metric">
                                <span className="metric-value">{campaign.clicked}</span>
                                <span className="metric-label">Clicks</span>
                              </div>
                            </div>
                            <div className="performance-rate">
                              {Math.round((campaign.opened / campaign.sent) * 100)}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="summary-cards">
                  <div className="summary-card">
                    <div className="summary-icon">
                      <CheckCircleIcon />
                    </div>
                    <div className="summary-content">
                      <h4>Tasa de Resolución</h4>
                      <div className="summary-value">{ticketStats.completion_rate}%</div>
                      <p>Tickets resueltos en promedio</p>
                    </div>
                  </div>

                  <div className="summary-card">
                    <div className="summary-icon">
                      <PendingIcon />
                    </div>
                    <div className="summary-content">
                      <h4>Tiempo Promedio</h4>
                      <div className="summary-value">2.5 días</div>
                      <p>Para resolver tickets</p>
                    </div>
                  </div>

                  <div className="summary-card">
                    <div className="summary-icon">
                      <TrendingUpIcon />
                    </div>
                    <div className="summary-content">
                      <h4>Satisfacción</h4>
                      <div className="summary-value">4.2/5</div>
                      <p>Calificación promedio</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedMetric === 'tickets' && (
              <div className="tickets-analytics">
                <div className="analytics-placeholder">
                  <ConfirmationNumberIcon />
                  <h3>Análisis Detallado de Tickets</h3>
                  <p>Gráficos de tendencias, categorías más comunes, tiempos de resolución, etc.</p>
                  <div className="placeholder-note">En desarrollo</div>
                </div>
              </div>
            )}

            {selectedMetric === 'campaigns' && (
              <div className="campaigns-analytics">
                <div className="analytics-placeholder">
                  <CampaignIcon />
                  <h3>Análisis de Rendimiento de Campañas</h3>
                  <p>Métricas de apertura, clicks, conversiones, mejores horarios, etc.</p>
                  <div className="placeholder-note">En desarrollo</div>
                </div>
              </div>
            )}

            {selectedMetric === 'users' && (
              <div className="users-analytics">
                <div className="analytics-placeholder">
                  <PeopleIcon />
                  <h3>Análisis de Actividad de Usuarios</h3>
                  <p>Patrones de uso, horarios pico, engagement, retención, etc.</p>
                  <div className="placeholder-note">En desarrollo</div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;