import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface CoordinadoresProps {
  coordinadores: any[];
  setCoordinadores: (coordinadores: any[]) => void;
  baseUrl: string;
  publicAnonKey: string;
  cargarDatos: () => void;
}

export function Coordinadores({ coordinadores, setCoordinadores, baseUrl, publicAnonKey, cargarDatos }: CoordinadoresProps) {
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
        // Actualizar coordinador existente
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
        // Crear nuevo coordinador
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
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-gray-900">Gestión de Coordinadores</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo Coordinador
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-gray-900 mb-4">
            {editingCoordinador ? 'Editar Coordinador' : 'Nuevo Coordinador'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Nombre del Coordinador *</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Teléfono (para enviar mensajes por WhatsApp)</label>
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Ej: 612345678 o +34612345678"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Email</label>
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
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingCoordinador ? 'Actualizar' : 'Crear'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de coordinadores */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-gray-900 mb-4">Lista de Coordinadores</h3>
        
        {coordinadores.length === 0 ? (
          <p className="text-gray-500">No hay coordinadores registrados</p>
        ) : (
          <div className="space-y-3">
            {coordinadores.sort((a, b) => a.numero - b.numero).map((coordinador) => (
              <div
                key={coordinador.id}
                className="p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center mb-2">
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded text-sm mr-3">
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
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => handleEdit(coordinador)}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 flex items-center gap-2"
                  >
                    <Pencil className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(coordinador)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
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