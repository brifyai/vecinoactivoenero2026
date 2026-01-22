import React, { useState } from 'react';
import { useVerification } from '../../context/VerificationContext';
import { useReduxAuth as useAuth } from '../../hooks/useReduxAuth';
import { showSuccessToast, showErrorToast } from '../../utils/sweetalert';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import './VerificationModal.css';

const VerificationModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { requestVerification, loading } = useVerification();
  const [formData, setFormData] = useState({
    documentType: 'cedula',
    documentNumber: '',
    address: '',
    proofImage: null,
    additionalInfo: ''
  });
  const [imagePreview, setImagePreview] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showErrorToast('La imagen no debe superar 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, proofImage: reader.result }));
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.documentNumber || !formData.address || !formData.proofImage) {
      showErrorToast('Por favor completa todos los campos obligatorios');
      return;
    }

    const result = await requestVerification(formData);
    
    if (result.success) {
      showSuccessToast('Solicitud de verificación enviada correctamente');
      onClose();
    } else {
      showErrorToast('Error al enviar la solicitud');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="verification-modal" onClick={(e) => e.stopPropagation()}>
        <div className="verification-modal-header">
          <div className="verification-modal-title">
            <VerifiedUserIcon style={{ color: '#f97316', fontSize: 28 }} />
            <h2>Verificar mi Vecindario</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="verification-modal-body">
          <div className="verification-info">
            <p>
              <strong>¿Por qué verificarte?</strong>
            </p>
            <ul>
              <li>✅ Genera confianza en la comunidad</li>
              <li>✅ Accede a funciones exclusivas</li>
              <li>✅ Obtén un badge de vecino verificado</li>
              <li>✅ Participa en votaciones oficiales</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Unidad Vecinal</label>
              <input
                type="text"
                value={`UV ${user?.neighborhoodCode} - ${user?.neighborhoodName}`}
                disabled
                className="input-disabled"
              />
            </div>

            <div className="form-group">
              <label>Tipo de Documento *</label>
              <select
                name="documentType"
                value={formData.documentType}
                onChange={handleChange}
                required
              >
                <option value="cedula">Cédula de Identidad</option>
                <option value="pasaporte">Pasaporte</option>
                <option value="rut">RUT</option>
              </select>
            </div>

            <div className="form-group">
              <label>Número de Documento *</label>
              <input
                type="text"
                name="documentNumber"
                value={formData.documentNumber}
                onChange={handleChange}
                placeholder="Ej: 12.345.678-9"
                required
              />
            </div>

            <div className="form-group">
              <label>Dirección Completa *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Calle, número, depto/casa"
                required
              />
            </div>

            <div className="form-group">
              <label>Comprobante de Domicilio * (Foto)</label>
              <p className="form-help">
                Sube una foto de: cuenta de luz, agua, gas, contrato de arriendo, escritura, etc.
              </p>
              <div className="image-upload-area">
                <input
                  type="file"
                  id="proofImage"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                  required
                />
                <label htmlFor="proofImage" className="upload-label">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="image-preview" />
                  ) : (
                    <div className="upload-placeholder">
                      <CloudUploadIcon style={{ fontSize: 48, color: '#f97316' }} />
                      <p>Haz clic para subir imagen</p>
                      <span>Máximo 5MB</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Información Adicional (Opcional)</label>
              <textarea
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleChange}
                placeholder="Cualquier información adicional que quieras agregar..."
                rows={3}
              />
            </div>

            <div className="verification-note">
              <p>
                ℹ️ Tu solicitud será revisada por un administrador en un plazo de 24-48 horas.
                Recibirás una notificación cuando sea aprobada.
              </p>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar Solicitud'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;
