// Test login functionality
const customAuthService = require('./src/services/customAuthService.js');

async function testLogin() {
  try {
    console.log('🧪 Testing login with admin@vecinoactivo.cl / 123456');
    
    const result = await customAuthService.login('admin@vecinoactivo.cl', '123456');
    console.log('✅ Login successful:', result);
    
  } catch (error) {
    console.error('❌ Login failed:', error.message);
  }
}

testLogin();