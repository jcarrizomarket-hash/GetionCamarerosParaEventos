#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const FORBIDDEN_PACKAGES = [
  'eval',
  'function-constructor',
  'exec',
  'vm.runInThisContext'
];

const DANGEROUS_IMPORTS = [
  'fs',
  'child_process',
  'vm',
  'eval'
];

console.log('🔒 Validando seguridad del proyecto...\n');

// Validar package.json
console.log('📦 Validando package.json...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

const allDeps = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
};

let hasVulnerableDeps = false;
for (const [name, version] of Object.entries(allDeps)) {
  if (FORBIDDEN_PACKAGES.includes(name)) {
    console.log(`   ❌ Dependencia prohibida: ${name}`);
    hasVulnerableDeps = true;
  }
}

if (!hasVulnerableDeps) {
  console.log('   ✅ Sin dependencias prohibidas');
}

// Validar archivos de código
console.log('\n🔍 Validando código...');
const srcPath = path.join(__dirname, '../src');
let securityIssues = 0;

function scanDir(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !file.startsWith('.')) {
      scanDir(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      const content = fs.readFileSync(filePath, 'utf-8');

      DANGEROUS_IMPORTS.forEach(imp => {
        if (content.includes(`from '${imp}'`) || content.includes(`require('${imp}')`)) {
          // Permite solo en server/
          if (!filePath.includes('/server/')) {
            console.log(`   ⚠️  ${filePath} imports ${imp}`);
            securityIssues++;
          }
        }
      });
    }
  }
}

try {
  scanDir(srcPath);
  if (securityIssues === 0) {
    console.log('   ✅ No hay problemas de seguridad detectados');
  }
} catch (error) {
  console.log('   ⚠️  No se pudo escanear directorios');
}

console.log('\n✅ Validación completada');
