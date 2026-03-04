import { useState, useEffect } from 'react';
import { Users, FileText, LayoutDashboard, ShoppingCart, Settings, Send, Shield, AlertCircle } from 'lucide-react';
import { Dashboard } from './components/dashboard';
import { Pedidos } from './components/pedidos';
import { Camareros } from './components/camareros';
import { Admin } from './components/admin';
import { Informes } from './components/informes';
import { Envios } from './components/envios';
import { Configuracion } from './components/configuracion';
import { ErrorBoundary } from './components/error-boundary';
import { projectId, publicAnonKey } from './utils/supabase/info';
import { logger } from './utils/logger';

// Aplicación de Gestión de Camareros para Eventos v2.2
// Última actualización: Panel de Admin con gestión de Altas
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [camareros, setCamareros] = useState<any[]>([]);
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [coordinadores, setCoordinadores] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-25b11ac0`;

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setErrorCarga(null);
    try {
      const [camarerosRes, pedidosRes, coordinadoresRes, clientesRes] = await Promise.all([
        fetch(`${baseUrl}/camareros`, {
          headers: { Authorization: `Bearer ${publicAnonKey}` }
        }),
        fetch(`${baseUrl}/pedidos`, {
          headers: { Authorization: `Bearer ${publicAnonKey}` }
        }),
        fetch(`${baseUrl}/coordinadores`, {
          headers: { Authorization: `Bearer ${publicAnonKey}` }
        }),
        fetch(`${baseUrl}/clientes`, {
          headers: { Authorization: `Bearer ${publicAnonKey}` }
        })
      ]);

      if (!camarerosRes.ok) throw new Error(`Error HTTP ${camarerosRes.status} al cargar camareros`);
      if (!pedidosRes.ok) throw new Error(`Error HTTP ${pedidosRes.status} al cargar pedidos`);
      if (!coordinadoresRes.ok) throw new Error(`Error HTTP ${coordinadoresRes.status} al cargar coordinadores`);
      if (!clientesRes.ok) throw new Error(`Error HTTP ${clientesRes.status} al cargar clientes`);

      const camarerosData = await camarerosRes.json();
      const pedidosData = await pedidosRes.json();
      const coordinadoresData = await coordinadoresRes.json();
      const clientesData = await clientesRes.json();

      if (camarerosData.success) setCamareros(camarerosData.data);
      if (pedidosData.success) setPedidos(pedidosData.data);
      if (coordinadoresData.success) setCoordinadores(coordinadoresData.data);
      if (clientesData.success) setClientes(clientesData.data);
    } catch (error) {
      logger.error('Error al cargar datos', error instanceof Error ? { message: error.message } : { error });
      setErrorCarga('No se pudieron cargar los datos. Verifica la conexión e intenta de nuevo.');
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
        {errorCarga && (
          <div className="mx-4 mt-4 mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">Error al cargar datos</p>
              <p className="text-sm text-red-600">{errorCarga}</p>
            </div>
            <button
              onClick={cargarDatos}
              className="ml-auto px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
            >
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
            />
          )}

          {/* Remove whatsapp-test tab content as it's now inside Configuracion */}
        </ErrorBoundary>
      </div>
    </div>
  );
}