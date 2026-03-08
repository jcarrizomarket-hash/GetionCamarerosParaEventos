import { logger } from '../utils/logger';
import { useState } from 'react';
import { Plus, Edit2, Trash2, Building2 } from 'lucide-react';
import { ConfirmDialog } from './ui/confirm-dialog';

export function Clientes({ clientes, setClientes, baseUrl, publicAnonKey, cargarDatos }) {
  const [showForm, setShowForm] = useState(false);
  const [editandoClienteId, setEditandoClienteId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    contacto1: '',
    contacto2: '',
    telefono1: '',
    telefono2: '',
    mail1: '',
    mail2: '',
    notas: ''
  });

  // Confirm dialog state
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    message: string;
    onConfirm: () => void;
  }>({ open: false, message: '', onConfirm: () => {} });

  const showConfirm = (message: string): Promise<boolean> =>
    Promise.resolve(window.confirm(message));

  const handleConfirmCancel = () => {
    setConfirmState(s => ({ ...s, open: false }));
  };

  const generarNumeroCliente = () => {
    if (clientes.length === 0) {
      return 'CL001';
    }
    
    // Obtener todos los números de cliente
    const numeros = clientes.map(c => {
      const match = c.numero?.match(/CL(\d+)/);
      return match ? parseInt(match[1]) : 0;
    });
    
    const maxNumero = Math.max(...numeros);
    const nuevoNumero = maxNumero + 1;
    return `CL${String(nuevoNumero).padStart(3, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editandoClienteId) {
        // Actualizar cliente existente
        const clienteActualizado = clientes.find(c => c.id === editandoClienteId);
        const response = await fetch(`${baseUrl}/clientes/${editandoClienteId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            ...clienteActualizado,
            ...formData
          })
        });

        const result = await response.json();
        if (result.success) {
          await cargarDatos();
          resetForm();
        }
      } else {
        // Crear nuevo cliente
        const numeroCliente = generarNumeroCliente();
        const response = await fetch(`${baseUrl}/clientes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            numero: numeroCliente,
            ...formData
          })
        });

        const result = await response.json();
        if (result.success) {
          await cargarDatos();
          resetForm();
        }
      }
    } catch (error) {
      logger.error('Error al guardar cliente:', error);
    }
  };

  const handleEdit = (cliente) => {
    setFormData({
      nombre: cliente.nombre || '',
      contacto1: cliente.contacto1 || '',
      contacto2: cliente.contacto2 || '',
      telefono1: cliente.telefono1 || '',
      telefono2: cliente.telefono2 || '',
      mail1: cliente.mail1 || '',
      mail2: cliente.mail2 || '',
      notas: cliente.notas || ''
    });
    setEditandoClienteId(cliente.id);
    setShowForm(true);
  };

  const handleDelete = async (clienteId) => {
    const confirmed = await showConfirm('¿Estás seguro de que deseas eliminar este cliente?');
    if (!confirmed) return;

    try {
      const response = await fetch(`${baseUrl}/clientes/${clienteId}`, {
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
      logger.error('Error al eliminar cliente:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      contacto1: '',
      contacto2: '',
      telefono1: '',
      telefono2: '',
      mail1: '',
      mail2: '',
      notas: ''
    });
    setEditandoClienteId(null);
    setShowForm(false);
  };

  return (
    <>
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-blue-600" />
            <h2 className="text-gray-900">Gestión de Clientes</h2>
          </div>
          
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Agregar Cliente
            </button>
          )}
        </div>

        {/* Formulario */}
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-gray-900 mb-4">
              {editandoClienteId ? 'Editar Cliente' : 'Nuevo Cliente'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre del cliente */}
              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2">Nombre del Cliente *</label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre completo del cliente"
                />
              </div>

              {/* Contacto 1 */}
              <div>
                <label className="block text-gray-700 mb-2">Contacto 1</label>
                <input
                  type="text"
                  value={formData.contacto1}
                  onChange={(e) => setFormData({ ...formData, contacto1: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre del contacto principal"
                />
              </div>

              {/* Contacto 2 */}
              <div>
                <label className="block text-gray-700 mb-2">Contacto 2</label>
                <input
                  type="text"
                  value={formData.contacto2}
                  onChange={(e) => setFormData({ ...formData, contacto2: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre del contacto secundario"
                />
              </div>

              {/* Teléfono 1 */}
              <div>
                <label className="block text-gray-700 mb-2">Teléfono 1</label>
                <input
                  type="tel"
                  value={formData.telefono1}
                  onChange={(e) => setFormData({ ...formData, telefono1: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+34 600 000 000"
                />
              </div>

              {/* Teléfono 2 */}
              <div>
                <label className="block text-gray-700 mb-2">Teléfono 2</label>
                <input
                  type="tel"
                  value={formData.telefono2}
                  onChange={(e) => setFormData({ ...formData, telefono2: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+34 600 000 000"
                />
              </div>

              {/* Mail 1 */}
              <div>
                <label className="block text-gray-700 mb-2">Email 1</label>
                <input
                  type="email"
                  value={formData.mail1}
                  onChange={(e) => setFormData({ ...formData, mail1: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="email@ejemplo.com"
                />
              </div>

              {/* Mail 2 */}
              <div>
                <label className="block text-gray-700 mb-2">Email 2</label>
                <input
                  type="email"
                  value={formData.mail2}
                  onChange={(e) => setFormData({ ...formData, mail2: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="email@ejemplo.com"
                />
              </div>

              {/* Notas */}
              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2">Notas</label>
                <textarea
                  value={formData.notas}
                  onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  placeholder="Información adicional del cliente..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editandoClienteId ? 'Actualizar Cliente' : 'Guardar Cliente'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Lista de clientes — cards en móvil, tabla en desktop */}
        {clientes.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 px-6 py-12 text-center text-gray-500">
            <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No hay clientes registrados</p>
            <p className="text-sm">Agrega tu primer cliente usando el botón de arriba</p>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="sm:hidden space-y-3">
              {clientes.map((cliente) => (
                <div key={cliente.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">#{cliente.numero}</span>
                      <div className="mt-1 text-base font-semibold text-gray-900">{cliente.nombre}</div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => handleEdit(cliente)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(cliente.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-400 font-medium mb-1">Contacto 1</div>
                      <div className="font-medium text-gray-900">{cliente.contacto1 || '—'}</div>
                      {cliente.telefono1 && <div className="text-gray-500 text-xs mt-0.5">📱 {cliente.telefono1}</div>}
                      {cliente.email1 && <div className="text-gray-500 text-xs mt-0.5 break-all">✉️ {cliente.email1}</div>}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-400 font-medium mb-1">Contacto 2</div>
                      <div className="font-medium text-gray-900">{cliente.contacto2 || '—'}</div>
                      {cliente.telefono2 && <div className="text-gray-500 text-xs mt-0.5">📱 {cliente.telefono2}</div>}
                      {cliente.email2 && <div className="text-gray-500 text-xs mt-0.5 break-all">✉️ {cliente.email2}</div>}
                    </div>
                  </div>
                  {cliente.notas && (
                    <div className="mt-2 text-xs text-gray-500 bg-yellow-50 rounded-lg p-2">📝 {cliente.notas}</div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto 1</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto 2</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {clientes.map((cliente) => (
                    <tr key={cliente.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{cliente.numero}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{cliente.nombre}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{cliente.contacto1}</span>
                          {cliente.telefono1 && <span className="text-xs">{cliente.telefono1}</span>}
                          {cliente.email1 && <span className="text-xs text-blue-600">{cliente.email1}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{cliente.contacto2}</span>
                          {cliente.telefono2 && <span className="text-xs">{cliente.telefono2}</span>}
                          {cliente.email2 && <span className="text-xs text-blue-600">{cliente.email2}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleEdit(cliente)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(cliente.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
    <ConfirmDialog
      open={confirmState.open}
      message={confirmState.message}
      onConfirm={confirmState.onConfirm}
      onCancel={handleConfirmCancel}
    />
    </>
  );
}
