const fs = require('fs');
const path = require('path');

// Script para verificar todos los exports de componentes
function checkComponentExports() {
  const componentsToCheck = [
    // Context providers
    './src/context/AppContext.js',
    './src/context/SearchContext.js',
    './src/context/SidebarContext.js',
    './src/context/NeighborhoodContext.js',
    './src/context/CommunityCalendarContext.js',
    './src/context/NeighborhoodsContext.js',
    './src/context/NeighborhoodExpansionContext.js',
    
    // Components
    './src/components/ErrorBoundary/ErrorBoundary.js',
    './src/components/Layout/Layout.js',
    './src/components/AppInitializer/AppInitializer.js',
    './src/components/ReduxInitializer/ReduxInitializer.js',
    './src/components/RealtimeProvider/RealtimeProvider.js',
    './src/components/HybridRealtimeProvider/HybridRealtimeProvider.js',
    './src/components/FirebaseInitializer/FirebaseInitializer.js',
    
    // Pages
    './src/pages/Landing.js',
    './src/pages/Home.js',
    './src/pages/UserTypeSelection.js',
    './src/pages/VecinosLogin.js',
    './src/pages/AdminLogin.js',
    './src/pages/Register.js',
    './src/pages/ForgotPassword.js',
    './src/pages/AdminDashboard/AdminDashboard.js'
  ];

  console.log('🔍 Verificando exports de componentes...\n');

  componentsToCheck.forEach(filePath => {
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Verificar si tiene React import
        const hasReactImport = content.includes('import React') || content.includes('from "react"') || content.includes("from 'react'");
        
        // Verificar si tiene JSX
        const hasJSX = content.includes('<') && content.includes('>') && !content.includes('// @ts-nocheck');
        
        // Verificar si tiene export default
        const hasDefaultExport = content.includes('export default');
        
        // Verificar si tiene named exports
        const hasNamedExports = content.match(/export\s+(const|function|class)/);
        
        console.log(`📁 ${filePath}`);
        console.log(`   React Import: ${hasReactImport ? '✅' : '❌'}`);
        console.log(`   JSX Usage: ${hasJSX ? '✅' : '❌'}`);
        console.log(`   Default Export: ${hasDefaultExport ? '✅' : '❌'}`);
        console.log(`   Named Exports: ${hasNamedExports ? '✅' : '❌'}`);
        
        if (hasJSX && !hasReactImport) {
          console.log(`   ⚠️  PROBLEMA: Usa JSX pero no importa React`);
        }
        
        if (!hasDefaultExport && !hasNamedExports) {
          console.log(`   ⚠️  PROBLEMA: No tiene exports`);
        }
        
        console.log('');
      } else {
        console.log(`❌ ${filePath} - Archivo no encontrado`);
      }
    } catch (error) {
      console.log(`❌ ${filePath} - Error: ${error.message}`);
    }
  });
}

checkComponentExports();