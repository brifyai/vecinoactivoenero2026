import { useState, useEffect } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { showSuccessToast } from '../../utils/sweetalert';
import './PhotoLightbox.css';

const PhotoLightbox = ({ photos, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
    setLiked(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
    setLiked(false);
  };

  const handleDownload = () => {
    showSuccessToast('Foto descargada');
  };

  const handleShare = () => {
    showSuccessToast('Compartir foto');
  };

  const handleLike = () => {
    setLiked(!liked);
    showSuccessToast(liked ? 'Ya no te gusta' : '¡Te gusta esta foto!');
  };

  const currentPhoto = photos[currentIndex];

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <div className="lightbox-container" onClick={(e) => e.stopPropagation()}>
        <button className="lightbox-close" onClick={onClose}>
          <CloseIcon />
        </button>

        <button className="lightbox-nav lightbox-prev" onClick={handlePrevious}>
          <ChevronLeftIcon />
        </button>

        <div className="lightbox-content">
          <img src={currentPhoto.image} alt={currentPhoto.title} />
          
          <div className="lightbox-info">
            <h3>{currentPhoto.title}</h3>
            <p>{currentPhoto.description || 'Sin descripción'}</p>
            
            <div className="lightbox-actions">
              <button onClick={handleLike} className={liked ? 'liked' : ''}>
                {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                <span>{liked ? 'Te gusta' : 'Me gusta'}</span>
              </button>
              <button onClick={handleShare}>
                <ShareIcon />
                <span>Compartir</span>
              </button>
              <button onClick={handleDownload}>
                <DownloadIcon />
                <span>Descargar</span>
              </button>
            </div>

            <div className="lightbox-counter">
              {currentIndex + 1} / {photos.length}
            </div>
          </div>
        </div>

        <button className="lightbox-nav lightbox-next" onClick={handleNext}>
          <ChevronRightIcon />
        </button>
      </div>
    </div>
  );
};

export default PhotoLightbox;
