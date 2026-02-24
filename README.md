# 🎭 Gestión de Camareros para Eventos

[![Version](https://img.shields.io/badge/version-2.1.2-blue.svg)](./src/CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3+-blue.svg)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Edge_Functions-3ECF8E.svg)](https://supabase.com/)

Aplicación web completa para gestionar camareros, pedidos y coordinadores en eventos.

> **Estado:** En desarrollo activo | **Última actualización:** 2026-02-24

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Quick Start](#-quick-start)
- [Documentación](#-documentación)
- [Arquitectura](#-arquitectura)
- [Testing](#-testing)
- [Desarrollo](#-desarrollo)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

---

## ✨ Características

- ✅ Gestión completa de camareros y asignaciones
- ✅ Sistema de pedidos con turnos 1 y 2
- ✅ Confirmación automática vía WhatsApp Business API
- ✅ Envío de partes de servicio por email y WhatsApp
- ✅ Exportación a Excel/PDF
- ✅ Dashboard con estadísticas y calendario interactivo
- ✅ Gestión de coordinadores, clientes y camareros
- ✅ API REST con Supabase Edge Functions
- ✅ Tests unitarios (Vitest) y E2E (Playwright)
- ✅ TypeScript strict mode
- ✅ Error handling robusto con logging

---

## 🚀 Quick Start

### Requisitos

- Node.js ≥ 18
- npm ≥ 9
- Cuenta de Supabase

### Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp src/.env.example .env
# Editar .env con tus credenciales de Supabase

# 3. Iniciar servidor de desarrollo
npm run dev
```

### Variables de Entorno Mínimas

```bash
VITE_SUPABASE_PROJECT_ID=tu-project-id
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

---

## 📚 Documentación

| Documento | Descripción |
|-----------|-------------|
| [API Reference](./docs/API.md) | Documentación completa de todos los endpoints |
| [Deployment Guide](./docs/DEPLOYMENT.md) | Cómo desplegar a producción |
| [Troubleshooting](./docs/TROUBLESHOOTING.md) | Soluciones a problemas comunes |
| [Security Guidelines](./docs/SECURITY.md) | Prácticas de seguridad |
| [Contributing](./docs/CONTRIBUTING.md) | Cómo contribuir al proyecto |
| [Architecture](./src/ARCHITECTURE.md) | Arquitectura del sistema |
| [Changelog](./src/CHANGELOG.md) | Historial de cambios |
| [Refactor Guide](./src/REFACTOR_GUIDE.md) | Guía de refactorización |
| [Migration Examples](./src/MIGRATION_EXAMPLE.md) | Ejemplos de migración |
| [WhatsApp Setup](./src/WHATSAPP_SETUP.md) | Configurar WhatsApp Business API |
| [Email Setup](./src/EMAIL_SETUP.md) | Configurar servicio de email |

---

## 🏗️ Arquitectura

El sistema usa una arquitectura de 3 capas:

```
Frontend (React + TypeScript)
    ↓ HTTPS
Supabase Edge Functions (Hono + Deno)
    ↓
KV Store (Supabase KV / PostgreSQL)
```

Ver [ARCHITECTURE.md](./src/ARCHITECTURE.md) para detalles completos.

---

## 🧪 Testing

```bash
# Tests unitarios
npm run test:unit

# Tests E2E
npm run test:e2e

# Todos los tests
npm run test:all

# Coverage
npm run test:coverage
```

El proyecto incluye **85+ tests automatizados** y un Panel de Pruebas interactivo en la UI.

---

## 🛠️ Comandos de Desarrollo

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build para producción
npm run preview      # Preview del build
npm run type-check   # Verificar TypeScript
npm run lint         # ESLint
```

---

## 🤝 Contribuir

Ver [CONTRIBUTING.md](./docs/CONTRIBUTING.md) para guía completa.

1. Fork el proyecto
2. Crear feature branch: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m 'feat: add nueva-funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Abrir Pull Request

---

## 📄 Licencia

MIT License — ver [LICENSE](./LICENSE)

---

**Versión**: 2.1.1 | **Última actualización**: Febrero 2026
  