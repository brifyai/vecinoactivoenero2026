import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectAuthLoading } from './store/selectors/authSelectors';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import { AppProvider } from './context/AppContext';
import { SearchProvider } from './context/SearchContext';
import { SidebarProvider } from './context/SidebarContext';
import { NeighborhoodProvider } from './context/NeighborhoodContext';
import { CommunityCalendarProvider } from './context/CommunityCalendarContext';
import { NeighborhoodsProvider } from './context/NeighborhoodsContext';

// Firebase Initializer
import FirebaseInitializer from './components/FirebaseInitializer/FirebaseInitializer';

import { NeighborhoodExpansionProvider } from './context/NeighborhoodExpansionContext';
import Layout from './components/Layout/Layout';
import AppInitializer from './components/AppInitializer/AppInitializer';
import ReduxInitializer from './components/ReduxInitializer/ReduxInitializer';
import RealtimeProvider from './components/RealtimeProvider/RealtimeProvider';
import HybridRealtimeProvider from './components/HybridRealtimeProvider/HybridRealtimeProvider';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Timeline from './pages/Timeline';
import About from './pages/About';
import Friends from './pages/Friends';
import Birthday from './pages/Birthday';
import Settings from './pages/Settings';
import Help from './pages/Help';
import Messenger from './pages/Messenger';
import Contact from './pages/Contact';
import Events from './pages/Events';
import Groups from './pages/Groups';
import ForgotPassword from './pages/ForgotPassword';
import Login from './pages/Login';
import VecinosLogin from './pages/VecinosLogin';
import AdminLogin from './pages/AdminLogin';
import UserTypeSelection from './pages/UserTypeSelection';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import Register from './pages/Register';
import RegisterSimple from './pages/RegisterSimple';
import NeighborhoodMap from './pages/NeighborhoodMap/NeighborhoodMap';
import Directory from './pages/Directory/Directory';
import NeighborhoodProfile from './pages/NeighborhoodProfile/NeighborhoodProfile';
import Projects from './pages/Projects/Projects';
import SharedResources from './pages/SharedResources/SharedResources';
import LocalBusinesses from './pages/LocalBusinesses/LocalBusinesses';
import CommunityCalendar from './pages/CommunityCalendar/CommunityCalendar';
import Polls from './pages/Polls/Polls';
import Community from './pages/Community/Community';
import CommunityHub from './pages/CommunityHub/CommunityHub';
import UserProfile from './pages/UserProfile';
// Pages removed - generic Facebook feature
// import Pages from './pages/Pages';
import Calendar from './pages/Calendar';
import Favorites from './pages/Favorites';
import History from './pages/History';
import Onboarding from './pages/Onboarding';
import DiscoverNeighbors from './pages/DiscoverNeighbors/DiscoverNeighbors';
import LocalNeeds from './pages/LocalNeeds/LocalNeeds';
import CommunityActions from './pages/CommunityActions/CommunityActions';
import Feed from './pages/Feed/Feed';
import DirectMessages from './pages/DirectMessages/DirectMessages';
import './App.css';

// Test components - only imported in development
const DiagnosticPage = React.lazy(() => import('./pages/DiagnosticPage'));
const WebSocketDiagnostic = React.lazy(() => import('./components/WebSocketDiagnostic/WebSocketDiagnostic'));
const HybridSystemTest = React.lazy(() => import('./components/HybridSystemTest/HybridSystemTest'));
const StorageTest = React.lazy(() => import('./components/StorageTest/StorageTest'));
const FirebaseTest = React.lazy(() => import('./components/FirebaseTest/FirebaseTest'));

// Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  
  // Durante la carga inicial, mostrar loading
  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }
  
  // Si no está autenticado, redirigir a login
  if (!isAuthenticated) {
    return <Navigate to="/iniciar-sesion" replace />;
  }
  
  // Si está autenticado, mostrar el contenido
  return children;
};

function App() {
  console.log('✅ App component rendering');
  return (
    <ErrorBoundary>
      <Router>
        <ReduxInitializer>
          <HybridRealtimeProvider>
            <RealtimeProvider>
              <AppInitializer />
              <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<Landing />} />
            <Route path="/iniciar-sesion" element={<UserTypeSelection />} />
            <Route path="/iniciar-sesion-vecinos" element={<VecinosLogin />} />
            <Route path="/iniciar-sesion-admin" element={<AdminLogin />} />
          <Route path="/registrarse" element={
            <NeighborhoodProvider>
              <Register />
            </NeighborhoodProvider>
          } />
          <Route path="/registro-simple" element={<RegisterSimple />} />
          <Route path="/recuperar-contrasena" element={<ForgotPassword />} />
          
          {/* Rutas de desarrollo - solo disponibles en modo desarrollo */}
          {process.env.NODE_ENV === 'development' && (
            <>
              <Route path="/diagnostico" element={
                <React.Suspense fallback={<div>Cargando...</div>}>
                  <DiagnosticPage />
                </React.Suspense>
              } />
              <Route path="/websocket-test" element={
                <React.Suspense fallback={<div>Cargando...</div>}>
                  <WebSocketDiagnostic />
                </React.Suspense>
              } />
              <Route path="/hybrid-test" element={
                <ProtectedRoute>
                  <React.Suspense fallback={<div>Cargando...</div>}>
                    <HybridSystemTest />
                  </React.Suspense>
                </ProtectedRoute>
              } />
              <Route path="/storage-test" element={
                <ProtectedRoute>
                  <React.Suspense fallback={<div>Cargando...</div>}>
                    <StorageTest />
                  </React.Suspense>
                </ProtectedRoute>
              } />
              <Route path="/firebase-test" element={
                <ProtectedRoute>
                  <React.Suspense fallback={<div>Cargando...</div>}>
                    <FirebaseInitializer>
                      <FirebaseTest />
                    </FirebaseInitializer>
                  </React.Suspense>
                </ProtectedRoute>
              } />
            </>
          )}
          
          {/* Rutas del Admin Dashboard */}
          <Route path="/admin/dashboard/*" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          {/* Rutas protegidas de la aplicación */}
          <Route path="/app/*" element={
            <ProtectedRoute>
              <FirebaseInitializer>
                <AppProvider>
                <SearchProvider>
                    <SidebarProvider>
                      <NeighborhoodProvider>
                            <CommunityCalendarProvider>
                                                  <NeighborhoodsProvider>
                                                      <NeighborhoodExpansionProvider>
                                                                  <Layout>
                                                                    <Routes>
                                                                      <Route path="/" element={<Home />} />
                                                                      <Route path="/onboarding" element={<Onboarding />} />
                                                                      <Route path="/descubrir-vecinos" element={<DiscoverNeighbors />} />
                                                                      <Route path="/feed" element={<Feed />} />
                                                                      <Route path="/mensajes-directos" element={<DirectMessages />} />
                                                                      <Route path="/mapa" element={<NeighborhoodMap />} />
                                                                      <Route path="/vecindario/:id" element={<NeighborhoodProfile />} />
                                                                      <Route path="/hub-comunitario" element={<CommunityHub />} />
                                                                      <Route path="/directorio" element={<Navigate to="/app/hub-comunitario?tab=directorio" replace />} />
                                                                      <Route path="/votaciones" element={<Navigate to="/app/hub-comunitario?tab=votaciones" replace />} />
                                                                      <Route path="/proyectos" element={<Navigate to="/app/hub-comunitario?tab=proyectos" replace />} />
                                                                      <Route path="/comunidad" element={<Community />} />
                                                                      <Route path="/proyecto/:slug" element={<UserProfile />} />
                                                                      <Route path="/recursos-compartidos" element={<SharedResources />} />
                                                                      <Route path="/recursos/:slug" element={<UserProfile />} />
                                                                      <Route path="/negocios-locales" element={<LocalBusinesses />} />
                                                                      <Route path="/calendario-comunitario" element={<CommunityCalendar />} />
                                                                      <Route path="/linea-tiempo" element={<Timeline />} />
                                                                      <Route path="/acerca-de" element={<About />} />
                                                                      <Route path="/vecinos" element={<Friends />} />
                                                                      <Route path="/cumpleanos" element={<Birthday />} />
                                                                      <Route path="/configuracion" element={<Settings />} />
                                                                      <Route path="/mensajes" element={<Messenger />} />
                                                                      <Route path="/eventos" element={<Events />} />
                                                                      <Route path="/grupo/:slug" element={<UserProfile />} />
                                                                      <Route path="/evento/:slug" element={<UserProfile />} />
                                                                      <Route path="/calendario" element={<Calendar />} />
                                                                      <Route path="/favoritos" element={<Favorites />} />
                                                                      <Route path="/historial" element={<History />} />
                                                                      <Route path="/ayuda" element={<Help />} />
                                                                      <Route path="/contacto" element={<Contact />} />
                                                                      <Route path="/:username" element={<UserProfile />} />
                                                                    </Routes>
                                                                  </Layout>
                                                      </NeighborhoodExpansionProvider>
                                                    </NeighborhoodsProvider>
                            </CommunityCalendarProvider>
                      </NeighborhoodProvider>
                    </SidebarProvider>
                </SearchProvider>
              </AppProvider>
              </FirebaseInitializer>
            </ProtectedRoute>
          } />
        </Routes>
        </RealtimeProvider>
      </HybridRealtimeProvider>
    </ReduxInitializer>
    </Router>
    </ErrorBoundary>
  );
}

export default App;
