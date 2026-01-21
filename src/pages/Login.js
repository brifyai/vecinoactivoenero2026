import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  console.log('✅ Login component rendering');
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    const result = login(email, password);
    if (result.success) {
      navigate('/');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <h1 style={{color: 'white', marginBottom: '30px', fontSize: '32px'}}>Vecino Activo</h1>
      
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        width: '100%',
        maxWidth: '450px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        <h2 style={{fontSize: '32px', marginBottom: '10px'}}>Iniciar sesión</h2>
        <p style={{color: '#65676b', marginBottom: '30px'}}>Bienvenido a Vecino Activo</p>
        
        <form onSubmit={handleLogin}>
          <div style={{marginBottom: '20px'}}>
            <label style={{display: 'block', marginBottom: '8px', fontWeight: '600'}}>Correo electrónico</label>
            <input 
              type="email" 
              placeholder="demo@vecinoactivo.cl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e4e6eb',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{marginBottom: '25px'}}>
            <label style={{display: 'block', marginBottom: '8px', fontWeight: '600'}}>Contraseña</label>
            <input 
              type="password" 
              placeholder="demo123"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e4e6eb',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          <button type="submit" style={{
            width: '100%',
            padding: '12px',
            background: '#0e8ce4',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer'
          }}>
            Iniciar sesión
          </button>
        </form>
        
        <button onClick={() => navigate('/registrarse')} style={{
          width: '100%',
          padding: '12px',
          background: '#e7f3ff',
          color: '#0e8ce4',
          border: 'none',
          borderRadius: '8px',
          fontSize: '15px',
          fontWeight: '600',
          cursor: 'pointer',
          marginTop: '15px'
        }}>
          Registrarse
        </button>
      </div>
    </div>
  );
};

export default Login;
