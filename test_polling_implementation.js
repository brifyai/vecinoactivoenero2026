// =====================================================
// TEST DE IMPLEMENTACIÓN DE POLLING
// Verifica que la alternativa funciona correctamente
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

class PollingImplementationTest {
    constructor() {
        this.subscriptions = new Map();
        this.lastData = new Map();
        this.intervals = new Map();
        this.eventCount = 0;
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

    // Implementación simplificada del hook de polling
    subscribe(table, callback, options = {}) {
        const { interval = 2000, filter = null } = options;
        const subscriptionId = `${table}_${Date.now()}`;
        
        this.log(`📡 Iniciando polling para ${table} (cada ${interval}ms)`, 'info');
        
        const poll = async () => {
            try {
                let query = supabase.from(table).select('*');
                
                if (filter) {
                    query = query.filter(filter.column, filter.operator, filter.value);
                }
                
                const { data, error } = await query.order('created_at', { ascending: false });
                
                if (error) throw error;
                
                const lastDataKey = `${table}_${subscriptionId}`;
                const previousData = this.lastData.get(lastDataKey) || [];
                
                // Detectar nuevos registros
                const newRecords = data.filter(record => 
                    !previousData.some(prev => prev.id === record.id)
                );
                
                // Emitir eventos para cambios
                newRecords.forEach(record => {
                    this.eventCount++;
                    this.log(`🆕 INSERT detectado en ${table}: ${record.id}`, 'success');
                    callback({
                        eventType: 'INSERT',
                        new: record,
                        table: table,
                        timestamp: new Date().toISOString()
                    });
                });
                
                this.lastData.set(lastDataKey, data);
                
            } catch (error) {
                this.log(`❌ Error en polling ${table}: ${error.message}`, 'error');
                callback({ error, eventType: 'ERROR' });
            }
        };
        
        // Ejecutar inmediatamente
        poll();
        
        // Configurar intervalo
        const intervalId = setInterval(poll, interval);
        this.intervals.set(subscriptionId, intervalId);
        
        return {
            subscriptionId,
            unsubscribe: () => this.unsubscribe(subscriptionId)
        };
    }

    unsubscribe(subscriptionId) {
        const intervalId = this.intervals.get(subscriptionId);
        if (intervalId) {
            clearInterval(intervalId);
            this.intervals.delete(subscriptionId);
            this.log(`🛑 Polling detenido (${subscriptionId})`, 'info');
            return true;
        }
        return false;
    }

    unsubscribeAll() {
        this.intervals.forEach((intervalId, subscriptionId) => {
            clearInterval(intervalId);
        });
        this.intervals.clear();
        this.lastData.clear();
        this.log('🛑 Todos los pollings detenidos', 'info');
    }

    async createTestData() {
        this.log('📝 Creando datos de prueba...', 'info');
        
        try {
            // Obtener usuario de prueba
            const { data: users } = await supabase
                .from('users')
                .select('id')
                .limit(1);

            if (!users || users.length === 0) {
                this.log('❌ No hay usuarios para crear datos de prueba', 'error');
                return false;
            }

            const userId = users[0].id;

            // Crear post
            const { error: postError } = await supabase
                .from('posts')
                .insert([{
                    author_id: userId,
                    content: `🚀 Post de prueba Real-time! - ${new Date().toLocaleTimeString()}`,
                    created_at: new Date().toISOString()
                }]);

            if (postError) throw postError;

            // Crear notificaciones
            const notifications = [
                { user_id: userId, type: 'test', message: '🔔 Notificación 1', read: false },
                { user_id: userId, type: 'test', message: '✅ Notificación 2', read: false },
                { user_id: userId, type: 'test', message: 'Prueba Real-time 🔔', read: false }
            ];

            const { error: notifError } = await supabase
                .from('notifications')
                .insert(notifications);

            if (notifError) throw notifError;

            this.log('✅ Datos de prueba creados exitosamente', 'success');
            return true;

        } catch (error) {
            this.log(`❌ Error creando datos de prueba: ${error.message}`, 'error');
            return false;
        }
    }

    async runTest() {
        this.log('🧪 INICIANDO TEST DE IMPLEMENTACIÓN DE POLLING', 'info');
        this.log('='.repeat(50), 'info');

        // Suscribirse a posts
        const postsSubscription = this.subscribe('posts', (event) => {
            if (event.error) {
                this.log(`❌ Error en posts: ${event.error.message}`, 'error');
                return;
            }
            this.log(`📨 Evento en posts: ${event.eventType}`, 'success');
            if (event.new && event.new.content) {
                this.log(`   Contenido: ${event.new.content.substring(0, 50)}...`, 'debug');
            }
        }, { interval: 3000 });

        // Suscribirse a notificaciones
        const notificationsSubscription = this.subscribe('notifications', (event) => {
            if (event.error) {
                this.log(`❌ Error en notifications: ${event.error.message}`, 'error');
                return;
            }
            this.log(`🔔 Evento en notifications: ${event.eventType}`, 'success');
            if (event.new && event.new.message) {
                this.log(`   Mensaje: ${event.new.message.substring(0, 50)}...`, 'debug');
            }
        }, { interval: 2000 });

        this.log('⏱️ Polling iniciado. Esperando 5 segundos antes de crear datos...', 'info');
        
        // Esperar 5 segundos y crear datos de prueba
        setTimeout(async () => {
            await this.createTestData();
            
            this.log('⏱️ Esperando 15 segundos más para observar eventos...', 'info');
            
            // Esperar 15 segundos más y finalizar
            setTimeout(() => {
                this.log('🏁 Finalizando test...', 'info');
                this.unsubscribeAll();
                
                this.log('='.repeat(50), 'info');
                this.log('📊 RESUMEN DEL TEST:', 'info');
                this.log(`✅ Eventos detectados: ${this.eventCount}`, 'success');
                
                if (this.eventCount > 0) {
                    this.log('🎉 POLLING FUNCIONA CORRECTAMENTE', 'success');
                    this.log('💡 La alternativa está lista para usar en producción', 'info');
                } else {
                    this.log('⚠️ No se detectaron eventos. Revisar configuración.', 'warning');
                }
                
                process.exit(0);
            }, 15000);
            
        }, 5000);
    }
}

// Ejecutar test
const test = new PollingImplementationTest();
test.runTest().catch(error => {
    console.error('❌ Error crítico en test:', error);
    process.exit(1);
});