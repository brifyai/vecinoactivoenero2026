import React from 'react';
import { useNavigate } from 'react-router-dom';

const UltraSimpleHeader = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    console.log('🔥 UltraSimpleHeader montado');
    
    // Crear elementos directamente en el DOM para bypass completo del React/CSS
    const headerElement = document.createElement('div');
    headerElement.id = 'ultra-simple-header';
    headerElement.innerHTML = `
      <div style="
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        width: 100vw !important;
        height: 80px !important;
        background: #ff0000 !important;
        z-index: 999999 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        padding: 0 20px !important;
        box-sizing: border-box !important;
        font-family: Arial, sans-serif !important;
      ">
        <div style="
          color: white !important;
          font-size: 24px !important;
          font-weight: bold !important;
        ">
          VECINO ACTIVO
        </div>
        <div style="
          display: flex !important;
          gap: 15px !important;
        ">
          <button id="btn-login" style="
            background: #ffff00 !important;
            color: #000000 !important;
            border: 3px solid #000000 !important;
            padding: 12px 20px !important;
            font-size: 14px !important;
            font-weight: bold !important;
            cursor: pointer !important;
            border-radius: 8px !important;
            min-width: 120px !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
          ">
            INICIAR SESIÓN
          </button>
          <button id="btn-register" style="
            background: #0000ff !important;
            color: #ffffff !important;
            border: 3px solid #ffffff !important;
            padding: 12px 20px !important;
            font-size: 14px !important;
            font-weight: bold !important;
            cursor: pointer !important;
            border-radius: 8px !important;
            min-width: 120px !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
          ">
            REGISTRARSE
          </button>
        </div>
      </div>
    `;

    // Insertar al inicio del body para evitar cualquier interferencia
    document.body.insertBefore(headerElement, document.body.firstChild);

    // Agregar event listeners directamente
    const loginBtn = document.getElementById('btn-login');
    const registerBtn = document.getElementById('btn-register');

    const handleLogin = () => {
      console.log('🔥 CLICK LOGIN - DOM DIRECTO');
      alert('LOGIN CLICKED - DOM DIRECTO');
      navigate('/iniciar-sesion');
    };

    const handleRegister = () => {
      console.log('🔥 CLICK REGISTER - DOM DIRECTO');
      alert('REGISTER CLICKED - DOM DIRECTO');
      navigate('/registrarse');
    };

    if (loginBtn) loginBtn.addEventListener('click', handleLogin);
    if (registerBtn) registerBtn.addEventListener('click', handleRegister);

    // Cleanup
    return () => {
      if (loginBtn) loginBtn.removeEventListener('click', handleLogin);
      if (registerBtn) registerBtn.removeEventListener('click', handleRegister);
      const element = document.getElementById('ultra-simple-header');
      if (element) element.remove();
    };
  }, [navigate]);

  // Retornar null porque el componente se renderiza directamente en el DOM
  return null;
};

export default UltraSimpleHeader;