import React from 'react';
import AddIcon from '@mui/icons-material/Add';
import StorefrontIcon from '@mui/icons-material/Storefront';

const LocalBusinessesHeader = ({ onRegisterBusiness }) => {
  return (
    <div className="businesses-header">
      <div>
        <h1><StorefrontIcon className="page-title-icon" /> Negocios Locales</h1>
        <p>Apoya la economía de tu barrio</p>
      </div>
      <button className="register-business-btn" onClick={onRegisterBusiness}>
        <AddIcon /> Registrar Negocio
      </button>
    </div>
  );
};

export default LocalBusinessesHeader;