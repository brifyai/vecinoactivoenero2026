import CakeIcon from '@mui/icons-material/Cake';
import './BirthdayWidget.css';

const BirthdayWidget = () => {
  const birthdays = [
    { name: 'Sufiya Elija', avatar: 'https://i.pravatar.cc/40?img=16', date: 'Hoy' },
    { name: 'Pabalo Mukrani', avatar: 'https://i.pravatar.cc/40?img=15', date: 'Mañana' },
  ];

  return (
    <div className="birthday-widget">
      <div className="widget-header">
        <CakeIcon style={{ color: '#0e8ce4' }} />
        <h3>Cumpleaños</h3>
      </div>
      <div className="birthday-list">
        {birthdays.map((person, index) => (
          <div key={index} className="birthday-item">
            <img src={person.avatar} alt={person.name} />
            <div className="birthday-info">
              <p><strong>{person.name}</strong></p>
              <span>{person.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BirthdayWidget;
