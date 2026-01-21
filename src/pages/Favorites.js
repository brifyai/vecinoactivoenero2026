import { useState } from 'react';
import { showSuccessToast, showConfirmDialog } from '../utils/sweetalert';
import StarIcon from '@mui/icons-material/Star';
import './Favorites.css';

const Favorites = () => {
  const [favorites, setFavorites] = useState([
    { id: 1, type: 'Publicación', title: 'Increíble foto de atardecer', author: 'John Doe', image: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=300&h=200&fit=crop' },
    { id: 2, type: 'Página', title: 'Fotografía de Viajes', author: 'Página de Viajes', image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=200&fit=crop' },
    { id: 3, type: 'Publicación', title: 'Deliciosa receta de comida', author: 'Chef Mike', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=200&fit=crop' },
    { id: 4, type: 'Video', title: 'Tutorial de ejercicios', author: 'Fitness Pro', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=300&h=200&fit=crop' },
  ]);

  const handleRemoveFavorite = async (id) => {
    const result = await showConfirmDialog(
      'Eliminar de Favoritos',
      '¿Estás seguro de que quieres eliminar este elemento de tus favoritos?',
      'Sí, eliminar',
      'Cancelar'
    );

    if (result.isConfirmed) {
      setFavorites(favorites.filter(item => item.id !== id));
      showSuccessToast('Eliminado de favoritos');
    }
  };

  return (
    <div className="favorites-page">
      <div className="favorites-header">
        <StarIcon className="header-icon" />
        <h1>Tus Favoritos</h1>
        <p>Todas tus publicaciones, páginas y contenido guardado en un solo lugar</p>
      </div>

      <div className="favorites-grid">
        {favorites.length === 0 ? (
          <div className="no-favorites">
            <StarIcon style={{ fontSize: 80, color: '#65676b' }} />
            <h3>No tienes favoritos aún</h3>
            <p>Guarda publicaciones, páginas y contenido que te guste</p>
          </div>
        ) : (
          favorites.map((item) => (
            <div key={item.id} className="favorite-card">
              <img src={item.image} alt={item.title} />
              <div className="favorite-content">
                <span className="favorite-type">{item.type}</span>
                <h3>{item.title}</h3>
                <p>{item.author}</p>
                <button 
                  className="remove-favorite-btn"
                  onClick={() => handleRemoveFavorite(item.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Favorites;
