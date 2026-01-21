import EventIcon from '@mui/icons-material/Event';
import './EventsWidget.css';

const EventsWidget = () => {
  const events = [
    {
      title: 'Próximo Evento',
      date: '25 Dic, 2024',
      time: '10:00 AM',
      image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&h=150&fit=crop'
    },
    {
      title: 'Festival de Música',
      date: '15 Ene, 2025',
      time: '6:00 PM',
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=150&fit=crop'
    }
  ];

  return (
    <div className="events-widget">
      <div className="widget-header">
        <EventIcon style={{ color: '#0e8ce4' }} />
        <h3>Eventos</h3>
      </div>
      <div className="events-list">
        {events.map((event, index) => (
          <div key={index} className="event-item">
            <img src={event.image} alt={event.title} />
            <div className="event-info">
              <h4>{event.title}</h4>
              <p>{event.date} • {event.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventsWidget;
