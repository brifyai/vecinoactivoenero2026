import React from 'react';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import LoopIcon from '@mui/icons-material/Loop';
import CancelIcon from '@mui/icons-material/Cancel';
import MailIcon from '@mui/icons-material/Mail';

const ReservationsList = ({ 
  reservations, 
  resources, 
  user, 
  view,
  onApproveReservation,
  onCancelReservation,
  onCompleteReservation
}) => {
  if (reservations.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <MailIcon style={{ fontSize: '64px', opacity: 0.3 }} />
        </div>
        <h3>No hay {view === 'pending' ? 'solicitudes pendientes' : 'reservas'}</h3>
        <p>{view === 'pending' ? 'Cuando alguien solicite tus recursos aparecerán aquí' : 'Aún no has reservado ningún recurso'}</p>
      </div>
    );
  }

  return (
    <div className="resources-grid">
      {reservations.map(reservation => {
        const resource = resources.find(r => r.id === reservation.resourceId);
        const isOwner = reservation.ownerId === user?.id;

        return (
          <div key={reservation.id} className="reservation-card">
            <div className="reservation-header">
              <div className="reservation-status" data-status={reservation.status}>
                {reservation.status === 'pendiente' && (
                  <>
                    <HourglassEmptyIcon fontSize="small" /> Pendiente
                  </>
                )}
                {reservation.status === 'activa' && (
                  <>
                    <LoopIcon fontSize="small" /> Activa
                  </>
                )}
                {reservation.status === 'completada' && (
                  <>
                    <CheckCircleIcon fontSize="small" /> Completada
                  </>
                )}
                {reservation.status === 'cancelada' && (
                  <>
                    <CancelIcon fontSize="small" /> Cancelada
                  </>
                )}
              </div>
            </div>

            <h3 className="reservation-resource-name">{reservation.resourceName}</h3>

            <div className="reservation-dates">
              <CalendarTodayIcon fontSize="small" />
              <span>
                {new Date(reservation.startDate).toLocaleDateString('es-CL')} - {' '}
                {new Date(reservation.endDate).toLocaleDateString('es-CL')}
              </span>
            </div>

            {reservation.purpose && (
              <p className="reservation-purpose">
                <strong>Propósito:</strong> {reservation.purpose}
              </p>
            )}

            <div className="reservation-people">
              {isOwner ? (
                <div className="person-info">
                  <img src={reservation.borrowerAvatar} alt={reservation.borrowerName} />
                  <div>
                    <span className="person-name">{reservation.borrowerName}</span>
                    <span className="person-role">Solicitante</span>
                  </div>
                </div>
              ) : (
                <div className="person-info">
                  <img src={reservation.ownerAvatar || resource?.ownerAvatar} alt={reservation.ownerName} />
                  <div>
                    <span className="person-name">{reservation.ownerName}</span>
                    <span className="person-role">Dueño</span>
                  </div>
                </div>
              )}
            </div>

            <div className="reservation-actions">
              {isOwner && reservation.status === 'pendiente' && (
                <>
                  <button
                    className="approve-btn"
                    onClick={() => onApproveReservation(reservation.id)}
                  >
                    <CheckCircleIcon fontSize="small" />
                    Aprobar
                  </button>
                  <button
                    className="reject-btn"
                    onClick={() => onCancelReservation(reservation.id)}
                  >
                    <CloseIcon fontSize="small" />
                    Rechazar
                  </button>
                </>
              )}
              {isOwner && reservation.status === 'activa' && (
                <button
                  className="complete-btn"
                  onClick={() => onCompleteReservation(reservation)}
                >
                  <CheckCircleIcon fontSize="small" />
                  Marcar como Devuelto
                </button>
              )}
              {!isOwner && reservation.status === 'pendiente' && (
                <button
                  className="cancel-btn"
                  onClick={() => onCancelReservation(reservation.id)}
                >
                  Cancelar Solicitud
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ReservationsList;