import React, { useState } from 'react';
import { showSuccessToast } from '../../utils/sweetalert';
import './EventCard.css';

const EventCard = () => {
  const [status, setStatus] = useState(null);

  const handleEventResponse = () => {
    if (status === 'going') {
      setStatus(null);
      showSuccessToast('Removed from event');
    } else {
      setStatus('going');
      showSuccessToast('You\'re going to this event!');
    }
  };

  return (
    <div className="event-card-home">
      <img src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=200&fit=crop" alt="Christmas 2021" />
      <div className="event-content-home">
        <h4>Christmas 2021</h4>
        <p>26 January 2021</p>
        <span>Lorem Ipsum is simply dummy text of the printing and typesetting industry. 15250 People Going</span>
        <button className="event-btn-home" onClick={handleEventResponse}>
          {status === 'going' ? 'Going ✓' : 'Going / Not Going'}
        </button>
      </div>
    </div>
  );
};

export default EventCard;
