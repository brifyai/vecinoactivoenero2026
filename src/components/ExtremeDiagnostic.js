import React from 'react';

const ExtremeDiagnostic = () => {
  console.log('🔥 ExtremeDiagnostic renderizando...');
  
  return (
    <>
      {/* Header con estilos extremos para forzar visibilidad */}
      <div style={{
        position: 'fixed !important',
        top: '0px !important',
        left: '0px !important',
        right: '0px !important',
        width: '100vw !important',
        height: '100px !important',
        background: 'red !important',
        zIndex: '999999 !important',
        display: 'flex !important',
        alignItems: 'center !important',
        justifyContent: 'space-between !important',
        padding: '0 20px !important',
        boxSizing: 'border-box !important',
        border: '10px solid yellow !important',
        fontSize: '20px !important',
        fontWeight: 'bold !important',
        color: 'white !important'
      }}>
        <div style={{
          background: 'blue !important',
          color: 'white !important',
          padding: '10px !important',
          fontSize: '18px !important'
        }}>
          VECINO ACTIVO
        </div>
        
        <div style={{
          display: 'flex !important',
          gap: '10px !important'
        }}>
          <button style={{
            background: 'green !important',
            color: 'white !important',
            border: '3px solid black !important',
            padding: '15px 25px !important',
            fontSize: '16px !important',
            fontWeight: 'bold !important',
            cursor: 'pointer !important',
            minWidth: '150px !important',
            minHeight: '50px !important'
          }}>
            INICIAR SESIÓN
          </button>
          
          <button style={{
            background: 'purple !important',
            color: 'white !important',
            border: '3px solid black !important',
            padding: '15px 25px !important',
            fontSize: '16px !important',
            fontWeight: 'bold !important',
            cursor: 'pointer !important',
            minWidth: '150px !important',
            minHeight: '50px !important'
          }}>
            REGISTRARSE
          </button>
        </div>
      </div>
      
      {/* Espaciador */}
      <div style={{
        height: '120px !important',
        background: 'orange !important',
        width: '100% !important'
      }}></div>
      
      {/* Contenido visible */}
      <div style={{
        padding: '20px !important',
        background: 'lightblue !important',
        minHeight: '500px !important'
      }}>
        <h1 style={{
          fontSize: '48px !important',
          color: 'black !important',
          textAlign: 'center !important'
        }}>
          DIAGNÓSTICO EXTREMO
        </h1>
        <p style={{
          fontSize: '24px !important',
          color: 'black !important',
          textAlign: 'center !important'
        }}>
          Si ves este texto pero NO ves los botones del header rojo arriba, 
          entonces hay un problema más profundo con el CSS o el DOM.
        </p>
      </div>
    </>
  );
};

export default ExtremeDiagnostic;