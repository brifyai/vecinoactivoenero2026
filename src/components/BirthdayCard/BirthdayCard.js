import React from 'react';
import CakeIcon from '@mui/icons-material/Cake';
import './BirthdayCard.css';

const BirthdayCard = () => {
  return (
    <div className="birthday-card-home">
      <div className="birthday-header-home">
        <CakeIcon />
        <h3>Cumpleaños</h3>
      </div>
      <div className="birthday-person-home">
        <img src="https://i.pravatar.cc/60?img=16" alt="Sufiya Elija" />
        <div className="birthday-info-home">
          <h4>Sufiya Elija</h4>
          <p>Cumpleaños hoy</p>
        </div>
      </div>
    </div>
  );
};

export default BirthdayCard;
