import { logger } from '../../utils/logger';
import { useState } from 'react';
import { useToast } from '../../hooks/useToast';
import { playNotificationSound, loadNotifConfig } from '../../hooks/useNotificationSounds';
import { isPedidoCompleto } from './utils';

function fireNotif(id: Parameters<typeof playNotificationSound>[0]) {
  const cfg = loadNotifConfig();
  const n = cfg.find(c => c.id === id);
  if (n?.habilitada) playNotificationSound(id, n.volumen);
}

interface PedidoActionsConfig {
  baseUrl: string;
  publicAnonKey: string;
  cargarDatos: () => Promise<void>;
}

export function usePedidoActions({ baseUrl, publicAnonKey, cargarDatos }: PedidoActionsConfig) {
  const [procesando, setProcesando] = useState(false);
  const toast = useToast();

  const agregarCamarero = async (camarero: any, selectedPedido: any, setSelectedPedido: (p: any) => void) => {
    if (!selectedPedido || procesando) return;
    const asignaciones = selectedPedido.asignaciones || [];
    const yaAsignado = asignaciones.find((a: any) => a.camareroId === camarero.id);
    if (yaAsignado) { toast.warning('Este camarero ya está asignado a este evento'); return; }
    setProcesando(true);
    const cant1 = parseInt(selectedPedido.cantidadCamareros || 0);
    const asignadosTurno1 = asignaciones.filter((a: any) => a.turno === 1).length;
    const turno = asignadosTurno1 < cant1 ? 1 : 2;
    const nuevaAsignacion = {
      camareroId: camarero.id,
      camareroNombre: `${camarero.nombre} ${camarero.apellido}`,
      camareroNumero: camarero.numero,
      estado: '',
      turno,
      horaEntrada: turno === 1 ? selectedPedido.horaEntrada : selectedPedido.horaEntrada2,
      horaSalida: turno === 1 ? selectedPedido.horaSalida : selectedPedido.horaSalida2
    };
    const updatedPedido = { ...selectedPedido, asignaciones: [...asignaciones, nuevaAsignacion] };
    try {
      const response = await fetch(`${baseUrl}/pedidos/${selectedPedido.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
        body: JSON.stringify(updatedPedido)
      });
      if (response.ok) { await cargarDatos(); setSelectedPedido(updatedPedido); }
      else { toast.error('Error al asignar camarero. Por favor intente de nuevo.'); }
    } catch (error) {
      logger.error('Error al asignar camarero:', error);
      toast.error('Error de conexión al asignar camarero.');
    } finally {
      setProcesando(false);
    }
  };

  const cambiarEstado = async (camareroId: any, nuevoEstado: string, selectedPedido: any, setSelectedPedido: (p: any) => void) => {
    if (!selectedPedido) return;
    const asignaciones = selectedPedido.asignaciones.map((a: any) => {
      if (a.camareroId === camareroId) {
        if (nuevoEstado === 'rechazado') {
          return { ...a, estado: nuevoEstado, eliminacionProgramada: new Date(Date.now() + 10 * 60 * 1000).toISOString() };
        }
        return { ...a, estado: nuevoEstado, eliminacionProgramada: null };
      }
      return a;
    });
    const updatedPedido = { ...selectedPedido, asignaciones };
    try {
      const response = await fetch(`${baseUrl}/pedidos/${selectedPedido.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
        body: JSON.stringify(updatedPedido)
      });
      if (response.ok) {
        await cargarDatos();
        setSelectedPedido(updatedPedido);
        // ── Sonidos ──────────────────────────────────────────────────────
        if (nuevoEstado === 'confirmado') {
          // Primero chequeamos si con este confirmado el pedido queda completo
          if (isPedidoCompleto(updatedPedido)) {
            fireNotif('evento_completo');
          } else {
            fireNotif('perfil_acepta');
          }
        } else if (nuevoEstado === 'rechazado') {
          fireNotif('perfil_rechaza');
        }
        // ─────────────────────────────────────────────────────────────────
      }
    } catch (error) { logger.error('Error al cambiar estado:', error); }
  };

  const removerCamarero = async (camareroId: any, selectedPedido: any, setSelectedPedido: (p: any) => void) => {
    if (!selectedPedido) return;
    const asignaciones = selectedPedido.asignaciones.filter((a: any) => a.camareroId !== camareroId);
    const updatedPedido = { ...selectedPedido, asignaciones };
    try {
      const response = await fetch(`${baseUrl}/pedidos/${selectedPedido.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
        body: JSON.stringify(updatedPedido)
      });
      if (response.ok) { await cargarDatos(); setSelectedPedido(updatedPedido); }
    } catch (error) { logger.error('Error al remover camarero:', error); }
  };

  return { procesando, agregarCamarero, cambiarEstado, removerCamarero };
}
