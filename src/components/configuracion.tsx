import { useState } from 'react';
import { Settings, MessageSquare, TestTube, Mail, TestTube2 } from 'lucide-react';
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
  const [activeSubTab, setActiveSubTab] = useState<'whatsapp' | 'whatsapp-test' | 'test-panel' | 'test-email'>('whatsapp');

  const subTabs = [
    { id: 'whatsapp' as const, label: 'WhatsApp', icon: MessageSquare },
    { id: 'whatsapp-test' as const, label: '🧪 Test de WhatsApp', icon: TestTube2 },
    { id: 'test-panel' as const, label: 'Panel de Pruebas', icon: TestTube },
    { id: 'test-email' as const, label: 'Prueba de Email', icon: Mail }
  ];

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
        </div>
      </div>
    </div>
  );
}