import React from 'react';
import { useNavigate } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
// Iconos modernos
import ConnectWithoutContactIcon from '@mui/icons-material/ConnectWithoutContact';
import CelebrationIcon from '@mui/icons-material/Celebration';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ForumIcon from '@mui/icons-material/Forum';
import ExploreIcon from '@mui/icons-material/Explore';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
// Para las burbujas flotantes
import EventIcon from '@mui/icons-material/Event';
import SecurityIcon from '@mui/icons-material/Security';
import LandingMap from '../components/LandingMap/LandingMap';
import './Landing.css';

const Landing = () => {
  const navigate = useNavigate();

  // Manejar envío del formulario de contacto
  React.useEffect(() => {
    // Scroll suave para los enlaces de navegación
    const handleNavClick = (e) => {
      if (e.target.classList.contains('nav-link')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          const headerHeight = 80; // Altura del header fijo actualizada
          const targetPosition = targetElement.offsetTop - headerHeight;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }
    };

    // Marcar enlace activo según scroll
    const handleScroll = () => {
      const sections = ['about', 'what-is', 'features', 'contact'];
      const headerHeight = 80;
      const scrollPosition = window.scrollY + headerHeight + 100;
      
      let activeSection = '';
      
      sections.forEach(sectionId => {
        const element = document.getElementById(sectionId);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetBottom = offsetTop + element.offsetHeight;
          
          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            activeSection = sectionId;
          }
        }
      });
      
      // Actualizar clases activas
      document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href').substring(1);
        if (href === activeSection) {
          link.classList.add('active');
        }
      });
    };

    // Agregar event listeners
    document.addEventListener('click', handleNavClick);
    window.addEventListener('scroll', handleScroll);
    
    // Ejecutar una vez al cargar
    handleScroll();

    const handleFormSubmit = async (e) => {
      e.preventDefault();
      
      const form = e.target;
      const formData = new FormData(form);
      const submitBtn = form.querySelector('.submit-btn');
      const btnText = submitBtn.querySelector('.btn-text');
      const btnLoading = submitBtn.querySelector('.btn-loading');
      const messageDiv = document.getElementById('formMessage');
      
      // Mostrar estado de carga
      submitBtn.disabled = true;
      btnText.style.display = 'none';
      btnLoading.style.display = 'inline';
      messageDiv.style.display = 'none';
      
      try {
        const response = await fetch('/contact.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nombre: formData.get('nombre'),
            email: formData.get('email'),
            telefono: formData.get('telefono'),
            mensaje: formData.get('mensaje')
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          messageDiv.textContent = result.message;
          messageDiv.className = 'form-message success';
          messageDiv.style.display = 'block';
          form.reset();
        } else {
          throw new Error(result.message || 'Error al enviar el mensaje');
        }
      } catch (error) {
        messageDiv.textContent = error.message || 'Error al enviar el mensaje. Por favor intenta nuevamente.';
        messageDiv.className = 'form-message error';
        messageDiv.style.display = 'block';
      } finally {
        // Restaurar estado del botón
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
      }
    };

    const form = document.getElementById('contactForm');
    if (form) {
      form.addEventListener('submit', handleFormSubmit);
      
      return () => {
        form.removeEventListener('submit', handleFormSubmit);
        document.removeEventListener('click', handleNavClick);
        window.removeEventListener('scroll', handleScroll);
      };
    } else {
      return () => {
        document.removeEventListener('click', handleNavClick);
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

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

  const benefits = [
    'Comunidad verificada y segura',
    'Eventos y actividades locales',
    'Red de apoyo vecinal',
    'Información en tiempo real',
    'Fácil de usar y gratuito'
  ];

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="header-container">
          <div className="logo">
            <PeopleIcon className="logo-icon" />
            <span className="logo-text">Vecino Activo</span>
          </div>
          <nav className="header-nav">
            <div className="nav-menu">
              <a href="#what-is" className="nav-link">¿Qué es?</a>
              <a href="#features" className="nav-link">¿Por qué elegir Vecino Activo?</a>
              <a href="#contact" className="nav-link">Contacto</a>
            </div>
            <div className="auth-buttons">
              <button 
                className="nav-btn secondary"
                onClick={() => {
                  console.log('Navegando a /iniciar-sesion');
                  navigate('/iniciar-sesion');
                }}
              >
                Iniciar Sesión
              </button>
              <button 
                className="nav-btn primary"
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

      {/* Hero Section */}
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

      {/* What is Vecino Activo Section */}
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

      {/* Features Section */}
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

      {/* Benefits Section */}
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

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <div className="section-container">
          <div className="contact-content">
            <div className="contact-info">
              <h2 className="section-title">¿Tienes alguna pregunta?</h2>
              <p className="section-description">
                Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos a la brevedad.
              </p>
              <div className="contact-details">
                <div className="contact-item">
                  <div className="contact-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <h4>Email</h4>
                    <p>hola@aintelligence.cl</p>
                  </div>
                </div>
                <div className="contact-item">
                  <div className="contact-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.3639 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <h4>Ubicación</h4>
                    <p>Santiago, Chile</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="contact-form-container">
              <form className="contact-form" id="contactForm">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="nombre">Nombre *</label>
                    <input 
                      type="text" 
                      id="nombre" 
                      name="nombre" 
                      required 
                      placeholder="Tu nombre completo"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input 
                      type="email" 
                      id="email" 
                      name="email" 
                      required 
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="telefono">Teléfono</label>
                  <input 
                    type="tel" 
                    id="telefono" 
                    name="telefono" 
                    placeholder="+56 9 1234 5678"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="mensaje">Mensaje *</label>
                  <textarea 
                    id="mensaje" 
                    name="mensaje" 
                    rows="5" 
                    required 
                    placeholder="Cuéntanos en qué podemos ayudarte..."
                  ></textarea>
                </div>
                
                <button type="submit" className="submit-btn">
                  <span className="btn-text">Enviar Mensaje</span>
                  <span className="btn-loading" style={{display: 'none'}}>Enviando...</span>
                </button>
                
                <div className="form-message" id="formMessage" style={{display: 'none'}}></div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
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

      {/* Footer */}
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
    </div>
  );
};

export default Landing;