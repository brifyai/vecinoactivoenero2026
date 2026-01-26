import React from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import LoopIcon from '@mui/icons-material/Loop';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { formatNumber } from '../../utils/formatNumber';

const SharedResourcesStats = ({ resources, reservations, getPendingRequests }) => {
  return (
    <div className="resources-stats">
      <div className="stat-card">
        <div className="stat-icon" style={{ background: '#dbeafe' }}>
          <Inventory2Icon style={{ fontSize: '28px', color: '#3b82f6' }} />
        </div>
        <div className="stat-info">
          <span className="stat-value">{formatNumber(resources.length)}</span>
          <span className="stat-label">Recursos Disponibles</span>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon" style={{ background: '#dcfce7' }}>
          <CheckCircleIcon style={{ fontSize: '28px', color: '#10b981' }} />
        </div>
        <div className="stat-info">
          <span className="stat-value">
            {formatNumber(reservations.filter(r => r.status === 'completada').length)}
          </span>
          <span className="stat-label">Préstamos Completados</span>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon" style={{ background: '#fef3c7' }}>
          <LoopIcon style={{ fontSize: '28px', color: '#f59e0b' }} />
        </div>
        <div className="stat-info">
          <span className="stat-value">
            {formatNumber(reservations.filter(r => r.status === 'activa').length)}
          </span>
          <span className="stat-label">Préstamos Activos</span>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon" style={{ background: '#fce7f3' }}>
          <HourglassEmptyIcon style={{ fontSize: '28px', color: '#ec4899' }} />
        </div>
        <div className="stat-info">
          <span className="stat-value">
            {formatNumber(getPendingRequests().length)}
          </span>
          <span className="stat-label">Solicitudes Pendientes</span>
        </div>
      </div>
    </div>
  );
};

export default SharedResourcesStats;