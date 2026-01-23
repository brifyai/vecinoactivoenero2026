import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSidebar } from '../context/SidebarContext';
import ProfileHeader from '../components/ProfileHeader/ProfileHeader';
import EditProfileModal from '../components/EditProfileModal/EditProfileModal';
import { showSuccessToast } from '../utils/sweetalert';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoIcon from '@mui/icons-material/Info';
import GroupIcon from '@mui/icons-material/Group';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import SearchIcon from '@mui/icons-material/Search';
import FeedIcon from '@mui/icons-material/Feed';
import PersonIcon from '@mui/icons-material/Person';
import CakeIcon from '@mui/icons-material/Cake';
import PhoneIcon from '@mui/icons-material/Phone';
import WcIcon from '@mui/icons-material/Wc';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import EmailIcon from '@mui/icons-material/Email';
import LanguageIcon from '@mui/icons-material/Language';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EditIcon from '@mui/icons-material/Edit';
import FilterListIcon from '@mui/icons-material/FilterList';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import './About.css';

const About = () => {
  const navigate = useNavigate();
  const { isRightSidebarCollapsed } = useSidebar();
  const [showEditModal, setShowEditModal] = useState(false);

  const handleEditClick = () => {
    setShowEditModal(true);
  };

  return (
    <div className={`about-page ${isRightSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <ProfileHeader />
      
      <div className="about-tabs">
        <button className="tab" onClick={() => navigate('/linea-tiempo')}><AccessTimeIcon fontSize="small" /> Línea de tiempo</button>
        <button className="tab active"><InfoIcon fontSize="small" /> Acerca de</button>
        <button className="tab" onClick={() => navigate('/descubrir-vecinos')}><GroupIcon fontSize="small" /> Vecinos</button>
        <button className="tab" onClick={() => navigate('/fotos')}><PhotoLibraryIcon fontSize="small" /> Fotos</button>
        <div className="tab-right">
          <input type="text" placeholder="Buscar aquí..." />
          <button className="activity-feed-btn"><FeedIcon fontSize="small" /> Feed de actividad</button>
        </div>
      </div>

      <div className="about-content">
        <div className="about-sidebar">
          <div className="about-card">
            <div className="card-header">
              <h3>Acerca de</h3>
              <span>Sobre mí</span>
            </div>
            <button className="edit-btn" onClick={handleEditClick}><EditIcon fontSize="small" /></button>
            
            <div className="about-item">
              <PersonIcon className="icon" />
              <div>
                <strong>Acerca de</strong>
                <p>Diseñador UX/UI freelance, Desarrollador Web. Basado en París, tengo amplia experiencia en diseño web, también soy bueno en Wordpress. Me encanta hablar contigo sobre nuestro proyecto único.</p>
              </div>
            </div>

            <div className="about-item">
              <CakeIcon className="icon" />
              <div>
                <strong>Cumpleaños</strong>
                <p>27 de agosto, 1994</p>
              </div>
            </div>

            <div className="about-item">
              <PhoneIcon className="icon" />
              <div>
                <strong>Teléfono</strong>
                <p>041 985 245 910</p>
              </div>
            </div>

            <div className="about-item">
              <WcIcon className="icon" />
              <div>
                <strong>Género</strong>
                <p>Hombre</p>
              </div>
            </div>

            <div className="about-item">
              <FavoriteIcon className="icon" />
              <div>
                <strong>Estado de relación</strong>
                <p>Soltero</p>
              </div>
            </div>

            <div className="about-item">
              <LocationOnIcon className="icon" />
              <div>
                <strong>Vivió en Londres</strong>
                <p>Últimos 5 años</p>
              </div>
            </div>

            <div className="about-item">
              <BloodtypeIcon className="icon" />
              <div>
                <strong>Grupo sanguíneo</strong>
                <p>A+ Positivo</p>
              </div>
            </div>

            <div className="about-item">
              <EmailIcon className="icon" />
              <div>
                <strong>Correo electrónico</strong>
                <p>Billverds@Gmail.Com</p>
              </div>
            </div>

            <div className="about-item">
              <LanguageIcon className="icon" />
              <div>
                <strong>Sitio web</strong>
                <p>VecinoActivo.cl</p>
              </div>
            </div>

            <div className="about-item">
              <CalendarMonthIcon className="icon" />
              <div>
                <strong>Se unió</strong>
                <p>20 de junio, 2010</p>
              </div>
            </div>

            <div className="social-links">
              <button className="social-btn facebook"><FacebookIcon /></button>
              <button className="social-btn twitter"><TwitterIcon /></button>
              <button className="social-btn whatsapp"><WhatsAppIcon /></button>
            </div>
          </div>
        </div>

        <div className="about-main">
          <div className="info-section">
            <div className="section-header">
              <h3>Pasatiempos e intereses</h3>
              <button className="edit-icon" onClick={handleEditClick}><EditIcon fontSize="small" /></button>
            </div>
            <div className="info-content">
              <p><strong>Pasatiempos:</strong> En mi tiempo libre, disfruto ir al gimnasio y participar regularmente en carreras benéficas en todo el Reino Unido. Para mantenerme en forma y saludable, también disfruto mantenerme al día con los asuntos actuales, tanto eventos nacionales como internacionales, lo que me ayuda a comprender mejor el mundo y cómo funciona.</p>
            </div>
          </div>

          <div className="info-section">
            <div className="section-header">
              <h3>Educación y trabajo</h3>
              <button className="edit-icon" onClick={handleEditClick}><EditIcon fontSize="small" /></button>
            </div>
            <div className="education-item">
              <strong>Arquitecto Junior:</strong>
              <p>Losos X Zhang Architects, San Diego, CA / Agosto 2018—presente</p>
            </div>
          </div>

          <div className="friends-section">
            <div className="section-header">
              <h3>Amigos</h3>
              <div className="friends-actions">
                <input type="text" placeholder="Buscar amigos..." />
                <button className="filter-btn"><FilterListIcon fontSize="small" /> Filtrar</button>
              </div>
            </div>
            <div className="friends-preview-grid">
              {[
                { name: 'Carlos Mendoza', location: 'Chamisero, Colina', img: 11 },
                { name: 'Maria Elena Rodriguez', location: 'Chamisero, Colina', img: 5 },
                { name: 'Juan Pablo Torres', location: 'Chamisero, Colina', img: 12 },
                { name: 'Roberto Carlos Gomez', location: 'Chicureo, Colina', img: 13 },
                { name: 'Josephin Water', location: 'Chamisero, Colina', img: 8 },
                { name: 'Ana Maria Fernandez', location: 'Chamisero, Colina', img: 9 }
              ].map((friend, i) => (
                <div key={i} className="friend-preview" onClick={() => navigate('/linea-tiempo')} style={{ cursor: 'pointer' }}>
                  <img src={`https://i.pravatar.cc/150?img=${friend.img}`} alt={friend.name} />
                  <p>{friend.name}</p>
                  <span>{friend.location}</span>
                  <button className="more-btn"><MoreHorizIcon fontSize="small" /></button>
                </div>
              ))}
            </div>
            <button className="see-all-btn" onClick={() => navigate('/descubrir-vecinos')}>Ver todo</button>
          </div>
        </div>
      </div>

      {showEditModal && (
        <EditProfileModal onClose={() => setShowEditModal(false)} />
      )}
    </div>
  );
};

export default About;
