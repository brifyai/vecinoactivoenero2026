import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { showSuccessToast } from '../utils/sweetalert';

const GamificationContext = createContext();

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within GamificationProvider');
  }
  return context;
};

export const GamificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserStats();
      loadLeaderboard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadUserStats = () => {
    if (!user) return;
    
    const stored = localStorage.getItem(`userStats_${user.id}`);
    if (stored) {
      setUserStats(JSON.parse(stored));
    } else {
      const initialStats = {
        userId: user.id,
        points: 0,
        level: 1,
        levelName: 'Nuevo Vecino',
        badges: [],
        achievements: [],
        activities: {
          postsCreated: 0,
          commentsCreated: 0,
          projectsCreated: 0,
          projectsCompleted: 0,
          helpRequestsCreated: 0,
          helpOffered: 0,
          eventsAttended: 0,
          eventsOrganized: 0,
          resourcesShared: 0,
          reviewsWritten: 0,
          votesGiven: 0
        },
        streak: {
          current: 0,
          longest: 0,
          lastActiveDate: null
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setUserStats(initialStats);
      saveUserStats(initialStats);
    }
    setLoading(false);
  };

  const saveUserStats = (stats) => {
    if (!user) return;
    localStorage.setItem(`userStats_${user.id}`, JSON.stringify(stats));
    setUserStats(stats);
  };

  const loadLeaderboard = () => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const rankings = users.map(u => {
      const stats = localStorage.getItem(`userStats_${u.id}`);
      if (stats) {
        const parsed = JSON.parse(stats);
        return {
          userId: u.id,
          name: u.name,
          avatar: u.avatar,
          points: parsed.points,
          level: parsed.level,
          levelName: parsed.levelName,
          neighborhoodName: u.neighborhoodName
        };
      }
      return null;
    }).filter(Boolean);

    rankings.sort((a, b) => b.points - a.points);
    setLeaderboard(rankings);
  };

  // Sistema de puntos
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

  // Niveles
  const LEVELS = [
    { level: 1, name: 'Nuevo Vecino', minPoints: 0 },
    { level: 2, name: 'Vecino Activo', minPoints: 100 },
    { level: 3, name: 'Vecino Comprometido', minPoints: 300 },
    { level: 4, name: 'Líder Comunitario', minPoints: 600 },
    { level: 5, name: 'Héroe Vecinal', minPoints: 1000 }
  ];

  // Badges
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

  // Agregar puntos
  const addPoints = (action, amount = null) => {
    if (!user || !userStats) return;

    const points = amount || POINTS[action] || 0;
    const newPoints = userStats.points + points;

    // Calcular nuevo nivel
    let newLevel = userStats.level;
    let newLevelName = userStats.levelName;
    
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (newPoints >= LEVELS[i].minPoints) {
        newLevel = LEVELS[i].level;
        newLevelName = LEVELS[i].name;
        break;
      }
    }

    // Verificar si subió de nivel
    if (newLevel > userStats.level) {
      showSuccessToast(`¡Subiste a nivel ${newLevel}: ${newLevelName}! 🎉`);
    }

    const updatedStats = {
      ...userStats,
      points: newPoints,
      level: newLevel,
      levelName: newLevelName,
      updatedAt: new Date().toISOString()
    };

    saveUserStats(updatedStats);
    loadLeaderboard();
  };

  // Actualizar actividad
  const updateActivity = (activityType) => {
    if (!user || !userStats) return;

    const updatedStats = {
      ...userStats,
      activities: {
        ...userStats.activities,
        [activityType]: (userStats.activities[activityType] || 0) + 1
      },
      updatedAt: new Date().toISOString()
    };

    saveUserStats(updatedStats);
    checkBadges(updatedStats);
  };

  // Verificar y otorgar badges
  const checkBadges = (stats) => {
    const newBadges = [];

    // Primera publicación
    if (stats.activities.postsCreated === 1 && !stats.badges.includes('first_post')) {
      newBadges.push('first_post');
    }

    // Mariposa social
    if (stats.activities.commentsCreated >= 50 && !stats.badges.includes('social_butterfly')) {
      newBadges.push('social_butterfly');
    }

    // Iniciador de proyectos
    if (stats.activities.projectsCreated === 1 && !stats.badges.includes('project_starter')) {
      newBadges.push('project_starter');
    }

    // Maestro de proyectos
    if (stats.activities.projectsCompleted >= 5 && !stats.badges.includes('project_master')) {
      newBadges.push('project_master');
    }

    // Buen samaritano
    if (stats.activities.helpOffered >= 10 && !stats.badges.includes('good_samaritan')) {
      newBadges.push('good_samaritan');
    }

    // Organizador
    if (stats.activities.eventsOrganized >= 5 && !stats.badges.includes('event_organizer')) {
      newBadges.push('event_organizer');
    }

    // Compartir es cuidar
    if (stats.activities.resourcesShared >= 10 && !stats.badges.includes('sharing_is_caring')) {
      newBadges.push('sharing_is_caring');
    }

    // Racha semanal
    if (stats.streak.current >= 7 && !stats.badges.includes('week_streak')) {
      newBadges.push('week_streak');
    }

    // Racha mensual
    if (stats.streak.current >= 30 && !stats.badges.includes('month_streak')) {
      newBadges.push('month_streak');
    }

    if (newBadges.length > 0) {
      const updatedStats = {
        ...stats,
        badges: [...stats.badges, ...newBadges]
      };
      saveUserStats(updatedStats);

      newBadges.forEach(badgeId => {
        const badge = BADGES[badgeId.toUpperCase()];
        if (badge) {
          showSuccessToast(`¡Nuevo badge desbloqueado: ${badge.icon} ${badge.name}!`);
        }
      });
    }
  };

  // Actualizar racha diaria
  const updateStreak = () => {
    if (!user || !userStats) return;

    const today = new Date().toDateString();
    const lastActive = userStats.streak.lastActiveDate;

    if (lastActive === today) {
      return; // Ya se actualizó hoy
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    let newStreak = 1;
    if (lastActive === yesterdayStr) {
      newStreak = userStats.streak.current + 1;
    }

    const updatedStats = {
      ...userStats,
      streak: {
        current: newStreak,
        longest: Math.max(newStreak, userStats.streak.longest),
        lastActiveDate: today
      },
      updatedAt: new Date().toISOString()
    };

    saveUserStats(updatedStats);
    addPoints('DAILY_LOGIN');
    checkBadges(updatedStats);
  };

  // Obtener ranking del usuario
  const getUserRank = () => {
    if (!user) return null;
    const index = leaderboard.findIndex(u => u.userId === user.id);
    return index >= 0 ? index + 1 : null;
  };

  // Obtener top del barrio
  const getNeighborhoodLeaderboard = (neighborhoodId) => {
    return leaderboard.filter(u => u.neighborhoodId === neighborhoodId).slice(0, 10);
  };

  const value = {
    userStats,
    leaderboard,
    loading,
    BADGES,
    LEVELS,
    addPoints,
    updateActivity,
    updateStreak,
    getUserRank,
    getNeighborhoodLeaderboard,
    refreshStats: loadUserStats,
    refreshLeaderboard: loadLeaderboard
  };

  return <GamificationContext.Provider value={value}>{children}</GamificationContext.Provider>;
};
