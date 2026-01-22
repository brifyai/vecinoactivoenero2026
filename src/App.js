import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { SearchProvider } from './context/SearchContext';
import { ChatProvider } from './context/ChatContext';
import { SidebarProvider } from './context/SidebarContext';
import { NeighborhoodProvider } from './context/NeighborhoodContext';
import { SecurityProvider } from './context/SecurityContext';
import { ServicesProvider } from './context/ServicesContext';
import { PostsProvider } from './context/PostsContext';
import { FriendsProvider } from './context/FriendsContext';
import { EventsProvider } from './context/EventsContext';
import { GroupsProvider } from './context/GroupsContext';
import { VerificationProvider } from './context/VerificationContext';
import { ReportsProvider } from './context/ReportsContext';
import { NotificationsProvider } from './context/NotificationsContext';
import { ProjectsProvider } from './context/ProjectsContext';
import { HelpRequestsProvider } from './context/HelpRequestsContext';
import { CommunityCalendarProvider } from './context/CommunityCalendarContext';
import { LocalBusinessProvider } from './context/LocalBusinessContext';
import { SharedResourcesProvider } from './context/SharedResourcesContext';
import { GamificationProvider } from './context/GamificationContext';
import { PhotosProvider } from './context/PhotosContext';
import Layout from './components/Layout/Layout';
import AppInitializer from './components/AppInitializer/AppInitializer';
import Home from './pages/Home';
import Timeline from './pages/Timeline';
import About from './pages/About';
import Friends from './pages/Friends';
import Photos from './pages/Photos';
import Birthday from './pages/Birthday';
import Settings from './pages/Settings';
import Help from './pages/Help';
import Messenger from './pages/Messenger';
import Contact from './pages/Contact';
import Events from './pages/Events';
import Groups from './pages/Groups';
import ForgotPassword from './pages/ForgotPassword';
import Login from './pages/Login';
import Register from './pages/Register';
import NeighborhoodMap from './pages/NeighborhoodMap/NeighborhoodMap';
import Directory from './pages/Directory/Directory';
import NeighborhoodProfile from './pages/NeighborhoodProfile/NeighborhoodProfile';
import Projects from './pages/Projects/Projects';
import HelpRequests from './pages/HelpRequests/HelpRequests';
import SharedResources from './pages/SharedResources/SharedResources';
import LocalBusinesses from './pages/LocalBusinesses/LocalBusinesses';
import CommunityCalendar from './pages/CommunityCalendar/CommunityCalendar';
import Polls from './pages/Polls/Polls';
import Community from './pages/Community/Community';
import UserProfile from './pages/UserProfile';
import Pages from './pages/Pages';
import Calendar from './pages/Calendar';
import Favorites from './pages/Favorites';
import History from './pages/History';
import './App.css';

// Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  console.log('✅ App component rendering');
  return (
    <Router>
      <AppInitializer />
      <AuthProvider>
        <AppProvider>
          <SearchProvider>
            <ChatProvider>
              <SidebarProvider>
                <NeighborhoodProvider>
                  <SecurityProvider>
                    <ServicesProvider>
                      <NotificationsProvider>
                        <GamificationProvider>
                          <VerificationProvider>
                            <ReportsProvider>
                              <PostsProvider>
                                <FriendsProvider>
                                  <EventsProvider>
                                    <GroupsProvider>
                                      <ProjectsProvider>
                                        <HelpRequestsProvider>
                                          <CommunityCalendarProvider>
                                            <LocalBusinessProvider>
                                              <SharedResourcesProvider>
                                                <PhotosProvider>
                                                  <Routes>
                                                  <Route path="/iniciar-sesion" element={<Login />} />
                                                  <Route path="/registrarse" element={<Register />} />
                                                  <Route path="/recuperar-contrasena" element={<ForgotPassword />} />
                                                  <Route path="/*" element={
                                                    <ProtectedRoute>
                                                      <Layout>
                                                        <Routes>
                                                          <Route path="/" element={<Home />} />
                                                          <Route path="/mapa" element={<NeighborhoodMap />} />
                                                          <Route path="/vecindario/:id" element={<NeighborhoodProfile />} />
                                                          <Route path="/directorio" element={<Directory />} />
                                                          <Route path="/votaciones" element={<Polls />} />
                                                          <Route path="/comunidad" element={<Community />} />
                                                          <Route path="/proyectos" element={<Projects />} />
                                                          <Route path="/proyecto/:slug" element={<UserProfile />} />
                                                          <Route path="/solicitudes-ayuda" element={<HelpRequests />} />
                                                          <Route path="/ayuda/:slug" element={<UserProfile />} />
                                                          <Route path="/recursos-compartidos" element={<SharedResources />} />
                                                          <Route path="/recursos/:slug" element={<UserProfile />} />
                                                          <Route path="/negocios-locales" element={<LocalBusinesses />} />
                                                          <Route path="/calendario-comunitario" element={<CommunityCalendar />} />
                                                          <Route path="/linea-tiempo" element={<Timeline />} />
                                                          <Route path="/acerca-de" element={<About />} />
                                                          <Route path="/vecinos" element={<Friends />} />
                                                          <Route path="/fotos" element={<Photos />} />
                                                          <Route path="/acerca-de" element={<About />} />
                                                          <Route path="/vecinos" element={<Friends />} />
                                                          <Route path="/fotos" element={<Photos />} />
                                                          <Route path="/cumpleanos" element={<Birthday />} />
                                                          <Route path="/configuracion" element={<Settings />} />
                                                          <Route path="/mensajes" element={<Messenger />} />
                                                          <Route path="/eventos" element={<Events />} />
                                                          {/* <Route path="/grupos" element={<Groups />} /> */}
                                                          <Route path="/grupo/:slug" element={<UserProfile />} />
                                                          <Route path="/evento/:slug" element={<UserProfile />} />
                                                          <Route path="/paginas" element={<Pages />} />
                                                          <Route path="/pagina/:slug" element={<UserProfile />} />
                                                          <Route path="/paginas/:slug" element={<UserProfile />} />
                                                          <Route path="/calendario" element={<Calendar />} />
                                                          <Route path="/favoritos" element={<Favorites />} />
                                                          <Route path="/historial" element={<History />} />
                                                          <Route path="/ayuda" element={<Help />} />
                                                          <Route path="/contacto" element={<Contact />} />
                                                          <Route path="/:username" element={<UserProfile />} />
                                                        </Routes>
                                                      </Layout>
                                                    </ProtectedRoute>
                                                  } />
                                                </Routes>
                                                </PhotosProvider>
                                              </SharedResourcesProvider>
                                            </LocalBusinessProvider>
                                          </CommunityCalendarProvider>
                                        </HelpRequestsProvider>
                                      </ProjectsProvider>
                                    </GroupsProvider>
                                  </EventsProvider>
                                </FriendsProvider>
                              </PostsProvider>
                            </ReportsProvider>
                          </VerificationProvider>
                        </GamificationProvider>
                      </NotificationsProvider>
                    </ServicesProvider>
                  </SecurityProvider>
                </NeighborhoodProvider>
              </SidebarProvider>
            </ChatProvider>
          </SearchProvider>
        </AppProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
