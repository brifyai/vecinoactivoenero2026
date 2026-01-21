import { useNavigate } from 'react-router-dom';
import { showSuccessToast } from '../utils/sweetalert';
import CakeIcon from '@mui/icons-material/Cake';
import './Birthday.css';

const Birthday = () => {
  const navigate = useNavigate();

  const handleSendWishes = (personName) => {
    showSuccessToast(`¡Deseos de cumpleaños enviados a ${personName}!`);
    // Podría navegar a messenger o abrir un modal
  };

  const handleSendGift = (personName) => {
    showSuccessToast(`Abriendo tienda de regalos para ${personName}...`);
    // Simular apertura de tienda de regalos
  };
  const todayBirthdays = [
    { name: 'Carlos Mendoza', date: '12 Dic', age: 23, avatar: 'https://i.pravatar.cc/60?img=11' },
    { name: 'Josephin Water', date: '12 Dic', age: 25, avatar: 'https://i.pravatar.cc/60?img=8' },
    { name: 'Juan Pablo Torres', date: '12 Dic', age: 28, avatar: 'https://i.pravatar.cc/60?img=12' },
  ];

  const tomorrowBirthdays = [
    { name: 'Maria Elena Rodriguez', date: '13 Dic', age: 24, avatar: 'https://i.pravatar.cc/60?img=5' },
    { name: 'Ana Maria Fernandez', date: '13 Dic', age: 26, avatar: 'https://i.pravatar.cc/60?img=9' },
  ];

  const januaryBirthdays = [
    { name: 'Roberto Carlos Gomez', date: '15 Ene', age: 27, avatar: 'https://i.pravatar.cc/60?img=13' },
    { name: 'Patricia Vasquez', date: '18 Ene', age: 29, avatar: 'https://i.pravatar.cc/60?img=10' },
    { name: 'Miguel Angel Santos', date: '22 Ene', age: 30, avatar: 'https://i.pravatar.cc/60?img=14' },
    { name: 'Carmen Gloria Rojas', date: '25 Ene', age: 31, avatar: 'https://i.pravatar.cc/60?img=15' },
    { name: 'Francisco Javier Diaz', date: '28 Ene', age: 26, avatar: 'https://i.pravatar.cc/60?img=16' },
    { name: 'Rosa Maria Herrera', date: '30 Ene', age: 24, avatar: 'https://i.pravatar.cc/60?img=17' },
  ];

  const februaryBirthdays = [
    { name: 'Luis Alberto Munoz', date: '5 Feb', age: 25, avatar: 'https://i.pravatar.cc/60?img=18' },
    { name: 'Isabel Margarita Flores', date: '8 Feb', age: 32, avatar: 'https://i.pravatar.cc/60?img=19' },
    { name: 'Pedro Antonio Ruiz', date: '12 Feb', age: 28, avatar: 'https://i.pravatar.cc/60?img=20' },
    { name: 'Juana del Carmen Soto', date: '18 Feb', age: 27, avatar: 'https://i.pravatar.cc/60?img=21' },
    { name: 'Alberto Enrique Castillo', date: '22 Feb', age: 29, avatar: 'https://i.pravatar.cc/60?img=22' },
    { name: 'Maria Teresa Nunez', date: '25 Feb', age: 30, avatar: 'https://i.pravatar.cc/60?img=23' },
    { name: 'Cristobal Andres Moreno', date: '28 Feb', age: 26, avatar: 'https://i.pravatar.cc/60?img=24' },
  ];

  return (
    <div className="birthday-page">
      <div className="birthday-hero">
        <div className="hero-date">12 Dic</div>
        <h1>PRÓXIMOS CUMPLEAÑOS</h1>
        <p>Cumpleaños de tus Vecinos</p>
      </div>

      <div className="birthday-content">
        <div className="birthday-list-section">
          <div className="birthday-section">
            <h3>Hoy</h3>
            <div className="birthday-grid">
              {todayBirthdays.map((person, index) => (
                <div key={index} className="birthday-card">
                  <img src={person.avatar} alt={person.name} />
                  <h4>{person.name}</h4>
                  <p>{person.date}</p>
                  <span>{person.age} Años</span>
                  <button className="create-card-btn" onClick={() => handleSendWishes(person.name)}>
                    Enviar Deseos
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="birthday-section">
            <h3>Mañana</h3>
            <div className="birthday-grid">
              {tomorrowBirthdays.map((person, index) => (
                <div key={index} className="birthday-card">
                  <img src={person.avatar} alt={person.name} />
                  <h4>{person.name}</h4>
                  <p>{person.date}</p>
                  <span>{person.age} Años</span>
                  <button className="create-card-btn" onClick={() => handleSendWishes(person.name)}>
                    Enviar Deseos
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="birthday-section">
            <h3>Enero</h3>
            <div className="birthday-grid">
              {januaryBirthdays.map((person, index) => (
                <div key={index} className="birthday-card">
                  <img src={person.avatar} alt={person.name} />
                  <h4>{person.name}</h4>
                  <p>{person.date}</p>
                  <span>{person.age} Años</span>
                  <button className="create-card-btn" onClick={() => handleSendWishes(person.name)}>
                    Enviar Deseos
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="birthday-section">
            <h3>Febrero</h3>
            <div className="birthday-grid">
              {februaryBirthdays.map((person, index) => (
                <div key={index} className="birthday-card">
                  <img src={person.avatar} alt={person.name} />
                  <h4>{person.name}</h4>
                  <p>{person.date}</p>
                  <span>{person.age} Años</span>
                  <button className="create-card-btn" onClick={() => handleSendWishes(person.name)}>
                    Enviar Deseos
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="birthday-sidebar">
          <div className="profile-card-birthday">
            <img src="https://i.pravatar.cc/100?img=8" alt="Kelin Jasen" className="profile-avatar-large" />
            <h3>Kelin Jasen ❤️</h3>
            <p>kelin.jasen156@gmail.com</p>
            <p className="profile-desc">Lorem Ipsum es simplemente texto de relleno de la industria de la impresión y la composición tipográfica.</p>
            <div className="profile-stats-birthday">
              <div><strong>546</strong><span>Siguiendo</span></div>
              <div><strong>26335</strong><span>Me gusta</span></div>
              <div><strong>6845</strong><span>Seguidores</span></div>
            </div>
            <button className="view-profile-btn-birthday" onClick={() => navigate('/linea-tiempo')}>Ver Perfil</button>
          </div>

          <div className="friend-suggestion-card">
            <h3>Sugerencias de Vecinos</h3>
            <div className="suggestion-grid">
              <div className="suggestion-item">
                <img src="https://i.pravatar.cc/150?img=15" alt="Josephin Water" />
                <p>Josephin Water</p>
                <span>Adama, USA</span>
              </div>
              <div className="suggestion-item">
                <img src="https://i.pravatar.cc/150?img=16" alt="Sufiya Elija" />
                <p>Sufiya Elija</p>
                <span>Adama, USA</span>
              </div>
            </div>
          </div>

          <div className="birthday-special-card">
            <div className="special-card-header">
              <CakeIcon />
              <h3>¡Cumpleaños!</h3>
              <p>Desea Feliz Cumpleaños a tus Vecinos</p>
            </div>
            <div className="special-card-content">
              <div className="cake-icon-large">🎂</div>
              <img src="https://i.pravatar.cc/80?img=16" alt="Sufiya Elija" className="birthday-person" />
              <span className="age-badge">28+</span>
            </div>
            <h4>Sufiya Elija</h4>
            <p>Lorem Ipsum es simplemente texto de relleno de la industria de la impresión y la composición tipográfica.</p>
            <button className="wish-btn" onClick={() => handleSendWishes('Sufiya Elija')}>
              Desear Feliz Cumpleaños a tu Vecino
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Birthday;
