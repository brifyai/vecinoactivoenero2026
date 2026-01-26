import React from 'react';
import { useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const BenefitsSection = () => {
  const navigate = useNavigate();

  const benefits = [
    'Comunidad verificada y segura',
    'Eventos y actividades locales',
    'Red de apoyo vecinal',
    'Información en tiempo real',
    'Fácil de usar y gratuito'
  ];

  return (
    <section id="about" className="benefits-section">
      <div className="section-container">
        <div className="benefits-content">
          <div className="benefits-text">
            <h2 className="section-title">Una comunidad más fuerte comienza contigo</h2>
            <p className="section-description">
              Únete a miles de vecinos que ya están construyendo comunidades más conectadas, 
              seguras y prósperas. Vecino Activo te da las herramientas para hacer la diferencia.
            </p>
            <ul className="benefits-list">
              {benefits.map((benefit, index) => (
                <li key={index} className="benefit-item">
                  <CheckCircleIcon className="check-icon" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            <button 
              className="cta-button primary"
              onClick={() => navigate('/registrarse')}
            >
              Únete Ahora
              <ArrowForwardIcon />
            </button>
          </div>
          <div className="benefits-visual">
            <img 
              src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=500&h=600&fit=crop" 
              alt="Comunidad chilena unida" 
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;