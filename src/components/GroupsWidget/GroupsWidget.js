import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import storageService from '../../services/storageService';
import './GroupsWidget.css';

const GroupsWidget = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    // Obtener todos los grupos (mostrar los primeros 3)
    const allGroups = storageService.getGroups();
    setGroups(allGroups.slice(0, 3));
  }, []);

  const handleGroupClick = (groupId) => {
    navigate('/grupos');
  };

  const formatMembers = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`.replace('.0k', 'k');
    }
    return count.toString();
  };

  return (
    <div className="groups-widget">
      <div className="groups-header">
        <h3>Tus Grupos</h3>
        <a href="/grupos">Ver Todos</a>
      </div>
      <div className="groups-list">
        {groups.length > 0 ? (
          groups.map((group) => (
            <div 
              key={group.id} 
              className="group-card-home"
              onClick={() => handleGroupClick(group.id)}
              style={{ cursor: 'pointer' }}
            >
              <img src={group.cover || group.avatar} alt={group.name} />
              <div className="group-info-home">
                <h4>{group.name}</h4>
                <p>{formatMembers(group.memberCount || group.members?.length || 0)} miembros</p>
              </div>
            </div>
          ))
        ) : (
          <p className="no-groups">Aún no perteneces a ningún grupo</p>
        )}
      </div>
    </div>
  );
};

export default GroupsWidget;
