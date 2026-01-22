import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocalNeeds } from '../../context/LocalNeedsContext';
import { useNeighborhoods } from '../../context/NeighborhoodsContext';
import CreateNeedModal from '../../components/CreateNeedModal/CreateNeedModal';
import NeedCard from '../../components/NeedCard/NeedCard';
import AddIcon from '@mui/icons-material/Add';
import './LocalNeeds.css';

const LocalNeeds = () => {
  const { user } = useAuth();
  const { needs, getActiveNeeds, getNeighborhoodNeeds } = useLocalNeeds();
  const { calculateDistance } = useNeighborhoods();
  const [filteredNeeds, setFilteredNeeds] = useState([]);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedUrgency, setSelectedUrgency] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    filterNeeds();
    setLoading(false);
  }, [needs, selectedType, selectedUrgency]);

  const filterNeeds = () => {
    let filtered = getNeighborhoodNeeds(user.neighborhoodId);

    // Filtrar por tipo
    if (selectedType !== 'all') {
      filtered = filtered.filter(n => n.type === selectedType);
    }

    // Filtrar por urgencia
    if (selectedUrgency !== 'all') {
      filtered = filtered.filter(n => n.urgency === selectedUrgency);
    }

    // Ordenar por proximidad y urgencia
    filtered.sort((a, b) => {
      const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const urgencyDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];

      if (urgencyDiff !== 0) return urgencyDiff;

      const distA = calculateDistance(
        user.latitude,
        user.longitude,
        a.location.latitude,
        a.location.longitude
      );
      const distB = calculateDistance(
        user.latitude,
        user.longitude,
        b.location.latitude,
        b.location.longitude
      );

      return distA - distB;
    });

    setFilteredNeeds(filtered);
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      critical: '#dc2626',
      high: '#f59e0b',
      medium: '#3b82f6',
      low: '#10b981'
    };
    return colors[urgency] || '#6b7280';
  };

  const getTypeLabel = (type) => {
    const labels = {
      help_request: 'Solicitud de Ayuda',
      resource_needed: 'Recurso Necesario',
      skill_sought: 'Habilidad Buscada'
    };
    return labels[type] || type;
  };

  const getUrgencyLabel = (urgency) => {
    const labels = {
      critical: 'Crítica',
      high: 'Alta',
      medium: 'Media',
      low: 'Baja'
    };
    return labels[urgency] || urgency;
  };

  if (loading) {
    return (
      <div className="local-needs-page">
        <div className="loading">Cargando necesidades...</div>
      </div>
    );
  }

  return (
    <div className="local-needs-page">
      <div className="needs-header">
        <div className="header-content">
          <h1>Necesidades Locales</h1>
          <p>Ayuda a tus vecinos o pide ayuda cuando la necesites</p>
        </div>
        <button
          className="create-need-btn"
          onClick={() => setShowCreateModal(true)}
        >
          <AddIcon />
          Crear Necesidad
        </button>
      </div>

      <div className="needs-filters">
        <div className="filter-group">
          <label>Tipo</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="filter-select"
          >
            <option value="all">Todos</option>
            <option value="help_request">Solicitud de Ayuda</option>
            <option value="resource_needed">Recurso Necesario</option>
            <option value="skill_sought">Habilidad Buscada</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Urgencia</label>
          <select
            value={selectedUrgency}
            onChange={(e) => setSelectedUrgency(e.target.value)}
            className="filter-select"
          >
            <option value="all">Todas</option>
            <option value="critical">Crítica</option>
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Baja</option>
          </select>
        </div>

        <div className="filter-stats">
          <span>{filteredNeeds.length} necesidades activas</span>
        </div>
      </div>

      <div className="needs-list">
        {filteredNeeds.length > 0 ? (
          filteredNeeds.map(need => (
            <NeedCard
              key={need.id}
              need={need}
              userLocation={{ latitude: user.latitude, longitude: user.longitude }}
            />
          ))
        ) : (
          <div className="no-needs">
            <p>No hay necesidades activas en tu vecindario</p>
            <p className="no-needs-desc">
              {selectedType !== 'all' || selectedUrgency !== 'all'
                ? 'Intenta cambiar los filtros'
                : 'Sé el primero en crear una necesidad'}
            </p>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateNeedModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            filterNeeds();
          }}
        />
      )}
    </div>
  );
};

export default LocalNeeds;
