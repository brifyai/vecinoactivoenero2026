import React from 'react';

const ContactSection = () => {
  return (
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
  );
};

export default ContactSection;