import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReduxAuth as useAuth } from '../hooks/useReduxAuth';
import { useNeighborhoods } from '../context/NeighborhoodsContext';
import LocationVerification from '../components/LocationVerification/LocationVerification';
import { showSuccessToast } from '../utils/sweetalert';
import './Onboarding.css';

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { neighborhoods } = useNeighborhoods();
  const [step, setStep] = useState(1);
  const [profileData, setProfileData] = useState({
    interests: [],
    skills: [],
    availability: 'flexible'
  });
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/iniciar-sesion');
    }
  }, [user, navigate]);

  const handleLocationVerified = (neighborhood) => {
    setSelectedNeighborhood(neighborhood);
    setStep(2);
  };

  const handleInterestsChange = (interest) => {
    setProfileData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSkillsChange = (skill) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleCompleteOnboarding = () => {
    updateUser({
      interests: profileData.interests,
      skills: profileData.skills,
      availability: profileData.availability,
      onboardingCompleted: true
    });

    showSuccessToast('¡Bienvenido a Vecino Activo!');
    navigate('/');
  };

  const interests = [
    'Deportes',
    'Música',
    'Cine',
    'Lectura',
    'Cocina',
    'Viajes',
    'Tecnología',
    'Arte',
    'Jardinería',
    'Fitness'
  ];

  const skills = [
    'Reparaciones',
    'Plomería',
    'Electricidad',
    'Carpintería',
    'Enseñanza',
    'Diseño',
    'Programación',
    'Fotografía',
    'Cocina',
    'Cuidado de Mascotas'
  ];

  if (!user) {
    return null;
  }

  return (
    <div className="onboarding-page">
      {step === 1 ? (
        <LocationVerification onVerificationComplete={handleLocationVerified} />
      ) : (
        <div className="onboarding-container">
          <div className="onboarding-header">
            <h1>Completa tu Perfil</h1>
            <p>Cuéntanos sobre ti para conectarte mejor con tus vecinos</p>
          </div>

          <div className="onboarding-content">
            <div className="neighborhood-info">
              <h3>Tu Vecindario</h3>
              <div className="neighborhood-badge">
                <span className="badge-icon">📍</span>
                <span className="badge-text">{selectedNeighborhood?.name}</span>
              </div>
            </div>

            <div className="profile-section">
              <h3>¿Cuáles son tus Intereses?</h3>
              <div className="tags-grid">
                {interests.map(interest => (
                  <button
                    key={interest}
                    className={`tag-btn ${profileData.interests.includes(interest) ? 'active' : ''}`}
                    onClick={() => handleInterestsChange(interest)}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            <div className="profile-section">
              <h3>¿Qué Habilidades Tienes?</h3>
              <p className="section-desc">Esto ayuda a otros vecinos a encontrarte cuando necesitan ayuda</p>
              <div className="tags-grid">
                {skills.map(skill => (
                  <button
                    key={skill}
                    className={`tag-btn skill ${profileData.skills.includes(skill) ? 'active' : ''}`}
                    onClick={() => handleSkillsChange(skill)}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            <div className="profile-section">
              <h3>¿Cuál es tu Disponibilidad?</h3>
              <div className="availability-options">
                {['flexible', 'weekends', 'evenings', 'limited'].map(option => (
                  <label key={option} className="radio-option">
                    <input
                      type="radio"
                      name="availability"
                      value={option}
                      checked={profileData.availability === option}
                      onChange={(e) => setProfileData(prev => ({ ...prev, availability: e.target.value }))}
                    />
                    <span className="radio-label">
                      {option === 'flexible' && 'Flexible'}
                      {option === 'weekends' && 'Fines de Semana'}
                      {option === 'evenings' && 'Tardes/Noches'}
                      {option === 'limited' && 'Limitada'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <button className="complete-btn" onClick={handleCompleteOnboarding}>
              Comenzar a Conectar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
