import React from 'react';
import ConnectWithoutContactIcon from '@mui/icons-material/ConnectWithoutContact';
import CelebrationIcon from '@mui/icons-material/Celebration';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ForumIcon from '@mui/icons-material/Forum';
import ExploreIcon from '@mui/icons-material/Explore';

const FeaturesSection = () => {
  const features = [
    {
      icon: <ConnectWithoutContactIcon />,
      title: 'Conecta con Vecinos',
      description: 'Conoce a las personas que viven cerca de ti y construye relaciones duraderas.'
    },
    {
      icon: <CelebrationIcon />,
      title: 'Eventos Comunitarios',
      description: 'Participa en actividades locales y organiza eventos para tu vecindario.'
    },
    {
      icon: <VerifiedUserIcon />,
      title: 'Seguridad Vecinal',
      description: 'Mantente informado sobre la seguridad de tu zona y colabora con tus vecinos.'
    },
    {
      icon: <StorefrontIcon />,
      title: 'Negocios Locales',
      description: 'Descubre y apoya los negocios de tu comunidad.'
    },
    {
      icon: <ForumIcon />,
      title: 'Comunicación Directa',
      description: 'Chatea con tus vecinos y mantente al día con las noticias locales.'
    },
    {
      icon: <ExploreIcon />,
      title: 'Mapa Interactivo',
      description: 'Explora tu vecindario y descubre lugares de interés cercanos.'
    }
  ];

  return (
    <section id="features" className="features-section">
      <div className="section-container">
        <div className="section-header">
          <h2 className="section-title">¿Por qué elegir Vecino Activo?</h2>
          <p className="section-subtitle">
            Descubre todas las herramientas que necesitas<br />
            para conectar con tu comunidad
          </p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">
                {feature.icon}
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;