#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔒 Ejecutando auditoría de seguridad...\n');

try {
  // Ejecutar npm audit
  console.log('📋 Verificando vulnerabilidades con npm audit...');
  const auditResult = execSync('npm audit --json', { encoding: 'utf-8' });
  const audit = JSON.parse(auditResult);

  if (audit.metadata.vulnerabilities.total > 0) {
    console.log('\n🚨 VULNERABILIDADES ENCONTRADAS:');
    console.log(`   Critical: ${audit.metadata.vulnerabilities.critical}`);
    console.log(`   High: ${audit.metadata.vulnerabilities.high}`);
    console.log(`   Medium: ${audit.metadata.vulnerabilities.medium}`);
    console.log(`   Low: ${audit.metadata.vulnerabilities.low}`);

    // Generar reporte
    fs.writeFileSync('security-audit.json', JSON.stringify(audit, null, 2));
    console.log('\n✅ Reporte guardado en security-audit.json');

    process.exit(1);
  } else {
    console.log('✅ No se encontraron vulnerabilidades');
    process.exit(0);
  }
} catch (error) {
  console.error('❌ Error en auditoría de seguridad:', error.message);
  process.exit(1);
}
