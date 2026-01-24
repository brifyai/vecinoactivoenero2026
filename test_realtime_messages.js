// =====================================================
// TESTING REAL-TIME MESSAGES FUNCTIONALITY
// =====================================================

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

class RealtimeMessagesTest {
    constructor() {
        this.testResults = [];
        this.messagesSubscription = null;
        this.conversationsSubscription = null;
        this.receivedUpdates = [];
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const logEntry = { timestamp, message, type };
        console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
        this.testResults.push(logEntry);
    }

    async setupRealtimeSubscriptions() {
        this.log('Configurando suscripciones real-time para messages y conversations...');
        
        try {
            // Suscripción para messages
            this.messagesSubscription = supabase
                .channel('messages-realtime-test')
                .on('postgres_changes', 
                    { 
                        event: '*', 
                        schema: 'public', 
                        table: 'messages' 
                    }, 
                    (payload) => {
                        this.log(`Evento real-time MESSAGES recibido: ${payload.eventType}`, 'success');
                        this.log(`Datos: ${JSON.stringify(payload.new || payload.old)}`, 'info');
                        this.receivedUpdates.push({
                            table: 'messages',
                            eventType: payload.eventType,
                            timestamp: new Date().toISOString(),
                            data: payload.new || payload.old
                        });
                    }
                )
                .subscribe((status) => {
                    this.log(`Estado suscripción MESSAGES: ${status}`, status === 'SUBSCRIBED' ? 'success' : 'warning');
                });

            // Suscripción para conversations
            this.conversationsSubscription = supabase
                .channel('conversations-realtime-test')
                .on('postgres_changes', 
                    { 
                        event: '*', 
                        schema: 'public', 
                        table: 'conversations' 
                    }, 
                    (payload) => {
                        this.log(`Evento real-time CONVERSATIONS recibido: ${payload.eventType}`, 'success');
                        this.log(`Datos: ${JSON.stringify(payload.new || payload.old)}`, 'info');
                        this.receivedUpdates.push({
                            table: 'conversations',
                            eventType: payload.eventType,
                            timestamp: new Date().toISOString(),
                            data: payload.new || payload.old
                        });
                    }
                )
                .subscribe((status) => {
                    this.log(`Estado suscripción CONVERSATIONS: ${status}`, status === 'SUBSCRIBED' ? 'success' : 'warning');
                });

            await new Promise(resolve => setTimeout(resolve, 3000));
            return true;
        } catch (error) {
            this.log(`Error configurando suscripciones: ${error.message}`, 'error');
            return false;
        }
    }

    async testCreateConversation() {
        this.log('Iniciando test de creación de conversación...');
        
        try {
            // Obtener dos usuarios diferentes para la conversación
            const { data: users, error: userError } = await supabase
                .from('users')
                .select('id')
                .limit(2);
            
            if (userError || !users || users.length < 2) {
                throw new Error('Se necesitan al menos 2 usuarios para crear una conversación');
            }

            const testConversation = {
                participant1_id: users[0].id,
                participant2_id: users[1].id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('conversations')
                .insert([testConversation])
                .select('*');

            if (error) {
                throw error;
            }

            this.log(`Conversación creada exitosamente: ID ${data[0].id}`, 'success');
            
            // Esperar evento real-time
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            const insertEvent = this.receivedUpdates.find(
                update => update.table === 'conversations' &&
                         update.eventType === 'INSERT' && 
                         update.data.id === data[0].id
            );
            
            if (insertEvent) {
                this.log('✅ Evento INSERT real-time para conversación recibido correctamente', 'success');
                return { success: true, conversationId: data[0].id, users: users };
            } else {
                this.log('❌ No se recibió el evento INSERT real-time para conversación', 'error');
                return { success: false, conversationId: data[0].id, users: users };
            }

        } catch (error) {
            this.log(`Error creando conversación: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }

    async testSendMessage(conversationId, senderId) {
        this.log(`Iniciando test de envío de mensaje en conversación ID: ${conversationId}...`);
        
        try {
            const testMessage = {
                conversation_id: conversationId,
                sender_id: senderId,
                content: `Test message real-time - ${Date.now()}`,
                message_type: 'text',
                created_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('messages')
                .insert([testMessage])
                .select('*');

            if (error) {
                throw error;
            }

            this.log(`Mensaje enviado exitosamente: ID ${data[0].id}`, 'success');
            
            // Esperar evento real-time
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            const insertEvent = this.receivedUpdates.find(
                update => update.table === 'messages' &&
                         update.eventType === 'INSERT' && 
                         update.data.id === data[0].id
            );
            
            if (insertEvent) {
                this.log('✅ Evento INSERT real-time para mensaje recibido correctamente', 'success');
                return { success: true, messageId: data[0].id };
            } else {
                this.log('❌ No se recibió el evento INSERT real-time para mensaje', 'error');
                return { success: false, messageId: data[0].id };
            }

        } catch (error) {
            this.log(`Error enviando mensaje: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }

    async testUpdateMessage(messageId) {
        this.log(`Iniciando test de actualización de mensaje ID: ${messageId}...`);
        
        try {
            const updatedContent = `Mensaje editado - ${Date.now()}`;
            
            const { data, error } = await supabase
                .from('messages')
                .update({ 
                    content: updatedContent,
                    edited: true,
                    edited_at: new Date().toISOString()
                })
                .eq('id', messageId)
                .select('*');

            if (error) {
                throw error;
            }

            this.log(`Mensaje actualizado exitosamente`, 'success');
            
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            const updateEvent = this.receivedUpdates.find(
                update => update.table === 'messages' &&
                         update.eventType === 'UPDATE' && 
                         update.data.id === messageId
            );
            
            if (updateEvent) {
                this.log('✅ Evento UPDATE real-time para mensaje recibido correctamente', 'success');
                return { success: true };
            } else {
                this.log('❌ No se recibió el evento UPDATE real-time para mensaje', 'error');
                return { success: false };
            }

        } catch (error) {
            this.log(`Error actualizando mensaje: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }

    async testMessageSequence(conversationId, users) {
        this.log('Iniciando test de secuencia de mensajes...');
        
        try {
            const messages = [
                {
                    conversation_id: conversationId,
                    sender_id: users[0].id,
                    content: 'Hola, ¿cómo estás?',
                    message_type: 'text'
                },
                {
                    conversation_id: conversationId,
                    sender_id: users[1].id,
                    content: '¡Hola! Todo bien, ¿y tú?',
                    message_type: 'text'
                },
                {
                    conversation_id: conversationId,
                    sender_id: users[0].id,
                    content: 'Muy bien también, gracias por preguntar',
                    message_type: 'text'
                }
            ];

            const messageIds = [];
            
            for (let i = 0; i < messages.length; i++) {
                const { data, error } = await supabase
                    .from('messages')
                    .insert([messages[i]])
                    .select('*');

                if (error) {
                    throw error;
                }

                messageIds.push(data[0].id);
                this.log(`Mensaje ${i + 1}/3 enviado: ID ${data[0].id}`, 'success');
                
                // Pequeña pausa entre mensajes
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            // Esperar eventos real-time
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            const messageEvents = this.receivedUpdates.filter(
                update => update.table === 'messages' &&
                         update.eventType === 'INSERT' && 
                         messageIds.includes(update.data.id)
            );
            
            if (messageEvents.length === messages.length) {
                this.log(`✅ Todos los eventos real-time de secuencia recibidos (${messageEvents.length}/${messages.length})`, 'success');
                return { success: true, messageIds: messageIds };
            } else {
                this.log(`⚠️ Solo se recibieron ${messageEvents.length}/${messages.length} eventos real-time de secuencia`, 'warning');
                return { success: false, messageIds: messageIds };
            }

        } catch (error) {
            this.log(`Error en secuencia de mensajes: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }

    async testDeleteMessage(messageId) {
        this.log(`Iniciando test de eliminación de mensaje ID: ${messageId}...`);
        
        try {
            const { error } = await supabase
                .from('messages')
                .delete()
                .eq('id', messageId);

            if (error) {
                throw error;
            }

            this.log(`Mensaje eliminado exitosamente`, 'success');
            
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            const deleteEvent = this.receivedUpdates.find(
                update => update.table === 'messages' &&
                         update.eventType === 'DELETE' && 
                         update.data.id === messageId
            );
            
            if (deleteEvent) {
                this.log('✅ Evento DELETE real-time para mensaje recibido correctamente', 'success');
                return { success: true };
            } else {
                this.log('❌ No se recibió el evento DELETE real-time para mensaje', 'error');
                return { success: false };
            }

        } catch (error) {
            this.log(`Error eliminando mensaje: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }

    async cleanup() {
        this.log('Limpiando suscripciones...');
        if (this.messagesSubscription) {
            await supabase.removeChannel(this.messagesSubscription);
        }
        if (this.conversationsSubscription) {
            await supabase.removeChannel(this.conversationsSubscription);
        }
    }

    async runAllTests() {
        this.log('🚀 Iniciando tests de Real-time Messages');
        
        // 1. Configurar suscripciones
        const subscriptionsOk = await this.setupRealtimeSubscriptions();
        if (!subscriptionsOk) {
            this.log('❌ Falló la configuración de suscripciones real-time', 'error');
            return this.generateReport();
        }

        // 2. Test de creación de conversación
        const conversationResult = await this.testCreateConversation();
        if (!conversationResult.success) {
            this.log('❌ Falló el test de creación de conversación', 'error');
            await this.cleanup();
            return this.generateReport();
        }

        // 3. Test de envío de mensaje
        const messageResult = await this.testSendMessage(
            conversationResult.conversationId, 
            conversationResult.users[0].id
        );

        // 4. Test de actualización de mensaje
        if (messageResult.success) {
            await this.testUpdateMessage(messageResult.messageId);
        }

        // 5. Test de secuencia de mensajes
        const sequenceResult = await this.testMessageSequence(
            conversationResult.conversationId,
            conversationResult.users
        );

        // 6. Test de eliminación de mensajes
        if (messageResult.success) {
            await this.testDeleteMessage(messageResult.messageId);
        }

        // Limpiar mensajes de secuencia
        if (sequenceResult.success && sequenceResult.messageIds) {
            for (const id of sequenceResult.messageIds) {
                await this.testDeleteMessage(id);
            }
        }

        // 7. Limpiar conversación de prueba
        if (conversationResult.success) {
            await supabase
                .from('conversations')
                .delete()
                .eq('id', conversationResult.conversationId);
        }

        // 8. Cleanup
        await this.cleanup();

        this.log('🏁 Tests de Real-time Messages completados');
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
            messageEvents: this.receivedUpdates.filter(u => u.table === 'messages').length,
            conversationEvents: this.receivedUpdates.filter(u => u.table === 'conversations').length,
            events: this.receivedUpdates,
            logs: this.testResults
        };

        console.log('\n📊 REPORTE DE TESTING REAL-TIME MESSAGES:');
        console.log('==========================================');
        console.log(`Total de logs: ${report.totalTests}`);
        console.log(`Éxitos: ${report.successCount}`);
        console.log(`Errores: ${report.errorCount}`);
        console.log(`Advertencias: ${report.warningCount}`);
        console.log(`Eventos real-time recibidos: ${report.realtimeEventsReceived}`);
        console.log(`  - Eventos de mensajes: ${report.messageEvents}`);
        console.log(`  - Eventos de conversaciones: ${report.conversationEvents}`);
        
        return report;
    }
}

// Ejecutar tests si se llama directamente
if (require.main === module) {
    const tester = new RealtimeMessagesTest();
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

module.exports = RealtimeMessagesTest;