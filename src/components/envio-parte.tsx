import { useState } from 'react';
import { Printer } from 'lucide-react';

export function EnvioParte({ pedidos, camareros }) {
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [showPrintView, setShowPrintView] = useState(false);

  // Deduplicar pedidos
  const uniquePedidos = Array.from(new Map(pedidos.map(p => [p.id, p])).values());

  const imprimirParte = () => {
    window.print();
  };

  const pedidoSeleccionado = uniquePedidos.find(p => p.id === selectedPedido);

  return (
    <div className="max-w-6xl mx-auto">
      {!showPrintView ? (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-gray-900 mb-6">Envío de Parte</h2>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Seleccionar Pedido</label>
            <select
              value={selectedPedido || ''}
              onChange={(e) => setSelectedPedido(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccione un pedido</option>
              {uniquePedidos
                .sort((a, b) => new Date(a.diaEvento) - new Date(b.diaEvento))
                .map((pedido) => (
                  <option key={pedido.id} value={pedido.id}>
                    {new Date(pedido.diaEvento).toLocaleDateString('es-ES')} - {pedido.cliente} - {pedido.lugar}
                  </option>
                ))}
            </select>
          </div>

          {selectedPedido && pedidoSeleccionado && (
            <div>
              <button
                onClick={() => setShowPrintView(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Printer className="w-5 h-5" />
                Ver Parte para Imprimir
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Vista de impresión */}
          <div className="print-only-show">
            <style>{`
              @media print {
                .no-print { display: none !important; }
                .print-only-show { display: block !important; }
                body { background: white; }
                @page { margin: 20mm; }
              }
              @media screen {
                .print-only-show { background: white; padding: 40px; }
              }
            `}</style>

            {/* Botones de acción - solo en pantalla */}
            <div className="no-print mb-6 flex gap-4">
              <button
                onClick={imprimirParte}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Printer className="w-5 h-5" />
                Imprimir
              </button>
              <button
                onClick={() => setShowPrintView(false)}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Volver
              </button>
            </div>

            {/* Documento imprimible */}
            <div className="bg-white p-8 border border-gray-300" style={{ minHeight: '297mm' }}>
              {/* Cabecera */}
              <div className="mb-8 pb-4 border-b-2 border-gray-800">
                <h1 className="text-center mb-6">PARTE DE SERVICIO</h1>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="mb-2">
                      <span className="inline-block w-32">Cliente:</span>
                      <span className="border-b border-gray-800 inline-block min-w-[200px] px-2">
                        {pedidoSeleccionado.cliente}
                      </span>
                    </p>
                    <p className="mb-2">
                      <span className="inline-block w-32">Día:</span>
                      <span className="border-b border-gray-800 inline-block min-w-[200px] px-2">
                        {new Date(pedidoSeleccionado.diaEvento).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="mb-2">
                      <span className="inline-block w-40">Lugar del evento:</span>
                      <span className="border-b border-gray-800 inline-block min-w-[200px] px-2">
                        {pedidoSeleccionado.lugar}
                      </span>
                    </p>
                    <p className="mb-2">
                      <span className="inline-block w-40">Hora entrada:</span>
                      <span className="border-b border-gray-800 inline-block min-w-[200px] px-2">
                        {pedidoSeleccionado.horaEntrada}
                        {pedidoSeleccionado.horaEntrada2 && ` / ${pedidoSeleccionado.horaEntrada2}`}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Tabla de camareros */}
              <div className="mb-8">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-2 border-gray-800">
                      <th className="border-r-2 border-gray-800 p-3 text-left bg-gray-100">Camarero</th>
                      <th className="border-r-2 border-gray-800 p-3 text-left bg-gray-100">Hora Entrada</th>
                      <th className="border-r-2 border-gray-800 p-3 text-left bg-gray-100">Hora Salida</th>
                      <th className="border-r-2 border-gray-800 p-3 text-left bg-gray-100">Total</th>
                      <th className="border-gray-800 p-3 text-left bg-gray-100">Observaciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedidoSeleccionado.asignaciones && pedidoSeleccionado.asignaciones.length > 0 ? (
                      pedidoSeleccionado.asignaciones.map((asignacion, index) => (
                        <tr key={asignacion.camareroId} className="border-2 border-gray-800">
                          <td className="border-r-2 border-gray-800 p-3">
                            #{asignacion.camareroNumero} - {asignacion.camareroNombre}
                          </td>
                          <td className="border-r-2 border-gray-800 p-3">
                            {pedidoSeleccionado.horaEntrada}
                          </td>
                          <td className="border-r-2 border-gray-800 p-3">&nbsp;</td>
                          <td className="border-r-2 border-gray-800 p-3">&nbsp;</td>
                          <td className="border-gray-800 p-3">&nbsp;</td>
                        </tr>
                      ))
                    ) : (
                      // Filas vacías si no hay camareros asignados
                      Array.from({ length: 8 }).map((_, index) => (
                        <tr key={index} className="border-2 border-gray-800">
                          <td className="border-r-2 border-gray-800 p-3">&nbsp;</td>
                          <td className="border-r-2 border-gray-800 p-3">&nbsp;</td>
                          <td className="border-r-2 border-gray-800 p-3">&nbsp;</td>
                          <td className="border-r-2 border-gray-800 p-3">&nbsp;</td>
                          <td className="border-gray-800 p-3">&nbsp;</td>
                        </tr>
                      ))
                    )}
                    {/* Filas adicionales para completar */}
                    {pedidoSeleccionado.asignaciones && pedidoSeleccionado.asignaciones.length > 0 && 
                     pedidoSeleccionado.asignaciones.length < 8 && (
                      Array.from({ length: 8 - pedidoSeleccionado.asignaciones.length }).map((_, index) => (
                        <tr key={`extra-${index}`} className="border-2 border-gray-800">
                          <td className="border-r-2 border-gray-800 p-3">&nbsp;</td>
                          <td className="border-r-2 border-gray-800 p-3">&nbsp;</td>
                          <td className="border-r-2 border-gray-800 p-3">&nbsp;</td>
                          <td className="border-r-2 border-gray-800 p-3">&nbsp;</td>
                          <td className="border-gray-800 p-3">&nbsp;</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Firma del responsable */}
              <div className="flex justify-end mt-16">
                <div className="border-2 border-gray-800 p-6 w-80 text-center">
                  <p className="mb-12">Firma del Responsable</p>
                  <div className="border-t border-gray-800 mt-2"></div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
