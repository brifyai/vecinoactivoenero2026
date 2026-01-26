import React, { useRef, useState } from 'react';
import './MediaCapture.css';

// Material UI Icons
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import VideocamIcon from '@mui/icons-material/Videocam';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import StopIcon from '@mui/icons-material/Stop';

const MediaCapture = ({ onMediaCaptured, isCapturing, setIsCapturing, disabled }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingInterval, setRecordingInterval] = useState(null);

  const startCamera = async () => {
    try {
      setIsCapturing(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Cámara trasera por defecto
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('No se pudo acceder a la cámara. Verifica los permisos.');
      setIsCapturing(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    // Configurar canvas con las dimensiones del video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Dibujar frame actual del video en el canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convertir a blob
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `emergency_photo_${Date.now()}.jpg`, {
          type: 'image/jpeg'
        });
        onMediaCaptured(file);
        stopCamera();
      }
    }, 'image/jpeg', 0.8);
  };

  const startVideoRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true
      });
      
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9' // Mejor compresión
      });
      
      mediaRecorderRef.current = mediaRecorder;
      const chunks = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const file = new File([blob], `emergency_video_${Date.now()}.webm`, {
          type: 'video/webm'
        });
        onMediaCaptured(file);
        stopCamera();
      };
      
      // Iniciar grabación
      mediaRecorder.start();
      setIsCapturing(true);
      setRecordingTime(0);
      
      // Timer para mostrar tiempo de grabación
      const interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      setRecordingInterval(interval);
      
      // Auto-stop después de 30 segundos
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          stopVideoRecording();
        }
      }, 30000);
      
    } catch (error) {
      console.error('Error starting video recording:', error);
      alert('No se pudo iniciar la grabación de video. Verifica los permisos.');
      setIsCapturing(false);
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    if (recordingInterval) {
      clearInterval(recordingInterval);
      setRecordingInterval(null);
    }
    
    setRecordingTime(0);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    if (recordingInterval) {
      clearInterval(recordingInterval);
      setRecordingInterval(null);
    }
    
    setIsCapturing(false);
    setRecordingTime(0);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        // Validar tamaño (máximo 10MB)
        if (file.size <= 10 * 1024 * 1024) {
          onMediaCaptured(file);
        } else {
          alert('El archivo es demasiado grande. Máximo 10MB.');
        }
      } else {
        alert('Solo se permiten archivos de imagen o video.');
      }
    }
    
    // Limpiar input
    event.target.value = '';
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="media-capture">
      <div className="media-capture-header">
        <h4>Adjuntar imagen o video (opcional)</h4>
      </div>
      
      {!isCapturing ? (
        <div className="media-capture-options">
          <button
            className="media-option-btn photo-btn"
            onClick={startCamera}
            disabled={disabled}
          >
            <CameraAltIcon />
            <span>Tomar Foto</span>
          </button>
          
          <button
            className="media-option-btn video-btn"
            onClick={startVideoRecording}
            disabled={disabled}
          >
            <VideocamIcon />
            <span>Grabar Video</span>
          </button>
          
          <button
            className="media-option-btn gallery-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
          >
            <PhotoLibraryIcon />
            <span>Seleccionar</span>
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>
      ) : (
        <div className="media-capture-active">
          {mediaRecorderRef.current?.state === 'recording' ? (
            <div className="video-recording">
              <div className="recording-indicator">
                <div className="recording-dot"></div>
                <span>Grabando: {formatTime(recordingTime)}</span>
              </div>
              <button
                className="stop-recording-btn"
                onClick={stopVideoRecording}
              >
                <StopIcon />
                <span>Detener</span>
              </button>
            </div>
          ) : (
            <div className="camera-preview">
              <video
                ref={videoRef}
                className="camera-video"
                autoPlay
                muted
                playsInline
              />
              <div className="camera-controls">
                <button
                  className="capture-btn"
                  onClick={capturePhoto}
                >
                  <CameraAltIcon />
                </button>
                <button
                  className="cancel-btn"
                  onClick={stopCamera}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default MediaCapture;