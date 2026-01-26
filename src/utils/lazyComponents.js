// ============================================
// LAZY LOADING DE COMPONENTES
// Carga diferida para mejorar performance inicial
// ============================================

import React, { lazy } from 'react';

// ============================================
// PÁGINAS PRINCIPALES
// ============================================

// Páginas de autenticación (carga inmediata)
export const Landing = lazy(() => import('../pages/Landing'));
export const Login = lazy(() => import('../pages/Login'));
export const Register = lazy(() => import('../pages/Register'));
export const AdminLogin = lazy(() => import('../pages/AdminLogin'));

// Páginas principales (carga diferida)
export const Home = lazy(() => import('../pages/Home'));
export const Feed = lazy(() => import('../pages/Feed/Feed'));
export const DirectMessages = lazy(() => import('../pages/DirectMessages/DirectMessages'));
export const NeighborhoodMap = lazy(() => import('../pages/NeighborhoodMap/NeighborhoodMap'));

// ============================================
// PÁGINAS COMUNITARIAS
// ============================================

export const CommunityHub = lazy(() => import('../pages/CommunityHub/CommunityHub'));
export const DiscoverNeighbors = lazy(() => import('../pages/DiscoverNeighbors/DiscoverNeighbors'));
export const Directory = lazy(() => import('../pages/Directory/Directory'));
export const Projects = lazy(() => import('../pages/Projects/Projects'));
export const Polls = lazy(() => import('../pages/Polls/Polls'));

// ============================================
// PÁGINAS DE SERVICIOS
// ============================================

export const LocalBusinesses = lazy(() => import('../pages/LocalBusinesses/LocalBusinesses'));
export const SharedResources = lazy(() => import('../pages/SharedResources/SharedResources'));
export const LocalNeeds = lazy(() => import('../pages/LocalNeeds/LocalNeeds'));
export const CommunityActions = lazy(() => import('../pages/CommunityActions/CommunityActions'));

// ============================================
// PÁGINAS SOCIALES
// ============================================

export const Friends = lazy(() => import('../pages/Friends'));
export const Groups = lazy(() => import('../pages/Groups'));
export const Events = lazy(() => import('../pages/Events'));
export const Calendar = lazy(() => import('../pages/Calendar'));

// ============================================
// PÁGINAS DE PERFIL Y CONFIGURACIÓN
// ============================================

export const UserProfile = lazy(() => import('../pages/UserProfile'));
export const Settings = lazy(() => import('../pages/Settings'));
export const Help = lazy(() => import('../pages/Help'));

// ============================================
// ADMIN DASHBOARD
// ============================================

export const AdminDashboard = lazy(() => import('../pages/AdminDashboard/AdminDashboard'));

// ============================================
// COMPONENTES PESADOS
// ============================================

export const NotificationsCenter = lazy(() => import('../components/NotificationsCenter/NotificationsCenter'));
export const ChatWindow = lazy(() => import('../components/ChatWindow/ChatWindow'));
export const CreatePostModal = lazy(() => import('../components/CreatePostModal/CreatePostModal'));
export const PhotoLightbox = lazy(() => import('../components/PhotoLightbox/PhotoLightbox'));

// ============================================
// COMPONENTES DE TESTING
// ============================================

export const HybridSystemTest = lazy(() => import('../components/HybridSystemTest/HybridSystemTest'));
export const StorageTest = lazy(() => import('../components/StorageTest/StorageTest'));
export const FirebaseTest = lazy(() => import('../components/FirebaseTest/FirebaseTest'));
export const DiagnosticPage = lazy(() => import('../pages/DiagnosticPage'));

// ============================================
// CONFIGURACIÓN DE PRELOAD
// ============================================

// Precargar componentes críticos después del login
export const preloadCriticalComponents = () => {
  // Precargar componentes que se usan frecuentemente
  const criticalComponents = [
    () => import('../pages/Home'),
    () => import('../pages/Feed/Feed'),
    () => import('../components/NotificationsCenter/NotificationsCenter'),
    () => import('../components/ChatWindow/ChatWindow')
  ];

  // Precargar con un pequeño delay para no bloquear la UI
  setTimeout(() => {
    criticalComponents.forEach(importFn => {
      importFn().catch(err => console.warn('Error precargando componente:', err));
    });
  }, 1000);
};

// Precargar componentes de admin después del login de admin
export const preloadAdminComponents = () => {
  const adminComponents = [
    () => import('../pages/AdminDashboard/AdminDashboard'),
    () => import('../pages/AdminDashboard/DashboardOverview'),
    () => import('../pages/AdminDashboard/UsersManagement'),
    () => import('../pages/AdminDashboard/EmergencyManagement')
  ];

  setTimeout(() => {
    adminComponents.forEach(importFn => {
      importFn().catch(err => console.warn('Error precargando componente admin:', err));
    });
  }, 500);
};

// ============================================
// UTILIDADES DE LAZY LOADING
// ============================================

// Componente de loading personalizado
export const LazyLoadingFallback = ({ message = 'Cargando...' }) => (
  <div className="lazy-loading-fallback">
    <div className="loading-spinner"></div>
    <p>{message}</p>
  </div>
);

// HOC para lazy loading con error boundary
export const withLazyLoading = (LazyComponent, fallbackMessage) => {
  return React.forwardRef((props, ref) => (
    <React.Suspense fallback={<LazyLoadingFallback message={fallbackMessage} />}>
      <LazyComponent {...props} ref={ref} />
    </React.Suspense>
  ));
};