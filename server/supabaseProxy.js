/**
 * Proxy CORS para Supabase
 * Soluciona problemas CORS sin necesidad de acceso al servidor de Supabase
 */

const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PROXY_PORT || 3001;

// Configuración CORS permisiva
app.use(cors({
  origin: [
    'https://vecinoactivo.cl',
    'https://www.vecinoactivo.cl',
    'http://localhost:3000',
    'http://localhost'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Accept',
    'Authorization',
    'Content-Type',
    'X-Client-Info',
    'apikey',
    'x-client-info',
    'Prefer'
  ],
  exposedHeaders: [
    'Content-Length',
    'Content-Range',
    'Content-Type'
  ]
}));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'supabase-proxy',
    timestamp: new Date().toISOString()
  });
});

// Proxy para Supabase
app.use('/supabase', createProxyMiddleware({
  target: 'https://supabase.vecinoactivo.cl',
  changeOrigin: true,
  pathRewrite: {
    '^/supabase': '' // Eliminar /supabase del path
  },
  onProxyReq: (proxyReq, req, res) => {
    // Log de requests (opcional, comentar en producción)
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    
    // Asegurar que los headers se pasen correctamente
    if (req.headers.apikey) {
      proxyReq.setHeader('apikey', req.headers.apikey);
    }
    if (req.headers.authorization) {
      proxyReq.setHeader('Authorization', req.headers.authorization);
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    // Agregar headers CORS a la respuesta
    proxyRes.headers['Access-Control-Allow-Origin'] = req.headers.origin || '*';
    proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Accept, Authorization, Content-Type, X-Client-Info, apikey, x-client-info, Prefer';
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).json({
      error: 'Proxy error',
      message: err.message
    });
  }
}));

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('🚀 Supabase CORS Proxy iniciado');
  console.log(`📡 Puerto: ${PORT}`);
  console.log(`🔗 Proxy: http://localhost:${PORT}/supabase`);
  console.log(`🎯 Target: https://supabase.vecinoactivo.cl`);
  console.log(`✅ CORS habilitado para: vecinoactivo.cl`);
  console.log('');
  console.log('Uso:');
  console.log('  Cambiar REACT_APP_SUPABASE_URL a: http://localhost:3001/supabase');
  console.log('  O en producción: https://vecinoactivo.cl/api/supabase');
});

module.exports = app;
