# Incident Response - GetionCamarerosParaEventos

Procedimientos de respuesta ante incidentes de seguridad y operacionales.

## Niveles de Severidad

| Nivel | Descripción | Tiempo de Respuesta |
|-------|-------------|---------------------|
| **P1 - Crítico** | Brecha de seguridad, datos expuestos, servicio caído | 15 minutos |
| **P2 - Alto** | Degradación severa, errores masivos, auth comprometida | 1 hora |
| **P3 - Medio** | Errores parciales, rate limiting excesivo, slow queries | 4 horas |
| **P4 - Bajo** | Incidentes menores, mejoras pendientes | 24 horas |

## Escalation Matrix

| Nivel | Primer Contacto | Escalación 1 | Escalación 2 |
|-------|-----------------|--------------|--------------|
| P1 | Desarrollador on-call | Tech Lead | Product Owner |
| P2 | Desarrollador on-call | Tech Lead | - |
| P3 | Desarrollador responsable | - | - |
| P4 | Ticket en backlog | - | - |

## Procedimientos por Tipo de Incidente

### 🔴 Brecha de Datos / Acceso No Autorizado (P1)

**Detección**: 
- Alertas de audit_trail con accesos inusuales
- Error logs con intentos de auth fallidos masivos
- Reportes externos

**Pasos de Respuesta**:

1. **Contener (0-15 min)**
   ```bash
   # Deshabilitar temporalmente las funciones comprometidas
   supabase functions delete <funcion-comprometida> --project-ref <id>
   
   # Revocar service role key si está comprometida
   # → Supabase Dashboard > Settings > API > Regenerate key
   ```

2. **Evaluar el impacto (15-60 min)**
   ```sql
   -- ¿Qué datos fueron accedidos?
   SELECT * FROM audit_trail
   WHERE created_at > NOW() - INTERVAL '24 hours'
     AND changed_by = '<user-id-sospechoso>'
   ORDER BY created_at DESC;
   
   -- ¿Desde qué IPs?
   SELECT DISTINCT ip_address, COUNT(*), MIN(created_at), MAX(created_at)
   FROM audit_trail
   WHERE created_at > NOW() - INTERVAL '24 hours'
   GROUP BY ip_address
   ORDER BY COUNT(*) DESC;
   ```

3. **Mitigar**
   - Rotar todos los secretos y tokens
   - Invalidar sesiones activas: `supabase auth admin list-users --project-ref <id>`
   - Aplicar bloqueo de IPs si es necesario

4. **Notificar**
   - Notificar a usuarios afectados si aplica (GDPR/LGPD)
   - Documentar el incidente

### 🟠 Servicio Caído (P1)

1. Verificar status de Supabase: https://status.supabase.com
2. Revisar logs de funciones: `supabase functions logs <nombre>`
3. Verificar build del frontend y rollback si es necesario
4. Activar página de mantenimiento si corresponde

### 🟡 Degradación de Performance (P2)

1. Identificar queries lentas:
   ```sql
   SELECT query, mean_exec_time, calls
   FROM pg_stat_statements
   ORDER BY mean_exec_time DESC
   LIMIT 20;
   ```

2. Verificar índices faltantes:
   ```sql
   SELECT schemaname, tablename, attname, n_distinct, correlation
   FROM pg_stats
   WHERE tablename IN ('pedidos', 'camareros', 'audit_trail');
   ```

3. Escalar recursos en Supabase si es necesario

### 🔵 Rate Limiting Excesivo (P3)

1. Identificar IP/usuario bloqueado en error_logs
2. Verificar si es un usuario legítimo
3. Ajustar límites si son muy restrictivos
4. Bloquear si es ataque

## Communication Plan

### Notificación Interna (Slack)

```
🚨 INCIDENTE P1 - GetionCamarerosParaEventos
Descripción: [descripción breve]
Impacto: [usuarios/datos afectados]
Estado: Investigando / Contenido / Resuelto
Próxima actualización: [tiempo]
```

### Notificación a Usuarios (si aplica)

```
Estimado usuario,
Hemos detectado [descripción sin detalles técnicos].
[Acción requerida si la hay]
Disculpe los inconvenientes.
El Equipo de GetionCamarerosParaEventos
```

## Post-Mortem

Completar dentro de las 48h post-incidente:

1. **Línea de tiempo**: ¿qué pasó y cuándo?
2. **Causa raíz**: ¿por qué pasó?
3. **Impacto**: ¿a quién y qué datos afectó?
4. **Respuesta**: ¿qué se hizo bien? ¿qué se puede mejorar?
5. **Acciones preventivas**: ¿qué cambios se implementarán?
