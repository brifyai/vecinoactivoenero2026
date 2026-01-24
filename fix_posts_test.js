// =====================================================
// ARREGLAR TEST DE POSTS - DETECTAR ESTRUCTURA AUTOMÁTICAMENTE
// =====================================================

const { createClient } = require('@supabase/supabase-js');

// Cargar variables de entorno
const fs = require('fs');
const envContent = fs.readFileSync('.env', 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
    if (line.trim() && !line.trim().startsWith('#')) {
        const equalIndex = line.indexOf('=');
        if (equalIndex > 0) {
            const key = line.substring(0, equalIndex).trim();
            const value = line.substring(equalIndex + 1).trim().replace(/['"]/g, '');
            if (key && value) {
                envVars[key] = value;
            }
        }
    }
});

Object.assign(process.env, envVars);

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testPostsWithAutoDetection() {
    console.log('🔍 DETECTANDO ESTRUCTURA DE TABLA POSTS');
    console.log('=====================================');
    
    try {
        // 1. Obtener usuarios de prueba
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, email, name')
            .limit(3);
            
        if (usersError) throw usersError;
        
        if (users.length === 0) {
            console.log('❌ No hay usuarios de prueba');
            return false;
        }
        
        console.log(`✅ Encontrados ${users.length} usuarios de prueba`);
        
        // 2. Obtener estructura de la tabla posts
        console.log('\n🔍 Analizando estructura de tabla posts...');
        
        // Hacer una consulta simple para obtener las columnas
        const { data: samplePosts, error: sampleError } = await supabase
            .from('posts')
            .select('*')
            .limit(1);
            
        if (sampleError) {
            console.log(`❌ Error consultando posts: ${sampleError.message}`);
            return false;
        }
        
        // Si hay posts, analizar las columnas
        let userColumn = null;
        let hasTypeColumn = false;
        
        if (samplePosts && samplePosts.length > 0) {
            const columns = Object.keys(samplePosts[0]);
            console.log(`📋 Columnas encontradas: ${columns.join(', ')}`);
            
            // Detectar columna de usuario
            if (columns.includes('user_id')) {
                userColumn = 'user_id';
            } else if (columns.includes('author_id')) {
                userColumn = 'author_id';
            }
            
            // Detectar columna type
            hasTypeColumn = columns.includes('type');
            
        } else {
            // Si no hay posts, intentar insertar uno simple para detectar estructura
            console.log('📝 No hay posts existentes, detectando estructura por inserción...');
            
            // Intentar con user_id primero
            try {
                const testData = {
                    user_id: users[0].id,
                    content: 'Test detection post',
                    created_at: new Date().toISOString()
                };
                
                const { data, error } = await supabase
                    .from('posts')
                    .insert([testData])
                    .select('*');
                    
                if (!error) {
                    userColumn = 'user_id';
                    hasTypeColumn = Object.keys(data[0]).includes('type');
                    console.log('✅ Detectado: user_id funciona');
                    
                    // Limpiar post de prueba
                    await supabase.from('posts').delete().eq('id', data[0].id);
                }
            } catch (e) {
                // Intentar con author_id
                try {
                    const testData = {
                        author_id: users[0].id,
                        content: 'Test detection post',
                        created_at: new Date().toISOString()
                    };
                    
                    const { data, error } = await supabase
                        .from('posts')
                        .insert([testData])
                        .select('*');
                        
                    if (!error) {
                        userColumn = 'author_id';
                        hasTypeColumn = Object.keys(data[0]).includes('type');
                        console.log('✅ Detectado: author_id funciona');
                        
                        // Limpiar post de prueba
                        await supabase.from('posts').delete().eq('id', data[0].id);
                    }
                } catch (e2) {
                    console.log('❌ No se pudo detectar columna de usuario');
                }
            }
        }
        
        if (!userColumn) {
            console.log('❌ No se encontró columna de usuario válida (user_id o author_id)');
            return false;
        }
        
        console.log(`✅ Columna de usuario detectada: ${userColumn}`);
        console.log(`✅ Columna type: ${hasTypeColumn ? 'Sí' : 'No'}`);
        
        // 3. Crear post de prueba con la estructura correcta
        console.log('\n📝 Creando post de prueba...');
        
        const postData = {
            [userColumn]: users[0].id,
            content: `Test post CRUD - ${Date.now()}`,
            created_at: new Date().toISOString()
        };
        
        // Agregar type si existe la columna
        if (hasTypeColumn) {
            postData.type = 'text';
        }
        
        const { data: newPost, error: postError } = await supabase
            .from('posts')
            .insert([postData])
            .select('*');
            
        if (postError) {
            console.log(`❌ Error creando post: ${postError.message}`);
            return false;
        }
        
        console.log(`✅ Post creado exitosamente: ID ${newPost[0].id}`);
        console.log(`   Contenido: ${newPost[0].content}`);
        console.log(`   Usuario: ${userColumn} = ${newPost[0][userColumn]}`);
        
        // 4. Limpiar post de prueba
        await supabase.from('posts').delete().eq('id', newPost[0].id);
        console.log('🧹 Post de prueba eliminado');
        
        console.log('\n🎉 TEST DE POSTS EXITOSO');
        console.log(`📋 Estructura detectada: ${userColumn}${hasTypeColumn ? ', type' : ''}`);
        
        return true;
        
    } catch (error) {
        console.log(`❌ Error en test de posts: ${error.message}`);
        return false;
    }
}

// Ejecutar test
testPostsWithAutoDetection()
    .then(success => {
        if (success) {
            console.log('\n✅ Posts funcionan correctamente');
        } else {
            console.log('\n❌ Hay problemas con la tabla posts');
        }
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.error('❌ Error crítico:', error);
        process.exit(1);
    });