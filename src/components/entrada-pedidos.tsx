import { useState, useMemo } from 'react';
import { Plus, MapPin, Calendar as CalendarIcon, Clock, Users, Edit2, Trash2, X, ChevronLeft, ChevronRight, Check, AlertCircle, BarChart3, TrendingUp, UserCheck, AlertTriangle, Send, Mail } from 'lucide-react';

export function EntradaPedidos({ clientes, setClientes, pedidos, setPedidos, camareros = [], coordinadores = [], baseUrl, publicAnonKey, cargarDatos }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Estado para el informe
  const [reportPeriod, setReportPeriod] = useState('mensual'); // 'diario' | 'semanal' | 'mensual'

  const initialFormState = {
    numero: '',
    cliente: '',
    lugar: '',
    ubicacion: '',
    diaEvento: '',
    // Entrada 1
    cantidadCamareros: 1,
    horaEntrada: '',
    horaSalida: '',
    totalHoras: '',
    // Entrada 2
    cantidadCamareros2: 0,
    horaEntrada2: '',
    horaSalida2: '',
    totalHoras2: '',
    
    catering: 'no',
    camisa: 'negra',
    notas: '',
    // NUEVO: Coordinador del evento para chats grupales
    coordinadorId: '',
    coordinadorNombre: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  // Deduplicar clientes
  const uniqueClientes = useMemo(() => {
    return Array.from(new Map(clientes.map(c => [c.id, c])).values());
  }, [clientes]);

  // Deduplicar pedidos
  const uniquePedidos = useMemo(() => {
    return Array.from(new Map(pedidos.map(p => [p.id, p])).values());
  }, [pedidos]);

  // --- Lógica del Calendario ---
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Domingo
    // Ajustar para que la semana empiece en Lunes (0 = Lunes, 6 = Domingo)
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
    return { days, firstDay: adjustedFirstDay };
  };

  const changeMonth = (offset) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    setCurrentDate(newDate);
  };

  const monthData = getDaysInMonth(currentDate);
  
  // Filtrar pedidos del mes actual (para calendario)
  const pedidosMes = uniquePedidos.filter(p => {
    const fecha = new Date(p.diaEvento);
    return fecha.getMonth() === currentDate.getMonth() && 
           fecha.getFullYear() === currentDate.getFullYear();
  });

  // Verificar si un pedido está completo (todos confirmados y número correcto)
  const isPedidoCompleto = (pedido) => {
    if (!pedido.asignaciones || pedido.asignaciones.length === 0) return false;
    
    const totalRequeridos = parseInt(pedido.cantidadCamareros || 0) + parseInt(pedido.cantidadCamareros2 || 0);
    const totalConfirmados = pedido.asignaciones.filter(a => a.estado === 'confirmado').length;
    
    return totalConfirmados >= totalRequeridos;
  };

  // --- Lógica de Informes ---
  const reportMetrics = useMemo(() => {
    const now = new Date();
    now.setHours(0,0,0,0);
    
    let filteredPedidos = [];

    if (reportPeriod === 'diario') {
       const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
       filteredPedidos = uniquePedidos.filter(p => p.diaEvento === todayStr);
    } else if (reportPeriod === 'semanal') {
       const day = now.getDay(); 
       const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Lunes
       const monday = new Date(now);
       monday.setDate(diff);
       const sunday = new Date(monday);
       sunday.setDate(monday.getDate() + 6);
       
       filteredPedidos = uniquePedidos.filter(p => {
         const d = new Date(p.diaEvento);
         d.setHours(0,0,0,0);
         return d >= monday && d <= sunday;
       });
    } else {
       // Mensual (Mes actual seleccionado en calendario o mes actual real? 
       // Usualmente informes son sobre "lo que se ve". Usaremos el mes seleccionado en calendario
       // para que sea congruente con la vista, O el mes actual real.
       // La solicitud dice "informes", típicamente es sobre el periodo de trabajo actual.
       // Usemos el mes del calendario `currentDate` para que sea interactivo.
       filteredPedidos = pedidosMes;
    }

    const cantidadPedidos = filteredPedidos.length;
    
    let cantidadCamareros = 0; // Demanda total
    let camarerosConfirmados = 0;
    let camarerosFaltantes = 0; // Huecos sin asignar

    filteredPedidos.forEach(p => {
      const req = (parseInt(p.cantidadCamareros || 0)) + (parseInt(p.cantidadCamareros2 || 0));
      const asigs = p.asignaciones || [];
      const conf = asigs.filter(a => a.estado === 'confirmado').length;
      const assignedCount = asigs.length;
      
      cantidadCamareros += req;
      camarerosConfirmados += conf;
      camarerosFaltantes += Math.max(0, req - assignedCount);
    });

    const camarerosApercibidos = camareros.filter(c => c.estado === 'apercibido').length;
    
    // Disponibles: Total Activos (Total - Apercibidos)
    // Si es diario, podríamos restar los No Disponibles de hoy, pero para mantener consistencia
    // con la idea de "Plantilla", usaremos el total activo.
    const camarerosDisponibles = camareros.length - camarerosApercibidos;

    return {
      cantidadPedidos,
      cantidadCamareros,
      camarerosDisponibles,
      camarerosConfirmados,
      camarerosFaltantes,
      camarerosApercibidos
    };
  }, [reportPeriod, uniquePedidos, pedidosMes, camareros, currentDate]);


  // --- Lógica del Formulario ---
  const generarNumeroPedido = () => {
    if (uniquePedidos.length === 0) return 'PED001';
    
    const numeros = uniquePedidos.map(p => {
      const match = p.numero?.match(/PED(\d+)/);
      return match ? parseInt(match[1]) : 0;
    });
    
    const max = Math.max(0, ...numeros);
    return `PED${String(max + 1).padStart(3, '0')}`;
  };

  const calcularHoras = (entrada, salida) => {
    if (!entrada || !salida) return '';
    
    const [h1, m1] = entrada.split(':').map(Number);
    const [h2, m2] = salida.split(':').map(Number);
    
    let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (diff < 0) diff += 24 * 60; // Si pasa de medianoche
    
    const horas = Math.floor(diff / 60);
    const minutos = diff % 60;
    
    return `${horas}h ${minutos > 0 ? minutos + 'm' : ''}`;
  };

  const handleTimeChange = (field, value, type) => {
    const newFormData = { ...formData, [field]: value };
    
    if (type === 1) {
      if (field === 'horaEntrada' && newFormData.horaSalida) {
        newFormData.totalHoras = calcularHoras(value, newFormData.horaSalida);
      } else if (field === 'horaSalida' && newFormData.horaEntrada) {
        newFormData.totalHoras = calcularHoras(newFormData.horaEntrada, value);
      }
    } else {
      if (field === 'horaEntrada2' && newFormData.horaSalida2) {
        newFormData.totalHoras2 = calcularHoras(value, newFormData.horaSalida2);
      } else if (field === 'horaSalida2' && newFormData.horaEntrada2) {
        newFormData.totalHoras2 = calcularHoras(newFormData.horaEntrada2, value);
      }
    }
    
    setFormData(newFormData);
  };

  const handleEdit = (pedido) => {
    setFormData({
      numero: pedido.numero || '',
      cliente: pedido.cliente,
      lugar: pedido.lugar,
      ubicacion: pedido.ubicacion || '',
      diaEvento: pedido.diaEvento,
      
      cantidadCamareros: pedido.cantidadCamareros,
      horaEntrada: pedido.horaEntrada,
      horaSalida: pedido.horaSalida,
      totalHoras: pedido.totalHoras,
      
      cantidadCamareros2: pedido.cantidadCamareros2 || 0,
      horaEntrada2: pedido.horaEntrada2 || '',
      horaSalida2: pedido.horaSalida2 || '',
      totalHoras2: pedido.totalHoras2 || '',
      
      catering: pedido.catering,
      camisa: pedido.camisa,
      notas: pedido.notas || '',
      // NUEVO: Coordinador del evento para chats grupales
      coordinadorId: pedido.coordinadorId || '',
      coordinadorNombre: pedido.coordinadorNombre || ''
    });
    setEditingId(pedido.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este pedido?')) return;
    
    try {
      const response = await fetch(`${baseUrl}/pedidos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${publicAnonKey}` }
      });
      
      if (response.ok) {
        await cargarDatos();
      }
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  };

  // --- Lógica de Alertas y Sonido ---
  const playNotificationSound = () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); // Sonido de campana/notificación
      audio.play().catch(e => console.log('Audio autoplay blocked', e));
    } catch (error) {
      console.error('Error playing sound', error);
    }
  };

  const enviarConfirmacionCliente = (pedido) => {
    // Buscar datos del cliente para obtener contacto
    const clienteData = clientes.find(c => c.nombre === pedido.cliente);
    const contacto = clienteData?.telefono || clienteData?.email || '';
    
    // Construir mensaje
    const mensaje = `*Confirmación de Pedido - ${pedido.numero}*
    
📅 *Día:* ${new Date(pedido.diaEvento).toLocaleDateString('es-ES')}
⏰ *Horario:* ${pedido.horaEntrada} - ${pedido.horaSalida}
📍 *Lugar:* ${pedido.lugar}
👥 *Camareros:* ${pedido.cantidadCamareros + (pedido.cantidadCamareros2 || 0)}
📝 *Notas:* ${pedido.notas || 'Sin notas adicionales'}

_Por favor confirme recepción de este mensaje._`;

    if (!contacto) {
        alert('El cliente no tiene teléfono ni email registrado.');
        return;
    }

    const isEmail = contacto.includes('@');
    
    if (isEmail) {
        const subject = `Confirmación de Evento - ${pedido.numero}`;
        const body = mensaje.replace(/\*/g, ''); // Limpiar markdown para mail
        window.open(`mailto:${contacto}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
    } else {
        // Asumir teléfono (WhatsApp)
        // Limpiar teléfono
        let phone = contacto.replace(/\D/g, '');
        if (!phone.startsWith('34') && phone.length === 9) phone = '34' + phone; // Asumir prefijo España si no lo tiene
        
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(mensaje)}`;
        window.open(url, '_blank');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${baseUrl}/pedidos/${editingId}` : `${baseUrl}/pedidos`;
      
      // Asegurar número de pedido si es nuevo
      const dataToSend = {
        ...formData,
        numero: editingId ? formData.numero : generarNumeroPedido()
      };

      // Preservar asignaciones si estamos editando
      if (editingId) {
        const pedidoOriginal = uniquePedidos.find(p => p.id === editingId);
        if (pedidoOriginal) {
          dataToSend.asignaciones = pedidoOriginal.asignaciones;
        }
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(dataToSend)
      });
      
      if (response.ok) {
        await cargarDatos();
        
        if (!editingId) {
            // Es un pedido nuevo -> Sonar alarma
            playNotificationSound();
        }

        setShowForm(false);
        setEditingId(null);
        setFormData(initialFormState);
      }
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* --- PANEL DE INFORMES --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Resumen de Actividad
          </h2>
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {['diario', 'semanal', 'mensual'].map((p) => (
              <button
                key={p}
                onClick={() => setReportPeriod(p)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${
                  reportPeriod === p 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
           {/* Cantidad de Pedidos */}
           <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
             <p className="text-xs font-semibold text-blue-600 uppercase mb-1">Pedidos</p>
             <p className="text-2xl font-bold text-blue-900">{reportMetrics.cantidadPedidos}</p>
           </div>
           
           {/* Cantidad de Camareros (Demanda) */}
           <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
             <p className="text-xs font-semibold text-purple-600 uppercase mb-1">Solicitados</p>
             <p className="text-2xl font-bold text-purple-900">{reportMetrics.cantidadCamareros}</p>
           </div>

           {/* Camareros Disponibles (Plantilla) */}
           <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
             <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Plantilla Disp.</p>
             <p className="text-2xl font-bold text-gray-800">{reportMetrics.camarerosDisponibles}</p>
           </div>

           {/* Camareros Confirmados */}
           <div className="bg-green-50 p-4 rounded-lg border border-green-100">
             <p className="text-xs font-semibold text-green-600 uppercase mb-1">Confirmados</p>
             <p className="text-2xl font-bold text-green-800">{reportMetrics.camarerosConfirmados}</p>
           </div>

           {/* Camareros Faltantes */}
           <div className="bg-red-50 p-4 rounded-lg border border-red-100">
             <p className="text-xs font-semibold text-red-600 uppercase mb-1">Faltantes</p>
             <p className="text-2xl font-bold text-red-800">{reportMetrics.camarerosFaltantes}</p>
           </div>

           {/* Camareros Apercibidos */}
           <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
             <p className="text-xs font-semibold text-amber-600 uppercase mb-1">Apercibidos</p>
             <p className="text-2xl font-bold text-amber-800">{reportMetrics.camarerosApercibidos}</p>
           </div>
        </div>
      </div>

      {/* --- CALENDARIO MENSUAL --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 flex items-center justify-between bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            Calendario de Eventos
          </h2>
          <div className="flex items-center gap-4">
            <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-200 rounded-full">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-medium text-lg w-40 text-center">
              {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-200 rounded-full">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden border border-gray-200">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
              <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
            
            {/* Días vacíos previos */}
            {Array.from({ length: monthData.firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-white min-h-[120px]"></div>
            ))}
            
            {/* Días del mes */}
            {Array.from({ length: monthData.days }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const pedidosDia = pedidosMes.filter(p => p.diaEvento === dateStr);
              
              return (
                <div key={day} className="bg-white p-2 min-h-[120px] hover:bg-gray-50 transition-colors">
                  <div className="font-medium text-gray-400 mb-2">{day}</div>
                  <div className="space-y-1">
                    {pedidosDia.map((pedido, idx) => {
                      const completo = isPedidoCompleto(pedido);
                      return (
                        <div 
                          key={pedido.id || idx}
                          className={`text-xs p-1.5 rounded border truncate cursor-pointer transition-all ${
                            completo 
                              ? 'bg-green-100 border-green-200 text-green-800' 
                              : 'bg-red-50 border-red-200 text-red-800'
                          }`}
                          onClick={() => handleEdit(pedido)}
                          title={`${pedido.cliente} - ${pedido.lugar}`}
                        >
                          <div className="font-semibold">{pedido.numero}</div>
                          <div className="truncate">{pedido.cliente}</div>
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

      {/* --- BOTÓN NUEVO PEDIDO --- */}
      <div className="flex justify-center">
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ ...initialFormState, numero: generarNumeroPedido() });
            setShowForm(true);
          }}
          className="px-6 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transform hover:scale-105 transition-all flex items-center gap-2 font-medium"
        >
          <Plus className="w-5 h-5" />
          Nuevo Pedido
        </button>
      </div>

      {/* --- MODAL FORMULARIO --- */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col my-8">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-800">
                {editingId ? `Editar Pedido ${formData.numero}` : 'Nuevo Pedido'}
              </h2>
              <button 
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="overflow-y-auto p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Información General */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Información del Evento</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                      <select
                        required
                        value={formData.cliente}
                        onChange={(e) => setFormData({...formData, cliente: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option key="cliente-empty" value="">Seleccionar cliente...</option>
                        {uniqueClientes.map(c => (
                          <option key={c.id} value={c.nombre}>{c.nombre}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Coordinador del Cliente *
                        <span className="text-xs text-gray-500 ml-1">(Para chats grupales)</span>
                      </label>
                      <select
                        required
                        value={formData.coordinadorId}
                        onChange={(e) => {
                          const coordinador = coordinadores.find(c => c.id === e.target.value);
                          setFormData({
                            ...formData,
                            coordinadorId: e.target.value,
                            coordinadorNombre: coordinador ? coordinador.nombre : ''
                          });
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option key="coordinador-empty" value="">Seleccionar coordinador...</option>
                        {coordinadores.map(c => (
                          <option key={c.id} value={c.id}>{c.nombre}</option>
                        ))}
                      </select>
                      {coordinadores.length === 0 && (
                        <p className="text-xs text-orange-600 mt-1">
                          ⚠️ No hay coordinadores. Créalos en la sección "Coordinadores"
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Día del Evento</label>
                      <input
                        type="date"
                        required
                        value={formData.diaEvento}
                        onChange={(e) => setFormData({...formData, diaEvento: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Lugar del Evento</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          required
                          value={formData.lugar}
                          onChange={(e) => {
                            const nuevoLugar = e.target.value;
                            // Generar automáticamente el link de Google Maps
                            const googleMapsUrl = nuevoLugar.trim() 
                              ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nuevoLugar)}`
                              : '';
                            setFormData({
                              ...formData, 
                              lugar: nuevoLugar,
                              ubicacion: googleMapsUrl
                            });
                          }}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Nombre del lugar"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación (Google Maps)</label>
                      <input
                        type="url"
                        value={formData.ubicacion}
                        onChange={(e) => setFormData({...formData, ubicacion: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="https://maps.google.com/..."
                      />
                    </div>
                  </div>
                </div>

                {/* Primera Entrada */}
                <div className="space-y-4 bg-blue-50 p-6 rounded-xl border border-blue-100">
                  <h3 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                    <Clock className="w-5 h-5" /> Primera Entrada
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Camareros</label>
                      <div className="relative">
                        <Users className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input
                          type="number"
                          min="1"
                          value={formData.cantidadCamareros}
                          onChange={(e) => setFormData({...formData, cantidadCamareros: parseInt(e.target.value)})}
                          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hora Entrada</label>
                      <input
                        type="time"
                        required
                        value={formData.horaEntrada}
                        onChange={(e) => handleTimeChange('horaEntrada', e.target.value, 1)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hora Salida</label>
                      <input
                        type="time"
                        required
                        value={formData.horaSalida}
                        onChange={(e) => handleTimeChange('horaSalida', e.target.value, 1)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
                      <input
                        type="text"
                        readOnly
                        value={formData.totalHoras}
                        className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Segunda Entrada */}
                <div className="space-y-4 bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                    <Clock className="w-5 h-5" /> Segunda Entrada (Opcional)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Camareros</label>
                      <div className="relative">
                        <Users className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input
                          type="number"
                          min="0"
                          value={formData.cantidadCamareros2}
                          onChange={(e) => setFormData({...formData, cantidadCamareros2: parseInt(e.target.value)})}
                          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hora Entrada</label>
                      <input
                        type="time"
                        value={formData.horaEntrada2}
                        onChange={(e) => handleTimeChange('horaEntrada2', e.target.value, 2)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hora Salida</label>
                      <input
                        type="time"
                        value={formData.horaSalida2}
                        onChange={(e) => handleTimeChange('horaSalida2', e.target.value, 2)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
                      <input
                        type="text"
                        readOnly
                        value={formData.totalHoras2}
                        className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Detalles Adicionales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Catering</label>
                    <select
                      value={formData.catering}
                      onChange={(e) => setFormData({...formData, catering: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option key="catering-no" value="no">No</option>
                      <option key="catering-si" value="si">Sí</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Camisa</label>
                    <select
                      value={formData.camisa}
                      onChange={(e) => setFormData({...formData, camisa: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option key="camisa-negra" value="negra">Negra</option>
                      <option key="camisa-blanca" value="blanca">Blanca</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                    <textarea
                      value={formData.notas}
                      onChange={(e) => setFormData({...formData, notas: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Información adicional..."
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-gray-100">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    {editingId ? 'Guardar Cambios' : 'Crear Pedido'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-8 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- LISTA DE PEDIDOS --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Listado de Pedidos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cód</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lugar</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horario 1</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {uniquePedidos
                .sort((a, b) => new Date(b.diaEvento) - new Date(a.diaEvento))
                .map((pedido, idx) => {
                  const completo = isPedidoCompleto(pedido);
                  return (
                    <tr key={pedido.id || idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        {pedido.numero}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pedido.cliente}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {pedido.lugar}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(pedido.diaEvento).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {pedido.horaEntrada} - {pedido.horaSalida}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          completo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {completo ? <Check className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                          {completo ? 'Completo' : 'Incompleto'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => enviarConfirmacionCliente(pedido)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Enviar confirmación al cliente"
                          >
                             <Send className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(pedido)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(pedido.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              {uniquePedidos.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No hay pedidos registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}