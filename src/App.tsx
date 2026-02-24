import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { CalendarDays, Users, FileText, MessageSquare, Briefcase, UserPlus, FileCheck, Building2, LayoutDashboard, ShoppingCart, Settings, MessagesSquare, Send } from 'lucide-react';
import { projectId, publicAnonKey } from './utils/supabase/info';

const Dashboard = lazy(() => import('./components/dashboard').then(m => ({ default: m.Dashboard })));
const Pedidos = lazy(() => import('./components/pedidos').then(m => ({ default: m.Pedidos })));
const Camareros = lazy(() => import('./components/camareros').then(m => ({ default: m.Camareros })));
const Coordinadores = lazy(() => import('./components/coordinadores').then(m => ({ default: m.Coordinadores })));
const Informes = lazy(() => import('./components/informes').then(m => ({ default: m.Informes })));
const Envios = lazy(() => import('./components/envios').then(m => ({ default: m.Envios })));
const Configuracion = lazy(() => import('./components/configuracion').then(m => ({ default: m.Configuracion })));

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-64">
    <div className="text-gray-600">Cargando...</div>
  </div>
);

// Aplicación de Gestión de Camareros para Eventos v2.1
// Última actualización: Funcionalidad de edición y eliminación de coordinadores
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [camareros, setCamareros] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [coordinadores, setCoordinadores] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [selectedPedido, setSelectedPedido] = useState(null);

  const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-25b11ac0`;

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = useCallback(async () => {
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

      const camarerosData = await camarerosRes.json();
      const pedidosData = await pedidosRes.json();
      const coordinadoresData = await coordinadoresRes.json();
      const clientesData = await clientesRes.json();

      if (camarerosData.success) setCamareros(camarerosData.data);
      if (pedidosData.success) setPedidos(pedidosData.data);
      if (coordinadoresData.success) setCoordinadores(coordinadoresData.data);
      if (clientesData.success) setClientes(clientesData.data);
    } catch (error) {
      console.log('Error al cargar datos:', error);
    }
  }, [baseUrl, publicAnonKey]);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pedidos', label: 'Pedidos', icon: ShoppingCart },
    { id: 'camareros', label: 'Personal', icon: Users },
    { id: 'coordinadores', label: 'Coordinadores', icon: UserPlus },
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
        <Suspense fallback={<LoadingFallback />}>
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
        </Suspense>
      </div>
    </div>
  );
}