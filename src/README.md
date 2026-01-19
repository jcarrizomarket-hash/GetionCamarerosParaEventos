# 🍽️ Sistema de Gestión de Camareros

Sistema completo para la gestión de eventos, asignación de camareros, y comunicación con clientes. Desarrollado con React, TypeScript, Supabase y arquitectura moderna de tres capas.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=flat&logo=vitest&logoColor=white)](https://vitest.dev/)
[![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=flat&logo=playwright&logoColor=white)](https://playwright.dev/)

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Inicio Rápido](#-inicio-rápido)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Documentación](#-documentación)
- [Testing](#-testing)
- [Configuración](#-configuración)
- [Seguridad](#-seguridad)
- [Despliegue](#-despliegue)
- [Contribuir](#-contribuir)

---

## ✨ Características

### 🎯 Gestión Completa de Eventos

- **Entrada de Pedidos**: Registro completo de eventos con calendario visual
- **Asignación de Camareros**: Sistema inteligente con turnos 1 y 2
- **Confirmaciones**: Estados visuales (pendiente, enviado, confirmado)
- **Informes Detallados**: KPIs, métricas y exportación a PDF/Excel

### 📱 Comunicación Integrada

- **WhatsApp Business API**: Envío automático de mensajes
- **Email Multi-Proveedor**: Soporte para Resend, SendGrid, Mailgun
- **Confirmación con Enlaces**: Botones de confirmación directos
- **Estados Visuales**: Código de colores para identificación rápida

### 👥 Gestión de Personal

- **Camareros**: Registro con número, nombre, teléfono, estado
- **Coordinadores**: Gestión de personal responsable
- **Clientes**: Base de datos de clientes con historial

### 📊 Dashboard y Reportes

- **Métricas en Tiempo Real**: Total eventos, confirmados, pendientes
- **Calendario Interactivo**: Vista mensual con navegación
- **Exportación**: PDF y Excel para informes
- **Gráficos**: Visualización de datos con Recharts

---

## 🛠️ Tecnologías

### Frontend
- **React 18** - Librería UI
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling moderno
- **Lucide React** - Iconos

### Backend
- **Supabase Edge Functions** - Serverless functions
- **Hono** - Web framework moderno
- **PostgreSQL** - Base de datos
- **KV Store** - Key-value storage

### Integraciones
- **WhatsApp Business API** - Mensajería
- **Resend/SendGrid/Mailgun** - Email
- **HTML2Canvas** - Generación de PDFs
- **jsPDF** - Exportación documentos

### Testing
- **Vitest** - Tests unitarios
- **Playwright** - Tests E2E
- **Testing Library** - React testing utilities

### DevOps
- **Vite** - Build tool
- **ESLint** - Linting
- **Git** - Control de versiones

---

## 🚀 Inicio Rápido

### Prerrequisitos

```bash
- Node.js >= 18.0.0
- npm o yarn
- Cuenta de Supabase
```

### Instalación

```bash
# 1. Clonar el repositorio
git clone <repository-url>
cd sistema-gestion-camareros

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 4. Iniciar desarrollo
npm run dev
```

### Variables de Entorno Mínimas

```bash
VITE_SUPABASE_PROJECT_ID=tu-project-id
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

Ver [`.env.example`](./.env.example) para configuración completa.

---

## 📁 Estructura del Proyecto

```
sistema-gestion-camareros/
│
├── src/                        # Código fuente TypeScript
│   ├── types.ts               # Tipos del dominio
│   ├── api/
│   │   └── client.ts          # Cliente API centralizado
│   └── utils/
│       └── helpers.ts         # Utilidades reutilizables
│
├── components/                # Componentes React
│   ├── dashboard.tsx
│   ├── pedidos.tsx
│   ├── camareros.tsx
│   ├── gestion-pedidos.tsx
│   └── ...
│
├── supabase/                  # Backend
│   └── functions/
│       └── server/
│           ├── index.tsx      # Servidor principal
│           ├── middleware.ts  # Middleware de seguridad
│           └── kv_store.tsx   # KV store utilities
│
├── tests/                     # Tests
│   ├── unit/                  # Tests unitarios
│   └── e2e/                   # Tests E2E
│
├── docs/                      # Documentación
│   ├── ARCHITECTURE.md
│   ├── REFACTOR_GUIDE.md
│   └── MIGRATION_EXAMPLE.md
│
└── App.tsx                    # Componente principal
```

---

## 📚 Documentación

### Guías Principales

- **[ARCHITECTURE.md](./ARCHITECTURE.md)**: Arquitectura completa del sistema
- **[REFACTOR_GUIDE.md](./REFACTOR_GUIDE.md)**: Guía de refactorización y mejores prácticas
- **[MIGRATION_EXAMPLE.md](./MIGRATION_EXAMPLE.md)**: Ejemplos de migración de código
- **[CHANGELOG.md](./CHANGELOG.md)**: Historial de cambios

### Configuración

- **[.env.example](./.env.example)**: Plantilla de variables de entorno
- **[EMAIL_SETUP.md](./EMAIL_SETUP.md)**: Configurar servicio de email
- **[EMAIL_SYSTEM_OVERVIEW.md](./EMAIL_SYSTEM_OVERVIEW.md)**: Overview del sistema de email
- **[WHATSAPP_SETUP.md](./WHATSAPP_SETUP.md)**: Configurar WhatsApp Business API

---

## 🧪 Testing

### Tests Unitarios (Vitest)

```bash
# Ejecutar tests
npm test

# Modo watch
npm test -- --watch

# Con UI
npm run test:ui

# Coverage
npm run test:coverage
```

### Tests E2E (Playwright)

```bash
# Ejecutar tests E2E
npm run test:e2e

# Con UI interactiva
npm run test:e2e:ui

# Modo headed (ver navegador)
npm run test:e2e:headed

# Navegador específico
npx playwright test --project=chromium
```

### Todos los Tests

```bash
npm run test:all
```

### Coverage Objetivo

- **Helpers**: >80%
- **API Client**: >70%
- **Componentes críticos**: >60%

---

## ⚙️ Configuración

### Supabase

1. Crear proyecto en [Supabase](https://app.supabase.com)
2. Obtener Project ID y API Keys
3. Configurar en `.env`
4. Desplegar Edge Functions:

```bash
supabase functions deploy make-server-25b11ac0
```

### WhatsApp Business API

Ver guía completa: [WHATSAPP_SETUP.md](./WHATSAPP_SETUP.md)

1. Crear app en Meta for Developers
2. Configurar WhatsApp Business
3. Obtener Phone ID y API Key
4. Configurar webhook (opcional)

### Email

Ver guía completa: [EMAIL_SETUP.md](./EMAIL_SETUP.md)

#### Opción 1: Resend (Recomendado)

```bash
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=tu@email.com
```

#### Opción 2: SendGrid

```bash
SENDGRID_API_KEY=SG.xxxxx
EMAIL_FROM=tu@email.com
```

#### Opción 3: Mailgun

```bash
MAILGUN_API_KEY=xxxxx
MAILGUN_DOMAIN=tudominio.com
EMAIL_FROM=tu@email.com
```

---

## 🔐 Seguridad

### Middleware de Protección

```typescript
import { requireFunctionSecret } from './middleware';

// Proteger endpoints mutantes
app.post('/pedidos', requireFunctionSecret, handler);
app.put('/pedidos/:id', requireFunctionSecret, handler);
app.delete('/pedidos/:id', requireFunctionSecret, handler);
```

### Secret de Función

```bash
# Generar secret seguro
openssl rand -hex 32

# Configurar en Supabase
SUPABASE_FN_SECRET=tu-secret-aleatorio-largo
```

### Headers de Seguridad

```typescript
// Operaciones de lectura
headers: {
  'Authorization': 'Bearer SUPABASE_ANON_KEY'
}

// Operaciones mutantes
headers: {
  'Authorization': 'Bearer SUPABASE_ANON_KEY',
  'x-fn-secret': 'SUPABASE_FN_SECRET'
}
```

---

## 🚀 Despliegue

### Frontend (Vercel/Netlify)

```bash
# Build
npm run build

# Preview
npm run preview
```

Variables de entorno necesarias:
```
VITE_SUPABASE_PROJECT_ID
VITE_SUPABASE_ANON_KEY
VITE_SUPABASE_FN_SECRET (opcional)
```

### Backend (Supabase Functions)

```bash
# Desplegar función
supabase functions deploy make-server-25b11ac0

# Ver logs
supabase functions logs make-server-25b11ac0
```

Variables en Supabase Functions:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_FN_SECRET`
- `WHATSAPP_PHONE_ID`
- `WHATSAPP_API_KEY`
- `RESEND_API_KEY`
- `EMAIL_FROM`

### Checklist de Despliegue

- [ ] Variables de entorno configuradas
- [ ] `SUPABASE_FN_SECRET` generado y configurado
- [ ] Tests pasando: `npm run test:all`
- [ ] Build exitoso: `npm run build`
- [ ] Edge Functions desplegadas
- [ ] Email/WhatsApp configurados y probados
- [ ] Monitoring activo

---

## 🤝 Contribuir

### Flujo de Trabajo

1. Fork el proyecto
2. Crear feature branch: `git checkout -b feature/AmazingFeature`
3. Commit cambios: `git commit -m 'Add AmazingFeature'`
4. Push al branch: `git push origin feature/AmazingFeature`
5. Abrir Pull Request

### Estándares de Código

- **TypeScript**: Usar tipos estrictos
- **Cliente API**: Usar `/src/api/client.ts` en lugar de fetch directo
- **Helpers**: Extraer lógica compleja a `/src/utils/helpers.ts`
- **Tests**: Añadir tests para nueva funcionalidad
- **Commits**: Mensajes descriptivos en inglés

### Testing

```bash
# Antes de commit
npm run type-check
npm test
npm run test:e2e

# Verificar coverage
npm run test:coverage
```

---

## 📊 Comandos Disponibles

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo
npm run build            # Build para producción
npm run preview          # Preview del build

# Testing
npm test                 # Tests unitarios
npm run test:ui          # Tests con UI
npm run test:coverage    # Coverage report
npm run test:e2e         # Tests E2E
npm run test:e2e:ui      # E2E con UI
npm run test:all         # Todos los tests

# Calidad
npm run type-check       # Verificar TypeScript
npm run lint             # ESLint
```

---

## 📝 Licencia

MIT License - ver archivo [LICENSE](./LICENSE)

---

## 🙏 Agradecimientos

- [Supabase](https://supabase.com/) - Backend as a Service
- [React](https://reactjs.org/) - UI Library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Vitest](https://vitest.dev/) - Testing framework
- [Playwright](https://playwright.dev/) - E2E testing

---

## 📞 Soporte

- 📖 **Documentación**: Ver carpeta `/docs`
- 🐛 **Issues**: Reportar en GitHub Issues
- 💬 **Preguntas**: Usar GitHub Discussions

---

## 🎯 Roadmap

### v2.1 (Próxima versión)

- [ ] Autenticación de usuarios con Supabase Auth
- [ ] Roles y permisos (coordinador vs camarero)
- [ ] Notificaciones en tiempo real con Supabase Realtime
- [ ] PWA (instalable en móvil)

### v2.2

- [ ] Chat coordinador-camarero
- [ ] Análisis de tendencias e informes avanzados
- [ ] Integración con calendarios (Google Calendar, Outlook)
- [ ] App móvil nativa (React Native)

### Futuro

- [ ] IA para predicción de necesidades de personal
- [ ] Sistema de calificaciones de camareros
- [ ] Gestión de nóminas y pagos
- [ ] Multi-empresa (SaaS)

---

**Versión**: 2.0.0  
**Última actualización**: Enero 2026

**¡Gracias por usar el Sistema de Gestión de Camareros!** 🎉
