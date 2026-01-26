import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingHeaderFixed = () => {
  const navigate = useNavigate();

  console.log('🔥🔥🔥 LandingHeaderFixed component renderizando...');

  // Crear el header directamente en el DOM para evitar cualquier interferencia de React
  React.useEffect(() => {
    console.log('🔥🔥🔥 LandingHeaderFixed useEffect ejecutándose...');
    
    // Remover cualquier header existente
    const existingHeader = document.getElementById('extreme-header');
    if (existingHeader) {
      console.log('🔥 Removiendo header existente...');
      existingHeader.remove();
    }

    console.log('🔥 Creando nuevo header rojo...');
    
    // Crear el header directamente
    const header = document.createElement('div');
    header.id = 'extreme-header';
    header.style.cssText = `
      position: fixed !important;
      top: 0px !important;
      left: 0px !important;
      right: 0px !important;
      width: 100vw !important;
      height: 100px !important;
      background: red !important;
      z-index: 999999 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      padding: 0 32px !important;
      box-sizing: border-box !important;
      border: 5px solid yellow !important;
      font-size: 20px !important;
      font-weight: bold !important;
      color: white !important;
      font-family: Arial, sans-serif !important;
    `;

    header.innerHTML = `
      <div style="display: flex !important; align-items: center !important; gap: 16px !important; color: white !important; font-size: 28px !important; font-weight: 800 !important;">
        <span style="font-size: 36px !important;">👥</span>
        <span>VECINO ACTIVO - HEADER ROJO</span>
      </div>
      
      <div style="display: flex !important; gap: 12px !important; align-items: center !important;">
        <button id="login-btn" style="background: blue !important; color: white !important; border: 3px solid black !important; padding: 15px 25px !important; border-radius: 12px !important; font-size: 16px !important; font-weight: 600 !important; cursor: pointer !important; min-width: 150px !important; min-height: 50px !important;">
          INICIAR SESIÓN
        </button>
        
        <button id="register-btn" style="background: green !important; color: white !important; border: 3px solid black !important; padding: 15px 25px !important; border-radius: 12px !important; font-size: 16px !important; font-weight: 600 !important; cursor: pointer !important; min-width: 150px !important; min-height: 50px !important;">
          REGISTRARSE
        </button>
      </div>
    `;

    // Agregar al body directamente
    document.body.appendChild(header);
    console.log('🔥 Header rojo agregado al DOM!');

    // Agregar event listeners
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');

    if (loginBtn) {
      loginBtn.addEventListener('click', () => navigate('/iniciar-sesion'));
      console.log('🔥 Event listener agregado al botón login');
    }

    if (registerBtn) {
      registerBtn.addEventListener('click', () => navigate('/registrarse'));
      console.log('🔥 Event listener agregado al botón register');
    }

    // Cleanup
    return () => {
      console.log('🔥 Limpiando header...');
      const headerToRemove = document.getElementById('extreme-header');
      if (headerToRemove) {
        headerToRemove.remove();
      }
    };
  }, [navigate]);

  console.log('🔥🔥🔥 LandingHeaderFixed retornando null...');
  
  // No renderizar nada en React, todo se maneja directamente en el DOM
  return null;
};

export default LandingHeaderFixed;