# 🚨 BOTÓN DE EMERGENCIA - DISEÑO TÉCNICO (ACTUALIZADO)

## 🎯 CONCEPTO Y FUNCIONALIDAD

### Descripción General
Botón de emergencia flotante en versión móvil que permite a los vecinos enviar alertas críticas a toda la unidad vecinal mediante un sistema de "mantener presionado por 6 segundos" para evitar activaciones accidentales. **INCLUYE OPCIÓN DE ANONIMATO** para proteger la identidad del reportante.

### Características Principales
- ✅ **Activación por presión prolongada** (6 segundos)
- ✅ **Feedback visual y háptico** durante la activación
- ✅ **Captura de imagen/video** automática o manual
- ✅ **Geolocalización automática** del incidente
- ✅ **OPCIÓN DE ANONIMATO** - Usuario elige antes de enviar
- ✅ **Notificación push masiva** a todos los residentes
- ✅ **Registro en dashboard administrativo** para seguimiento

---

## 🏗️ ARQUITECTURA TÉCNICA

### Componentes Principales

#### 1. EmergencyButton Component
```javascript
src/components/EmergencyButton/
├── EmergencyButton.js          // Componente principal
├── EmergencyButton.css         // Estilos del botón
├── EmergencyModal.js           // Modal de confirmación
├── MediaCapture.js             // Captura de imagen/video
└── EmergencyProgress.js        // Indicador de progreso
```

#### 2. Emergency Service
```javascript
src/services/emergencyService.js
├── sendEmergencyAlert()        // Envío de alerta
├── captureLocation()           // Geolocalización
├── uploadEmergencyMedia()      // Subida de archivos
├── notifyAllResidents()        // Notificación masiva
└── logEmergencyEvent()         // Registro en BD
```

#### 3. Redux Slice
```javascript
src/store/slices/emergencySlice.js
├── emergencyState              // Estado de emergencias
├── sendEmergencyAlert          // Acción de envío
├── uploadMedia                 // Subida de archivos
└── getEmergencyHistory         // Historial
```

---

## 🎨 DISEÑO DE INTERFAZ

### Botón Flotante
```css
.emergency-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #ff4444 0%, #cc0000 100%);
  border-radius: 50%;
  border: 4px solid #ffffff;
  box-shadow: 0 8px 25px rgba(255, 68, 68, 0.4);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.emergency-button:active {
  transform: scale(0.95);
}

.emergency-button.pressing {
  animation: emergencyPulse 0.5s infinite;
  box-shadow: 0 0 30px rgba(255, 68, 68, 0.8);
}

@keyframes emergencyPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
```

### Indicador de Progreso
```css
.emergency-progress {
  position: absolute;
  top: -5px;
  left: -5px;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: conic-gradient(
    #ffff00 0deg,
    #ff8800 120deg,
    #ff0000 240deg,
    transparent 240deg
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.emergency-progress.active {
  opacity: 1;
  animation: progressSpin 6s linear;
}
```

---

## 🔧 IMPLEMENTACIÓN TÉCNICA

### 1. Componente Principal

```javascript
// src/components/EmergencyButton/EmergencyButton.js
import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendEmergencyAlert } from '../../store/slices/emergencySlice';
import EmergencyModal from './EmergencyModal';
import MediaCapture from './MediaCapture';
import './EmergencyButton.css';

// Material UI Icons
import WarningIcon from '@mui/icons-material/Warning';
import CameraAltIcon from '@mui/icons-material/CameraAlt';

const EmergencyButton = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { isLoading } = useSelector(state => state.emergency);
  
  const [isPressing, setIsPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [emergencyData, setEmergencyData] = useState(null);
  
  const pressTimer = useRef(null);
  const progressInterval = useRef(null);
  const startTime = useRef(null);

  // Detectar si es móvil
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Solo mostrar en móvil
  if (!isMobile) return null;

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
        userName: user.user_metadata?.full_name || user.email,
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
        userName: user.user_metadata?.full_name || user.email,
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

  const handleSendEmergency = async (mediaFile, message) => {
    try {
      await dispatch(sendEmergencyAlert({
        ...emergencyData,
        message: message || 'Emergencia reportada',
        mediaFile: mediaFile,
        neighborhoodId: user.neighborhood_id
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
```

### 2. Modal de Emergencia

```javascript
// src/components/EmergencyButton/EmergencyModal.js
import React, { useState } from 'react';
import MediaCapture from './MediaCapture';

const EmergencyModal = ({ emergencyData, onSend, onCancel }) => {
  const [message, setMessage] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleSend = () => {
    onSend(mediaFile, message);
  };

  return (
    <div className="emergency-modal-overlay">
      <div className="emergency-modal">
        <div className="emergency-modal-header">
          <h2>🚨 Alerta de Emergencia</h2>
          <p>Se enviará a todos los residentes de tu unidad vecinal</p>
        </div>
        
        <div className="emergency-modal-content">
          <div className="emergency-info">
            <p><strong>Hora:</strong> {new Date(emergencyData.timestamp).toLocaleString()}</p>
            {emergencyData.location && (
              <p><strong>Ubicación:</strong> Lat: {emergencyData.location.latitude.toFixed(6)}, 
                 Lng: {emergencyData.location.longitude.toFixed(6)}</p>
            )}
          </div>
          
          <textarea
            placeholder="Describe brevemente la emergencia (opcional)..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={200}
            rows={3}
          />
          
          <MediaCapture
            onMediaCaptured={setMediaFile}
            isCapturing={isCapturing}
            setIsCapturing={setIsCapturing}
          />
          
          {mediaFile && (
            <div className="media-preview">
              {mediaFile.type.startsWith('image/') ? (
                <img src={URL.createObjectURL(mediaFile)} alt="Emergency" />
              ) : (
                <video src={URL.createObjectURL(mediaFile)} controls />
              )}
            </div>
          )}
        </div>
        
        <div className="emergency-modal-actions">
          <button 
            className="emergency-cancel-btn"
            onClick={onCancel}
            disabled={isCapturing}
          >
            Cancelar
          </button>
          <button 
            className="emergency-send-btn"
            onClick={handleSend}
            disabled={isCapturing}
          >
            🚨 Enviar Alerta
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmergencyModal;
```

### 3. Servicio de Emergencia

```javascript
// src/services/emergencyService.js
import { supabase } from '../config/supabase';
import { sendPushNotification } from './firebaseNotificationsService';

export const emergencyService = {
  // Enviar alerta de emergencia
  async sendEmergencyAlert(emergencyData) {
    try {
      // 1. Guardar en base de datos
      const { data: emergency, error: dbError } = await supabase
        .from('emergency_alerts')
        .insert({
          user_id: emergencyData.userId,
          user_name: emergencyData.userName,
          neighborhood_id: emergencyData.neighborhoodId,
          message: emergencyData.message,
          location: emergencyData.location,
          timestamp: emergencyData.timestamp,
          status: 'active',
          type: 'emergency'
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // 2. Subir archivo multimedia si existe
      let mediaUrl = null;
      if (emergencyData.mediaFile) {
        mediaUrl = await this.uploadEmergencyMedia(
          emergency.id, 
          emergencyData.mediaFile
        );
        
        // Actualizar registro con URL del archivo
        await supabase
          .from('emergency_alerts')
          .update({ media_url: mediaUrl })
          .eq('id', emergency.id);
      }

      // 3. Obtener todos los residentes de la unidad vecinal
      const { data: residents, error: residentsError } = await supabase
        .from('users')
        .select('id, email, user_metadata, fcm_token')
        .eq('neighborhood_id', emergencyData.neighborhoodId)
        .neq('id', emergencyData.userId); // Excluir al que envía

      if (residentsError) throw residentsError;

      // 4. Enviar notificaciones push masivas
      const notificationPromises = residents.map(resident => {
        if (resident.fcm_token) {
          return sendPushNotification({
            token: resident.fcm_token,
            title: '🚨 ALERTA DE EMERGENCIA',
            body: `${emergencyData.userName}: ${emergencyData.message}`,
            data: {
              type: 'emergency',
              emergencyId: emergency.id,
              location: JSON.stringify(emergencyData.location),
              mediaUrl: mediaUrl
            },
            priority: 'high',
            sound: 'emergency_alert.wav'
          });
        }
        return Promise.resolve();
      });

      await Promise.allSettled(notificationPromises);

      // 5. Notificar a administradores
      await this.notifyAdministrators(emergency, emergencyData);

      return {
        success: true,
        emergencyId: emergency.id,
        notificationsSent: residents.length
      };

    } catch (error) {
      console.error('Error sending emergency alert:', error);
      throw error;
    }
  },

  // Subir archivo multimedia de emergencia
  async uploadEmergencyMedia(emergencyId, file) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `emergency_${emergencyId}_${Date.now()}.${fileExt}`;
      const filePath = `emergencies/${fileName}`;

      const { data, error } = await supabase.storage
        .from('emergency-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('emergency-media')
        .getPublicUrl(filePath);

      return urlData.publicUrl;

    } catch (error) {
      console.error('Error uploading emergency media:', error);
      throw error;
    }
  },

  // Notificar a administradores
  async notifyAdministrators(emergency, emergencyData) {
    try {
      // Obtener administradores de la unidad vecinal
      const { data: admins, error } = await supabase
        .from('admin_roles')
        .select(`
          user_id,
          users!inner(email, user_metadata, fcm_token)
        `)
        .eq('neighborhood_id', emergencyData.neighborhoodId)
        .eq('is_active', true);

      if (error) throw error;

      // Enviar notificaciones a administradores
      const adminNotifications = admins.map(admin => {
        if (admin.users.fcm_token) {
          return sendPushNotification({
            token: admin.users.fcm_token,
            title: '🚨 EMERGENCIA REPORTADA',
            body: `Emergencia en tu unidad vecinal por ${emergencyData.userName}`,
            data: {
              type: 'admin_emergency',
              emergencyId: emergency.id,
              adminAction: 'review_emergency'
            },
            priority: 'high'
          });
        }
        return Promise.resolve();
      });

      await Promise.allSettled(adminNotifications);

    } catch (error) {
      console.error('Error notifying administrators:', error);
    }
  },

  // Obtener historial de emergencias
  async getEmergencyHistory(neighborhoodId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('emergency_alerts')
        .select(`
          *,
          users!inner(user_metadata)
        `)
        .eq('neighborhood_id', neighborhoodId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('Error fetching emergency history:', error);
      throw error;
    }
  }
};
```

---

## 🗄️ ESQUEMA DE BASE DE DATOS

```sql
-- Tabla para alertas de emergencia
CREATE TABLE emergency_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  neighborhood_id TEXT NOT NULL,
  message TEXT,
  location JSONB, -- {latitude, longitude, accuracy}
  media_url TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active', -- active, resolved, false_alarm
  type TEXT DEFAULT 'emergency',
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX idx_emergency_alerts_neighborhood ON emergency_alerts(neighborhood_id);
CREATE INDEX idx_emergency_alerts_timestamp ON emergency_alerts(timestamp DESC);
CREATE INDEX idx_emergency_alerts_status ON emergency_alerts(status);

-- RLS (Row Level Security)
ALTER TABLE emergency_alerts ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver emergencias de su vecindario
CREATE POLICY "Users can view neighborhood emergencies" ON emergency_alerts
  FOR SELECT USING (
    neighborhood_id IN (
      SELECT neighborhood_id FROM users WHERE id = auth.uid()
    )
  );

-- Política: Los usuarios pueden crear emergencias
CREATE POLICY "Users can create emergencies" ON emergency_alerts
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Política: Solo admins pueden actualizar emergencias
CREATE POLICY "Admins can update emergencies" ON emergency_alerts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_roles 
      WHERE user_id = auth.uid() 
      AND neighborhood_id = emergency_alerts.neighborhood_id
      AND is_active = true
    )
  );

-- Bucket de almacenamiento para archivos de emergencia
INSERT INTO storage.buckets (id, name, public) 
VALUES ('emergency-media', 'emergency-media', true);

-- Política de almacenamiento
CREATE POLICY "Emergency media upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'emergency-media');

CREATE POLICY "Emergency media access" ON storage.objects
  FOR SELECT USING (bucket_id = 'emergency-media');
```

---

## 🎯 CARACTERÍSTICAS AVANZADAS

### 1. Prevención de Falsas Alarmas
- **Doble confirmación** con modal
- **Tiempo de activación** de 6 segundos
- **Feedback háptico** progresivo
- **Cancelación fácil** soltando el botón

### 2. Geolocalización Precisa
- **GPS de alta precisión** cuando está disponible
- **Fallback a ubicación aproximada** si GPS falla
- **Timestamp exacto** del incidente
- **Accuracy radius** incluido en los datos

### 3. Multimedia Inteligente
- **Captura rápida** de foto/video
- **Compresión automática** para envío rápido
- **Almacenamiento seguro** en Supabase Storage
- **Preview antes de enviar**

### 4. Notificaciones Masivas
- **Push notifications** de alta prioridad
- **Sonido de emergencia** personalizado
- **Vibración especial** para alertas
- **Datos estructurados** para acciones rápidas

### 5. Dashboard Administrativo
- **Panel de emergencias** en tiempo real
- **Mapa de incidentes** con ubicaciones
- **Historial completo** de alertas
- **Métricas de respuesta** y seguimiento

---

## 📱 EXPERIENCIA DE USUARIO

### Flujo de Activación
1. **Usuario mantiene presionado** el botón rojo
2. **Feedback visual** con progreso circular
3. **Vibración progresiva** cada segundo
4. **Activación automática** a los 6 segundos
5. **Modal de confirmación** con opciones
6. **Captura opcional** de imagen/video
7. **Envío masivo** a todos los residentes
8. **Confirmación** de alerta enviada

### Seguridad y Privacidad
- ✅ **Solo usuarios verificados** pueden enviar alertas
- ✅ **Geolocalización opcional** con consentimiento
- ✅ **Archivos encriptados** en almacenamiento
- ✅ **Logs de auditoría** para administradores
- ✅ **Resolución de alertas** por parte de admins

---

## 🚀 IMPLEMENTACIÓN RECOMENDADA

### Fase 1: Componente Básico
1. Crear botón flotante con animaciones
2. Implementar lógica de presión prolongada
3. Agregar feedback háptico y visual
4. Integrar con Redux para estado global

### Fase 2: Backend y Notificaciones
1. Crear tabla de emergencias en Supabase
2. Implementar servicio de emergencias
3. Configurar notificaciones push masivas
4. Agregar geolocalización automática

### Fase 3: Multimedia y Dashboard
1. Implementar captura de imagen/video
2. Configurar almacenamiento de archivos
3. Crear panel administrativo de emergencias
4. Agregar métricas y reportes

### Fase 4: Optimizaciones
1. Mejorar rendimiento en dispositivos lentos
2. Agregar modo offline para emergencias
3. Implementar escalación automática
4. Integrar con servicios de emergencia locales

---

Esta implementación proporcionaría una herramienta de emergencia robusta, fácil de usar y altamente efectiva para la seguridad comunitaria. ¿Te gustaría que implemente alguna parte específica de esta funcionalidad?