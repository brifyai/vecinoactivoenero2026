// =====================================================
// TESTING DE FUNCIONALIDAD CRUD COMPLETA
// Verifica que todo funciona sin depender de Real-time
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

class CRUDTester {
    constructor() {
        this.results = {
            users: false,
            posts: false,
            notifications: false,
            conversations: false,
            messages: false
        };
    }

    log(message, type = 'info') {
        const colors = {
            info: '\x1b[36m',
            success: '\x1b[32m',
            warning: '\x1b[33m',
            error: '\x1b[31m',
            reset: '\x1b[0m'
        };
        console.log(`${colors[type]}${message}${colors.reset}`);
    }

    async testUsers() {
        this.log('\n1. 👥 Testing Usuarios...', 'info');
        
        try {
            // Buscar usuarios de prueba
            const { data: users, error } = await supabase
                .from('users')
                .select('id, email, name')
                .or('email.like.test%@test.com,email.like.test%@vecinoactivo.cl');
                
            if (error) throw error;
            
            if (users.length >= 2) {
                this.log(`✅ Encontrados ${users.length} usuarios de prueba`, 'success');
                users.forEach(user => this.log(`   - ${user.name} (${user.email})`, 'info'));
                this.results.users = users;
                return users;
            } else {
                this.log(`⚠️ Solo ${users.length} usuarios encontrados, se necesitan al menos 2`, 'warning');
                
                // Intentar crear usuarios
                this.log('   Intentando crear usuarios de prueba...', 'info');
                const newUsers = [
                    { email: 'test1@test.com', password: '$2b$10$test.hash', name: 'Test User 1' },
                    { email: 'test2@test.com', password: '$2b$10$test.hash', name: 'Test User 2' },
                    { email: 'test3@test.com', password: '$2b$10$test.hash', name: 'Test User 3' }
                ];
                
                const { data: createdUsers, error: createError } = await supabase
                    .from('users')
                    .insert(newUsers)
                    .select('id, email, name');
                    
                if (createError) {
                    this.log(`   ❌ Error creando usuarios: ${createError.message}`, 'error');
                    return [];
                }
                
                this.log(`   ✅ Creados ${createdUsers.length} usuarios`, 'success');
                this.results.users = createdUsers;
                return createdUsers;
            }
        } catch (error) {
            this.log(`❌ Error en test de usuarios: ${error.message}`, 'error');
            return [];
        }
    }

    async testPosts(users) {
        this.log('\n2. 📝 Testing Posts...', 'info');
        
        if (!users || users.length === 0) {
            this.log('❌ No hay usuarios para crear posts', 'error');
            return false;
        }
        
        try {
            // Usar author_id que ya sabemos que existe
            const userColumn = 'author_id';
            
            // Crear post de prueba
            const postData = {
                [userColumn]: users[0].id,
                content: `Test post CRUD - ${Date.now()}`,
                created_at: new Date().toISOString()
            };
            
            const { data: newPost, error } = await supabase
                .from('posts')
                .insert([postData])
                .select('*');
                
            if (error) throw error;
            
            this.log(`✅ Post creado: ID ${newPost[0].id}`, 'success');
            this.log(`   Contenido: ${newPost[0].content}`, 'info');
            
            // Limpiar
            await supabase.from('posts').delete().eq('id', newPost[0].id);
            this.log('   🧹 Post de prueba eliminado', 'info');
            
            this.results.posts = true;
            return true;
            
        } catch (error) {
            this.log(`❌ Error en test de posts: ${error.message}`, 'error');
            return false;
        }
    }

    async testNotifications(users) {
        this.log('\n3. 🔔 Testing Notifications...', 'info');
        
        if (!users || users.length === 0) {
            this.log('❌ No hay usuarios para crear notificaciones', 'error');
            return false;
        }
        
        try {
            const notificationData = {
                user_id: users[0].id,
                type: 'test',
                message: `Test notification - ${Date.now()}`,
                read: false
            };
            
            const { data: newNotification, error } = await supabase
                .from('notifications')
                .insert([notificationData])
                .select('*');
                
            if (error) throw error;
            
            this.log(`✅ Notificación creada: ID ${newNotification[0].id}`, 'success');
            this.log(`   Mensaje: ${newNotification[0].message}`, 'info');
            
            // Limpiar
            await supabase.from('notifications').delete().eq('id', newNotification[0].id);
            this.log('   🧹 Notificación de prueba eliminada', 'info');
            
            this.results.notifications = true;
            return true;
            
        } catch (error) {
            this.log(`❌ Error en test de notificaciones: ${error.message}`, 'error');
            return false;
        }
    }

    async testConversations(users) {
        this.log('\n4. 💬 Testing Conversations...', 'info');
        
        if (!users || users.length < 2) {
            this.log('❌ Se necesitan al menos 2 usuarios para conversaciones', 'error');
            return false;
        }
        
        try {
            const conversationData = {
                participant1_id: users[0].id,
                participant2_id: users[1].id
            };
            
            const { data: newConversation, error } = await supabase
                .from('conversations')
                .insert([conversationData])
                .select('*');
                
            if (error) throw error;
            
            this.log(`✅ Conversación creada: ID ${newConversation[0].id}`, 'success');
            this.log(`   Entre: ${users[0].name} y ${users[1].name}`, 'info');
            
            this.results.conversations = newConversation[0];
            return newConversation[0];
            
        } catch (error) {
            this.log(`❌ Error en test de conversaciones: ${error.message}`, 'error');
            return false;
        }
    }

    async testMessages(users, conversation) {
        this.log('\n5. 📨 Testing Messages...', 'info');
        
        if (!conversation) {
            this.log('❌ No hay conversación para crear mensajes', 'error');
            return false;
        }
        
        try {
            const messageData = {
                conversation_id: conversation.id,
                sender_id: users[0].id,
                recipient_id: users[1].id,
                content: `Test message - ${Date.now()}`
            };
            
            const { data: newMessage, error } = await supabase
                .from('messages')
                .insert([messageData])
                .select('*');
                
            if (error) throw error;
            
            this.log(`✅ Mensaje creado: ID ${newMessage[0].id}`, 'success');
            this.log(`   Contenido: ${newMessage[0].content}`, 'info');
            
            // Limpiar mensajes y conversación
            await supabase.from('messages').delete().eq('id', newMessage[0].id);
            await supabase.from('conversations').delete().eq('id', conversation.id);
            this.log('   🧹 Mensaje y conversación de prueba eliminados', 'info');
            
            this.results.messages = true;
            return true;
            
        } catch (error) {
            this.log(`❌ Error en test de mensajes: ${error.message}`, 'error');
            return false;
        }
    }

    async runAllTests() {
        this.log('🧪 TESTING COMPLETO DE FUNCIONALIDAD CRUD', 'info');
        this.log('==========================================', 'info');
        
        // 1. Test usuarios
        const users = await this.testUsers();
        
        // 2. Test posts
        await this.testPosts(users);
        
        // 3. Test notifications
        await this.testNotifications(users);
        
        // 4. Test conversations
        const conversation = await this.testConversations(users);
        
        // 5. Test messages
        await this.testMessages(users, conversation);
        
        // Resumen final
        this.generateReport();
    }

    generateReport() {
        this.log('\n📊 REPORTE FINAL DE TESTING CRUD', 'info');
        this.log('================================', 'info');
        
        const tests = [
            { name: 'Usuarios', result: this.results.users },
            { name: 'Posts', result: this.results.posts },
            { name: 'Notificaciones', result: this.results.notifications },
            { name: 'Conversaciones', result: this.results.conversations },
            { name: 'Mensajes', result: this.results.messages }
        ];
        
        let passed = 0;
        tests.forEach(test => {
            const status = test.result ? '✅' : '❌';
            this.log(`${status} ${test.name}`, test.result ? 'success' : 'error');
            if (test.result) passed++;
        });
        
        this.log(`\n🎯 Resultado: ${passed}/${tests.length} tests pasaron`, 'info');
        
        if (passed === tests.length) {
            this.log('🎉 TODAS LAS FUNCIONALIDADES CRUD FUNCIONAN', 'success');
            this.log('💡 El problema es solo con Real-time WebSockets', 'warning');
        } else {
            this.log('⚠️ Algunas funcionalidades tienen problemas', 'warning');
        }
        
        return passed === tests.length;
    }
}

// Ejecutar tests
const tester = new CRUDTester();
tester.runAllTests()
    .then(() => {
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Error crítico:', error);
        process.exit(1);
    });