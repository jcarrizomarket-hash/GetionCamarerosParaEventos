import { logger } from '../utils/logger';
import { useState } from 'react';
import { Shield, Users, Plus, Edit2, Trash2, Building2 } from 'lucide-react';
import { exportToCSV } from '../utils/file-export';

interface AdminProps {
  coordinadores: any[];
  setCoordinadores: (coordinadores: any[]) => void;
  baseUrl: string;
  publicAnonKey: string;
  cargarDatos: () => void;
  camareros?: any[];
  pedidos?: any[];
}

export function Admin({ coordinadores, setCoordinadores, baseUrl, publicAnonKey, cargarDatos, camareros = [], pedidos = [] }: AdminProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingCoord, setEditingCoord] = useState<any>(null);
  const [form, setForm] = useState({ nombre: '', apellido: '', telefono: '', email: '' });

  const resetForm = () => {
    setForm({ nombre: '', apellido: '', telefono: '', email: '' });
    setEditingCoord(null);
    setShowForm(false);
  };

  const guardarCoordinador = async () => {
    if (!form.nombre || !form.apellido) {
      alert('❌ Nombre y apellido son obligatorios');
      return;
    }
    try {
      const method = editingCoord ? 'PUT' : 'POST';
      const url = editingCoord ? `${baseUrl}/coordinadores/${editingCoord.id}` : `${baseUrl}/coordinadores`;
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
        body: JSON.stringify(form)
      });
      if (response.ok) {
        await cargarDatos();
        resetForm();
        alert(`✅ Coordinador ${editingCoord ? 'actualizado' : 'creado'} correctamente`);
      } else {
        alert('❌ Error al guardar coordinador');
      }
    } catch (error) {
      logger.error('Error al guardar coordinador:', error);
      alert('❌ Error al guardar coordinador');
    }
  };

  const eliminarCoordinador = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este coordinador?')) return;
    try {
      const response = await fetch(`${baseUrl}/coordinadores/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${publicAnonKey}` }
      });
      if (response.ok) {
        await cargarDatos();
        alert('✅ Coordinador eliminado');
      } else {
        alert('❌ Error al eliminar coordinador');
      }
    } catch (error) {
      logger.error('Error al eliminar coordinador:', error);
      alert('❌ Error al eliminar coordinador');
    }
  };

  const exportarCoordinadores = () => {
    const datos = coordinadores.map(c => ({
      Nombre: c.nombre,
      Apellido: c.apellido,
      Teléfono: c.telefono || '',
      Email: c.email || ''
    }));
    exportToCSV(datos, `Coordinadores_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-7 h-7 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Panel de Administración</h2>
            <p className="text-gray-500 text-sm">Gestión de coordinadores y datos del sistema</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportarCoordinadores}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
          >
            Exportar CSV
          </button>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> Nuevo Coordinador
          </button>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-xs text-gray-500">Coordinadores</p>
              <p className="text-2xl font-bold">{coordinadores.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-xs text-gray-500">Personal</p>
              <p className="text-2xl font-bold">{camareros.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-xs text-gray-500">Pedidos</p>
              <p className="text-2xl font-bold">{pedidos.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
          <h3 className="font-semibold text-gray-800">{editingCoord ? 'Editar Coordinador' : 'Nuevo Coordinador'}</h3>
          <div className="grid grid-cols-2 gap-4">
            <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Nombre *" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
            <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Apellido *" value={form.apellido} onChange={e => setForm({ ...form, apellido: e.target.value })} />
            <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Teléfono" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} />
            <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={resetForm} className="px-4 py-2 border rounded-lg text-sm">Cancelar</button>
            <button onClick={guardarCoordinador} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Guardar</button>
          </div>
        </div>
      )}

      {/* Lista de coordinadores */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-800">Coordinadores</h3>
        </div>
        {coordinadores.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No hay coordinadores registrados</div>
        ) : (
          <div className="divide-y">
            {coordinadores.map(coord => (
              <div key={coord.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-800">{coord.nombre} {coord.apellido}</p>
                  <p className="text-sm text-gray-500">{coord.email} {coord.telefono ? `· ${coord.telefono}` : ''}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setEditingCoord(coord); setForm({ nombre: coord.nombre, apellido: coord.apellido, telefono: coord.telefono || '', email: coord.email || '' }); setShowForm(true); }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => eliminarCoordinador(coord.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
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