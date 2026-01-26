import React from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import LandingMap from '../LandingMap/LandingMap';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="hero-section">
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            Conecta con tu <span className="highlight">Comunidad</span>
          </h1>
          <p className="hero-subtitle">
            La plataforma que une a los vecinos, fortalece las comunidades y construye un futuro mejor para todos.
          </p>
          <div className="hero-actions">
            <button 
              className="cta-button primary"
              onClick={() => navigate('/registrarse')}
            >
              Comenzar Ahora
              <ArrowForwardIcon />
            </button>
            <button className="cta-button secondary">
              <PlayArrowIcon />
              Ver Demo
            </button>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">1,000+</span>
              <span className="stat-label">Vecinos Activos</span>
            </div>
            <div className="stat">
              <span className="stat-number">50+</span>
              <span className="stat-label">Comunidades</span>
            </div>
            <div className="stat">
              <span className="stat-number">200+</span>
              <span className="stat-label">Eventos Realizados</span>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-image">
            <LandingMap />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;