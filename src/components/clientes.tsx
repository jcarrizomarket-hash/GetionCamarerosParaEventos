import { useState } from 'react';
import { Plus, Edit2, Trash2, Building2 } from 'lucide-react';

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
      console.log('Error al guardar cliente:', error);
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
    if (!confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      return;
    }

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
      console.log('Error al eliminar cliente:', error);
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

        {/* Lista de clientes */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto 1
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto 2
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clientes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No hay clientes registrados</p>
                    <p className="text-sm">Agrega tu primer cliente usando el botón de arriba</p>
                  </td>
                </tr>
              ) : (
                clientes.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {cliente.numero}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {cliente.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{cliente.contacto1}</span>
                        {cliente.telefono1 && <span className="text-xs">{cliente.telefono1}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{cliente.contacto2}</span>
                        {cliente.telefono2 && <span className="text-xs">{cliente.telefono2}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(cliente)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar cliente"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cliente.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar cliente"
                        >
                          <Trash2 className="w-4 h-4" />
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
    </div>
  );
}
