import React from 'react';

const DebugHeader = () => {
  React.useEffect(() => {
    console.log('🔥 DebugHeader montado');
    console.log('🔥 Window width:', window.innerWidth);
    console.log('🔥 Window height:', window.innerHeight);
    console.log('🔥 Device pixel ratio:', window.devicePixelRatio);
    console.log('🔥 User agent:', navigator.userAgent);
    
    // Verificar si estamos en móvil
    const isMobile = window.innerWidth <= 768;
    console.log('🔥 Es móvil?', isMobile);
    
    // Verificar estilos computados del body
    const bodyStyles = window.getComputedStyle(document.body);
    console.log('🔥 Body styles:', {
      background: bodyStyles.background,
      color: bodyStyles.color,
      overflow: bodyStyles.overflow,
      overflowX: bodyStyles.overflowX
    });
  }, []);

  const debugStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    background: 'red',
    zIndex: 999999,
    padding: '10px',
    color: 'white',
    fontSize: '14px',
    fontFamily: 'Arial, sans-serif',
    display: 'block',
    visibility: 'visible',
    opacity: 1,
    width: '100%',
    height: 'auto',
    minHeight: '50px',
    maxWidth: 'none',
    boxSizing: 'border-box'
  };

  const buttonStyle = {
    background: 'yellow',
    color: 'black',
    border: '2px solid black',
    padding: '8px 16px',
    margin: '5px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold',
    display: 'inline-block',
    visibility: 'visible',
    opacity: 1,
    minWidth: '80px',
    maxWidth: 'none',
    width: 'auto'
  };

  return (
    <div style={debugStyle}>
      <div>
        🔥 DEBUG HEADER - Ancho: {window.innerWidth}px - 
        {window.innerWidth <= 768 ? ' MÓVIL' : ' DESKTOP'}
      </div>
      <div style={{ marginTop: '5px' }}>
        <span 
          style={buttonStyle}
          onClick={() => alert('BOTÓN 1 FUNCIONA')}
        >
          BOTÓN 1
        </span>
        <span 
          style={{...buttonStyle, background: 'blue', color: 'white', border: '2px solid white'}}
          onClick={() => alert('BOTÓN 2 FUNCIONA')}
        >
          BOTÓN 2
        </span>
      </div>
    </div>
  );
};

export default DebugHeader;