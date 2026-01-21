const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Ruta para obtener el GeoJSON completo (simplificado)
app.get('/api/neighborhoods', (req, res) => {
  try {
    const geoJsonPath = path.join(__dirname, '../public/data/geo/unidades_vecinales_simple.geojson');
    
    // Verificar si el archivo existe
    if (!fs.existsSync(geoJsonPath)) {
      return res.status(404).json({ error: 'GeoJSON file not found' });
    }

    // Leer el archivo
    const geoJsonData = fs.readFileSync(geoJsonPath, 'utf8');
    const data = JSON.parse(geoJsonData);

    res.json(data);
  } catch (error) {
    console.error('Error loading GeoJSON:', error);
    res.status(500).json({ error: 'Error loading neighborhood data' });
  }
});

// Ruta para obtener vecindarios por región (optimizado)
app.get('/api/neighborhoods/region/:region', (req, res) => {
  try {
    const { region } = req.params;
    const geoJsonPath = path.join(__dirname, '../public/data/geo/unidades_vecinales_simple.geojson');
    
    if (!fs.existsSync(geoJsonPath)) {
      return res.status(404).json({ error: 'GeoJSON file not found' });
    }

    const geoJsonData = fs.readFileSync(geoJsonPath, 'utf8');
    const data = JSON.parse(geoJsonData);

    // Filtrar por región si se especifica
    if (region && region !== 'all') {
      data.features = data.features.filter(feature => 
        feature.properties.REGION === region || 
        feature.properties.region === region
      );
    }

    res.json(data);
  } catch (error) {
    console.error('Error loading GeoJSON by region:', error);
    res.status(500).json({ error: 'Error loading neighborhood data' });
  }
});

// Ruta para obtener vecindarios por bounding box (área visible del mapa)
app.get('/api/neighborhoods/bbox', (req, res) => {
  try {
    const { minLat, maxLat, minLng, maxLng } = req.query;
    
    if (!minLat || !maxLat || !minLng || !maxLng) {
      return res.status(400).json({ error: 'Missing bounding box parameters' });
    }

    const geoJsonPath = path.join(__dirname, '../public/data/geo/unidades_vecinales_simple.geojson');
    
    if (!fs.existsSync(geoJsonPath)) {
      return res.status(404).json({ error: 'GeoJSON file not found' });
    }

    const geoJsonData = fs.readFileSync(geoJsonPath, 'utf8');
    const data = JSON.parse(geoJsonData);

    // Filtrar features que estén dentro del bounding box
    data.features = data.features.filter(feature => {
      if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
        const coords = feature.geometry.type === 'Polygon' 
          ? feature.geometry.coordinates[0] 
          : feature.geometry.coordinates[0][0];
        
        // Verificar si algún punto está dentro del bounding box
        return coords.some(coord => {
          const [lng, lat] = coord;
          return lat >= parseFloat(minLat) && 
                 lat <= parseFloat(maxLat) && 
                 lng >= parseFloat(minLng) && 
                 lng <= parseFloat(maxLng);
        });
      }
      return false;
    });

    res.json(data);
  } catch (error) {
    console.error('Error loading GeoJSON by bbox:', error);
    res.status(500).json({ error: 'Error loading neighborhood data' });
  }
});

// Ruta de salud del servidor
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Vecino Activo API is running' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Vecino Activo Backend running on http://localhost:${PORT}`);
  console.log(`📍 API endpoints:`);
  console.log(`   - GET /api/health`);
  console.log(`   - GET /api/neighborhoods`);
  console.log(`   - GET /api/neighborhoods/region/:region`);
  console.log(`   - GET /api/neighborhoods/bbox?minLat=...&maxLat=...&minLng=...&maxLng=...`);
});

module.exports = app;
