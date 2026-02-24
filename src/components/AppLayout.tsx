import { useEffect, useMemo, useCallback } from 'react';
import {
  Users,
  FileText,
  UserPlus,
  LayoutDashboard,
  ShoppingCart,
  Settings,
  Send,
} from 'lucide-react';
import { Dashboard } from './dashboard';
import { Pedidos } from './pedidos';
import { Camareros } from './camareros';
import { Coordinadores } from './coordinadores';
import { Informes } from './informes';
import { Envios } from './envios';
import { Configuracion } from './configuracion';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { useAuth } from '../hooks/useAuth';
import { useApp } from '../context/AppContext';

const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-25b11ac0`;

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'pedidos', label: 'Pedidos', icon: ShoppingCart },
  { id: 'camareros', label: 'Personal', icon: Users },
  { id: 'coordinadores', label: 'Coordinadores', icon: UserPlus },
  { id: 'informes', label: 'Informes', icon: FileText },
  { id: 'envios', label: 'Envíos', icon: Send },
  { id: 'configuracion', label: 'Configuración', icon: Settings },
];

/**
 * AppLayout contains the main navigation shell and renders the active tab content.
 * It reads global state from AppContext and triggers initial data loading on mount.
 */
export function AppLayout() {
  const { isExpired } = useAuth();
  const {
    camareros,
    pedidos,
    coordinadores,
    clientes,
    activeTab,
    setActiveTab,
    setCamareros,
    setPedidos,
    cargarTodosDatos,
  } = useApp();

  useEffect(() => {
    cargarTodosDatos();
  }, [cargarTodosDatos]);

  const handleSetActiveTab = useCallback(
    (tab: string) => setActiveTab(tab),
    [setActiveTab]
  );

  const dashboardProps = useMemo(
    () => ({
      camareros,
      pedidos,
      setActiveTab: handleSetActiveTab,
      baseUrl,
      publicAnonKey,
    }),
    [camareros, pedidos, handleSetActiveTab]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Session expired warning */}
      {isExpired && (
        <div className="bg-red-600 text-white text-center py-2 px-4 text-sm">
          Tu sesión ha expirado. Por favor, recarga la página para continuar.
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <h1 className="text-gray-900">Gestión de Camareros para Eventos</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="flex overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleSetActiveTab(tab.id)}
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
        {activeTab === 'dashboard' && <Dashboard {...dashboardProps} />}

        {activeTab === 'pedidos' && (
          <Pedidos
            pedidos={pedidos}
            setPedidos={setPedidos}
            camareros={camareros}
            coordinadores={coordinadores}
            baseUrl={baseUrl}
            publicAnonKey={publicAnonKey}
            cargarDatos={cargarTodosDatos}
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
            cargarDatos={cargarTodosDatos}
          />
        )}

        {activeTab === 'coordinadores' && (
          <Coordinadores
            coordinadores={coordinadores}
            setCoordinadores={setCoordinadores}
            baseUrl={baseUrl}
            publicAnonKey={publicAnonKey}
            cargarDatos={cargarTodosDatos}
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
      </div>
    </div>
  );
}
