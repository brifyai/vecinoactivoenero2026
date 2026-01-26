import { useEffect } from 'react';

export function useLandingContactForm() {
  useEffect(() => {
    const handleFormSubmit = async (e) => {
      e.preventDefault();
      
      const form = e.target;
      const formData = new FormData(form);
      const submitBtn = form.querySelector('.submit-btn');
      const btnText = submitBtn.querySelector('.btn-text');
      const btnLoading = submitBtn.querySelector('.btn-loading');
      const messageDiv = document.getElementById('formMessage');
      
      // Mostrar estado de carga
      submitBtn.disabled = true;
      btnText.style.display = 'none';
      btnLoading.style.display = 'inline';
      messageDiv.style.display = 'none';
      
      try {
        const response = await fetch('/contact.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nombre: formData.get('nombre'),
            email: formData.get('email'),
            telefono: formData.get('telefono'),
            mensaje: formData.get('mensaje')
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          messageDiv.textContent = result.message;
          messageDiv.className = 'form-message success';
          messageDiv.style.display = 'block';
          form.reset();
        } else {
          throw new Error(result.message || 'Error al enviar el mensaje');
        }
      } catch (error) {
        messageDiv.textContent = error.message || 'Error al enviar el mensaje. Por favor intenta nuevamente.';
        messageDiv.className = 'form-message error';
        messageDiv.style.display = 'block';
      } finally {
        // Restaurar estado del botón
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
      }
    };

    const form = document.getElementById('contactForm');
    if (form) {
      form.addEventListener('submit', handleFormSubmit);
      
      return () => {
        form.removeEventListener('submit', handleFormSubmit);
      };
    }
  }, []);
}