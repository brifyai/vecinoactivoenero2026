import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendEmergencyAlert } from '../../store/slices/emergencySlice';
import EmergencyModal from './EmergencyModal';
import './EmergencyButton.css';

// Material UI Icons
import WarningIcon from '@mui/icons-material/Warning';

const EmergencyButton = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { isLoading } = useSelector(state => state.emergency || {});
  
  const [isPressing, setIsPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [emergencyData, setEmergencyData] = useState(null);
  
  const pressTimer = useRef(null);
  const progressInterval = useRef(null);
  const startTime = useRef(null);

  // Detectar si es móvil
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  const handlePressEnd = () => {
    setIsPressing(false);
    setProgress(0);
    
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
    
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  };
  
  // Cleanup en unmount - DEBE estar antes del early return
  useEffect(() => {
    return () => {
      handlePressEnd();
    };
  }, []);
  
  // Solo mostrar en móvil y si hay usuario logueado
  if (!isMobile || !user) return null;

  const handlePressStart = (e) => {
    e.preventDefault();
    setIsPressing(true);
    setProgress(0);
    startTime.current = Date.now();
    
    // Vibración inicial
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }
    
    // Timer principal de 6 segundos
    pressTimer.current = setTimeout(() => {
      handleEmergencyActivated();
    }, 6000);
    
    // Actualizar progreso cada 100ms
    progressInterval.current = setInterval(() => {
      const elapsed = Date.now() - startTime.current;
      const newProgress = Math.min((elapsed / 6000) * 100, 100);
      setProgress(newProgress);
      
      // Vibración progresiva
      if (navigator.vibrate && elapsed % 1000 < 100) {
        navigator.vibrate(100);
      }
    }, 100);
  };

  const handleEmergencyActivated = async () => {
    handlePressEnd();
    
    // Vibración de confirmación
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }
    
    try {
      // Obtener ubicación
      const location = await getCurrentLocation();
      
      // Preparar datos de emergencia
      const emergencyInfo = {
        userId: user.id,
        userName: user.name || user.email,
        timestamp: new Date().toISOString(),
        location: location,
        type: 'emergency_alert',
        status: 'active'
      };
      
      setEmergencyData(emergencyInfo);
      setShowModal(true);
      
    } catch (error) {
      console.error('Error activating emergency:', error);
      // Enviar sin ubicación si falla
      const emergencyInfo = {
        userId: user.id,
        userName: user.name || user.email,
        timestamp: new Date().toISOString(),
        location: null,
        type: 'emergency_alert',
        status: 'active'
      };
      
      setEmergencyData(emergencyInfo);
      setShowModal(true);
    }
  };

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  };

  const handleSendEmergency = async (emergencyDetails) => {
    try {
      await dispatch(sendEmergencyAlert({
        ...emergencyData,
        ...emergencyDetails,
        neighborhoodId: user.neighborhood_id || 'default'
      }));
      
      setShowModal(false);
      setEmergencyData(null);
      
      // Mostrar confirmación
      alert('🚨 Alerta de emergencia enviada a todos los residentes');
      
    } catch (error) {
      console.error('Error sending emergency:', error);
      alert('Error al enviar la alerta. Intenta nuevamente.');
    }
  };

  return (
    <>
      <div 
        className={`emergency-button ${isPressing ? 'pressing' : ''}`}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        style={{ 
          display: isLoading ? 'none' : 'flex',
          pointerEvents: isLoading ? 'none' : 'auto'
        }}
      >
        <div 
          className={`emergency-progress ${isPressing ? 'active' : ''}`}
          style={{
            background: `conic-gradient(
              #ff0000 ${progress * 3.6}deg,
              transparent ${progress * 3.6}deg
            )`
          }}
        />
        
        <WarningIcon 
          style={{ 
            fontSize: 32, 
            color: 'white',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
          }} 
        />
        
        {isPressing && (
          <div className="emergency-text">
            Mantén presionado<br/>
            {Math.ceil((6000 - (progress * 60)) / 1000)}s
          </div>
        )}
      </div>
      
      {showModal && (
        <EmergencyModal
          emergencyData={emergencyData}
          onSend={handleSendEmergency}
          onCancel={() => {
            setShowModal(false);
            setEmergencyData(null);
          }}
        />
      )}
    </>
  );
};

export default EmergencyButton;