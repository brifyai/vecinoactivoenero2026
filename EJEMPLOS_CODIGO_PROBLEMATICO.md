# EJEMPLOS ESPECÍFICOS DE CÓDIGO PROBLEMÁTICO

## 1. COMPONENTE GIGANTE: SharedResources.js (762 líneas)

### Problema: Demasiadas Responsabilidades

```javascript
// ❌ ACTUAL - TODO EN UN ARCHIVO
const SharedResources = ({ hideHeader = false, hideStats = false }) => {
  // Estado de UI (8 useState)
  const [view, setView] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);

  // Estado de formularios (3 objetos complejos)
  const [newResource, setNewResource] = useState({...});
  const [reservationData, setReservationData] = useState({...});
  const [completeData, setCompleteData] = useState({...});

  // Lógica de filtrado
  const getFilteredResources = () => {
    let filtered = [];
    if (view === 'my-resources') {
      filtered = getMyResources();
    } else if (view === 'my-reservations') {
      return getMyReservations();
    } else if (view === 'pending') {
      return getPendingRequests();
    } else {
      filtered = resources.filter(r => r.isAvailable);
    }
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(r => r.category === categoryFilter);
    }
    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  };

  // Handlers (3 handlers principales)
  const handleAddResource = () => { ... };
  const handleReserve = () => { ... };
  const handleComplete = () => { ... };

  // JSX gigante (600+ líneas)
  return (
    <div>
      {/* Header */}
      {/* Stats */}
      {/* Controls */}
      {/* Filters */}
      {/* Grid con 2 vistas diferentes */}
      {/* 3 Modales diferentes */}
    </div>
  );
};
```

### ✅ SOLUCIÓN: Dividir en Componentes

```javascript
// hooks/useSharedResourcesFilters.js
export function useSharedResourcesFilters(resources) {
  const [view, setView] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getFilteredResources = () => {
    // Lógica de filtrado
  };

  return {
    view, setView,
    categoryFilter, setCategoryFilter,
    searchTerm, setSearchTerm,
    getFilteredResources
  };
}

// components/SharedResources/SharedResourcesHeader.js
const SharedResourcesHeader = ({ onAddClick }) => (
  <div className="resources-header">
    {/* Header content */}
  </div>
);

// components/SharedResources/SharedResourcesStats.js
const SharedResourcesStats = ({ resources, reservations }) => (
  <div className="resources-stats">
    {/* Stats content */}
  </div>
);

// components/SharedResources/SharedResourcesList.js
const SharedResourcesList = ({ resources, onReserve }) => (
  <div className="resources-grid">
    {/* List content */}
  </div>
);

// components/SharedResources/ReservationsList.js
const ReservationsList = ({ reservations, onComplete }) => (
  <div className="reservations-grid">
    {/* Reservations content */}
  </div>
);

// components/SharedResources/AddResourceModal.js
const AddResourceModal = ({ isOpen, onClose, onSubmit }) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    {/* Form content */}
  </Modal>
);

// pages/SharedResources/SharedResources.js (ahora ~150 líneas)
const SharedResources = ({ hideHeader = false, hideStats = false }) => {
  const { user } = useAuth();
  const { resources, reservations, addResource, reserveResource } = useSharedResources();
  const { view, categoryFilter, searchTerm, getFilteredResources } = useSharedResourcesFilters(resources);
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="shared-resources-page">
      {!hideHeader && <SharedResourcesHeader onAddClick={() => setShowAddModal(true)} />}
      {!hideStats && <SharedResourcesStats resources={resources} reservations={reservations} />}
      
      {view === 'all' && <SharedResourcesList resources={getFilteredResources()} />}
      {view === 'my-reservations' && <ReservationsList reservations={getFilteredResources()} />}
      
      {showAddModal && <AddResourceModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />}
    </div>
  );
};
```

---

## 2. DUPLICACIÓN EN SERVICIOS

### ❌ ACTUAL - Código Duplicado

```javascript
// supabaseAdminService.js
async createAdminRole(roleData) {
  try {
    console.log('👑 Creando rol administrativo:', roleData);
    const { data, error } = await supabase
      .from('admin_roles')
      .insert([{
        user_id: roleData.user_id,
        neighborhood_id: roleData.neighborhood_id,
        role_type: roleData.role_type,
        permissions: roleData.permissions || {},
        assigned_by: roleData.assigned_by
      }])
      .select('*')
      .single();
    if (error) throw error;
    console.log('✅ Rol administrativo creado exitosamente');
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error creando rol administrativo:', error);
    return { success: false, error: error.message };
  }
}

// supabaseCampaignsService.js - MISMO PATRÓN
async createCampaign(campaignData) {
  try {
    console.log('📢 Creando campaña:', campaignData);
    const { data, error } = await supabase
      .from('communication_campaigns')
      .insert([{
        neighborhood_id: campaignData.neighborhood_id,
        created_by: campaignData.created_by,
        name: campaignData.name,
        // ... más campos
      }])
      .select('*')
      .single();
    if (error) throw error;
    console.log('✅ Campaña creada exitosamente');
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error creando campaña:', error);
    return { success: false, error: error.message };
  }
}

// supabaseTicketsService.js - MISMO PATRÓN OTRA VEZ
async createTicket(ticketData) {
  try {
    console.log('🎫 Creando ticket:', ticketData);
    const { data, error } = await supabase
      .from('tickets')
      .insert([{
        neighborhood_id: ticketData.neighborhood_id,
        reporter_id: ticketData.reporter_id,
        title: ticketData.title,
        // ... más campos
      }])
      .select('*')
      .single();
    if (error) throw error;
    console.log('✅ Ticket creado exitosamente');
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error creando ticket:', error);
    return { success: false, error: error.message };
  }
}
```

### ✅ SOLUCIÓN: Clase Base Genérica

```javascript
// services/BaseSupabaseService.js
class BaseSupabaseService {
  constructor(tableName, logPrefix = '') {
    this.tableName = tableName;
    this.logPrefix = logPrefix;
  }

  async create(data, selectFields = '*') {
    try {
      console.log(`${this.logPrefix} Creando...`, data);
      const { data: result, error } = await supabase
        .from(this.tableName)
        .insert([data])
        .select(selectFields)
        .single();
      
      if (error) throw error;
      console.log(`${this.logPrefix} Creado exitosamente`);
      return { success: true, data: result };
    } catch (error) {
      console.error(`${this.logPrefix} Error:`, error);
      return { success: false, error: error.message };
    }
  }

  async getAll(filters = {}, selectFields = '*', orderBy = null) {
    try {
      console.log(`${this.logPrefix} Obteniendo...`, filters);
      let query = supabase.from(this.tableName).select(selectFields);
      
      // Aplicar filtros
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          query = query.eq(key, value);
        }
      });
      
      // Aplicar ordenamiento
      if (orderBy) {
        query = query.order(orderBy.field, { ascending: orderBy.ascending });
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      console.log(`${this.logPrefix} ${data?.length || 0} registros obtenidos`);
      return { success: true, data: data || [] };
    } catch (error) {
      console.error(`${this.logPrefix} Error:`, error);
      return { success: false, error: error.message, data: [] };
    }
  }

  async getById(id, selectFields = '*') {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(selectFields)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async update(id, updates, selectFields = '*') {
    try {
      console.log(`${this.logPrefix} Actualizando ${id}...`, updates);
      const { data, error } = await supabase
        .from(this.tableName)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select(selectFields)
        .single();
      
      if (error) throw error;
      console.log(`${this.logPrefix} Actualizado exitosamente`);
      return { success: true, data };
    } catch (error) {
      console.error(`${this.logPrefix} Error:`, error);
      return { success: false, error: error.message };
    }
  }

  async delete(id) {
    try {
      console.log(`${this.logPrefix} Eliminando ${id}...`);
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      console.log(`${this.logPrefix} Eliminado exitosamente`);
      return { success: true };
    } catch (error) {
      console.error(`${this.logPrefix} Error:`, error);
      return { success: false, error: error.message };
    }
  }
}

export default BaseSupabaseService;

// services/supabaseAdminService.js - AHORA SIMPLE
import BaseSupabaseService from './BaseSupabaseService';

class SupabaseAdminService extends BaseSupabaseService {
  constructor() {
    super('admin_roles', '👑');
  }

  async createAdminRole(roleData) {
    return this.create({
      user_id: roleData.user_id,
      neighborhood_id: roleData.neighborhood_id,
      role_type: roleData.role_type,
      permissions: roleData.permissions || {},
      assigned_by: roleData.assigned_by
    }, `*,
      user:user_id(name, email),
      neighborhood:neighborhood_id(nombre, codigo),
      assigner:assigned_by(name, email)
    `);
  }

  async getAdminRoles(filters = {}) {
    return this.getAll(filters, `*,
      user:user_id(name, email, avatar),
      neighborhood:neighborhood_id(nombre, codigo),
      assigner:assigned_by(name, email)
    `, { field: 'created_at', ascending: false });
  }
}

export default new SupabaseAdminService();

// services/supabaseCampaignsService.js - SIMILAR
import BaseSupabaseService from './BaseSupabaseService';

class SupabaseCampaignsService extends BaseSupabaseService {
  constructor() {
    super('communication_campaigns', '📢');
  }

  async createCampaign(campaignData) {
    return this.create({
      neighborhood_id: campaignData.neighborhood_id,
      created_by: campaignData.created_by,
      name: campaignData.name,
      // ... más campos
    });
  }

  async getCampaigns(filters = {}) {
    return this.getAll(filters, '*', { field: 'created_at', ascending: false });
  }
}

export default new SupabaseCampaignsService();
```

---

## 3. CONTEXTOS + REDUX DUPLICADOS

### ❌ ACTUAL - Duplicación

```javascript
// context/EventsContext.js
const EventsContext = createContext();

export function EventsProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const createEvent = async (eventData) => { ... };
  const getEvents = async () => { ... };
  const updateEvent = async (id, updates) => { ... };
  const deleteEvent = async (id) => { ... };

  return (
    <EventsContext.Provider value={{ events, loading, createEvent, getEvents, updateEvent, deleteEvent }}>
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  return useContext(EventsContext);
}

// store/slices/eventsSlice.js - MISMO ESTADO
const eventsSlice = createSlice({
  name: 'events',
  initialState: {
    events: [],
    loading: false,
    error: null
  },
  reducers: {
    setEvents: (state, action) => {
      state.events = action.payload;
    },
    addEvent: (state, action) => {
      state.events.push(action.payload);
    },
    updateEvent: (state, action) => {
      const index = state.events.findIndex(e => e.id === action.payload.id);
      if (index !== -1) {
        state.events[index] = action.payload;
      }
    },
    deleteEvent: (state, action) => {
      state.events = state.events.filter(e => e.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadEvents.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadEvents.fulfilled, (state, action) => {
        state.events = action.payload;
        state.loading = false;
      })
      .addCase(loadEvents.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  }
});

// En componentes:
const { events } = useEvents();  // Contexto
const { events } = useSelector(state => state.events);  // Redux
// ¿CUÁL USAR?
```

### ✅ SOLUCIÓN: Usar SOLO Redux

```javascript
// store/slices/eventsSlice.js
export const loadEvents = createAsyncThunk(
  'events/loadEvents',
  async ({ neighborhoodId, filters = {} }, { rejectWithValue }) => {
    try {
      const events = await supabaseEventsService.getEvents(neighborhoodId, filters);
      return events;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const eventsSlice = createSlice({
  name: 'events',
  initialState: {
    items: [],
    loading: false,
    error: null
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadEvents.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(loadEvents.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  }
});

export default eventsSlice.reducer;

// hooks/useEvents.js
export function useEvents() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector(state => state.events);

  const loadEvents = useCallback((neighborhoodId, filters) => {
    dispatch(loadEventsThunk({ neighborhoodId, filters }));
  }, [dispatch]);

  return { events: items, loading, error, loadEvents };
}

// En componentes:
const { events, loading } = useEvents();  // SOLO REDUX
```

---

## 4. COMPONENTE CON LÓGICA MEZCLADA

### ❌ ACTUAL - Lógica en Componente

```javascript
// pages/UserProfile.js (665 líneas)
const UserProfile = () => {
  const { username, slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user: currentUser } = useAuth();
  const { isRightSidebarCollapsed } = useSidebar();
  const [profileUser, setProfileUser] = useState(null);
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Determinar tipo de ruta
  const isPage = location.pathname.startsWith('/pagina/');
  const isGroup = location.pathname.startsWith('/grupo/');
  const isEvent = location.pathname.startsWith('/evento/');
  const isProject = location.pathname.startsWith('/proyecto/');
  const isHelp = location.pathname.startsWith('/ayuda/');
  const isResource = location.pathname.startsWith('/recursos/');
  const identifier = isPage || isGroup || isEvent || isProject || isHelp || isResource ? slug : username;

  useEffect(() => {
    if (!identifier) {
      setLoading(false);
      return;
    }

    if (isPage) {
      const pages = storageService.getPages();
      const foundPage = pages.find(p => p.slug === identifier || p.id === parseInt(identifier));
      if (foundPage) {
        setPageData(foundPage);
        setProfileUser({
          id: foundPage.id,
          name: foundPage.name,
          username: foundPage.slug,
          email: foundPage.email,
          avatar: foundPage.image || foundPage.avatar,
          bio: foundPage.description || `Página: ${foundPage.name}`,
          isPage: true
        });
      } else {
        showErrorToast('Página no encontrada');
        navigate('/paginas');
      }
    } else if (isGroup) {
      // ... más lógica
    } else if (isEvent) {
      // ... más lógica
    } else if (isProject) {
      // ... más lógica
    } else if (isHelp) {
      // ... más lógica
    } else if (isResource) {
      // ... más lógica
    } else {
      // ... más lógica
    }
  }, [identifier, isPage, isGroup, isEvent, isProject, isHelp, isResource]);

  // ... 600+ líneas de JSX
};
```

### ✅ SOLUCIÓN: Extraer Lógica a Hook

```javascript
// hooks/useUserProfileData.js
export function useUserProfileData(identifier, type) {
  const [profileUser, setProfileUser] = useState(null);
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!identifier) {
      setLoading(false);
      return;
    }

    const loadProfileData = async () => {
      try {
        let user = null;
        let data = null;

        switch (type) {
          case 'page':
            const pages = storageService.getPages();
            data = pages.find(p => p.slug === identifier || p.id === parseInt(identifier));
            if (data) {
              user = {
                id: data.id,
                name: data.name,
                username: data.slug,
                email: data.email,
                avatar: data.image || data.avatar,
                bio: data.description || `Página: ${data.name}`,
                isPage: true
              };
            }
            break;

          case 'group':
            const groups = storageService.getGroups();
            data = groups.find(g => g.slug === identifier || g.id === parseInt(identifier));
            if (data) {
              user = {
                id: data.id,
                name: data.name,
                username: data.slug,
                email: data.description,
                avatar: data.image,
                bio: `Grupo: ${data.name}`,
                members: data.members,
                isGroup: true
              };
            }
            break;

          // ... más casos
        }

        if (user) {
          setProfileUser(user);
          setPageData(data);
        } else {
          showErrorToast(`${type} no encontrado`);
          navigate(`/${type}s`);
        }
      } catch (error) {
        showErrorToast('Error cargando perfil');
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [identifier, type, navigate]);

  return { profileUser, pageData, loading };
}

// pages/UserProfile.js - AHORA SIMPLE
const UserProfile = () => {
  const { username, slug } = useParams();
  const location = useLocation();
  const { isRightSidebarCollapsed } = useSidebar();

  // Determinar tipo
  const type = location.pathname.startsWith('/pagina/') ? 'page'
    : location.pathname.startsWith('/grupo/') ? 'group'
    : location.pathname.startsWith('/evento/') ? 'event'
    : location.pathname.startsWith('/proyecto/') ? 'project'
    : location.pathname.startsWith('/ayuda/') ? 'help'
    : location.pathname.startsWith('/recursos/') ? 'resource'
    : 'user';

  const identifier = type !== 'user' ? slug : username;
  const { profileUser, pageData, loading } = useUserProfileData(identifier, type);

  if (loading) return <LoadingSpinner />;
  if (!profileUser) return <NotFound />;

  return (
    <div className={`user-profile ${isRightSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <ProfileHeader user={profileUser} />
      <ProfileContent user={profileUser} pageData={pageData} />
    </div>
  );
};
```

---

## 5. IMPORTS NO UTILIZADOS

### ❌ ACTUAL

```javascript
// src/pages/UserProfile.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useReduxAuth as useAuth } from '../hooks/useReduxAuth';
import { useSidebar } from '../context/SidebarContext';
import storageService from '../services/storageService';
import ProfileHeader from '../components/ProfileHeader/ProfileHeader';
import Post from '../components/Post/Post';  // ¿SE USA?
import EventsWidget from '../components/EventsWidget/EventsWidget';  // ¿SE USA?
import ActivityNewsWidget from '../components/ActivityNewsWidget/ActivityNewsWidget';  // ¿SE USA?
import PhotoLightbox from '../components/PhotoLightbox/PhotoLightbox';  // ¿SE USA?
import AccessTimeIcon from '@mui/icons-material/AccessTime';  // ¿SE USA?
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';  // ¿SE USA?
import RefreshIcon from '@mui/icons-material/Refresh';  // ¿SE USA?
import SettingsIcon from '@mui/icons-material/Settings';  // ¿SE USA?
import { showErrorToast, showSuccessToast } from '../utils/sweetalert';
import './Timeline.css';
```

### ✅ SOLUCIÓN: Limpiar Imports

```javascript
// src/pages/UserProfile.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useReduxAuth as useAuth } from '../hooks/useReduxAuth';
import { useSidebar } from '../context/SidebarContext';
import storageService from '../services/storageService';
import ProfileHeader from '../components/ProfileHeader/ProfileHeader';
import ProfileContent from '../components/ProfileContent/ProfileContent';
import { showErrorToast } from '../utils/sweetalert';
import './Timeline.css';
```

---

## 6. CÓDIGO COMENTADO EXTENSO

### ❌ ACTUAL

```javascript
// src/pages/Landing.js
// Iconos modernos
// import ConnectWithoutContactIcon from '@mui/icons-material/ConnectWithoutContact';
// import CelebrationIcon from '@mui/icons-material/Celebration';
// import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
// import StorefrontIcon from '@mui/icons-material/Storefront';
// import ForumIcon from '@mui/icons-material/Forum';
// import ExploreIcon from '@mui/icons-material/Explore';
// import HomeWorkIcon from '@mui/icons-material/HomeWork';
// import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
// import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

// Para las burbujas flotantes
// import EventIcon from '@mui/icons-material/Event';
// import SecurityIcon from '@mui/icons-material/Security';

// Pages removed - generic Facebook feature
// import Pages from './pages/Pages';

// Manejar envío del formulario de contacto
React.useEffect(() => {
  // Scroll suave para los enlaces de navegación
  const handleNavClick = (e) => {
    if (e.target.classList.contains('nav-link')) {
      e.preventDefault();
      const targetId = e.target.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        const headerHeight = 80; // Altura del header fijo actualizada
        const targetPosition = targetElement.offsetTop - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    }
  };

  // Marcar enlace activo según scroll
  const handleScroll = () => {
    // ... código
  };

  // Agregar event listeners
  document.addEventListener('click', handleNavClick);
  window.addEventListener('scroll', handleScroll);
  
  // Ejecutar una vez al cargar
  handleScroll();

  const handleFormSubmit = async (e) => {
    // ... código
  };

  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
    
    return () => {
      form.removeEventListener('submit', handleFormSubmit);
      document.removeEventListener('click', handleNavClick);
      window.removeEventListener('scroll', handleScroll);
    };
  } else {
    return () => {
      document.removeEventListener('click', handleNavClick);
      window.removeEventListener('scroll', handleScroll);
    };
  }
}, []);
```

### ✅ SOLUCIÓN: Extraer a Hooks

```javascript
// hooks/useLandingNavigation.js
export function useLandingNavigation() {
  useEffect(() => {
    const handleNavClick = (e) => {
      if (e.target.classList.contains('nav-link')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          const headerHeight = 80;
          const targetPosition = targetElement.offsetTop - headerHeight;
          window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        }
      }
    };

    const handleScroll = () => {
      const sections = ['about', 'what-is', 'features', 'contact'];
      const headerHeight = 80;
      const scrollPosition = window.scrollY + headerHeight + 100;
      
      let activeSection = '';
      sections.forEach(sectionId => {
        const element = document.getElementById(sectionId);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetBottom = offsetTop + element.offsetHeight;
          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            activeSection = sectionId;
          }
        }
      });
      
      document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href').substring(1);
        if (href === activeSection) {
          link.classList.add('active');
        }
      });
    };

    document.addEventListener('click', handleNavClick);
    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      document.removeEventListener('click', handleNavClick);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
}

// pages/Landing.js
const Landing = () => {
  useLandingNavigation();
  // ... resto del componente
};
```

