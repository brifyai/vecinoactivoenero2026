import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import LockIcon from '@mui/icons-material/Lock';
import RateReviewIcon from '@mui/icons-material/RateReview';

const DirectoryInfoBanner = ({ activeTab }) => {
  if (activeTab !== 'services') return null;

  return (
    <div className="info-banner">
      <h3><LightbulbIcon /> ¿Cómo funciona?</h3>
      <div className="info-grid">
        <div className="info-item">
          <span className="info-icon"><CheckCircleIcon /></span>
          <p>Todos los servicios son verificados por vecinos del barrio</p>
        </div>
        <div className="info-item">
          <span className="info-icon"><StarIcon /></span>
          <p>Las calificaciones son reales de trabajos realizados</p>
        </div>
        <div className="info-item">
          <span className="info-icon"><LockIcon /></span>
          <p>Contacta directamente con el profesional</p>
        </div>
        <div className="info-item">
          <span className="info-icon"><RateReviewIcon /></span>
          <p>Deja tu reseña después de contratar un servicio</p>
        </div>
      </div>
    </div>
  );
};

export default DirectoryInfoBanner;