import React from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="cta-section">
      <div className="section-container">
        <div className="cta-content">
          <h2 className="cta-title">¿Listo para conectar con tu comunidad?</h2>
          <p className="cta-subtitle">
            Únete a Vecino Activo hoy y comienza a construir relaciones que durarán toda la vida.
          </p>
          <div className="cta-actions">
            <button 
              className="cta-button primary large"
              onClick={() => navigate('/registrarse')}
            >
              Crear Cuenta Gratis
              <ArrowForwardIcon />
            </button>
            <button 
              className="cta-button secondary large"
              onClick={() => navigate('/iniciar-sesion')}
            >
              Ya tengo cuenta
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;