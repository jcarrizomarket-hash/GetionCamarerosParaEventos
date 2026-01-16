import { useState, useEffect } from 'react';
import { CalendarDays, Users, FileText, MessageSquare, Briefcase, UserPlus, FileCheck, Building2, LayoutDashboard, ShoppingCart } from 'lucide-react';
import { Dashboard } from './components/dashboard';
import { Pedidos } from './components/pedidos';
import { Camareros } from './components/camareros';
import { Coordinadores } from './components/coordinadores';
import { Informes } from './components/informes';
import { EnvioMensaje } from './components/envio-mensaje';
import { EnvioParte } from './components/envio-parte';
import { projectId, publicAnonKey } from './utils/supabase/info';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [camareros, setCamareros] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [coordinadores, setCoordinadores] = useState([]);
  const [selectedPedido, setSelectedPedido] = useState(null);

  const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-25b11ac0`;

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [camarerosRes, pedidosRes, coordinadoresRes] = await Promise.all([
        fetch(`${baseUrl}/camareros`, {
          headers: { Authorization: `Bearer ${publicAnonKey}` }
        }),
        fetch(`${baseUrl}/pedidos`, {
          headers: { Authorization: `Bearer ${publicAnonKey}` }
        }),
        fetch(`${baseUrl}/coordinadores`, {
          headers: { Authorization: `Bearer ${publicAnonKey}` }
        })
      ]);

      const camarerosData = await camarerosRes.json();
      const pedidosData = await pedidosRes.json();
      const coordinadoresData = await coordinadoresRes.json();

      if (camarerosData.success) setCamareros(camarerosData.data);
      if (pedidosData.success) setPedidos(pedidosData.data);
      if (coordinadoresData.success) setCoordinadores(coordinadoresData.data);
    } catch (error) {
      console.log('Error al cargar datos:', error);
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pedidos', label: 'Pedidos', icon: ShoppingCart },
    { id: 'camareros', label: 'Camareros', icon: Users },
    { id: 'coordinadores', label: 'Coordinadores', icon: UserPlus },
    { id: 'informes', label: 'Informes', icon: FileText },
    { id: 'envio-mensaje', label: 'Envío Mensaje', icon: MessageSquare },
    { id: 'envio-parte', label: 'Envío Parte', icon: FileCheck }
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
            baseUrl={baseUrl}
            publicAnonKey={publicAnonKey}
            setPedidos={setPedidos}
            cargarDatos={cargarDatos}
          />
        )}
      </div>
    </div>
  );
}