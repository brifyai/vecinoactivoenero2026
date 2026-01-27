import { useState, useEffect } from 'react';
import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsIcon from '@mui/icons-material/Settings';
import supabaseActivityService from '../../services/supabaseActivityService';
import { useReduxAuth } from '../../hooks/useReduxAuth';

const ActivityFeed = ({ isOwnProfile, activeTab }) => {
  const { user } = useReduxAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    if (isOwnProfile && activeTab === 'timeline' && user?.id) {
      loadActivities();
    }
  }, [isOwnProfile, activeTab, user?.id]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const data = await supabaseActivityService.getUserActivities(user.id, 50);
      setActivities(data);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadActivities();
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 10);
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
    if (diffHours < 24) return `hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    if (diffDays < 7) return `hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const groupActivitiesByDate = (activities) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups = {
      today: [],
      yesterday: [],
      older: []
    };

    activities.forEach(activity => {
      const activityDate = new Date(activity.timestamp);
      const activityDay = new Date(activityDate.getFullYear(), activityDate.getMonth(), activityDate.getDate());

      if (activityDay.getTime() === today.getTime()) {
        groups.today.push(activity);
      } else if (activityDay.getTime() === yesterday.getTime()) {
        groups.yesterday.push(activity);
      } else {
        groups.older.push(activity);
      }
    });

    return groups;
  };

  if (!isOwnProfile || activeTab !== 'timeline') return null;

  const visibleActivities = activities.slice(0, visibleCount);
  const groupedActivities = groupActivitiesByDate(visibleActivities);

  return (
    <div className="activity-feed">
      <div className="feed-header">
        <h3>Feed de actividad</h3>
        <div className="feed-actions">
          <button onClick={handleRefresh} disabled={loading}>
            <RefreshIcon fontSize="small" />
          </button>
          <button><SettingsIcon fontSize="small" /></button>
        </div>
      </div>
      <div className="feed-timeline">
        {loading ? (
          <p style={{ textAlign: 'center', color: '#65676b', padding: '20px' }}>Cargando...</p>
        ) : activities.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#65676b', padding: '20px' }}>No hay actividades recientes</p>
        ) : (
          <>
            {groupedActivities.today.length > 0 && (
              <>
                <h4>Hoy</h4>
                {groupedActivities.today.map(activity => (
                  <div key={activity.id} className="feed-item">
                    <img 
                      src={activity.image || user?.avatar || 'https://i.pravatar.cc/40?img=1'} 
                      alt="" 
                    />
                    <div>
                      <p><strong>Tú</strong> {activity.action}</p>
                      <span>{formatTimestamp(activity.timestamp)}</span>
                    </div>
                  </div>
                ))}
              </>
            )}

            {groupedActivities.yesterday.length > 0 && (
              <>
                <h4>Ayer</h4>
                {groupedActivities.yesterday.map(activity => (
                  <div key={activity.id} className="feed-item">
                    <img 
                      src={activity.image || user?.avatar || 'https://i.pravatar.cc/40?img=1'} 
                      alt="" 
                    />
                    <div>
                      <p><strong>Tú</strong> {activity.action}</p>
                      <span>{formatTimestamp(activity.timestamp)}</span>
                    </div>
                  </div>
                ))}
              </>
            )}

            {groupedActivities.older.length > 0 && (
              <>
                <h4>Anteriores</h4>
                {groupedActivities.older.map(activity => (
                  <div key={activity.id} className="feed-item">
                    <img 
                      src={activity.image || user?.avatar || 'https://i.pravatar.cc/40?img=1'} 
                      alt="" 
                    />
                    <div>
                      <p><strong>Tú</strong> {activity.action}</p>
                      <span>{formatTimestamp(activity.timestamp)}</span>
                    </div>
                  </div>
                ))}
              </>
            )}

            {visibleCount < activities.length && (
              <button className="load-more-feed-btn" onClick={handleLoadMore}>
                Cargar más
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;