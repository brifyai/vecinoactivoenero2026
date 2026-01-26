import { useSelector, useDispatch } from 'react-redux';
import {
  createTicket,
  fetchTickets,
  fetchTicketById,
  updateTicket,
  assignTicket,
  updateTicketStatus,
  addTicketComment,
  fetchTicketComments,
  fetchTicketStats,
  searchTickets,
  clearError,
  setFilters,
  clearFilters,
  setSearchTerm,
  clearSearchResults,
  setCurrentTicket,
  clearCurrentTicket
} from '../store/slices/ticketsSlice';

/**
 * Hook personalizado para gestión de tickets con Redux
 * Proporciona una interfaz simplificada para todas las operaciones de tickets
 */
export const useReduxTickets = () => {
  const dispatch = useDispatch();
  
  const {
    tickets,
    currentTicket,
    comments,
    stats,
    loading,
    error,
    filters,
    searchTerm,
    searchResults
  } = useSelector(state => state.tickets);

  // =====================================================
  // OPERACIONES CRUD
  // =====================================================

  const handleCreateTicket = async (ticketData) => {
    const result = await dispatch(createTicket(ticketData));
    return createTicket.fulfilled.match(result) 
      ? { success: true, data: result.payload }
      : { success: false, error: result.payload };
  };

  const handleFetchTickets = async (filters = {}) => {
    const result = await dispatch(fetchTickets(filters));
    return fetchTickets.fulfilled.match(result)
      ? { success: true, data: result.payload }
      : { success: false, error: result.payload };
  };

  const handleFetchTicketById = async (ticketId) => {
    const result = await dispatch(fetchTicketById(ticketId));
    return fetchTicketById.fulfilled.match(result)
      ? { success: true, data: result.payload }
      : { success: false, error: result.payload };
  };

  const handleUpdateTicket = async (ticketId, updates) => {
    const result = await dispatch(updateTicket({ ticketId, updates }));
    return updateTicket.fulfilled.match(result)
      ? { success: true, data: result.payload }
      : { success: false, error: result.payload };
  };

  const handleAssignTicket = async (ticketId, assignedTo, assignedBy) => {
    const result = await dispatch(assignTicket({ ticketId, assignedTo, assignedBy }));
    return assignTicket.fulfilled.match(result)
      ? { success: true, data: result.payload }
      : { success: false, error: result.payload };
  };

  const handleUpdateStatus = async (ticketId, newStatus, userId, notes = '') => {
    const result = await dispatch(updateTicketStatus({ ticketId, newStatus, userId, notes }));
    return updateTicketStatus.fulfilled.match(result)
      ? { success: true, data: result.payload }
      : { success: false, error: result.payload };
  };

  // =====================================================
  // COMENTARIOS
  // =====================================================

  const handleAddComment = async (ticketId, commentData) => {
    const result = await dispatch(addTicketComment({ ticketId, commentData }));
    return addTicketComment.fulfilled.match(result)
      ? { success: true, data: result.payload }
      : { success: false, error: result.payload };
  };

  const handleFetchComments = async (ticketId) => {
    const result = await dispatch(fetchTicketComments(ticketId));
    return fetchTicketComments.fulfilled.match(result)
      ? { success: true, data: result.payload }
      : { success: false, error: result.payload };
  };

  const getTicketComments = (ticketId) => {
    return comments[ticketId] || [];
  };

  // =====================================================
  // ESTADÍSTICAS Y BÚSQUEDA
  // =====================================================

  const handleFetchStats = async (neighborhoodId) => {
    const result = await dispatch(fetchTicketStats(neighborhoodId));
    return fetchTicketStats.fulfilled.match(result)
      ? { success: true, data: result.payload }
      : { success: false, error: result.payload };
  };

  const handleSearch = async (searchTerm, filters = {}) => {
    const result = await dispatch(searchTickets({ searchTerm, filters }));
    return searchTickets.fulfilled.match(result)
      ? { success: true, data: result.payload }
      : { success: false, error: result.payload };
  };

  // =====================================================
  // GESTIÓN DE ESTADO LOCAL
  // =====================================================

  const handleSetFilters = (newFilters) => {
    dispatch(setFilters(newFilters));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  const handleSetSearchTerm = (term) => {
    dispatch(setSearchTerm(term));
  };

  const handleClearSearchResults = () => {
    dispatch(clearSearchResults());
  };

  const handleSetCurrentTicket = (ticket) => {
    dispatch(setCurrentTicket(ticket));
  };

  const handleClearCurrentTicket = () => {
    dispatch(clearCurrentTicket());
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  // =====================================================
  // UTILIDADES
  // =====================================================

  const getFilteredTickets = () => {
    let filtered = tickets;

    if (filters.status) {
      filtered = filtered.filter(ticket => ticket.status === filters.status);
    }

    if (filters.category) {
      filtered = filtered.filter(ticket => ticket.category === filters.category);
    }

    if (filters.priority) {
      filtered = filtered.filter(ticket => ticket.priority === filters.priority);
    }

    return filtered;
  };

  const getTicketsByStatus = (status) => {
    return tickets.filter(ticket => ticket.status === status);
  };

  const getTicketsByPriority = (priority) => {
    return tickets.filter(ticket => ticket.priority === priority);
  };

  const getTicketsByCategory = (category) => {
    return tickets.filter(ticket => ticket.category === category);
  };

  const getTicketStats = () => {
    const totalTickets = tickets.length;
    const pendingTickets = getTicketsByStatus('pending').length;
    const inProgressTickets = getTicketsByStatus('in_progress').length;
    const resolvedTickets = getTicketsByStatus('resolved').length;
    const urgentTickets = getTicketsByPriority('urgent').length;

    return {
      total: totalTickets,
      pending: pendingTickets,
      in_progress: inProgressTickets,
      resolved: resolvedTickets,
      urgent: urgentTickets,
      completion_rate: totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 0
    };
  };

  // =====================================================
  // RETURN OBJECT
  // =====================================================

  return {
    // Estado
    tickets,
    currentTicket,
    comments,
    stats,
    loading,
    error,
    filters,
    searchTerm,
    searchResults,

    // Operaciones CRUD
    createTicket: handleCreateTicket,
    fetchTickets: handleFetchTickets,
    fetchTicketById: handleFetchTicketById,
    updateTicket: handleUpdateTicket,
    assignTicket: handleAssignTicket,
    updateStatus: handleUpdateStatus,

    // Comentarios
    addComment: handleAddComment,
    fetchComments: handleFetchComments,
    getTicketComments,

    // Estadísticas y búsqueda
    fetchStats: handleFetchStats,
    search: handleSearch,

    // Gestión de estado
    setFilters: handleSetFilters,
    clearFilters: handleClearFilters,
    setSearchTerm: handleSetSearchTerm,
    clearSearchResults: handleClearSearchResults,
    setCurrentTicket: handleSetCurrentTicket,
    clearCurrentTicket: handleClearCurrentTicket,
    clearError: handleClearError,

    // Utilidades
    getFilteredTickets,
    getTicketsByStatus,
    getTicketsByPriority,
    getTicketsByCategory,
    getTicketStats
  };
};