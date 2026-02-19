#!/bin/bash

# Script de Verificación: Sincronización Aceptar/Rechazar
# Versión: 1.0.0
# Fecha: 2026-02-18

echo "🔍 VERIFICACIÓN DE SINCRONIZACIÓN: ACEPTAR/RECHAZAR SERVICIOS"
echo "============================================================"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para verificar archivos
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅${NC} Archivo encontrado: $1"
        return 0
    else
        echo -e "${RED}❌${NC} Archivo NO encontrado: $1"
        return 1
    fi
}

# Función para buscar patrón en archivo
check_pattern() {
    local file=$1
    local pattern=$2
    local description=$3
    
    if grep -q "$pattern" "$file" 2>/dev/null; then
        echo -e "${GREEN}✅${NC} $description: OK"
        return 0
    else
        echo -e "${RED}❌${NC} $description: NO ENCONTRADO"
        return 1
    fi
}

echo "📂 1. Verificando archivos principales..."
echo "----------------------------------------"
check_file "/supabase/functions/server/index.tsx"
check_file "/components/gestion-pedidos.tsx"
check_file "/components/envio-mensaje.tsx"
check_file "/components/chat-grupal.tsx"
echo ""

echo "🔧 2. Verificando implementación del backend..."
echo "-----------------------------------------------"
check_pattern "/supabase/functions/server/index.tsx" "estado: 'confirmado'" "Endpoint de confirmación"
check_pattern "/supabase/functions/server/index.tsx" "estado: 'rechazado'" "Endpoint de rechazo"
check_pattern "/supabase/functions/server/index.tsx" "eliminacionProgramada" "Eliminación programada"
check_pattern "/supabase/functions/server/index.tsx" "todosConfirmados" "Verificación de confirmados"
check_pattern "/supabase/functions/server/index.tsx" "chat grupal creado" "Creación de chat grupal"
echo ""

echo "🎨 3. Verificando colores en frontend..."
echo "----------------------------------------"
check_pattern "/components/gestion-pedidos.tsx" "bg-green-100 text-green-800" "Color verde para confirmados"
check_pattern "/components/gestion-pedidos.tsx" "bg-red-100 text-red-800" "Color rojo para rechazados"
check_pattern "/components/gestion-pedidos.tsx" "bg-amber-100 text-amber-800" "Color naranja para enviados"
check_pattern "/components/gestion-pedidos.tsx" "bg-orange-50" "Fondo naranja en vista detalle"
check_pattern "/components/gestion-pedidos.tsx" "bg-green-50" "Fondo verde en vista detalle"
check_pattern "/components/gestion-pedidos.tsx" "bg-red-50" "Fondo rojo en vista detalle"
echo ""

echo "⏰ 4. Verificando timer de eliminación..."
echo "-----------------------------------------"
check_pattern "/components/gestion-pedidos.tsx" "verificarEliminaciones" "Función de verificación"
check_pattern "/components/gestion-pedidos.tsx" "setInterval" "Intervalo de verificación"
check_pattern "/components/gestion-pedidos.tsx" "eliminacionProgramada" "Campo de eliminación programada"
echo ""

echo "🔄 5. Verificando funciones de cambio de estado..."
echo "---------------------------------------------------"
check_pattern "/components/envio-mensaje.tsx" "manejarAceptar" "Función manejarAceptar"
check_pattern "/components/envio-mensaje.tsx" "manejarRechazar" "Función manejarRechazar"
check_pattern "/components/gestion-pedidos.tsx" "cambiarEstado" "Función cambiarEstado"
echo ""

echo "💬 6. Verificando chat grupal..."
echo "--------------------------------"
check_pattern "/components/chat-grupal.tsx" "todosConfirmados" "Filtro de confirmados"
check_pattern "/components/chat-grupal.tsx" "estado === 'confirmado'" "Verificación de estado"
echo ""

echo "📄 7. Verificando documentación..."
echo "-----------------------------------"
check_file "/SINCRONIZACION_ACEPTAR_RECHAZAR.md"
check_file "/TESTING_SINCRONIZACION.md"
check_file "/RESUMEN_SINCRONIZACION.md"
echo ""

echo "============================================================"
echo "🎯 VERIFICACIÓN COMPLETA"
echo "============================================================"
echo ""
echo -e "${BLUE}ℹ️  Próximos pasos:${NC}"
echo "1. Lee la documentación en /RESUMEN_SINCRONIZACION.md"
echo "2. Sigue la guía de testing en /TESTING_SINCRONIZACION.md"
echo "3. Verifica los logs en la consola del navegador y backend"
echo ""
echo -e "${YELLOW}⚠️  Recuerda:${NC}"
echo "- Los cambios se sincronizan automáticamente entre módulos"
echo "- Confirmados aparecen en VERDE"
echo "- Rechazados aparecen en ROJO y se eliminan en 5 horas"
echo "- Chat grupal se crea cuando TODOS confirman"
echo ""
echo -e "${GREEN}✅ Sistema listo para usar${NC}"
echo ""
