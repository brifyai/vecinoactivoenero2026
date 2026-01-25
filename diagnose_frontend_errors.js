// =====================================================
// DIAGNOSE FRONTEND ERRORS
// Script para detectar errores de JavaScript en el frontend
// =====================================================

const fs = require('fs');
const path = require('path');

function checkForCommonErrors() {
  console.log('🔍 DIAGNOSTICANDO ERRORES FRONTEND...\n');
  
  const filesToCheck = [
    'src/pages/Login.js',
    'src/hooks/useReduxAuth.js',
    'src/store/slices/authSlice.js',
    'src/services/supabaseAuthService.js',
    'src/services/customAuthService.js',
    'src/config/supabase.js'
  ];
  
  let errorsFound = [];
  
  filesToCheck.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Buscar errores comunes
      const commonErrors = [
        { pattern: /console\.log\(/g, message: 'Console.log statements (pueden causar problemas en producción)' },
        { pattern: /debugger;/g, message: 'Debugger statements' },
        { pattern: /undefined\s*\?/g, message: 'Posible undefined check' },
        { pattern: /\.then\(\s*\)/g, message: 'Promise sin catch' },
        { pattern: /async\s+\w+\s*\([^)]*\)\s*{[^}]*(?!await|return)/g, message: 'Async function sin await' },
        { pattern: /import.*from\s+['""][^'"]*['""];?\s*$/gm, message: 'Import statements' }
      ];
      
      commonErrors.forEach(({ pattern, message }) => {
        const matches = content.match(pattern);
        if (matches && matches.length > 0) {
          errorsFound.push({
            file: filePath,
            issue: message,
            count: matches.length,
            examples: matches.slice(0, 3)
          });
        }
      });
      
      console.log(`✅ Checked: ${filePath}`);
    } else {
      console.log(`❌ Missing: ${filePath}`);
    }
  });
  
  console.log('\n📋 RESULTADOS DEL DIAGNÓSTICO:');
  
  if (errorsFound.length === 0) {
    console.log('✅ No se encontraron errores obvios en el código');
  } else {
    errorsFound.forEach(error => {
      console.log(`\n⚠️  ${error.file}:`);
      console.log(`   - ${error.issue} (${error.count} ocurrencias)`);
      if (error.examples.length > 0) {
        console.log(`   - Ejemplos: ${error.examples.join(', ')}`);
      }
    });
  }
  
  // Verificar build
  console.log('\n🔍 VERIFICANDO BUILD...');
  
  const buildPath = 'build';
  if (fs.existsSync(buildPath)) {
    const buildFiles = fs.readdirSync(buildPath);
    console.log(`✅ Build existe con ${buildFiles.length} archivos`);
    
    // Verificar archivos críticos
    const criticalFiles = ['index.html', 'static'];
    criticalFiles.forEach(file => {
      if (buildFiles.includes(file)) {
        console.log(`✅ ${file} encontrado`);
      } else {
        console.log(`❌ ${file} faltante`);
      }
    });
    
    // Verificar tamaño del build
    const staticPath = path.join(buildPath, 'static');
    if (fs.existsSync(staticPath)) {
      const jsPath = path.join(staticPath, 'js');
      const cssPath = path.join(staticPath, 'css');
      
      if (fs.existsSync(jsPath)) {
        const jsFiles = fs.readdirSync(jsPath);
        console.log(`✅ JS files: ${jsFiles.length}`);
        jsFiles.forEach(file => {
          const filePath = path.join(jsPath, file);
          const stats = fs.statSync(filePath);
          const sizeKB = Math.round(stats.size / 1024);
          console.log(`   - ${file}: ${sizeKB}KB`);
        });
      }
      
      if (fs.existsSync(cssPath)) {
        const cssFiles = fs.readdirSync(cssPath);
        console.log(`✅ CSS files: ${cssFiles.length}`);
      }
    }
  } else {
    console.log('❌ Build no existe - ejecutar npm run build');
  }
  
  console.log('\n🎯 RECOMENDACIONES:');
  console.log('1. Visita http://localhost:3005/test-login.html para probar login directo');
  console.log('2. Abre DevTools (F12) en http://localhost:3005 y revisa errores en Console');
  console.log('3. Verifica que el botón de login tenga event listeners');
  console.log('4. Comprueba que no hay errores de CORS o red');
}

checkForCommonErrors();