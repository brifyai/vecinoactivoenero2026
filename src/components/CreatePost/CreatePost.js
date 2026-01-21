import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import VideocamIcon from '@mui/icons-material/Videocam';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import CreatePostModal from '../CreatePostModal/CreatePostModal';
import './CreatePost.css';

const CreatePost = ({ onPost }) => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="create-post">
        <div className="create-post-input" onClick={() => setShowModal(true)}>
          <img src={user?.avatar} alt="Usuario" />
          <input type="text" placeholder={`¿Qué hay de nuevo, ${user?.name}?`} readOnly />
        </div>
        <div className="create-post-actions">
          <button className="post-action-btn" onClick={() => setShowModal(true)}>
            <PhotoLibraryIcon /> Foto
          </button>
          <button className="post-action-btn" onClick={() => setShowModal(true)}>
            <VideocamIcon /> Video
          </button>
          <button className="post-action-btn" onClick={() => setShowModal(true)}>
            <EmojiEmotionsIcon /> Estado
          </button>
        </div>
      </div>

      {showModal && (
        <CreatePostModal 
          onClose={() => setShowModal(false)}
          onPost={onPost}
        />
      )}
    </>
  );
};

export default CreatePost;
