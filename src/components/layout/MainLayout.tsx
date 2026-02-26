import { useState, useEffect, useCallback } from 'react';
import { LayoutDashboard, ShoppingCart, Users, Shield, FileText, Send, Settings } from 'lucide-react';
import { Dashboard } from '../dashboard';
import { Pedidos } from '../pedidos';
import { Camareros } from '../camareros';
import { Admin } from '../admin';
import { Informes } from '../informes';
import { Envios } from '../envios';
import { Configuracion } from '../configuracion';
import { ErrorBoundary } from '../error-boundary';
import { LoadingSpinner } from '../loading-spinner';
import { useAppContext } from '../../context/AppContext';
import { loadAllData } from '../../services/dataService';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-25b11ac0`;

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'pedidos', label: 'Pedidos', icon: ShoppingCart },
  { id: 'camareros', label: 'Personal', icon: Users },
  { id: 'admin', label: 'Admin', icon: Shield },
  { id: 'informes', label: 'Informes', icon: FileText },
  { id: 'envios', label: 'Envíos', icon: Send },
  { id: 'configuracion', label: 'Configuración', icon: Settings },
];

export function MainLayout() {
  const { state, dispatch } = useAppContext();
  const { camareros, pedidos, coordinadores, clientes, loading, error } = state;
  const [activeTab, setActiveTab] = useState('dashboard');

  const cargarDatos = useCallback(() => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    loadAllData()
      .then((data) => {
        dispatch({ type: 'SET_ALL_DATA', payload: data });
      })
      .catch((err: Error) => {
        dispatch({ type: 'SET_ERROR', payload: err.message });
      })
      .finally(() => {
        dispatch({ type: 'SET_LOADING', payload: false });
      });
  }, [dispatch]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const setPedidos = useCallback(
    (p: any[]) => dispatch({ type: 'SET_PEDIDOS', payload: p }),
    [dispatch],
  );
  const setCamareros = useCallback(
    (c: any[]) => dispatch({ type: 'SET_CAMAREROS', payload: c }),
    [dispatch],
  );
  const setCoordinadores = useCallback(
    (c: any[]) => dispatch({ type: 'SET_COORDINADORES', payload: c }),
    [dispatch],
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" message="Cargando datos..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-lg font-medium">Error al cargar los datos</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={cargarDatos}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

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
          {TABS.map((tab) => {
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
        </ErrorBoundary>
      </div>
    </div>
  );
}
