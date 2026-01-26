import React from 'react';
import PeopleIcon from '@mui/icons-material/People';

const LandingFooter = () => {
  return (
    <footer className="landing-footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="logo">
              <PeopleIcon className="logo-icon" />
              <span className="logo-text">Vecino Activo</span>
            </div>
            <p className="footer-description">
              Conectando comunidades, construyendo el futuro.
            </p>
          </div>
          <div className="footer-links">
            <div className="link-group">
              <h4>Producto</h4>
              <a href="#features">Características</a>
              <a href="#pricing">Precios</a>
              <a href="#demo">Demo</a>
            </div>
            <div className="link-group">
              <h4>Soporte</h4>
              <a href="#help">Ayuda</a>
              <a href="#contact">Contacto</a>
              <a href="#faq">FAQ</a>
            </div>
            <div className="link-group">
              <h4>Legal</h4>
              <a href="#privacy">Privacidad</a>
              <a href="#terms">Términos</a>
              <a href="#cookies">Cookies</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Vecino Activo. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;