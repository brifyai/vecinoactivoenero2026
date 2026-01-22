import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNeighborhoods } from '../../context/NeighborhoodsContext';
import geolocationService from '../../services/geolocationService';
import { showSuccessToast, showErrorToast } from '../../utils/sweetalert';
import './LocationVerification.css';

const LocationVerification = ({ onVerificationComplete }) => {
  const { user, updateUser } = useAuth();
  const { assignUserToNeighborhood } = useNeighborhoods();
  const [verificationMethod, setVerificationMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [postalCode, setPostalCode] = useState('');
  const [error, setError] = useState(null);

  const handleGeolocationVerification = async () => {
    setLoading(true);
    setError(null);

    try {
      const location = await geolocationService.getCurrentLocation();
      const neighborhood = assignUserToNeighborhood(
        user.id,
        location.latitude,
        location.longitude
      );

      if (neighborhood) {
        updateUser({
          latitude: location.latitude,
          longitude: location.longitude,
          neighborhoodId: neighborhood.id,
          neighborhoodName: neighborhood.name,
          isVerifiedNeighbor: true,
          verificationStatus: 'approved'
        });

        showSuccessToast(`¡Verificado! Bienvenido a ${neighborhood.name}`);
        onVerificationComplete(neighborhood);
      } else {
        setError('No se pudo asignar un vecindario. Intenta con otro método.');
      }
    } catch (err) {
      setError(err.message);
      showErrorToast('Error al obtener ubicación: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePostalCodeVerification = () => {
    setLoading(true);
    setError(null);

    if (!geolocationService.validatePostalCode(postalCode)) {
      setError('Código postal inválido. Debe tener 7 dígitos.');
      setLoading(false);
      return;
    }

    // Aquí se validaría contra una base de datos de códigos postales
    // Por ahora, simular verificación exitosa
    setTimeout(() => {
      updateUser({
        postalCode,
        isVerifiedNeighbor: true,
        verificationStatus: 'pending' // Requiere revisión manual
      });

      showSuccessToast('Código postal enviado para verificación');
      onVerificationComplete({ name: 'Vecindario Verificado' });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="location-verification">
      <div className="verification-container">
        <h2>Verifica tu Ubicación</h2>
        <p>Necesitamos verificar que vives en el vecindario para conectarte con tus vecinos.</p>

        {error && <div className="error-message">{error}</div>}

        {!verificationMethod ? (
          <div className="verification-methods">
            <button
              className="method-btn"
              onClick={() => setVerificationMethod('geolocation')}
              disabled={loading}
            >
              <span className="method-icon">📍</span>
              <span className="method-title">Usar GPS</span>
              <span className="method-desc">Verificación rápida con tu ubicación actual</span>
            </button>

            <button
              className="method-btn"
              onClick={() => setVerificationMethod('postal')}
              disabled={loading}
            >
              <span className="method-icon">📮</span>
              <span className="method-title">Código Postal</span>
              <span className="method-desc">Ingresa tu código postal para verificación</span>
            </button>

            <button
              className="method-btn"
              onClick={() => setVerificationMethod('manual')}
              disabled={loading}
            >
              <span className="method-icon">✓</span>
              <span className="method-title">Verificación Manual</span>
              <span className="method-desc">Un moderador verificará tu identidad</span>
            </button>
          </div>
        ) : verificationMethod === 'geolocation' ? (
          <div className="verification-form">
            <p>Se usará tu ubicación GPS para verificarte automáticamente.</p>
            <button
              className="verify-btn"
              onClick={handleGeolocationVerification}
              disabled={loading}
            >
              {loading ? 'Obteniendo ubicación...' : 'Verificar con GPS'}
            </button>
            <button
              className="back-btn"
              onClick={() => setVerificationMethod(null)}
              disabled={loading}
            >
              Atrás
            </button>
          </div>
        ) : verificationMethod === 'postal' ? (
          <div className="verification-form">
            <input
              type="text"
              placeholder="Ingresa tu código postal (7 dígitos)"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, '').slice(0, 7))}
              maxLength="7"
              disabled={loading}
            />
            <button
              className="verify-btn"
              onClick={handlePostalCodeVerification}
              disabled={loading || postalCode.length !== 7}
            >
              {loading ? 'Verificando...' : 'Verificar Código Postal'}
            </button>
            <button
              className="back-btn"
              onClick={() => setVerificationMethod(null)}
              disabled={loading}
            >
              Atrás
            </button>
          </div>
        ) : (
          <div className="verification-form">
            <p>Un moderador comunitario verificará tu identidad en 24-48 horas.</p>
            <button
              className="verify-btn"
              onClick={() => {
                updateUser({
                  isVerifiedNeighbor: false,
                  verificationStatus: 'pending'
                });
                showSuccessToast('Solicitud de verificación enviada');
                onVerificationComplete({ name: 'Verificación Pendiente' });
              }}
              disabled={loading}
            >
              Solicitar Verificación Manual
            </button>
            <button
              className="back-btn"
              onClick={() => setVerificationMethod(null)}
              disabled={loading}
            >
              Atrás
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationVerification;
