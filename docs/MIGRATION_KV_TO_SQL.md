# Migración KV Store → Tablas SQL

## Prerrequisitos

1. Las migraciones de Auth Fases 1, 2 y 3 deben estar aplicadas
2. La migración `20260305000004_create_sql_tables.sql` debe estar aplicada
3. Acceso al dashboard de Supabase o Supabase CLI

## Opción A: SQL directo (recomendado)

1. Abrir el **SQL Editor** en el dashboard de Supabase
2. Copiar y pegar el contenido de `scripts/migrate-kv-to-sql.sql`
3. Ejecutar y verificar el resumen al final

## Opción B: Edge Function

1. Desplegar la función:
   ```bash
   supabase functions deploy migrate-kv-to-sql
   ```
2. Ejecutar la migración:
   ```bash
   curl -X POST \
     https://<project-id>.supabase.co/functions/v1/migrate-kv-to-sql \
     -H "Authorization: Bearer <service-role-key>"
   ```

## Verificación

Después de la migración, ejecutar en el SQL Editor:
```sql
SELECT 
  'camareros' as tabla, count(*) as registros FROM public.camareros
UNION ALL
SELECT 'coordinadores', count(*) FROM public.coordinadores
UNION ALL
SELECT 'clientes', count(*) FROM public.clientes
UNION ALL
SELECT 'pedidos', count(*) FROM public.pedidos;
```

Comparar con los conteos del KV store:
```sql
SELECT 
  CASE 
    WHEN key LIKE 'camarero:%' THEN 'camareros'
    WHEN key LIKE 'coordinador:%' THEN 'coordinadores'
    WHEN key LIKE 'cliente:%' THEN 'clientes'
    WHEN key LIKE 'pedido:%' THEN 'pedidos'
  END as tabla,
  count(*) as registros
FROM kv_store_25b11ac0
WHERE key NOT LIKE 'contador:%'
GROUP BY 1;
```

## Notas

- El script es idempotente: se puede ejecutar múltiples veces sin duplicar datos
- Los pedidos con `diaEvento` en formato incorrecto son ignorados (se registran en logs)
- El KV store original NO se elimina: se mantiene como backup
- La eliminación del KV store se hará en una Fase posterior, una vez verificada la migración
