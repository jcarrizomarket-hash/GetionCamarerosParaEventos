/**
 * Utilidades de deduplicación de arrays por ID.
 * Extrae la lógica repetida en múltiples componentes.
 */

/**
 * Deduplica un array de objetos por la propiedad `id`.
 * En caso de duplicados, mantiene el último elemento encontrado.
 *
 * @example
 * const unicos = deduplicarPorId(pedidos);
 */
export function deduplicarPorId<T extends { id: string | number }>(items: T[]): T[] {
  return Array.from(new Map(items.map(item => [item.id, item])).values());
}

/**
 * Deduplica un array de objetos por una clave arbitraria.
 *
 * @example
 * const unicos = deduplicarPorClave(pedidos, 'numero');
 */
export function deduplicarPorClave<T>(items: T[], clave: keyof T): T[] {
  return Array.from(new Map(items.map(item => [item[clave], item])).values());
}
