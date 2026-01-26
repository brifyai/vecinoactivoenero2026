import React from 'react';

const UltraDiagnostic = () => {
  React.useEffect(() => {
    console.log('🔥🔥🔥 UltraDiagnostic iniciando...');
    
    // Test 1: Verificar que JavaScript funciona
    console.log('🔥 Test 1: JavaScript funciona');
    
    // Test 2: Verificar que el DOM existe
    console.log('🔥 Test 2: document.body existe:', !!document.body);
    console.log('🔥 Test 2: document.getElementById("root") existe:', !!document.getElementById('root'));
    
    // Test 3: Crear elemento directamente en body
    console.log('🔥 Test 3: Creando elemento directo en body...');
    
    const testDiv = document.createElement('div');
    testDiv.innerHTML = 'TEST DIRECTO EN BODY - SI VES ESTO, JS FUNCIONA';
    testDiv.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      background: magenta !important;
      color: white !important;
      padding: 20px !important;
      z-index: 9999999 !important;
      font-size: 18px !important;
      font-weight: bold !important;
      text-align: center !important;
    `;
    
    document.body.appendChild(testDiv);
    console.log('🔥 Test 3: Elemento agregado al body');
    
    // Test 4: Verificar estilos computados del body
    const bodyStyles = window.getComputedStyle(document.body);
    console.log('🔥 Test 4: Body styles:', {
      display: bodyStyles.display,
      visibility: bodyStyles.visibility,
      opacity: bodyStyles.opacity,
      background: bodyStyles.background,
      color: bodyStyles.color
    });
    
    // Test 5: Verificar viewport
    console.log('🔥 Test 5: Viewport:', {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
      userAgent: navigator.userAgent.substring(0, 100)
    });
    
    // Test 6: Verificar si hay elementos ocultos
    const allElements = document.querySelectorAll('*');
    let hiddenCount = 0;
    allElements.forEach(el => {
      const styles = window.getComputedStyle(el);
      if (styles.display === 'none' || styles.visibility === 'hidden' || styles.opacity === '0') {
        hiddenCount++;
      }
    });
    console.log('🔥 Test 6: Elementos ocultos encontrados:', hiddenCount, 'de', allElements.length);
    
    // Test 7: Alert para verificar que el navegador responde
    setTimeout(() => {
      alert('🔥 TEST CRÍTICO: Si ves esta alerta, JavaScript funciona correctamente');
    }, 1000);
    
    return () => {
      if (testDiv && testDiv.parentNode) {
        testDiv.parentNode.removeChild(testDiv);
      }
    };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: '50px',
      left: 0,
      right: 0,
      background: 'orange',
      color: 'black',
      padding: '15px',
      zIndex: 9999998,
      fontSize: '16px',
      fontWeight: 'bold',
      textAlign: 'center'
    }}>
      🔥 ULTRA DIAGNOSTIC REACT COMPONENT - SI VES ESTO, REACT FUNCIONA
    </div>
  );
};

export default UltraDiagnostic;