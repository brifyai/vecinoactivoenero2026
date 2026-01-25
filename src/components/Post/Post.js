import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/selectors/authSelectors';
import { useVerification } from '../../context/VerificationContext';
import { formatNumber } from '../../utils/formatNumber';
import VerifiedBadge from '../VerifiedBadge/VerifiedBadge';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import HandshakeIcon from '@mui/icons-material/Handshake';
import ChatIcon from '@mui/icons-material/Chat';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import FlagIcon from '@mui/icons-material/Flag';
import CommentsModal from '../CommentsModal/CommentsModal';
import ShareModal from '../ShareModal/ShareModal';
import ReactionsModal from '../ReactionsModal/ReactionsModal';
import ReportModal from '../ReportModal/ReportModal';
import './Post.css';

// Vecino Activo - Botones comunitarios: Me Uno, Opinar, Compartir
const Post = ({ post, onShare }) => {
  const user = useSelector(selectUser);
  const { getVerificationStatus } = useVerification();
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReactionsModal, setShowReactionsModal] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  const authorVerification = getVerificationStatus(post.authorId);

  // Reacciones Vecinales - Vecino Activo
  const reactions = [
    { emoji: '🤝', label: 'Apoyo', description: 'Solidaridad vecinal' },
    { emoji: '❤️', label: 'Me importa', description: 'Empatía comunitaria' },
    { emoji: '👏', label: 'Bien hecho', description: 'Reconocimiento' },
    { emoji: '💡', label: 'Buena idea', description: 'Propuestas útiles' },
    { emoji: '🙌', label: 'Cuenta conmigo', description: 'Compromiso de ayuda' }
  ];

  const getCategoryColor = (category) => {
    const colors = {
      anuncio: '#3b82f6',
      seguridad: '#ef4444',
      marketplace: '#10b981',
      consulta: '#f59e0b',
      evento: '#8b5cf6',
      emergencia: '#dc2626',
      general: '#6b7280'
    };
    return colors[category] || colors.general;
  };

  const getCategoryLabel = (category) => {
    const labels = {
      anuncio: '📢 Anuncio',
      seguridad: '🚨 Seguridad',
      marketplace: '🛒 Marketplace',
      consulta: '❓ Consulta',
      evento: '🎉 Evento',
      emergencia: '🆘 Emergencia',
      general: '📝 General'
    };
    return labels[category] || labels.general;
  };

  const handleReaction = (reaction) => {
    // Manejar tanto objetos de reacción como strings simples
    const reactionEmoji = typeof reaction === 'string' ? reaction : reaction.emoji;
    const reactionLabel = typeof reaction === 'string' ? '' : reaction.label;
    console.log('Reacted with:', reactionEmoji, reactionLabel);
    setShowReactionPicker(false);
  };

  return (
    <>
      <div className="post">
        <div className="post-header">
          <img src={post.author?.avatar || post.avatar} alt={post.author?.name || post.author} className="post-avatar" />
          <div className="post-author-info">
            <h4>
              {post.author?.name || post.author}
              {authorVerification?.verified && <VerifiedBadge size="small" />}
            </h4>
            <div className="post-meta">
              <span className="post-time">{post.time}</span>
              {post.category && post.category !== 'general' && (
                <span 
                  className="post-category-badge"
                  style={{
                    backgroundColor: getCategoryColor(post.category) + '20',
                    color: getCategoryColor(post.category),
                    borderColor: getCategoryColor(post.category)
                  }}
                >
                  {getCategoryLabel(post.category)}
                </span>
              )}
            </div>
          </div>
          <div className="post-menu-wrapper">
            <button className="post-menu" onClick={() => setShowOptionsMenu(!showOptionsMenu)}>
              <MoreHorizIcon />
            </button>
            {showOptionsMenu && (
              <div className="post-options-menu">
                {post.authorId !== user?.id && (
                  <button onClick={() => { setShowReportModal(true); setShowOptionsMenu(false); }}>
                    <FlagIcon /> Reportar publicación
                  </button>
                )}
                {post.authorId === user?.id && (
                  <>
                    <button onClick={() => setShowOptionsMenu(false)}>Editar publicación</button>
                    <button onClick={() => setShowOptionsMenu(false)}>Eliminar publicación</button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="post-content">
          <p>{post.content}</p>
          {post.hashtags && (
            <div className="post-hashtags">
              {post.hashtags.map((tag, index) => (
                <span key={index} className="hashtag">{tag}</span>
              ))}
            </div>
          )}
        </div>

        {post.image && (
          <div className="post-image">
            <img src={post.image} alt="Post" />
            <span className="post-duration">04:20</span>
          </div>
        )}

        <div className="post-reactions">
          <div className="reactions-left" onClick={() => setShowReactionsModal(true)}>
            {post.reactions && post.reactions.map((reaction, index) => (
              <span key={index} className="reaction-emoji">{reaction}</span>
            ))}
            <span className="reaction-count">{formatNumber(post.likes)}</span>
          </div>
          <div className="reactions-right">
            <span>💬 {formatNumber(post.comments)}</span>
            <span>🤝 {formatNumber(post.shares)}</span>
          </div>
        </div>

        <div className="post-actions">
          <div className="action-btn-wrapper">
            <button 
              className="action-btn"
              onMouseEnter={() => setShowReactionPicker(true)}
              onMouseLeave={() => setShowReactionPicker(false)}
            >
              <HandshakeIcon /> <span>Me Uno</span>
            </button>
            {showReactionPicker && (
              <div 
                className="reaction-picker"
                onMouseEnter={() => setShowReactionPicker(true)}
                onMouseLeave={() => setShowReactionPicker(false)}
              >
                {reactions.map((reaction, index) => (
                  <button
                    key={index}
                    className="reaction-picker-btn"
                    onClick={() => handleReaction(reaction)}
                    title={`${reaction.label} - ${reaction.description}`}
                  >
                    <span className="reaction-emoji-large">{reaction.emoji}</span>
                    <span className="reaction-label">{reaction.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="action-btn" onClick={() => setShowCommentsModal(true)}>
            <ChatIcon /> <span>Opinar</span>
          </button>
          <button className="action-btn" onClick={() => setShowShareModal(true)}>
            <HomeWorkIcon /> <span>Compartir</span>
          </button>
        </div>
      </div>

      {showCommentsModal && (
        <CommentsModal 
          post={post}
          onClose={() => setShowCommentsModal(false)}
        />
      )}

      {showShareModal && (
        <ShareModal 
          post={post}
          onClose={() => setShowShareModal(false)}
          onShare={onShare}
        />
      )}

      {showReactionsModal && (
        <ReactionsModal 
          post={post}
          onClose={() => setShowReactionsModal(false)}
        />
      )}

      {showReportModal && (
        <ReportModal 
          type="post"
          targetId={post.id}
          targetAuthor={post.author?.name || post.author}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </>
  );
};

export default Post;
