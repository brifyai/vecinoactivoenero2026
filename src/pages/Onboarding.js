import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReduxAuth as useAuth } from '../hooks/useReduxAuth';
import { showErrorToast, showSuccessToast } from '../utils/sweetalert';
import NeighborhoodSelector from '../components/NeighborhoodSelector/NeighborhoodSelector';
import HomeIcon from '@mui/icons-material/Home';
import PlaceIcon from '@mui/icons-material/Place';
import TuneIcon from '@mui/icons-material/Tune';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import './Onboarding.css';

// Opciones de distancia para conocer vecinos
const DISTANCE_OPTIONS = [
  { value: 0.5, label: '500m' },
  { value: 1, label: '1 km' },
  { value: 2, label: '2 km' },
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 20, label: '20 km' },
  { value: 50, label: '50 km' },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, updateUserProfile, isAuthenticated } = useAuth();
  
  // Redirigir si no está autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/iniciar-sesion');
    }
  }, [isAuthenticated, navigate]);

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Dirección del usuario
    address: '',
    addressNumber: '',
    // Unidad vecinal
    neighborhoodId: null,
    neighborhoodName: '',
    neighborhoodCode: '',
    // Coordenadas
    latitude: null,
    longitude: null,
    // Preferencia de distancia para conocer vecinos
    maxDistance: 5
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const steps = [
    { 
      number: 1, 
      title: 'Tu Dirección', 
      description: 'Encuentra tu vecindario',
      icon: <HomeIcon />
    },
    { 
      number: 2, 
      title: 'Preferencias', 
      description: 'Personaliza tu experiencia',
      icon: <TuneIcon />
    },
    { 
      number: 3, 
      title: '¡Listo!', 
      description: 'Completa tu perfil',
      icon: <CheckCircleIcon />
    }
  ];

  const handleNext = () => {
    setError('');
    
    // Validaciones por paso
    if (currentStep === 1) {
      if (!formData.address || !formData.addressNumber || !formData.neighborhoodId) {
        setError('Por favor completa tu dirección y selecciona tu unidad vecinal');
        return;
      }
    }
    
    if (currentStep === 3) {
      // Completar onboarding
      handleCompleteOnboarding();
      return;
    }
    
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setError('');
    setCurrentStep(currentStep - 1);
  };

  const handleCompleteOnboarding = async () => {
    setLoading(true);
    
    try {
      // Actualizar perfil del usuario con la información completa
      const updatedProfile = {
        ...user,
        ...formData,
        profileComplete: true,
        needsOnboarding: false,
        onboardingCompletedAt: new Date().toISOString()
      };
      
      const result = updateUserProfile(updatedProfile);
      if (result.success) {
        showSuccessToast('¡Perfil completado! Bienvenido a Vecino Activo');
        navigate('/app');
      } else {
        setError('Error al completar el perfil. Intenta de nuevo.');
      }
    } catch (err) {
      setError('Error al completar el perfil. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleNeighborhoodSelect = (neighborhoodData) => {
    setFormData({
      ...formData,
      ...neighborhoodData
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="onboarding-step">
            <div className="step-header">
              <div className="step-icon">
                <HomeIcon />
              </div>
              <h2 className="step-title">¿Dónde vives?</h2>
              <p className="step-description">
                Ayúdanos a encontrar tu vecindario para conectarte con personas cercanas
              </p>
            </div>
            
            <div className="step-form">
              <div className="form-row">
                <div className="input-group">
                  <input 
                    type="text" 
                    name="address"
                    placeholder="Calle (Ej: Avenida Providencia)" 
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    required 
                    className="input-field"
                  />
                  <HomeIcon className="input-icon" />
                </div>
                
                <div className="input-group">
                  <input 
                    type="text" 
                    name="addressNumber"
                    placeholder="Número" 
                    value={formData.addressNumber}
                    onChange={(e) => setFormData({...formData, addressNumber: e.target.value})}
                    required 
                    className="input-field"
                  />
                  <PlaceIcon className="input-icon" />
                </div>
              </div>

              <NeighborhoodSelector 
                onSelect={handleNeighborhoodSelect}
                selectedNeighborhood={formData}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="onboarding-step">
            <div className="step-header">
              <div className="step-icon">
                <TuneIcon />
              </div>
              <h2 className="step-title">Personaliza tu experiencia</h2>
              <p className="step-description">
                ¿Qué distancia te interesa para conocer vecinos?
              </p>
            </div>
            
            <div className="step-form">
              <div className="distance-selector">
                {DISTANCE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`distance-option ${formData.maxDistance === option.value ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, maxDistance: option.value })}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p className="distance-help">
                💡 Esto determinará qué vecinos verás en tus sugerencias de amistad
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="onboarding-step">
            <div className="step-header">
              <div className="step-icon success">
                <CheckCircleIcon />
              </div>
              <h2 className="step-title">¡Todo listo!</h2>
              <p className="step-description">
                Tu perfil está completo. Ahora puedes comenzar a conectar con tu comunidad.
              </p>
            </div>
            
            <div className="completion-summary">
              <div className="summary-item">
                <HomeIcon className="summary-icon" />
                <div>
                  <strong>Dirección:</strong> {formData.address} {formData.addressNumber}
                </div>
              </div>
              <div className="summary-item">
                <PlaceIcon className="summary-icon" />
                <div>
                  <strong>Vecindario:</strong> {formData.neighborhoodName}
                </div>
              </div>
              <div className="summary-item">
                <TuneIcon className="summary-icon" />
                <div>
                  <strong>Distancia:</strong> {DISTANCE_OPTIONS.find(opt => opt.value === formData.maxDistance)?.label}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isAuthenticated) {
    return null; // O un loading spinner
  }

  return (
    <div className="onboarding-page">
      <div className="onboarding-container">
        {/* Header con progreso */}
        <div className="onboarding-header">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
          <div className="progress-text">
            Paso {currentStep} de {steps.length}
          </div>
        </div>

        {/* Contenido del paso */}
        <div className="onboarding-content">
          {error && (
            <div className="error-message">
              <span>{error}</span>
            </div>
          )}

          {renderStepContent()}
        </div>

        {/* Navegación */}
        <div className="onboarding-navigation">
          <button 
            type="button" 
            className="btn-back" 
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ArrowBackIcon />
            Atrás
          </button>
          
          <button 
            type="button" 
            className={currentStep === 3 ? "btn-complete" : "btn-next"}
            onClick={handleNext}
            disabled={loading}
          >
            {loading && <div className="loading-spinner"></div>}
            {loading ? 'Completando...' : 
             currentStep === 3 ? 'Completar Perfil' : 'Siguiente'}
            {currentStep !== 3 && !loading && <ArrowForwardIcon />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;