import React, { useState, useRef } from 'react';
import imageService from '../../services/imageService';
import { showErrorToast, showSuccessToast } from '../../utils/sweetalert';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CloseIcon from '@mui/icons-material/Close';
import './ImageUploader.css';

const ImageUploader = ({ onImageSelect, currentImage, type = 'profile', buttonText = 'Cambiar Foto' }) => {
  const [preview, setPreview] = useState(currentImage || null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    try {
      // Validar tipo
      if (!imageService.validateImageType(file)) {
        showErrorToast('Tipo de archivo no válido. Solo se permiten imágenes (JPG, PNG, GIF, WEBP).');
        setUploading(false);
        return;
      }

      // Verificar espacio
      const storage = imageService.checkStorageSpace();
      if (storage.percentage > 90) {
        showErrorToast(`Espacio de almacenamiento casi lleno (${storage.percentage}%). Elimina algunas imágenes.`);
        setUploading(false);
        return;
      }

      // Procesar imagen
      const processedImage = await imageService.processImage(file);
      setPreview(processedImage);
      
      if (onImageSelect) {
        onImageSelect(processedImage);
      }

      showSuccessToast('¡Imagen cargada exitosamente!');
    } catch (error) {
      showErrorToast(error.message || 'Error al cargar la imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (onImageSelect) {
      onImageSelect(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      setUploading(true);

      try {
        if (!imageService.validateImageType(file)) {
          showErrorToast('Tipo de archivo no válido. Solo se permiten imágenes (JPG, PNG, GIF, WEBP).');
          setUploading(false);
          return;
        }

        const storage = imageService.checkStorageSpace();
        if (storage.percentage > 90) {
          showErrorToast(`Espacio de almacenamiento casi lleno (${storage.percentage}%). Elimina algunas imágenes.`);
          setUploading(false);
          return;
        }

        const processedImage = await imageService.processImage(file);
        setPreview(processedImage);
        
        if (onImageSelect) {
          onImageSelect(processedImage);
        }

        showSuccessToast('¡Imagen cargada exitosamente!');
      } catch (error) {
        showErrorToast(error.message || 'Error al cargar la imagen');
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <div 
      className={`image-uploader ${type} ${isDragging ? 'dragging' : ''}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {preview ? (
        <div className="image-preview">
          <img src={preview} alt="Preview" />
          <button className="remove-image-btn" onClick={handleRemove}>
            <CloseIcon />
          </button>
          <button className="change-image-btn" onClick={handleClick}>
            <PhotoCameraIcon /> Cambiar
          </button>
        </div>
      ) : (
        <button className="upload-button" onClick={handleClick} disabled={uploading}>
          <PhotoCameraIcon />
          <span>{uploading ? 'Cargando...' : buttonText}</span>
          {!uploading && <p className="drag-hint">o arrastra una imagen aquí</p>}
        </button>
      )}

      {uploading && (
        <div className="upload-progress">
          <div className="spinner"></div>
          <span>Procesando imagen...</span>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
