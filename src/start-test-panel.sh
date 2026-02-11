#!/bin/bash

# 🚀 Script de Inicio Rápido
# Ejecuta este script para iniciar el Panel de Pruebas

set -e

echo "════════════════════════════════════════════════════════════"
echo "  🧪 PANEL DE PRUEBAS - INICIO RÁPIDO"
echo "════════════════════════════════════════════════════════════"
echo ""

# Verificar Node.js
echo "📌 Paso 1: Verificando Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "   ✅ Node.js instalado: $NODE_VERSION"
else
    echo "   ❌ Node.js no está instalado"
    echo "   Por favor instala Node.js 18+ desde https://nodejs.org"
    exit 1
fi

# Verificar npm
echo ""
echo "📌 Paso 2: Verificando npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo "   ✅ npm instalado: $NPM_VERSION"
else
    echo "   ❌ npm no está instalado"
    exit 1
fi

# Verificar node_modules
echo ""
echo "📌 Paso 3: Verificando dependencias..."
if [ -d "node_modules" ]; then
    echo "   ✅ node_modules encontrado"
else
    echo "   ⚠️  node_modules no encontrado"
    echo "   Instalando dependencias..."
    npm install
    echo "   ✅ Dependencias instaladas"
fi

# Verificar archivos críticos
echo ""
echo "📌 Paso 4: Verificando archivos críticos..."

CRITICAL_FILES=(
    "App.tsx"
    "components/test-panel.tsx"
    "package.json"
    "vite.config.ts"
)

ALL_OK=true
for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file - NO ENCONTRADO"
        ALL_OK=false
    fi
done

if [ "$ALL_OK" = false ]; then
    echo ""
    echo "   ⚠️  Algunos archivos críticos no se encontraron"
    echo "   Por favor verifica la estructura del proyecto"
    exit 1
fi

# Verificar variables de entorno
echo ""
echo "📌 Paso 5: Verificando configuración de Supabase..."
if [ -f "utils/supabase/info.tsx" ]; then
    echo "   ✅ Archivo de configuración de Supabase encontrado"
else
    echo "   ❌ Archivo de configuración de Supabase no encontrado"
    exit 1
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo "  ✅ VERIFICACIÓN COMPLETADA"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "🚀 Iniciando servidor de desarrollo..."
echo ""
echo "   La aplicación estará disponible en:"
echo "   👉 http://localhost:5173"
echo ""
echo "   Una vez que veas el mensaje 'Local: http://localhost:5173/':"
echo ""
echo "   1. Abre tu navegador en http://localhost:5173"
echo "   2. Busca la pestaña 'Panel de Pruebas' 🧪 (última pestaña)"
echo "   3. Click en 'Ejecutar Todas las Pruebas'"
echo ""
echo "════════════════════════════════════════════════════════════"
echo ""

# Iniciar servidor
npm run dev
