import { useState, useMemo, useEffect } from 'react';
import { FileText, Download, TrendingUp, Users, Clock, Calendar, AlertCircle, Award, Frown, CheckCircle, FileSpreadsheet } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export function Informes({ camareros, pedidos, baseUrl, publicAnonKey }) {
  const [tipoInforme, setTipoInforme] = useState('cliente');
  const [clienteSeleccionado, setClienteSeleccionado] = useState('');
  const [camareroSeleccionado, setCamareroSeleccionado] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [clientes, setClientes] = useState([]);

  // Cargar clientes
  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      const response = await fetch(`${baseUrl}/clientes`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` }
      });
      const data = await response.json();
      if (data.success) setClientes(data.data);
    } catch (error) {
      console.log('Error al cargar clientes:', error);
    }
  };

  // Helpers para parsear horas "5h 30m" -> Minutos
  const parseDuration = (str) => {
    if (!str) return 0;
    const matchH = str.match(/(\d+)h/);
    const matchM = str.match(/(\d+)m/);
    const h = matchH ? parseInt(matchH[1]) : 0;
    const m = matchM ? parseInt(matchM[1]) : 0;
    return h * 60 + m;
  };

  const formatDuration = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  // --- ANALÍTICA DE CLIENTES ---
  const clientAnalytics = useMemo(() => {
    if (tipoInforme !== 'cliente' || !clienteSeleccionado) return null;

    // 1. Filtrar Pedidos del Cliente
    const pedidosCliente = pedidos.filter(p => {
       const matchCliente = p.cliente === clienteSeleccionado;
       if (!matchCliente) return false;
       // Filtro fecha
       const fecha = new Date(p.diaEvento);
       fecha.setHours(0,0,0,0);
       const desde = fechaDesde ? new Date(fechaDesde) : null;
       const hasta = fechaHasta ? new Date(fechaHasta) : null;
       if (desde && fecha < desde) return false;
       if (hasta && fecha > hasta) return false;
       return true;
    });

    // 2. Totales Globales del Cliente
    const totalEventos = pedidosCliente.length;
    let totalCamareros = 0;
    let totalMinutos = 0;

    const pedidosDetallados = pedidosCliente.map(p => {
        const cant1 = parseInt(p.cantidadCamareros || 0);
        const min1 = parseDuration(p.totalHoras || '');
        
        const cant2 = parseInt(p.cantidadCamareros2 || 0);
        const min2 = parseDuration(p.totalHoras2 || '');
        
        const totalCams = cant1 + cant2;
        const totalMins = (min1 * cant1) + (min2 * cant2); // Horas hombre totales

        totalCamareros += totalCams;
        totalMinutos += totalMins;

        return {
            ...p,
            totalCams,
            totalHorasHombre: totalMins
        };
    });

    // 3. Porcentaje del Total (Market Share)
    // Usamos el total de pedidos en la DB (sin filtro de fecha para tener referencia global, o con filtro si se desea relativo al periodo)
    // Para "market share" usualmente es relativo al periodo.
    const totalPedidosGlobales = pedidos.filter(p => {
       // Aplicar mismo filtro de fecha para ser justos en el %
       const fecha = new Date(p.diaEvento);
       fecha.setHours(0,0,0,0);
       const desde = fechaDesde ? new Date(fechaDesde) : null;
       const hasta = fechaHasta ? new Date(fechaHasta) : null;
       if (desde && fecha < desde) return false;
       if (hasta && fecha > hasta) return false;
       return true;
    }).length || 1; // evitar division por 0

    const porcentajePedidos = ((totalEventos / totalPedidosGlobales) * 100).toFixed(1);

    // 4. Métricas de Rendimiento (Simuladas o calculadas)
    // Ejemplo: Promedio de camareros por evento
    const avgCamareros = totalEventos > 0 ? (totalCamareros / totalEventos).toFixed(1) : 0;
    
    return {
        totalEventos,
        totalCamareros,
        totalHoras: formatDuration(totalMinutos),
        porcentajePedidos,
        avgCamareros,
        pedidosDetallados
    };

  }, [tipoInforme, clienteSeleccionado, pedidos, fechaDesde, fechaHasta]);


  // --- ANALÍTICA DE CAMAREROS ---
  const waiterAnalytics = useMemo(() => {
    if (tipoInforme !== 'camarero' || !camareroSeleccionado) return null;

    // 1. Encontrar Camarero
    const camareroObj = camareros.find(c => c.id === camareroSeleccionado);
    if (!camareroObj) return null;

    // 2. Iterar Pedidos para buscar asignaciones
    let eventosTrabajados = [];
    let totalEventos = 0;
    let totalMinutos = 0;
    let cancelaciones = 0; // Difícil de trackear sin histórico, usaremos placeholder o lógica si existe

    pedidos.forEach(p => {
        // Filtro fecha
       const fecha = new Date(p.diaEvento);
       fecha.setHours(0,0,0,0);
       const desde = fechaDesde ? new Date(fechaDesde) : null;
       const hasta = fechaHasta ? new Date(fechaHasta) : null;
       if (desde && fecha < desde) return;
       if (hasta && fecha > hasta) return;

       if (!p.asignaciones) return;

       // Buscar si el camarero está asignado
       const asignacion = p.asignaciones.find(a => a.camareroId === camareroSeleccionado);
       
       if (asignacion) {
           // Determinar horas (Turno 1 o Turno 2? No está explícito en asignación, 
           // asumiremos Turno 1 por defecto salvo que la lógica de asignación guarde el turno.
           // La lógica actual de `gestion-pedidos` NO guarda el turno en el objeto asignación.
           // Haremos una estimación: Si p.horaEntrada2 existe, es complejo saber cual hizo.
           // Simplificación: Usar totalHoras del turno 1 como base.
           
           const mins = parseDuration(p.totalHoras || ''); 
           
           totalEventos++;
           totalMinutos += mins;

           eventosTrabajados.push({
               fecha: p.diaEvento,
               cliente: p.cliente,
               lugar: p.lugar,
               horas: p.totalHoras,
               estado: asignacion.estado || 'Pendiente'
           });
       }
    });

    const apercibimientos = camareroObj.estado === 'apercibido' ? 1 : 0; // O si hubiera historial
    // Ausencias: Podríamos contar eventos pasados donde estado != 'confirmado' y != 'realizado' si existiera ese estado
    // Por ahora 0 o basado en lógica futura.
    const ausencias = 0; 

    // Rendimiento: Eventos Confirmados / Total Asignados
    const confirmados = eventosTrabajados.filter(e => e.estado === 'confirmado').length;
    const rendimiento = totalEventos > 0 ? ((confirmados / totalEventos) * 100).toFixed(0) : 0;

    return {
        totalEventos,
        totalHoras: formatDuration(totalMinutos),
        ausencias,
        cancelaciones,
        apercibimientos,
        rendimiento,
        eventosTrabajados
    };

  }, [tipoInforme, camareroSeleccionado, pedidos, camareros, fechaDesde, fechaHasta]);


  // --- FUNCIONES DE EXPORTACIÓN ---

  const exportarExcel = () => {
    let csvContent = "";
    let filename = "";

    if (tipoInforme === 'cliente' && clientAnalytics) {
        const clienteObj = clientes.find(c => c.nombre === clienteSeleccionado);
        const codigoCliente = clienteObj?.numero || 'N/A';
        
        filename = `informe_cliente_${codigoCliente}_${new Date().toISOString().slice(0,10)}.csv`;
        // Header
        csvContent += `Cliente: ${clienteSeleccionado}\n`;
        csvContent += `Código Cliente: ${codigoCliente}\n`;
        csvContent += "Fecha,Lugar,Camareros,Horas Total\n";
        // Rows
        clientAnalytics.pedidosDetallados.forEach(p => {
            csvContent += `${new Date(p.diaEvento).toLocaleDateString()},"${p.lugar}",${p.totalCams},${formatDuration(p.totalHorasHombre)}\n`;
        });
        // Footer (KPIs)
        csvContent += `\nTotal Eventos:,${clientAnalytics.totalEventos}\n`;
        csvContent += `Total Camareros:,${clientAnalytics.totalCamareros}\n`;
        csvContent += `Total Horas:,${clientAnalytics.totalHoras}\n`;

    } else if (tipoInforme === 'camarero' && waiterAnalytics) {
        const cam = camareros.find(c => c.id === camareroSeleccionado);
        const codigoCamarero = cam?.numero || 'N/A';
        
        filename = `informe_camarero_${codigoCamarero}_${new Date().toISOString().slice(0,10)}.csv`;
        // Header
        csvContent += `Camarero: ${cam?.nombre || ''} ${cam?.apellido || ''}\n`;
        csvContent += `Código Camarero: ${codigoCamarero}\n`;
        csvContent += "Fecha,Cliente,Lugar,Horas,Estado\n";
        // Rows
        waiterAnalytics.eventosTrabajados.forEach(e => {
            csvContent += `${new Date(e.fecha).toLocaleDateString()},"${e.cliente}","${e.lugar}",${e.horas},${e.estado}\n`;
        });
        // Footer (KPIs)
        csvContent += `\nTotal Eventos:,${waiterAnalytics.totalEventos}\n`;
        csvContent += `Total Horas:,${waiterAnalytics.totalHoras}\n`;
    } else {
        alert("Genere un informe primero para exportar.");
        return;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportarPDF = () => {
    const doc = new jsPDF();

    if (tipoInforme === 'cliente' && clientAnalytics) {
        const clienteObj = clientes.find(c => c.nombre === clienteSeleccionado);
        const codigoCliente = clienteObj?.numero || 'N/A';

        doc.setFontSize(18);
        doc.text(`Informe de Cliente: ${clienteSeleccionado}`, 14, 20);
        
        doc.setFontSize(11);
        doc.text(`Código Cliente: ${codigoCliente}`, 14, 30);
        doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 36);
        if(fechaDesde || fechaHasta) doc.text(`Periodo: ${fechaDesde || 'Inicio'} - ${fechaHasta || 'Fin'}`, 14, 42);

        // KPIs Summary
        doc.setFillColor(240, 240, 240);
        const startY = fechaDesde || fechaHasta ? 50 : 45;
        doc.rect(14, startY, 180, 25, 'F');
        doc.setFontSize(10);
        doc.text(`Eventos: ${clientAnalytics.totalEventos}`, 20, startY + 10);
        doc.text(`Camareros Totales: ${clientAnalytics.totalCamareros}`, 70, startY + 10);
        doc.text(`Horas Totales: ${clientAnalytics.totalHoras}`, 130, startY + 10);
        doc.text(`Share: ${clientAnalytics.porcentajePedidos}%`, 20, startY + 20);
        doc.text(`Promedio Cam/Evento: ${clientAnalytics.avgCamareros}`, 70, startY + 20);

        // Table
        const tableColumn = ["Fecha", "Lugar", "Camareros", "Horas Hombre"];
        const tableRows = [];

        clientAnalytics.pedidosDetallados.forEach(p => {
            const row = [
                new Date(p.diaEvento).toLocaleDateString(),
                p.lugar,
                p.totalCams,
                formatDuration(p.totalHorasHombre)
            ];
            tableRows.push(row);
        });

        doc.autoTable({
            startY: startY + 35,
            head: [tableColumn],
            body: tableRows,
        });

        doc.save(`informe_cliente_${codigoCliente}.pdf`);

    } else if (tipoInforme === 'camarero' && waiterAnalytics) {
        const cam = camareros.find(c => c.id === camareroSeleccionado);
        const nombreCamarero = cam ? `${cam.nombre} ${cam.apellido}` : 'Desconocido';
        const codigoCamarero = cam?.numero || 'N/A';

        doc.setFontSize(18);
        doc.text(`Informe de Camarero: ${nombreCamarero}`, 14, 20);
        
        doc.setFontSize(11);
        doc.text(`Código Camarero: ${codigoCamarero}`, 14, 30);
        doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 36);
        
        // KPIs Summary
        doc.setFillColor(240, 240, 240);
        doc.rect(14, 45, 180, 25, 'F');
        doc.setFontSize(10);
        doc.text(`Eventos Trab.: ${waiterAnalytics.totalEventos}`, 20, 55);
        doc.text(`Horas Totales: ${waiterAnalytics.totalHoras}`, 70, 55);
        doc.text(`Ausencias: ${waiterAnalytics.ausencias}`, 130, 55);
        doc.text(`Rendimiento: ${waiterAnalytics.rendimiento}%`, 20, 65);
        doc.text(`Apercibimientos: ${waiterAnalytics.apercibimientos}`, 70, 65);

        // Table
        const tableColumn = ["Fecha", "Cliente", "Lugar", "Horas", "Estado"];
        const tableRows = [];

        waiterAnalytics.eventosTrabajados.forEach(e => {
            const row = [
                new Date(e.fecha).toLocaleDateString(),
                e.cliente,
                e.lugar,
                e.horas,
                e.estado
            ];
            tableRows.push(row);
        });

        doc.autoTable({
            startY: 80,
            head: [tableColumn],
            body: tableRows,
        });

        doc.save(`informe_camarero_${codigoCamarero}.pdf`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* --- CONTROLES SUPERIORES --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600" />
                Centro de Informes y Analítica
            </h2>
            <div className="flex gap-2">
                <button 
                    onClick={exportarExcel}
                    disabled={!((tipoInforme === 'cliente' && clientAnalytics) || (tipoInforme === 'camarero' && waiterAnalytics))}
                    className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-sm font-medium border border-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FileSpreadsheet className="w-4 h-4" />
                    Excel
                </button>
                <button 
                    onClick={exportarPDF}
                    disabled={!((tipoInforme === 'cliente' && clientAnalytics) || (tipoInforme === 'camarero' && waiterAnalytics))}
                    className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-sm font-medium border border-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Download className="w-4 h-4" />
                    PDF
                </button>
            </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Selector de Tipo */}
          <div className="w-full md:w-64 space-y-3">
             <label className="text-sm font-semibold text-gray-700">Tipo de Informe</label>
             <div className="flex bg-gray-100 p-1 rounded-lg">
                <button 
                    onClick={() => setTipoInforme('cliente')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                        tipoInforme === 'cliente' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Clientes
                </button>
                <button 
                    onClick={() => setTipoInforme('camarero')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                        tipoInforme === 'camarero' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Camareros
                </button>
             </div>
          </div>

          {/* Filtros Dinámicos */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
             {tipoInforme === 'cliente' ? (
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar Cliente</label>
                    <select
                        value={clienteSeleccionado}
                        onChange={(e) => setClienteSeleccionado(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">-- Seleccione --</option>
                        {clientes.map(c => (
                            <option key={c.id} value={c.nombre}>{c.nombre}</option>
                        ))}
                    </select>
                 </div>
             ) : (
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar Camarero</label>
                    <select
                        value={camareroSeleccionado}
                        onChange={(e) => setCamareroSeleccionado(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">-- Seleccione --</option>
                        {camareros.map(c => (
                            <option key={c.id} value={c.id}>#{c.numero} - {c.nombre} {c.apellido}</option>
                        ))}
                    </select>
                 </div>
             )}

             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                <input
                    type="date"
                    value={fechaDesde}
                    onChange={(e) => setFechaDesde(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
             </div>

             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                <input
                    type="date"
                    value={fechaHasta}
                    onChange={(e) => setFechaHasta(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
             </div>
          </div>
        </div>
      </div>

      {/* --- RESULTADOS: CLIENTE --- */}
      {tipoInforme === 'cliente' && clientAnalytics && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
                      <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                              <Calendar className="w-5 h-5" />
                          </div>
                          <span className="text-sm font-medium text-gray-500">Total Eventos</span>
                      </div>
                      <p className="text-3xl font-bold text-gray-900">{clientAnalytics.totalEventos}</p>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-purple-100 shadow-sm">
                      <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                              <Users className="w-5 h-5" />
                          </div>
                          <span className="text-sm font-medium text-gray-500">Total Camareros</span>
                      </div>
                      <p className="text-3xl font-bold text-gray-900">{clientAnalytics.totalCamareros}</p>
                      <p className="text-xs text-gray-400 mt-1">Promedio: {clientAnalytics.avgCamareros} / evento</p>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-amber-100 shadow-sm">
                      <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                              <Clock className="w-5 h-5" />
                          </div>
                          <span className="text-sm font-medium text-gray-500">Total Horas</span>
                      </div>
                      <p className="text-3xl font-bold text-gray-900">{clientAnalytics.totalHoras}</p>
                      <p className="text-xs text-gray-400 mt-1">Horas hombre facturables</p>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-green-100 shadow-sm">
                      <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-green-50 rounded-lg text-green-600">
                              <TrendingUp className="w-5 h-5" />
                          </div>
                          <span className="text-sm font-medium text-gray-500">% Pedidos (Share)</span>
                      </div>
                      <p className="text-3xl font-bold text-gray-900">{clientAnalytics.porcentajePedidos}%</p>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                          <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${clientAnalytics.porcentajePedidos}%` }}></div>
                      </div>
                  </div>
              </div>

              {/* Tabla Detallada */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                      <h3 className="font-semibold text-gray-800">Desglose de Eventos</h3>
                  </div>
                  <table className="w-full">
                      <thead className="bg-gray-50">
                          <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lugar</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Camareros</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Horas Total</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                          {clientAnalytics.pedidosDetallados.map((p, idx) => (
                              <tr key={idx} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                      {new Date(p.diaEvento).toLocaleDateString()}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-600">{p.lugar}</td>
                                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{p.totalCams}</td>
                                  <td className="px-6 py-4 text-sm text-gray-600">{formatDuration(p.totalHorasHombre)}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {/* --- RESULTADOS: CAMARERO --- */}
      {tipoInforme === 'camarero' && waiterAnalytics && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Eventos</p>
                      <p className="text-2xl font-bold text-blue-600">{waiterAnalytics.totalEventos}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Horas Trab.</p>
                      <p className="text-2xl font-bold text-blue-600">{waiterAnalytics.totalHoras}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-red-100 shadow-sm">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Ausencias</p>
                      <p className="text-2xl font-bold text-red-600">{waiterAnalytics.ausencias}</p>
                  </div>
                   <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Apercibimientos</p>
                      <p className="text-2xl font-bold text-amber-600">{waiterAnalytics.apercibimientos}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Rendimiento</p>
                      <p className="text-2xl font-bold text-green-600">{waiterAnalytics.rendimiento}%</p>
                      <p className="text-[10px] text-gray-400">Confirmados vs Asignados</p>
                  </div>
              </div>

              {/* Tabla Detallada */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                      <h3 className="font-semibold text-gray-800">Historial de Trabajo</h3>
                  </div>
                  <table className="w-full">
                      <thead className="bg-gray-50">
                          <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lugar</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Horas</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                          {waiterAnalytics.eventosTrabajados.map((e, idx) => (
                              <tr key={idx} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                      {new Date(e.fecha).toLocaleDateString()}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-600">{e.cliente}</td>
                                  <td className="px-6 py-4 text-sm text-gray-600">{e.lugar}</td>
                                  <td className="px-6 py-4 text-sm text-gray-600">{e.horas}</td>
                                  <td className="px-6 py-4">
                                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                          e.estado === 'confirmado' ? 'bg-green-100 text-green-700' :
                                          e.estado === 'enviado' ? 'bg-amber-100 text-amber-700' :
                                          'bg-gray-100 text-gray-700'
                                      }`}>
                                          {e.estado}
                                      </span>
                                  </td>
                              </tr>
                          ))}
                          {waiterAnalytics.eventosTrabajados.length === 0 && (
                              <tr>
                                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                                      No hay historial de eventos en este periodo.
                                  </td>
                              </tr>
                          )}
                      </tbody>
                  </table>
              </div>
          </div>
      )}
    </div>
  );
}