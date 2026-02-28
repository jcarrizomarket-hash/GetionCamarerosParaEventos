import { logger } from '../utils/logger';
import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Download, Shield, Users } from 'lucide-react';
import ExcelJS from 'exceljs';

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

  // --- Coordinadores state ---
  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [editingCoordinador, setEditingCoordinador] = useState<any>(null);

  // --- Altas filters ---
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [filtroCliente, setFiltroCliente] = useState('');
  const [showFiltros, setShowFiltros] = useState(false);

  // --- Coordinadores handlers ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) { alert('Por favor ingresa un nombre'); return; }
    try {
      const url = editingCoordinador
        ? `${baseUrl}/coordinadores/${editingCoordinador.id}`
        : `${baseUrl}/coordinadores`;
      const method = editingCoordinador ? 'PUT' : 'POST';
      const body = editingCoordinador
        ? JSON.stringify({ ...editingCoordinador, nombre, telefono, email })
        : JSON.stringify({ nombre, telefono, email });
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
        body
      });
      const result = await response.json();
      if (result.success) {
        await cargarDatos();
        setNombre(''); setTelefono(''); setEmail('');
        setEditingCoordinador(null); setShowForm(false);
      }
    } catch (error) { logger.error('Error al guardar coordinador:', error); }
  };

  const handleEdit = (coord: any) => {
    setEditingCoordinador(coord);
    setNombre(coord.nombre); setTelefono(coord.telefono || ''); setEmail(coord.email || '');
    setShowForm(true);
  };

  const handleDelete = async (coord: any) => {
    if (!confirm(`¿Eliminar coordinador ${coord.nombre}?`)) return;
    try {
      const response = await fetch(`${baseUrl}/coordinadores/${coord.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${publicAnonKey}` }
      });
      const result = await response.json();
      if (result.success) await cargarDatos();
    } catch (error) { logger.error('Error al eliminar coordinador:', error); }
  };

  const handleCancel = () => {
    setShowForm(false); setNombre(''); setTelefono(''); setEmail(''); setEditingCoordinador(null);
  };

  // --- Altas data ---
  const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  const altas = useMemo(() => {
    const result: any[] = [];
    pedidos.forEach((pedido: any) => {
      (pedido.asignaciones || []).forEach((asignacion: any) => {
        if (asignacion.estado !== 'confirmado') return;
        const camarero = camareros.find((c: any) => c.id === asignacion.camareroId);
        if (!camarero) return;
        const fechaObj = pedido.fecha ? new Date(pedido.fecha) : null;
        result.push({
          id: `${pedido.id}-${asignacion.camareroId}`,
          fecha: pedido.fecha || '',
          fechaFormateada: fechaObj ? fechaObj.toLocaleDateString('es-ES') : '',
          dia: fechaObj ? DIAS[fechaObj.getDay()] : '',
          cliente: pedido.cliente || '',
          evento: pedido.tipoEvento || pedido.evento || '',
          codigoPerfil: camarero.codigo || '',
          nombrePerfil: `${camarero.nombre} ${camarero.apellido}`,
          estado: 'confirmado',
          turno: asignacion.turno || '',
          camareroId: asignacion.camareroId,
          pedidoId: pedido.id
        });
      });
    });
    return result.sort((a, b) => a.fecha.localeCompare(b.fecha));
  }, [pedidos, camareros]);

  const altasFiltradas = useMemo(() => {
    return altas.filter((alta: any) => {
      if (fechaDesde && alta.fecha < fechaDesde) return false;
      if (fechaHasta && alta.fecha > fechaHasta) return false;
      if (filtroCliente && !alta.cliente.toLowerCase().includes(filtroCliente.toLowerCase())) return false;
      return true;
    });
  }, [altas, fechaDesde, fechaHasta, filtroCliente]);

  const exportarAltas = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Altas Personal');
      worksheet.columns = [
        { header: 'Fecha', key: 'fechaFormateada', width: 12 },
        { header: 'Día', key: 'dia', width: 12 },
        { header: 'Cliente', key: 'cliente', width: 20 },
        { header: 'Evento', key: 'evento', width: 20 },
        { header: 'Código Perfil', key: 'codigoPerfil', width: 14 },
        { header: 'Nombre Perfil', key: 'nombrePerfil', width: 24 },
        { header: 'Estado', key: 'estado', width: 12 },
        { header: 'Turno', key: 'turno', width: 12 }
      ];
      worksheet.autoFilter = { from: 'A1', to: 'H1' };
      altasFiltradas.forEach((alta: any) => worksheet.addRow(alta));
      const fecha = new Date().toISOString().split('T')[0];
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `altas_personal_${fecha}.xlsx`; a.click();
      URL.revokeObjectURL(url);
    } catch (error) { logger.error('Error al exportar altas:', error); alert('❌ Error al exportar'); }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-bold text-gray-900">Administración</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('coordinadores')}
          className={`px-4 py-2 flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'coordinadores' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
        >
          <Users className="w-4 h-4" />
          Coordinadores
        </button>
        <button
          onClick={() => setActiveTab('altas')}
          className={`px-4 py-2 flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'altas' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
        >
          <Download className="w-4 h-4" />
          Altas
        </button>
      </div>

      {/* Coordinadores Tab */}
      {activeTab === 'coordinadores' && (
        <div>
          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Gestión de Coordinadores</h3>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nuevo Coordinador
            </button>
          </div>

          {showForm && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
              <h4 className="font-semibold text-gray-900 mb-4">
                {editingCoordinador ? 'Editar Coordinador' : 'Nuevo Coordinador'}
              </h4>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-1">Nombre *</label>
                  <input type="text" value={nombre} onChange={e => setNombre(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Teléfono</label>
                  <input type="tel" value={telefono} onChange={e => setTelefono(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    {editingCoordinador ? 'Actualizar' : 'Crear'}
                  </button>
                  <button type="button" onClick={handleCancel} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm p-6">
            {coordinadores.length === 0 ? (
              <p className="text-gray-500">No hay coordinadores registrados</p>
            ) : (
              <div className="space-y-3">
                {coordinadores.sort((a: any, b: any) => (a.nombre || '').localeCompare(b.nombre || '')).map((coord: any) => (
                  <div key={coord.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">{coord.nombre}</p>
                      <p className="text-sm text-gray-500">{coord.telefono} {coord.email ? `· ${coord.email}` : ''}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(coord)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(coord)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Altas Tab */}
      {activeTab === 'altas' && (
        <div>
          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Altas de Personal
              <span className="ml-2 text-sm font-normal text-gray-500">({altasFiltradas.length} registros)</span>
            </h3>
            <div className="flex gap-2">
              <button onClick={() => setShowFiltros(!showFiltros)} className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">
                {showFiltros ? 'Ocultar Filtros' : 'Mostrar Filtros'}
              </button>
              <button onClick={exportarAltas} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm">
                <Download className="w-4 h-4" />
                Exportar Excel
              </button>
            </div>
          </div>

          {showFiltros && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4 flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Desde</label>
                <input type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Hasta</label>
                <input type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Cliente</label>
                <input type="text" value={filtroCliente} onChange={e => setFiltroCliente(e.target.value)}
                  placeholder="Buscar cliente..."
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <button onClick={() => { setFechaDesde(''); setFechaHasta(''); setFiltroCliente(''); }}
                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm">
                Limpiar Filtros
              </button>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Fecha', 'Día', 'Cliente', 'Evento', 'Código', 'Nombre', 'Estado', 'Acciones'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-gray-700 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {altasFiltradas.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">No hay altas confirmadas</td></tr>
                ) : (
                  altasFiltradas.map((alta: any) => (
                    <tr key={alta.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-900">{alta.fechaFormateada}</td>
                      <td className="px-4 py-3 text-gray-600">{alta.dia}</td>
                      <td className="px-4 py-3 text-gray-900">{alta.cliente}</td>
                      <td className="px-4 py-3 text-gray-600">{alta.evento}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-mono">{alta.codigoPerfil}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-900">{alta.nombrePerfil}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Confirmado</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => alert('En desarrollo')} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200">Alta</button>
                          <button onClick={() => alert('En desarrollo')} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200">Baja</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
