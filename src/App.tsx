import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { Users, FileText, LayoutDashboard, ShoppingCart, Settings, Send, Shield, AlertCircle, RefreshCw } from 'lucide-react';
import { Dashboard } from './components/dashboard';
import { Pedidos } from './components/pedidos';
import { Camareros } from './components/camareros';
import { Admin } from './components/admin';
import { Informes } from './components/informes';
import { Envios } from './components/envios';
import { Configuracion } from './components/configuracion';
import { ErrorBoundary } from './components/error-boundary';
import { supabaseFunctionEndpoint as baseUrl, supabaseAnonKey as publicAnonKey } from './config/env';
import { getCamareros, getPedidos, getCoordinadores, getClientes } from './src/api/client';
import type { Camarero, Pedido, Coordinador, Cliente } from './src/types';
import { logger } from './utils/logger';

// Aplicación de Gestión de Camareros para Eventos v2.2
// Última actualización: Panel de Admin con gestión de Altas
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [camareros, setCamareros] = useState<Camarero[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [coordinadores, setCoordinadores] = useState<Coordinador[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setErrorCarga(null);
    try {
      const [camarerosRes, pedidosRes, coordinadoresRes, clientesRes] = await Promise.all([
        getCamareros(),
        getPedidos(),
        getCoordinadores(),
        getClientes()
      ]);

      if (!camarerosRes.success) throw new Error(camarerosRes.error || 'Error al cargar camareros');
      if (!pedidosRes.success) throw new Error(pedidosRes.error || 'Error al cargar pedidos');
      if (!coordinadoresRes.success) throw new Error(coordinadoresRes.error || 'Error al cargar coordinadores');
      if (!clientesRes.success) throw new Error(clientesRes.error || 'Error al cargar clientes');

      if (camarerosRes.data) setCamareros(camarerosRes.data);
      if (pedidosRes.data) setPedidos(pedidosRes.data);
      if (coordinadoresRes.data) setCoordinadores(coordinadoresRes.data);
      if (clientesRes.data) setClientes(clientesRes.data);
    } catch (error) {
      logger.error('Error al cargar datos', error instanceof Error ? { message: error.message } : { error });
      setErrorCarga('No se pudieron cargar los datos. Verifica la conexión e intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pedidos', label: 'Pedidos', icon: ShoppingCart },
    { id: 'camareros', label: 'Personal', icon: Users },
    { id: 'admin', label: 'Admin', icon: Shield },
    { id: 'informes', label: 'Informes', icon: FileText },
    { id: 'envios', label: 'Envíos', icon: Send },
    { id: 'configuracion', label: 'Configuración', icon: Settings }
  ];

  if (cargando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-10 flex flex-col items-center gap-6 max-w-sm w-full mx-4">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Users className="w-9 h-9 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900">Gestión de Camareros</h1>
            <p className="text-sm text-gray-500 mt-1">para Eventos · v2.2</p>
          </div>
          <div className="flex flex-col items-center gap-3 w-full">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-600">Cargando datos del sistema...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster richColors position="top-right" />
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">Gestión de Camareros para Eventos</h1>
              <p className="text-xs text-gray-500">Sistema de gestión · v2.2</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
              <div className={`w-2 h-2 rounded-full ${errorCarga ? 'bg-red-500' : camareros.length > 0 || pedidos.length > 0 ? 'bg-green-500' : 'bg-yellow-400'}`} />
              <span>{errorCarga ? 'Error de conexión' : `${camareros.length} camareros · ${pedidos.length} pedidos`}</span>
            </div>
            <button
              onClick={cargarDatos}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-gray-200 hover:border-blue-200"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b shadow-sm">
        <div className="flex overflow-x-auto scrollbar-hide px-2">
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
        {errorCarga && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800">Error al cargar datos</p>
              <p className="text-sm text-red-600 mt-0.5">{errorCarga}</p>
            </div>
            <button
              onClick={cargarDatos}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors flex-shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reintentar
            </button>
          </div>
        )}
        <ErrorBoundary>
          {activeTab === 'dashboard' && (
            <Dashboard
              camareros={camareros}
              pedidos={pedidos}
              clientes={clientes}
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
              clientes={clientes}
              setClientes={setClientes}
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

          {activeTab === 'admin' && (
            <Admin
              coordinadores={coordinadores}
              setCoordinadores={setCoordinadores}
              baseUrl={baseUrl}
              publicAnonKey={publicAnonKey}
              cargarDatos={cargarDatos}
              camareros={camareros}
              pedidos={pedidos}
            />
          )}

          {activeTab === 'informes' && (
            <Informes
              camareros={camareros}
              pedidos={pedidos}
              clientes={clientes}
              baseUrl={baseUrl}
              publicAnonKey={publicAnonKey}
            />
          )}

          {activeTab === 'envios' && (
            <Envios
              pedidos={pedidos}
              camareros={camareros}
              coordinadores={coordinadores}
              clientes={clientes}
              baseUrl={baseUrl}
              publicAnonKey={publicAnonKey}
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
              cargarDatos={cargarDatos}
            />
          )}

          {/* Remove whatsapp-test tab content as it's now inside Configuracion */}
        </ErrorBoundary>
      </div>
    </div>
  );
}