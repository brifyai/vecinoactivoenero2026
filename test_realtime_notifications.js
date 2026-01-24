// =====================================================
// TESTING REAL-TIME NOTIFICATIONS FUNCTIONALITY
// =====================================================

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

class RealtimeNotificationsTest {
    constructor() {
        this.testResults = [];
        this.subscription = null;
        this.receivedUpdates = [];
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const logEntry = { timestamp, message, type };
        console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
        this.testResults.push(logEntry);
    }

    async setupRealtimeSubscription() {
        this.log('Configurando suscripción real-time para notifications...');
        
        try {
            this.subscription = supabase
                .channel('notifications-realtime-test')
                .on('postgres_changes', 
                    { 
                        event: '*', 
                        schema: 'public', 
                        table: 'notifications' 
                    }, 
                    (payload) => {
                        this.log(`Evento real-time recibido: ${payload.eventType}`, 'success');
                        this.log(`Datos: ${JSON.stringify(payload.new || payload.old)}`, 'info');
                        this.receivedUpdates.push({
                            eventType: payload.eventType,
                            timestamp: new Date().toISOString(),
                            data: payload.new || payload.old
                        });
                    }
                )
                .subscribe((status) => {
                    this.log(`Estado de suscripción: ${status}`, status === 'SUBSCRIBED' ? 'success' : 'warning');
                });

            await new Promise(resolve => setTimeout(resolve, 2000));
            return true;
        } catch (error) {
            this.log(`Error configurando suscripción: ${error.message}`, 'error');
            return false;
        }
    }

    async testCreateNotification() {
        this.log('Iniciando test de creación de notificación...');
        
        try {
            // Obtener un usuario para la prueba
            const { data: users, error: userError } = await supabase
                .from('users')
                .select('id')
                .limit(1);
            
            if (userError || !users || users.length === 0) {
                throw new Error('No se encontraron usuarios para la prueba');
            }

            const testNotification = {
                user_id: users[0].id,
                type: 'test_notification',
                title: `Test Notification - ${Date.now()}`,
                message: 'Esta es una notificación de prueba para testing real-time',
                data: JSON.stringify({
                    test: true,
                    timestamp: Date.now(),
                    source: 'realtime_test'
                }),
                read: false
            };

            const { data, error } = await supabase
                .from('notifications')
                .insert([testNotification])
                .select('*');

            if (error) {
                throw error;
            }

            this.log(`Notificación creada exitosamente: ID ${data[0].id}`, 'success');
            
            // Esperar evento real-time
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            const insertEvent = this.receivedUpdates.find(
                update => update.eventType === 'INSERT' && 
                         update.data.id === data[0].id
            );
            
            if (insertEvent) {
                this.log('✅ Evento INSERT real-time recibido correctamente', 'success');
                return { success: true, notificationId: data[0].id };
            } else {
                this.log('❌ No se recibió el evento INSERT real-time', 'error');
                return { success: false, notificationId: data[0].id };
            }

        } catch (error) {
            this.log(`Error creando notificación: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }

    async testMarkAsRead(notificationId) {
        this.log(`Iniciando test de marcar como leída la notificación ID: ${notificationId}...`);
        
        try {
            const { data, error } = await supabase
                .from('notifications')
                .update({ 
                    read: true,
                    read_at: new Date().toISOString()
                })
                .eq('id', notificationId)
                .select('*');

            if (error) {
                throw error;
            }

            this.log(`Notificación marcada como leída exitosamente`, 'success');
            
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            const updateEvent = this.receivedUpdates.find(
                update => update.eventType === 'UPDATE' && 
                         update.data.id === notificationId &&
                         update.data.read === true
            );
            
            if (updateEvent) {
                this.log('✅ Evento UPDATE real-time recibido correctamente', 'success');
                return { success: true };
            } else {
                this.log('❌ No se recibió el evento UPDATE real-time', 'error');
                return { success: false };
            }

        } catch (error) {
            this.log(`Error marcando notificación como leída: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }

    async testBulkNotifications() {
        this.log('Iniciando test de notificaciones en lote...');
        
        try {
            const { data: users, error: userError } = await supabase
                .from('users')
                .select('id')
                .limit(1);
            
            if (userError || !users || users.length === 0) {
                throw new Error('No se encontraron usuarios para la prueba');
            }

            const bulkNotifications = [
                {
                    user_id: users[0].id,
                    type: 'bulk_test_1',
                    title: 'Bulk Test 1',
                    message: 'Primera notificación del lote',
                    data: JSON.stringify({ bulk: true, index: 1 })
                },
                {
                    user_id: users[0].id,
                    type: 'bulk_test_2',
                    title: 'Bulk Test 2',
                    message: 'Segunda notificación del lote',
                    data: JSON.stringify({ bulk: true, index: 2 })
                },
                {
                    user_id: users[0].id,
                    type: 'bulk_test_3',
                    title: 'Bulk Test 3',
                    message: 'Tercera notificación del lote',
                    data: JSON.stringify({ bulk: true, index: 3 })
                }
            ];

            const { data, error } = await supabase
                .from('notifications')
                .insert(bulkNotifications)
                .select('*');

            if (error) {
                throw error;
            }

            this.log(`${data.length} notificaciones creadas en lote`, 'success');
            
            // Esperar eventos real-time
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            const bulkEvents = this.receivedUpdates.filter(
                update => update.eventType === 'INSERT' && 
                         data.some(notification => notification.id === update.data.id)
            );
            
            if (bulkEvents.length === data.length) {
                this.log(`✅ Todos los eventos real-time recibidos (${bulkEvents.length}/${data.length})`, 'success');
                return { success: true, notificationIds: data.map(n => n.id) };
            } else {
                this.log(`⚠️ Solo se recibieron ${bulkEvents.length}/${data.length} eventos real-time`, 'warning');
                return { success: false, notificationIds: data.map(n => n.id) };
            }

        } catch (error) {
            this.log(`Error creando notificaciones en lote: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }

    async testDeleteNotification(notificationId) {
        this.log(`Iniciando test de eliminación de notificación ID: ${notificationId}...`);
        
        try {
            const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('id', notificationId);

            if (error) {
                throw error;
            }

            this.log(`Notificación eliminada exitosamente`, 'success');
            
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            const deleteEvent = this.receivedUpdates.find(
                update => update.eventType === 'DELETE' && 
                         update.data.id === notificationId
            );
            
            if (deleteEvent) {
                this.log('✅ Evento DELETE real-time recibido correctamente', 'success');
                return { success: true };
            } else {
                this.log('❌ No se recibió el evento DELETE real-time', 'error');
                return { success: false };
            }

        } catch (error) {
            this.log(`Error eliminando notificación: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }

    async cleanup() {
        this.log('Limpiando suscripciones...');
        if (this.subscription) {
            await supabase.removeChannel(this.subscription);
        }
    }

    async runAllTests() {
        this.log('🚀 Iniciando tests de Real-time Notifications');
        
        // 1. Configurar suscripción
        const subscriptionOk = await this.setupRealtimeSubscription();
        if (!subscriptionOk) {
            this.log('❌ Falló la configuración de suscripción real-time', 'error');
            return this.generateReport();
        }

        // 2. Test de creación individual
        const createResult = await this.testCreateNotification();
        
        // 3. Test de marcar como leída
        if (createResult.success) {
            await this.testMarkAsRead(createResult.notificationId);
        }

        // 4. Test de notificaciones en lote
        const bulkResult = await this.testBulkNotifications();

        // 5. Test de eliminación
        if (createResult.success) {
            await this.testDeleteNotification(createResult.notificationId);
        }

        // Limpiar notificaciones de prueba en lote
        if (bulkResult.success && bulkResult.notificationIds) {
            for (const id of bulkResult.notificationIds) {
                await this.testDeleteNotification(id);
            }
        }

        // 6. Cleanup
        await this.cleanup();

        this.log('🏁 Tests de Real-time Notifications completados');
        return this.generateReport();
    }

    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            totalTests: this.testResults.length,
            successCount: this.testResults.filter(r => r.type === 'success').length,
            errorCount: this.testResults.filter(r => r.type === 'error').length,
            warningCount: this.testResults.filter(r => r.type === 'warning').length,
            realtimeEventsReceived: this.receivedUpdates.length,
            events: this.receivedUpdates,
            logs: this.testResults
        };

        console.log('\n📊 REPORTE DE TESTING REAL-TIME NOTIFICATIONS:');
        console.log('===============================================');
        console.log(`Total de logs: ${report.totalTests}`);
        console.log(`Éxitos: ${report.successCount}`);
        console.log(`Errores: ${report.errorCount}`);
        console.log(`Advertencias: ${report.warningCount}`);
        console.log(`Eventos real-time recibidos: ${report.realtimeEventsReceived}`);
        
        return report;
    }
}

// Ejecutar tests si se llama directamente
if (require.main === module) {
    const tester = new RealtimeNotificationsTest();
    tester.runAllTests()
        .then(report => {
            console.log('\n✅ Testing completado');
            process.exit(report.errorCount > 0 ? 1 : 0);
        })
        .catch(error => {
            console.error('❌ Error ejecutando tests:', error);
            process.exit(1);
        });
}

module.exports = RealtimeNotificationsTest;