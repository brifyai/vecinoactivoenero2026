import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSidebar } from '../context/SidebarContext';
import { showSuccessToast, showInputDialog } from '../utils/sweetalert';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import BugReportIcon from '@mui/icons-material/BugReport';
import FeedbackIcon from '@mui/icons-material/Feedback';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import './Help.css';

const Help = () => {
  const navigate = useNavigate();
  const { isRightSidebarCollapsed } = useSidebar();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const handleContactSupport = () => {
    navigate('/app/contacto');
  };

  const handleReportProblem = async () => {
    const result = await showInputDialog('Reportar Problema', 'Describe el problema que encontraste', 'textarea');
    if (result.isConfirmed && result.value) {
      showSuccessToast('¡Problema reportado! Nuestro equipo lo revisará pronto.');
    }
  };

  const handleSendFeedback = async () => {
    const result = await showInputDialog('Enviar Comentarios', 'Comparte tus sugerencias para mejorar Vecino Activo', 'textarea');
    if (result.isConfirmed && result.value) {
      showSuccessToast('¡Gracias por tus comentarios! Los valoramos mucho.');
    }
  };

  const categories = [
    { icon: <HelpOutlineIcon />, title: 'Primeros Pasos', count: 12 },
    { icon: <ContactSupportIcon />, title: 'Configuración de Cuenta', count: 18 },
    { icon: <BugReportIcon />, title: 'Privacidad y Seguridad', count: 15 },
    { icon: <FeedbackIcon />, title: 'Solución de Problemas', count: 20 },
  ];

  const faqs = [
    {
      id: 1,
      question: '¿Cómo creo una nueva cuenta?',
      answer: 'Para crear una nueva cuenta, haz clic en el botón "Registrarse" en la página de inicio de sesión. Completa tu nombre, correo electrónico y contraseña, luego haz clic en "Crear Cuenta". Recibirás un correo de confirmación para verificar tu cuenta.'
    },
    {
      id: 2,
      question: '¿Cómo restablezco mi contraseña?',
      answer: 'Haz clic en "¿Olvidaste tu contraseña?" en la página de inicio de sesión. Ingresa tu dirección de correo electrónico y te enviaremos un enlace para restablecer tu contraseña. Sigue las instrucciones del correo para crear una nueva contraseña.'
    },
    {
      id: 3,
      question: '¿Cómo cambio mi foto de perfil?',
      answer: 'Ve a tu perfil, haz clic en tu foto de perfil actual y selecciona "Subir Foto". Elige una nueva imagen de tu dispositivo y haz clic en "Guardar".'
    },
    {
      id: 4,
      question: '¿Cómo elimino mi cuenta?',
      answer: 'Ve a Configuración > Configuración de Cuenta > Eliminar Cuenta. Ten en cuenta que esta acción es permanente y no se puede deshacer. Todos tus datos serán eliminados permanentemente.'
    },
    {
      id: 5,
      question: '¿Cómo reporto contenido inapropiado?',
      answer: 'Haz clic en el menú de tres puntos en cualquier publicación, comentario o perfil. Selecciona "Reportar" y elige el motivo del reporte. Nuestro equipo revisará el contenido en 24 horas.'
    },
    {
      id: 6,
      question: '¿Cómo bloqueo a alguien?',
      answer: 'Ve al perfil de la persona, haz clic en el menú de tres puntos y selecciona "Bloquear". Los usuarios bloqueados no podrán ver tu perfil ni contactarte.'
    },
    {
      id: 7,
      question: '¿Cómo cambio mi configuración de privacidad?',
      answer: 'Ve a Configuración > Privacidad. Aquí puedes controlar quién puede ver tus publicaciones, enviarte solicitudes de amistad y ver la información de tu perfil.'
    },
    {
      id: 8,
      question: '¿Cómo creo una publicación?',
      answer: 'Haz clic en "¿Qué estás pensando?" en la parte superior de tu feed. Escribe tu mensaje, agrega fotos o videos si quieres, elige tu configuración de privacidad y haz clic en "Publicar".'
    },
  ];

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`help-page ${isRightSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="help-hero">
        <h1>¿Cómo podemos ayudarte?</h1>
        <p>Busca respuestas o explora nuestros temas de ayuda</p>
        <div className="help-search">
          <input
            type="text"
            placeholder="Buscar ayuda..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="help-categories">
        {categories.map((category, index) => (
          <div key={index} className="help-category-card">
            <div className="category-icon">{category.icon}</div>
            <h3>{category.title}</h3>
            <p>{category.count} artículos</p>
          </div>
        ))}
      </div>

      <div className="help-content">
        <div className="faq-section">
          <h2>Preguntas Frecuentes</h2>
          <div className="faq-list">
            {filteredFaqs.map(faq => (
              <div key={faq.id} className="faq-item">
                <button
                  className="faq-question"
                  onClick={() => toggleFaq(faq.id)}
                >
                  <span>{faq.question}</span>
                  {expandedFaq === faq.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </button>
                {expandedFaq === faq.id && (
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="help-sidebar">
          <div className="contact-card">
            <ContactSupportIcon className="contact-icon" />
            <h3>¿Aún necesitas ayuda?</h3>
            <p>Nuestro equipo de soporte está aquí para ayudarte</p>
            <button className="contact-btn" onClick={handleContactSupport}>
              Contactar Soporte
            </button>
          </div>

          <div className="contact-card">
            <BugReportIcon className="contact-icon" />
            <h3>Reportar un Problema</h3>
            <p>Déjanos saber si algo no funciona</p>
            <button className="contact-btn secondary" onClick={handleReportProblem}>
              Reportar Problema
            </button>
          </div>

          <div className="contact-card">
            <FeedbackIcon className="contact-icon" />
            <h3>Enviar Comentarios</h3>
            <p>Ayúdanos a mejorar Vecino Activo</p>
            <button className="contact-btn secondary" onClick={handleSendFeedback}>
              Dar Opinión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
