import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useUserProfileState() {
  const location = useLocation();
  const [visiblePosts, setVisiblePosts] = useState(3);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'timeline');
  const [userPhotos, setUserPhotos] = useState([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Cargar fotos del usuario
  useEffect(() => {
    const photos = [
      { id: 1, url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=400&fit=crop', image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200&h=800&fit=crop', likes: 45, title: 'Foto 1', description: 'Hermosa foto' },
      { id: 2, url: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=400&h=400&fit=crop', image: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=1200&h=800&fit=crop', likes: 32, title: 'Foto 2', description: 'Momento especial' },
      { id: 3, url: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400&h=400&fit=crop', image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=1200&h=800&fit=crop', likes: 28, title: 'Foto 3', description: 'Recuerdo inolvidable' },
      { id: 4, url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&h=400&fit=crop', image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=1200&h=800&fit=crop', likes: 56, title: 'Foto 4', description: 'Gran momento' },
      { id: 5, url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop', image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=1200&h=800&fit=crop', likes: 41, title: 'Foto 5', description: 'Día perfecto' },
      { id: 6, url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=400&fit=crop', image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=1200&h=800&fit=crop', likes: 38, title: 'Foto 6', description: 'Aventura' },
      { id: 7, url: 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=400&h=400&fit=crop', image: 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=1200&h=800&fit=crop', likes: 52, title: 'Foto 7', description: 'Diversión' },
      { id: 8, url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop', image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&h=800&fit=crop', likes: 29, title: 'Foto 8', description: 'Alegría' },
      { id: 9, url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=400&fit=crop', image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1200&h=800&fit=crop', likes: 47, title: 'Foto 9', description: 'Felicidad' }
    ];
    setUserPhotos(photos);
  }, []);

  const loadMore = () => {
    setVisiblePosts(prev => Math.min(prev + 3, 10)); // Assuming max 10 posts
  };

  const handlePhotoClick = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return {
    visiblePosts,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    userPhotos,
    lightboxOpen,
    setLightboxOpen,
    lightboxIndex,
    loadMore,
    handlePhotoClick
  };
}