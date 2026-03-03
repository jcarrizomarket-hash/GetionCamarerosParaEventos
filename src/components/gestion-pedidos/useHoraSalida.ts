import { logger } from '../../utils/logger';
import { useState } from 'react';

interface HoraSalidaConfig {
  uniquePedidos: any[];
  baseUrl: string;
  publicAnonKey: string;
  cargarDatos: () => void | Promise<void>;
}

export function useHoraSalida({ uniquePedidos, baseUrl, publicAnonKey, cargarDatos }: HoraSalidaConfig) {
  const [horaSalidaTemporal, setHoraSalidaTemporal] = useState<Record<string, string>>({});
  const [debounceTimers, setDebounceTimers] = useState<Record<string, any>>({});

  const actualizarHoraSalidaIndividual = async (pedidoId: any, camareroId: any, nuevaHoraSalida: string) => {
    const key = `${pedidoId}-${camareroId}`;
    setHoraSalidaTemporal(prev => ({ ...prev, [key]: nuevaHoraSalida }));
    if (debounceTimers[key]) clearTimeout(debounceTimers[key]);

    const newTimer = setTimeout(async () => {
      const pedido = uniquePedidos.find(p => p.id === pedidoId);
      if (!pedido) return;
      const asignaciones = pedido.asignaciones.map((a: any) =>
        a.camareroId === camareroId ? { ...a, horaSalida: nuevaHoraSalida } : a
      );
      const updatedPedido = { ...pedido, asignaciones };
      try {
        const response = await fetch(`${baseUrl}/pedidos/${pedidoId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
          body: JSON.stringify(updatedPedido)
        });
        if (response.ok) {
          await cargarDatos();
          setHoraSalidaTemporal(prev => { const s = { ...prev }; delete s[key]; return s; });
        }
      } catch (error) { logger.error('Error al actualizar hora de salida:', error); }
    }, 1000);

    setDebounceTimers(prev => ({ ...prev, [key]: newTimer }));
  };

  const getHoraSalidaIndividual = (pedidoId: any, camareroId: any): string => {
    const key = `${pedidoId}-${camareroId}`;
    if (horaSalidaTemporal[key] !== undefined) return horaSalidaTemporal[key];
    const pedido = uniquePedidos.find(p => p.id === pedidoId);
    if (!pedido) return '';
    const asignacion = pedido.asignaciones?.find((a: any) => a.camareroId === camareroId);
    return asignacion?.horaSalida || '';
  };

  return { actualizarHoraSalidaIndividual, getHoraSalidaIndividual };
}
