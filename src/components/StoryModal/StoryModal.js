import React, { useState, useEffect } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import './StoryModal.css';

const StoryModal = ({ stories, initialIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);

  const currentStory = stories[currentIndex];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'Escape') onClose();
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  if (!currentStory) return null;

  return (
    <div className="story-modal-overlay" onClick={onClose}>
      <div className="story-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-story-btn" onClick={onClose}>
          <CloseIcon />
        </button>

        <div className="story-progress-bars">
          {stories.map((_, index) => (
            <div key={index} className="progress-bar-container">
              <div 
                className="progress-bar-fill"
                style={{
                  width: index < currentIndex ? '100%' : 
                         index === currentIndex ? `${progress}%` : '0%'
                }}
              />
            </div>
          ))}
        </div>

        <div className="story-header">
          <div className="story-user-info">
            <img src={currentStory.avatar} alt={currentStory.name} />
            <div>
              <h4>{currentStory.name}</h4>
              <span>{currentStory.time || 'Hace 2 horas'}</span>
            </div>
          </div>
        </div>

        <div className="story-content">
          {currentStory.image && (
            <img src={currentStory.image} alt="Story" />
          )}
          {currentStory.text && (
            <div className="story-text">{currentStory.text}</div>
          )}
        </div>

        {currentIndex > 0 && (
          <button className="story-nav-btn prev" onClick={handlePrevious}>
            <ArrowBackIosIcon />
          </button>
        )}

        {currentIndex < stories.length - 1 && (
          <button className="story-nav-btn next" onClick={handleNext}>
            <ArrowForwardIosIcon />
          </button>
        )}
      </div>
    </div>
  );
};

export default StoryModal;
