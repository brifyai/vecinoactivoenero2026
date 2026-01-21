import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useVerification } from '../../context/VerificationContext';
import VerifiedBadge from '../VerifiedBadge/VerifiedBadge';
import EmojiPicker from '../EmojiPicker/EmojiPicker';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import './CommentsModal.css';

const CommentsModal = ({ post, onClose }) => {
  const { user } = useAuth();
  const { getVerificationStatus } = useVerification();
  const [commentText, setCommentText] = useState('');
  const [showReactionPicker, setShowReactionPicker] = useState(null);
  const [comments, setComments] = useState([
    {
      id: 1,
      authorId: 15,
      author: 'Pabalo Mukrani',
      avatar: 'https://i.pravatar.cc/40?img=15',
      content: 'Oooo muy lindo y dulce perrito feliz cumpleaños... 🎂',
      time: 'hace 30 min',
      likes: 12,
      reactions: { '👍': 8, '❤️': 3, '😊': 1 },
      replies: []
    },
    {
      id: 2,
      authorId: 16,
      author: 'Sufiya Elija',
      avatar: 'https://i.pravatar.cc/40?img=16',
      content: 'Muchas gracias 😊😊',
      time: 'hace 25 min',
      likes: 8,
      reactions: { '❤️': 5, '😊': 3 },
      replies: [
        {
          id: 3,
          authorId: 5,
          author: 'Anna Sthesia',
          avatar: 'https://i.pravatar.cc/40?img=5',
          content: '¡Felicitaciones! 🎉',
          time: 'hace 20 min',
          likes: 3,
          reactions: { '🎉': 2, '👍': 1 }
        }
      ]
    }
  ]);
  const [showReplies, setShowReplies] = useState({});

  const reactionEmojis = ['👍', '❤️', '😊', '😮', '😢', '😡'];

  const handleAddComment = () => {
    if (!commentText.trim()) return;

    const newComment = {
      id: Date.now(),
      authorId: user.id,
      author: user.name,
      avatar: user.avatar,
      content: commentText,
      time: 'Justo ahora',
      likes: 0,
      replies: []
    };

    setComments([...comments, newComment]);
    setCommentText('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  const handleEmojiSelect = (emoji) => {
    setCommentText(commentText + emoji);
  };

  const handleCommentReaction = (commentId, emoji) => {
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        const reactions = { ...comment.reactions };
        reactions[emoji] = (reactions[emoji] || 0) + 1;
        return { ...comment, reactions };
      }
      if (comment.replies) {
        return {
          ...comment,
          replies: comment.replies.map(reply => {
            if (reply.id === commentId) {
              const reactions = { ...reply.reactions };
              reactions[emoji] = (reactions[emoji] || 0) + 1;
              return { ...reply, reactions };
            }
            return reply;
          })
        };
      }
      return comment;
    }));
    setShowReactionPicker(null);
  };

  const toggleReplies = (commentId) => {
    setShowReplies({
      ...showReplies,
      [commentId]: !showReplies[commentId]
    });
  };

  return (
    <div className="comments-modal-overlay" onClick={onClose}>
      <div className="comments-modal" onClick={(e) => e.stopPropagation()}>
        <div className="comments-modal-header">
          <h2>Publicación de {post.author}</h2>
          <button className="close-modal-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="comments-modal-content">
          <div className="post-in-modal">
            <div className="post-header-modal">
              <img src={post.avatar} alt={post.author} />
              <div className="post-author-info-modal">
                <h4>{post.author}</h4>
                <span>{post.time}</span>
              </div>
            </div>

            <div className="post-content-modal">
              <p>{post.content}</p>
            </div>

            {post.image && (
              <div className="post-image-modal">
                <img src={post.image} alt="Post" />
              </div>
            )}

            <div className="post-stats-modal">
              <div className="reactions-count">
                <div className="reaction-icons">
                  {post.reactions && post.reactions.map((reaction, index) => (
                    <span key={index}>{reaction}</span>
                  ))}
                </div>
                <span>{post.likes} reacciones</span>
              </div>
              <div className="comments-count">
                {comments.length} comentarios
              </div>
            </div>
          </div>

          <div className="comments-list">
            {comments.map(comment => {
              const commentVerification = getVerificationStatus(comment.authorId);
              return (
                <div key={comment.id}>
                  <div className="comment-item">
                    <img src={comment.avatar} alt={comment.author} className="comment-avatar" />
                    <div className="comment-content">
                      <div className="comment-bubble">
                        <div className="comment-author-name">
                          <strong>{comment.author}</strong>
                          {commentVerification?.verified && <VerifiedBadge size="small" />}
                        </div>
                        <p>{comment.content}</p>
                      {comment.reactions && Object.keys(comment.reactions).length > 0 && (
                        <div className="comment-reactions">
                          {Object.entries(comment.reactions).map(([emoji, count]) => (
                            <span key={emoji} className="comment-reaction">
                              {emoji} {count}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="comment-actions">
                      <div className="comment-action-wrapper">
                        <button
                          onMouseEnter={() => setShowReactionPicker(comment.id)}
                          onMouseLeave={() => setShowReactionPicker(null)}
                        >
                          Me gusta
                        </button>
                        {showReactionPicker === comment.id && (
                          <div 
                            className="comment-reaction-picker"
                            onMouseEnter={() => setShowReactionPicker(comment.id)}
                            onMouseLeave={() => setShowReactionPicker(null)}
                          >
                            {reactionEmojis.map(emoji => (
                              <button
                                key={emoji}
                                className="reaction-emoji-btn"
                                onClick={() => handleCommentReaction(comment.id, emoji)}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <button>Responder</button>
                      <span className="comment-time">{comment.time}</span>
                    </div>
                  </div>
                </div>

                {comment.replies && comment.replies.length > 0 && (
                  <>
                    {!showReplies[comment.id] ? (
                      <button 
                        className="view-replies-btn"
                        onClick={() => toggleReplies(comment.id)}
                      >
                        <KeyboardArrowDownIcon fontSize="small" />
                        Ver {comment.replies.length} {comment.replies.length === 1 ? 'respuesta' : 'respuestas'}
                      </button>
                    ) : (
                      <>
                        <div className="comment-replies">
                          {comment.replies.map(reply => {
                            const replyVerification = getVerificationStatus(reply.authorId);
                            return (
                              <div key={reply.id} className="comment-item">
                                <img src={reply.avatar} alt={reply.author} className="comment-avatar" />
                                <div className="comment-content">
                                  <div className="comment-bubble">
                                    <div className="comment-author-name">
                                      <strong>{reply.author}</strong>
                                      {replyVerification?.verified && <VerifiedBadge size="small" />}
                                    </div>
                                    <p>{reply.content}</p>
                                  {reply.reactions && Object.keys(reply.reactions).length > 0 && (
                                    <div className="comment-reactions">
                                      {Object.entries(reply.reactions).map(([emoji, count]) => (
                                        <span key={emoji} className="comment-reaction">
                                          {emoji} {count}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="comment-actions">
                                  <div className="comment-action-wrapper">
                                    <button
                                      onMouseEnter={() => setShowReactionPicker(reply.id)}
                                      onMouseLeave={() => setShowReactionPicker(null)}
                                    >
                                      Me gusta
                                    </button>
                                    {showReactionPicker === reply.id && (
                                      <div 
                                        className="comment-reaction-picker"
                                        onMouseEnter={() => setShowReactionPicker(reply.id)}
                                        onMouseLeave={() => setShowReactionPicker(null)}
                                      >
                                        {reactionEmojis.map(emoji => (
                                          <button
                                            key={emoji}
                                            className="reaction-emoji-btn"
                                            onClick={() => handleCommentReaction(reply.id, emoji)}
                                          >
                                            {emoji}
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <button>Responder</button>
                                  <span className="comment-time">{reply.time}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        </div>
                        <button 
                          className="view-replies-btn"
                          onClick={() => toggleReplies(comment.id)}
                        >
                          Ocultar respuestas
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            );
          })}
          </div>
        </div>

        <div className="add-comment-section">
          <div className="add-comment-form">
            <img src={user?.avatar} alt={user?.name} />
            <div className="comment-input-wrapper">
              <input
                type="text"
                placeholder="Escribe un comentario..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <div className="comment-actions-icons">
                <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                <button className="comment-icon-btn">
                  <PhotoLibraryIcon />
                </button>
              </div>
            </div>
            <button 
              className="send-comment-btn"
              onClick={handleAddComment}
              disabled={!commentText.trim()}
            >
              <SendIcon fontSize="small" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentsModal;
