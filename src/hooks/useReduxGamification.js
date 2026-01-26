import { useSelector, useDispatch } from 'react-redux';
import { useMemo } from 'react';
import {
  loadGamificationData,
  awardPoints
} from '../store/slices/gamificationSlice';
import {
  selectUserStats,
  selectLeaderboard,
  selectGamificationLoading,
  selectGamificationError,
  selectUserRank,
  selectNeighborhoodLeaderboard
} from '../store/selectors/gamificationSelectors';
import { selectUser } from '../store/selectors/authSelectors';
import { showSuccessToast } from '../utils/sweetalert';

export const useReduxGamification = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const userStats = useSelector(selectUserStats);
  const leaderboard = useSelector(selectLeaderboard);
  const loading = useSelector(selectGamificationLoading);
  const error = useSelector(selectGamificationError);

  const loadStats = () => {
    if (user) {
      dispatch(loadGamificationData(user.id));
    }
  };

  const addUserPoints = async (action, amount = null) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    try {
      const points = amount || POINTS[action] || 0;
      const result = await dispatch(awardPoints({ userId: user.id, points, reason: action })).unwrap();
      
      // Verificar si subió de nivel (lógica simple)
      const newLevel = calculateLevel(result.points);
      const oldLevel = calculateLevel((result.points || 0) - points);
      
      if (newLevel > oldLevel) {
        const levelName = LEVELS.find(l => l.level === newLevel)?.name || 'Vecino';
        showSuccessToast(`¡Subiste a nivel ${newLevel}: ${levelName}! 🎉`);
      }
      
      return { success: true, result };
    } catch (error) {
      return { success: false, error };
    }
  };

  // Función helper para calcular nivel
  const calculateLevel = (points) => {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (points >= LEVELS[i].minPoints) {
        return LEVELS[i].level;
      }
    }
    return 1;
  };

  // Funciones simuladas para compatibilidad
  const updateUserActivity = async (activityType) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    try {
      // Actualizar actividad en localStorage
      const statsKey = `gamification_${user.id}`;
      const currentStats = JSON.parse(localStorage.getItem(statsKey) || '{}');
      const activities = currentStats.activities || {};
      activities[activityType] = (activities[activityType] || 0) + 1;
      
      const updatedStats = {
        ...currentStats,
        activities,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem(statsKey, JSON.stringify(updatedStats));
      dispatch(loadGamificationData(user.id));
      
      return { success: true, result: updatedStats };
    } catch (error) {
      return { success: false, error };
    }
  };

  const updateUserStreak = async () => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    try {
      const statsKey = `gamification_${user.id}`;
      const currentStats = JSON.parse(localStorage.getItem(statsKey) || '{}');
      const today = new Date().toDateString();
      const lastActive = currentStats.streak?.lastActiveDate;

      if (lastActive === today) {
        return { success: true, result: currentStats };
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();

      let newStreak = 1;
      if (lastActive === yesterdayStr) {
        newStreak = (currentStats.streak?.current || 0) + 1;
      }

      const updatedStats = {
        ...currentStats,
        streak: {
          current: newStreak,
          longest: Math.max(newStreak, currentStats.streak?.longest || 0),
          lastActiveDate: today
        },
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem(statsKey, JSON.stringify(updatedStats));
      dispatch(loadGamificationData(user.id));
      
      // Agregar puntos por login diario
      await addUserPoints('DAILY_LOGIN');
      
      return { success: true, result: updatedStats };
    } catch (error) {
      return { success: false, error };
    }
  };

  // Helper functions - usando useMemo para optimización
  const getUserRank = useMemo(() => {
    if (!user) return null;
    const index = leaderboard.findIndex(u => u.userId === user.id);
    return index >= 0 ? index + 1 : null;
  }, [leaderboard, user]);

  const getNeighborhoodLeaderboard = useMemo(() => {
    return (neighborhoodId) => {
      return leaderboard.filter(u => u.neighborhoodId === neighborhoodId).slice(0, 10);
    };
  }, [leaderboard]);

  // Constantes del sistema de gamificación
  const POINTS = {
    POST_CREATED: 5,
    COMMENT_CREATED: 2,
    PROJECT_CREATED: 50,
    PROJECT_COMPLETED: 100,
    PROJECT_VOTE: 1,
    HELP_REQUEST: 10,
    HELP_OFFERED: 20,
    HELP_COMPLETED: 30,
    EVENT_CREATED: 15,
    EVENT_ATTENDED: 10,
    RESOURCE_SHARED: 25,
    REVIEW_WRITTEN: 5,
    DAILY_LOGIN: 5
  };

  const LEVELS = [
    { level: 1, name: 'Nuevo Vecino', minPoints: 0 },
    { level: 2, name: 'Vecino Activo', minPoints: 100 },
    { level: 3, name: 'Vecino Comprometido', minPoints: 300 },
    { level: 4, name: 'Líder Comunitario', minPoints: 600 },
    { level: 5, name: 'Héroe Vecinal', minPoints: 1000 }
  ];

  const BADGES = {
    FIRST_POST: { id: 'first_post', name: 'Primera Publicación', icon: 'CreateIcon', description: 'Creaste tu primera publicación' },
    SOCIAL_BUTTERFLY: { id: 'social_butterfly', name: 'Mariposa Social', icon: 'GroupsIcon', description: '50 comentarios creados' },
    PROJECT_STARTER: { id: 'project_starter', name: 'Iniciador de Proyectos', icon: 'RocketLaunchIcon', description: 'Creaste tu primer proyecto' },
    PROJECT_MASTER: { id: 'project_master', name: 'Maestro de Proyectos', icon: 'EmojiEventsIcon', description: 'Completaste 5 proyectos' },
    GOOD_SAMARITAN: { id: 'good_samaritan', name: 'Buen Samaritano', icon: 'VolunteerActivismIcon', description: 'Ayudaste a 10 vecinos' },
    EVENT_ORGANIZER: { id: 'event_organizer', name: 'Organizador', icon: 'CelebrationIcon', description: 'Organizaste 5 eventos' },
    SHARING_IS_CARING: { id: 'sharing_is_caring', name: 'Compartir es Cuidar', icon: 'CardGiftcardIcon', description: 'Compartiste 10 recursos' },
    WEEK_STREAK: { id: 'week_streak', name: 'Racha Semanal', icon: 'LocalFireDepartmentIcon', description: '7 días consecutivos activo' },
    MONTH_STREAK: { id: 'month_streak', name: 'Racha Mensual', icon: 'StarIcon', description: '30 días consecutivos activo' },
    TOP_10: { id: 'top_10', name: 'Top 10', icon: 'MilitaryTechIcon', description: 'Entraste al top 10 del ranking' }
  };

  return {
    userStats,
    leaderboard,
    loading,
    error,
    POINTS,
    LEVELS,
    BADGES,
    loadStats,
    addPoints: addUserPoints,
    updateActivity: updateUserActivity,
    updateStreak: updateUserStreak,
    // Helper functions
    getUserRank,
    getNeighborhoodLeaderboard
  };
};