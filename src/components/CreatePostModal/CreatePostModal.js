import React, { useState } from 'react';
import { useReduxAuth as useAuth } from '../../hooks/useReduxAuth';
import { useReduxPosts as usePosts } from '../../hooks/useReduxPosts';
import { showSuccessToast, showInfoToast } from '../../utils/sweetalert';
import ImageUploader from '../ImageUploader/ImageUploader';
import EmojiPicker from '../EmojiPicker/EmojiPicker';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PublicIcon from '@mui/icons-material/Public';
import PeopleIcon from '@mui/icons-material/People';
import LockIcon from '@mui/icons-material/Lock';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import TagFacesIcon from '@mui/icons-material/TagFaces';
import CelebrationIcon from '@mui/icons-material/Celebration';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import HotelIcon from '@mui/icons-material/Hotel';
import DescriptionIcon from '@mui/icons-material/Description';
import CampaignIcon from '@mui/icons-material/Campaign';
import WarningIcon from '@mui/icons-material/Warning';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SosIcon from '@mui/icons-material/Sos';
import './CreatePostModal.css';

const CreatePostModal = ({ onClose }) => {
  const { user } = useAuth();
  const { addPost } = usePosts();
  const [postText, setPostText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [feeling, setFeeling] = useState('');
  const [location, setLocation] = useState('');
  const [privacy, setPrivacy] = useState('public');
  const [category, setCategory] = useState('general');
  const [showPrivacyMenu, setShowPrivacyMenu] = useState(false);
  const [showFeelingMenu, setShowFeelingMenu] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

  const feelings = [
    { icon: <EmojiEmotionsIcon />, text: 'feliz' },
    { icon: <FavoriteIcon />, text: 'enamorado' },
    { icon: <SentimentVerySatisfiedIcon />, text: 'genial' },
    { icon: <SentimentVeryDissatisfiedIcon />, text: 'triste' },
    { icon: <TagFacesIcon />, text: 'divertido' },
    { icon: <CelebrationIcon />, text: 'celebrando' },
    { icon: <FitnessCenterIcon />, text: 'motivado' },
    { icon: <HotelIcon />, text: 'cansado' },
  ];

  const privacyOptions = [
    { value: 'public', icon: <PublicIcon />, label: 'Público', desc: 'Cualquiera dentro o fuera de Vecino Activo' },
    { value: 'friends', icon: <PeopleIcon />, label: 'Vecinos', desc: 'Tus vecinos en Vecino Activo' },
    { value: 'private', icon: <LockIcon />, label: 'Solo yo', desc: 'Solo tú puedes ver esto' },
  ];

  const categories = [
    { value: 'general', label: 'General', icon: <DescriptionIcon />, color: '#6b7280' },
    { value: 'anuncio', label: 'Anuncio', icon: <CampaignIcon />, color: '#3b82f6' },
    { value: 'seguridad', label: 'Seguridad', icon: <WarningIcon />, color: '#ef4444' },
    { value: 'marketplace', label: 'Marketplace', icon: <ShoppingCartIcon />, color: '#10b981' },
    { value: 'consulta', label: 'Consulta', icon: <HelpOutlineIcon />, color: '#f59e0b' },
    { value: 'evento', label: 'Evento', icon: <CelebrationIcon />, color: '#8b5cf6' },
    { value: 'emergencia', label: 'Emergencia', icon: <SosIcon />, color: '#dc2626' }
  ];

  const handleImageSelect = (imageData) => {
    setSelectedImage(imageData);
  };

  const handlePost = () => {
    if (!postText.trim() && !selectedImage) return;

    const newPost = {
      content: postText,
      image: selectedImage,
      feeling: feeling,
      location: location,
      privacy: privacy,
      category: category
    };

    addPost(newPost);
    showSuccessToast('¡Publicación creada exitosamente!');
    onClose();
  };

  const handleTagPeople = () => {
    showInfoToast('Función de etiquetar personas próximamente!');
  };

  const handleTagProduct = () => {
    showInfoToast('Función de etiquetar producto próximamente!');
  };

  const handleCheckIn = () => {
    const loc = prompt('Ingresa la ubicación:');
    if (loc) {
      setLocation(loc);
    }
  };

  const getPrivacyIcon = () => {
    const option = privacyOptions.find(opt => opt.value === privacy);
    return option ? option.icon : <PublicIcon />;
  };

  const handleEmojiSelect = (emoji) => {
    setPostText(postText + emoji);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="create-post-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Crear publicación</h2>
          <button className="close-modal-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="modal-user-info">
          <img src={user?.avatar} alt={user?.name} />
          <div className="user-details">
            <h4>{user?.name}</h4>
            <div className="post-settings">
              <button 
                className="privacy-btn"
                onClick={() => setShowPrivacyMenu(!showPrivacyMenu)}
              >
                {getPrivacyIcon()}
                <span>{privacyOptions.find(opt => opt.value === privacy)?.label}</span>
                <KeyboardArrowDownIcon fontSize="small" />
              </button>
              
              <button 
                className="category-btn"
                onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                style={{ borderColor: categories.find(c => c.value === category)?.color }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {categories.find(c => c.value === category)?.icon}
                  {categories.find(c => c.value === category)?.label}
                </span>
                <KeyboardArrowDownIcon fontSize="small" />
              </button>
            </div>
            
            {showPrivacyMenu && (
              <div className="privacy-menu">
                {privacyOptions.map(option => (
                  <button
                    key={option.value}
                    className={`privacy-option ${privacy === option.value ? 'active' : ''}`}
                    onClick={() => {
                      setPrivacy(option.value);
                      setShowPrivacyMenu(false);
                    }}
                  >
                    <div className="privacy-icon">{option.icon}</div>
                    <div className="privacy-text">
                      <strong>{option.label}</strong>
                      <span>{option.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {showCategoryMenu && (
              <div className="category-menu">
                {categories.map(cat => (
                  <button
                    key={cat.value}
                    className={`category-option ${category === cat.value ? 'active' : ''}`}
                    onClick={() => {
                      setCategory(cat.value);
                      setShowCategoryMenu(false);
                    }}
                    style={{ borderLeftColor: cat.color }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {cat.icon}
                      {cat.label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-content">
          <textarea
            placeholder={`¿Qué estás pensando, ${user?.name}?`}
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            autoFocus
          />

          {feeling && (
            <div className="post-tag">
              se siente <strong>{feeling}</strong>
              <button onClick={() => setFeeling('')}><CloseIcon fontSize="small" /></button>
            </div>
          )}

          {location && (
            <div className="post-tag">
              en <strong>{location}</strong>
              <button onClick={() => setLocation('')}><CloseIcon fontSize="small" /></button>
            </div>
          )}

          <ImageUploader 
            onImageSelect={handleImageSelect}
            currentImage={selectedImage}
            type="post"
            buttonText="Agregar Foto"
          />
        </div>

        <div className="add-to-post">
          <span>Agregar a tu publicación</span>
          <div className="add-options">
            <button className="add-option-btn" title="Etiquetar personas" onClick={handleTagPeople}>
              <PersonAddIcon style={{ color: '#1877f2' }} />
            </button>
            
            <EmojiPicker onEmojiSelect={handleEmojiSelect} />
            
            <button 
              className="add-option-btn" 
              title="Registrarse"
              onClick={handleCheckIn}
            >
              <LocationOnIcon style={{ color: '#f5533d' }} />
            </button>
            
            <button className="add-option-btn" title="Etiquetar producto" onClick={handleTagProduct}>
              <LocalOfferIcon style={{ color: '#8a3ab9' }} />
            </button>
          </div>
        </div>

        {showFeelingMenu && (
          <div className="feeling-menu">
            <h4>¿Cómo te sientes?</h4>
            <div className="feeling-options">
              {feelings.map((feel, index) => (
                <button
                  key={index}
                  className="feeling-option"
                  onClick={() => {
                    setFeeling(`${feel.text}`);
                    setShowFeelingMenu(false);
                  }}
                >
                  <span className="feeling-icon">{feel.icon}</span>
                  <span>{feel.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <button 
          className="post-btn"
          onClick={handlePost}
          disabled={!postText.trim() && !selectedImage}
        >
          Publicar
        </button>
      </div>
    </div>
  );
};

export default CreatePostModal;
