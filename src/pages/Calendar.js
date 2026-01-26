import React, { useState } from 'react';
import { showInputDialog, showSuccessToast } from '../utils/sweetalert';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddIcon from '@mui/icons-material/Add';
import './Calendar.css';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1)); // Enero 2026
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState([
    { id: 1, date: 15, title: 'Reunión de Equipo', time: '10:00 AM', color: '#1877f2' },
    { id: 2, date: 20, title: 'Fiesta de Cumpleaños', time: '6:00 PM', color: '#f5576c' },
    { id: 3, date: 25, title: 'Fecha Límite de Proyecto', time: '5:00 PM', color: '#f5a623' },
  ]);

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day) => {
    if (day) {
      setSelectedDate(day);
    }
  };

  const handleAddEvent = async () => {
    if (!selectedDate) {
      showSuccessToast('Por favor selecciona una fecha primero');
      return;
    }

    const result = await showInputDialog('Agregar Evento', 'Título del evento', 'text');
    if (result.isConfirmed && result.value) {
      const newEvent = {
        id: Date.now(),
        date: selectedDate,
        title: result.value,
        time: '12:00 PM',
        color: ['#1877f2', '#f5576c', '#f5a623', '#42b72a'][Math.floor(Math.random() * 4)]
      };
      setEvents([...events, newEvent]);
      showSuccessToast('¡Evento agregado exitosamente!');
    }
  };

  const getEventsForDate = (day) => {
    return events.filter(event => event.date === day);
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="calendar-page">
      <div className="calendar-header">
        <CalendarMonthIcon className="header-icon" />
        <h1>Calendario</h1>
        <p>Administra tus eventos y horarios</p>
      </div>

      <div className="calendar-content">
        <div className="calendar-view">
          <div className="calendar-controls">
            <button onClick={handlePrevMonth} className="nav-btn">
              <ChevronLeftIcon />
            </button>
            <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
            <button onClick={handleNextMonth} className="nav-btn">
              <ChevronRightIcon />
            </button>
          </div>

          <div className="calendar-grid">
            {dayNames.map(day => (
              <div key={day} className="calendar-day-name">{day}</div>
            ))}
            {days.map((day, index) => {
              const dayEvents = day ? getEventsForDate(day) : [];
              return (
                <div
                  key={index}
                  className={`calendar-day ${!day ? 'empty' : ''} ${selectedDate === day ? 'selected' : ''}`}
                  onClick={() => handleDateClick(day)}
                >
                  {day && (
                    <>
                      <span className="day-number">{day}</span>
                      {dayEvents.length > 0 && (
                        <div className="day-events">
                          {dayEvents.map(event => (
                            <div
                              key={event.id}
                              className="day-event-dot"
                              style={{ backgroundColor: event.color }}
                              title={event.title}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="events-sidebar">
          <div className="sidebar-header">
            <h3>Próximos Eventos</h3>
            <button className="add-event-btn" onClick={handleAddEvent}>
              <AddIcon fontSize="small" />
            </button>
          </div>
          {events.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#65676b', padding: '20px' }}>
              No hay eventos
            </p>
          ) : (
            events.map((event) => (
              <div key={event.id} className="event-item" style={{ borderLeftColor: event.color }}>
                <div className="event-date">{event.date}</div>
                <div className="event-details">
                  <h4>{event.title}</h4>
                  <p>{event.time}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
