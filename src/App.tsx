import { useState, useEffect } from 'react';
import { CalendarDays, Users, FileText, MessageSquare, Briefcase, UserPlus, FileCheck, Building2, LayoutDashboard, ShoppingCart, Settings, MessagesSquare } from 'lucide-react';
import { Dashboard } from './components/dashboard';
import { Pedidos } from './components/pedidos';
import { Camareros } from './components/camareros';
import { Coordinadores } from './components/coordinadores';
import { Informes } from './components/informes';
import { EnvioMensaje } from './components/envio-mensaje';
import { EnvioParte } from './components/envio-parte';
import { ChatGrupal } from './components/chat-grupal';
import { Configuracion } from './components/configuracion';
import { projectId, publicAnonKey } from './utils/supabase/info';
import { parseApiResponse, fetchConReintento } from './src/utils/helpers';

// Aplicación de Gestión de Camareros para Eventos v2.1
// Última actualización: Funcionalidad de edición y eliminación de coordinadores
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [camareros, setCamareros] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [coordinadores, setCoordinadores] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-25b11ac0`;

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const headers = { Authorization: `Bearer ${publicAnonKey}` };
    const endpoints = [
      { key: 'camareros', url: `${baseUrl}/camareros` },
      { key: 'pedidos', url: `${baseUrl}/pedidos` },
      { key: 'coordinadores', url: `${baseUrl}/coordinadores` },
      { key: 'clientes', url: `${baseUrl}/clientes` },
    ] as const;

    const resultados = await Promise.allSettled(
      endpoints.map(({ key, url }) =>
        fetchConReintento(url, { headers }, key).then((res) => parseApiResponse(res, key))
      )
    );

    const setters: Record<string, (data: any) => void> = {
      camareros: setCamareros,
      pedidos: setPedidos,
      coordinadores: setCoordinadores,
      clientes: setClientes,
    };

    const errores: string[] = [];

    resultados.forEach((resultado, index) => {
      const { key } = endpoints[index];
      if (resultado.status === 'fulfilled') {
        const { data, error: endpointError } = resultado.value;
        if (data !== null) {
          setters[key]?.(data as any);
        } else if (endpointError) {
          errores.push(endpointError);
        }
      } else {
        const errorMsg = `Error de red en ${key}: ${resultado.reason?.message || 'Error desconocido'}`;
        console.error(errorMsg);
        errores.push(errorMsg);
      }
    });

    setError(errores.length > 0 ? errores.join('\n') : null);
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pedidos', label: 'Pedidos', icon: ShoppingCart },
    { id: 'camareros', label: 'Personal', icon: Users },
    { id: 'coordinadores', label: 'Coordinadores', icon: UserPlus },
    { id: 'informes', label: 'Informes', icon: FileText },
    { id: 'envio-mensaje', label: 'Envío Mensaje', icon: MessageSquare },
    { id: 'envio-parte', label: 'Envío Parte', icon: FileCheck },
    { id: 'chat-grupal', label: 'Chat Grupal', icon: MessagesSquare },
    { id: 'configuracion', label: 'Configuración', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <h1 className="text-gray-900">Gestión de Camareros para Eventos</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
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
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 whitespace-pre-line">
            <strong>Error al cargar datos:</strong>
            <br />
            {error}
          </div>
        )}
        {activeTab === 'dashboard' && (
          <Dashboard
            camareros={camareros}
            pedidos={pedidos}
            setActiveTab={setActiveTab}
            baseUrl={baseUrl}
            publicAnonKey={publicAnonKey}
          />
        )}
        
        {activeTab === 'pedidos' && (
          <Pedidos
            pedidos={pedidos}
            setPedidos={setPedidos}
            camareros={camareros}
            coordinadores={coordinadores}
            baseUrl={baseUrl}
            publicAnonKey={publicAnonKey}
            cargarDatos={cargarDatos}
          />
        )}
        
        {activeTab === 'camareros' && (
          <Camareros
            camareros={camareros}
            setCamareros={setCamareros}
            pedidos={pedidos}
            coordinadores={coordinadores}
            baseUrl={baseUrl}
            publicAnonKey={publicAnonKey}
            cargarDatos={cargarDatos}
          />
        )}

        {activeTab === 'coordinadores' && (
          <Coordinadores
            coordinadores={coordinadores}
            setCoordinadores={setCoordinadores}
            baseUrl={baseUrl}
            publicAnonKey={publicAnonKey}
            cargarDatos={cargarDatos}
          />
        )}

        {activeTab === 'informes' && (
          <Informes
            camareros={camareros}
            pedidos={pedidos}
            baseUrl={baseUrl}
            publicAnonKey={publicAnonKey}
          />
        )}

        {activeTab === 'envio-mensaje' && (
          <EnvioMensaje
            pedidos={pedidos}
            camareros={camareros}
            coordinadores={coordinadores}
            baseUrl={baseUrl}
            publicAnonKey={publicAnonKey}
            setPedidos={setPedidos}
            cargarDatos={cargarDatos}
          />
        )}

        {activeTab === 'envio-parte' && (
          <EnvioParte
            pedidos={pedidos}
            camareros={camareros}
            coordinadores={coordinadores}
            clientes={clientes}
            baseUrl={baseUrl}
            publicAnonKey={publicAnonKey}
          />
        )}

        {activeTab === 'chat-grupal' && (
          <ChatGrupal
            pedidos={pedidos}
            camareros={camareros}
            coordinadores={coordinadores}
            baseUrl={baseUrl}
            publicAnonKey={publicAnonKey}
            cargarDatos={cargarDatos}
          />
        )}

        {activeTab === 'configuracion' && (
          <Configuracion
            baseUrl={baseUrl}
            publicAnonKey={publicAnonKey}
            camareros={camareros}
            coordinadores={coordinadores}
            pedidos={pedidos}
            clientes={clientes}
          />
        )}

        {/* Remove whatsapp-test tab content as it's now inside Configuracion */}
      </div>
    </div>
  );
}