import React, { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import './ReactionsModal.css';

const ReactionsModal = ({ post, onClose, onReact }) => {
  const [activeTab, setActiveTab] = useState('all');

  const reactions = {
    all: [
      { id: 1, name: 'Carlos Mendoza', avatar: 'https://i.pravatar.cc/40?img=11', reaction: '🤝' },
      { id: 2, name: 'Maria Elena Rodriguez', avatar: 'https://i.pravatar.cc/40?img=5', reaction: '❤️' },
      { id: 3, name: 'Juan Pablo Torres', avatar: 'https://i.pravatar.cc/40?img=12', reaction: '👏' },
      { id: 4, name: 'Ana Maria Fernandez', avatar: 'https://i.pravatar.cc/40?img=9', reaction: '💡' },
      { id: 5, name: 'Roberto Carlos Gomez', avatar: 'https://i.pravatar.cc/40?img=13', reaction: '🙌' },
    ],
    apoyo: [
      { id: 1, name: 'Carlos Mendoza', avatar: 'https://i.pravatar.cc/40?img=11', reaction: '🤝' },
    ],
    meimporta: [
      { id: 2, name: 'Maria Elena Rodriguez', avatar: 'https://i.pravatar.cc/40?img=5', reaction: '❤️' },
    ],
    bienhecho: [
      { id: 3, name: 'Juan Pablo Torres', avatar: 'https://i.pravatar.cc/40?img=12', reaction: '👏' },
    ],
    buenaidea: [
      { id: 4, name: 'Ana Maria Fernandez', avatar: 'https://i.pravatar.cc/40?img=9', reaction: '💡' },
    ],
    cuentaconmigo: [
      { id: 5, name: 'Roberto Carlos Gomez', avatar: 'https://i.pravatar.cc/40?img=13', reaction: '🙌' },
    ]
  };

  const reactionTabs = [
    { key: 'all', label: 'Todas', emoji: '', count: reactions.all.length },
    { key: 'apoyo', label: 'Apoyo', emoji: '🤝', count: reactions.apoyo.length },
    { key: 'meimporta', label: 'Me importa', emoji: '❤️', count: reactions.meimporta.length },
    { key: 'bienhecho', label: 'Bien hecho', emoji: '👏', count: reactions.bienhecho.length },
    { key: 'buenaidea', label: 'Buena idea', emoji: '💡', count: reactions.buenaidea.length },
    { key: 'cuentaconmigo', label: 'Cuenta conmigo', emoji: '🙌', count: reactions.cuentaconmigo.length },
  ];

  const currentReactions = reactions[activeTab] || reactions.all;

  return (
    <div className="reactions-modal-overlay" onClick={onClose}>
      <div className="reactions-modal" onClick={(e) => e.stopPropagation()}>
        <div className="reactions-modal-header">
          <h2>Reacciones</h2>
          <button className="close-modal-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="reactions-tabs">
          {reactionTabs.map(tab => (
            <button
              key={tab.key}
              className={`reaction-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.emoji && <span className="tab-emoji">{tab.emoji}</span>}
              <span>{tab.label}</span>
              <span className="tab-count">{tab.count}</span>
            </button>
          ))}
        </div>

        <div className="reactions-list">
          {currentReactions.map(person => (
            <div key={person.id} className="reaction-item">
              <div className="reaction-user-info">
                <div className="reaction-avatar-wrapper">
                  <img src={person.avatar} alt={person.name} />
                  <span className="reaction-badge">{person.reaction}</span>
                </div>
                <span className="reaction-user-name">{person.name}</span>
              </div>
              <button className="follow-btn">Seguir</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReactionsModal;
