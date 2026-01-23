import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectAuthLoading } from './store/selectors/authSelectors';
import { AppProvider } from './context/AppContext';
import { SearchProvider } from './context/SearchContext';
import { ChatProvider } from './context/ChatContext';
import { SidebarProvider } from './context/SidebarContext';
import { NeighborhoodProvider } from './context/NeighborhoodContext';
import { SecurityProvider } from './context/SecurityContext';
import { ServicesProvider } from './context/ServicesContext';
import { FriendsProvider } from './context/FriendsContext';
import { EventsProvider } from './context/EventsContext';
import { GroupsProvider } from './context/GroupsContext';
import { VerificationProvider } from './context/VerificationContext';
import { ReportsProvider } from './context/ReportsContext';
import { ProjectsProvider } from './context/ProjectsContext';
import { PollsProvider } from './context/PollsContext';
import { HelpRequestsProvider } from './context/HelpRequestsContext';
import { CommunityCalendarProvider } from './context/CommunityCalendarContext';
import { LocalBusinessProvider } from './context/LocalBusinessContext';
import { SharedResourcesProvider } from './context/SharedResourcesContext';
import { GamificationProvider } from './context/GamificationContext';
import { PhotosProvider } from './context/PhotosContext';
import { NeighborhoodsProvider } from './context/NeighborhoodsContext';
import { ConnectionsProvider } from './context/ConnectionsContext';
import { LocalNeedsProvider } from './context/LocalNeedsContext';
import { CommunityActionsProvider } from './context/CommunityActionsContext';
import { MessagesProvider } from './context/MessagesContext';
import { ModerationProvider } from './context/ModerationContext';
import { NeighborhoodExpansionProvider } from './context/NeighborhoodExpansionContext';
import Layout from './components/Layout/Layout';
import AppInitializer from './components/AppInitializer/AppInitializer';
import ReduxInitializer from './components/ReduxInitializer/ReduxInitializer';
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

// Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  
  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/iniciar-sesion" replace />;
};

function App() {
  console.log('✅ App component rendering');
  return (
    <Router>
      <ReduxInitializer>
        <AppInitializer />
        <AppProvider>
          <SearchProvider>
            <ChatProvider>
              <SidebarProvider>
                <NeighborhoodProvider>
                  <SecurityProvider>
                    <ServicesProvider>
                      <GamificationProvider>
                        <VerificationProvider>
                          <ReportsProvider>
                            <FriendsProvider>
                              <EventsProvider>
                                <GroupsProvider>
                                  <ProjectsProvider>
                                    <PollsProvider>
                                      <HelpRequestsProvider>
                                      <CommunityCalendarProvider>
                                        <LocalBusinessProvider>
                                          <SharedResourcesProvider>
                                            <PhotosProvider>
                                              <NeighborhoodsProvider>
                                                <NeighborhoodExpansionProvider>
                                                  <ConnectionsProvider>
                                                    <LocalNeedsProvider>
                                                      <CommunityActionsProvider>
                                                        <MessagesProvider>
                                                          <ModerationProvider>
                                                            <Routes>
                                                  <Route path="/iniciar-sesion" element={<Login />} />
                                                  <Route path="/registrarse" element={<Register />} />
                                                  <Route path="/recuperar-contrasena" element={<ForgotPassword />} />
                                                  <Route path="/*" element={
                                                    <ProtectedRoute>
                                                      <Layout>
                                                        <Routes>
                                                          <Route path="/" element={<Home />} />
                                                          <Route path="/onboarding" element={<Onboarding />} />
                                                          <Route path="/descubrir-vecinos" element={<DiscoverNeighbors />} />
                                                          <Route path="/necesidades-locales" element={<LocalNeeds />} />
                                                          <Route path="/acciones-comunitarias" element={<CommunityActions />} />
                                                          <Route path="/feed" element={<Feed />} />
                                                          <Route path="/mensajes-directos" element={<DirectMessages />} />
                                                          <Route path="/mapa" element={<NeighborhoodMap />} />
                                                          <Route path="/vecindario/:id" element={<NeighborhoodProfile />} />
                                                          <Route path="/hub-comunitario" element={<CommunityHub />} />
                                                          <Route path="/directorio" element={<Navigate to="/hub-comunitario?tab=directorio" replace />} />
                                                          <Route path="/votaciones" element={<Navigate to="/hub-comunitario?tab=votaciones" replace />} />
                                                          <Route path="/proyectos" element={<Navigate to="/hub-comunitario?tab=proyectos" replace />} />
                                                          <Route path="/comunidad" element={<Community />} />
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
                                                          {/* Pages routes removed - generic Facebook feature */}
                                                          {/* <Route path="/paginas" element={<Pages />} /> */}
                                                          {/* <Route path="/pagina/:slug" element={<UserProfile />} /> */}
                                                          {/* <Route path="/paginas/:slug" element={<UserProfile />} /> */}
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
                                                        </ModerationProvider>
                                                      </MessagesProvider>
                                                    </CommunityActionsProvider>
                                                  </LocalNeedsProvider>
                                                </ConnectionsProvider>
                                              </NeighborhoodExpansionProvider>
                                            </NeighborhoodsProvider>
                                          </PhotosProvider>
                                          </SharedResourcesProvider>
                                        </LocalBusinessProvider>
                                      </CommunityCalendarProvider>
                                    </HelpRequestsProvider>
                                  </PollsProvider>
                                </ProjectsProvider>
                                </GroupsProvider>
                              </EventsProvider>
                            </FriendsProvider>
                          </ReportsProvider>
                        </VerificationProvider>
                      </GamificationProvider>
                    </ServicesProvider>
                  </SecurityProvider>
                </NeighborhoodProvider>
              </SidebarProvider>
            </ChatProvider>
          </SearchProvider>
        </AppProvider>
      </ReduxInitializer>
    </Router>
  );
}

export default App;
