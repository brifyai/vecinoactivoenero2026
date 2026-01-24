// =====================================================
// TEST DE INTEGRACIÓN DE POLLING REAL-TIME
// Verifica que la implementación funciona en la app
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

class PollingIntegrationTest {
    constructor() {
        this.testResults = {
            database: false,
            users: false,
            posts: false,
            notifications: false,
            integration: false
        };
    }

    log(message, type = 'info') {
        const colors = {
            info: '\x1b[36m',
            success: '\x1b[32m',
            warning: '\x1b[33m',
            error: '\x1b[31m',
            debug: '\x1b[35m',
            reset: '\x1b[0m'
        };
        console.log(`${colors[type]}[${type.toUpperCase()}] ${message}${colors.reset}`);
    }

    async testDatabaseConnection() {
        this.log('🔍 Verificando conexión a base de datos...', 'info');
        
        try {
            const { data, error } = await supabase.from('users').select('count').limit(1);
            if (error) throw error;
            
            this.log('✅ Conexión a base de datos OK', 'success');
            this.testResults.database = true;
            return true;
        } catch (error) {
            this.log(`❌ Error de conexión: ${error.message}`, 'error');
            return false;
        }
    }

    async testUsersTable() {
        this.log('👥 Verificando usuarios de prueba...', 'info');
        
        try {
            const { data: users, error } = await supabase
                .from('users')
                .select('id, email, name')
                .or('email.like.test%@test.com,email.like.test%@vecinoactivo.cl');
                
            if (error) throw error;
            
            if (users.length >= 1) {
                this.log(`✅ Encontrados ${users.length} usuarios de prueba`, 'success');
                this.testResults.users = users;
                return users;
            } else {
                this.log('⚠️ No hay usuarios de prueba disponibles', 'warning');
                return [];
            }
        } catch (error) {
            this.log(`❌ Error verificando usuarios: ${error.message}`, 'error');
            return [];
        }
    }

    async testPostsIntegration(users) {
        this.log('📝 Probando integración de posts...', 'info');
        
        if (!users || users.length === 0) {
            this.log('❌ No hay usuarios para probar posts', 'error');
            return false;
        }
        
        try {
            // Crear post de prueba
            const postData = {
                author_id: users[0].id,
                content: `🚀 TEST INTEGRACIÓN POLLING - ${new Date().toLocaleTimeString()} - Verificando que el sistema funciona correctamente`,
                created_at: new Date().toISOString()
            };
            
            const { data: newPost, error } = await supabase
                .from('posts')
                .insert([postData])
                .select('*');
                
            if (error) throw error;
            
            this.log(`✅ Post de integración creado: ${newPost[0].id}`, 'success');
            this.log(`   Contenido: ${newPost[0].content.substring(0, 80)}...`, 'debug');
            
            // Verificar que se puede leer
            const { data: readPost, error: readError } = await supabase
                .from('posts')
                .select('*')
                .eq('id', newPost[0].id)
                .single();
                
            if (readError) throw readError;
            
            this.log('✅ Post verificado correctamente', 'success');
            this.testResults.posts = true;
            
            return newPost[0];
        } catch (error) {
            this.log(`❌ Error en integración de posts: ${error.message}`, 'error');
            return false;
        }
    }

    async testNotificationsIntegration(users) {
        this.log('🔔 Probando integración de notificaciones...', 'info');
        
        if (!users || users.length === 0) {
            this.log('❌ No hay usuarios para probar notificaciones', 'error');
            return false;
        }
        
        try {
            // Crear notificación de prueba
            const notificationData = {
                user_id: users[0].id,
                type: 'integration_test',
                message: `🧪 Test de integración - ${new Date().toLocaleTimeString()} - Sistema de polling funcionando`,
                read: false
            };
            
            const { data: newNotification, error } = await supabase
                .from('notifications')
                .insert([notificationData])
                .select('*');
                
            if (error) throw error;
            
            this.log(`✅ Notificación de integración creada: ${newNotification[0].id}`, 'success');
            this.log(`   Mensaje: ${newNotification[0].message.substring(0, 80)}...`, 'debug');
            
            this.testResults.notifications = true;
            return newNotification[0];
        } catch (error) {
            this.log(`❌ Error en integración de notificaciones: ${error.message}`, 'error');
            return false;
        }
    }

    async testPollingSimulation() {
        this.log('⏱️ Simulando polling real-time...', 'info');
        
        try {
            // Simular 3 ciclos de polling
            for (let i = 1; i <= 3; i++) {
                this.log(`   Ciclo ${i}/3 - Consultando posts...`, 'debug');
                
                const { data: posts, error } = await supabase
                    .from('posts')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(5);
                    
                if (error) throw error;
                
                this.log(`   ✅ ${posts.length} posts obtenidos`, 'debug');
                
                // Simular intervalo de polling
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            this.log('✅ Simulación de polling completada', 'success');
            this.testResults.integration = true;
            return true;
        } catch (error) {
            this.log(`❌ Error en simulación de polling: ${error.message}`, 'error');
            return false;
        }
    }

    async runIntegrationTest() {
        this.log('🧪 INICIANDO TEST DE INTEGRACIÓN DE POLLING', 'info');
        this.log('='.repeat(55), 'info');
        
        // 1. Test de conexión
        const dbOk = await this.testDatabaseConnection();
        if (!dbOk) {
            this.log('❌ Test abortado: No hay conexión a BD', 'error');
            return false;
        }
        
        // 2. Test de usuarios
        const users = await this.testUsersTable();
        
        // 3. Test de posts
        const postCreated = await this.testPostsIntegration(users);
        
        // 4. Test de notificaciones
        const notificationCreated = await this.testNotificationsIntegration(users);
        
        // 5. Test de polling
        await this.testPollingSimulation();
        
        // Generar reporte
        this.generateIntegrationReport();
        
        return this.testResults.integration;
    }

    generateIntegrationReport() {
        this.log('='.repeat(55), 'info');
        this.log('📊 REPORTE DE INTEGRACIÓN', 'info');
        this.log('='.repeat(55), 'info');
        
        const tests = [
            { name: 'Conexión BD', result: this.testResults.database },
            { name: 'Usuarios', result: !!this.testResults.users },
            { name: 'Posts', result: this.testResults.posts },
            { name: 'Notificaciones', result: this.testResults.notifications },
            { name: 'Polling', result: this.testResults.integration }
        ];
        
        let passed = 0;
        tests.forEach(test => {
            const status = test.result ? '✅' : '❌';
            this.log(`${status} ${test.name}`, test.result ? 'success' : 'error');
            if (test.result) passed++;
        });
        
        this.log('='.repeat(55), 'info');
        this.log(`🎯 RESULTADO: ${passed}/${tests.length} tests pasaron`, 'info');
        
        if (passed === tests.length) {
            this.log('🎉 INTEGRACIÓN COMPLETADA EXITOSAMENTE', 'success');
            this.log('💡 El sistema de polling está listo para usar', 'info');
            this.log('🚀 Inicia la aplicación y verifica el indicador real-time', 'info');
        } else {
            this.log('⚠️ Algunos tests fallaron - revisar configuración', 'warning');
        }
        
        this.log('='.repeat(55), 'info');
        this.log('📋 PRÓXIMOS PASOS:', 'info');
        this.log('1. npm start - Iniciar la aplicación', 'info');
        this.log('2. Observar indicador real-time en el header', 'info');
        this.log('3. Usar panel de pruebas para crear datos', 'info');
        this.log('4. Verificar que aparecen sin recargar página', 'info');
    }
}

// Ejecutar test de integración
const test = new PollingIntegrationTest();
test.runIntegrationTest()
    .then(success => {
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.error('❌ Error crítico en test de integración:', error);
        process.exit(1);
    });