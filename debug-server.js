// =====================================================
// DEBUG SERVER
// Servidor simple para servir archivos de debug
// =====================================================

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3006;

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  let filePath = '';
  
  if (req.url === '/' || req.url === '/debug') {
    filePath = path.join(__dirname, 'debug-login-simple.html');
  } else if (req.url === '/check') {
    filePath = path.join(__dirname, 'check-react-simple.html');
  } else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end(`
      <html>
        <body style="font-family: Arial; padding: 20px;">
          <h1>🔍 Debug Server - Vecino Activo</h1>
          <p>Rutas disponibles:</p>
          <ul>
            <li><a href="/">Debug Login</a></li>
            <li><a href="/check">Check React</a></li>
          </ul>
        </body>
      </html>
    `);
    return;
  }
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error interno del servidor');
      return;
    }
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Debug Server corriendo en http://localhost:${PORT}`);
  console.log(`📋 Rutas disponibles:`);
  console.log(`   - http://localhost:${PORT}/ (Debug Login)`);
  console.log(`   - http://localhost:${PORT}/check (Check React)`);
});

server.on('error', (err) => {
  console.error('❌ Error en el servidor:', err.message);
});