import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectCurrentAdmin, 
  selectAdminRole, 
  selectIsUVAdmin,
  setCurrentAdmin,
  fetchDashboardStats,
  fetchUserNeighborhoods,
  checkUserPermissions
} from '../../store/slices/adminDashboardSlice';
import { useReduxAuth } from '../../hooks/useReduxAuth';

// Componentes del Dashboard
import AdminSidebar from '../../components/AdminDashboard/AdminSidebar';
import AdminHeader from '../../components/AdminDashboard/AdminHeader';
import DashboardOverview from './DashboardOverview';
import TicketsManagement from './TicketsManagement';
import CampaignsManagement from './CampaignsManagement';
import UsersManagement from './UsersManagement';
import Analytics from './Analytics';
import EmergencyManagement from './EmergencyManagement';
import SettingsPage from './SettingsPage';

// Material UI
import { Box, CircularProgress, Alert } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import './AdminDashboard.css';

// Tema personalizado para el dashboard administrativo
const adminTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1a1a2e',
      light: '#16213e',
      dark: '#0f1419',
    },
    secondary: {
      main: '#ffd700',
      light: '#ffed4e',
      dark: '#b8860b',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a202c',
      secondary: '#4a5568',
    },
    error: {
      main: '#ef4444',
    },
    warning: {
      main: '#f59e0b',
    },
    success: {
      main: '#10b981',
    },
    info: {
      main: '#3b82f6',
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
        },
      },
    },
  },
});

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useReduxAuth();
  
  // Estados del Redux
  const currentAdmin = useSelector(selectCurrentAdmin);
  const adminRole = useSelector(selectAdminRole);
  const isUVAdmin = useSelector(selectIsUVAdmin);
  
  // Estados locales
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Verificar autenticación y permisos
  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        if (!isAuthenticated) {
          navigate('/iniciar-sesion-admin');
          return;
        }

        if (!user) {
          setError('Usuario no encontrado');
          setLoading(false);
          return;
        }

        console.log('🔐 Inicializando dashboard para usuario:', user.id);

        // ✅ NUEVO: Cargar vecindarios reales del usuario
        const neighborhoodsResult = await dispatch(fetchUserNeighborhoods(user.id));
        
        if (fetchUserNeighborhoods.rejected.match(neighborhoodsResult)) {
          console.error('❌ Error cargando vecindarios:', neighborhoodsResult.payload);
          setError('No tienes vecindarios asignados');
          setLoading(false);
          return;
        }

        const neighborhoods = neighborhoodsResult.payload;
        
        if (!neighborhoods || neighborhoods.length === 0) {
          setError('No tienes vecindarios asignados');
          setLoading(false);
          return;
        }

        console.log('✅ Vecindarios cargados:', neighborhoods.length);
        console.log('🏘️ Primer vecindario:', neighborhoods[0]);

        // ✅ NUEVO: Verificar permisos en el primer vecindario
        const firstNeighborhood = neighborhoods[0];
        const permissionsResult = await dispatch(
          checkUserPermissions({
            userId: user.id,
            neighborhoodId: firstNeighborhood.neighborhood.id
          })
        );

        if (checkUserPermissions.rejected.match(permissionsResult)) {
          console.error('❌ Error verificando permisos:', permissionsResult.payload);
          setError('No tienes permisos de administrador');
          setLoading(false);
          return;
        }

        console.log('✅ Permisos verificados:', permissionsResult.payload);

        // ✅ Configurar datos del administrador
        dispatch(setCurrentAdmin({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.email,
          avatar: user.user_metadata?.avatar_url
        }));

        // ✅ Cargar estadísticas del primer vecindario
        dispatch(fetchDashboardStats(firstNeighborhood.neighborhood.id));

        setLoading(false);
      } catch (err) {
        console.error('❌ Error checking admin access:', err);
        setError('Error al verificar permisos de administrador');
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [isAuthenticated, user, dispatch, navigate]);

  // Manejar toggle del sidebar
  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Pantalla de carga
  if (loading) {
    return (
      <ThemeProvider theme={adminTheme}>
        <CssBaseline />
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          minHeight="100vh"
          bgcolor="background.default"
        >
          <Box textAlign="center">
            <CircularProgress size={60} />
            <Box mt={2} color="text.secondary">
              Verificando permisos de administrador...
            </Box>
          </Box>
        </Box>
      </ThemeProvider>
    );
  }

  // Pantalla de error
  if (error) {
    return (
      <ThemeProvider theme={adminTheme}>
        <CssBaseline />
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          minHeight="100vh"
          bgcolor="background.default"
          p={3}
        >
          <Alert 
            severity="error" 
            sx={{ maxWidth: 400 }}
            action={
              <button 
                onClick={() => navigate('/iniciar-sesion-admin')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  textDecoration: 'underline',
                  cursor: 'pointer'
                }}
              >
                Volver al login
              </button>
            }
          >
            {error}
          </Alert>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={adminTheme}>
      <CssBaseline />
      <div className="admin-dashboard">
        {/* Sidebar */}
        <AdminSidebar 
          collapsed={sidebarCollapsed}
          onToggle={handleSidebarToggle}
          currentAdmin={currentAdmin}
          adminRole={adminRole}
        />
        
        {/* Contenido principal */}
        <div className={`admin-main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          {/* Header */}
          <AdminHeader 
            currentAdmin={currentAdmin}
            onSidebarToggle={handleSidebarToggle}
            sidebarCollapsed={sidebarCollapsed}
          />
          
          {/* Área de contenido */}
          <div className="admin-content-area">
            <Routes>
              <Route path="/" element={<Navigate to="/admin/dashboard/overview" replace />} />
              <Route path="/overview" element={<DashboardOverview />} />
              <Route path="/emergencies" element={<EmergencyManagement />} />
              <Route path="/tickets/*" element={<TicketsManagement />} />
              <Route path="/campaigns/*" element={<CampaignsManagement />} />
              <Route path="/users/*" element={<UsersManagement />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/admin/dashboard/overview" replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default AdminDashboard;