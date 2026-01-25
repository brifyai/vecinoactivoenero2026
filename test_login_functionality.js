// =====================================================
// TEST LOGIN FUNCTIONALITY
// Script para diagnosticar problemas de login
// =====================================================

const puppeteer = require('puppeteer');

async function testLoginFunctionality() {
  console.log('🔍 INICIANDO DIAGNÓSTICO DE LOGIN...\n');
  
  let browser;
  try {
    // Lanzar navegador
    browser = await puppeteer.launch({ 
      headless: false, // Para ver qué pasa
      devtools: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Capturar errores de consola
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      console.log(`🖥️  CONSOLE [${type.toUpperCase()}]: ${text}`);
    });
    
    // Capturar errores de red
    page.on('requestfailed', request => {
      console.log(`❌ REQUEST FAILED: ${request.url()} - ${request.failure().errorText}`);
    });
    
    // Ir a la página de login
    console.log('📍 Navegando a http://localhost:3005...');
    await page.goto('http://localhost:3005', { waitUntil: 'networkidle0' });
    
    // Esperar a que aparezca el botón de login
    console.log('⏳ Esperando botón "Iniciar Sesión"...');
    await page.waitForSelector('button:contains("Iniciar Sesión")', { timeout: 10000 });
    
    // Llenar formulario
    console.log('📝 Llenando formulario de login...');
    await page.type('input[type="email"]', 'admin@vecinoactivo.cl');
    await page.type('input[type="password"]', 'admin123');
    
    // Hacer click en el botón
    console.log('🖱️  Haciendo click en "Iniciar Sesión"...');
    await page.click('button:contains("Iniciar Sesión")');
    
    // Esperar respuesta (5 segundos)
    console.log('⏳ Esperando respuesta...');
    await page.waitForTimeout(5000);
    
    // Verificar si hay cambios en la URL o contenido
    const currentUrl = page.url();
    console.log(`📍 URL actual: ${currentUrl}`);
    
    // Verificar si hay mensajes de error
    const errorMessages = await page.$$eval('.error, .alert-danger, [class*="error"]', 
      elements => elements.map(el => el.textContent)
    );
    
    if (errorMessages.length > 0) {
      console.log('❌ ERRORES ENCONTRADOS:');
      errorMessages.forEach(msg => console.log(`   - ${msg}`));
    }
    
    // Verificar si el login fue exitoso
    const isLoggedIn = currentUrl.includes('/app') || currentUrl.includes('/home');
    
    if (isLoggedIn) {
      console.log('✅ LOGIN EXITOSO - Usuario redirigido');
    } else {
      console.log('❌ LOGIN FALLÓ - Usuario sigue en página de login');
    }
    
    // Capturar screenshot
    await page.screenshot({ path: 'login_test_screenshot.png', fullPage: true });
    console.log('📸 Screenshot guardado como login_test_screenshot.png');
    
  } catch (error) {
    console.error('💥 ERROR EN TEST:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Ejecutar test
testLoginFunctionality().then(() => {
  console.log('\n🏁 DIAGNÓSTICO COMPLETADO');
  process.exit(0);
}).catch(error => {
  console.error('💥 ERROR FATAL:', error);
  process.exit(1);
});