import React from 'react';
import { useNavigate } from 'react-router-dom';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PhoneIcon from '@mui/icons-material/Phone';
import ListAltIcon from '@mui/icons-material/ListAlt';
import BuildIcon from '@mui/icons-material/Build';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import HomeIcon from '@mui/icons-material/Home';
import HelpIcon from '@mui/icons-material/Help';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbsUpDownIcon from '@mui/icons-material/ThumbsUpDown';
import LoopIcon from '@mui/icons-material/Loop';
import { formatNumber } from '../../utils/formatNumber';

const ResourcesList = ({ resources, user, onReserveResource }) => {
  const navigate = useNavigate();

  const categories = [
    { value: 'all', label: 'Todos', icon: <ListAltIcon /> },
    { value: 'herramienta', label: 'Herramientas', icon: <BuildIcon /> },
    { value: 'equipo', label: 'Equipos', icon: <Inventory2Icon /> },
    { value: 'libro', label: 'Libros', icon: <MenuBookIcon /> },
    { value: 'juego', label: 'Juegos', icon: <SportsEsportsIcon /> },
    { value: 'espacio', label: 'Espacios', icon: <HomeIcon /> },
    { value: 'otro', label: 'Otro', icon: <HelpIcon /> }
  ];

  const conditions = [
    { value: 'nuevo', label: 'Nuevo', icon: <AutoAwesomeIcon /> },
    { value: 'bueno', label: 'Bueno', icon: <ThumbUpIcon /> },
    { value: 'regular', label: 'Regular', icon: <ThumbsUpDownIcon /> },
    { value: 'usado', label: 'Usado', icon: <LoopIcon /> }
  ];

  if (resources.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🎁</div>
        <h3>No hay recursos disponibles</h3>
        <p>Sé el primero en compartir algo con tu comunidad</p>
      </div>
    );
  }

  return (
    <div className="resources-grid">
      {resources.map(resource => {
        const categoryInfo = categories.find(c => c.value === resource.category);
        const conditionInfo = conditions.find(c => c.value === resource.condition);
        const isMyResource = resource.ownerId === user?.id;

        return (
          <div
            key={resource.id}
            className="resource-card"
            onClick={() => navigate(`/recursos/${resource.slug}`)}
            style={{ cursor: 'pointer' }}
          >
            <div className="resource-card-header">
              <div className="resource-category">
                {categoryInfo?.icon} {categoryInfo?.label}
              </div>
              <div className="resource-condition">
                {conditionInfo?.icon} {conditionInfo?.label}
              </div>
            </div>

            <h3 className="resource-name">{resource.name}</h3>
            <p className="resource-description">{resource.description}</p>

            <div className="resource-meta">
              <div className="meta-item">
                <CalendarTodayIcon fontSize="small" />
                <span>Máx. {resource.maxLoanDays} días</span>
              </div>
              {resource.requiresDeposit && (
                <div className="meta-item deposit">
                  💰 Depósito: ${formatNumber(resource.depositAmount)}
                </div>
              )}
              {resource.totalLoans > 0 && (
                <div className="meta-item">
                  <CheckCircleIcon fontSize="small" />
                  <span>{resource.totalLoans} préstamos</span>
                </div>
              )}
            </div>

            {resource.rules && (
              <div className="resource-rules">
                <strong>Reglas:</strong> {resource.rules}
              </div>
            )}

            <div className="resource-owner">
              <img src={resource.ownerAvatar} alt={resource.ownerName} />
              <div>
                <span className="owner-name">{resource.ownerName}</span>
                <span className="owner-neighborhood">{resource.neighborhoodName}</span>
              </div>
              {resource.ownerPhone && !isMyResource && (
                <a href={`tel:${resource.ownerPhone}`} className="phone-link">
                  <PhoneIcon fontSize="small" />
                </a>
              )}
            </div>

            {!isMyResource && resource.isAvailable && (
              <button
                className="reserve-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onReserveResource(resource);
                }}
              >
                <CalendarTodayIcon fontSize="small" />
                Solicitar Préstamo
              </button>
            )}

            {isMyResource && (
              <div className="my-resource-badge">
                <CheckCircleIcon fontSize="small" />
                Tu Recurso
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ResourcesList;