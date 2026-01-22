import { useState } from 'react';
import { useReduxAuth as useAuth } from '../../hooks/useReduxAuth';
import imageService from '../../services/imageService';
import { showSuccessToast, showErrorToast } from '../../utils/sweetalert';
import ImageUploader from '../ImageUploader/ImageUploader';
import CloseIcon from '@mui/icons-material/Close';
import './CreateStoryModal.css';

const CreateStoryModal = ({ onClose, onStoryCreated }) => {
  const { user } = useAuth();
  const [storyText, setStoryText] = useState('');
  const [storyImage, setStoryImage] = useState(null);
  const [backgroundColor, setBackgroundColor] = useState('#4facfe');

  const colors = [
    '#4facfe', '#f093fb', '#fa709a', '#fee140', 
    '#30cfd0', '#a8edea', '#fed6e3', '#c471f5'
  ];

  const handleImageSelect = (imageData) => {
    setStoryImage(imageData);
  };

  const handleCreateStory = () => {
    if (!storyText && !storyImage) {
      showErrorToast('Agrega texto o una imagen a tu historia');
      return;
    }

    const newStory = {
      id: Date.now(),
      name: user.name,
      avatar: user.avatar,
      image: storyImage,
      text: storyText,
      backgroundColor: backgroundColor,
      time: 'Justo ahora',
      createdAt: new Date().toISOString()
    };

    // Guardar en localStorage
    const stories = JSON.parse(localStorage.getItem('stories') || '[]');
    stories.unshift(newStory);
    localStorage.setItem('stories', JSON.stringify(stories));

    if (onStoryCreated) {
      onStoryCreated(newStory);
    }

    showSuccessToast('¡Historia creada exitosamente!');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="create-story-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Crear Historia</h2>
          <button className="close-modal-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="story-preview" style={{ background: storyImage ? 'transparent' : backgroundColor }}>
          {storyImage ? (
            <img src={storyImage} alt="Story preview" />
          ) : (
            <div className="story-text-preview">{storyText || 'Tu texto aquí...'}</div>
          )}
        </div>

        <div className="story-options">
          <div className="option-section">
            <h3>Texto</h3>
            <textarea
              placeholder="Escribe algo..."
              value={storyText}
              onChange={(e) => setStoryText(e.target.value)}
              maxLength="150"
            />
            <span className="char-count">{storyText.length}/150</span>
          </div>

          {!storyImage && (
            <div className="option-section">
              <h3>Color de Fondo</h3>
              <div className="color-picker">
                {colors.map((color) => (
                  <button
                    key={color}
                    className={`color-option ${backgroundColor === color ? 'active' : ''}`}
                    style={{ background: color }}
                    onClick={() => setBackgroundColor(color)}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="option-section">
            <h3>Imagen</h3>
            <ImageUploader
              onImageSelect={handleImageSelect}
              currentImage={storyImage}
              type="story"
              buttonText="Agregar Imagen"
            />
          </div>
        </div>

        <button className="create-story-btn" onClick={handleCreateStory}>
          Compartir Historia
        </button>
      </div>
    </div>
  );
};

export default CreateStoryModal;
