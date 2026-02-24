import { logger } from '../utils/logger';
import { useState } from 'react';
import { Settings, MessageSquare, TestTube, Mail, TestTube2, Trash2 } from 'lucide-react';
import { WhatsAppConfig } from './whatsapp-config';
import { TestPanel } from './test-panel';
import { TestEmail } from './test-email';
import { WhatsAppTest } from './whatsapp-test';

interface ConfiguracionProps {
  baseUrl: string;
  publicAnonKey: string;
  camareros?: any[];
  coordinadores?: any[];
  pedidos?: any[];
}

export function Configuracion({ baseUrl, publicAnonKey, camareros = [], coordinadores = [], pedidos = [] }: ConfiguracionProps) {
  const [activeSubTab, setActiveSubTab] = useState<'whatsapp' | 'whatsapp-test' | 'test-panel' | 'test-email' | 'utilidades'>('whatsapp');

  const subTabs = [
    { id: 'whatsapp' as const, label: 'WhatsApp', icon: MessageSquare },
    { id: 'whatsapp-test' as const, label: '🧪 Test de WhatsApp', icon: TestTube2 },
    { id: 'test-panel' as const, label: 'Panel de Pruebas', icon: TestTube },
    { id: 'test-email' as const, label: 'Prueba de Email', icon: Mail },
    { id: 'utilidades' as const, label: 'Utilidades', icon: Settings }
  ];

  // Función para eliminar pedido por número
  const eliminarPedidoPorNumero = async (numeroPedido: string) => {
    try {
      // Buscar el pedido por número
      const pedido = pedidos.find(p => p.numero === numeroPedido);
      
      if (!pedido) {
        alert(`❌ No se encontró el pedido ${numeroPedido}`);
        return;
      }

      if (!window.confirm(`¿Estás seguro de eliminar el pedido ${numeroPedido}?\n\nCliente: ${pedido.cliente}\nLugar: ${pedido.lugar}\nFecha: ${pedido.diaEvento}`)) {
        return;
      }

      logger.info(`🗑️ Eliminando pedido ${numeroPedido} con ID: ${pedido.id}`);

      const response = await fetch(`${baseUrl}/pedidos/${pedido.id}`, {
        method: 'DELETE',
        headers: { 
          Authorization: `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      
      logger.info('📝 Respuesta del servidor:', result);

      if (response.ok && result.success) {
        alert(`✅ Pedido ${numeroPedido} eliminado correctamente`);
        // Recargar la página para actualizar los datos
        window.location.reload();
      } else {
        logger.error('❌ Error al eliminar:', result);
        alert(`❌ Error al eliminar el pedido: ${result.error || 'Error desconocido'}`);
      }
    } catch (error) {
      logger.error('Error al eliminar pedido:', error);
      alert(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="w-8 h-8 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Configuración del Sistema</h2>
          <p className="text-gray-600">Configura y prueba las integraciones de WhatsApp y Email</p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b">
          <div className="flex">
            {subTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                    activeSubTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeSubTab === 'whatsapp' && (
            <WhatsAppConfig baseUrl={baseUrl} publicAnonKey={publicAnonKey} />
          )}
          
          {activeSubTab === 'whatsapp-test' && (
            <WhatsAppTest
              baseUrl={baseUrl}
              publicAnonKey={publicAnonKey}
              camareros={camareros}
              coordinadores={coordinadores}
              pedidos={pedidos}
            />
          )}
          
          {activeSubTab === 'test-panel' && (
            <TestPanel />
          )}
          
          {activeSubTab === 'test-email' && (
            <TestEmail baseUrl={baseUrl} publicAnonKey={publicAnonKey} />
          )}

          {activeSubTab === 'utilidades' && (
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Eliminar Pedido Específico
                </h3>
                <p className="text-sm text-red-700 mb-4">
                  Esta herramienta permite eliminar pedidos que no se pueden eliminar desde la interfaz normal.
                </p>
                
                <div className="bg-white rounded-lg p-4 border border-red-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Pedidos Actuales:</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {pedidos.map(pedido => (
                      <div key={pedido.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                        <div className="flex-1">
                          <span className="font-mono font-bold text-blue-600">{pedido.numero}</span>
                          <span className="text-gray-600 ml-3">{pedido.cliente}</span>
                          <span className="text-gray-500 ml-3 text-sm">{pedido.lugar}</span>
                          <span className="text-gray-400 ml-3 text-sm">{pedido.diaEvento}</span>
                        </div>
                        <button
                          onClick={() => eliminarPedidoPorNumero(pedido.numero)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm font-medium"
                        >
                          <Trash2 className="w-4 h-4" />
                          Eliminar
                        </button>
                      </div>
                    ))}
                    {pedidos.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No hay pedidos en el sistema</p>
                    )}
                  </div>
                </div>

                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800 font-medium">⚠️ Precaución:</p>
                  <p className="text-sm text-amber-700 mt-1">
                    La eliminación es permanente y no se puede deshacer. Asegúrate de seleccionar el pedido correcto.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}