// =====================================================
// TESTING SIN REAL-TIME (SOLO CRUD)
// Para verificar que todo funciona sin WebSockets
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

async function testCRUDOperations() {
    console.log('🧪 TESTING OPERACIONES CRUD (SIN REAL-TIME)');
    console.log('===========================================');
    
    try {
        // 1. Test usuarios
        console.log('\n1. Testing usuarios...');
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, email, name')
            .limit(5);
            
        if (usersError) throw usersError;
        console.log(`✅ Usuarios encontrados: ${users.length}`);
        users.forEach(user => console.log(`   - ${user.name} (${user.email})`));
        
        if (users.length < 2) {
            console.log('❌ Se necesitan al menos 2 usuarios para los tests');
            return false;
        }
        
        // 2. Test posts
        console.log('\n2. Testing posts...');
        const testPost = {
            author_id: users[0].id,
            content: `Test post CRUD - ${Date.now()}`,
            created_at: new Date().toISOString()
        };
        
        const { data: newPost, error: postError } = await supabase
            .from('posts')
            .insert([testPost])
            .select('*');
            
        if (postError) throw postError;
        console.log(`✅ Post creado: ID ${newPost[0].id}`);
        
        // 3. Test notifications
        console.log('\n3. Testing notifications...');
        const testNotification = {
            user_id: users[0].id,
            type: 'test',
            message: `Test notification - ${Date.now()}`,
            read: false
        };
        
        const { data: newNotification, error: notifError } = await supabase
            .from('notifications')
            .insert([testNotification])
            .select('*');
            
        if (notifError) throw notifError;
        console.log(`✅ Notificación creada: ID ${newNotification[0].id}`);
        
        // 4. Test conversations
        console.log('\n4. Testing conversations...');
        const testConversation = {
            participant1_id: users[0].id,
            participant2_id: users[1].id
        };
        
        const { data: newConversation, error: convError } = await supabase
            .from('conversations')
            .insert([testConversation])
            .select('*');
            
        if (convError) throw convError;
        console.log(`✅ Conversación creada: ID ${newConversation[0].id}`);
        
        // 5. Test messages
        console.log('\n5. Testing messages...');
        const testMessage = {
            conversation_id: newConversation[0].id,
            sender_id: users[0].id,
            recipient_id: users[1].id,
            content: `Test message - ${Date.now()}`
        };
        
        const { data: newMessage, error: msgError } = await supabase
            .from('messages')
            .insert([testMessage])
            .select('*');
            
        if (msgError) throw msgError;
        console.log(`✅ Mensaje creado: ID ${newMessage[0].id}`);
        
        // 6. Cleanup
        console.log('\n6. Limpiando datos de prueba...');
        await supabase.from('messages').delete().eq('id', newMessage[0].id);
        await supabase.from('conversations').delete().eq('id', newConversation[0].id);
        await supabase.from('notifications').delete().eq('id', newNotification[0].id);
        await supabase.from('posts').delete().eq('id', newPost[0].id);
        console.log('✅ Cleanup completado');
        
        console.log('\n🎉 TODOS LOS TESTS CRUD PASARON');
        console.log('💡 El problema es solo con Real-time WebSockets');
        return true;
        
    } catch (error) {
        console.error(`❌ Error en tests CRUD: ${error.message}`);
        return false;
    }
}

// Ejecutar tests
testCRUDOperations()
    .then(success => {
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.error('❌ Error crítico:', error);
        process.exit(1);
    });