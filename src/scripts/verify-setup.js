#!/usr/bin/env node

/**
 * Script de Verificación del Sistema
 * Verifica que todos los componentes están correctamente configurados
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const REQUIRED_FILES = [
  '/App.tsx',
  '/components/test-panel.tsx',
  '/components/ui/card.tsx',
  '/components/ui/button.tsx',
  '/components/ui/input.tsx',
  '/components/ui/textarea.tsx',
  '/components/ui/badge.tsx',
  '/components/ui/alert.tsx',
  '/components/ui/tabs.tsx',
  '/utils/supabase/info.tsx',
  '/supabase/functions/server/index.tsx',
  '/package.json',
  '/vite.config.ts',
  '/index.html'
];

const REQUIRED_ROUTES = [
  'verificar-whatsapp-config',
  'enviar-whatsapp',
  'enviar-email-generico'
];

console.log('🔍 Verificando configuración del sistema...\n');

let allChecksPass = true;

// 1. Verificar archivos requeridos
console.log('📁 Verificando archivos requeridos...');
REQUIRED_FILES.forEach(file => {
  const fullPath = resolve(process.cwd() + file);
  if (existsSync(fullPath)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - NO ENCONTRADO`);
    allChecksPass = false;
  }
});

console.log('\n📦 Verificando dependencias...');
try {
  const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));
  
  const requiredDeps = {
    'react': 'dependencies',
    'react-dom': 'dependencies',
    'lucide-react': 'dependencies',
    'vite': 'devDependencies',
    'typescript': 'devDependencies',
    'vitest': 'devDependencies',
    '@playwright/test': 'devDependencies'
  };
  
  Object.entries(requiredDeps).forEach(([dep, type]) => {
    if (packageJson[type] && packageJson[type][dep]) {
      console.log(`  ✅ ${dep} (${type})`);
    } else {
      console.log(`  ❌ ${dep} - NO INSTALADA`);
      allChecksPass = false;
    }
  });
} catch (error) {
  console.log('  ❌ Error leyendo package.json');
  allChecksPass = false;
}

console.log('\n🧪 Verificando Panel de Pruebas...');
try {
  const appContent = readFileSync('./App.tsx', 'utf-8');
  
  if (appContent.includes('test-panel')) {
    console.log('  ✅ TestPanel importado en App.tsx');
  } else {
    console.log('  ❌ TestPanel NO importado en App.tsx');
    allChecksPass = false;
  }
  
  if (appContent.includes("{ id: 'test-panel'")) {
    console.log('  ✅ Tab "test-panel" configurado');
  } else {
    console.log('  ❌ Tab "test-panel" NO configurado');
    allChecksPass = false;
  }
  
  if (appContent.includes('TestTube')) {
    console.log('  ✅ Icono TestTube importado');
  } else {
    console.log('  ❌ Icono TestTube NO importado');
    allChecksPass = false;
  }
} catch (error) {
  console.log('  ❌ Error verificando App.tsx');
  allChecksPass = false;
}

console.log('\n🌐 Verificando rutas del servidor...');
try {
  const serverContent = readFileSync('./supabase/functions/server/index.tsx', 'utf-8');
  
  REQUIRED_ROUTES.forEach(route => {
    if (serverContent.includes(route)) {
      console.log(`  ✅ Ruta: /make-server-25b11ac0/${route}`);
    } else {
      console.log(`  ❌ Ruta: /make-server-25b11ac0/${route} - NO ENCONTRADA`);
      allChecksPass = false;
    }
  });
} catch (error) {
  console.log('  ❌ Error verificando rutas del servidor');
  allChecksPass = false;
}

console.log('\n📊 Verificando scripts NPM...');
try {
  const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));
  
  const requiredScripts = [
    'dev',
    'build',
    'test',
    'test:ui',
    'test:e2e',
    'test:all'
  ];
  
  requiredScripts.forEach(script => {
    if (packageJson.scripts && packageJson.scripts[script]) {
      console.log(`  ✅ npm run ${script}`);
    } else {
      console.log(`  ❌ npm run ${script} - NO CONFIGURADO`);
      allChecksPass = false;
    }
  });
} catch (error) {
  console.log('  ❌ Error verificando scripts');
  allChecksPass = false;
}

console.log('\n' + '='.repeat(60));
if (allChecksPass) {
  console.log('✅ ¡TODAS LAS VERIFICACIONES PASARON!');
  console.log('\n🚀 El sistema está listo para usar.');
  console.log('\nPróximos pasos:');
  console.log('  1. npm run dev          - Iniciar aplicación');
  console.log('  2. Abrir http://localhost:5173');
  console.log('  3. Click en "Panel de Pruebas" 🧪');
  console.log('  4. Click en "Ejecutar Todas las Pruebas"');
} else {
  console.log('❌ ALGUNAS VERIFICACIONES FALLARON');
  console.log('\n⚠️  Por favor revisa los errores arriba y corrige.');
  process.exit(1);
}
console.log('='.repeat(60) + '\n');
