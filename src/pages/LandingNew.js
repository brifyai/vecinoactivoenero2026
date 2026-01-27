import React, { useEffect } from 'react';

const LandingNew = () => {
  useEffect(() => {
    // Cargar Tailwind y Lucide
    const tailwindScript = document.createElement('script');
    tailwindScript.src = 'https://cdn.tailwindcss.com';
    document.head.appendChild(tailwindScript);

    const lucideScript = document.createElement('script');
    lucideScript.src = 'https://unpkg.com/lucide@latest';
    lucideScript.onload = () => {
      if (window.lucide) {
        window.lucide.createIcons();
      }
    };
    document.head.appendChild(lucideScript);

    return () => {
      document.head.removeChild(tailwindScript);
      document.head.removeChild(lucideScript);
    };
  }, []);

  return (
    <div>
      {/* Redirigir al HTML completo de Vecino Activo */}
      <iframe 
        src="/index-landing-vecino-activo.html" 
        style={{
          width: '100%',
          height: '100vh',
          border: 'none',
          position: 'fixed',
          top: 0,
          left: 0
        }}
        title="Vecino Activo - Landing Page"
      />
    </div>
  );
};

export default LandingNew;
