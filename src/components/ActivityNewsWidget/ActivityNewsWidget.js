import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import './ActivityNewsWidget.css';

const ActivityNewsWidget = () => {
  const news = [
    {
      title: 'Nueva Función Lanzada',
      description: 'Revisa nuestras últimas actualizaciones',
      time: 'hace 2 horas',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=100&h=100&fit=crop'
    },
    {
      title: 'Hito de la Comunidad',
      description: '10K usuarios se unieron este mes',
      time: 'hace 5 horas',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&h=100&fit=crop'
    },
    {
      title: 'Tema en Tendencia',
      description: '#RedesSociales está en tendencia',
      time: 'hace 1 día',
      image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&h=100&fit=crop'
    }
  ];

  return (
    <div className="activity-news-widget">
      <div className="widget-header">
        <TrendingUpIcon style={{ color: '#0e8ce4' }} />
        <h3>Noticias de Actividad</h3>
      </div>
      <div className="news-list">
        {news.map((item, index) => (
          <div key={index} className="news-item">
            <img src={item.image} alt={item.title} />
            <div className="news-info">
              <h4>{item.title}</h4>
              <p>{item.description}</p>
              <span>{item.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityNewsWidget;
