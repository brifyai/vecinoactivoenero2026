import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import StoryModal from '../StoryModal/StoryModal';
import CreateStoryModal from '../CreateStoryModal/CreateStoryModal';
import AddIcon from '@mui/icons-material/Add';
import './Stories.css';

const Stories = () => {
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = () => {
    const savedStories = JSON.parse(localStorage.getItem('stories') || '[]');
    // Filtrar stories que tengan menos de 24 horas
    const now = new Date();
    const validStories = savedStories.filter(story => {
      const storyDate = new Date(story.createdAt);
      const hoursDiff = (now - storyDate) / (1000 * 60 * 60);
      return hoursDiff < 24;
    });
    
    // Actualizar localStorage con stories válidas
    localStorage.setItem('stories', JSON.stringify(validStories));
    setStories(validStories);
  };

  const handleStoryClick = (index) => {
    setSelectedStoryIndex(index);
    setShowStoryModal(true);
  };

  const handleStoryCreated = (newStory) => {
    loadStories();
  };

  const defaultStories = [
    { id: 2, name: 'Josephin', avatar: 'https://i.pravatar.cc/80?img=9', color: '#4facfe', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop' },
    { id: 3, name: 'Paige', avatar: 'https://i.pravatar.cc/80?img=1', color: '#f093fb', image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop' },
    { id: 4, name: 'Bob', avatar: 'https://i.pravatar.cc/80?img=12', color: '#fa709a', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop' },
    { id: 5, name: 'Anna', avatar: 'https://i.pravatar.cc/80?img=5', color: '#fee140', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop' },
    { id: 6, name: 'Paul', avatar: 'https://i.pravatar.cc/80?img=13', color: '#30cfd0', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop' },
    { id: 7, name: 'Petey', avatar: 'https://i.pravatar.cc/80?img=14', color: '#a8edea', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop' },
    { id: 8, name: 'Anna M', avatar: 'https://i.pravatar.cc/80?img=10', color: '#fed6e3', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop' },
  ];

  const allStories = [...stories, ...defaultStories];

  return (
    <>
      <div className="stories-container">
        <div className="stories-scroll">
          <div className="story-item" onClick={() => setShowCreateModal(true)} style={{ cursor: 'pointer' }}>
            <div className="story-add">
              <AddIcon />
            </div>
            <span className="story-name">Agregar Historia</span>
          </div>

          {allStories.map((story, index) => (
            <div 
              key={story.id} 
              className="story-item" 
              onClick={() => handleStoryClick(index)}
              style={{ cursor: 'pointer' }}
            >
              <div className="story-avatar" style={{ background: `linear-gradient(135deg, ${story.color || story.backgroundColor} 0%, ${story.color || story.backgroundColor}99 100%)` }}>
                <img src={story.avatar} alt={story.name} />
              </div>
              <span className="story-name">{story.name}</span>
            </div>
          ))}
        </div>
      </div>

      {showStoryModal && (
        <StoryModal
          stories={allStories}
          initialIndex={selectedStoryIndex}
          onClose={() => setShowStoryModal(false)}
        />
      )}

      {showCreateModal && (
        <CreateStoryModal
          onClose={() => setShowCreateModal(false)}
          onStoryCreated={handleStoryCreated}
        />
      )}
    </>
  );
};

export default Stories;
