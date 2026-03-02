export function getDaysInMonth(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const days = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
  return { days, firstDay: adjustedFirstDay };
}

export function calcularHoras(horaEntrada: string, horaSalida: string): string {
  if (!horaEntrada || !horaSalida) return '-';
  try {
    const [horaE, minE] = horaEntrada.split(':').map(Number);
    const [horaS, minS] = horaSalida.split(':').map(Number);
    let totalMinutos = (horaS * 60 + minS) - (horaE * 60 + minE);
    if (totalMinutos < 0) totalMinutos += 24 * 60;
    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;
    return `${horas}h ${minutos}m`;
  } catch {
    return '-';
  }
}

export function isPedidoCompleto(pedido: any): boolean {
  const totalRequeridos = (parseInt(pedido.cantidadCamareros || 0)) + (parseInt(pedido.cantidadCamareros2 || 0));
  if (totalRequeridos === 0) return false;
  const asignaciones = pedido.asignaciones || [];
  const totalConfirmados = asignaciones.filter((a: any) => a.estado === 'confirmado').length;
  return totalConfirmados >= totalRequeridos;
}

export function buildFilasTabla(uniquePedidos: any[], selectedPedido: any): any[] {
  const filas: any[] = [];
  const pedidosFiltrados = uniquePedidos
    .filter(p => !selectedPedido || p.id === selectedPedido.id)
    .sort((a, b) => new Date(a.diaEvento).getTime() - new Date(b.diaEvento).getTime());

  pedidosFiltrados.forEach((pedido, index) => {
    const esPar = index % 2 === 0;
    const bgEvento = esPar ? 'bg-gray-50' : 'bg-blue-50/30';
    const cant1 = parseInt(pedido.cantidadCamareros || 0);
    const cant2 = parseInt(pedido.cantidadCamareros2 || 0);
    const slots: any[] = [];
    for (let i = 0; i < cant1; i++) slots.push({ hora: pedido.horaEntrada, turno: 1, slotId: `t1-${i}` });
    for (let i = 0; i < cant2; i++) slots.push({ hora: pedido.horaEntrada2, turno: 2, slotId: `t2-${i}` });
    const asignaciones = [...(pedido.asignaciones || [])];

    slots.forEach((slot) => {
      const asignacion = asignaciones.shift();
      if (asignacion) {
        filas.push({ type: 'asignado', pedido, data: asignacion, hora: slot.hora, turno: slot.turno, bgClase: bgEvento, uniqueId: `${pedido.id}-asig-${asignacion.camareroId}-${slot.slotId}` });
      } else {
        filas.push({ type: 'faltante', pedido, hora: slot.hora, turno: slot.turno, bgClase: 'bg-white', uniqueId: `${pedido.id}-faltante-${slot.slotId}` });
      }
    });

    asignaciones.forEach((asig, extraIdx) => {
      filas.push({ type: 'asignado', pedido, data: asig, hora: pedido.horaEntrada, turno: 1, bgClase: bgEvento, extra: true, uniqueId: `${pedido.id}-extra-${asig.camareroId}-${extraIdx}` });
    });
  });

  return filas;
}

export function getResumenData(
  uniquePedidos: any[],
  uniqueCamareros: any[],
  periodoFiltro: string,
  pedidosMes: any[]
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let pedidosFiltrados: any[] = [];

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
    const env = asigs.filter((a: any) => a.estado === 'enviado').length;
    const conf = asigs.filter((a: any) => a.estado === 'confirmado').length;
    const assignedTotal = asigs.length;
    totalCamarerosNecesarios += req;
    totalEnviados += env;
    totalConfirmados += conf;
    totalFaltantes += Math.max(0, req - assignedTotal);
  });

  const totalApercibidos = uniqueCamareros.filter((c: any) => c.estado === 'apercibido').length;
  const totalDisponibles = uniqueCamareros.length - totalApercibidos;

  return { totalEventos, totalCamarerosNecesarios, totalEnviados, totalConfirmados, totalFaltantes, totalDisponibles };
}

export function exportarDatos(filtroTipo: string, uniquePedidos: any[], selectedPedido: any): void {
  let pedidosBase: any[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (filtroTipo === 'dia') {
    pedidosBase = uniquePedidos.filter(p => {
      const d = new Date(p.diaEvento);
      d.setHours(0, 0, 0, 0);
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
      d.setHours(0, 0, 0, 0);
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

  const filasCSV: any[][] = [];
  filasCSV.push(['Fecha', 'Cliente', 'Lugar', 'Hora Entrada', 'Camarero', 'Estado']);

  pedidosBase.forEach(pedido => {
    const asignaciones = pedido.asignaciones || [];
    const cantTotal = (parseInt(pedido.cantidadCamareros || 0)) + (parseInt(pedido.cantidadCamareros2 || 0));
    if (asignaciones.length === 0 && cantTotal > 0) {
      for (let i = 0; i < cantTotal; i++) {
        filasCSV.push([new Date(pedido.diaEvento).toLocaleDateString('es-ES'), `"${pedido.cliente}"`, `"${pedido.lugar}"`, pedido.horaEntrada, '-- VACANTE --', 'PENDIENTE']);
      }
    } else {
      asignaciones.forEach((asig: any) => {
        filasCSV.push([new Date(pedido.diaEvento).toLocaleDateString('es-ES'), `"${pedido.cliente}"`, `"${pedido.lugar}"`, pedido.horaEntrada, `"${asig.camareroNombre}"`, asig.estado ? asig.estado.toUpperCase() : 'PENDIENTE']);
      });
      const faltantes = Math.max(0, cantTotal - asignaciones.length);
      for (let i = 0; i < faltantes; i++) {
        filasCSV.push([new Date(pedido.diaEvento).toLocaleDateString('es-ES'), `"${pedido.cliente}"`, `"${pedido.lugar}"`, pedido.horaEntrada, '-- VACANTE --', 'PENDIENTE']);
      }
    }
  });

  const csvContent = filasCSV.map(e => e.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `reporte_pedidos_${filtroTipo}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
