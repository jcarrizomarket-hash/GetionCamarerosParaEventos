import { logger } from '../utils/logger';
import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Download, Filter, X } from 'lucide-react';
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

const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export function Admin({ coordinadores, setCoordinadores: _setCoordinadores, baseUrl, publicAnonKey, cargarDatos, camareros, pedidos }: AdminProps) {
  const [activeTab, setActiveTab] = useState<'coordinadores' | 'altas'>('coordinadores');

  // --- Coordinadores ---
  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [editingCoordinador, setEditingCoordinador] = useState<any>(null);

  const handleSubmitCoordinador = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      alert('Por favor ingresa un nombre');
      return;
    }
    try {
      const body = { nombre, telefono, email };
      const url = editingCoordinador
        ? `${baseUrl}/coordinadores/${editingCoordinador.id}`
        : `${baseUrl}/coordinadores`;
      const method = editingCoordinador ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
        body: JSON.stringify(editingCoordinador ? { ...editingCoordinador, ...body } : body),
      });
      const result = await response.json();
      if (result.success) {
        await cargarDatos();
        setNombre(''); setTelefono(''); setEmail('');
        setEditingCoordinador(null); setShowForm(false);
      }
    } catch (error) { logger.error('Error al guardar coordinador:', error); }
  };

  const eliminarCoordinador = async (id: string) => {
    if (!window.confirm('¿Eliminar este coordinador?')) return;
    try {
      const response = await fetch(`${baseUrl}/coordinadores/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });
      const result = await response.json();
      if (result.success) await cargarDatos();
    } catch (error) { logger.error('Error al eliminar coordinador:', error); }
  };

  const editarCoordinador = (coord: any) => {
    setEditingCoordinador(coord);
    setNombre(coord.nombre || '');
    setTelefono(coord.telefono || '');
    setEmail(coord.email || '');
    setShowForm(true);
  };

  // --- Altas ---
  const [showFiltros, setShowFiltros] = useState(false);
  const [filtroDesde, setFiltroDesde] = useState('');
  const [filtroHasta, setFiltroHasta] = useState('');
  const [filtroCliente, setFiltroCliente] = useState('');

  const altasData = useMemo(() => {
    const rows: any[] = [];
    for (const pedido of pedidos) {
      const asignados: any[] = pedido.camareros_asignados ?? pedido.personalAsignado ?? [];
      for (const asignado of asignados) {
        if (asignado.estado !== 'confirmado') continue;
        const cam = camareros.find((c: any) => c.id === asignado.camareroId || c.id === asignado.id);
        rows.push({
          fecha: pedido.fecha ?? '',
          dia: pedido.fecha ? DIAS_SEMANA[new Date(pedido.fecha).getDay()] : '',
          cliente: pedido.cliente ?? pedido.nombreCliente ?? '',
          evento: pedido.tipoEvento ?? pedido.evento ?? '',
          codPerfil: cam?.codigo ?? asignado.codigo ?? '',
          nombrePerfil: cam ? `${cam.nombre} ${cam.apellido}` : asignado.nombre ?? '',
          estado: 'Confirmado',
          pedidoId: pedido.id,
          camareroId: asignado.camareroId ?? asignado.id,
        });
      }
    }
    return rows;
  }, [pedidos, camareros]);

  const altasFiltradas = useMemo(() => {
    return altasData.filter(row => {
      if (filtroDesde && row.fecha < filtroDesde) return false;
      if (filtroHasta && row.fecha > filtroHasta) return false;
      if (filtroCliente && !row.cliente.toLowerCase().includes(filtroCliente.toLowerCase())) return false;
      return true;
    });
  }, [altasData, filtroDesde, filtroHasta, filtroCliente]);

  const exportarAltas = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const ws = workbook.addWorksheet('Altas');
      ws.columns = [
        { header: 'Fecha', key: 'fecha', width: 14 },
        { header: 'Día', key: 'dia', width: 12 },
        { header: 'Cliente', key: 'cliente', width: 20 },
        { header: 'Evento', key: 'evento', width: 20 },
        { header: 'Cód. Perfil', key: 'codPerfil', width: 14 },
        { header: 'Nombre Perfil', key: 'nombrePerfil', width: 24 },
        { header: 'Estado', key: 'estado', width: 14 },
      ];
      ws.addRows(altasFiltradas.map(r => ({
        fecha: r.fecha, dia: r.dia, cliente: r.cliente, evento: r.evento,
        codPerfil: r.codPerfil, nombrePerfil: r.nombrePerfil, estado: r.estado,
      })));
      ws.autoFilter = { from: 'A1', to: 'G1' };
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `altas_personal_${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      logger.error('Error al exportar altas:', error);
      alert('❌ Error al exportar');
    }
  };

  const limpiarFiltros = () => { setFiltroDesde(''); setFiltroHasta(''); setFiltroCliente(''); };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b">
        {(['coordinadores', 'altas'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 border-b-2 font-medium capitalize transition-colors ${
              activeTab === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab === 'coordinadores' ? 'Coordinadores' : 'Altas'}
          </button>
        ))}
      </div>

      {activeTab === 'coordinadores' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Coordinadores</h2>
            <button onClick={() => { setShowForm(!showForm); setEditingCoordinador(null); setNombre(''); setTelefono(''); setEmail(''); }}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              <Plus className="w-4 h-4" /> Nuevo Coordinador
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmitCoordinador} className="bg-white p-4 rounded shadow space-y-3">
              <h3 className="font-medium">{editingCoordinador ? 'Editar Coordinador' : 'Nuevo Coordinador'}</h3>
              <div className="grid grid-cols-3 gap-3">
                <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre *" required
                  className="border rounded px-3 py-2" />
                <input value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="Teléfono"
                  className="border rounded px-3 py-2" />
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email"
                  className="border rounded px-3 py-2" />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                  {editingCoordinador ? 'Guardar Cambios' : 'Crear'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">
                  Cancelar
                </button>
              </div>
            </form>
          )}

          <div className="bg-white rounded shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Nombre', 'Teléfono', 'Email', 'Acciones'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-sm font-medium text-gray-700">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {coordinadores.map((coord: any) => (
                  <tr key={coord.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">{coord.nombre}</td>
                    <td className="px-4 py-3 text-gray-600">{coord.telefono || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{coord.email || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => editarCoordinador(coord)} className="text-blue-500 hover:text-blue-700">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => eliminarCoordinador(coord.id)} className="text-red-500 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {coordinadores.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No hay coordinadores</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'altas' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Altas de Personal <span className="text-sm font-normal text-gray-500">({altasFiltradas.length} registros)</span></h2>
            <div className="flex gap-2">
              <button onClick={() => setShowFiltros(!showFiltros)}
                className="flex items-center gap-2 border px-3 py-2 rounded hover:bg-gray-50">
                <Filter className="w-4 h-4" /> {showFiltros ? 'Ocultar' : 'Mostrar'} Filtros
              </button>
              <button onClick={exportarAltas}
                className="flex items-center gap-2 bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600">
                <Download className="w-4 h-4" /> Exportar Excel
              </button>
            </div>
          </div>

          {showFiltros && (
            <div className="bg-white p-4 rounded shadow flex gap-4 items-end flex-wrap">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Desde</label>
                <input type="date" value={filtroDesde} onChange={e => setFiltroDesde(e.target.value)}
                  className="border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Hasta</label>
                <input type="date" value={filtroHasta} onChange={e => setFiltroHasta(e.target.value)}
                  className="border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Cliente</label>
                <input value={filtroCliente} onChange={e => setFiltroCliente(e.target.value)} placeholder="Buscar cliente..."
                  className="border rounded px-3 py-2" />
              </div>
              <button onClick={limpiarFiltros} className="flex items-center gap-1 text-gray-500 hover:text-gray-700">
                <X className="w-4 h-4" /> Limpiar
              </button>
            </div>
          )}

          <div className="bg-white rounded shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Fecha', 'Día', 'Cliente', 'Evento', 'Cód. Perfil', 'Nombre Perfil', 'Estado'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-gray-700">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {altasFiltradas.map((row, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">{row.fecha ? new Date(row.fecha).toLocaleDateString('es-ES') : '-'}</td>
                    <td className="px-4 py-3">{row.dia || '-'}</td>
                    <td className="px-4 py-3">{row.cliente || '-'}</td>
                    <td className="px-4 py-3">{row.evento || '-'}</td>
                    <td className="px-4 py-3 font-mono">{row.codPerfil || '-'}</td>
                    <td className="px-4 py-3">{row.nombrePerfil || '-'}</td>
                    <td className="px-4 py-3">
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">
                        {row.estado}
                      </span>
                    </td>
                  </tr>
                ))}
                {altasFiltradas.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No hay altas de personal confirmadas</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
