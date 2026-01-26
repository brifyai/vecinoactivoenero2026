import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReduxGroups } from '../hooks/useReduxGroups';
import { useSidebar } from '../context/SidebarContext';
import { useReduxAuth as useAuth } from '../hooks/useReduxAuth';
import { showSuccessToast, showInputDialog } from '../utils/sweetalert';
import GroupIcon from '@mui/icons-material/Group';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import SearchIcon from '@mui/icons-material/Search';
import './Groups.css';

const Groups = () => {
  const navigate = useNavigate();
  const { groups, myGroups, joinGroup, leaveGroup, createGroup } = useReduxGroups();
  const { isRightSidebarCollapsed } = useSidebar();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('my');
  const [searchTerm, setSearchTerm] = useState('');

  const handleCreateGroup = async () => {
    const result = await showInputDialog('Crear Grupo', 'Nombre del grupo', 'text');
    if (result.isConfirmed && result.value) {
      const newGroup = {
        name: result.value,
        description: 'Nuevo grupo creado',
        image: `https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300&h=200&fit=crop&sig=${Date.now()}`
      };
      const created = createGroup(newGroup);
      showSuccessToast('¡Grupo creado exitosamente!');
      navigate(`/grupo/${created.slug}`);
    }
  };

  const handleGroupClick = (slug) => {
    navigate(`/grupo/${slug}`);
  };

  const handleJoinGroup = (groupId) => {
    joinGroup(groupId);
    showSuccessToast('¡Te has unido al grupo!');
  };

  const handleLeaveGroup = (groupId) => {
    leaveGroup(groupId);
    showSuccessToast('Has salido del grupo');
  };

  const suggestedGroups = groups.filter(g => !myGroups.find(mg => mg.id === g.id));

  const filteredGroups = (activeTab === 'my' ? myGroups : suggestedGroups).filter(group => {
    if (searchTerm && !group.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className={`groups-page ${isRightSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="groups-center">
        {/* Header */}
        <div className="groups-header">
          <div className="header-content">
            <GroupIcon className="header-icon" />
            <div>
              <h1>Grupos</h1>
              <p>Conecta con personas que comparten tus intereses</p>
            </div>
          </div>
          <button className="create-group-btn" onClick={handleCreateGroup}>
            <AddIcon /> Crear Grupo
          </button>
        </div>

        {/* Buscador */}
        <div className="search-section">
          <div className="search-input-wrapper">
            <SearchIcon className="search-icon" />
            <input
              type="text"
              placeholder="Buscar grupos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="groups-tabs">
          <button 
            className={`group-tab ${activeTab === 'my' ? 'active' : ''}`}
            onClick={() => setActiveTab('my')}
          >
            Mis Grupos ({myGroups.length})
          </button>
          <button 
            className={`group-tab ${activeTab === 'discover' ? 'active' : ''}`}
            onClick={() => setActiveTab('discover')}
          >
            Descubrir
          </button>
        </div>

        {/* Contenido */}
        <div className="groups-content">
          {activeTab === 'my' && (
            <section className="my-groups-section">
              <div className="groups-grid">
                {filteredGroups.length === 0 ? (
                  <div className="no-groups">
                    <p>No te has unido a ningún grupo aún</p>
                    <button className="discover-btn" onClick={() => setActiveTab('discover')}>
                      Descubrir Grupos
                    </button>
                  </div>
                ) : (
                  filteredGroups.map((group) => (
                    <div key={group.id} className="group-card" onClick={() => handleGroupClick(group.slug)}>
                      <img src={group.image} alt={group.name} />
                      <div className="group-info">
                        <h3>{group.name}</h3>
                        <p><PeopleIcon fontSize="small" /> {group.memberCount || group.members?.length || 0} miembros</p>
                        <button className="view-group-btn">Ver Grupo</button>
                        <button
                          className="leave-group-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLeaveGroup(group.id);
                          }}
                        >
                          Salir
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {activeTab === 'discover' && (
            <section className="suggested-groups-section">
              <div className="groups-grid">
                {filteredGroups.map((group) => (
                  <div key={group.id} className="group-card" onClick={() => handleGroupClick(group.slug)}>
                    <img src={group.image} alt={group.name} />
                    <div className="group-info">
                      <h3>{group.name}</h3>
                      <p><PeopleIcon fontSize="small" /> {group.memberCount || group.members?.length || 0} miembros</p>
                      <button
                        className="join-group-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoinGroup(group.id);
                        }}
                      >
                        Unirse
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {filteredGroups.length === 0 && (
                <div className="no-groups">
                  <p>No se encontraron grupos</p>
                </div>
              )}
            </section>
          )}
        </div>
      </div>

    </div>
  );
};

export default Groups;
