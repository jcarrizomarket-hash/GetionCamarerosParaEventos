#!/usr/bin/env node

/**
 * 🚀 Quick Start - Panel de Pruebas
 * Guía interactiva paso a paso
 */

console.clear();

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

const box = (text, width = 60) => {
  const padding = width - text.length - 2;
  const leftPad = Math.floor(padding / 2);
  const rightPad = padding - leftPad;
  return '│ ' + ' '.repeat(leftPad) + text + ' '.repeat(rightPad) + ' │';
};

console.log(colors.bright + colors.cyan);
console.log('┌' + '─'.repeat(62) + '┐');
console.log(box('🧪 PANEL DE PRUEBAS - QUICK START', 60));
console.log('└' + '─'.repeat(62) + '┘');
console.log(colors.reset);

console.log('\n' + colors.bright + 'PASO 1: Inicia la aplicación' + colors.reset);
console.log(colors.yellow + '  $ npm run dev' + colors.reset);
console.log('  Espera a ver: ' + colors.green + '"Local: http://localhost:5173/"' + colors.reset);

console.log('\n' + colors.bright + 'PASO 2: Abre en tu navegador' + colors.reset);
console.log(colors.cyan + '  http://localhost:5173' + colors.reset);

console.log('\n' + colors.bright + 'PASO 3: Navega al Panel de Pruebas' + colors.reset);
console.log('  Busca en la barra de navegación superior:');
console.log(colors.blue + '  [Dashboard] [Pedidos] [...] ' + colors.green + '[Panel de Pruebas] 🧪' + colors.reset);
console.log('                                      ↑');
console.log('                                      └─── CLICK AQUÍ');

console.log('\n' + colors.bright + 'PASO 4: Ejecuta las pruebas' + colors.reset);
console.log('  Click en: ' + colors.green + '"Ejecutar Todas las Pruebas"' + colors.reset);
console.log('  Espera: ~10 segundos');

console.log('\n' + colors.bright + 'PASO 5: Revisa los resultados' + colors.reset);
console.log('  Verás algo como:');
console.log(colors.green + '  ✅ Test Suite - Iniciando batería de pruebas...' + colors.reset);
console.log(colors.green + '  ✅ Validación Phone ID - 4/4 casos pasados' + colors.reset);
console.log(colors.green + '  ✅ Formato de Número - 4/4 casos pasados' + colors.reset);
console.log(colors.yellow + '  ⚠️  WhatsApp Config - No configurado (normal)' + colors.reset);

console.log('\n' + colors.bright + '═'.repeat(64) + colors.reset);
console.log(colors.bright + colors.green + '  ✅ ¡Sistema listo para usar!' + colors.reset);
console.log(colors.bright + '═'.repeat(64) + colors.reset);

console.log('\n' + colors.bright + '📚 Documentación disponible:' + colors.reset);
console.log(colors.cyan + '  • START_HERE.md' + colors.reset + '           - Inicio rápido (5 min)');
console.log(colors.cyan + '  • TESTING_SETUP.md' + colors.reset + '       - Configuración de testing');
console.log(colors.cyan + '  • TESTING_SUMMARY.md' + colors.reset + '     - Documentación completa');
console.log(colors.cyan + '  • WHATSAPP_SETUP.md' + colors.reset + '      - Configuración de WhatsApp');

console.log('\n' + colors.bright + '🧪 Tests desde línea de comandos:' + colors.reset);
console.log(colors.yellow + '  $ npm run test:unit' + colors.reset + '        - Tests unitarios (2s)');
console.log(colors.yellow + '  $ npm run test:integration' + colors.reset + ' - Tests integración (10s)');
console.log(colors.yellow + '  $ npm run test:e2e' + colors.reset + '         - Tests E2E (30s)');
console.log(colors.yellow + '  $ npm run test:all' + colors.reset + '         - Batería completa (45s)');

console.log('\n' + colors.bright + '🔧 Verificación del sistema:' + colors.reset);
console.log(colors.magenta + '  $ npm run verify' + colors.reset + '          - Verifica configuración');

console.log('\n' + colors.bright + '💡 Tips:' + colors.reset);
console.log('  • Presiona ' + colors.yellow + 'F12' + colors.reset + ' en el navegador para ver la consola');
console.log('  • Los tests de validación siempre deben pasar');
console.log('  • Es normal que WhatsApp diga "no configurado"');
console.log('  • Revisa la pestaña ' + colors.cyan + '"Resultados"' + colors.reset + ' para historial detallado');

console.log('\n' + colors.green + '🚀 ¡Comienza ahora con: ' + colors.yellow + 'npm run dev' + colors.reset);
console.log('');
