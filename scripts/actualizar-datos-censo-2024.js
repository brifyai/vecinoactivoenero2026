const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🔄 Actualizando datos del Censo 2024 en neighborhoods...\n');

// Configurar Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERROR: Variables de entorno no configuradas');
  console.error('Necesitas REACT_APP_SUPABASE_URL y REACT_APP_SUPABASE_ANON_KEY en .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Función para leer archivo Parquet usando pyarrow (requiere Python)
// Alternativa: convertir Parquet a JSON primero
async function leerCenso2024() {
  console.log('📖 Leyendo datos del Censo 2024...');
  console.log('⚠️  NOTA: Este script requiere que conviertas el archivo Parquet a JSON primero\n');
  
  const censoPath = path.join(__dirname, '../public/data/geo/censo2024_comunal.json');
  
  if (!fs.existsSync(censoPath)) {
    console.error('❌ ERROR: No se encuentra el archivo censo2024_comunal.json');
    console.error('\n📋 INSTRUCCIONES PARA CONVERTIR:');
    console.error('1. Instala Python y pandas: pip install pandas pyarrow');
    console.error('2. Ejecuta este comando Python:\n');
    console.error('   python3 -c "import pandas as pd; df = pd.read_parquet(\'public/data/geo/Cartografia_censo2024_Pais_Comunal.parquet\'); df.to_json(\'public/data/geo/censo2024_comunal.json\', orient=\'records\', force_ascii=False)"');
    console.error('\n3. Vuelve a ejecutar este script\n');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(censoPath, 'utf8'));
  console.log(`✅ Censo 2024 leído: ${data.length} registros\n`);
  return data;
}

// Función principal
async function actualizarDatosCenso() {
  try {
    // Leer datos del Censo 2024
    const censoDatos = await leerCenso2024();
    
    // Crear índice por código de UV para búsqueda rápida
    const censoIndex = {};
    censoDatos.forEach(registro => {
      // El campo puede variar, ajustar según estructura real
      const codigo = registro.GEOCODIGO || registro.codigo || registro.COD_UV;
      if (codigo) {
        censoIndex[codigo] = registro;
      }
    });
    
    console.log(`📊 Índice creado con ${Object.keys(censoIndex).length} códigos únicos\n`);
    
    // Obtener todos los vecindarios de la base de datos
    console.log('🔍 Obteniendo vecindarios de la base de datos...');
    const { data: neighborhoods, error } = await supabase
      .from('neighborhoods')
      .select('id, codigo, nombre, properties');
    
    if (error) {
      console.error('❌ Error al obtener vecindarios:', error);
      process.exit(1);
    }
    
    console.log(`✅ ${neighborhoods.length} vecindarios obtenidos\n`);
    
    // Actualizar cada vecindario con datos del censo
    let actualizados = 0;
    let noEncontrados = 0;
    let errores = 0;
    
    for (const neighborhood of neighborhoods) {
      // Buscar código en properties
      const codigoUV = neighborhood.properties?.t_id_uv_ca || 
                       neighborhood.properties?.codigo || 
                       neighborhood.codigo;
      
      if (!codigoUV) {
        console.log(`  ⚠️  ${neighborhood.nombre}: Sin código UV`);
        noEncontrados++;
        continue;
      }
      
      // Buscar datos del censo
      const censoDato = censoIndex[codigoUV];
      
      if (!censoDato) {
        noEncontrados++;
        if (noEncontrados <= 10) {
          console.log(`  ⚠️  ${neighborhood.nombre} (${codigoUV}): No encontrado en Censo 2024`);
        }
        continue;
      }
      
      // Extraer datos demográficos del censo
      // NOTA: Ajustar nombres de campos según estructura real del Parquet
      const datosActualizados = {
        personas: parseInt(censoDato.TOTAL_PERSONAS || censoDato.poblacion || 0),
        hogares: parseInt(censoDato.TOTAL_HOGARES || censoDato.hogares || 0),
        viviendas: parseInt(censoDato.TOTAL_VIVIENDAS || censoDato.viviendas || 0),
        // Agregar más campos según disponibilidad
        hombres: parseInt(censoDato.HOMBRES || 0),
        mujeres: parseInt(censoDato.MUJERES || 0),
        // Actualizar properties con datos completos del censo
        properties: {
          ...neighborhood.properties,
          censo_2024: censoDato,
          fecha_actualizacion: new Date().toISOString()
        }
      };
      
      // Actualizar en la base de datos
      const { error: updateError } = await supabase
        .from('neighborhoods')
        .update(datosActualizados)
        .eq('id', neighborhood.id);
      
      if (updateError) {
        console.error(`  ✗ Error en ${neighborhood.nombre}:`, updateError.message);
        errores++;
      } else {
        actualizados++;
        if (actualizados % 100 === 0) {
          console.log(`  ✓ Actualizados: ${actualizados}/${neighborhoods.length}`);
        }
      }
    }
    
    // Resumen final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE ACTUALIZACIÓN');
    console.log('='.repeat(60));
    console.log(`✅ Actualizados exitosamente: ${actualizados}`);
    console.log(`⚠️  No encontrados en Censo:  ${noEncontrados}`);
    console.log(`❌ Errores:                   ${errores}`);
    console.log(`📈 Total procesados:          ${neighborhoods.length}`);
    console.log('='.repeat(60) + '\n');
    
    if (actualizados > 0) {
      console.log('✅ Actualización completada exitosamente');
    } else {
      console.log('⚠️  No se actualizó ningún registro. Verifica los nombres de campos.');
    }
    
  } catch (error) {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  }
}

// Ejecutar
actualizarDatosCenso();
