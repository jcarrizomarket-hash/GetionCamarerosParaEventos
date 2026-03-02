import { X, MapPin, Clock, Users } from 'lucide-react';
import type { Cliente, Coordinador, FormData } from './types';

interface PedidoEntryFormProps {
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  editingId: string | null;
  formData: FormData;
  setFormData: (data: FormData) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleTimeChange: (field: string, value: string, type: number) => void;
  uniqueClientes: Cliente[];
  coordinadores: Coordinador[];
}

export function PedidoEntryForm({
  showForm,
  setShowForm,
  editingId,
  formData,
  setFormData,
  handleSubmit,
  handleTimeChange,
  uniqueClientes,
  coordinadores,
}: PedidoEntryFormProps) {
  if (!showForm) return null;

  return (
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
                    onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option key="cliente-empty" value="">Seleccionar cliente...</option>
                    {uniqueClientes.map((c) => (
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
                      const coordinador = coordinadores.find((c) => c.id === e.target.value);
                      setFormData({
                        ...formData,
                        coordinadorId: e.target.value,
                        coordinadorNombre: coordinador ? coordinador.nombre : '',
                      });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option key="coordinador-empty" value="">Seleccionar coordinador...</option>
                    {coordinadores.map((c) => (
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
                    onChange={(e) => setFormData({ ...formData, diaEvento: e.target.value })}
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
                        const googleMapsUrl = nuevoLugar.trim()
                          ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nuevoLugar)}`
                          : '';
                        setFormData({ ...formData, lugar: nuevoLugar, ubicacion: googleMapsUrl });
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
                    onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
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
                      onChange={(e) => setFormData({ ...formData, cantidadCamareros: parseInt(e.target.value) })}
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
                      onChange={(e) => setFormData({ ...formData, cantidadCamareros2: parseInt(e.target.value) })}
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
                  onChange={(e) => setFormData({ ...formData, catering: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, camisa: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
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
  );
}
