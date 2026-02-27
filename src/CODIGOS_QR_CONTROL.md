# 📱 Códigos QR para Control de Entrada/Salida

## ✅ Funcionalidad Implementada

Se ha agregado un sistema completo de códigos QR para control de entrada y salida del personal en cada evento.

---

## 🎯 Ubicación

**Ruta**: Pedidos → Gestión de Pedidos → [Seleccionar un pedido] → **Botón "Código QR"**

---

## 📋 Características Principales

### 1. Generación Automática de Códigos QR
- ✅ Cada pedido/evento tiene un token único
- ✅ Generación automática al abrir por primera vez
- ✅ El token se guarda en la base de datos
- ✅ Código QR visual generado automáticamente

### 2. Modal de Gestión
Cuando haces clic en "Código QR", se abre un modal con:

#### Visualización del Código QR
- 📱 Imagen QR de 300x300 píxeles
- 🎨 Fondo degradado azul/gris
- 📦 Diseño profesional con sombra

#### Acciones Disponibles
1. **Copiar Link** (Botón azul)
   - Copia el link de escaneo al portapapeles
   - Confirmación visual "Copiado"
   
2. **Descargar QR** (Botón verde)
   - Descarga la imagen PNG del código QR
   - Nombre: `QR-[Cliente]-[Número].png`
   
3. **Regenerar** (Botón ámbar)
   - Genera un nuevo token único
   - Invalida el código QR anterior
   - Requiere confirmación

### 3. Información Mostrada
- 📝 Link completo de escaneo
- 📅 Datos del evento (cliente, fecha, lugar, horario)
- 👥 Personal asignado
- 📖 Instrucciones de uso

---

## 🔧 Implementación Técnica

### Backend - Nuevas Rutas API

#### 1. Obtener/Generar Token QR
```
GET /make-server-25b11ac0/pedidos/:id/qr-token
```
- Si el pedido ya tiene token, lo devuelve
- Si no tiene token, genera uno nuevo y lo guarda

**Respuesta:**
```json
{
  "success": true,
  "token": "pedido:123-1234567890-abc123xyz",
  "url": "https://[baseUrl]/make-server-25b11ac0/qr-scan/pedido:123-1234567890-abc123xyz"
}
```

#### 2. Regenerar Token QR
```
POST /make-server-25b11ac0/pedidos/:id/qr-regenerate
```
- Genera un nuevo token único
- Guarda timestamp de regeneración
- Invalida el token anterior

#### 3. Validar Token y Obtener Datos
```
GET /make-server-25b11ac0/qr-scan/:token
```
- Busca el pedido con ese token
- Devuelve información del evento y asignaciones

**Respuesta:**
```json
{
  "success": true,
  "pedido": {
    "id": "pedido:123",
    "numero": "P-0001",
    "cliente": "Cliente Demo",
    "tipoEvento": "Boda",
    "diaEvento": "2026-03-15",
    "horaEntrada": "10:00",
    "horaSalida": "18:00",
    "lugar": "Salón de Eventos",
    "asignaciones": [...]
  }
}
```

#### 4. Registrar Entrada/Salida
```
POST /make-server-25b11ac0/qr-scan/:token/registro
Body: { "camareroId": "cam123", "tipo": "entrada" | "salida" }
```
- Registra timestamp de entrada o salida
- Marca flag `entradaRegistrada` / `salidaRegistrada`

---

## 🎨 Frontend - Componente QRControl

### Archivo: `/components/qr-control.tsx`

#### Librería Utilizada
```typescript
import QRCodeLib from 'qrcode';
```

#### Funciones Principales

1. **cargarQRToken()**
   - Obtiene o genera el token del backend
   - Se ejecuta al abrir el modal

2. **generarImagenQR(url)**
   - Convierte el URL en imagen QR
   - Formato: PNG Data URL
   - Tamaño: 300x300 con margen de 2

3. **regenerarToken()**
   - Solicita confirmación al usuario
   - Llama al endpoint de regeneración
   - Actualiza la visualización

4. **copiarLink()**
   - Copia URL al portapapeles
   - Muestra confirmación temporal

5. **descargarQR()**
   - Descarga la imagen QR como PNG
   - Nombre descriptivo con cliente y número

---

## 📱 Flujo de Uso

### Paso 1: Generar Código QR
1. Ir a **Pedidos** → **Gestión de Pedidos**
2. Seleccionar un evento de la lista
3. Hacer clic en el botón **"Código QR"** (morado)
4. Se abre el modal con el código generado

### Paso 2: Compartir con el Cliente
Opciones:
- **Opción A**: Copiar el link y enviarlo por WhatsApp/Email
- **Opción B**: Descargar la imagen QR y enviarla
- **Opción C**: Mostrar el QR en pantalla para escanear directamente

### Paso 3: Cliente Escanea el Código
1. El cliente escanea el QR con su móvil
2. Se abre el link de validación
3. Ve la información del evento y personal asignado
4. Puede registrar entrada/salida de cada camarero

### Paso 4: Regenerar (Opcional)
Si necesitas invalidar el código anterior:
1. Hacer clic en **"Regenerar"**
2. Confirmar la acción
3. Compartir el nuevo código con el cliente

---

## 🔒 Seguridad

### Tokens Únicos
- Formato: `pedido:ID-timestamp-random`
- Ejemplo: `pedido:123-1709654321-a7b3f9x2k`
- No se pueden adivinar ni predecir

### Validación
- ✅ El token debe existir en la base de datos
- ✅ Debe estar asociado a un pedido válido
- ✅ Los tokens antiguos se invalidan al regenerar

### Registro de Entrada/Salida
- ✅ Solo camareros asignados al evento
- ✅ Timestamp ISO 8601 con zona horaria
- ✅ Flags booleanos de confirmación

---

## 📊 Datos Guardados

### En el Pedido (`qrToken`)
```json
{
  "qrToken": "pedido:123-1709654321-a7b3f9x2k",
  "qrGeneratedAt": "2026-02-25T10:30:00.000Z",
  "qrRegeneratedAt": "2026-02-25T14:20:00.000Z" // Solo si se regeneró
}
```

### En las Asignaciones (al registrar)
```json
{
  "camareroId": "cam123",
  "registroEntrada": "2026-03-15T10:05:23.456Z",
  "entradaRegistrada": true,
  "registroSalida": "2026-03-15T18:12:45.789Z",
  "salidaRegistrada": true
}
```

---

## 🎨 Diseño Visual

### Modal Principal
- **Tamaño**: max-width 2xl, responsive
- **Header**: Degradado azul-morado con título e icono
- **Código QR**: Centrado con fondo degradado gris-azul
- **Botones**: 3 acciones en grid responsivo
- **Información**: Secciones organizadas con borders

### Botón de Acceso
- **Color**: Morado (purple-50/600/700)
- **Icono**: QrCode de Lucide React
- **Ubicación**: Junto a "Exportar Pedido"
- **Estado**: Hover con transición suave

---

## 📝 Instrucciones para el Cliente

El modal incluye instrucciones claras:

1. ✅ Envía el código QR o link al cliente
2. ✅ El cliente puede escanearlo desde cualquier dispositivo
3. ✅ Permite registrar entrada/salida de cada camarero
4. ✅ Si regeneras el código, el anterior deja de funcionar

---

## 🧪 Cómo Probarlo

### Prueba Básica
1. Ve a **Pedidos** → **Gestión de Pedidos**
2. Selecciona cualquier evento con asignaciones
3. Clic en **"Código QR"**
4. Verifica que aparece el modal con:
   - ✅ Código QR visual
   - ✅ Link completo
   - ✅ Información del evento
   - ✅ Botones funcionando

### Probar Copiar Link
1. Clic en **"Copiar Link"**
2. El botón debe cambiar a "Copiado" con check
3. Pegar en un editor de texto para verificar

### Probar Descarga
1. Clic en **"Descargar QR"**
2. Se descarga un archivo PNG
3. Nombre: `QR-[Cliente]-[Número].png`
4. Abrir y verificar que es el código QR

### Probar Regeneración
1. Clic en **"Regenerar"**
2. Aparece confirmación
3. Aceptar
4. El código QR cambia
5. El link también cambia

### Probar Validación (Backend)
1. Copiar el link generado
2. Abrir en navegador o usar Postman
3. Debe devolver JSON con datos del evento

---

## 📁 Archivos Modificados/Creados

### Nuevos
1. **`/components/qr-control.tsx`** ⭐
   - Componente modal de gestión de QR
   - 300+ líneas de código
   - Interfaz completa con diseño profesional

### Modificados
2. **`/components/gestion-pedidos.tsx`**
   - Import de QRControl
   - Import de ícono QrCode
   - Estado `showQRControl`
   - Botón "Código QR"
   - Renderizado condicional del modal

3. **`/supabase/functions/server/index.tsx`**
   - 4 nuevas rutas API para QR
   - Generación de tokens únicos
   - Validación de tokens
   - Registro de entrada/salida

---

## 🚀 Próximas Mejoras Posibles

### Interfaz de Escaneo para Clientes
- [ ] Crear página web pública para escanear
- [ ] Mostrar lista de personal con checkboxes
- [ ] Botones de "Registrar Entrada" / "Registrar Salida"
- [ ] Confirmación visual con animaciones

### Funcionalidades Avanzadas
- [ ] Exportar registros de entrada/salida a Excel
- [ ] Notificaciones al registrar (WhatsApp/Email)
- [ ] Estadísticas de puntualidad
- [ ] Historial de escaneos

### Seguridad
- [ ] Expiración automática de tokens (ej: 30 días)
- [ ] Límite de regeneraciones
- [ ] Log de accesos al QR

### UX
- [ ] Preview del link de escaneo
- [ ] Envío directo por WhatsApp/Email desde el modal
- [ ] Impresión del QR en formato PDF

---

## 🐛 Solución de Problemas

### El código QR no se genera
- Verificar que la librería `qrcode` está instalada
- Revisar console.log para errores
- Verificar conexión con el backend

### El link no funciona
- Verificar que el baseUrl es correcto
- El token debe existir en la base de datos
- Revisar que no se regeneró el código

### Error al regenerar
- Verificar permisos (requiere autenticación)
- El pedido debe existir
- Revisar logs del servidor

---

## 📚 Dependencias Nuevas

```json
{
  "dependencies": {
    "qrcode": "^1.5.3"
  }
}
```

**Instalación automática**: La librería se importa directamente en el código.

---

## ✅ Checklist de Implementación

- [x] Backend: Rutas API para QR
- [x] Backend: Generación de tokens únicos
- [x] Backend: Validación de tokens
- [x] Backend: Registro de entrada/salida
- [x] Frontend: Componente QRControl
- [x] Frontend: Botón en Gestión de Pedidos
- [x] Frontend: Modal responsive
- [x] Frontend: Generación de imagen QR
- [x] Frontend: Copiar al portapapeles
- [x] Frontend: Descargar imagen
- [x] Frontend: Regenerar token
- [x] Documentación completa
- [ ] Interfaz pública de escaneo (próximo)

---

**Versión**: 1.0.0  
**Fecha**: 25 de febrero de 2026  
**Estado**: ✅ **IMPLEMENTADO Y FUNCIONAL**

**Nota**: La interfaz pública para que los clientes escaneen el QR y registren entrada/salida se puede implementar en una siguiente fase según necesidades.
