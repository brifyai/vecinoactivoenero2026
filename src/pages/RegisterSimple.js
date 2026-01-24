import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReduxAuth } from '../hooks/useReduxAuth';
import './Register.css';

const RegisterSimple = () => {
  const navigate = useNavigate();
  const { register } = useReduxAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Intentando registrar:', formData);
      const result = await register(formData);
      console.log('Resultado registro:', result);
      
      if (result.success) {
        alert('¡Registro exitoso! Redirigiendo...');
        navigate('/iniciar-sesion');
      } else {
        setError(result.error || 'Error al registrar');
      }
    } catch (err) {
      console.error('Error en registro:', err);
      setError(err.message || 'Error al registrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-right">
          <h2>Registro Simple</h2>
          
          {error && (
            <div style={{ color: 'red', padding: '10px', marginBottom: '10px', border: '1px solid red' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <input
                type="text"
                name="name"
                placeholder="Nombre completo"
                value={formData.name}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '10px' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <input
                type="text"
                name="username"
                placeholder="Nombre de usuario"
                value={formData.username}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '10px' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '10px' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <input
                type="password"
                name="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '10px' }}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{ width: '100%', padding: '12px', fontSize: '16px' }}
            >
              {loading ? 'Registrando...' : 'Registrarse'}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <a href="/iniciar-sesion">¿Ya tienes cuenta? Inicia sesión</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterSimple;
