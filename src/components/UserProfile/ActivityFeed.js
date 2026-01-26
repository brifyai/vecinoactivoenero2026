import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsIcon from '@mui/icons-material/Settings';

const ActivityFeed = ({ isOwnProfile, activeTab }) => {
  if (!isOwnProfile || activeTab !== 'timeline') return null;

  return (
    <div className="activity-feed">
      <div className="feed-header">
        <h3>Feed de actividad</h3>
        <div className="feed-actions">
          <button><RefreshIcon fontSize="small" /></button>
          <button><SettingsIcon fontSize="small" /></button>
        </div>
      </div>
      <div className="feed-timeline">
        <h4>Hoy</h4>
        <div className="feed-item">
          <img src="https://i.pravatar.cc/40?img=12" alt="" />
          <div>
            <p><strong>Usuario</strong> comentó en una foto</p>
            <span>hace 3 horas</span>
          </div>
        </div>
        <div className="feed-item">
          <img src="https://i.pravatar.cc/40?img=1" alt="" />
          <div>
            <p><strong>Usuario</strong> le gustó una foto</p>
            <span>hace 5 horas</span>
          </div>
        </div>
        <button className="load-more-feed-btn">Cargar más</button>
      </div>
    </div>
  );
};

export default ActivityFeed;