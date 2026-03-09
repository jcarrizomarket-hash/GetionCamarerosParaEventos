import { logger } from '../../utils/logger';
import { supabase } from '../../hooks/useAuth';
import { useState, useEffect, useMemo } from 'react';
import { QRControl } from '../qr-control';
import { GestionPedidosProps } from './types';
import { PedidoFilters } from './PedidoFilters';
import { PedidosList } from './PedidosList';
import { PedidoDetail } from './PedidoDetail';
import { PedidoAssignment } from './PedidoAssignment';
import { getDaysInMonth, isPedidoCompleto, buildFilasTabla, getResumenData, exportarDatos, calcularHoras } from './utils';
import { PedidoSummaryTable } from './PedidoSummaryTable';
import { usePedidoActions } from './usePedidoActions';
import { useHoraSalida } from './useHoraSalida';
import { deduplicarPorId } from '../../utils/deduplicar';
import { useToast } from '../../hooks/useToast';

// v1.0.3 - Verificación completa de React keys

export function GestionPedidos({ pedidos, setPedidos, camareros, baseUrl, publicAnonKey, cargarDatos }: GestionPedidosProps) {
  const [selectedPedido, setSelectedPedido] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filtroCamarero, setFiltroCamarero] = useState('');
  const [showQRControl, setShowQRControl] = useState(false);
  const [periodoFiltro, setPeriodoFiltro] = useState('mensual');
  const toast = useToast();

  const uniquePedidos = useMemo(() => deduplicarPorId(pedidos), [pedidos]);
  const uniqueCamareros = useMemo(() => deduplicarPorId(camareros), [camareros]);

  const { procesando, agregarCamarero, cambiarEstado, removerCamarero } = usePedidoActions({ baseUrl, publicAnonKey, cargarDatos: cargarDatos as () => Promise<void> });
  const { actualizarHoraSalidaIndividual, getHoraSalidaIndividual } = useHoraSalida({ uniquePedidos, baseUrl, publicAnonKey, cargarDatos: cargarDatos as () => Promise<void> });

  // --- Efecto para eliminar asignaciones rechazadas después de 10 minutos ---
  useEffect(() => {
    const verificarEliminaciones = async () => {
      const ahora = new Date();
      let hayActualizaciones = false;
      for (const pedido of uniquePedidos) {
        const asignaciones = pedido.asignaciones || [];
        const asignacionesFiltradas = asignaciones.filter(a => {
          if (a.estado === 'rechazado' && a.eliminacionProgramada) {
            const fechaEliminacion = new Date(a.eliminacionProgramada);
            if (ahora >= fechaEliminacion) { hayActualizaciones = true; return false; }
          }
          return true;
        });
        if (asignacionesFiltradas.length !== asignaciones.length) {
          try {
            await fetch(`${baseUrl}/pedidos/${pedido.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || publicAnonKey}` },
              body: JSON.stringify({ ...pedido, asignaciones: asignacionesFiltradas })
            });
          } catch (error) { logger.error('Error al eliminar asignación rechazada:', error); }
        }
      }
      if (hayActualizaciones) await cargarDatos();
    };
    const intervalo = setInterval(verificarEliminaciones, 60000);
    verificarEliminaciones();
    return () => clearInterval(intervalo);
  }, [uniquePedidos, baseUrl, publicAnonKey, cargarDatos]);

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const monthData = getDaysInMonth(currentDate);

  const pedidosMes = uniquePedidos.filter(p => {
    const fecha = new Date(p.diaEvento);
    return fecha.getMonth() === currentDate.getMonth() && fecha.getFullYear() === currentDate.getFullYear();
  });

  const { totalEventos, totalCamarerosNecesarios, totalEnviados, totalConfirmados, totalFaltantes, totalDisponibles } =
    getResumenData(uniquePedidos, uniqueCamareros, periodoFiltro, pedidosMes);

  const pedidosOrdenados = [...uniquePedidos].sort((a, b) =>
    new Date(a.diaEvento).getTime() - new Date(b.diaEvento).getTime()
  );

  const camarerosDisponibles = uniqueCamareros
    .filter(c => {
      const search = filtroCamarero.toLowerCase();
      const matchSearch =
        c.nombre.toLowerCase().includes(search) ||
        c.apellido.toLowerCase().includes(search) ||
        String(c.numero).includes(search);
      if (!matchSearch) return false;
      if (!selectedPedido) return true;
      return !selectedPedido.asignaciones?.some(a => a.camareroId === c.id);
    })
    .sort((a, b) => a.numero - b.numero);

  const filasTabla = useMemo(() => buildFilasTabla(uniquePedidos, selectedPedido), [uniquePedidos, selectedPedido]);

  const handleExportarDatos = (filtroTipo: string) => exportarDatos(filtroTipo, uniquePedidos, selectedPedido, (msg, type) => type === 'warning' ? toast.warning(msg) : toast.error(msg));

  // --- VISTA PRINCIPAL (SIN SELECCIÓN) ---
  if (!selectedPedido) {
    return (
      <div className="space-y-6">
        <PedidoFilters
          periodoFiltro={periodoFiltro}
          setPeriodoFiltro={setPeriodoFiltro}
          exportarDatos={handleExportarDatos}
          totalEventos={totalEventos}
          totalCamarerosNecesarios={totalCamarerosNecesarios}
          totalEnviados={totalEnviados}
          totalConfirmados={totalConfirmados}
          totalFaltantes={totalFaltantes}
          totalDisponibles={totalDisponibles}
        />
        <PedidosList
          currentDate={currentDate}
          changeMonth={changeMonth}
          monthData={monthData}
          pedidosMes={pedidosMes}
          pedidosOrdenados={pedidosOrdenados}
          filasTabla={filasTabla}
          setSelectedPedido={setSelectedPedido}
          isPedidoCompleto={isPedidoCompleto}
          getHoraSalidaIndividual={getHoraSalidaIndividual}
          actualizarHoraSalidaIndividual={actualizarHoraSalidaIndividual}
          calcularHoras={calcularHoras}
        />
      </div>
    );
  }

  // --- VISTA MODO ENFOQUE (CON SELECCIÓN) ---
  const requeridos = (parseInt(selectedPedido.cantidadCamareros || 0)) + (parseInt(selectedPedido.cantidadCamareros2 || 0));
  const asignadosCount = selectedPedido.asignaciones?.length || 0;
  const faltantes = Math.max(0, requeridos - asignadosCount);
  const isCompleto = isPedidoCompleto(selectedPedido);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PedidoDetail
        selectedPedido={selectedPedido}
        setSelectedPedido={setSelectedPedido}
        requeridos={requeridos}
        asignadosCount={asignadosCount}
        faltantes={faltantes}
        isCompleto={isCompleto}
        exportarDatos={handleExportarDatos}
        setShowQRControl={setShowQRControl}
      />

      <PedidoAssignment
        selectedPedido={selectedPedido}
        camarerosDisponibles={camarerosDisponibles}
        filtroCamarero={filtroCamarero}
        setFiltroCamarero={setFiltroCamarero}
        agregarCamarero={(camarero, turno) => agregarCamarero(camarero, selectedPedido, setSelectedPedido, turno)}
        cambiarEstado={(camareroId, nuevoEstado) => cambiarEstado(camareroId, nuevoEstado, selectedPedido, setSelectedPedido)}
        removerCamarero={(camareroId) => removerCamarero(camareroId, selectedPedido, setSelectedPedido)}
        procesando={procesando}
        requeridos={requeridos}
        asignadosCount={asignadosCount}
      />

      <PedidoSummaryTable selectedPedido={selectedPedido} uniqueCamareros={uniqueCamareros} />

      {/* Modal de Control QR */}
      {showQRControl && selectedPedido && (
        <QRControl
          pedido={selectedPedido}
          baseUrl={baseUrl}
          publicAnonKey={publicAnonKey}
          onClose={() => setShowQRControl(false)}
        />
      )}
    </div>
  );
}
