import { useNavigate } from 'react-router-dom';
import storageService from '../../services/storageService';

const UserNotFound = ({ identifier }) => {
  const navigate = useNavigate();
  const availableUsers = storageService.getUsers();
  const suggestions = availableUsers.slice(0, 5);

  return (
    <div className="user-not-found">
      <h2>Usuario no encontrado</h2>
      <p>El usuario "{identifier}" no existe o ha sido eliminado.</p>
      
      {suggestions.length > 0 && (
        <div className="user-suggestions">
          <h3>¿Quizás buscabas a uno de estos usuarios?</h3>
          <div className="suggestions-list">
            {suggestions.map(user => (
              <div key={user.id} className="suggestion-item" onClick={() => navigate(`/${user.username}`)}>
                <img src={user.avatar} alt={user.name} />
                <div>
                  <strong>{user.name}</strong>
                  <span>@{user.username}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="action-buttons">
        <button onClick={() => navigate('/app/descubrir-vecinos')}>Descubrir Vecinos</button>
        <button onClick={() => navigate('/app/feed')}>Ir al Feed</button>
        <button onClick={() => window.location.reload()}>Recargar Página</button>
      </div>
    </div>
  );
};

export default UserNotFound;