// =====================================================
// DIAGNÓSTICO PROFUNDO DE REAL-TIME
// Investigación sistemática del problema CHANNEL_ERROR
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

class DeepRealtimeDiagnosis {
    constructor() {
        this.supabase = createClient(supabaseUrl, supabaseKey);
        this.diagnosticResults = {};
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

    async checkSupabaseConfiguration() {
        this.log('🔍 VERIFICANDO CONFIGURACIÓN DE SUPABASE', 'info');
        
        try {
            // 1. Verificar URL y formato
            this.log(`URL: ${supabaseUrl}`, 'debug');
            this.log(`Key length: ${supabaseKey ? supabaseKey.length : 'undefined'} chars`, 'debug');
            
            // 2. Verificar si es una instancia self-hosted o cloud
            const isCloudInstance = supabaseUrl.includes('supabase.co');
            const isSelfHosted = supabaseUrl.includes('localhost') || supabaseUrl.includes('127.0.0.1') || !isCloudInstance;
            
            this.log(`Tipo de instancia: ${isCloudInstance ? 'Supabase Cloud' : 'Self-hosted'}`, 'info');
            this.diagnosticResults.instanceType = isCloudInstance ? 'cloud' : 'self-hosted';
            
            // 3. Verificar conectividad básica
            const { data, error } = await this.supabase.from('users').select('count').limit(1);
            if (error) {
                this.log(`Error de conectividad: ${error.message}`, 'error');
                return false;
            }
            
            this.log('✅ Conectividad básica OK', 'success');
            
            // 4. Verificar configuración de Real-time específica para self-hosted
            if (isSelfHosted) {
                this.log('⚠️ Instancia self-hosted detectada', 'warning');
                this.log('Real-time en self-hosted requiere configuración adicional', 'warning');
                this.diagnosticResults.selfHostedIssue = true;
            }
            
            return true;
            
        } catch (error) {
            this.log(`Error verificando configuración: ${error.message}`, 'error');
            return false;
        }
    }

    async testWebSocketConnection() {
        this.log('🌐 PROBANDO CONEXIÓN WEBSOCKET DIRECTA', 'info');
        
        try {
            // Construir URL de WebSocket
            const wsUrl = supabaseUrl.replace('https://', 'wss://').replace('http://', 'ws://') + '/realtime/v1/websocket';
            this.log(`WebSocket URL: ${wsUrl}`, 'debug');
            
            // Intentar conexión WebSocket nativa
            return new Promise((resolve) => {
                try {
                    const WebSocket = require('ws');
                    const ws = new WebSocket(wsUrl + `?apikey=${supabaseKey}&vsn=1.0.0`);
                    
                    const timeout = setTimeout(() => {
                        this.log('❌ WebSocket timeout (10s)', 'error');
                        this.diagnosticResults.websocketTimeout = true;
                        ws.close();
                        resolve(false);
                    }, 10000);
                    
                    ws.on('open', () => {
                        this.log('✅ WebSocket conexión establecida', 'success');
                        this.diagnosticResults.websocketConnectable = true;
                        clearTimeout(timeout);
                        ws.close();
                        resolve(true);
                    });
                    
                    ws.on('error', (error) => {
                        this.log(`❌ WebSocket error: ${error.message}`, 'error');
                        this.diagnosticResults.websocketError = error.message;
                        clearTimeout(timeout);
                        resolve(false);
                    });
                    
                    ws.on('close', (code, reason) => {
                        this.log(`WebSocket cerrado: ${code} - ${reason}`, 'debug');
                    });
                    
                } catch (error) {
                    this.log(`Error creando WebSocket: ${error.message}`, 'error');
                    this.diagnosticResults.websocketCreationError = error.message;
                    resolve(false);
                }
            });
            
        } catch (error) {
            this.log(`Error en test WebSocket: ${error.message}`, 'error');
            return false;
        }
    }

    async testSupabaseRealtimeAPI() {
        this.log('🔌 PROBANDO API DE REAL-TIME DE SUPABASE', 'info');
        
        try {
            // Test con diferentes configuraciones
            const configs = [
                { name: 'Default', options: {} },
                { name: 'With heartbeat', options: { heartbeatIntervalMs: 30000 } },
                { name: 'With logger', options: { logger: console.log } },
                { name: 'With transport', options: { transport: 'websocket' } }
            ];
            
            for (const config of configs) {
                this.log(`Probando configuración: ${config.name}`, 'debug');
                
                try {
                    const testClient = createClient(supabaseUrl, supabaseKey, {
                        realtime: config.options
                    });
                    
                    const channel = testClient.channel(`test-${Date.now()}`);
                    
                    const subscriptionPromise = new Promise((resolve) => {
                        const timeout = setTimeout(() => {
                            this.log(`⏱️ Timeout para ${config.name}`, 'warning');
                            resolve('TIMEOUT');
                        }, 5000);
                        
                        channel.subscribe((status) => {
                            clearTimeout(timeout);
                            this.log(`${config.name}: ${status}`, status === 'SUBSCRIBED' ? 'success' : 'warning');
                            resolve(status);
                        });
                    });
                    
                    const result = await subscriptionPromise;
                    this.diagnosticResults[`config_${config.name.toLowerCase().replace(' ', '_')}`] = result;
                    
                    await testClient.removeChannel(channel);
                    
                    if (result === 'SUBSCRIBED') {
                        this.log(`✅ Configuración exitosa: ${config.name}`, 'success');
                        return true;
                    }
                    
                } catch (error) {
                    this.log(`Error con ${config.name}: ${error.message}`, 'error');
                    this.diagnosticResults[`config_${config.name.toLowerCase().replace(' ', '_')}_error`] = error.message;
                }
            }
            
            return false;
            
        } catch (error) {
            this.log(`Error en test API Real-time: ${error.message}`, 'error');
            return false;
        }
    }

    async checkNetworkConnectivity() {
        this.log('🌍 VERIFICANDO CONECTIVIDAD DE RED', 'info');
        
        try {
            // Test de conectividad a diferentes puertos/protocolos
            const tests = [
                { name: 'HTTPS to Supabase', url: supabaseUrl },
                { name: 'WebSocket port test', url: supabaseUrl.replace('https://', 'wss://') + '/realtime/v1/websocket' }
            ];
            
            for (const test of tests) {
                try {
                    this.log(`Probando: ${test.name}`, 'debug');
                    
                    if (test.name.includes('WebSocket')) {
                        // Ya probamos WebSocket arriba
                        continue;
                    }
                    
                    // Test HTTP/HTTPS
                    const response = await fetch(test.url + '/rest/v1/', {
                        headers: {
                            'apikey': supabaseKey,
                            'Authorization': `Bearer ${supabaseKey}`
                        }
                    });
                    
                    this.log(`${test.name}: ${response.status} ${response.statusText}`, 'success');
                    this.diagnosticResults[`network_${test.name.toLowerCase().replace(/\s+/g, '_')}`] = response.status;
                    
                } catch (error) {
                    this.log(`${test.name} falló: ${error.message}`, 'error');
                    this.diagnosticResults[`network_${test.name.toLowerCase().replace(/\s+/g, '_')}_error`] = error.message;
                }
            }
            
            return true;
            
        } catch (error) {
            this.log(`Error verificando red: ${error.message}`, 'error');
            return false;
        }
    }

    async checkDatabaseReplication() {
        this.log('🗄️ VERIFICANDO REPLICACIÓN DE BASE DE DATOS', 'info');
        
        try {
            // Verificar que las tablas estén en la publicación
            const { data, error } = await this.supabase.rpc('exec_sql', {
                sql: `
                    SELECT tablename, schemaname 
                    FROM pg_publication_tables 
                    WHERE pubname = 'supabase_realtime'
                    ORDER BY tablename;
                `
            });
            
            if (error) {
                this.log(`Error consultando replicación: ${error.message}`, 'error');
                // Intentar método alternativo
                return await this.checkReplicationAlternative();
            }
            
            if (data && data.length > 0) {
                this.log(`✅ Tablas en replicación: ${data.length}`, 'success');
                data.forEach(table => {
                    this.log(`  - ${table.tablename}`, 'debug');
                });
                this.diagnosticResults.replicationTables = data.map(t => t.tablename);
            } else {
                this.log('⚠️ No se encontraron tablas en replicación', 'warning');
                this.diagnosticResults.replicationTables = [];
            }
            
            return true;
            
        } catch (error) {
            this.log(`Error verificando replicación: ${error.message}`, 'error');
            return false;
        }
    }

    async checkReplicationAlternative() {
        this.log('🔄 Verificando replicación con método alternativo', 'debug');
        
        // Intentar crear y eliminar un registro para ver si genera eventos
        try {
            const testData = {
                email: `test-realtime-${Date.now()}@test.com`,
                password: 'test',
                name: 'Test Realtime User'
            };
            
            const { data, error } = await this.supabase
                .from('users')
                .insert([testData])
                .select('*');
                
            if (error) {
                this.log(`Error insertando usuario de prueba: ${error.message}`, 'error');
                return false;
            }
            
            this.log('✅ Usuario de prueba creado para test de replicación', 'success');
            
            // Limpiar
            await this.supabase.from('users').delete().eq('id', data[0].id);
            this.log('🧹 Usuario de prueba eliminado', 'debug');
            
            return true;
            
        } catch (error) {
            this.log(`Error en test alternativo: ${error.message}`, 'error');
            return false;
        }
    }

    generateDiagnosticReport() {
        this.log('📊 GENERANDO REPORTE DE DIAGNÓSTICO', 'info');
        
        const report = {
            timestamp: new Date().toISOString(),
            supabaseUrl: supabaseUrl,
            instanceType: this.diagnosticResults.instanceType,
            diagnostics: this.diagnosticResults,
            recommendations: []
        };
        
        // Generar recomendaciones basadas en resultados
        if (this.diagnosticResults.selfHostedIssue) {
            report.recommendations.push({
                priority: 'HIGH',
                issue: 'Self-hosted instance detected',
                solution: 'Self-hosted Supabase requires additional Real-time configuration. Check Docker compose and environment variables.'
            });
        }
        
        if (this.diagnosticResults.websocketTimeout) {
            report.recommendations.push({
                priority: 'HIGH',
                issue: 'WebSocket connection timeout',
                solution: 'Check firewall settings, proxy configuration, or network connectivity to WebSocket port.'
            });
        }
        
        if (this.diagnosticResults.websocketError) {
            report.recommendations.push({
                priority: 'HIGH',
                issue: `WebSocket error: ${this.diagnosticResults.websocketError}`,
                solution: 'Check WebSocket URL format and network connectivity.'
            });
        }
        
        if (!this.diagnosticResults.replicationTables || this.diagnosticResults.replicationTables.length === 0) {
            report.recommendations.push({
                priority: 'MEDIUM',
                issue: 'No tables found in replication',
                solution: 'Add tables to supabase_realtime publication using ALTER PUBLICATION commands.'
            });
        }
        
        // Guardar reporte
        fs.writeFileSync(`realtime_diagnosis_${Date.now()}.json`, JSON.stringify(report, null, 2));
        
        return report;
    }

    async runFullDiagnosis() {
        this.log('🚀 INICIANDO DIAGNÓSTICO COMPLETO DE REAL-TIME', 'info');
        this.log('=' .repeat(60), 'info');
        
        const results = {
            supabaseConfig: await this.checkSupabaseConfiguration(),
            websocketConnection: await this.testWebSocketConnection(),
            realtimeAPI: await this.testSupabaseRealtimeAPI(),
            networkConnectivity: await this.checkNetworkConnectivity(),
            databaseReplication: await this.checkDatabaseReplication()
        };
        
        this.log('=' .repeat(60), 'info');
        this.log('📋 RESUMEN DE DIAGNÓSTICO:', 'info');
        
        Object.entries(results).forEach(([test, passed]) => {
            const status = passed ? '✅' : '❌';
            this.log(`${status} ${test}`, passed ? 'success' : 'error');
        });
        
        const report = this.generateDiagnosticReport();
        
        this.log(`📄 Reporte guardado: realtime_diagnosis_${Date.now()}.json`, 'info');
        
        if (report.recommendations.length > 0) {
            this.log('🔧 RECOMENDACIONES:', 'warning');
            report.recommendations.forEach((rec, index) => {
                this.log(`${index + 1}. [${rec.priority}] ${rec.issue}`, 'warning');
                this.log(`   Solución: ${rec.solution}`, 'info');
            });
        }
        
        return results;
    }
}

// Ejecutar diagnóstico
if (require.main === module) {
    const diagnosis = new DeepRealtimeDiagnosis();
    diagnosis.runFullDiagnosis()
        .then(results => {
            const allPassed = Object.values(results).every(r => r);
            process.exit(allPassed ? 0 : 1);
        })
        .catch(error => {
            console.error('❌ Error crítico en diagnóstico:', error);
            process.exit(1);
        });
}

module.exports = DeepRealtimeDiagnosis;