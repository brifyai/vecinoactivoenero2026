import React, { useState } from 'react';
import { useSidebar } from '../../context/SidebarContext';
import { usePolls } from '../../context/PollsContext';
import { useAuth } from '../../context/AuthContext';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import './ModernPolls.css';

const ModernPolls = () => {
  const { isRightSidebarCollapsed } = useSidebar();
  const { polls, createPoll, vote, getUserVote } = usePolls();
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    options: ['', ''],
    endsAt: ''
  });

  const handleCreatePoll = () => {
    setShowModal(true);
  };

  const handleAddOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, '']
    });
  };

  const handleRemoveOption = (index) => {
    if (formData.options.length > 2) {
      setFormData({
        ...formData,
        options: formData.options.filter((_, i) => i !== index)
      });
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validOptions = formData.options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
      alert('Debes agregar al menos 2 opciones');
      return;
    }
    createPoll({
      ...formData,
      options: validOptions
    });
    setShowModal(false);
    setFormData({
      title: '',
      description: '',
      options: ['', ''],
      endsAt: ''
    });
  };

  const filters = [
    { value: 'all', label: 'Todas' },
    { value: 'active', label: 'Activas' },
    { value: 'closed', label: 'Cerradas' }
  ];

  const filteredPolls = polls.filter(poll => {
    if (selectedFilter === 'all') return true;
    return poll.status === selectedFilter;
  });

  const handleVote = (pollId, optionId) => {
    vote(pollId, optionId);
  };

  return (
    <div className={`modern-polls ${isRightSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="polls-controls">
        <div className="controls-header">
          <div className="filter-pills">
            {filters.map(filter => (
              <button
                key={filter.value}
                className={`filter-pill ${selectedFilter === filter.value ? 'active' : ''}`}
                onClick={() => setSelectedFilter(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <button className="btn-create" onClick={handleCreatePoll}>
            + Nueva Votación
          </button>
        </div>
      </div>

      <div className="polls-grid">
        {filteredPolls.map(poll => {
          const userVote = getUserVote(poll.id);
          const hasVoted = userVote !== null;

          return (
            <div key={poll.id} className="poll-card-modern">
              <div className="poll-header">
                <div className="poll-icon">
                  <HowToVoteIcon />
                </div>
                <div className="poll-meta">
                  <span className={`poll-status ${poll.status}`}>
                    {poll.status === 'active' ? 'Activa' : 'Cerrada'}
                  </span>
                  <div className="poll-time">
                    <AccessTimeIcon />
                    <span>Termina: {new Date(poll.endsAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <h3 className="poll-title">{poll.title}</h3>
              <p className="poll-description">{poll.description}</p>

              <div className="poll-options">
                {poll.options.map(option => {
                  const percentage = poll.totalVotes > 0 
                    ? ((option.votes / poll.totalVotes) * 100).toFixed(1)
                    : 0;
                  const isUserVote = hasVoted && userVote === option.id;

                  return (
                    <div
                      key={option.id}
                      className={`poll-option ${hasVoted ? 'voted' : ''} ${isUserVote ? 'user-vote' : ''}`}
                      onClick={() => !hasVoted && poll.status === 'active' && handleVote(poll.id, option.id)}
                    >
                      <div className="option-content">
                        <span className="option-text">{option.text}</span>
                        {hasVoted && (
                          <span className="option-percentage">{percentage}%</span>
                        )}
                        {isUserVote && <CheckCircleIcon className="vote-check" />}
                      </div>
                      {hasVoted && (
                        <div className="option-bar">
                          <div
                            className="option-bar-fill"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="poll-footer">
                <div className="poll-votes">
                  <PeopleIcon />
                  <span>{poll.totalVotes} votos</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal para crear votación */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Crear Nueva Votación</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <CloseIcon />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Título de la Votación *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="¿Sobre qué quieres que vote la comunidad?"
                  required
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Proporciona más detalles sobre la votación..."
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Opciones de Votación *</label>
                {formData.options.map((option, index) => (
                  <div key={index} className="option-input-group">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Opción ${index + 1}`}
                      required
                    />
                    {formData.options.length > 2 && (
                      <button
                        type="button"
                        className="btn-remove-option"
                        onClick={() => handleRemoveOption(index)}
                      >
                        <DeleteIcon />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="btn-add-option"
                  onClick={handleAddOption}
                >
                  <AddIcon /> Agregar Opción
                </button>
              </div>

              <div className="form-group">
                <label>Fecha de Cierre *</label>
                <input
                  type="date"
                  value={formData.endsAt}
                  onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit">
                  Crear Votación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernPolls;
