import { useState } from 'react';
import { Edit2, Trash2, Check, AlertCircle, Send, X } from 'lucide-react';
import type { Pedido } from './types';

interface PedidoEntryListProps {
  uniquePedidos: Pedido[];
  isPedidoCompleto: (pedido: Pedido) => boolean;
  enviarConfirmacionCliente: (pedido: Pedido) => void;
  handleEdit: (pedido: Pedido) => void;
  handleDelete: (id: string) => void;
}

export function PedidoEntryList({
  uniquePedidos,
  isPedidoCompleto,
  enviarConfirmacionCliente,
  handleEdit,
  handleDelete,
}: PedidoEntryListProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const onDeleteClick = (id: string) => setConfirmDeleteId(id);
  const onConfirmDelete = (id: string) => { setConfirmDeleteId(null); handleDelete(id); };
  const onCancelDelete = () => setConfirmDeleteId(null);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Listado de Pedidos</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cód</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lugar</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horario 1</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {uniquePedidos
              .sort((a, b) => new Date(b.diaEvento).getTime() - new Date(a.diaEvento).getTime())
              .map((pedido, idx) => {
                const completo = isPedidoCompleto(pedido);
                const confirmando = confirmDeleteId === pedido.id;
                return (
                  <tr key={pedido.id || idx} className={`hover:bg-gray-50 transition-colors ${confirmando ? 'bg-red-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{pedido.numero}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pedido.cliente}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pedido.lugar}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(pedido.diaEvento).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pedido.horaEntrada} - {pedido.horaSalida}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        completo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {completo ? <Check className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                        {completo ? 'Completo' : 'Incompleto'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {confirmando ? (
                        <div className="flex justify-end items-center gap-2">
                          <span className="text-xs text-red-600 font-semibold">¿Eliminar?</span>
                          <button
                            onClick={() => onConfirmDelete(pedido.id)}
                            className="px-2.5 py-1 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700 transition-colors"
                          >
                            Sí
                          </button>
                          <button
                            onClick={onCancelDelete}
                            className="px-2.5 py-1 bg-gray-200 text-gray-700 text-xs font-bold rounded hover:bg-gray-300 transition-colors"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => enviarConfirmacionCliente(pedido)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Enviar confirmación al cliente"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(pedido)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteClick(pedido.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            {uniquePedidos.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  No hay pedidos registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
