import React from 'react';
import AddIcon from '@mui/icons-material/Add';
import ShareIcon from '@mui/icons-material/Share';

const SharedResourcesHeader = ({ onAddResource }) => {
  return (
    <div className="resources-header">
      <div className="resources-title">
        <h1><ShareIcon className="page-title-icon" /> Recursos Compartidos</h1>
        <p>Comparte y pide prestado entre vecinos - Economía colaborativa</p>
      </div>
      <button className="add-resource-btn" onClick={onAddResource}>
        <AddIcon /> Agregar Recurso
      </button>
    </div>
  );
};

export default SharedResourcesHeader;