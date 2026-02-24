# 📖 API Reference

Documentación completa de la API REST del Sistema de Gestión de Camareros.

La API está implementada con [Hono](https://hono.dev/) sobre Supabase Edge Functions.

**Base URL:**
```
https://<SUPABASE_PROJECT_ID>.supabase.co/functions/v1/make-server-25b11ac0
```

---

## 📋 Tabla de Contenidos

- [Autenticación](#-autenticación)
- [Formato de Respuesta](#-formato-de-respuesta)
- [Clientes](#-clientes)
- [Pedidos / Eventos](#-pedidos--eventos)
- [Camareros](#-camareros)
- [Coordinadores](#-coordinadores)
- [Asignaciones](#-asignaciones)
- [Informes](#-informes)
- [Mensajería](#-mensajería)
- [Chat](#-chat)
- [Códigos de Error](#-códigos-de-error)

---

## 🔐 Autenticación

Todos los endpoints requieren el header `Authorization`:

```http
Authorization: Bearer <SUPABASE_ANON_KEY>
```

Los endpoints que **modifican datos** (POST, PUT, DELETE) requieren adicionalmente:

```http
x-fn-secret: <SUPABASE_FN_SECRET>
```

### Ejemplo con curl

```bash
# Lectura (GET)
curl https://<PROJECT_ID>.supabase.co/functions/v1/make-server-25b11ac0/pedidos \
  -H "Authorization: Bearer <ANON_KEY>"

# Escritura (POST/PUT/DELETE)
curl -X POST https://<PROJECT_ID>.supabase.co/functions/v1/make-server-25b11ac0/pedidos \
  -H "Authorization: Bearer <ANON_KEY>" \
  -H "x-fn-secret: <FN_SECRET>" \
  -H "Content-Type: application/json" \
  -d '{"cliente": "Cliente Ejemplo", ...}'
```

---

## 📦 Formato de Respuesta

Todas las respuestas siguen el formato:

```json
{
  "success": true,
  "data": { ... }
}
```

En caso de error:

```json
{
  "success": false,
  "error": "Descripción del error"
}
```

---

## 👥 Clientes

### `GET /clientes`

Obtiene todos los clientes.

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cliente:1700000000000",
      "nombre": "Cliente Ejemplo",
      "telefono": "+34600000000",
      "email": "cliente@ejemplo.com"
    }
  ]
}
```

---

### `POST /clientes`

Crea un nuevo cliente. Requiere `x-fn-secret`.

**Body:**
```json
{
  "nombre": "Nombre del Cliente",
  "telefono": "+34600000000",
  "email": "cliente@ejemplo.com"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": "cliente:1700000000000",
    "nombre": "Nombre del Cliente",
    "telefono": "+34600000000",
    "email": "cliente@ejemplo.com"
  }
}
```

---

### `PUT /clientes/:id`

Actualiza un cliente existente. Requiere `x-fn-secret`.

**Parámetros:**
- `id` — ID del cliente (e.g. `cliente:1700000000000`)

**Body:** Campos a actualizar.

---

### `DELETE /clientes/:id`

Elimina un cliente. Requiere `x-fn-secret`.

---

## 📋 Pedidos / Eventos

### `GET /pedidos`

Obtiene todos los pedidos/eventos.

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "pedido:1700000000000",
      "numero": 1,
      "cliente": "Cliente Ejemplo",
      "lugar": "Nombre del Lugar",
      "ubicacion": "Dirección del Lugar",
      "diaEvento": "2026-03-15",
      "cantidadCamareros": 5,
      "horaEntrada": "10:00",
      "horaFin": "18:00",
      "cantidadCamareros2": 3,
      "horaEntrada2": "12:00",
      "horaFin2": "20:00",
      "estado": "pendiente"
    }
  ]
}
```

---

### `POST /pedidos`

Crea un nuevo pedido. Requiere `x-fn-secret`.

**Body:**
```json
{
  "numero": 1,
  "cliente": "Cliente Ejemplo",
  "lugar": "Nombre del Lugar",
  "ubicacion": "Dirección",
  "diaEvento": "2026-03-15",
  "cantidadCamareros": 5,
  "horaEntrada": "10:00",
  "horaFin": "18:00",
  "cantidadCamareros2": 3,
  "horaEntrada2": "12:00",
  "horaFin2": "20:00"
}
```

---

### `PUT /pedidos/:id`

Actualiza un pedido. Requiere `x-fn-secret`.

---

### `DELETE /pedidos/:id`

Elimina un pedido. Requiere `x-fn-secret`.

---

## 🧑‍🍳 Camareros

### `GET /camareros`

Obtiene todos los camareros.

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "camarero:1700000000000",
      "numero": 1,
      "nombre": "Juan García",
      "telefono": "+34600000001",
      "estado": "activo"
    }
  ]
}
```

---

### `POST /camareros`

Crea un nuevo camarero. Requiere `x-fn-secret`.

**Body:**
```json
{
  "numero": 1,
  "nombre": "Juan García",
  "telefono": "+34600000001",
  "estado": "activo"
}
```

---

### `PUT /camareros/:id`

Actualiza un camarero. Requiere `x-fn-secret`.

---

### `DELETE /camareros/:id`

Elimina un camarero. Requiere `x-fn-secret`.

---

## 👔 Coordinadores

### `GET /coordinadores`

Obtiene todos los coordinadores.

---

### `POST /coordinadores`

Crea un nuevo coordinador. Requiere `x-fn-secret`.

**Body:**
```json
{
  "nombre": "Ana Martínez",
  "telefono": "+34600000002",
  "email": "ana@empresa.com"
}
```

---

### `PUT /coordinadores/:id`

Actualiza un coordinador. Requiere `x-fn-secret`.

---

### `DELETE /coordinadores/:id`

Elimina un coordinador. Requiere `x-fn-secret`.

---

## 📌 Asignaciones

### `GET /asignaciones`

Obtiene todas las asignaciones de camareros a pedidos.

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "asignacion:1700000000000",
      "pedidoId": "pedido:1700000000000",
      "camareroId": "camarero:1700000000000",
      "turno": 1,
      "estado": "pendiente",
      "confirmado": false
    }
  ]
}
```

---

### `POST /asignaciones`

Crea una nueva asignación. Requiere `x-fn-secret`.

**Body:**
```json
{
  "pedidoId": "pedido:1700000000000",
  "camareroId": "camarero:1700000000000",
  "turno": 1,
  "estado": "pendiente"
}
```

---

### `PUT /asignaciones/:id`

Actualiza una asignación. Requiere `x-fn-secret`.

---

### `DELETE /asignaciones/:id`

Elimina una asignación. Requiere `x-fn-secret`.

---

## 📊 Informes

### `GET /informes/cliente`

Obtiene pedidos filtrados por cliente y rango de fechas.

**Query Params:**
- `cliente` (opcional) — Nombre del cliente
- `desde` (opcional) — Fecha inicio `YYYY-MM-DD`
- `hasta` (opcional) — Fecha fin `YYYY-MM-DD`

**Ejemplo:**
```
GET /informes/cliente?cliente=Empresa+SA&desde=2026-01-01&hasta=2026-12-31
```

**Respuesta:**
```json
{
  "success": true,
  "data": [ ...pedidos filtrados... ]
}
```

---

## 📨 Mensajería

### `POST /enviar-mensaje-grupal`

Envía mensajes de confirmación de servicio a múltiples camareros vía WhatsApp. Requiere `x-fn-secret`.

**Body:**
```json
{
  "camareros": [
    {
      "nombre": "Juan García",
      "telefono": "+34600000001",
      "mensaje": "Hola Juan, tienes servicio el día 15/03..."
    }
  ]
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "total": 3,
    "exitosos": 2,
    "fallidos": 1,
    "resultados": [
      { "camarero": "Juan García", "enviado": true },
      { "camarero": "María López", "enviado": true },
      { "camarero": "Carlos Ruiz", "enviado": false, "error": "Número inválido" }
    ]
  }
}
```

---

### `POST /enviar-parte`

Envía el parte de servicio al cliente por WhatsApp y/o email. Requiere `x-fn-secret`.

**Body:**
```json
{
  "eventoId": "pedido:1700000000000",
  "clienteEmail": "cliente@ejemplo.com",
  "clienteTelefono": "+34600000000",
  "mensaje": "Contenido del parte de servicio..."
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "whatsapp": { "enviado": true },
    "email": { "enviado": true }
  }
}
```

---

## 💬 Chat

### `GET /chat-mensajes`

Obtiene todos los mensajes de chat agrupados por evento.

---

### `GET /chat-mensajes/:chatId`

Obtiene los mensajes de un chat específico, ordenados por fecha.

**Parámetros:**
- `chatId` — ID del chat / evento

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "chat:1700000000000",
      "chatId": "pedido:1700000000000",
      "autor": "Coordinador",
      "mensaje": "El servicio empieza a las 10:00",
      "timestamp": "2026-03-10T09:00:00Z"
    }
  ]
}
```

---

### `POST /chat-mensajes`

Crea un nuevo mensaje de chat. Requiere `x-fn-secret`.

**Body:**
```json
{
  "chatId": "pedido:1700000000000",
  "autor": "Coordinador",
  "mensaje": "El servicio empieza a las 10:00"
}
```

---

## ❌ Códigos de Error

| Código | Descripción |
|--------|-------------|
| `400` | Bad Request — datos de entrada inválidos |
| `401` | Unauthorized — `x-fn-secret` inválido o faltante |
| `404` | Not Found — recurso no encontrado |
| `500` | Internal Server Error — error inesperado del servidor |

### Ejemplo de respuesta de error

```json
{
  "success": false,
  "error": "No autorizado"
}
```

---

## 🔗 Referencias

- [Arquitectura del Sistema](../src/ARCHITECTURE.md)
- [Guía de Seguridad](./SECURITY.md)
- [Guía de Deployment](./DEPLOYMENT.md)
- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Hono Framework](https://hono.dev/)
