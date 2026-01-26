import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
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

const AddResourceModal = ({ 
  show, 
  onClose, 
  newResource, 
  setNewResource, 
  onSubmit 
}) => {
  const categories = [
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

  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Agregar Recurso</h2>
          <button className="close-modal" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Nombre del Recurso</label>
            <input
              type="text"
              value={newResource.name}
              onChange={(e) => setNewResource({...newResource, name: e.target.value})}
              placeholder="Ej: Taladro eléctrico"
            />
          </div>

          <div className="form-group">
            <label>Descripción</label>
            <textarea
              value={newResource.description}
              onChange={(e) => setNewResource({...newResource, description: e.target.value})}
              placeholder="Describe el recurso, marca, modelo, etc..."
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Categoría</label>
              <select
                value={newResource.category}
                onChange={(e) => setNewResource({...newResource, category: e.target.value})}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Condición</label>
              <select
                value={newResource.condition}
                onChange={(e) => setNewResource({...newResource, condition: e.target.value})}
              >
                {conditions.map(cond => (
                  <option key={cond.value} value={cond.value}>
                    {cond.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Máximo de Días de Préstamo</label>
            <input
              type="number"
              value={newResource.maxLoanDays}
              onChange={(e) => setNewResource({...newResource, maxLoanDays: parseInt(e.target.value)})}
              min="1"
              max="30"
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={newResource.requiresDeposit}
                onChange={(e) => setNewResource({...newResource, requiresDeposit: e.target.checked})}
              />
              Requiere depósito
            </label>
          </div>

          {newResource.requiresDeposit && (
            <div className="form-group">
              <label>Monto del Depósito</label>
              <input
                type="number"
                value={newResource.depositAmount}
                onChange={(e) => setNewResource({...newResource, depositAmount: parseInt(e.target.value)})}
                placeholder="0"
              />
            </div>
          )}

          <div className="form-group">
            <label>Reglas de Uso (Opcional)</label>
            <textarea
              value={newResource.rules}
              onChange={(e) => setNewResource({...newResource, rules: e.target.value})}
              placeholder="Ej: Devolver limpio, no usar en exteriores, etc..."
              rows="2"
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancelar
          </button>
          <button className="submit-btn" onClick={onSubmit}>
            Agregar Recurso
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddResourceModal;