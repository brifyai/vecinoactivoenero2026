import { useState, useEffect } from 'react';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RefreshIcon from '@mui/icons-material/Refresh';
import supabaseActivityService from '../../services/supabaseActivityService';
import './ActivityNewsWidget.css';

const ActivityNewsWidget = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const data = await supabaseActivityService.getRecentActivities(10);
      setActivities(data);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60));

    if (diffInMinutes < 1) return 'hace un momento';
    if (diffInMinutes < 60) return `hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
    
    return activityTime.toLocaleDateString('es');
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'photo_comment':
        return '💬';
      case 'post_reaction':
        return '❤️';
      case 'new_post':
        return '📝';
      case 'new_event':
        return '📅';
      default:
        return '📢';
    }
  };

  const getDefaultAvatar = () => {
    return 'https://ui-avatars.com/api/?name=Usuario&background=0e8ce4&color=fff';
  };

  return (
    <div className="activity-news-widget">
      <div className="widget-header">
        <div className="widget-title">
          <TrendingUpIcon style={{ color: '#0e8ce4' }} />
          <h3>Feed de actividad</h3>
        </div>
        <button 
          className="refresh-btn" 
          onClick={loadActivities}
          disabled={loading}
          title="Actualizar"
        >
          <RefreshIcon fontSize="small" />
        </button>
      </div>

      {loading ? (
        <div className="activity-loading">
          <p>Cargando actividades...</p>
        </div>
      ) : activities.length === 0 ? (
        <div className="activity-empty">
          <p>No hay actividad reciente</p>
        </div>
      ) : (
        <div className="news-list">
          {activities.map((activity) => (
            <div key={activity.id} className="news-item">
              <div className="activity-avatar">
                <img 
                  src={activity.user?.avatar_url || getDefaultAvatar()} 
                  alt={activity.user?.username || 'Usuario'} 
                />
                <span className="activity-icon">{getActivityIcon(activity.type)}</span>
              </div>
              <div className="news-info">
                <h4>
                  <strong>{activity.user?.username || 'Usuario'}</strong> {activity.action}
                </h4>
                <p>{activity.target}</p>
                <span className="activity-time">{getTimeAgo(activity.timestamp)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityNewsWidget;
