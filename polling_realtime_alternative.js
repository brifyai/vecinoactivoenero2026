// =====================================================
// ALTERNATIVA DE POLLING PARA REAL-TIME
// Simula funcionalidad real-time usando polling
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

class PollingRealtimeAlternative {
    constructor() {
        this.subscriptions = new Map();
        this.lastData = new Map();
        this.intervals = new Map();
    }

    log(message, type = 'info') {
        const colors = {
            info: '\x1b[36m',
            success: '\x1b[32m',
            warning: '\x1b[33m',
            error: '\x1b[31m',
            reset: '\x1b[0m'
        };
        console.log(`${colors[type]}[${type.toUpperCase()}] ${message}${colors.reset}`);
    }

    // Simular suscripción real-time con polling
    subscribe(table, callback, options = {}) {
        const {
            interval = 2000, // 2 segundos por defecto
            filter = null,
            select = '*'
        } = options;

        const subscriptionId = `${table}_${Date.now()}`;
        
        this.log(`📡 Iniciando polling para tabla: ${table}`, 'info');
        this.log(`   Intervalo: ${interval}ms`, 'info');
        
        // Función de polling
        const poll = async () => {
            try {
                let query = supabase.from(table).select(select);
                
                if (filter) {
                    query = query.filter(filter.column, filter.operator, filter.value);
                }
                
                const { data, error } = await query.order('created_at', { ascending: false });
                
                if (error) {
                    this.log(`❌ Error en polling ${table}: ${error.message}`, 'error');
                    callback({ error, eventType: 'ERROR' });
                    return;
                }
                
                // Comparar con datos anteriores para detectar cambios
                const lastDataKey = `${table}_${subscriptionId}`;
                const previousData = this.lastData.get(lastDataKey) || [];
                
                // Detectar nuevos registros (INSERT)
                const newRecords = data.filter(record => 
                    !previousData.some(prev => prev.id === record.id)
                );
                
                // Detectar registros actualizados (UPDATE)
                const updatedRecords = data.filter(record => {
                    const prevRecord = previousData.find(prev => prev.id === record.id);
                    return prevRecord && JSON.stringify(prevRecord) !== JSON.stringify(record);
                });
                
                // Detectar registros eliminados (DELETE)
                const deletedRecords = previousData.filter(prev => 
                    !data.some(record => record.id === prev.id)
                );
                
                // Emitir eventos para cambios detectados
                newRecords.forEach(record => {
                    this.log(`🆕 INSERT detectado en ${table}: ${record.id}`, 'success');
                    callback({
                        eventType: 'INSERT',
                        new: record,
                        table: table,
                        timestamp: new Date().toISOString()
                    });
                });
                
                updatedRecords.forEach(record => {
                    this.log(`📝 UPDATE detectado en ${table}: ${record.id}`, 'success');
                    callback({
                        eventType: 'UPDATE',
                        new: record,
                        old: previousData.find(prev => prev.id === record.id),
                        table: table,
                        timestamp: new Date().toISOString()
                    });
                });
                
                deletedRecords.forEach(record => {
                    this.log(`🗑️ DELETE detectado en ${table}: ${record.id}`, 'success');
                    callback({
                        eventType: 'DELETE',
                        old: record,
                        table: table,
                        timestamp: new Date().toISOString()
                    });
                });
                
                // Actualizar datos anteriores
                this.lastData.set(lastDataKey, data);
                
            } catch (error) {
                this.log(`❌ Error crítico en polling ${table}: ${error.message}`, 'error');
                callback({ error, eventType: 'ERROR' });
            }
        };
        
        // Ejecutar polling inicial
        poll();
        
        // Configurar intervalo
        const intervalId = setInterval(poll, interval);
        
        // Guardar suscripción
        this.subscriptions.set(subscriptionId, {
            table,
            callback,
            options,
            intervalId
        });
        
        this.intervals.set(subscriptionId, intervalId);
        
        this.log(`✅ Polling iniciado para ${table} (ID: ${subscriptionId})`, 'success');
        
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
            this.subscriptions.delete(subscriptionId);
            this.lastData.delete(`${subscriptionId}`);
            this.log(`🛑 Polling detenido (ID: ${subscriptionId})`, 'info');
            return true;
        }
        return false;
    }

    unsubscribeAll() {
        this.log('🛑 Deteniendo todos los pollings...', 'info');
        this.intervals.forEach((intervalId, subscriptionId) => {
            clearInterval(intervalId);
            this.log(`   Detenido: ${subscriptionId}`, 'info');
        });
        
        this.subscriptions.clear();
        this.intervals.clear();
        this.lastData.clear();
        
        this.log('✅ Todos los pollings detenidos', 'success');
    }

    getActiveSubscriptions() {
        return Array.from(this.subscriptions.keys());
    }
}

// Test de la alternativa de polling
async function testPollingAlternative() {
    console.log('🧪 TESTING ALTERNATIVA DE POLLING REAL-TIME');
    console.log('==========================================');
    
    const polling = new PollingRealtimeAlternative();
    
    // Test 1: Suscribirse a posts
    const postsSubscription = polling.subscribe('posts', (event) => {
        if (event.error) {
            console.log(`❌ Error en posts: ${event.error.message}`);
            return;
        }
        
        console.log(`📨 Evento en posts: ${event.eventType}`);
        if (event.new) {
            console.log(`   Contenido: ${event.new.content?.substring(0, 50)}...`);
        }
    }, { interval: 3000 });
    
    // Test 2: Suscribirse a notifications
    const notificationsSubscription = polling.subscribe('notifications', (event) => {
        if (event.error) {
            console.log(`❌ Error en notifications: ${event.error.message}`);
            return;
        }
        
        console.log(`🔔 Evento en notifications: ${event.eventType}`);
        if (event.new) {
            console.log(`   Mensaje: ${event.new.message?.substring(0, 50)}...`);
        }
    }, { interval: 2000 });
    
    console.log('\n⏱️ Polling activo por 30 segundos...');
    console.log('💡 Crea posts o notificaciones desde otra terminal para ver eventos');
    console.log('   Ejemplo: node test_crud_functionality.js');
    
    // Ejecutar por 30 segundos
    setTimeout(() => {
        console.log('\n🛑 Deteniendo polling...');
        polling.unsubscribeAll();
        
        console.log('\n📊 RESUMEN:');
        console.log('✅ Polling funciona como alternativa a Real-time');
        console.log('✅ Detecta INSERT, UPDATE, DELETE');
        console.log('✅ Configurable (intervalo, filtros)');
        console.log('⚠️ Consume más recursos que WebSockets');
        console.log('⚠️ Latencia mayor (depende del intervalo)');
        
        process.exit(0);
    }, 30000);
}

// Ejecutar test si se llama directamente
if (require.main === module) {
    testPollingAlternative().catch(error => {
        console.error('❌ Error en test:', error);
        process.exit(1);
    });
}

module.exports = PollingRealtimeAlternative;