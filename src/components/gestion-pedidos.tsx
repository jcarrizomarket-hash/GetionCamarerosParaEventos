import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Users, X, AlertCircle, Clock, Download, UserCheck, Check, ArrowLeft, Search, Bell } from 'lucide-react';

// v1.1.0 - Polling automático + notificaciones de estado en tiempo real
interface GestionPedidosProps {
  pedidos: any[];
  setPedidos: (pedidos: any[]) => void;
  camareros: any[];
  baseUrl: string;
  publicAnonKey: string;
  cargarDatos: () => void;
}

export function GestionPedidos({ pedidos, setPedidos, camareros, baseUrl, publicAnonKey, cargarDatos }: GestionPedidosProps) {
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [showCalendar, setShowCalendar] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filtroCamarero, setFiltroCamarero] = useState('');
  const [alertas, setAlertas] = useState([]);

  // Ref para trackear estados anteriores y detectar cambios
  const estadosAnteriores = useRef({});
  
  // Estado para filtros de resumen
  const [periodoFiltro, setPeriodoFiltro] = useState('mensual'); // diario, semanal, mensual
  
  // Estado temporal para horas de salida (permite edición inmediata)
  const [horaSalidaTemporal, setHoraSalidaTemporal] = useState({});
  const [debounceTimers, setDebounceTimers] = useState({});

  // Deduplicar datos
  const uniquePedidos = useMemo(() => Array.from(new Map(pedidos.map(p => [p.id, p])).values()), [pedidos]);
  const uniqueCamareros = useMemo(() => Array.from(new Map(camareros.map(c => [c.id, c])).values()), [camareros]);

  // --- Mostrar alerta temporal ---
  const mostrarAlerta = useCallback((mensaje, tipo) => {
    const id = `alerta-${Date.now()}`;
    setAlertas(prev => [...prev, { id, mensaje, tipo }]);
    setTimeout(() => {
      setAlertas(prev => prev.filter(a => a.id !== id));
    }, 6000);
  }, []);

  // --- Detectar cambios de estado automáticamente ---
  useEffect(() => {
    uniquePedidos.forEach(pedido => {
      const asignaciones = pedido.asignaciones || [];
      asignaciones.forEach(asig => {
        const key = `${pedido.id}-${asig.camareroId}`;
        const estadoAnterior = estadosAnteriores.current[key];
        const estadoActual = asig.estado;
        if (estadoAnterior && estadoAnterior !== estadoActual) {
          const nombre = asig.camareroNombre || `#${asig.camareroNumero}`;
          if (estadoActual === 'confirmado') {
            mostrarAlerta(`✅ ${nombre} confirmó su asistencia a "${pedido.cliente}"`, 'confirmado');
          } else if (estadoActual === 'rechazado') {
            mostrarAlerta(`❌ ${nombre} rechazó el servicio en "${pedido.cliente}"`, 'rechazado');
          }
        }
        estadosAnteriores.current[key] = estadoActual;
      });
    });
  }, [uniquePedidos, mostrarAlerta]);

  // --- Polling automático cada 15 segundos ---
  useEffect(() => {
    const polling = setInterval(() => {
      cargarDatos();
    }, 15000);
    return () => clearInterval(polling);
  }, [cargarDatos]);

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
            console.error('Error al eliminar asignación rechazada:', error);
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
      // Faltantes: huecos sin cubrir (req - assigned).
      // Si se quiere "faltantes por confirmar" sería otra cosa.
      // Pero para gestión, "faltantes" suele ser "aún no tengo a nadie ahí".
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
      console.error('Error al asignar camarero:', error);
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
      console.error('Error al cambiar estado:', error);
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
      console.error('Error al remover camarero:', error);
    }
  };

  // Listas filtradas
  const pedidosOrdenados = [...uniquePedidos].sort((a, b) => 
    new Date(a.diaEvento) - new Date(b.diaEvento)
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

  // --- TABLA GLOBAL DE ASIGNACIONES (SOLICITADA) ---
  const filasTabla = useMemo(() => {
    let filas = [];
    
    // 1. Filtrar y Ordenar Pedidos (de menor a mayor, más antiguo primero)
    const pedidosFiltrados = uniquePedidos
        .filter(p => !selectedPedido || p.id === selectedPedido.id)
        .sort((a, b) => new Date(a.diaEvento) - new Date(b.diaEvento));

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
                    bgClase: bgEvento, // Hereda color del evento
                    uniqueId: `${pedido.id}-asig-${asignacion.camareroId}-${slot.slotId}`
                });
            } else {
                filas.push({
                    type: 'faltante',
                    pedido,
                    hora: slot.hora,
                    turno: slot.turno,
                    bgClase: 'bg-white', // Faltantes siempre en blanco
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
                hora: pedido.horaEntrada, // Default
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
    let datosExportar = [];
    const today = new Date();
    today.setHours(0,0,0,0);

    // Filtrar los datos base (filasTabla ya tiene la estructura aplanada, pero puede tener muchos datos si no hay selectedPedido)
    // Sin embargo, filasTabla se recalcula basado en uniquePedidos.
    // Para la exportación queremos flexibilidad, así que usaremos uniquePedidos como base y reconstruiremos la lógica plana
    // o reutilizaremos filasTabla si ya está filtrada (pero filasTabla muestra TODO si no hay selectedPedido).
    
    // Mejor reconstruir para tener control total del filtro de exportación independiente de la vista
    let pedidosBase = [];

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
        // Default o Todos
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
        
        // Si no hay asignaciones, al menos mostramos el pedido como vacante
        if (asignaciones.length === 0 && cantTotal > 0) {
             for(let i=0; i<cantTotal; i++) {
                filasCSV.push([
                    new Date(pedido.diaEvento).toLocaleDateString('es-ES'),
                    `"${pedido.cliente}"`, // Comillas para evitar problemas con comas
                    `"${pedido.lugar}"`,
                    pedido.horaEntrada,
                    '-- VACANTE --',
                    'PENDIENTE'
                ]);
             }
        } else {
            // Asignados
            asignaciones.forEach(asig => {
                filasCSV.push([
                    new Date(pedido.diaEvento).toLocaleDateString('es-ES'),
                    `"${pedido.cliente}"`,
                    `"${pedido.lugar}"`,
                    pedido.horaEntrada, // Podría refinarse si es turno 2, pero simplificamos a hora entrada evento
                    `"${asig.camareroNombre}"`,
                    asig.estado ? asig.estado.toUpperCase() : 'PENDIENTE'
                ]);
            });
            // Faltantes (si queremos que salgan en el reporte)
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
      
      // Actualizar la hora de salida en la asignación específica del camarero
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
        console.error('Error al actualizar hora de salida:', error);
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
        {/* --- ALERTAS DE ESTADO EN TIEMPO REAL --- */}
        {alertas.length > 0 && (
          <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
            {alertas.map(alerta => (
              <div
                key={alerta.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium animate-in slide-in-from-right-4 ${
                  alerta.tipo === 'confirmado'
                    ? 'bg-green-50 border-green-300 text-green-800'
                    : 'bg-red-50 border-red-300 text-red-800'
                }`}
              >
                <Bell className="w-4 h-4 flex-shrink-0" />
                <span>{alerta.mensaje}</span>
              </div>
            ))}
          </div>
        )}

        {/* --- BOTONES INFORMATIVOS (RESUMEN) --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Periodo:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              {['diario', 'semanal', 'mensual'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriodoFiltro(p)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${
                    periodoFiltro === p ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          
          {/* Botón Exportar */}
          <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-md text-xs font-medium border border-green-200 transition-colors">
                <Download className="w-4 h-4" />
                Exportar
            </button>
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 hidden group-hover:block z-50">
                <div className="p-1">
                    <button key="export-dia" onClick={() => exportarDatos('dia')} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">Por Día (Hoy)</button>
                    <button key="export-semana" onClick={() => exportarDatos('semana')} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">Por Semana (Actual)</button>
                    <button key="export-cliente" onClick={() => exportarDatos('cliente')} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">Por Cliente</button>
                </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div key="metric-eventos" className="flex items-center gap-3 px-4 py-2 bg-blue-50 rounded-lg border border-blue-100">
              <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-blue-600 font-medium uppercase">Eventos</p>
                <p className="text-lg font-bold text-blue-800">{totalEventos}</p>
              </div>
            </div>

            <div key="metric-necesarios" className="flex items-center gap-3 px-4 py-2 bg-purple-50 rounded-lg border border-purple-100">
              <div className="p-2 bg-purple-100 rounded-full text-purple-600">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-purple-600 font-medium uppercase">Necesarios</p>
                <p className="text-lg font-bold text-purple-800">{totalCamarerosNecesarios}</p>
              </div>
            </div>

            <div key="metric-disponibles" className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <div className="p-2 bg-gray-100 rounded-full text-gray-600">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium uppercase">Disp. Plantilla</p>
                <p className="text-lg font-bold text-gray-800">{totalDisponibles}</p>
              </div>
            </div>

            <div key="metric-enviados" className="flex items-center gap-3 px-4 py-2 bg-amber-50 rounded-lg border border-amber-100">
              <div className="p-2 bg-amber-100 rounded-full text-amber-600">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-amber-600 font-medium uppercase">Enviados</p>
                <p className="text-lg font-bold text-amber-800">{totalEnviados}</p>
              </div>
            </div>

            <div key="metric-confirmados" className="flex items-center gap-3 px-4 py-2 bg-green-50 rounded-lg border border-green-100">
              <div className="p-2 bg-green-100 rounded-full text-green-600">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-green-600 font-medium uppercase">Confirmados</p>
                <p className="text-lg font-bold text-green-800">{totalConfirmados}</p>
              </div>
            </div>

            <div key="metric-faltantes" className="flex items-center gap-3 px-4 py-2 bg-red-50 rounded-lg border border-red-100">
              <div className="p-2 bg-red-100 rounded-full text-red-600">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-red-600 font-medium uppercase">Faltantes</p>
                <p className="text-lg font-bold text-red-800">{totalFaltantes}</p>
              </div>
            </div>
          </div>
        </div>

        {/* --- CALENDARIO --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 flex items-center justify-between bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Seleccionar Evento
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white rounded-lg border px-2 py-1">
                <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-100 rounded-full">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-medium text-sm w-32 text-center">
                  {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                </span>
                <button onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-100 rounded-full">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden border border-gray-200">
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
                <div key={day} className="bg-gray-50 p-2 text-center text-xs font-semibold text-gray-500 uppercase">
                  {day}
                </div>
              ))}
              
              {/* Días vacíos */}
              {Array.from({ length: monthData.firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-white min-h-[100px]"></div>
              ))}
              
              {/* Días del mes */}
              {Array.from({ length: monthData.days }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const pedidosDia = pedidosMes.filter(p => p.diaEvento === dateStr);
                
                return (
                  <div key={day} className="bg-white p-2 min-h-[100px] hover:bg-gray-50 transition-colors">
                    <div className="font-medium text-gray-400 mb-1 text-sm">{day}</div>
                    <div className="space-y-1">
                      {pedidosDia.map((pedido, idx) => {
                        const completo = isPedidoCompleto(pedido);
                        return (
                          <div 
                            key={pedido.id || idx}
                            className={`text-xs p-1.5 rounded border truncate cursor-pointer transition-all hover:scale-105 shadow-sm ${
                              completo 
                                ? 'bg-green-100 border-green-200 text-green-800' 
                                : 'bg-red-50 border-red-200 text-red-800'
                            }`}
                            onClick={() => setSelectedPedido(pedido)}
                            title="Click para gestionar este evento"
                          >
                            <div className="font-bold">{pedido.numero}</div>
                            <div className="truncate opacity-90">{pedido.cliente}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* --- LISTA DE EVENTOS PRÓXIMOS (Como alternativa al calendario) --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-800">Próximos Eventos</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {pedidosOrdenados.filter(p => new Date(p.diaEvento) >= new Date().setHours(0,0,0,0)).slice(0, 5).map(pedido => {
              const totalReq = (parseInt(pedido.cantidadCamareros || 0)) + (parseInt(pedido.cantidadCamareros2 || 0));
              const asigs = pedido.asignaciones || [];
              const enviados = asigs.filter(a => a.estado === 'enviado').length;
              const confirmados = asigs.filter(a => a.estado === 'confirmado').length;
              const asignadosTotal = asigs.length;
              const faltantes = Math.max(0, totalReq - asignadosTotal);

              return (
                <div 
                  key={pedido.id} 
                  className="p-4 hover:bg-blue-50 transition-colors cursor-pointer flex items-center justify-between"
                  onClick={() => setSelectedPedido(pedido)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900">{pedido.cliente}</span>
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500">{pedido.numero}</span>
                    </div>
                    <div className="text-sm text-gray-500 flex flex-wrap items-center gap-4 mb-2">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {new Date(pedido.diaEvento).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {pedido.horaEntrada}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                       <span key="pedida" className="text-gray-500" title="Total Pedida">
                         Pedida: {totalReq}
                       </span>
                       <span key="sep1" className="text-gray-300">|</span>
                       <span key="enviados" className="text-amber-700" title="Enviados">
                         Enviados: {enviados}
                       </span>
                       <span key="sep2" className="text-gray-300">|</span>
                       <span key="confirmados" className="text-green-700" title="Confirmados">
                         Confirmados: {confirmados}
                       </span>
                       <span key="sep3" className="text-gray-300">|</span>
                       <span key="faltantes" className="text-red-600" title="Faltantes por asignar">
                         Faltantes: {faltantes}
                       </span>
                    </div>
                  </div>
                  <div className="text-blue-600 pl-4">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* --- TABLA GLOBAL DE ASIGNACIONES (SOLICITADA) --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">Estado Global de Asignaciones</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Día</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Lugar</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Hora Entrada</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Hora Salida</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Horas</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Camarero</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Situación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filasTabla.length === 0 ? (
                   <tr>
                     <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                       No hay eventos o camareros asignados en el periodo seleccionado.
                     </td>
                   </tr>
                ) : (
                  filasTabla.map((item) => {
                     // Determinar el color de la situación
                     let situationClass = 'bg-gray-100 text-gray-800'; // Default / Sin enviar
                     let situationLabel = 'Pendiente';
                     let camareroLabel = '-';
                     let isFaltante = false;

                     if (item.type === 'asignado') {
                         camareroLabel = item.data.camareroNombre;
                         if (item.data.estado === 'enviado') {
                           situationClass = 'bg-amber-100 text-amber-800';
                           situationLabel = 'Mensaje Enviado';
                         } else if (item.data.estado === 'confirmado') {
                           situationClass = 'bg-green-100 text-green-800';
                           situationLabel = 'Confirmado';
                         } else if (item.data.estado === 'rechazado') {
                           situationClass = 'bg-red-100 text-red-800 font-bold';
                           situationLabel = 'Rechazado';
                         } else {
                           situationLabel = 'Mensaje sin enviar';
                         }
                     } else {
                         // Faltante
                         isFaltante = true;
                         situationClass = 'bg-red-50 text-red-600 border border-red-100';
                         situationLabel = 'Sin Asignar';
                         camareroLabel = <span className="text-red-400 italic font-normal">-- Vacante --</span>;
                     }
                     
                     return (
                      <tr key={item.uniqueId} className={`${item.bgClase} hover:opacity-90 transition-opacity`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {new Date(item.pedido.diaEvento).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.pedido.cliente}
                        </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {item.pedido.lugar}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {item.hora || (item.type === 'asignado' ? item.data.horaEntrada : '-')}
                          {item.turno === 2 && <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">2º Turno</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {item.type === 'asignado' ? (
                            <input
                              type="time"
                              value={getHoraSalidaIndividual(item.pedido.id, item.data.camareroId)}
                              onChange={(e) => actualizarHoraSalidaIndividual(item.pedido.id, item.data.camareroId, e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          ) : (
                            <span className="text-gray-400 italic text-xs">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {item.type === 'asignado' && item.data.horaEntrada ? (() => {
                            const horaSalida = getHoraSalidaIndividual(item.pedido.id, item.data.camareroId);
                            return horaSalida ? (
                              <span className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded font-mono text-sm font-semibold">
                                {calcularHoras(item.data.horaEntrada, horaSalida)}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs">-</span>
                            );
                          })() : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                          {camareroLabel}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${situationClass}`}>
                            {situationLabel}
                          </span>
                        </td>
                      </tr>
                     );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
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
      
      {/* HEADER MODO ENFOQUE */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => setSelectedPedido(null)}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors font-medium px-3 py-2 hover:bg-white rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver al Calendario
        </button>
        
        <div className="flex items-center gap-3">
          <button 
             onClick={() => exportarDatos('pedido')}
             className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-sm font-medium border border-green-200 transition-colors"
          >
              <Download className="w-4 h-4" />
              Exportar Pedido
          </button>
          <span className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 ${
            isCompleto ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {isCompleto ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {isCompleto ? 'Equipo Completo' : `Faltan ${faltantes} camareros`}
          </span>
        </div>
      </div>

      {/* INFO DEL EVENTO */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{selectedPedido.cliente}</h1>
            <div className="flex items-center gap-2 text-gray-500 mb-4">
              <span className="bg-gray-100 px-2 py-0.5 rounded text-sm font-mono">{selectedPedido.numero}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4"/> {new Date(selectedPedido.diaEvento).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex gap-6 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Lugar</p>
                <p className="font-medium text-gray-800">{selectedPedido.lugar}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Horario</p>
                <p className="font-medium text-gray-800">{selectedPedido.horaEntrada} - {selectedPedido.horaSalida}</p>
                {(selectedPedido.horaEntrada2 || selectedPedido.horaSalida2) && (
                  <p className="text-xs text-gray-600 mt-1">2º Turno: {selectedPedido.horaEntrada2} - {selectedPedido.horaSalida2}</p>
                )}
              </div>
              <div>
                <p className="text-gray-500 mb-1">Requeridos</p>
                <p className="font-medium text-gray-800">{requeridos} camareros</p>
              </div>
            </div>
          </div>
          {selectedPedido.notas && (
             <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 max-w-md">
               <p className="text-xs font-bold text-yellow-700 uppercase mb-1">Notas</p>
               <p className="text-sm text-yellow-800 italic">{selectedPedido.notas}</p>
             </div>
          )}
        </div>
      </div>

      {/* WORKSPACE DIVIDIDO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
        
        {/* COLUMNA 1: DISPONIBLES */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col gap-3">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-purple-600" />
              Camareros Disponibles
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar por nombre o número..." 
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                value={filtroCamarero}
                onChange={(e) => setFiltroCamarero(e.target.value)}
              />
            </div>
          </div>
          <div className="p-4 overflow-y-auto flex-1 bg-gray-50/30">
            {camarerosDisponibles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-2">No se encontraron camareros</p>
                <p className="text-xs text-gray-300">Intenta cambiar la búsqueda o verifica la disponibilidad</p>
              </div>
            ) : (
              <div className="space-y-2">
                {camarerosDisponibles.map((camarero, idx) => (
                  <div
                    key={camarero.id || idx}
                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-sm transition-all group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-purple-100 text-purple-700 text-xs font-bold px-1.5 py-0.5 rounded">#{camarero.numero}</span>
                        <p className="font-medium text-gray-900">{camarero.nombre} {camarero.apellido}</p>
                      </div>
                      <p className="text-gray-500 text-xs mt-0.5">{camarero.telefono}</p>
                    </div>
                    <button
                      onClick={() => agregarCamarero(camarero)}
                      disabled={procesando}
                      className={`px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-xs font-bold uppercase tracking-wide transition-all transform active:scale-95 ${
                        procesando ? 'opacity-50 cursor-not-allowed' : 'opacity-100 shadow-sm hover:shadow'
                      }`}
                    >
                      {procesando ? '...' : 'Asignar'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA 2: ASIGNADOS (GESTIÓN) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-blue-50/50 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Equipo Asignado ({asignadosCount}/{requeridos})
            </h2>
          </div>
          <div className="p-4 overflow-y-auto flex-1">
            {(!selectedPedido.asignaciones || selectedPedido.asignaciones.length === 0) ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                <Users className="w-12 h-12 mb-3 opacity-20" />
                <p>Aún no has asignado camareros</p>
                <p className="text-sm">Selecciona de la lista izquierda</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedPedido.asignaciones.map((asignacion, idxAsig) => (
                  <div
                    key={`${asignacion.camareroId}-${idxAsig}`}
                    className={`p-4 rounded-lg flex items-center justify-between border-l-4 shadow-sm transition-all ${
                      asignacion.estado === 'confirmado' ? 'bg-green-50 border-green-500 border-t border-r border-b border-gray-100' :
                      asignacion.estado === 'enviado' ? 'bg-orange-50 border-orange-500 border-t border-r border-b border-gray-100' :
                      asignacion.estado === 'rechazado' ? 'bg-red-50 border-red-500 border-t border-r border-b border-red-100' :
                      'bg-white border-gray-300 border-t border-r border-b border-gray-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                         <p className="font-bold text-gray-900">{asignacion.camareroNombre}</p>
                         <span className="text-xs text-gray-400">#{asignacion.camareroNumero}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Estado: {asignacion.estado ? asignacion.estado.toUpperCase() : 'PENDIENTE'}
                        {asignacion.estado === 'rechazado' && asignacion.eliminacionProgramada && (
                          <span className="ml-2 text-red-600 font-bold">
                            (Se eliminará en {Math.ceil((new Date(asignacion.eliminacionProgramada) - new Date()) / (1000 * 60))} min)
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={asignacion.estado || ''}
                        onChange={(e) => cambiarEstado(asignacion.camareroId, e.target.value)}
                        className={`text-xs px-2 py-1.5 rounded border font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer ${
                          asignacion.estado === 'confirmado' ? 'text-green-700 border-green-200 bg-white' :
                          asignacion.estado === 'enviado' ? 'text-orange-700 border-orange-200 bg-white' :
                          asignacion.estado === 'rechazado' ? 'text-red-700 border-red-200 bg-white' :
                          'text-gray-700 border-gray-200 bg-gray-50'
                        }`}
                      >
                        <option key="estado-pendiente" value="">Pendiente</option>
                        <option key="estado-enviado" value="enviado">Enviado</option>
                        <option key="estado-confirmado" value="confirmado">Confirmado</option>
                        <option key="estado-rechazado" value="rechazado">Rechazado</option>
                      </select>
                      <button
                        onClick={() => removerCamarero(asignacion.camareroId)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Remover del evento"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

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
                 // Buscar el camarero para obtener su teléfono (no está en la asignación plana a veces)
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

    </div>
  );
}