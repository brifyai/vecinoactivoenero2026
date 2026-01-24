// =====================================================
// CONFIGURACIÓN RÁPIDA PARA TESTING REAL-TIME
// =====================================================

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;

class RealtimeTestSetup {
    constructor() {
        this.supabase = null;
    }

    async loadEnvironment() {
        try {
            // Intentar cargar variables de entorno desde .env
            const envContent = await fs.readFile('.env', 'utf8');
            const envVars = {};
            
            envContent.split('\n').forEach(line => {
                // Ignorar líneas vacías y comentarios
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
            console.log(`   SUPABASE_URL: ${process.env.REACT_APP_SUPABASE_URL ? '✅' : '❌'}`);
            console.log(`   SUPABASE_KEY: ${process.env.REACT_APP_SUPABASE_ANON_KEY ? '✅' : '❌'}`);
            return true;
        } catch (error) {
            console.log('⚠️ No se pudo cargar .env, usando variables del sistema');
            return false;
        }
    }

    async initializeSupabase() {
        const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
        const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Faltan credenciales de Supabase en variables de entorno');
        }
        
        this.supabase = createClient(supabaseUrl, supabaseKey);
        console.log('✅ Cliente Supabase inicializado');
        
        // Verificar conexión
        const { data, error } = await this.supabase
            .from('users')
            .select('count')
            .limit(1);
            
        if (error) {
            throw new Error(`Error conectando a Supabase: ${error.message}`);
        }
        
        console.log('✅ Conexión a Supabase verificada');
        return true;
    }

    async checkTables() {
        console.log('🔍 Verificando tablas necesarias...');
        
        const requiredTables = ['users', 'posts', 'notifications', 'messages', 'conversations'];
        const results = {};
        
        for (const table of requiredTables) {
            try {
                const { data, error } = await this.supabase
                    .from(table)
                    .select('*')
                    .limit(1);
                
                if (error) {
                    results[table] = { exists: false, error: error.message };
                } else {
                    results[table] = { exists: true, hasData: data && data.length > 0 };
                }
            } catch (error) {
                results[table] = { exists: false, error: error.message };
            }
        }
        
        // Mostrar resultados
        for (const [table, result] of Object.entries(results)) {
            if (result.exists) {
                const dataStatus = result.hasData ? '(con datos)' : '(vacía)';
                console.log(`   ✅ ${table} ${dataStatus}`);
            } else {
                console.log(`   ❌ ${table} - Error: ${result.error}`);
            }
        }
        
        const allTablesExist = Object.values(results).every(r => r.exists);
        return { allTablesExist, results };
    }

    async checkRealtimeConfiguration() {
        console.log('🔍 Verificando configuración real-time...');
        
        try {
            // Intentar suscribirse a una tabla para verificar real-time
            const testChannel = this.supabase
                .channel('test-realtime-config')
                .on('postgres_changes', 
                    { event: '*', schema: 'public', table: 'users' }, 
                    () => {}
                );
            
            const subscriptionPromise = new Promise((resolve, reject) => {
                testChannel.subscribe((status) => {
                    if (status === 'SUBSCRIBED') {
                        resolve(true);
                    } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                        reject(new Error(`Subscription failed with status: ${status}`));
                    }
                });
                
                // Timeout después de 10 segundos
                setTimeout(() => {
                    reject(new Error('Subscription timeout'));
                }, 10000);
            });
            
            await subscriptionPromise;
            await this.supabase.removeChannel(testChannel);
            
            console.log('   ✅ Real-time configurado correctamente');
            return true;
        } catch (error) {
            console.log(`   ❌ Error en configuración real-time: ${error.message}`);
            return false;
        }
    }

    async createTestUsers() {
        console.log('👥 Verificando usuarios de prueba...');
        
        try {
            const { data: existingUsers, error } = await this.supabase
                .from('users')
                .select('id, username, email')
                .limit(5);
            
            if (error) {
                throw error;
            }
            
            if (existingUsers && existingUsers.length >= 2) {
                console.log(`   ✅ Encontrados ${existingUsers.length} usuarios existentes`);
                existingUsers.forEach((user, index) => {
                    console.log(`      ${index + 1}. ${user.username || user.email} (ID: ${user.id})`);
                });
                return true;
            }
            
            console.log('   ⚠️ Se necesitan al menos 2 usuarios para los tests');
            console.log('   💡 Crea usuarios desde la aplicación o ejecuta el script de inicialización');
            return false;
            
        } catch (error) {
            console.log(`   ❌ Error verificando usuarios: ${error.message}`);
            return false;
        }
    }

    async generateTestScript() {
        const testScript = `#!/bin/bash
# Script de testing real-time generado automáticamente

echo "🚀 Iniciando tests de funcionalidad real-time..."

# Verificar que Node.js esté instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    exit 1
fi

# Verificar que las dependencias estén instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

# Ejecutar tests
echo "🧪 Ejecutando tests real-time..."
node run_realtime_tests.js

echo "✅ Tests completados"
`;

        try {
            await fs.writeFile('test_realtime.sh', testScript);
            
            // Hacer el script ejecutable (solo en sistemas Unix)
            if (process.platform !== 'win32') {
                const { exec } = require('child_process');
                exec('chmod +x test_realtime.sh');
            }
            
            console.log('✅ Script de testing generado: test_realtime.sh');
            return true;
        } catch (error) {
            console.log(`❌ Error generando script: ${error.message}`);
            return false;
        }
    }

    async runSetup() {
        console.log('🔧 CONFIGURACIÓN DE TESTING REAL-TIME');
        console.log('=====================================\n');
        
        try {
            // 1. Cargar variables de entorno
            await this.loadEnvironment();
            
            // 2. Inicializar Supabase
            await this.initializeSupabase();
            
            // 3. Verificar tablas
            const { allTablesExist } = await this.checkTables();
            if (!allTablesExist) {
                console.log('\n⚠️ Algunas tablas no existen. Ejecuta el script de configuración de base de datos primero.');
            }
            
            // 4. Verificar configuración real-time
            const realtimeOk = await this.checkRealtimeConfiguration();
            
            // 5. Verificar usuarios de prueba
            const usersOk = await this.createTestUsers();
            
            // 6. Generar script de testing
            await this.generateTestScript();
            
            // Resumen final
            console.log('\n📋 RESUMEN DE CONFIGURACIÓN:');
            console.log(`   Tablas: ${allTablesExist ? '✅' : '❌'}`);
            console.log(`   Real-time: ${realtimeOk ? '✅' : '❌'}`);
            console.log(`   Usuarios: ${usersOk ? '✅' : '❌'}`);
            
            if (allTablesExist && realtimeOk && usersOk) {
                console.log('\n🎉 ¡Configuración completa! Puedes ejecutar los tests con:');
                console.log('   node run_realtime_tests.js');
                console.log('   o');
                console.log('   ./test_realtime.sh');
            } else {
                console.log('\n⚠️ Configuración incompleta. Revisa los errores anteriores.');
            }
            
        } catch (error) {
            console.error(`❌ Error en configuración: ${error.message}`);
            process.exit(1);
        }
    }
}

// Ejecutar configuración si se llama directamente
if (require.main === module) {
    const setup = new RealtimeTestSetup();
    setup.runSetup()
        .then(() => {
            console.log('\n✅ Configuración completada');
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ Error en configuración:', error);
            process.exit(1);
        });
}

module.exports = RealtimeTestSetup;