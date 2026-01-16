import { useState } from 'react';
import { Plus } from 'lucide-react';

export function Coordinadores({ coordinadores, setCoordinadores, baseUrl, publicAnonKey, cargarDatos }) {
  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!nombre.trim()) {
      alert('Por favor ingresa un nombre');
      return;
    }
    
    try {
      const response = await fetch(`${baseUrl}/coordinadores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ nombre, telefono })
      });
      
      const result = await response.json();
      if (result.success) {
        await cargarDatos();
        setNombre('');
        setTelefono('');
        setShowForm(false);
      }
    } catch (error) {
      console.log('Error al crear coordinador:', error);
    }
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
          <h3 className="text-gray-900 mb-4">Nuevo Coordinador</h3>
          
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

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Crear
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setNombre('');
                  setTelefono('');
                }}
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
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div>
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded text-sm mr-3">
                    #{coordinador.numero}
                  </span>
                  <span className="text-gray-900">{coordinador.nombre}</span>
                  {coordinador.telefono && (
                    <span className="text-gray-600 text-sm ml-3">
                      Tel: {coordinador.telefono}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}