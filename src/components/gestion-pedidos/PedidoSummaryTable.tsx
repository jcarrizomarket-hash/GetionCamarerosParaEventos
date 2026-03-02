interface PedidoSummaryTableProps {
  selectedPedido: any;
  uniqueCamareros: any[];
}

export function PedidoSummaryTable({ selectedPedido, uniqueCamareros }: PedidoSummaryTableProps) {
  if (!selectedPedido.asignaciones || selectedPedido.asignaciones.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Resumen del Equipo</h2>
      </div>
      <table className="w-full">
        <thead className="bg-white border-b border-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Camarero</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {selectedPedido.asignaciones.map((item: any, idx: number) => {
            const camareroInfo = uniqueCamareros.find((c: any) => c.id === item.camareroId);
            return (
              <tr key={`${selectedPedido.id}-${item.camareroId}-${idx}`} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.camareroNombre}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {camareroInfo?.telefono || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    item.estado === 'confirmado' ? 'bg-green-100 text-green-800' :
                    item.estado === 'enviado' ? 'bg-orange-100 text-orange-800' :
                    item.estado === 'rechazado' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {item.estado === 'confirmado' ? 'Confirmado' :
                     item.estado === 'enviado' ? 'Enviado' :
                     item.estado === 'rechazado' ? 'Rechazado' : 'Pendiente'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
