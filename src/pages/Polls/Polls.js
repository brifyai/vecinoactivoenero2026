import React, { useState, useEffect } from 'react';
import { useReduxAuth as useAuth } from '../../hooks/useReduxAuth';
import { useSidebar } from '../../context/SidebarContext';
import { showSuccessToast, showErrorToast, showCreatePollDialog } from '../../utils/sweetalert';
import PollIcon from '@mui/icons-material/Poll';
import AddIcon from '@mui/icons-material/Add';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BarChartIcon from '@mui/icons-material/BarChart';
import './Polls.css';

const Polls = () => {
  const { user } = useAuth();
  const { isRightSidebarCollapsed } = useSidebar();
  const [polls, setPolls] = useState([]);
  const [filter, setFilter] = useState('active'); // active, closed, myVotes

  useEffect(() => {
    loadPolls();
  }, []);

  const loadPolls = () => {
    const savedPolls = JSON.parse(localStorage.getItem('communityPolls') || '[]');
    if (savedPolls.length === 0) {
      // Crear encuestas de ejemplo
      const examplePolls = [
        {
          id: 1,
          title: '¿Deberíamos instalar cámaras de seguridad en la entrada?',
          description: 'Propuesta para mejorar la seguridad del vecindario',
          options: [
            { id: 1, text: 'Sí, es necesario', votes: 45 },
            { id: 2, text: 'No, es muy costoso', votes: 12 },
            { id: 3, text: 'Necesito más información', votes: 8 }
          ],
          createdBy: 'Junta de Vecinos',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          endsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          neighborhoodId: user?.neighborhoodId,
          status: 'active',
          voters: []
        },
        {
          id: 2,
          title: '¿Qué día prefieres para la reunión mensual?',
          description: 'Ayúdanos a elegir el mejor día para todos',
          options: [
            { id: 1, text: 'Lunes 19:00', votes: 23 },
            { id: 2, text: 'Miércoles 19:00', votes: 34 },
            { id: 3, text: 'Sábado 11:00', votes: 18 }
          ],
          createdBy: 'Junta de Vecinos',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          neighborhoodId: user?.neighborhoodId,
          status: 'active',
          voters: []
        }
      ];
      localStorage.setItem('communityPolls', JSON.stringify(examplePolls));
      setPolls(examplePolls);
    } else {
      setPolls(savedPolls);
    }
  };

  const handleVote = (pollId, optionId) => {
    if (!user) {
      showErrorToast('Debes iniciar sesión para votar');
      return;
    }

    const poll = polls.find(p => p.id === pollId);
    if (!poll) return;

    // Verificar si ya votó
    if (poll.voters.includes(user.id)) {
      showErrorToast('Ya has votado en esta encuesta');
      return;
    }

    // Registrar voto
    const updatedPolls = polls.map(p => {
      if (p.id === pollId) {
        return {
          ...p,
          options: p.options.map(opt => 
            opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
          ),
          voters: [...p.voters, user.id]
        };
      }
      return p;
    });

    setPolls(updatedPolls);
    localStorage.setItem('communityPolls', JSON.stringify(updatedPolls));
    showSuccessToast('¡Voto registrado exitosamente!');
  };

  const handleCreatePoll = async () => {
    if (!user) {
      showErrorToast('Debes iniciar sesión para crear encuestas');
      return;
    }

    const result = await showCreatePollDialog();
    if (result.isConfirmed && result.value) {
      const { title, description, options, duration } = result.value;
      
      const newPoll = {
        id: Date.now(),
        title: title,
        description: description,
        options: options,
        createdBy: user.name || 'Vecino',
        createdAt: new Date().toISOString(),
        endsAt: new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString(),
        neighborhoodId: user.neighborhoodId,
        status: 'active',
        voters: []
      };
      
      const updatedPolls = [newPoll, ...polls];
      setPolls(updatedPolls);
      localStorage.setItem('communityPolls', JSON.stringify(updatedPolls));
      showSuccessToast('¡Encuesta creada exitosamente!');
    }
  };

  const getTimeRemaining = (endsAt) => {
    const now = new Date();
    const end = new Date(endsAt);
    const diff = end - now;
    
    if (diff < 0) return 'Finalizada';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} día${days > 1 ? 's' : ''} restante${days > 1 ? 's' : ''}`;
    return `${hours} hora${hours > 1 ? 's' : ''} restante${hours > 1 ? 's' : ''}`;
  };

  const getTotalVotes = (poll) => {
    return poll.options.reduce((sum, opt) => sum + opt.votes, 0);
  };

  const getPercentage = (votes, total) => {
    if (total === 0) return 0;
    return Math.round((votes / total) * 100);
  };

  const hasVoted = (poll) => {
    return poll.voters.includes(user?.id);
  };

  const filteredPolls = polls.filter(poll => {
    if (filter === 'active') return poll.status === 'active';
    if (filter === 'closed') return poll.status === 'closed';
    if (filter === 'myVotes') return poll.voters.includes(user?.id);
    return true;
  });

  return (
    <div className={`polls-page ${isRightSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="polls-header">
        <div className="header-content">
          <PollIcon className="header-icon" />
          <div>
            <h1>Votaciones Comunitarias</h1>
            <p>Participa en las decisiones de tu vecindario</p>
          </div>
        </div>
        <button className="create-poll-btn" onClick={handleCreatePoll}>
          <AddIcon />
          Crear Encuesta
        </button>
      </div>

      <div className="polls-filters">
        <button
          className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          <HowToVoteIcon />
          Activas
        </button>
        <button
          className={`filter-btn ${filter === 'myVotes' ? 'active' : ''}`}
          onClick={() => setFilter('myVotes')}
        >
          <CheckCircleIcon />
          Mis Votos
        </button>
        <button
          className={`filter-btn ${filter === 'closed' ? 'active' : ''}`}
          onClick={() => setFilter('closed')}
        >
          <BarChartIcon />
          Finalizadas
        </button>
      </div>

      <div className="polls-grid">
        {filteredPolls.length > 0 ? (
          filteredPolls.map(poll => {
            const totalVotes = getTotalVotes(poll);
            const voted = hasVoted(poll);

            return (
              <div key={poll.id} className="poll-card">
                <div className="poll-header">
                  <div className="poll-meta">
                    <span className="poll-author">{poll.createdBy}</span>
                    <span className="poll-time">{getTimeRemaining(poll.endsAt)}</span>
                  </div>
                  {voted && (
                    <div className="voted-badge">
                      <CheckCircleIcon />
                      Votaste
                    </div>
                  )}
                </div>

                <h3 className="poll-title">{poll.title}</h3>
                <p className="poll-description">{poll.description}</p>

                <div className="poll-options">
                  {poll.options.map(option => {
                    const percentage = getPercentage(option.votes, totalVotes);
                    
                    return (
                      <div key={option.id} className="poll-option">
                        <button
                          className={`option-btn ${voted ? 'disabled' : ''}`}
                          onClick={() => !voted && handleVote(poll.id, option.id)}
                          disabled={voted}
                        >
                          <div className="option-content">
                            <span className="option-text">{option.text}</span>
                            <span className="option-votes">
                              {voted && `${percentage}% (${option.votes})`}
                            </span>
                          </div>
                          {voted && (
                            <div 
                              className="option-bar" 
                              style={{ width: `${percentage}%` }}
                            />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="poll-footer">
                  <HowToVoteIcon />
                  <span>{totalVotes} voto{totalVotes !== 1 ? 's' : ''}</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-polls">
            <PollIcon style={{ fontSize: 60, opacity: 0.3 }} />
            <h3>No hay encuestas {filter === 'active' ? 'activas' : filter === 'myVotes' ? 'en las que hayas votado' : 'finalizadas'}</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default Polls;
