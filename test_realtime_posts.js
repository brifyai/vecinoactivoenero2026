// =====================================================
// TESTING REAL-TIME POSTS FUNCTIONALITY
// =====================================================

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase (usar variables de entorno)
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

class RealtimePostsTest {
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
        this.log('Configurando suscripción real-time para posts...');
        
        try {
            this.subscription = supabase
                .channel('posts-realtime-test')
                .on('postgres_changes', 
                    { 
                        event: '*', 
                        schema: 'public', 
                        table: 'posts' 
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

            // Esperar un momento para que se establezca la conexión
            await new Promise(resolve => setTimeout(resolve, 2000));
            return true;
        } catch (error) {
            this.log(`Error configurando suscripción: ${error.message}`, 'error');
            return false;
        }
    }

    async testCreatePost() {
        this.log('Iniciando test de creación de post...');
        
        try {
            const testPost = {
                content: `Test post real-time - ${Date.now()}`,
                type: 'text',
                neighborhood_id: 1,
                user_id: null // Se asignará automáticamente si hay usuario autenticado
            };

            // Primero verificar si hay un usuario autenticado
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                testPost.user_id = user.id;
                this.log(`Usuario autenticado encontrado: ${user.email}`);
            } else {
                this.log('No hay usuario autenticado, usando usuario de prueba');
                // Obtener un usuario existente para la prueba
                const { data: users, error: userError } = await supabase
                    .from('users')
                    .select('id')
                    .limit(1);
                
                if (userError || !users || users.length === 0) {
                    throw new Error('No se encontraron usuarios para la prueba');
                }
                testPost.user_id = users[0].id;
            }

            const { data, error } = await supabase
                .from('posts')
                .insert([testPost])
                .select('*');

            if (error) {
                throw error;
            }

            this.log(`Post creado exitosamente: ID ${data[0].id}`, 'success');
            
            // Esperar un momento para recibir el evento real-time
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Verificar si recibimos el evento
            const insertEvent = this.receivedUpdates.find(
                update => update.eventType === 'INSERT' && 
                         update.data.id === data[0].id
            );
            
            if (insertEvent) {
                this.log('✅ Evento INSERT real-time recibido correctamente', 'success');
                return { success: true, postId: data[0].id };
            } else {
                this.log('❌ No se recibió el evento INSERT real-time', 'error');
                return { success: false, postId: data[0].id };
            }

        } catch (error) {
            this.log(`Error creando post: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }

    async testUpdatePost(postId) {
        this.log(`Iniciando test de actualización de post ID: ${postId}...`);
        
        try {
            const updatedContent = `Post actualizado - ${Date.now()}`;
            
            const { data, error } = await supabase
                .from('posts')
                .update({ content: updatedContent })
                .eq('id', postId)
                .select('*');

            if (error) {
                throw error;
            }

            this.log(`Post actualizado exitosamente`, 'success');
            
            // Esperar un momento para recibir el evento real-time
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Verificar si recibimos el evento
            const updateEvent = this.receivedUpdates.find(
                update => update.eventType === 'UPDATE' && 
                         update.data.id === postId
            );
            
            if (updateEvent) {
                this.log('✅ Evento UPDATE real-time recibido correctamente', 'success');
                return { success: true };
            } else {
                this.log('❌ No se recibió el evento UPDATE real-time', 'error');
                return { success: false };
            }

        } catch (error) {
            this.log(`Error actualizando post: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }

    async testDeletePost(postId) {
        this.log(`Iniciando test de eliminación de post ID: ${postId}...`);
        
        try {
            const { error } = await supabase
                .from('posts')
                .delete()
                .eq('id', postId);

            if (error) {
                throw error;
            }

            this.log(`Post eliminado exitosamente`, 'success');
            
            // Esperar un momento para recibir el evento real-time
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Verificar si recibimos el evento
            const deleteEvent = this.receivedUpdates.find(
                update => update.eventType === 'DELETE' && 
                         update.data.id === postId
            );
            
            if (deleteEvent) {
                this.log('✅ Evento DELETE real-time recibido correctamente', 'success');
                return { success: true };
            } else {
                this.log('❌ No se recibió el evento DELETE real-time', 'error');
                return { success: false };
            }

        } catch (error) {
            this.log(`Error eliminando post: ${error.message}`, 'error');
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
        this.log('🚀 Iniciando tests de Real-time Posts');
        
        // 1. Configurar suscripción
        const subscriptionOk = await this.setupRealtimeSubscription();
        if (!subscriptionOk) {
            this.log('❌ Falló la configuración de suscripción real-time', 'error');
            return this.generateReport();
        }

        // 2. Test de creación
        const createResult = await this.testCreatePost();
        if (!createResult.success) {
            this.log('❌ Falló el test de creación de post', 'error');
            await this.cleanup();
            return this.generateReport();
        }

        // 3. Test de actualización
        const updateResult = await this.testUpdatePost(createResult.postId);
        
        // 4. Test de eliminación
        const deleteResult = await this.testDeletePost(createResult.postId);

        // 5. Cleanup
        await this.cleanup();

        this.log('🏁 Tests de Real-time Posts completados');
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

        console.log('\n📊 REPORTE DE TESTING REAL-TIME POSTS:');
        console.log('=====================================');
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
    const tester = new RealtimePostsTest();
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

module.exports = RealtimePostsTest;