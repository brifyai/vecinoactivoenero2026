import React, { useState } from 'react';
import { useSidebar } from '../context/SidebarContext';
import { showSuccessToast, showErrorToast } from '../utils/sweetalert';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import SendIcon from '@mui/icons-material/Send';
import './Contact.css';

const Contact = () => {
  const { isRightSidebarCollapsed } = useSidebar();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      showErrorToast('Por favor completa todos los campos');
      return;
    }

    // Guardar mensaje en localStorage
    const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
    const newMessage = {
      ...formData,
      id: Date.now(),
      date: new Date().toISOString(),
      status: 'pending'
    };
    messages.push(newMessage);
    localStorage.setItem('contactMessages', JSON.stringify(messages));

    showSuccessToast('¡Mensaje enviado exitosamente! Te responderemos pronto.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className={`contact-page ${isRightSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="contact-hero">
        <h1>Contáctanos</h1>
        <p>Nos encantaría saber de ti. ¡Envíanos un mensaje!</p>
      </div>

      <div className="contact-content">
        <div className="contact-info-section">
          <div className="contact-info-card">
            <div className="info-icon">
              <LocationOnIcon />
            </div>
            <h3>Dirección</h3>
            <p>Calle Vecino Activo 123</p>
            <p>Santiago, Chile</p>
            <p>Chile</p>
          </div>

          <div className="contact-info-card">
            <div className="info-icon">
              <PhoneIcon />
            </div>
            <h3>Teléfono</h3>
            <p>+1 (555) 123-4567</p>
            <p>+1 (555) 987-6543</p>
            <p>Lun-Vie 9am-6pm PST</p>
          </div>

          <div className="contact-info-card">
            <div className="info-icon">
              <EmailIcon />
            </div>
            <h3>Correo</h3>
            <p>soporte@vecinoactivo.cl</p>
            <p>info@vecinoactivo.cl</p>
            <p>Respondemos en 24 horas</p>
          </div>
        </div>

        <div className="contact-form-section">
          <h2>Envíanos un mensaje</h2>
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-row">
              <div className="form-group">
                <label>Tu nombre</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Juan Pérez"
                  required
                />
              </div>
              <div className="form-group">
                <label>Tu correo</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="juan@ejemplo.com"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Asunto</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="¿Cómo podemos ayudarte?"
                required
              />
            </div>

            <div className="form-group">
              <label>Mensaje</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Cuéntanos más sobre tu consulta..."
                rows="6"
                required
              />
            </div>

            <button type="submit" className="submit-btn">
              <SendIcon /> Enviar mensaje
            </button>
          </form>
        </div>
      </div>

      <div className="contact-map">
        <iframe
          title="Google Maps"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d100939.98555098464!2d-122.50764017163092!3d37.75781499242531!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80859a6d00690021%3A0x4a501367f076adff!2sSan%20Francisco%2C%20CA%2C%20USA!5e0!3m2!1sen!2s!4v1642345678901!5m2!1sen!2s"
          width="100%"
          height="400"
          style={{ border: 0, borderRadius: '12px' }}
          allowFullScreen=""
          loading="lazy"
        ></iframe>
      </div>
    </div>
  );
};

export default Contact;
