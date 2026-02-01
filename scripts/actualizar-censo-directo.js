const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🔄 Actualizando datos del Censo 2024 (versión simplificada)...\n');

// Configurar Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERROR: Variables de entorno no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Función para leer el GeoJSON actual y extraer códigos únicos
async function obtenerCodigosUV() {
  const geoJSONPath = path.join(__dirname, '../public/data/geo/unidades_vecinales_simple.geojson');
  
  console.log('📖 Analizando unidades vecinales actuales...');
  
  // Leer archivo en chunks para no saturar memoria
  const stream = fs.createReadStream(geoJSONPath, { encoding: 'utf8' });
  let buffer = '';
  let inFeatures = false;
  let featureCount = 0;
  const codigos = new Set();
  
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => {
      buffer += chunk;
      
      // Buscar códigos en el buffer
      const regex = /"t_id_uv_ca"\s*:\s*"?([^",\s}]+)"?/g;
      let match;
      
      while ((match = regex.exec(buffer)) !== null) {
        codigos.add(match[1]);
        featureCount++;
      }
      
      // Mantener solo los últimos 10000 caracteres para no saturar memoria
      if (buffer.length > 10000) {
        buffer = buffer.slice(-10000);
      }
    });
    
    stream.on('end', () => {
      console.log(`✅ Encontrados ${codigos.size} códigos únicos de UV\n`);
      resolve(Array.from(codigos));
    });
    
    stream.on('error', reject);
  });
}

// Función principal
async function actualizarDatosCenso() {
  try {
    console.log('📋 PASO 1: Extraer códigos de unidades vecinales');
    console.log('─'.repeat(60));
    
    const codigosUV = await obtenerCodigosUV();
    
    console.log('\n📋 PASO 2: Preparar actualización en base de datos');
    console.log('─'.repeat(60));
    console.log('⚠️  NOTA: Para completar la actualización necesitas:');
    console.log('');
    console.log('1️⃣  Convertir el archivo Parquet a JSON:');
    console.log('   python3 scripts/convertir-parquet-a-json.py');
    console.log('');
    console.log('2️⃣  O instalar parquetjs para Node.js:');
    console.log('   npm install parquetjs');
    console.log('');
    console.log('3️⃣  Luego ejecutar:');
    console.log('   node scripts/actualizar-datos-censo-2024.js');
    console.log('');
    console.log('─'.repeat(60));
    console.log('\n📊 Códigos de UV disponibles para actualizar:');
    console.log(`   Total: ${codigosUV.length} unidades vecinales`);
    console.log(`   Ejemplos: ${codigosUV.slice(0, 5).join(', ')}...`);
    console.log('');
    
    // Guardar lista de códigos para referencia
    const codigosPath = path.join(__dirname, '../public/data/geo/codigos_uv.json');
    fs.writeFileSync(codigosPath, JSON.stringify(codigosUV, null, 2));
    console.log(`✅ Lista de códigos guardada en: ${codigosPath}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Ejecutar
actualizarDatosCenso();
