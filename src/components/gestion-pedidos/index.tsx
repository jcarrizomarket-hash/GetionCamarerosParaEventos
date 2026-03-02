import { logger } from '../../utils/logger';
import { useState, useEffect, useMemo } from 'react';
import { QRControl } from '../qr-control';
import { GestionPedidosProps } from './types';
import { PedidoFilters } from './PedidoFilters';
import { PedidosList } from './PedidosList';
import { PedidoDetail } from './PedidoDetail';
import { PedidoAssignment } from './PedidoAssignment';

// v1.0.3 - Verificación completa de React keys

export function GestionPedidos({ pedidos, setPedidos, camareros, baseUrl, publicAnonKey, cargarDatos }: GestionPedidosProps) {
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [showCalendar, setShowCalendar] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filtroCamarero, setFiltroCamarero] = useState('');
  const [showQRControl, setShowQRControl] = useState(false);

  // Estado para filtros de resumen
  const [periodoFiltro, setPeriodoFiltro] = useState('mensual'); // diario, semanal, mensual

  // Estado temporal para horas de salida (permite edición inmediata)
  const [horaSalidaTemporal, setHoraSalidaTemporal] = useState({});
  const [debounceTimers, setDebounceTimers] = useState({});

  // Deduplicar datos
  const uniquePedidos = useMemo(() => Array.from(new Map(pedidos.map(p => [p.id, p])).values()), [pedidos]);
  const uniqueCamareros = useMemo(() => Array.from(new Map(camareros.map(c => [c.id, c])).values()), [camareros]);

  // --- Efecto para eliminar asignaciones rechazadas después de 5 horas ---
  useEffect(() => {
    const verificarEliminaciones = async () => {
      const ahora = new Date();
      let hayActualizaciones = false;

      for (const pedido of uniquePedidos) {
        const asignaciones = pedido.asignaciones || [];
        const asignacionesFiltradas = asignaciones.filter(a => {
          // Si tiene eliminación programada y ya pasó el tiempo
          if (a.estado === 'rechazado' && a.eliminacionProgramada) {
            const fechaEliminacion = new Date(a.eliminacionProgramada);
            if (ahora >= fechaEliminacion) {
              hayActualizaciones = true;
              return false; // Eliminar esta asignación
            }
          }
          return true; // Mantener esta asignación
        });

        // Si hubo cambios, actualizar el pedido
        if (asignacionesFiltradas.length !== asignaciones.length) {
          try {
            await fetch(`${baseUrl}/pedidos/${pedido.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${publicAnonKey}`
              },
              body: JSON.stringify({
                ...pedido,
                asignaciones: asignacionesFiltradas
              })
            });
          } catch (error) {
            logger.error('Error al eliminar asignación rechazada:', error);
          }
        }
      }

      // Recargar datos si hubo actualizaciones
      if (hayActualizaciones) {
        await cargarDatos();
      }
    };

    // Verificar cada minuto
    const intervalo = setInterval(verificarEliminaciones, 60000);

    // Verificar inmediatamente al montar
    verificarEliminaciones();

    return () => clearInterval(intervalo);
  }, [uniquePedidos, baseUrl, publicAnonKey, cargarDatos]);

  // --- Lógica del Calendario ---
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Domingo
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1; // 0 = Lunes
    return { days, firstDay: adjustedFirstDay };
  };

  const changeMonth = (offset) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    setCurrentDate(newDate);
  };

  const monthData = getDaysInMonth(currentDate);

  // Verificar si un pedido está completo
  const isPedidoCompleto = (pedido) => {
    const totalRequeridos = (parseInt(pedido.cantidadCamareros || 0)) + (parseInt(pedido.cantidadCamareros2 || 0));
    if (totalRequeridos === 0) return false;

    const asignaciones = pedido.asignaciones || [];
    const totalConfirmados = asignaciones.filter(a => a.estado === 'confirmado').length;

    return totalConfirmados >= totalRequeridos;
  };

  // Filtrar pedidos del mes actual para el calendario
  const pedidosMes = uniquePedidos.filter(p => {
    const fecha = new Date(p.diaEvento);
    return fecha.getMonth() === currentDate.getMonth() &&
           fecha.getFullYear() === currentDate.getFullYear();
  });

  // --- Cálculos de Resumen ---
  const getResumenData = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let pedidosFiltrados = [];

    if (periodoFiltro === 'diario') {
      pedidosFiltrados = uniquePedidos.filter(p => {
        const fecha = new Date(p.diaEvento);
        fecha.setHours(0, 0, 0, 0);
        return fecha.getTime() === today.getTime();
      });
    } else if (periodoFiltro === 'semanal') {
      const currentDay = today.getDay();
      const diffToMonday = currentDay === 0 ? 6 : currentDay - 1;
      const monday = new Date(today);
      monday.setDate(today.getDate() - diffToMonday);

      const nextSunday = new Date(monday);
      nextSunday.setDate(monday.getDate() + 6);

      pedidosFiltrados = uniquePedidos.filter(p => {
        const fecha = new Date(p.diaEvento);
        fecha.setHours(0, 0, 0, 0);
        return fecha >= monday && fecha <= nextSunday;
      });
    } else {
      pedidosFiltrados = pedidosMes;
    }

    const totalEventos = pedidosFiltrados.length;
    let totalCamarerosNecesarios = 0;
    let totalEnviados = 0;
    let totalConfirmados = 0;
    let totalFaltantes = 0;

    pedidosFiltrados.forEach(p => {
      const req = (parseInt(p.cantidadCamareros || 0) + parseInt(p.cantidadCamareros2 || 0));
      const asigs = p.asignaciones || [];
      const env = asigs.filter(a => a.estado === 'enviado').length;
      const conf = asigs.filter(a => a.estado === 'confirmado').length;
      const assignedTotal = asigs.length;

      totalCamarerosNecesarios += req;
      totalEnviados += env;
      totalConfirmados += conf;
      totalFaltantes += Math.max(0, req - assignedTotal);
    });

    const totalApercibidos = uniqueCamareros.filter(c => c.estado === 'apercibido').length;
    const totalDisponibles = uniqueCamareros.length - totalApercibidos;

    return {
      totalEventos,
      totalCamarerosNecesarios,
      totalEnviados,
      totalConfirmados,
      totalFaltantes,
      totalDisponibles
    };
  };

  const {
    totalEventos,
    totalCamarerosNecesarios,
    totalEnviados,
    totalConfirmados,
    totalFaltantes,
    totalDisponibles
  } = getResumenData();

  // --- Acciones de Gestión ---

  const agregarCamarero = async (camarero) => {
    if (!selectedPedido || procesando) return;

    const asignaciones = selectedPedido.asignaciones || [];
    const yaAsignado = asignaciones.find(a => a.camareroId === camarero.id);

    if (yaAsignado) {
      alert('Este camarero ya está asignado a este evento');
      return;
    }

    setProcesando(true);

    // Determinar turno y hora de entrada/salida predeterminadas
    const cant1 = parseInt(selectedPedido.cantidadCamareros || 0);
    const asignadosTurno1 = asignaciones.filter((a, idx) => idx < cant1).length;
    const turno = asignadosTurno1 < cant1 ? 1 : 2;

    const nuevaAsignacion = {
      camareroId: camarero.id,
      camareroNombre: `${camarero.nombre} ${camarero.apellido}`,
      camareroNumero: camarero.numero,
      estado: '', // Estado inicial vacío
      turno: turno,
      horaEntrada: turno === 1 ? selectedPedido.horaEntrada : selectedPedido.horaEntrada2,
      horaSalida: turno === 1 ? selectedPedido.horaSalida : selectedPedido.horaSalida2
    };

    const updatedPedido = {
      ...selectedPedido,
      asignaciones: [...asignaciones, nuevaAsignacion]
    };

    try {
      const response = await fetch(`${baseUrl}/pedidos/${selectedPedido.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(updatedPedido)
      });

      if (response.ok) {
        await cargarDatos();
        setSelectedPedido(updatedPedido);
      } else {
        alert('Error al asignar camarero. Por favor intente de nuevo.');
      }
    } catch (error) {
      logger.error('Error al asignar camarero:', error);
      alert('Error de conexión al asignar camarero.');
    } finally {
      setProcesando(false);
    }
  };

  const cambiarEstado = async (camareroId, nuevoEstado) => {
    if (!selectedPedido) return;

    const asignaciones = selectedPedido.asignaciones.map(a => {
      if (a.camareroId === camareroId) {
        // Si rechaza, programar eliminación en 5 horas
        if (nuevoEstado === 'rechazado') {
          return {
            ...a,
            estado: nuevoEstado,
            eliminacionProgramada: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString()
          };
        }
        // Si cambia de rechazado a otro estado, cancelar eliminación
        return {
          ...a,
          estado: nuevoEstado,
          eliminacionProgramada: null
        };
      }
      return a;
    });

    const updatedPedido = {
      ...selectedPedido,
      asignaciones
    };

    try {
      const response = await fetch(`${baseUrl}/pedidos/${selectedPedido.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(updatedPedido)
      });

      if (response.ok) {
        await cargarDatos();
        setSelectedPedido(updatedPedido);
      }
    } catch (error) {
      logger.error('Error al cambiar estado:', error);
    }
  };

  const removerCamarero = async (camareroId) => {
    if (!selectedPedido) return;

    const asignaciones = selectedPedido.asignaciones.filter(a => a.camareroId !== camareroId);

    const updatedPedido = {
      ...selectedPedido,
      asignaciones
    };

    try {
      const response = await fetch(`${baseUrl}/pedidos/${selectedPedido.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(updatedPedido)
      });

      if (response.ok) {
        await cargarDatos();
        setSelectedPedido(updatedPedido);
      }
    } catch (error) {
      logger.error('Error al remover camarero:', error);
    }
  };

  // Listas filtradas
  const pedidosOrdenados = [...uniquePedidos].sort((a, b) =>
    new Date(a.diaEvento).getTime() - new Date(b.diaEvento).getTime()
  );

  const camarerosDisponibles = uniqueCamareros
    .filter(c => {
      // Filtro de búsqueda por nombre/apellido
      const search = filtroCamarero.toLowerCase();
      const matchSearch =
        c.nombre.toLowerCase().includes(search) ||
        c.apellido.toLowerCase().includes(search) ||
        String(c.numero).includes(search);

      if (!matchSearch) return false;

      // Filtro de asignación actual
      if (!selectedPedido) return true;
      return !selectedPedido.asignaciones?.some(a => a.camareroId === c.id);
    })
    .sort((a, b) => a.numero - b.numero);

  // --- TABLA GLOBAL DE ASIGNACIONES ---
  const filasTabla = useMemo(() => {
    let filas = [];

    // 1. Filtrar y Ordenar Pedidos (de menor a mayor, más antiguo primero)
    const pedidosFiltrados = uniquePedidos
        .filter(p => !selectedPedido || p.id === selectedPedido.id)
        .sort((a, b) => new Date(a.diaEvento).getTime() - new Date(b.diaEvento).getTime());

    // 2. Generar filas por pedido (Slots)
    pedidosFiltrados.forEach((pedido, index) => {
        // Alternar colores por grupo de evento
        const esPar = index % 2 === 0;
        const bgEvento = esPar ? 'bg-gray-50' : 'bg-blue-50/30';

        const cant1 = parseInt(pedido.cantidadCamareros || 0);
        const cant2 = parseInt(pedido.cantidadCamareros2 || 0);

        // Crear slots virtuales con IDs únicos
        const slots = [];
        for(let i=0; i<cant1; i++) slots.push({ hora: pedido.horaEntrada, turno: 1, slotId: `t1-${i}` });
        for(let i=0; i<cant2; i++) slots.push({ hora: pedido.horaEntrada2, turno: 2, slotId: `t2-${i}` });

        // Copia de asignaciones para ir consumiendo
        const asignaciones = [...(pedido.asignaciones || [])];

        // Llenar slots
        slots.forEach((slot, slotIdx) => {
            const asignacion = asignaciones.shift(); // Tomar el siguiente camarero asignado

            if (asignacion) {
                filas.push({
                    type: 'asignado',
                    pedido,
                    data: asignacion,
                    hora: slot.hora,
                    turno: slot.turno,
                    bgClase: bgEvento,
                    uniqueId: `${pedido.id}-asig-${asignacion.camareroId}-${slot.slotId}`
                });
            } else {
                filas.push({
                    type: 'faltante',
                    pedido,
                    hora: slot.hora,
                    turno: slot.turno,
                    bgClase: 'bg-white',
                    uniqueId: `${pedido.id}-faltante-${slot.slotId}`
                });
            }
        });

        // Si sobran asignaciones (más de lo requerido), agregarlas también
        asignaciones.forEach((asig, extraIdx) => {
             filas.push({
                type: 'asignado',
                pedido,
                data: asig,
                hora: pedido.horaEntrada,
                turno: 1,
                bgClase: bgEvento,
                extra: true,
                uniqueId: `${pedido.id}-extra-${asig.camareroId}-${extraIdx}`
            });
        });
    });

    return filas;
  }, [uniquePedidos, selectedPedido]);

  // --- EXPORTAR DATOS ---
  const exportarDatos = (filtroTipo) => {
    let pedidosBase = [];
    const today = new Date();
    today.setHours(0,0,0,0);

    if (filtroTipo === 'dia') {
        pedidosBase = uniquePedidos.filter(p => {
            const d = new Date(p.diaEvento);
            d.setHours(0,0,0,0);
            return d.getTime() === today.getTime();
        });
    } else if (filtroTipo === 'semana') {
        const currentDay = today.getDay();
        const diffToMonday = currentDay === 0 ? 6 : currentDay - 1;
        const monday = new Date(today);
        monday.setDate(today.getDate() - diffToMonday);
        const nextSunday = new Date(monday);
        nextSunday.setDate(monday.getDate() + 6);

        pedidosBase = uniquePedidos.filter(p => {
            const d = new Date(p.diaEvento);
            d.setHours(0,0,0,0);
            return d >= monday && d <= nextSunday;
        });
    } else if (filtroTipo === 'pedido') {
        if (selectedPedido) {
            pedidosBase = [selectedPedido];
        } else {
            alert("Por favor seleccione un pedido primero para usar esta opción, o use 'Por Día/Semana'.");
            return;
        }
    } else if (filtroTipo === 'cliente') {
        const clienteNombre = prompt("Ingrese el nombre del cliente a exportar:");
        if (!clienteNombre) return;
        pedidosBase = uniquePedidos.filter(p => p.cliente.toLowerCase().includes(clienteNombre.toLowerCase()));
    } else {
        pedidosBase = uniquePedidos;
    }

    if (pedidosBase.length === 0) {
        alert("No hay datos para exportar con el filtro seleccionado.");
        return;
    }

    // Aplanar datos para CSV
    const filasCSV = [];
    // Header
    filasCSV.push(['Fecha', 'Cliente', 'Lugar', 'Hora Entrada', 'Camarero', 'Estado']);

    pedidosBase.forEach(pedido => {
        const asignaciones = pedido.asignaciones || [];
        const cantTotal = (parseInt(pedido.cantidadCamareros || 0)) + (parseInt(pedido.cantidadCamareros2 || 0));

        if (asignaciones.length === 0 && cantTotal > 0) {
             for(let i=0; i<cantTotal; i++) {
                filasCSV.push([
                    new Date(pedido.diaEvento).toLocaleDateString('es-ES'),
                    `"${pedido.cliente}"`,
                    `"${pedido.lugar}"`,
                    pedido.horaEntrada,
                    '-- VACANTE --',
                    'PENDIENTE'
                ]);
             }
        } else {
            asignaciones.forEach(asig => {
                filasCSV.push([
                    new Date(pedido.diaEvento).toLocaleDateString('es-ES'),
                    `"${pedido.cliente}"`,
                    `"${pedido.lugar}"`,
                    pedido.horaEntrada,
                    `"${asig.camareroNombre}"`,
                    asig.estado ? asig.estado.toUpperCase() : 'PENDIENTE'
                ]);
            });
            const faltantes = Math.max(0, cantTotal - asignaciones.length);
            for(let i=0; i<faltantes; i++) {
                filasCSV.push([
                    new Date(pedido.diaEvento).toLocaleDateString('es-ES'),
                    `"${pedido.cliente}"`,
                    `"${pedido.lugar}"`,
                    pedido.horaEntrada,
                    '-- VACANTE --',
                    'PENDIENTE'
                ]);
            }
        }
    });

    // Generar Blob y Descargar
    const csvContent = filasCSV.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `reporte_pedidos_${filtroTipo}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- FUNCIÓN PARA CALCULAR DIFERENCIA DE HORAS ---
  const calcularHoras = (horaEntrada, horaSalida) => {
    if (!horaEntrada || !horaSalida) return '-';

    try {
      const [horaE, minE] = horaEntrada.split(':').map(Number);
      const [horaS, minS] = horaSalida.split(':').map(Number);

      let totalMinutos = (horaS * 60 + minS) - (horaE * 60 + minE);

      // Si la hora de salida es menor, asumir que es al día siguiente
      if (totalMinutos < 0) {
        totalMinutos += 24 * 60;
      }

      const horas = Math.floor(totalMinutos / 60);
      const minutos = totalMinutos % 60;

      return `${horas}h ${minutos}m`;
    } catch (error) {
      return '-';
    }
  };

  // --- FUNCIÓN PARA ACTUALIZAR HORA DE SALIDA INDIVIDUAL ---
  const actualizarHoraSalidaIndividual = async (pedidoId, camareroId, nuevaHoraSalida) => {
    // Actualizar estado temporal inmediatamente
    const key = `${pedidoId}-${camareroId}`;
    setHoraSalidaTemporal(prev => ({
      ...prev,
      [key]: nuevaHoraSalida
    }));

    // Cancelar timer anterior si existe
    if (debounceTimers[key]) {
      clearTimeout(debounceTimers[key]);
    }

    // Crear nuevo timer para guardar después de 1 segundo sin cambios
    const newTimer = setTimeout(async () => {
      const pedido = uniquePedidos.find(p => p.id === pedidoId);
      if (!pedido) return;

      const asignaciones = pedido.asignaciones.map(a =>
        a.camareroId === camareroId
          ? { ...a, horaSalida: nuevaHoraSalida }
          : a
      );

      const updatedPedido = {
        ...pedido,
        asignaciones
      };

      try {
        const response = await fetch(`${baseUrl}/pedidos/${pedidoId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify(updatedPedido)
        });

        if (response.ok) {
          await cargarDatos();
          // Limpiar estado temporal después de guardar
          setHoraSalidaTemporal(prev => {
            const newState = { ...prev };
            delete newState[key];
            return newState;
          });
        }
      } catch (error) {
        logger.error('Error al actualizar hora de salida:', error);
      }
    }, 1000);

    setDebounceTimers(prev => ({
      ...prev,
      [key]: newTimer
    }));
  };

  // Función para obtener el valor actual de hora de salida individual (temporal o del servidor)
  const getHoraSalidaIndividual = (pedidoId, camareroId) => {
    const key = `${pedidoId}-${camareroId}`;

    // Si hay valor temporal, usarlo
    if (horaSalidaTemporal[key] !== undefined) {
      return horaSalidaTemporal[key];
    }

    // Si no, obtener del servidor
    const pedido = uniquePedidos.find(p => p.id === pedidoId);
    if (!pedido) return '';

    const asignacion = pedido.asignaciones?.find(a => a.camareroId === camareroId);
    return asignacion?.horaSalida || '';
  };

  // --- VISTA PRINCIPAL (SIN SELECCIÓN) ---
  if (!selectedPedido) {
    return (
      <div className="space-y-6">
        <PedidoFilters
          periodoFiltro={periodoFiltro}
          setPeriodoFiltro={setPeriodoFiltro}
          exportarDatos={exportarDatos}
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
        exportarDatos={exportarDatos}
        setShowQRControl={setShowQRControl}
      />

      <PedidoAssignment
        selectedPedido={selectedPedido}
        camarerosDisponibles={camarerosDisponibles}
        filtroCamarero={filtroCamarero}
        setFiltroCamarero={setFiltroCamarero}
        agregarCamarero={agregarCamarero}
        cambiarEstado={cambiarEstado}
        removerCamarero={removerCamarero}
        procesando={procesando}
        requeridos={requeridos}
        asignadosCount={asignadosCount}
      />

      {/* --- TABLA DETALLE (FILTRADA PARA EL EVENTO) --- */}
      {selectedPedido.asignaciones && selectedPedido.asignaciones.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Resumen del Equipo</h2>
          </div>
          <table className="w-full">
            <thead className="bg-white border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Camarero</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {selectedPedido.asignaciones.map((item, idx) => {
                const camareroInfo = uniqueCamareros.find(c => c.id === item.camareroId);
                return (
                  <tr key={`${selectedPedido.id}-${item.camareroId}-${idx}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.camareroNombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {camareroInfo?.telefono || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.estado === 'confirmado' ? 'bg-green-100 text-green-800' :
                        item.estado === 'enviado' ? 'bg-orange-100 text-orange-800' :
                        item.estado === 'rechazado' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.estado === 'confirmado' ? 'Confirmado' :
                         item.estado === 'enviado' ? 'Enviado' :
                         item.estado === 'rechazado' ? 'Rechazado' : 'Pendiente'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

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
