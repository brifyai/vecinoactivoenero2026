import React from 'react';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import EventIcon from '@mui/icons-material/Event';
import SecurityIcon from '@mui/icons-material/Security';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';

const WhatIsSection = () => {
  return (
    <section id="what-is" className="what-is-section">
      <div className="section-container">
        <div className="what-is-content">
          <div className="what-is-text">
            <div className="section-badge">
              <span>¿Qué es Vecino Activo?</span>
            </div>
            <h2 className="what-is-title">
              Conecta con tu vecindario
            </h2>
            <p className="what-is-description">
              Vecino Activo es más que una aplicación: es el puente digital que une a las personas 
              de tu comunidad. Desde conocer a tus vecinos hasta organizar eventos, resolver problemas 
              locales y crear un entorno más seguro y colaborativo.
            </p>
            
            <div className="what-is-features">
              <div className="feature-item">
                <div className="feature-number">01</div>
                <div className="feature-content">
                  <h4>Conecta Localmente</h4>
                  <p>Encuentra y conecta con personas que viven cerca de ti, creando una red de apoyo vecinal real.</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-number">02</div>
                <div className="feature-content">
                  <h4>Organiza y Participa</h4>
                  <p>Crea eventos comunitarios, únete a actividades locales y fortalece los lazos de tu vecindario.</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-number">03</div>
                <div className="feature-content">
                  <h4>Resuelve Juntos</h4>
                  <p>Colabora en la solución de problemas locales, desde seguridad hasta mejoras urbanas.</p>
                </div>
              </div>
            </div>
            
            <div className="what-is-stats">
              <div className="stat-item">
                <div className="stat-icon">
                  <HomeWorkIcon />
                </div>
                <div className="stat-info">
                  <span className="stat-value">50+</span>
                  <span className="stat-label">Comunidades Activas</span>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">
                  <PeopleAltIcon />
                </div>
                <div className="stat-info">
                  <span className="stat-value">1,000+</span>
                  <span className="stat-label">Vecinos Conectados</span>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">
                  <EmojiEventsIcon />
                </div>
                <div className="stat-info">
                  <span className="stat-value">200+</span>
                  <span className="stat-label">Eventos Realizados</span>
                </div>
              </div>
            </div>
          </div>

          <div className="what-is-visual">
            <div className="visual-container">
              <div className="digital-neighborhood">
                {/* Fila superior */}
                <div className="house-row top-row">
                  <div className="neighbor-house house-1">
                    <div className="house-structure">
                      <div className="house-roof"></div>
                      <div className="house-body">
                        <div className="house-door"></div>
                        <div className="house-window"></div>
                      </div>
                    </div>
                    <span className="house-name">Carlos</span>
                    <div className="connection-wire wire-1"></div>
                  </div>
                  
                  <div className="neighbor-house house-2">
                    <div className="house-structure">
                      <div className="house-roof"></div>
                      <div className="house-body">
                        <div className="house-door"></div>
                        <div className="house-window"></div>
                      </div>
                    </div>
                    <span className="house-name">María</span>
                    <div className="connection-wire wire-2"></div>
                  </div>
                </div>
                
                {/* Fila central */}
                <div className="house-row middle-row">
                  <div className="neighbor-house house-3">
                    <div className="house-structure">
                      <div className="house-roof"></div>
                      <div className="house-body">
                        <div className="house-door"></div>
                        <div className="house-window"></div>
                      </div>
                    </div>
                    <span className="house-name">Sofia</span>
                    <div className="connection-wire wire-3"></div>
                  </div>
                  
                  <div className="main-house">
                    <div className="main-house-structure">
                      <div className="main-roof"></div>
                      <div className="main-body">
                        <div className="main-door">🏠</div>
                        <div className="main-windows">
                          <div className="main-window"></div>
                          <div className="main-window"></div>
                        </div>
                      </div>
                    </div>
                    <span className="main-house-label">Tu Hogar</span>
                  </div>
                  
                  <div className="neighbor-house house-4">
                    <div className="house-structure">
                      <div className="house-roof"></div>
                      <div className="house-body">
                        <div className="house-door"></div>
                        <div className="house-window"></div>
                      </div>
                    </div>
                    <span className="house-name">José</span>
                    <div className="connection-wire wire-4"></div>
                  </div>
                </div>
                
                {/* Fila inferior */}
                <div className="house-row bottom-row">
                  <div className="neighbor-house house-5">
                    <div className="house-structure">
                      <div className="house-roof"></div>
                      <div className="house-body">
                        <div className="house-door"></div>
                        <div className="house-window"></div>
                      </div>
                    </div>
                    <span className="house-name">Luis</span>
                    <div className="connection-wire wire-5"></div>
                  </div>
                  
                  <div className="neighbor-house house-6">
                    <div className="house-structure">
                      <div className="house-roof"></div>
                      <div className="house-body">
                        <div className="house-door"></div>
                        <div className="house-window"></div>
                      </div>
                    </div>
                    <span className="house-name">Ana</span>
                    <div className="connection-wire wire-6"></div>
                  </div>
                </div>
                
                {/* Red de conexiones */}
                <div className="network-grid">
                  <div className="grid-line horizontal line-h1"></div>
                  <div className="grid-line horizontal line-h2"></div>
                  <div className="grid-line vertical line-v1"></div>
                  <div className="grid-line vertical line-v2"></div>
                </div>
              </div>
              
              <div className="floating-activities">
                <div className="activity-bubble activity-1">
                  <EventIcon />
                  <span>Evento Comunitario</span>
                </div>
                <div className="activity-bubble activity-2">
                  <SecurityIcon />
                  <span>Alerta de Seguridad</span>
                </div>
                <div className="activity-bubble activity-3">
                  <VolunteerActivismIcon />
                  <span>Ayuda Vecinal</span>
                </div>
              </div>
            </div>
            
            <div className="visual-description">
              <p>
                <strong>Así funciona:</strong> Tu hogar se conecta digitalmente con el vecindario, 
                creando una red inteligente de comunicación y colaboración local.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatIsSection;