import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSidebar } from '../context/SidebarContext';
import { useAuth } from '../context/AuthContext';
import { showCreatePageDialog, showSuccessToast } from '../utils/sweetalert';
import storageService from '../services/storageService';
import PageCard from '../components/PageCard/PageCard';
import PublicIcon from '@mui/icons-material/Public';
import SearchIcon from '@mui/icons-material/Search';
import './Pages.css';

const Pages = () => {
  const navigate = useNavigate();
  const { isRightSidebarCollapsed } = useSidebar();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('suggestions');
  const [searchTerm, setSearchTerm] = useState('');
  const [pages, setPages] = useState([]);
  const [likedPages, setLikedPages] = useState([]);

  useEffect(() => {
    // Cargar páginas del storage
    const allPages = storageService.getPages();
    setPages(allPages);

    // Cargar páginas que le gustan al usuario
    if (user) {
      const userLikedPages = storageService.getLikedPages(user.id);
      setLikedPages(userLikedPages);
    }
  }, [user]);

  // Verificar si una página está seguida
  const isPageLiked = (pageId) => {
    return likedPages.includes(pageId);
  };

  // Toggle seguir/dejar de seguir una página
  const handleToggleFollow = (pageId, pageName) => {
    if (!user) {
      showSuccessToast('Debes iniciar sesión para seguir páginas');
      return;
    }

    if (isPageLiked(pageId)) {
      storageService.unlikePage(user.id, pageId);
      setLikedPages(likedPages.filter(id => id !== pageId));
      showSuccessToast(`Ya no sigues "${pageName}"`);
    } else {
      storageService.likePage(user.id, pageId);
      setLikedPages([...likedPages, pageId]);
      showSuccessToast(`Ahora sigues "${pageName}"`);
    }
  };

  // Manejar invitación a una página
  const handleInvite = (pageName) => {
    showSuccessToast(`Invitación enviada para "${pageName}"`);
  };

  const handleCreatePage = async () => {
    const result = await showCreatePageDialog();
    if (result.isConfirmed && result.value) {
      const { name, email, category, description } = result.value;
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const newPage = {
        id: Date.now(),
        name: name,
        slug: slug,
        email: email || `${slug}@gmail.com`,
        category: category,
        description: description,
        image: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&h=250&fit=crop',
        likes: 0,
        verified: false
      };
      
      // Guardar la nueva página
      const allPages = storageService.getPages();
      storageService.savePages([...allPages, newPage]);
      
      // El creador automáticamente le da like
      if (user) {
        storageService.likePage(user.id, newPage.id);
        setLikedPages([...likedPages, newPage.id]);
      }
      
      setPages([...pages, newPage]);
      showSuccessToast('¡Página creada exitosamente!');
      navigate(`/pagina/${newPage.slug}`);
    }
  };

  const filteredPages = pages.filter(page => {
    if (searchTerm && !page.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (activeTab === 'followed') return isPageLiked(page.id);
    if (activeTab === 'yours') return isPageLiked(page.id);
    return true;
  });

  return (
    <div className={`pages-page ${isRightSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="pages-center">
        {/* Filtro de vecindario */}
        {user?.neighborhoodId && (
          <div className="neighborhood-filter">
            <button className="filter-toggle active">
              <PublicIcon style={{ marginRight: '8px', fontSize: '20px' }} />
              Todas las Páginas
            </button>
          </div>
        )}

        {/* Buscador */}
        <div className="search-section">
          <div className="search-input-wrapper">
            <SearchIcon className="search-icon" />
            <input
              type="text"
              placeholder="Buscar páginas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="pages-tabs">
          <button
            className={`page-tab ${activeTab === 'suggestions' ? 'active' : ''}`}
            onClick={() => setActiveTab('suggestions')}
          >
            Sugerencias
          </button>
          <button
            className={`page-tab ${activeTab === 'followed' ? 'active' : ''}`}
            onClick={() => setActiveTab('followed')}
          >
            Seguidas
          </button>
          <button
            className={`page-tab ${activeTab === 'yours' ? 'active' : ''}`}
            onClick={() => setActiveTab('yours')}
          >
            Mis Páginas
          </button>
        </div>

        {/* Crear página card */}
        <div className="create-page-card" onClick={handleCreatePage} style={{ cursor: 'pointer' }}>
          <div className="create-icon">⊕</div>
          <h3>Crear Página</h3>
          <p>Crea una página para llegar a más personas</p>
        </div>

        {/* Grid de páginas */}
        <div className="pages-grid">
          {filteredPages.map(page => (
            <PageCard 
              key={page.id} 
              page={page} 
              isLiked={isPageLiked(page.id)}
              onToggleFollow={() => handleToggleFollow(page.id, page.name)}
              onInvite={() => handleInvite(page.name)}
            />
          ))}
        </div>

        {filteredPages.length === 0 && (
          <div className="no-pages">
            <p>No se encontraron páginas</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pages;
