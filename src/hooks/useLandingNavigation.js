import { useEffect } from 'react';

export function useLandingNavigation() {
  useEffect(() => {
    // Scroll suave para los enlaces de navegación
    const handleNavClick = (e) => {
      if (e.target.classList.contains('nav-link')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          const headerHeight = 80; // Altura del header fijo actualizada
          const targetPosition = targetElement.offsetTop - headerHeight;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }
    };

    // Marcar enlace activo según scroll
    const handleScroll = () => {
      const sections = ['about', 'what-is', 'features', 'contact'];
      const headerHeight = 80;
      const scrollPosition = window.scrollY + headerHeight + 100;
      
      let activeSection = '';
      
      sections.forEach(sectionId => {
        const element = document.getElementById(sectionId);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetBottom = offsetTop + element.offsetHeight;
          
          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            activeSection = sectionId;
          }
        }
      });
      
      // Actualizar clases activas
      document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href').substring(1);
        if (href === activeSection) {
          link.classList.add('active');
        }
      });
    };

    // Agregar event listeners
    document.addEventListener('click', handleNavClick);
    window.addEventListener('scroll', handleScroll);
    
    // Ejecutar una vez al cargar
    handleScroll();

    return () => {
      document.removeEventListener('click', handleNavClick);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
}