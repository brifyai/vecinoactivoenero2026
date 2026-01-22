import { createContext, useContext, useState } from 'react';
import storageService from '../services/storageService';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/selectors/authSelectors';

const SearchContext = createContext();

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

export const SearchProvider = ({ children }) => {
  const user = useSelector(selectUser);
  const [searchResults, setSearchResults] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    const lowerQuery = query.toLowerCase();

    // Buscar en usuarios
    const allUsers = storageService.getUsers();
    const userResults = allUsers
      .filter(u => 
        u.id !== user?.id &&
        (u.name.toLowerCase().includes(lowerQuery) ||
        (u.email && u.email.toLowerCase().includes(lowerQuery)) ||
        (u.bio && u.bio.toLowerCase().includes(lowerQuery)) ||
        (u.location && u.location.toLowerCase().includes(lowerQuery)))
      )
      .map(u => ({
        type: 'user',
        id: u.id,
        name: u.name,
        avatar: u.avatar,
        subtitle: u.location || u.email,
        data: u
      }));

    // Buscar en posts
    const allPosts = storageService.getPosts();
    const postResults = allPosts
      .filter(p => 
        p.content.toLowerCase().includes(lowerQuery) ||
        (p.hashtags && p.hashtags.some(tag => tag.toLowerCase().includes(lowerQuery)))
      )
      .map(p => ({
        type: 'post',
        id: p.id,
        name: p.content.substring(0, 50) + '...',
        avatar: p.avatar,
        subtitle: `Por ${p.author} - ${p.time}`,
        data: p
      }));

    // Combinar resultados
    const results = [...userResults, ...postResults].slice(0, 20);
    setSearchResults(results);
    
    // Guardar en historial
    if (user) {
      storageService.addSearchHistory(user.id, query);
      loadSearchHistory();
    }
    
    setLoading(false);
  };

  const loadSearchHistory = () => {
    if (!user) return;
    const history = storageService.getSearchHistory(user.id);
    setSearchHistory(history);
  };

  const clearSearchHistory = () => {
    if (!user) return;
    storageService.clearSearchHistory(user.id);
    setSearchHistory([]);
  };

  const getTrendingSearches = () => {
    // Términos de búsqueda trending simulados
    return [
      'Fotografía',
      'Diseño Web',
      'Tutorial React',
      'Consejos de viaje',
      'Objetivos fitness',
      'Recetas saludables',
      'Música',
      'Eventos',
      'Grupos',
      'Páginas'
    ];
  };

  const value = {
    searchResults,
    searchHistory,
    loading,
    search,
    loadSearchHistory,
    clearSearchHistory,
    getTrendingSearches,
    clearResults: () => setSearchResults([])
  };

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
};
