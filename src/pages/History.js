import { useState } from 'react';
import { showConfirmDialog, showSuccessToast } from '../utils/sweetalert';
import HistoryIcon from '@mui/icons-material/History';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import './History.css';

const History = () => {
  const [history, setHistory] = useState([
    { id: 1, action: 'Le gustó una publicación', user: 'John Doe', time: 'hace 5 mins', image: 'https://i.pravatar.cc/40?img=1', details: 'Publicación sobre viajes' },
    { id: 2, action: 'Comentó en una foto', user: 'Jane Smith', time: 'hace 1 hora', image: 'https://i.pravatar.cc/40?img=5', details: 'Foto de cumpleaños' },
    { id: 3, action: 'Compartió un video', user: 'Mike Johnson', time: 'hace 3 horas', image: 'https://i.pravatar.cc/40?img=12', details: 'Video de recetas' },
    { id: 4, action: 'Agregó un amigo', user: 'Sarah Williams', time: 'hace 5 horas', image: 'https://i.pravatar.cc/40?img=9', details: 'Nueva conexión' },
    { id: 5, action: 'Actualizó su foto de perfil', user: 'Tom Brown', time: 'hace 1 día', image: 'https://i.pravatar.cc/40?img=13', details: 'Nueva foto de perfil' },
    { id: 6, action: 'Se unió a un grupo', user: 'Emma Davis', time: 'hace 2 días', image: 'https://i.pravatar.cc/40?img=10', details: 'Grupo de fotografía' },
  ]);

  const handleViewDetails = (item) => {
    showSuccessToast(`${item.action} - ${item.details}`);
  };

  const handleDeleteItem = async (itemId) => {
    const result = await showConfirmDialog(
      '¿Eliminar del historial?',
      'Esta acción no se puede deshacer',
      'Eliminar',
      'Cancelar'
    );

    if (result.isConfirmed) {
      setHistory(history.filter(item => item.id !== itemId));
      showSuccessToast('Elemento eliminado del historial');
    }
  };

  const handleClearAll = async () => {
    const result = await showConfirmDialog(
      '¿Limpiar todo el historial?',
      'Se eliminarán todos los elementos del historial',
      'Limpiar Todo',
      'Cancelar'
    );

    if (result.isConfirmed) {
      setHistory([]);
      showSuccessToast('Historial limpiado completamente');
    }
  };

  return (
    <div className="history-page">
      <div className="history-header">
        <HistoryIcon className="header-icon" />
        <h1>Historial de Actividad</h1>
        <p>Tu actividad reciente en Vecino Activo</p>
        {history.length > 0 && (
          <button className="clear-all-btn" onClick={handleClearAll}>
            <DeleteIcon fontSize="small" /> Limpiar Todo
          </button>
        )}
      </div>

      <div className="history-list">
        {history.length === 0 ? (
          <div className="empty-history">
            <HistoryIcon style={{ fontSize: 80, color: '#65676b' }} />
            <h3>No hay historial</h3>
            <p>Tu actividad aparecerá aquí</p>
          </div>
        ) : (
          history.map((item) => (
            <div key={item.id} className="history-item">
              <img src={item.image} alt={item.user} />
              <div className="history-content" onClick={() => handleViewDetails(item)} style={{ cursor: 'pointer' }}>
                <p><strong>{item.action}</strong> por {item.user}</p>
                <span>{item.time}</span>
              </div>
              <div className="history-actions">
                <button 
                  className="action-btn view-btn" 
                  onClick={() => handleViewDetails(item)}
                  title="Ver detalles"
                >
                  <VisibilityIcon fontSize="small" />
                </button>
                <button 
                  className="action-btn delete-btn" 
                  onClick={() => handleDeleteItem(item.id)}
                  title="Eliminar"
                >
                  <DeleteIcon fontSize="small" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default History;
