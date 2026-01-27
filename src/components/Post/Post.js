import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectUser } from '../../store/selectors/authSelectors';
import { useReduxVerification } from '../../hooks/useReduxVerification';
import { formatNumber } from '../../utils/formatNumber';
import supabaseReactionsService from '../../services/supabaseReactionsService';
import VerifiedBadge from '../VerifiedBadge/VerifiedBadge';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import HandshakeIcon from '@mui/icons-material/Handshake';
import ChatIcon from '@mui/icons-material/Chat';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import FlagIcon from '@mui/icons-material/Flag';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CommentsModal from '../CommentsModal/CommentsModal';
import ShareModal from '../ShareModal/ShareModal';
import ReactionsModal from '../ReactionsModal/ReactionsModal';
import ReportModal from '../ReportModal/ReportModal';
import './Post.css';

// Vecino Activo - Botones comunitarios: Me Uno, Opinar, Compartir
const Post = ({ post, onShare }) => {
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const { getVerificationStatus } = useReduxVerification();
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReactionsModal, setShowReactionsModal] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [userReaction, setUserReaction] = useState(null);
  
  // Inicializar reacciones directamente desde el post
  const initialReactions = React.useMemo(() => {
    if (post.reactionEmojis && post.reactionEmojis.length > 0) {
      return post.reactionEmojis;
    }
    if (post.reactions && Array.isArray(post.reactions)) {
      const emojis = [...new Set(post.reactions.map(r => r.emoji))].filter(Boolean).slice(0, 3);
      return emojis;
    }
    return [];
  }, [post.reactions, post.reactionEmojis]);
  
  const initialLikesCount = React.useMemo(() => {
    return post.likes || (post.reactions && Array.isArray(post.reactions) ? post.reactions.length : 0);
  }, [post.likes, post.reactions]);
  
  const [postReactions, setPostReactions] = useState(initialReactions);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const authorVerification = getVerificationStatus(post.authorId);

  // Obtener el ID del autor de manera robusta
  const getAuthorId = () => {
    // Intentar diferentes formas de obtener el ID del autor
    if (post.authorId) return post.authorId;
    if (post.author?.id) return post.author.id;
    if (post.author_id) return post.author_id;
    if (post.userId) return post.userId;
    if (post.user_id) return post.user_id;
    
    console.warn('⚠️ No se pudo encontrar el ID del autor en el post:', post);
    return null;
  };

  const authorId = getAuthorId();

  // Función para navegar al perfil del usuario
  const goToProfile = (userId) => {
    if (!userId) {
      console.warn('⚠️ userId es undefined o null');
      return;
    }
    
    navigate(`/app/profile/${userId}`);
  };

  // Cargar reacción del usuario
  useEffect(() => {
    const loadUserReaction = async () => {
      if (!post.id || !user) return;

      try {
        const userReactionData = await supabaseReactionsService.getUserReaction(post.id, user.id);
        setUserReaction(userReactionData);
      } catch (error) {
        console.error('Error loading user reaction:', error);
      }
    };

    loadUserReaction();
  }, [post.id, user]);

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

  const handleReaction = async (reaction) => {
    if (!user) {
      alert('Debes iniciar sesión para reaccionar');
      return;
    }

    // Manejar tanto objetos de reacción como strings simples
    const reactionEmoji = typeof reaction === 'string' ? reaction : reaction.emoji;
    const reactionLabel = typeof reaction === 'string' ? '' : reaction.label;
    
    try {
      // Si el usuario ya tiene esta reacción, la quitamos
      if (userReaction === reactionEmoji) {
        await supabaseReactionsService.removeReaction(post.id, user.id);
        setUserReaction(null);
        setLikesCount(prev => Math.max(0, prev - 1));
        
        // Remover el emoji de las reacciones visibles
        setPostReactions(prev => {
          const newReactions = [...prev];
          const index = newReactions.indexOf(reactionEmoji);
          if (index > -1) {
            newReactions.splice(index, 1);
          }
          return newReactions;
        });
      } else {
        // Agregar o actualizar reacción
        await supabaseReactionsService.addOrUpdateReaction(post.id, user.id, reactionEmoji);
        
        // Si ya tenía una reacción diferente, la reemplazamos
        if (userReaction) {
          // Remover la reacción anterior de las reacciones visibles
          setPostReactions(prev => {
            const newReactions = prev.filter(r => r !== userReaction);
            // Agregar la nueva reacción si no está
            if (!newReactions.includes(reactionEmoji)) {
              return [reactionEmoji, ...newReactions].slice(0, 3);
            }
            return newReactions;
          });
          // No cambiamos el contador porque estamos reemplazando
        } else {
          // No tenía reacción, incrementamos el contador
          setLikesCount(prev => prev + 1);
          // Agregar el emoji a las reacciones visibles
          setPostReactions(prev => {
            if (!prev.includes(reactionEmoji)) {
              return [reactionEmoji, ...prev].slice(0, 3);
            }
            return prev;
          });
        }
        
        setUserReaction(reactionEmoji);
      }
      
      setShowReactionPicker(false);
    } catch (error) {
      console.error('Error al guardar reacción:', error);
      alert(`Error al guardar reacción: ${error?.message || 'Error desconocido'}`);
    }
  };

  // Navegación del carrusel
  const nextImage = () => {
    if (post.media && post.media.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % post.media.length);
    }
  };

  const prevImage = () => {
    if (post.media && post.media.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + post.media.length) % post.media.length);
    }
  };

  return (
    <>
      <div className="post">
        <div className="post-header">
          <img 
            src={post.author?.avatar || post.avatar} 
            alt={post.author?.name || 'Usuario'} 
            className="post-avatar"
            onClick={() => goToProfile(authorId)}
            style={{ cursor: 'pointer' }}
          />
          <div className="post-author-info">
            <h4 
              onClick={() => goToProfile(authorId)}
              style={{ cursor: 'pointer' }}
              className="post-author-name"
            >
              {post.author?.name || (typeof post.author === 'string' ? post.author : 'Usuario')}
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

        {post.media && post.media.length > 0 && (
          <>
            {post.media.length === 1 ? (
              // Una sola imagen
              <div className="post-image">
                <img src={post.media[0]} alt="Post" />
              </div>
            ) : post.media.length === 2 ? (
              // Dos imágenes en grid
              <div className="post-images-grid post-images-two">
                {post.media.map((imageUrl, index) => (
                  <div key={index} className="post-image">
                    <img src={imageUrl} alt={`Post imagen ${index + 1}`} />
                  </div>
                ))}
              </div>
            ) : (
              // Tres o más imágenes en carrusel
              <div className="post-carousel">
                <div className="post-carousel-container">
                  <img 
                    src={post.media[currentImageIndex]} 
                    alt={`Post imagen ${currentImageIndex + 1}`} 
                  />
                  
                  {/* Botones de navegación */}
                  <button 
                    className="carousel-btn carousel-btn-prev" 
                    onClick={prevImage}
                    aria-label="Imagen anterior"
                  >
                    <ChevronLeftIcon />
                  </button>
                  <button 
                    className="carousel-btn carousel-btn-next" 
                    onClick={nextImage}
                    aria-label="Siguiente imagen"
                  >
                    <ChevronRightIcon />
                  </button>
                  
                  {/* Indicadores de posición */}
                  <div className="carousel-indicators">
                    {post.media.map((_, index) => (
                      <button
                        key={index}
                        className={`carousel-indicator ${index === currentImageIndex ? 'active' : ''}`}
                        onClick={() => setCurrentImageIndex(index)}
                        aria-label={`Ir a imagen ${index + 1}`}
                      />
                    ))}
                  </div>
                  
                  {/* Contador de imágenes */}
                  <div className="carousel-counter">
                    {currentImageIndex + 1} / {post.media.length}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <div className="post-reactions">
          <div className="reactions-left" onClick={() => setShowReactionsModal(true)}>
            {postReactions && postReactions.length > 0 && postReactions.map((reaction, index) => (
              <span key={index} className="reaction-emoji">{reaction}</span>
            ))}
            {(!postReactions || postReactions.length === 0) && post.reactionEmojis && post.reactionEmojis.map((reaction, index) => (
              <span key={index} className="reaction-emoji">{reaction}</span>
            ))}
            <span className="reaction-count">{formatNumber(likesCount || 0)}</span>
          </div>
          <div className="reactions-right">
            <span>💬 {formatNumber(typeof post.comments === 'number' ? post.comments : (post.comments_count || 0))}</span>
            <span>🤝 {formatNumber(typeof post.shares === 'number' ? post.shares : (post.shares_count || 0))}</span>
          </div>
        </div>

        <div className="post-actions">
          <div className="action-btn-wrapper">
            <button 
              className={`action-btn ${userReaction ? 'reacted' : ''}`}
              onMouseEnter={() => setShowReactionPicker(true)}
              onMouseLeave={() => setShowReactionPicker(false)}
              onClick={() => !userReaction && handleReaction(reactions[0])}
            >
              <HandshakeIcon /> 
              <span>{userReaction ? `${userReaction} Me Uno` : 'Me Uno'}</span>
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
          targetAuthor={post.author?.name || (typeof post.author === 'string' ? post.author : 'Usuario')}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </>
  );
};

export default Post;
