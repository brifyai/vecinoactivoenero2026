const ProfileInfoCard = ({ 
  profileUser, 
  isPage, 
  isGroup, 
  isEvent, 
  isProject, 
  isHelp, 
  isResource 
}) => {
  return (
    <div className="profile-info-card">
      <h3>Información</h3>
      {profileUser.bio && (
        <div className="info-item">
          <strong>Biografía:</strong>
          <p>{profileUser.bio}</p>
        </div>
      )}
      {profileUser.neighborhoodName && (
        <div className="info-item">
          <strong>Unidad Vecinal:</strong>
          <p>{profileUser.neighborhoodName} ({profileUser.neighborhoodCode})</p>
        </div>
      )}
      <div className="info-item">
        <strong>URL del perfil:</strong>
        <div className="url-display">
          {isPage ? `vecinoactivo.cl/pagina/${profileUser.username}` : 
           isGroup ? `vecinoactivo.cl/grupo/${profileUser.username}` : 
           isEvent ? `vecinoactivo.cl/evento/${profileUser.username}` : 
           isProject ? `vecinoactivo.cl/proyecto/${profileUser.username}` : 
           isHelp ? `vecinoactivo.cl/ayuda/${profileUser.username}` : 
           isResource ? `vecinoactivo.cl/recursos/${profileUser.username}` : 
           `vecinoactivo.cl/${profileUser.username}`}
        </div>
      </div>
      
      {/* Group specific info */}
      {isGroup && profileUser.members && (
        <div className="info-item">
          <strong>Miembros:</strong>
          <p>{profileUser.members.length} miembros</p>
        </div>
      )}
      
      {/* Event specific info */}
      {isEvent && profileUser.date && (
        <>
          <div className="info-item">
            <strong>Fecha:</strong>
            <p>{profileUser.date}</p>
          </div>
          <div className="info-item">
            <strong>Hora:</strong>
            <p>{profileUser.time}</p>
          </div>
          <div className="info-item">
            <strong>Ubicación:</strong>
            <p>{profileUser.email}</p>
          </div>
          <div className="info-item">
            <strong>Asistentes:</strong>
            <p>{profileUser.attendees?.length || 0} personas</p>
          </div>
        </>
      )}
      
      {/* Project specific info */}
      {isProject && (
        <>
          <div className="info-item">
            <strong>Estado:</strong>
            <p>{profileUser.status}</p>
          </div>
          <div className="info-item">
            <strong>Votos:</strong>
            <p>{profileUser.votes}</p>
          </div>
          <div className="info-item">
            <strong>Voluntarios:</strong>
            <p>{profileUser.volunteers?.length || 0}</p>
          </div>
          <div className="info-item">
            <strong>Presupuesto:</strong>
            <p>${profileUser.budget || 0}</p>
          </div>
          <div className="info-item">
            <strong>Creador:</strong>
            <p>{profileUser.creatorName}</p>
          </div>
          <div className="info-item">
            <strong>Unidad Vecinal:</strong>
            <p>{profileUser.neighborhoodName}</p>
          </div>
        </>
      )}
      
      {/* Help request specific info */}
      {isHelp && (
        <>
          <div className="info-item">
            <strong>Estado:</strong>
            <p>{profileUser.status}</p>
          </div>
          <div className="info-item">
            <strong>Urgencia:</strong>
            <p>{profileUser.urgency}</p>
          </div>
          <div className="info-item">
            <strong>Tipo:</strong>
            <p>{profileUser.email}</p>
          </div>
          {profileUser.location && (
            <div className="info-item">
              <strong>Ubicación:</strong>
              <p>{profileUser.location}</p>
            </div>
          )}
          <div className="info-item">
            <strong>Ofertas de ayuda:</strong>
            <p>{profileUser.offers?.length || 0}</p>
          </div>
          <div className="info-item">
            <strong>Solicitante:</strong>
            <p>{profileUser.requesterName}</p>
          </div>
          <div className="info-item">
            <strong>Unidad Vecinal:</strong>
            <p>{profileUser.neighborhoodName}</p>
          </div>
        </>
      )}
      
      {/* Resource specific info */}
      {isResource && (
        <>
          <div className="info-item">
            <strong>Categoría:</strong>
            <p>{profileUser.email}</p>
          </div>
          <div className="info-item">
            <strong>Condición:</strong>
            <p>{profileUser.condition}</p>
          </div>
          <div className="info-item">
            <strong>Disponible:</strong>
            <p>{profileUser.isAvailable ? 'Sí' : 'No'}</p>
          </div>
          <div className="info-item">
            <strong>Días máx. de préstamo:</strong>
            <p>{profileUser.maxLoanDays}</p>
          </div>
          {profileUser.requiresDeposit && (
            <div className="info-item">
              <strong>Depósito:</strong>
              <p>${profileUser.depositAmount}</p>
            </div>
          )}
          <div className="info-item">
            <strong>Préstamos realizados:</strong>
            <p>{profileUser.totalLoans}</p>
          </div>
          <div className="info-item">
            <strong>Dueño:</strong>
            <p>{profileUser.ownerName}</p>
          </div>
          <div className="info-item">
            <strong>Unidad Vecinal:</strong>
            <p>{profileUser.neighborhoodName}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfileInfoCard;