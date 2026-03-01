import { logger } from '../utils/logger';
import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Download, UserPlus, UserMinus, Filter, X } from 'lucide-react';
import * as XLSX from 'xlsx';

const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

interface AdminProps {
  coordinadores: any[];
  setCoordinadores: (coordinadores: any[]) => void;
  baseUrl: string;
  publicAnonKey: string;
  cargarDatos: () => void;
  camareros: any[];
  pedidos: any[];
}

export function Admin({ coordinadores, setCoordinadores, baseUrl, publicAnonKey, cargarDatos, camareros, pedidos }: AdminProps) {
  const [activeTab, setActiveTab] = useState<'coordinadores' | 'altas'>('coordinadores');

  // ==================== COORDINADORES STATE ====================
  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [editingCoordinador, setEditingCoordinador] = useState<any>(null);

  // ==================== ALTAS STATE ====================
  const [showFilters, setShowFilters] = useState(false);
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('');
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('');
  const [filtroCliente, setFiltroCliente] = useState('');

  // ==================== COORDINADORES HANDLERS ====================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      alert('Por favor ingresa un nombre');
      return;
    }
    try {
      if (editingCoordinador) {
        const response = await fetch(`${baseUrl}/coordinadores/${editingCoordinador.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
          body: JSON.stringify({ ...editingCoordinador, nombre, telefono, email }),
        });
        const result = await response.json();
        if (result.success) {
          await cargarDatos();
          resetForm();
        }
      } else {
        const response = await fetch(`${baseUrl}/coordinadores`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
          body: JSON.stringify({ nombre, telefono, email }),
        });
        const result = await response.json();
        if (result.success) {
          await cargarDatos();
          resetForm();
        }
      }
    } catch (error) {
      logger.error('Error al guardar coordinador:', error);
    }
  };

  const resetForm = () => {
    setNombre('');
    setTelefono('');
    setEmail('');
    setEditingCoordinador(null);
    setShowForm(false);
  };

  const handleEdit = (coordinador: any) => {
    setEditingCoordinador(coordinador);
    setNombre(coordinador.nombre);
    setTelefono(coordinador.telefono || '');
    setEmail(coordinador.email || '');
    setShowForm(true);
  };

  const handleDelete = async (coordinador: any) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar al coordinador ${coordinador.nombre}?`)) return;
    try {
      const response = await fetch(`${baseUrl}/coordinadores/${coordinador.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });
      const result = await response.json();
      if (result.success) await cargarDatos();
    } catch (error) {
      logger.error('Error al eliminar coordinador:', error);
    }
  };

  // ==================== ALTAS DATA ====================
  const altas = useMemo(() => {
    const result: any[] = [];
    pedidos.forEach((pedido) => {
      const asignaciones = pedido.asignaciones || pedido.camareros_asignados || [];
      asignaciones.forEach((asignacion: any) => {
        if (asignacion.estado === 'confirmado') {
          const camarero = camareros.find((c) => c.id === (asignacion.camareroId || asignacion.camarero_id));
          const fecha = pedido.fecha || pedido.fecha_evento || '';
          const fechaObj = fecha ? new Date(fecha) : null;
          const codigoPerfil = camarero
            ? `${(camarero.tipoPerfil || camarero.tipo_perfil || 'CAM').toUpperCase()}${String(camarero.numero || '001').padStart(3, '0')}`
            : 'CAM001';
          result.push({
            id: `${pedido.id}-${asignacion.camareroId || asignacion.camarero_id}`,
            fecha,
            fechaFormateada: fechaObj ? fechaObj.toLocaleDateString('es-ES') : '',
            dia: fechaObj ? DIAS_SEMANA[fechaObj.getDay()] : '',
            cliente: pedido.cliente || pedido.nombre_cliente || '',
            evento: pedido.tipoEvento || pedido.tipo_evento || pedido.tipo || '',
            codigoPerfil,
            nombrePerfil: camarero ? camarero.nombre : (asignacion.nombre || ''),
            estado: 'Confirmado',
            camareroId: asignacion.camareroId || asignacion.camarero_id,
            pedidoId: pedido.id,
          });
        }
      });
    });
    return result;
  }, [pedidos, camareros]);

  const altasFiltradas = useMemo(() => {
    return altas.filter((alta) => {
      if (filtroFechaDesde && alta.fecha < filtroFechaDesde) return false;
      if (filtroFechaHasta && alta.fecha > filtroFechaHasta) return false;
      if (filtroCliente && !alta.cliente.toLowerCase().includes(filtroCliente.toLowerCase())) return false;
      return true;
    });
  }, [altas, filtroFechaDesde, filtroFechaHasta, filtroCliente]);

  const exportarExcel = () => {
    const rows = altasFiltradas.map((a) => ({
      Fecha: a.fechaFormateada,
      Día: a.dia,
      Cliente: a.cliente,
      Evento: a.evento,
      'Cód. Perfil': a.codigoPerfil,
      'Nombre Perfil': a.nombrePerfil,
      Estado: a.estado,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rows.length, c: 6 } }) };
    const colWidths = [{ wch: 12 }, { wch: 12 }, { wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 25 }, { wch: 12 }];
    ws['!cols'] = colWidths;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Altas Personal');
    XLSX.writeFile(wb, `altas_personal_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const limpiarFiltros = () => {
    setFiltroFechaDesde('');
    setFiltroFechaHasta('');
    setFiltroCliente('');
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-gray-900 mb-4">Panel de Administración</h2>
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('coordinadores')}
            className={`px-6 py-3 border-b-2 transition-colors ${activeTab === 'coordinadores' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
          >
            Coordinadores
          </button>
          <button
            onClick={() => setActiveTab('altas')}
            className={`px-6 py-3 border-b-2 transition-colors ${activeTab === 'altas' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
          >
            Altas ⭐
          </button>
        </div>
      </div>

      {activeTab === 'coordinadores' && (
        <div>
          <div className="mb-6 flex justify-between items-center">
            <h3 className="text-gray-900">Gestión de Coordinadores</h3>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nuevo Coordinador
            </button>
          </div>

          {showForm && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h4 className="text-gray-900 mb-4">{editingCoordinador ? 'Editar Coordinador' : 'Nuevo Coordinador'}</h4>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Nombre *</label>
                  <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Teléfono</label>
                  <input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Ej: 612345678" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{editingCoordinador ? 'Actualizar' : 'Crear'}</button>
                  <button type="button" onClick={resetForm} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancelar</button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm p-6">
            {coordinadores.length === 0 ? (
              <p className="text-gray-500">No hay coordinadores registrados</p>
            ) : (
              <div className="space-y-3">
                {[...coordinadores].sort((a, b) => (a.numero || 0) - (b.numero || 0)).map((coordinador) => (
                  <div key={coordinador.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded text-sm mr-3">#{coordinador.numero}</span>
                      <span className="text-gray-900 font-medium">{coordinador.nombre}</span>
                    </div>
                    <div className="ml-2 space-y-1">
                      {coordinador.telefono && <div className="text-gray-600 text-sm">📱 {coordinador.telefono}</div>}
                      {coordinador.email && <div className="text-gray-600 text-sm">📧 {coordinador.email}</div>}
                    </div>
                    <div className="mt-2 flex gap-2">
                      <button onClick={() => handleEdit(coordinador)} className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 flex items-center gap-2">
                        <Pencil className="w-4 h-4" /> Editar
                      </button>
                      <button onClick={() => handleDelete(coordinador)} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2">
                        <Trash2 className="w-4 h-4" /> Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'altas' && (
        <div>
          <div className="mb-4 flex justify-between items-center flex-wrap gap-2">
            <h3 className="text-gray-900">Altas de Personal ({altasFiltradas.length} registros)</h3>
            <div className="flex gap-2">
              <button onClick={() => setShowFilters(!showFilters)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-2">
                <Filter className="w-4 h-4" /> {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
              </button>
              <button onClick={exportarExcel} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                <Download className="w-4 h-4" /> Exportar Excel
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <label className="block text-gray-700 text-sm mb-1">Fecha Desde</label>
                  <input type="date" value={filtroFechaDesde} onChange={(e) => setFiltroFechaDesde(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm mb-1">Fecha Hasta</label>
                  <input type="date" value={filtroFechaHasta} onChange={(e) => setFiltroFechaHasta(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm mb-1">Cliente</label>
                  <input type="text" value={filtroCliente} onChange={(e) => setFiltroCliente(e.target.value)} placeholder="Buscar cliente..." className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <button onClick={limpiarFiltros} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-2">
                  <X className="w-4 h-4" /> Limpiar
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
            {altasFiltradas.length === 0 ? (
              <p className="p-6 text-gray-500">No hay altas de personal confirmadas{altas.length > 0 ? ' con los filtros aplicados' : ''}</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left">Fecha</th>
                    <th className="px-4 py-3 text-left">Día</th>
                    <th className="px-4 py-3 text-left">Cliente</th>
                    <th className="px-4 py-3 text-left">Evento</th>
                    <th className="px-4 py-3 text-left">Cód. Perfil</th>
                    <th className="px-4 py-3 text-left">Nombre Perfil</th>
                    <th className="px-4 py-3 text-left">Estado</th>
                    <th className="px-4 py-3 text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {altasFiltradas.map((alta) => (
                    <tr key={alta.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-900">{alta.fechaFormateada}</td>
                      <td className="px-4 py-3 text-gray-600">{alta.dia}</td>
                      <td className="px-4 py-3 text-gray-900">{alta.cliente}</td>
                      <td className="px-4 py-3 text-gray-600">{alta.evento}</td>
                      <td className="px-4 py-3 font-mono text-gray-700">{alta.codigoPerfil}</td>
                      <td className="px-4 py-3 text-gray-900">{alta.nombrePerfil}</td>
                      <td className="px-4 py-3">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">{alta.estado}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            onClick={() => alert('Funcionalidad de Alta en desarrollo')}
                            className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1 text-xs"
                            title="Alta"
                          >
                            <UserPlus className="w-3 h-3" /> Alta
                          </button>
                          <button
                            onClick={() => alert('Funcionalidad de Baja en desarrollo')}
                            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-1 text-xs"
                            title="Baja"
                          >
                            <UserMinus className="w-3 h-3" /> Baja
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}