import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePosts } from '../../context/PostsContext';
import { showSuccessToast, showInfoToast } from '../../utils/sweetalert';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import LinkIcon from '@mui/icons-material/Link';
import FacebookIcon from '@mui/icons-material/Facebook';
import './ShareModal.css';

const ShareModal = ({ post, onClose }) => {
  const { user } = useAuth();
  const { sharePost } = usePosts();
  const [shareText, setShareText] = useState('');
  const [shareMode, setShareMode] = useState('options'); // 'options' or 'feed'

  const handleShareToFeed = () => {
    sharePost(post.id, shareText);
    showSuccessToast('¡Publicación compartida exitosamente!');
    onClose();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://vecinoactivo.cl/post/${post.id}`);
    showSuccessToast('¡Enlace copiado al portapapeles!');
  };

  const handleSendMessenger = () => {
    showInfoToast('Función de enviar por Messenger próximamente!');
  };

  if (shareMode === 'feed') {
    return (
      <div className="share-modal-overlay" onClick={onClose}>
        <div className="share-modal" onClick={(e) => e.stopPropagation()}>
          <div className="share-modal-header">
            <h2>Compartir en tu muro</h2>
            <button className="close-modal-btn" onClick={onClose}>
              <CloseIcon />
            </button>
          </div>

          <div className="share-to-feed">
            <div className="share-input-area">
              <textarea
                placeholder="Di algo sobre esto..."
                value={shareText}
                onChange={(e) => setShareText(e.target.value)}
                autoFocus
              />
            </div>

            <div className="shared-post-preview">
              <div className="shared-post-header">
                <img src={post.avatar} alt={post.author} />
                <div className="shared-post-author">
                  <strong>{post.author}</strong>
                  <span>{post.time}</span>
                </div>
              </div>
              <div className="shared-post-content">{post.content}</div>
              {post.image && (
                <div className="shared-post-image">
                  <img src={post.image} alt="Publicación compartida" />
                </div>
              )}
            </div>

            <button className="share-btn" onClick={handleShareToFeed}>
              Compartir ahora
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="share-modal-header">
          <h2>Compartir publicación</h2>
          <button className="close-modal-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="share-options">
          <button className="share-option" onClick={() => setShareMode('feed')}>
            <div className="share-icon">
              <FacebookIcon />
            </div>
            <div className="share-text">
              <strong>Compartir en tu muro</strong>
              <span>Comparte esta publicación en tu línea de tiempo</span>
            </div>
          </button>

          <button className="share-option" onClick={handleSendMessenger}>
            <div className="share-icon">
              <SendIcon />
            </div>
            <div className="share-text">
              <strong>Enviar por Messenger</strong>
              <span>Comparte en un mensaje privado</span>
            </div>
          </button>

          <div className="share-divider"></div>

          <button className="share-option" onClick={handleCopyLink}>
            <div className="share-icon">
              <LinkIcon />
            </div>
            <div className="share-text">
              <strong>Copiar enlace</strong>
              <span>Copiar enlace al portapapeles</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
