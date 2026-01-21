import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import './MessagesDropdown.css';

const MessagesDropdown = ({ onClose }) => {
  const navigate = useNavigate();
  const { messages } = useApp();

  const handleSeeAll = () => {
    navigate('/mensajes');
    onClose();
  };

  return (
    <div className="messages-dropdown">
      <div className="dropdown-header">
        <h3>Mensajes</h3>
        <button className="more-btn">
          <MoreHorizIcon />
        </button>
      </div>
      
      <div className="messages-search">
        <input type="text" placeholder="Buscar mensajes..." />
      </div>
      
      <div className="messages-list">
        {messages.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">💬</span>
            <p>No hay mensajes aún</p>
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={`message-item ${msg.unread ? 'unread' : ''}`}>
              <div className="msg-avatar">
                <img src={msg.avatar} alt={msg.user} />
                {msg.online && <span className="online-indicator"></span>}
              </div>
              <div className="msg-content">
                <div className="msg-header">
                  <h4>{msg.user}</h4>
                  <span className="msg-time">{msg.time}</span>
                </div>
                <p className="msg-preview">{msg.message}</p>
              </div>
              {msg.unread && <span className="unread-dot"></span>}
            </div>
          ))
        )}
      </div>
      
      <div className="dropdown-footer">
        <button className="see-all-btn" onClick={handleSeeAll}>
          Ver Todo en Messenger
        </button>
      </div>
    </div>
  );
};

export default MessagesDropdown;
