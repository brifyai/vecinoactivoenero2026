import Swal from 'sweetalert2';

// Configuración global de SweetAlert2
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
});

// Success Toast
export const showSuccessToast = (message) => {
  Toast.fire({
    icon: 'success',
    title: message
  });
};

// Error Toast
export const showErrorToast = (message) => {
  Toast.fire({
    icon: 'error',
    title: message
  });
};

// Info Toast
export const showInfoToast = (message) => {
  Toast.fire({
    icon: 'info',
    title: message
  });
};

// Warning Toast
export const showWarningToast = (message) => {
  Toast.fire({
    icon: 'warning',
    title: message
  });
};

// Success Alert
export const showSuccessAlert = (title, text) => {
  return Swal.fire({
    icon: 'success',
    title: title,
    text: text,
    confirmButtonColor: '#1877f2',
    confirmButtonText: 'OK'
  });
};

// Error Alert
export const showErrorAlert = (title, text) => {
  return Swal.fire({
    icon: 'error',
    title: title,
    text: text,
    confirmButtonColor: '#f02849',
    confirmButtonText: 'OK'
  });
};

// Confirmation Dialog
export const showConfirmDialog = (title, text, confirmText = 'Sí', cancelText = 'No') => {
  return Swal.fire({
    title: title,
    text: text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#1877f2',
    cancelButtonColor: '#65676b',
    confirmButtonText: confirmText,
    cancelButtonText: cancelText
  });
};

// Delete Confirmation
export const showDeleteConfirm = (title = '¿Estás seguro?', text = '¡No podrás revertir esto!') => {
  return Swal.fire({
    title: title,
    text: text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#f02849',
    cancelButtonColor: '#65676b',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  });
};

// Loading Alert
export const showLoading = (title = 'Cargando...') => {
  Swal.fire({
    title: title,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
};

// Close Loading
export const closeLoading = () => {
  Swal.close();
};

// Input Dialog
export const showInputDialog = (title, inputPlaceholder, inputType = 'text') => {
  return Swal.fire({
    title: title,
    input: inputType,
    inputPlaceholder: inputPlaceholder,
    showCancelButton: true,
    confirmButtonColor: '#1877f2',
    cancelButtonColor: '#65676b',
    confirmButtonText: 'Enviar',
    cancelButtonText: 'Cancelar',
    inputValidator: (value) => {
      if (!value) {
        return '¡Necesitas escribir algo!';
      }
    }
  });
};

// Create Page Dialog - Diseñado específicamente para crear páginas
export const showCreatePageDialog = () => {
  return Swal.fire({
    title: 'Crear Nueva Página',
    html: `
      <div class="create-page-form">
        <div class="form-group">
          <label for="pageName">Nombre de la Página</label>
          <input type="text" id="pageName" class="swal2-input" placeholder="Ej: Mi Negocio Local" />
        </div>
        <div class="form-group">
          <label for="pageEmail">Correo Electrónico</label>
          <input type="email" id="pageEmail" class="swal2-input" placeholder="contacto@ejemplo.com" />
        </div>
        <div class="form-group">
          <label for="pageCategory">Categoría</label>
          <select id="pageCategory" class="swal2-input">
            <option value="">Seleccionar categoría</option>
            <option value="negocio">Negocio Local</option>
            <option value="arte">Arte y Cultura</option>
            <option value="deporte">Deportes</option>
            <option value="comida">Comida y Restaurantes</option>
            <option value="salud">Salud y Bienestar</option>
            <option value="educacion">Educación</option>
            <option value="entretenimiento">Entretenimiento</option>
            <option value="servicios">Servicios</option>
            <option value="otro">Otro</option>
          </select>
        </div>
        <div class="form-group">
          <label for="pageDescription">Descripción</label>
          <textarea id="pageDescription" class="swal2-textarea" placeholder="Describe tu página..." rows="3"></textarea>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonColor: '#f97316',
    cancelButtonColor: '#65676b',
    confirmButtonText: 'Crear Página',
    cancelButtonText: 'Cancelar',
    focusConfirm: false,
    width: '500px',
    didOpen: () => {
      // Agregar estilos personalizados
      const style = document.createElement('style');
      style.textContent = `
        .create-page-form {
          text-align: left;
        }
        .create-page-form .form-group {
          margin-bottom: 15px;
        }
        .create-page-form label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 6px;
        }
        .create-page-form input,
        .create-page-form select,
        .create-page-form textarea {
          width: 100%;
          padding: 12px 15px;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-size: 14px;
          transition: all 0.3s ease;
          background: #f9fafb;
        }
        .create-page-form input:focus,
        .create-page-form select:focus,
        .create-page-form textarea:focus {
          outline: none;
          border-color: #f97316;
          background: white;
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
        }
        .create-page-form textarea {
          resize: vertical;
          min-height: 80px;
        }
        .swal2-popup {
          border-radius: 16px;
        }
        .swal2-title {
          color: #111827;
        }
      `;
      document.head.appendChild(style);
    },
    preConfirm: () => {
      const pageName = document.getElementById('pageName').value;
      const pageEmail = document.getElementById('pageEmail').value;
      const pageCategory = document.getElementById('pageCategory').value;
      const pageDescription = document.getElementById('pageDescription').value;
      
      if (!pageName) {
        Swal.showValidationMessage('¡Necesitas escribir el nombre de la página!');
        return false;
      }
      
      return {
        name: pageName,
        email: pageEmail,
        category: pageCategory,
        description: pageDescription
      };
    }
  });
};

// Create Poll Dialog - Diálogo para crear encuestas
export const showCreatePollDialog = () => {
  return Swal.fire({
    title: 'Crear Nueva Encuesta',
    html: `
      <div class="create-poll-form">
        <div class="form-group">
          <label for="pollTitle">Título de la Encuesta</label>
          <input type="text" id="pollTitle" class="swal2-input" placeholder="Ej: ¿Deberíamos cambiar el horario de la reunión?" />
        </div>
        <div class="form-group">
          <label for="pollDescription">Descripción</label>
          <textarea id="pollDescription" class="swal2-textarea" placeholder="Describe el propósito de la encuesta..." rows="3"></textarea>
        </div>
        <div class="form-group">
          <label for="pollOptions">Opciones de respuesta</label>
          <div class="poll-options-input">
            <input type="text" id="pollOption1" class="swal2-input" placeholder="Opción 1" />
            <input type="text" id="pollOption2" class="swal2-input" placeholder="Opción 2" />
            <input type="text" id="pollOption3" class="swal2-input" placeholder="Opción 3 (opcional)" />
          </div>
        </div>
        <div class="form-group">
          <label for="pollDuration">Duración</label>
          <select id="pollDuration" class="swal2-input">
            <option value="1">1 día</option>
            <option value="3" selected>3 días</option>
            <option value="5">5 días</option>
            <option value="7">7 días</option>
            <option value="14">14 días</option>
          </select>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonColor: '#f97316',
    cancelButtonColor: '#65676b',
    confirmButtonText: 'Crear Encuesta',
    cancelButtonText: 'Cancelar',
    focusConfirm: false,
    width: '550px',
    didOpen: () => {
      const style = document.createElement('style');
      style.textContent = `
        .create-poll-form {
          text-align: left;
        }
        .create-poll-form .form-group {
          margin-bottom: 15px;
        }
        .create-poll-form label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 6px;
        }
        .create-poll-form input,
        .create-poll-form select,
        .create-poll-form textarea {
          width: 100%;
          padding: 12px 15px;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-size: 14px;
          transition: all 0.3s ease;
          background: #f9fafb;
        }
        .create-poll-form input:focus,
        .create-poll-form select:focus,
        .create-poll-form textarea:focus {
          outline: none;
          border-color: #f97316;
          background: white;
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
        }
        .create-poll-form textarea {
          resize: vertical;
          min-height: 80px;
        }
        .poll-options-input {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .swal2-popup {
          border-radius: 16px;
        }
        .swal2-title {
          color: #111827;
        }
      `;
      document.head.appendChild(style);
    },
    preConfirm: () => {
      const pollTitle = document.getElementById('pollTitle').value;
      const pollDescription = document.getElementById('pollDescription').value;
      const pollOption1 = document.getElementById('pollOption1').value;
      const pollOption2 = document.getElementById('pollOption2').value;
      const pollOption3 = document.getElementById('pollOption3').value;
      const pollDuration = parseInt(document.getElementById('pollDuration').value);
      
      if (!pollTitle) {
        Swal.showValidationMessage('¡Necesitas escribir un título!');
        return false;
      }
      
      if (!pollOption1 || !pollOption2) {
        Swal.showValidationMessage('¡Necesitas al menos 2 opciones!');
        return false;
      }
      
      const options = [
        { id: 1, text: pollOption1, votes: 0 },
        { id: 2, text: pollOption2, votes: 0 }
      ];
      
      if (pollOption3) {
        options.push({ id: 3, text: pollOption3, votes: 0 });
      }
      
      return {
        title: pollTitle,
        description: pollDescription,
        options: options,
        duration: pollDuration
      };
    }
  });
};

// Feature in Development
export const showFeatureInDevelopment = (featureName = 'Esta función') => {
  Swal.fire({
    icon: 'info',
    title: '🚧 Función en Desarrollo',
    html: `<strong>${featureName}</strong> estará disponible pronto.<br><br>Estamos trabajando para traerte esta funcionalidad.`,
    confirmButtonColor: '#1877f2',
    confirmButtonText: 'Entendido',
    timer: 5000,
    timerProgressBar: true
  });
};

const swalFunctions = {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  showSuccessAlert,
  showErrorAlert,
  showConfirmDialog,
  showDeleteConfirm,
  showLoading,
  closeLoading,
  showInputDialog,
  showCreatePageDialog,
  showCreatePollDialog,
  showFeatureInDevelopment
};

export default swalFunctions;
