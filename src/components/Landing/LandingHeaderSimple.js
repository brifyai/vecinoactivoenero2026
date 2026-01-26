import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingHeaderSimple = () => {
  const navigate = useNavigate();
  
  console.log('🔥 LandingHeaderSimple renderizando...');
  
  React.useEffect(() => {
    console.log('🔥 LandingHeaderSimple montado');
    
    // Verificar si el elemento se creó en el DOM
    const headerElement = document.querySelector('[data-testid="debug-header"]');
    console.log('🔥 Header element en DOM:', headerElement);
    
    // Verificar estilos computados
    if (headerElement) {
      const styles = window.getComputedStyle(headerElement);
      console.log('🔥 Estilos computados:', {
        display: styles.display,
        visibility: styles.visibility,
        opacity: styles.opacity,
        background: styles.background,
        zIndex: styles.zIndex,
        position: styles.position
      });
    }
  }, []);

  return (
    <div 
      data-testid="debug-header"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'red',
        zIndex: 99999,
        padding: '20px',
        height: '100px',
        display: 'block',
        visibility: 'visible',
        opacity: 1
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '100%'
      }}>
        <h1 style={{ color: 'white', fontSize: '24px', margin: 0 }}>VECINO ACTIVO DEBUG</h1>
        
        <div style={{ display: 'flex', gap: '20px' }}>
          <div
            style={{
              background: 'yellow',
              color: 'black',
              padding: '15px 25px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              border: '3px solid black',
              borderRadius: '8px',
              display: 'block'
            }}
            onClick={() => {
              console.log('🔥 CLICK INICIAR SESION');
              alert('CLICK INICIAR SESION - SI VES ESTA ALERTA, EL CLICK FUNCIONA');
              navigate('/iniciar-sesion');
            }}
          >
            INICIAR SESIÓN
          </div>
          
          <div
            style={{
              background: 'blue',
              color: 'white',
              padding: '15px 25px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              border: '3px solid white',
              borderRadius: '8px',
              display: 'block'
            }}
            onClick={() => {
              console.log('🔥 CLICK REGISTRARSE');
              alert('CLICK REGISTRARSE - SI VES ESTA ALERTA, EL CLICK FUNCIONA');
              navigate('/registrarse');
            }}
          >
            REGISTRARSE
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingHeaderSimple;

export default LandingHeaderSimple;