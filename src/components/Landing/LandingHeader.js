import React from 'react';
import { useNavigate } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';

const LandingHeader = () => {
  const navigate = useNavigate();

  // Agregar estilos extremos para forzar visibilidad de los enlaces
  React.useEffect(() => {
    const style = document.createElement('style');
    style.id = 'nav-links-fix';
    style.innerHTML = `
      .landing-header .nav-menu .nav-link {
        color: #667eea !important;
        background: rgba(102, 126, 234, 0.15) !important;
        border: 2px solid rgba(102, 126, 234, 0.3) !important;
        text-decoration: none !important;
        font-size: 14px !important;
        font-weight: 600 !important;
        padding: 8px 16px !important;
        border-radius: 12px !important;
        margin: 0 4px !important;
        display: inline-block !important;
        transition: all 0.3s ease !important;
        text-shadow: none !important;
        box-shadow: none !important;
        min-width: auto !important;
      }
      
      .landing-header .nav-menu .nav-link:hover {
        background: rgba(102, 126, 234, 0.25) !important;
        border-color: rgba(102, 126, 234, 0.5) !important;
        color: #5a67d8 !important;
        transform: translateY(-2px) !important;
      }
      
      .landing-header .nav-menu {
        display: flex !important;
        gap: 8px !important;
        align-items: center !important;
        background: rgba(102, 126, 234, 0.04) !important;
        padding: 8px !important;
        border-radius: 16px !important;
        border: 1px solid rgba(102, 126, 234, 0.08) !important;
      }
    `;
    
    document.head.appendChild(style);
    
    return () => {
      const styleToRemove = document.getElementById('nav-links-fix');
      if (styleToRemove) {
        styleToRemove.remove();
      }
    };
  }, []);

  return (
    <header className="landing-header">
      <div className="header-container">
        <div className="logo">
          <PeopleIcon className="logo-icon" />
          <span className="logo-text">Vecino Activo</span>
        </div>
        <nav className="header-nav">
          <div className="nav-menu">
            <a 
              href="#what-is" 
              className="nav-link"
            >
              ¿Qué es?
            </a>
            <a 
              href="#features" 
              className="nav-link"
            >
              ¿Por qué elegir Vecino Activo?
            </a>
            <a 
              href="#contact" 
              className="nav-link"
            >
              Contacto
            </a>
          </div>
          <div className="auth-buttons">
            <button 
              className="nav-btn secondary"
              style={{
                background: 'rgba(102, 126, 234, 0.15) !important',
                color: '#667eea !important',
                border: '2px solid rgba(102, 126, 234, 0.3) !important',
                padding: '12px 24px !important',
                borderRadius: '12px !important',
                fontSize: '15px !important',
                fontWeight: '600 !important',
                cursor: 'pointer !important',
                minWidth: '120px !important',
                display: 'inline-flex !important',
                alignItems: 'center !important',
                justifyContent: 'center !important',
                textDecoration: 'none !important',
                outline: 'none !important'
              }}
              onClick={() => {
                console.log('Navegando a /iniciar-sesion');
                navigate('/iniciar-sesion');
              }}
            >
              Iniciar Sesión
            </button>
            <button 
              className="nav-btn primary"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important',
                color: 'white !important',
                border: '2px solid transparent !important',
                padding: '12px 24px !important',
                borderRadius: '12px !important',
                fontSize: '15px !important',
                fontWeight: '600 !important',
                cursor: 'pointer !important',
                minWidth: '120px !important',
                display: 'inline-flex !important',
                alignItems: 'center !important',
                justifyContent: 'center !important',
                textDecoration: 'none !important',
                outline: 'none !important',
                boxShadow: '0 6px 24px rgba(102, 126, 234, 0.3) !important'
              }}
              onClick={() => {
                console.log('Navegando a /registrarse');
                navigate('/registrarse');
              }}
            >
              Registrarse
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default LandingHeader;