import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectAuthLoading } from './store/selectors/authSelectors';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';

// Test only basic components first
import Landing from './pages/Landing';
import UserTypeSelection from './pages/UserTypeSelection';

// Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  
  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/iniciar-sesion" replace />;
  }
  
  return children;
};

function App() {
  console.log('✅ App component rendering - MINIMAL VERSION');
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Test basic routes only */}
          <Route path="/" element={<Landing />} />
          <Route path="/iniciar-sesion" element={<UserTypeSelection />} />
          <Route path="*" element={<div>404 - Page not found</div>} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;