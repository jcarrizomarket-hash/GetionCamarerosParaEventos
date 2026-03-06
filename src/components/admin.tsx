import { Shield, UserPlus, Download, Filter, X, Trash2, Edit2 } from 'lucide-react';
import ExcelJS from 'exceljs'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface AdminProps {
  coordinadores: any[];
  setCoordinadores: (coordinadores: any[]) => void;
  baseUrl: string;
  publicAnonKey: string;
  cargarDatos: () => void;
  camareros: any[];
  pedidos: any[];
}

export function Admin({ 
  coordinadores, 
  setCoordinadores, 
  baseUrl, 
  publicAnonKey, 
  cargarDatos,
  camareros,
  pedidos 
}: AdminProps) {
  const [activeSubTab, setActiveSubTab] = useState('coordinadores');
  
  // Filtros para Altas
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [clienteFiltro, setClienteFiltro] = useState('');
  const [showFiltros, setShowFiltros] = useState(false);

  // Obtener todos los clientes únicos
  const clientesUnicos = useMemo(() => {
    const clientes = new Set();
    pedidos.forEach(p => {
      if (p.cliente) clientes.add(p.cliente);
    });
    return Array.from(clientes).sort();
  }, [pedidos]);

  // Generar datos de Altas: expandir cada asignación confirmada como una fila
  const datosAltas = useMemo(() => {
    const datos = [];
    
    pedidos.forEach(pedido => {
      const asignaciones = pedido.asignaciones || [];
      
      asignaciones.forEach(asignacion => {
        // Solo incluir asignaciones confirmadas
        if (asignacion.estado === 'confirmado') {
          const camarero = camareros.find(c => c.id === asignacion.camareroId);
          
          if (camarero) {
            const fecha = new Date(pedido.diaEvento);
            const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
            
            datos.push({
              id: `${pedido.id}-${asignacion.camareroId}`,
              fecha: pedido.diaEvento,
              fechaFormateada: fecha.toLocaleDateString('es-ES'),
              dia: dias[fecha.getDay()],
              cliente: pedido.cliente || '',
              evento: pedido.tipoEvento || '',
              codigoPerfil: camarero.codigo || '',
              nombrePerfil: `${camarero.nombre} ${camarero.apellido}`,
              estado: asignacion.estado,
              turno: asignacion.turno || '',
              camareroId: camarero.id,
              pedidoId: pedido.id,
              estadoAlta: 'activo' // Por defecto todos están de alta
            });
          }
        }
      });
    });
    
    // Ordenar por fecha descendente (más recientes primero)
    return datos.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [pedidos, camareros]);

  // Aplicar filtros
  const datosAltasFiltrados = useMemo(() => {
    let resultado = [...datosAltas];
    
    if (fechaDesde) {
      resultado = resultado.filter(d => d.fecha >= fechaDesde);
    }
    
    if (fechaHasta) {
      resultado = resultado.filter(d => d.fecha <= fechaHasta);
    }
    
    if (clienteFiltro) {
      resultado = resultado.filter(d => 
        d.cliente.toLowerCase().includes(clienteFiltro.toLowerCase())
      );
    }
    
    return resultado;
  }, [datosAltas, fechaDesde, fechaHasta, clienteFiltro]);

  // Exportar a Excel con filtros
  const exportarExcel = () => {
    if (datosAltasFiltrados.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    // Preparar datos para Excel
    const datosExcel = datosAltasFiltrados.map(d => ({
      'Fecha': d.fechaFormateada,
      'Día': d.dia,
      'Cliente': d.cliente,
      'Evento': d.evento,
      'Código Perfil': d.codigoPerfil,
      'Nombre Perfil': d.nombrePerfil,
      'Turno': d.turno,
      'Estado': d.estado === 'confirmado' ? 'Confirmado' : d.estado
    }));

    // Crear libro de trabajo

    // Aplicar auto-filtros a todas las columnas

    // Ajustar ancho de columnas
    ws['!cols'] = [
      { wch: 12 }, // Fecha
      { wch: 10 }, // Día
      { wch: 25 }, // Cliente
      { wch: 20 }, // Evento
      { wch: 13 }, // Código Perfil
      { wch: 30 }, // Nombre Perfil
      { wch: 15 }, // Turno
      { wch: 12 }  // Estado
    ];

    // Agregar hoja al libro

    // Descargar archivo
    const fecha = new Date().toISOString().split('T')[0];
  };

  const handleAlta = async (dato) => {
    alert(`Funcionalidad de Alta para ${dato.nombrePerfil} - En desarrollo`);
    // Aquí se implementaría la lógica de dar de alta
  };

  const handleBaja = async (dato) => {
    alert(`Funcionalidad de Baja para ${dato.nombrePerfil} - En desarrollo`);
    // Aquí se implementaría la lógica de dar de baja
  };

  const limpiarFiltros = () => {
    setFechaDesde('');
    setFechaHasta('');
    setClienteFiltro('');
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-gray-900 text-2xl font-bold">Panel de Administración</h2>
        <p className="text-gray-600 mt-1">Gestión de coordinadores y altas de personal</p>
      </div>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="coordinadores">Coordinadores</TabsTrigger>
          <TabsTrigger value="altas">Altas</TabsTrigger>
        </TabsList>

        {/* Tab Coordinadores */}
        <TabsContent value="coordinadores">
          <CoordinadoresSection
            coordinadores={coordinadores}
            setCoordinadores={setCoordinadores}
            baseUrl={baseUrl}
            publicAnonKey={publicAnonKey}
            cargarDatos={cargarDatos}
          />
        </TabsContent>

        {/* Tab Altas */}
        <TabsContent value="altas">
          <div className="bg-white rounded-lg shadow-sm">
            {/* Header con filtros y exportación */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Lista de Altas de Personal
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowFiltros(!showFiltros)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    {showFiltros ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                  </button>
                  <button
                    onClick={exportarExcel}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Exportar Excel
                  </button>
                </div>
              </div>

              {/* Panel de filtros */}
              {showFiltros && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha Desde
                      </label>
                      <input
                        type="date"
                        value={fechaDesde}
                        onChange={(e) => setFechaDesde(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha Hasta
                      </label>
                      <input
                        type="date"
                        value={fechaHasta}
                        onChange={(e) => setFechaHasta(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cliente
                      </label>
                      <input
                        type="text"
                        value={clienteFiltro}
                        onChange={(e) => setClienteFiltro(e.target.value)}
                        placeholder="Buscar cliente..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={limpiarFiltros}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-2 text-sm"
                    >
                      <X className="w-4 h-4" />
                      Limpiar Filtros
                    </button>
                  </div>
                </div>
              )}

              <p className="text-sm text-gray-600 mt-3">
                Total de registros: <span className="font-semibold">{datosAltasFiltrados.length}</span>
              </p>
            </div>

            {/* Tabla de Altas */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Día
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Evento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cód. Perfil
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre Perfil
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {datosAltasFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                        No hay datos para mostrar
                      </td>
                    </tr>
                  ) : (
                    datosAltasFiltrados.map((dato) => (
                      <tr key={dato.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {dato.fechaFormateada}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {dato.dia}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {dato.cliente}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {dato.evento}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono text-xs">
                            {dato.codigoPerfil}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                          {dato.nombrePerfil}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Confirmado
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleAlta(dato)}
                              className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 text-xs font-medium flex items-center gap-1"
                            >
                              <UserPlus className="w-3 h-3" />
                              Alta
                            </button>
                            <button
                              onClick={() => handleBaja(dato)}
                              className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 text-xs font-medium"
                            >
                              Baja
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Componente separado para la gestión de coordinadores
function CoordinadoresSection({ 
  coordinadores, 
  setCoordinadores, 
  baseUrl, 
  publicAnonKey, 
  cargarDatos 
}) {
  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [editingCoordinador, setEditingCoordinador] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!nombre.trim()) {
      alert('Por favor ingresa un nombre');
      return;
    }
    
    try {
      if (editingCoordinador) {
        const response = await fetch(`${baseUrl}/coordinadores/${editingCoordinador.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            ...editingCoordinador,
            nombre,
            telefono,
            email
          })
        });
        
        const result = await response.json();
        if (result.success) {
          await cargarDatos();
          setNombre('');
          setTelefono('');
          setEmail('');
          setEditingCoordinador(null);
          setShowForm(false);
        }
      } else {
        const response = await fetch(`${baseUrl}/coordinadores`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ nombre, telefono, email })
        });
        
        const result = await response.json();
        if (result.success) {
          await cargarDatos();
          setNombre('');
          setTelefono('');
          setEmail('');
          setShowForm(false);
        }
      }
    } catch (error) {
      console.log('Error al guardar coordinador:', error);
    }
  };

  const handleEdit = (coordinador) => {
    setEditingCoordinador(coordinador);
    setNombre(coordinador.nombre);
    setTelefono(coordinador.telefono || '');
    setEmail(coordinador.email || '');
    setShowForm(true);
  };

  const handleDelete = async (coordinador) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar al coordinador ${coordinador.nombre}?`)) {
      return;
    }
    
    try {
      const response = await fetch(`${baseUrl}/coordinadores/${coordinador.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${publicAnonKey}`
        }
      });
      
      const result = await response.json();
      if (result.success) {
        await cargarDatos();
      }
    } catch (error) {
      console.log('Error al eliminar coordinador:', error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setNombre('');
    setTelefono('');
    setEmail('');
    setEditingCoordinador(null);
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Gestión de Coordinadores</h3>
          <p className="text-sm text-gray-600 mt-1">Administra los coordinadores del sistema</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Nuevo Coordinador
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
          <h4 className="text-gray-900 font-semibold mb-4">
            {editingCoordinador ? 'Editar Coordinador' : 'Nuevo Coordinador'}
          </h4>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2 text-sm font-medium">
                Nombre del Coordinador *
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 text-sm font-medium">
                Teléfono (para enviar mensajes por WhatsApp)
              </label>
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Ej: 612345678 o +34612345678"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 text-sm font-medium">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ej: coordinador@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                {editingCoordinador ? 'Actualizar' : 'Crear'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h4 className="text-gray-900 font-semibold mb-4">Lista de Coordinadores</h4>
        
        {coordinadores.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hay coordinadores registrados</p>
        ) : (
          <div className="space-y-3">
            {coordinadores.sort((a, b) => a.numero - b.numero).map((coordinador) => (
              <div
                key={coordinador.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center mb-2">
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded text-sm font-medium mr-3">
                    #{coordinador.numero}
                  </span>
                  <span className="text-gray-900 font-medium">{coordinador.nombre}</span>
                </div>
                <div className="ml-2 space-y-1">
                  {coordinador.telefono && (
                    <div className="text-gray-600 text-sm">
                      📱 Tel: {coordinador.telefono}
                    </div>
                  )}
                  {coordinador.email && (
                    <div className="text-gray-600 text-sm">
                      📧 Email: {coordinador.email}
                    </div>
                  )}
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => handleEdit(coordinador)}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(coordinador)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
