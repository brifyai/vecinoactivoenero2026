// =====================================================
// SCRIPT MAESTRO PARA TESTING REAL-TIME COMPLETO
// =====================================================

const RealtimePostsTest = require('./test_realtime_posts');
const RealtimeNotificationsTest = require('./test_realtime_notifications');
const RealtimeMessagesTest = require('./test_realtime_messages');

class MasterRealtimeTest {
    constructor() {
        this.results = {
            posts: null,
            notifications: null,
            messages: null,
            summary: {
                totalTests: 0,
                totalSuccess: 0,
                totalErrors: 0,
                totalWarnings: 0,
                totalRealtimeEvents: 0
            }
        };
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const colors = {
            info: '\x1b[36m',    // Cyan
            success: '\x1b[32m', // Green
            warning: '\x1b[33m', // Yellow
            error: '\x1b[31m',   // Red
            reset: '\x1b[0m'     // Reset
        };
        
        console.log(`${colors[type]}[${timestamp}] ${type.toUpperCase()}: ${message}${colors.reset}`);
    }

    async runPostsTests() {
        this.log('🚀 Ejecutando tests de Real-time Posts...', 'info');
        try {
            const tester = new RealtimePostsTest();
            this.results.posts = await tester.runAllTests();
            
            if (this.results.posts.errorCount === 0) {
                this.log('✅ Tests de Posts completados exitosamente', 'success');
            } else {
                this.log(`⚠️ Tests de Posts completados con ${this.results.posts.errorCount} errores`, 'warning');
            }
            
            return true;
        } catch (error) {
            this.log(`❌ Error ejecutando tests de Posts: ${error.message}`, 'error');
            return false;
        }
    }

    async runNotificationsTests() {
        this.log('🚀 Ejecutando tests de Real-time Notifications...', 'info');
        try {
            const tester = new RealtimeNotificationsTest();
            this.results.notifications = await tester.runAllTests();
            
            if (this.results.notifications.errorCount === 0) {
                this.log('✅ Tests de Notifications completados exitosamente', 'success');
            } else {
                this.log(`⚠️ Tests de Notifications completados con ${this.results.notifications.errorCount} errores`, 'warning');
            }
            
            return true;
        } catch (error) {
            this.log(`❌ Error ejecutando tests de Notifications: ${error.message}`, 'error');
            return false;
        }
    }

    async runMessagesTests() {
        this.log('🚀 Ejecutando tests de Real-time Messages...', 'info');
        try {
            const tester = new RealtimeMessagesTest();
            this.results.messages = await tester.runAllTests();
            
            if (this.results.messages.errorCount === 0) {
                this.log('✅ Tests de Messages completados exitosamente', 'success');
            } else {
                this.log(`⚠️ Tests de Messages completados con ${this.results.messages.errorCount} errores`, 'warning');
            }
            
            return true;
        } catch (error) {
            this.log(`❌ Error ejecutando tests de Messages: ${error.message}`, 'error');
            return false;
        }
    }

    calculateSummary() {
        const results = [this.results.posts, this.results.notifications, this.results.messages];
        
        for (const result of results) {
            if (result) {
                this.results.summary.totalTests += result.totalTests;
                this.results.summary.totalSuccess += result.successCount;
                this.results.summary.totalErrors += result.errorCount;
                this.results.summary.totalWarnings += result.warningCount;
                this.results.summary.totalRealtimeEvents += result.realtimeEventsReceived;
            }
        }
    }

    generateFinalReport() {
        this.calculateSummary();
        
        console.log('\n' + '='.repeat(60));
        console.log('📊 REPORTE FINAL DE TESTING REAL-TIME');
        console.log('='.repeat(60));
        
        // Resumen general
        console.log('\n🎯 RESUMEN GENERAL:');
        console.log(`   Total de logs: ${this.results.summary.totalTests}`);
        console.log(`   Éxitos: ${this.results.summary.totalSuccess}`);
        console.log(`   Errores: ${this.results.summary.totalErrors}`);
        console.log(`   Advertencias: ${this.results.summary.totalWarnings}`);
        console.log(`   Eventos real-time recibidos: ${this.results.summary.totalRealtimeEvents}`);
        
        // Detalles por módulo
        console.log('\n📋 DETALLES POR MÓDULO:');
        
        if (this.results.posts) {
            console.log(`\n   📝 POSTS:`);
            console.log(`      Éxitos: ${this.results.posts.successCount}`);
            console.log(`      Errores: ${this.results.posts.errorCount}`);
            console.log(`      Eventos RT: ${this.results.posts.realtimeEventsReceived}`);
        }
        
        if (this.results.notifications) {
            console.log(`\n   🔔 NOTIFICATIONS:`);
            console.log(`      Éxitos: ${this.results.notifications.successCount}`);
            console.log(`      Errores: ${this.results.notifications.errorCount}`);
            console.log(`      Eventos RT: ${this.results.notifications.realtimeEventsReceived}`);
        }
        
        if (this.results.messages) {
            console.log(`\n   💬 MESSAGES:`);
            console.log(`      Éxitos: ${this.results.messages.successCount}`);
            console.log(`      Errores: ${this.results.messages.errorCount}`);
            console.log(`      Eventos RT: ${this.results.messages.realtimeEventsReceived}`);
            console.log(`      Eventos mensajes: ${this.results.messages.messageEvents}`);
            console.log(`      Eventos conversaciones: ${this.results.messages.conversationEvents}`);
        }
        
        // Estado final
        console.log('\n🏆 ESTADO FINAL:');
        if (this.results.summary.totalErrors === 0) {
            console.log('   ✅ TODOS LOS TESTS PASARON EXITOSAMENTE');
        } else if (this.results.summary.totalErrors < this.results.summary.totalSuccess) {
            console.log('   ⚠️ TESTS COMPLETADOS CON ALGUNOS ERRORES');
        } else {
            console.log('   ❌ TESTS FALLARON - REVISAR CONFIGURACIÓN');
        }
        
        console.log('\n' + '='.repeat(60));
        
        return this.results.summary.totalErrors === 0;
    }

    async saveReportToFile() {
        const fs = require('fs').promises;
        const reportData = {
            timestamp: new Date().toISOString(),
            summary: this.results.summary,
            details: {
                posts: this.results.posts,
                notifications: this.results.notifications,
                messages: this.results.messages
            }
        };
        
        try {
            await fs.writeFile(
                `realtime_test_report_${Date.now()}.json`, 
                JSON.stringify(reportData, null, 2)
            );
            this.log('📄 Reporte guardado en archivo JSON', 'success');
        } catch (error) {
            this.log(`Error guardando reporte: ${error.message}`, 'error');
        }
    }

    async runAllTests() {
        this.log('🎬 INICIANDO TESTING COMPLETO DE FUNCIONALIDAD REAL-TIME', 'info');
        this.log('================================================================', 'info');
        
        const startTime = Date.now();
        
        // Ejecutar tests en secuencia para evitar conflictos
        const postsOk = await this.runPostsTests();
        
        // Pequeña pausa entre tests
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const notificationsOk = await this.runNotificationsTests();
        
        // Pequeña pausa entre tests
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const messagesOk = await this.runMessagesTests();
        
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;
        
        this.log(`⏱️ Testing completado en ${duration.toFixed(2)} segundos`, 'info');
        
        // Generar reporte final
        const allTestsPassed = this.generateFinalReport();
        
        // Guardar reporte en archivo
        await this.saveReportToFile();
        
        return allTestsPassed;
    }
}

// Función de utilidad para verificar configuración
async function checkConfiguration() {
    console.log('🔍 Verificando configuración...');
    
    // Cargar variables de entorno manualmente
    try {
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
        
        // Establecer variables de entorno
        Object.assign(process.env, envVars);
        
        console.log('✅ Variables de entorno cargadas desde .env');
    } catch (error) {
        console.log('⚠️ No se pudo cargar .env:', error.message);
    }
    
    const requiredEnvVars = [
        'REACT_APP_SUPABASE_URL',
        'REACT_APP_SUPABASE_ANON_KEY'
    ];
    
    const missing = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
        console.log('⚠️ Variables de entorno faltantes:');
        missing.forEach(varName => console.log(`   - ${varName}`));
        console.log('\n💡 Asegúrate de tener un archivo .env con las credenciales de Supabase');
        return false;
    }
    
    console.log('✅ Configuración verificada');
    console.log(`   SUPABASE_URL: ${process.env.REACT_APP_SUPABASE_URL}`);
    console.log(`   SUPABASE_KEY: ${process.env.REACT_APP_SUPABASE_ANON_KEY ? 'Configurada' : 'Faltante'}`);
    return true;
}

// Ejecutar tests si se llama directamente
if (require.main === module) {
    (async () => {
        try {
            // Verificar configuración
            const configOk = await checkConfiguration();
            if (!configOk) {
                process.exit(1);
            }
            
            // Ejecutar tests
            const masterTest = new MasterRealtimeTest();
            const success = await masterTest.runAllTests();
            
            process.exit(success ? 0 : 1);
            
        } catch (error) {
            console.error('❌ Error crítico ejecutando tests:', error);
            process.exit(1);
        }
    })();
}

module.exports = MasterRealtimeTest;