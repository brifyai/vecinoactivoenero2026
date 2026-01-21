import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import persistenceManager from './utils/persistenceManager';

// Inicializar sistema de persistencia mejorado
persistenceManager.initBackupSystem();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
