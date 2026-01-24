import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import supabaseStorageService from '../../services/supabaseStorageService';
import './StorageTest.css';

const StorageTest = () => {
  const user = useSelector(state => state.auth.user);
  
  // Mock user para testing sin autenticación
  const mockUser = {
    id: 'test-user-' + Date.now(),
    email: 'test@vecinoactivo.cl',
    name: 'Usuario de Prueba'
  };
  
  const currentUser = user || mockUser;
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [error, setError] = useState('');
  const [selectedBucket, setSelectedBucket] = useState('avatars');

  const buckets = [
    { id: 'avatars', name: 'Avatars', maxSize: '2MB' },
    { id: 'posts', name: 'Posts', maxSize: '5MB' },
    { id: 'events', name: 'Events', maxSize: '5MB' },
    { id: 'businesses', name: 'Businesses', maxSize: '3MB' },
    { id: 'projects', name: 'Projects', maxSize: '5MB' },
    { id: 'resources', name: 'Resources', maxSize: '3MB' },
    { id: 'albums', name: 'Albums', maxSize: '10MB' }
  ];

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setError('Por favor selecciona una imagen');
        return;
      }

      // Validar tamaño según bucket
      const maxSizes = {
        avatars: 2 * 1024 * 1024,
        posts: 5 * 1024 * 1024,
        events: 5 * 1024 * 1024,
        businesses: 3 * 1024 * 1024,
        projects: 5 * 1024 * 1024,
        resources: 3 * 1024 * 1024,
        albums: 10 * 1024 * 1024
      };

      if (file.size > maxSizes[selectedBucket]) {
        setError(`El archivo es muy grande. Máximo: ${buckets.find(b => b.id === selectedBucket).maxSize}`);
        return;
      }

      setSelectedFile(file);
      setError('');
      setUploadedUrl('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Por favor selecciona un archivo');
      return;
    }

    if (!currentUser) {
      setError('Debes estar autenticado para subir archivos');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Determinar la carpeta según el bucket
      let folder = '';
      switch (selectedBucket) {
        case 'avatars':
          folder = user.id;
          break;
        case 'posts':
          folder = `${user.id}/${Date.now()}`;
          break;
        case 'events':
        case 'projects':
        case 'resources':
        case 'albums':
          folder = `test-${Date.now()}`;
          break;
        case 'businesses':
          folder = `test-${Date.now()}/logo`;
          break;
        default:
          folder = user.id;
      }

      // Upload
      const result = await supabaseStorageService.uploadImage(
        selectedFile,
        selectedBucket,
        folder
      );

      setUploadedUrl(result.url);
      setSelectedFile(null);
      
      // Reset input
      document.getElementById('file-input').value = '';
      
      console.log('Upload exitoso:', result);
    } catch (err) {
      console.error('Error uploading:', err);
      setError(err.message || 'Error al subir el archivo');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!uploadedUrl) return;

    try {
      // Extraer el path de la URL
      const urlParts = uploadedUrl.split('/');
      const bucketIndex = urlParts.findIndex(part => part === 'object');
      const pathParts = urlParts.slice(bucketIndex + 2); // Skip 'object' and 'public'
      const path = pathParts.join('/');

      await supabaseStorageService.deleteImage(path, selectedBucket);
      setUploadedUrl('');
      alert('Imagen eliminada correctamente');
    } catch (err) {
      console.error('Error deleting:', err);
      setError(err.message || 'Error al eliminar el archivo');
    }
  };

  return (
    <div className="storage-test">
      <div className="storage-test-header">
        <h2>🧪 Test de Storage</h2>
        <p>Prueba el upload de imágenes a Supabase Storage</p>
      </div>

      <div className="storage-test-content">
        {/* Selector de Bucket */}
        <div className="form-group">
          <label>Bucket:</label>
          <select 
            value={selectedBucket} 
            onChange={(e) => setSelectedBucket(e.target.value)}
            disabled={uploading}
          >
            {buckets.map(bucket => (
              <option key={bucket.id} value={bucket.id}>
                {bucket.name} (Max: {bucket.maxSize})
              </option>
            ))}
          </select>
        </div>

        {/* Selector de Archivo */}
        <div className="form-group">
          <label>Seleccionar Imagen:</label>
          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
          />
          {selectedFile && (
            <div className="file-info">
              <p>📄 {selectedFile.name}</p>
              <p>📊 {(selectedFile.size / 1024).toFixed(2)} KB</p>
            </div>
          )}
        </div>

        {/* Botón de Upload */}
        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="upload-button"
        >
          {uploading ? '⏳ Subiendo...' : '📤 Subir Imagen'}
        </button>

        {/* Error */}
        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        {/* Resultado */}
        {uploadedUrl && (
          <div className="upload-result">
            <h3>✅ Upload Exitoso!</h3>
            <div className="uploaded-image">
              <img src={uploadedUrl} alt="Uploaded" />
            </div>
            <div className="url-info">
              <p><strong>URL:</strong></p>
              <input 
                type="text" 
                value={uploadedUrl} 
                readOnly 
                onClick={(e) => e.target.select()}
              />
              <button onClick={() => navigator.clipboard.writeText(uploadedUrl)}>
                📋 Copiar URL
              </button>
            </div>
            <button onClick={handleDelete} className="delete-button">
              🗑️ Eliminar Imagen
            </button>
          </div>
        )}

        {/* Información */}
        <div className="info-box">
          <h4>ℹ️ Información</h4>
          <ul>
            <li>Usuario: {user ? user.email : 'No autenticado'}</li>
            <li>Bucket seleccionado: {selectedBucket}</li>
            <li>Tipos permitidos: JPG, PNG, WebP{selectedBucket === 'posts' ? ', GIF' : ''}</li>
            <li>Tamaño máximo: {buckets.find(b => b.id === selectedBucket)?.maxSize}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StorageTest;
