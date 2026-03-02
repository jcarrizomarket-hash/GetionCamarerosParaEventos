import { useState, useEffect, useCallback } from 'react';
import { Users, FileText, LayoutDashboard, ShoppingCart, Settings, Send, Shield } from 'lucide-react';
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
import type { Camarero, Pedido, Coordinador, Cliente } from './types';

// Aplicación de Gestión de Camareros para Eventos v3.0
// Última actualización: TypeScript estricto y resiliencia mejorada
export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [camareros, setCamareros] = useState<Camarero[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [coordinadores, setCoordinadores] = useState<Coordinador[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-25b11ac0`;

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const headers = { Authorization: `Bearer ${publicAnonKey}` };

      const fetchJson = async (url: string, label: string) => {
        const response = await fetch(url, { headers });
        const json = await response.json();
        if (!response.ok) {
          throw new Error(`Error HTTP ${response.status} al cargar ${label}`);
        }
        return json;
      };

      // Use Promise.allSettled instead of Promise.all to handle partial failures
      const results = await Promise.allSettled([
        fetchJson(`${baseUrl}/camareros`, 'camareros'),
        fetchJson(`${baseUrl}/pedidos`, 'pedidos'),
        fetchJson(`${baseUrl}/coordinadores`, 'coordinadores'),
        fetchJson(`${baseUrl}/clientes`, 'clientes'),
      ]);

      const [camarerosResult, pedidosResult, coordinadoresResult, clientesResult] = results;

      // Process each result independently — if one fails, the others still work
      if (camarerosResult.status === 'fulfilled' && camarerosResult.value.success) {
        setCamareros(camarerosResult.value.data);
      } else if (camarerosResult.status === 'fulfilled' && !camarerosResult.value.success) {
        logger.error('Camareros request unsuccessful', camarerosResult.value);
        setError(prev => prev ?? (camarerosResult.value?.message || 'Error cargando camareros.'));
      } else if (camarerosResult.status === 'rejected') {
        logger.error('Error loading camareros', camarerosResult.reason);
      }

      if (pedidosResult.status === 'fulfilled' && pedidosResult.value.success) {
        setPedidos(pedidosResult.value.data);
      } else if (pedidosResult.status === 'fulfilled' && !pedidosResult.value.success) {
        logger.error('Pedidos request unsuccessful', pedidosResult.value);
        setError(prev => prev ?? (pedidosResult.value?.message || 'Error cargando pedidos.'));
      } else if (pedidosResult.status === 'rejected') {
        logger.error('Error loading pedidos', pedidosResult.reason);
      }

      if (coordinadoresResult.status === 'fulfilled' && coordinadoresResult.value.success) {
        setCoordinadores(coordinadoresResult.value.data);
      } else if (coordinadoresResult.status === 'fulfilled' && !coordinadoresResult.value.success) {
        logger.error('Coordinadores request unsuccessful', coordinadoresResult.value);
        setError(prev => prev ?? (coordinadoresResult.value?.message || 'Error cargando coordinadores.'));
      } else if (coordinadoresResult.status === 'rejected') {
        logger.error('Error loading coordinadores', coordinadoresResult.reason);
      }

      if (clientesResult.status === 'fulfilled' && clientesResult.value.success) {
        setClientes(clientesResult.value.data);
      } else if (clientesResult.status === 'fulfilled' && !clientesResult.value.success) {
        logger.error('Clientes request unsuccessful', clientesResult.value);
        setError(prev => prev ?? (clientesResult.value?.message || 'Error cargando clientes.'));
      } else if (clientesResult.status === 'rejected') {
        logger.error('Error loading clientes', clientesResult.reason);
      }

      // Check if ALL failed (including fulfilled responses that indicate failure)
      const allFailed = results.every(r => {
        if (r.status === 'rejected') return true;
        const value: any = r.value;
        return !value || value.success === false;
      });
      if (allFailed) {
        setError('No se pudo conectar con el servidor. Compruebe su conexión.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido al cargar datos';
      setError(message);
      logger.error('Error al cargar datos', err);
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

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

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Cargando datos...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
          <button
            onClick={cargarDatos}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Content */}
      {!loading && (
      <div className="p-6">
        <ErrorBoundary>
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
      )}
    </div>
  );
}