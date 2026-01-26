/**
 * Tickets Management - Gestión de Tickets Administrativos
 * Página completa para administrar tickets del vecindario
 */
import React, { useEffect, useState } from 'react';
import { useReduxTickets } from '../../hooks/useReduxTickets';
import { useReduxAdmin } from '../../hooks/useReduxAdmin';
import CreateTicketModal from '../../components/AdminDashboard/CreateTicketModal';

// Material UI Icons
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CategoryIcon from '@mui/icons-material/Category';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';

import './TicketsManagement.css';

const TicketsManagement = () => {
  console.log('🎫 TicketsManagement component loading');

  const {
    tickets,
    loading,
    error,
    filters,
    searchTerm,
    fetchTickets,
    createTicket,
    search,
    setFilters,
    setSearchTerm,
    updateStatus,
    assignTicket,
    getFilteredTickets,
    getTicketStats
  } = useReduxTickets();

  const {
    getCurrentNeighborhoodId,
    getCurrentNeighborhoodName,
    canManageTickets
  } = useReduxAdmin();

  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // list, grid, kanban
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Cargar tickets al montar el componente
  useEffect(() => {
    const neighborhoodId = getCurrentNeighborhoodId();
    if (neighborhoodId && canManageTickets()) {
      loadTickets(neighborhoodId);
    }
  }, []);

  const loadTickets = async (neighborhoodId) => {
    console.log('📊 Cargando tickets para:', neighborhoodId);
    await fetchTickets({ neighborhood_id: neighborhoodId });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchTerm(searchInput);
      await search(searchInput, filters);
    }
  };

  const handleFilterChange = (filterKey, value) => {
    const newFilters = { ...filters, [filterKey]: value };
    setFilters(newFilters);
  };

  const handleStatusUpdate = async (ticketId, newStatus) => {
    const result = await updateStatus(ticketId, newStatus, 'current-admin-id');
    if (result.success) {
      console.log('✅ Estado actualizado correctamente');
    }
  };

  const handleAssignTicket = async (ticketId, assignedTo) => {
    const result = await assignTicket(ticketId, assignedTo, 'current-admin-id');
    if (result.success) {
      console.log('✅ Ticket asignado correctamente');
    }
  };

  const toggleTicketSelection = (ticketId) => {
    setSelectedTickets(prev => 
      prev.includes(ticketId) 
        ? prev.filter(id => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  const handleCreateTicket = () => {
    console.log('📝 Abriendo modal para crear ticket');
    setShowCreateModal(true);
  };

  const handleSubmitTicket = async (ticketData) => {
    console.log('📤 Creando ticket:', ticketData);
    
    try {
      const result = await createTicket(ticketData);
      
      if (result.success) {
        alert(`✅ Ticket "${ticketData.title}" creado exitosamente`);
        
        // Recargar tickets
        const neighborhoodId = getCurrentNeighborhoodId();
        if (neighborhoodId) {
          await loadTickets(neighborhoodId);
        }
      } else {
        alert(`❌ Error al crear ticket: ${result.error}`);
      }
    } catch (error) {
      console.error('Error creando ticket:', error);
      alert('❌ Error al crear el ticket. Por favor intenta de nuevo.');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <PendingIcon />;
      case 'in_progress': return <PlayArrowIcon />;
      case 'resolved': return <CheckCircleIcon />;
      default: return <ConfirmationNumberIcon />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const stats = getTicketStats();
  const filteredTickets = getFilteredTickets();

  if (!canManageTickets()) {
    return (
      <div className="tickets-management">
        <div className="access-denied">
          <ConfirmationNumberIcon />
          <h2>Acceso Denegado</h2>
          <p>No tienes permisos para gestionar tickets.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tickets-management">
      {/* Header */}
      <div className="tickets-header">
        <div className="header-info">
          <ConfirmationNumberIcon className="header-icon" />
          <div>
            <h1>Gestión de Tickets</h1>
            <p>{getCurrentNeighborhoodName()} • {stats.total} tickets totales</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="create-ticket-btn" onClick={handleCreateTicket}>
            <AddIcon />
            Crear Ticket
          </button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="tickets-stats">
        <div className="stat-card">
          <div className="stat-icon pending">
            <PendingIcon />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Pendientes</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon progress">
            <PlayArrowIcon />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.in_progress}</div>
            <div className="stat-label">En Progreso</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon resolved">
            <CheckCircleIcon />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.resolved}</div>
            <div className="stat-label">Resueltos</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon urgent">
            <PriorityHighIcon />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.urgent}</div>
            <div className="stat-label">Urgentes</div>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="tickets-controls">
        <div className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <SearchIcon />
            <input
              type="text"
              placeholder="Buscar tickets..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit">Buscar</button>
          </form>
        </div>

        <div className="filter-section">
          <button 
            className={`filter-btn ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FilterListIcon />
            Filtros
          </button>

          <div className="view-modes">
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              Lista
            </button>
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              Cuadrícula
            </button>
          </div>
        </div>
      </div>

      {/* Panel de filtros */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>Estado:</label>
            <select 
              value={filters.status || ''} 
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">Todos</option>
              <option value="pending">Pendiente</option>
              <option value="in_progress">En Progreso</option>
              <option value="resolved">Resuelto</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Prioridad:</label>
            <select 
              value={filters.priority || ''} 
              onChange={(e) => handleFilterChange('priority', e.target.value)}
            >
              <option value="">Todas</option>
              <option value="urgent">Urgente</option>
              <option value="high">Alta</option>
              <option value="medium">Media</option>
              <option value="low">Baja</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Categoría:</label>
            <select 
              value={filters.category || ''} 
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">Todas</option>
              <option value="security">Seguridad</option>
              <option value="infrastructure">Infraestructura</option>
              <option value="noise">Ruido</option>
              <option value="cleaning">Limpieza</option>
              <option value="lighting">Iluminación</option>
              <option value="other">Otro</option>
            </select>
          </div>
        </div>
      )}

      {/* Lista de tickets */}
      <div className="tickets-content">
        {loading ? (
          <div className="tickets-loading">
            <div className="loading-spinner"></div>
            <span>Cargando tickets...</span>
          </div>
        ) : error ? (
          <div className="tickets-error">
            <p>Error al cargar tickets: {error}</p>
            <button onClick={() => loadTickets(getCurrentNeighborhoodId())}>
              Reintentar
            </button>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="tickets-empty">
            <ConfirmationNumberIcon />
            <h3>No hay tickets</h3>
            <p>No se encontraron tickets con los filtros aplicados.</p>
          </div>
        ) : (
          <div className={`tickets-list ${viewMode}`}>
            {filteredTickets.map((ticket) => (
              <div key={ticket.id} className="ticket-card">
                <div className="ticket-header">
                  <div className="ticket-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedTickets.includes(ticket.id)}
                      onChange={() => toggleTicketSelection(ticket.id)}
                    />
                  </div>
                  <div 
                    className="ticket-priority"
                    style={{ backgroundColor: getPriorityColor(ticket.priority) }}
                  >
                    <PriorityHighIcon />
                  </div>
                  <div className="ticket-menu">
                    <MoreVertIcon />
                  </div>
                </div>

                <div className="ticket-content">
                  <h3 className="ticket-title">{ticket.title}</h3>
                  <p className="ticket-description">{ticket.description}</p>

                  <div className="ticket-meta">
                    <div className="meta-item">
                      <CategoryIcon />
                      <span>{ticket.category}</span>
                    </div>
                    <div className="meta-item">
                      <PersonIcon />
                      <span>{ticket.reporter_name || 'Usuario'}</span>
                    </div>
                    <div className="meta-item">
                      <CalendarTodayIcon />
                      <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                    </div>
                    {ticket.assigned_to && (
                      <div className="meta-item">
                        <AssignmentIndIcon />
                        <span>{ticket.assigned_to_name}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="ticket-footer">
                  <div className={`ticket-status ${ticket.status}`}>
                    {getStatusIcon(ticket.status)}
                    <span>{ticket.status}</span>
                  </div>

                  <div className="ticket-actions">
                    {ticket.status === 'pending' && (
                      <button 
                        className="action-btn start"
                        onClick={() => handleStatusUpdate(ticket.id, 'in_progress')}
                      >
                        Iniciar
                      </button>
                    )}
                    {ticket.status === 'in_progress' && (
                      <button 
                        className="action-btn resolve"
                        onClick={() => handleStatusUpdate(ticket.id, 'resolved')}
                      >
                        Resolver
                      </button>
                    )}
                    <button className="action-btn view">
                      Ver Detalles
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Crear Ticket */}
      <CreateTicketModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleSubmitTicket}
        neighborhoodId={getCurrentNeighborhoodId()}
      />
    </div>
  );
};

export default TicketsManagement;