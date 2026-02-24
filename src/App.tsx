import { useState, useEffect } from 'react';
import { CalendarDays, Users, FileText, MessageSquare, Briefcase, UserPlus, FileCheck, Building2, LayoutDashboard, ShoppingCart, Settings, MessagesSquare, Send } from 'lucide-react';
import { Dashboard } from './components/dashboard';
import { Pedidos } from './components/pedidos';
import { Camareros } from './components/camareros';
import { Coordinadores } from './components/coordinadores';
import { Informes } from './components/informes';
import { Envios } from './components/envios';
import { Configuracion } from './components/configuracion';
import { projectId, publicAnonKey } from './utils/supabase/info';
import { useAuth } from './hooks/useAuth';

// Aplicación de Gestión de Camareros para Eventos v2.1
// Última actualización: Funcionalidad de edición y eliminación de coordinadores
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [camareros, setCamareros] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [coordinadores, setCoordinadores] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [selectedPedido, setSelectedPedido] = useState(null);

  const { isExpired, getAuthHeaders } = useAuth();

  const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-25b11ac0`;

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const authHeaders = getAuthHeaders();
      const [camarerosRes, pedidosRes, coordinadoresRes, clientesRes] = await Promise.all([
        fetch(`${baseUrl}/camareros`, {
          headers: authHeaders
        }),
        fetch(`${baseUrl}/pedidos`, {
          headers: authHeaders
        }),
        fetch(`${baseUrl}/coordinadores`, {
          headers: authHeaders
        }),
        fetch(`${baseUrl}/clientes`, {
          headers: authHeaders
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
  };

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
      </div>
    </div>
  );
}