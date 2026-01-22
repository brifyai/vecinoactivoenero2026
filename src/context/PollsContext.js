import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationsContext';
import { showSuccessToast } from '../utils/sweetalert';

const PollsContext = createContext();

export const usePolls = () => {
  const context = useContext(PollsContext);
  if (!context) {
    throw new Error('usePolls must be used within PollsProvider');
  }
  return context;
};

export const PollsProvider = ({ children }) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPolls();
  }, []);

  const loadPolls = () => {
    const stored = localStorage.getItem('communityPolls');
    if (stored) {
      const loadedPolls = JSON.parse(stored);
      // Ensure all options have voters array
      const normalizedPolls = loadedPolls.map(poll => ({
        ...poll,
        options: poll.options.map(opt => ({
          ...opt,
          voters: opt.voters || []
        }))
      }));
      setPolls(normalizedPolls);
    } else {
      // Default polls
      const defaultPolls = [
        {
          id: 1,
          title: '¿Deberíamos instalar cámaras de seguridad en la entrada?',
          description: 'Votación para decidir si instalamos un sistema de cámaras de seguridad en la entrada principal del vecindario.',
          options: [
            { id: 1, text: 'Sí, es necesario', votes: 45, voters: [] },
            { id: 2, text: 'No, es muy costoso', votes: 12, voters: [] },
            { id: 3, text: 'Necesito más información', votes: 8, voters: [] }
          ],
          totalVotes: 65,
          endsAt: '2025-02-15',
          status: 'active',
          creatorId: 1,
          creatorName: 'Admin',
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          title: 'Horario para recolección de basura',
          description: '¿Qué horario prefieres para la recolección de basura?',
          options: [
            { id: 1, text: 'Mañana (7:00 - 9:00)', votes: 32, voters: [] },
            { id: 2, text: 'Tarde (14:00 - 16:00)', votes: 28, voters: [] },
            { id: 3, text: 'Noche (19:00 - 21:00)', votes: 15, voters: [] }
          ],
          totalVotes: 75,
          endsAt: '2025-02-10',
          status: 'active',
          creatorId: 1,
          creatorName: 'Admin',
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('communityPolls', JSON.stringify(defaultPolls));
      setPolls(defaultPolls);
    }
    setLoading(false);
  };

  const savePolls = (updatedPolls) => {
    localStorage.setItem('communityPolls', JSON.stringify(updatedPolls));
    setPolls(updatedPolls);
  };

  // Crear votación
  const createPoll = (pollData) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    const newPoll = {
      id: Date.now(),
      title: pollData.title,
      description: pollData.description,
      options: pollData.options.map((text, index) => ({
        id: index + 1,
        text,
        votes: 0,
        voters: []
      })),
      totalVotes: 0,
      endsAt: pollData.endsAt,
      status: 'active',
      creatorId: user.id,
      creatorName: user.name,
      creatorAvatar: user.avatar,
      neighborhoodId: user.neighborhoodId,
      createdAt: new Date().toISOString()
    };

    const updated = [...polls, newPoll];
    savePolls(updated);
    showSuccessToast('¡Votación creada exitosamente!');
    
    return { success: true, poll: newPoll };
  };

  // Votar
  const vote = (pollId, optionId) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    const updated = polls.map(poll => {
      if (poll.id === pollId) {
        // Check if user already voted
        const hasVoted = poll.options.some(opt => opt.voters.includes(user.id));
        if (hasVoted) {
          return poll; // Already voted
        }

        const updatedOptions = poll.options.map(option => {
          if (option.id === optionId) {
            return {
              ...option,
              votes: option.votes + 1,
              voters: [...option.voters, user.id]
            };
          }
          return option;
        });

        return {
          ...poll,
          options: updatedOptions,
          totalVotes: poll.totalVotes + 1
        };
      }
      return poll;
    });

    savePolls(updated);
    showSuccessToast('¡Voto registrado!');
    return { success: true };
  };

  // Cerrar votación
  const closePoll = (pollId) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    const updated = polls.map(poll => {
      if (poll.id === pollId && poll.creatorId === user.id) {
        return { ...poll, status: 'closed' };
      }
      return poll;
    });

    savePolls(updated);
    return { success: true };
  };

  // Obtener votación por usuario
  const getUserVote = (pollId) => {
    if (!user) return null;
    
    const poll = polls.find(p => p.id === pollId);
    if (!poll) return null;

    for (const option of poll.options) {
      if (option.voters && option.voters.includes(user.id)) {
        return option.id;
      }
    }
    return null;
  };

  const value = {
    polls,
    loading,
    createPoll,
    vote,
    closePoll,
    getUserVote,
    refreshPolls: loadPolls
  };

  return <PollsContext.Provider value={value}>{children}</PollsContext.Provider>;
};
