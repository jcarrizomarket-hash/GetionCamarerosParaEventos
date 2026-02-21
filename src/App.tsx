import { useState, useEffect, useCallback } from 'react';
import { CalendarDays, Users, FileText, MessageSquare, Briefcase, UserPlus, FileCheck, Building2, LayoutDashboard, ShoppingCart, Settings, MessagesSquare, LogOut, Shield, User, Bot } from 'lucide-react';
import { Dashboard } from './components/dashboard';
import { Pedidos } from './components/pedidos';
import { Camareros } from './components/camareros';
import { Coordinadores } from './components/coordinadores';
import { Informes } from './components/informes';
import { EnvioMensaje } from './components/envio-mensaje';
import { EnvioParte } from './components/envio-parte';
import { ChatGrupal } from './components/chat-grupal';
import { Configuracion } from './components/configuracion';
import { LoginScreen } from './components/login-screen';
import { SetupWizard } from './components/setup-wizard';
import { GestionUsuarios } from './components/gestion-usuarios';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CambiarPasswordModal } from './components/cambiar-password-modal';
import { ChatbotPanel } from './components/chatbot-panel';
import { projectId, publicAnonKey } from './utils/supabase/info';

function AppShell() {
  const { user, logout, isAdmin, requirePasswordChange } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [camareros, setCamareros] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [coordinadores, setCoordinadores] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-25b11ac0`;

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = useCallback(async () => {
    try {
      setErrorCarga(null);
      const [camarerosRes, pedidosRes, coordinadoresRes, clientesRes] = await Promise.all([
        fetch(`${baseUrl}/camareros`, { headers: { Authorization: `Bearer ${publicAnonKey}` } }),
        fetch(`${baseUrl}/pedidos`, { headers: { Authorization: `Bearer ${publicAnonKey}` } }),
        fetch(`${baseUrl}/coordinadores`, { headers: { Authorization: `Bearer ${publicAnonKey}` } }),
        fetch(`${baseUrl}/clientes`, { headers: { Authorization: `Bearer ${publicAnonKey}` } }),
      ]);
      const [camarerosData, pedidosData, coordinadoresData, clientesData] = await Promise.all([
        camarerosRes.json(), pedidosRes.json(), coordinadoresRes.json(), clientesRes.json(),
      ]);
      if (camarerosData.success) setCamareros(camarerosData.data);
      if (pedidosData.success) setPedidos(pedidosData.data);
      if (coordinadoresData.success) setCoordinadores(coordinadoresData.data);
      if (clientesData.success) setClientes(clientesData.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setErrorCarga('No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.');
    }
  }, [baseUrl, publicAnonKey, isAdmin, user?.coordinadorId]);

  const allTabs = [
    { id: 'dashboard',     label: 'Dashboard',    icon: LayoutDashboard, roles: ['admin', 'coordinador'] },
    { id: 'pedidos',       label: 'Pedidos',       icon: ShoppingCart,    roles: ['admin', 'coordinador'] },
    { id: 'camareros',     label: 'Personal',      icon: Users,           roles: ['admin', 'coordinador'] },
    { id: 'coordinadores', label: 'Coordinadores', icon: UserPlus,        roles: ['admin'] },
    { id: 'informes',      label: 'Informes',      icon: FileText,        roles: ['admin'] },
    { id: 'envio-mensaje', label: 'Envío Mensaje', icon: MessageSquare,   roles: ['admin', 'coordinador'] },
    { id: 'envio-parte',   label: 'Envío Parte',   icon: FileCheck,       roles: ['admin', 'coordinador'] },
    { id: 'chat-grupal',   label: 'Chat Grupal',   icon: MessagesSquare,  roles: ['admin', 'coordinador'] },
    { id: 'chatbot',       label: 'Chatbot WA',    icon: Bot,             roles: ['admin', 'coordinador'] },
    { id: 'configuracion', label: 'Configuración', icon: Settings,        roles: ['admin'] },
    { id: 'usuarios',      label: 'Usuarios',      icon: Shield,          roles: ['admin'] },
  ];

  const tabs = allTabs.filter(t => t.roles.includes(user?.role || ''));

  useEffect(() => {
    const visible = tabs.map(t => t.id);
    if (!visible.includes(activeTab)) setActiveTab('dashboard');
  }, [user?.role]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modal de cambio de contraseña obligatorio (login con password temporal) */}
      {requirePasswordChange && <CambiarPasswordModal />}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4 flex items-center justify-between">
          <h1 className="text-gray-900 font-semibold">Gestión de Camareros para Eventos</h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
              style={{ background: user?.role === 'admin' ? 'rgba(147,51,234,0.08)' : 'rgba(59,130,246,0.08)' }}>
              {user?.role === 'admin'
                ? <Shield className="w-3.5 h-3.5 text-purple-600" />
                : <User className="w-3.5 h-3.5 text-blue-600" />}
              <span style={{ color: user?.role === 'admin' ? '#7c3aed' : '#2563eb', fontWeight: 500 }}>
                {user?.nombre}
              </span>
              <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                {user?.role === 'admin' ? '· Admin' : '· Coordinador'}
              </span>
            </div>
            <button onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <LogOut className="w-4 h-4" />
              Salir
            </button>
          </div>
        </div>
      </div>

      {errorCarga && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3 flex items-center gap-3">
          <span className="text-red-600 text-sm font-medium">⚠️ {errorCarga}</span>
          <button onClick={cargarDatos} className="text-xs text-red-700 underline hover:no-underline">Reintentar</button>
        </div>
      )}

      <div className="bg-white border-b">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}>
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'dashboard' && <Dashboard camareros={camareros} pedidos={pedidos} setActiveTab={setActiveTab} baseUrl={baseUrl} publicAnonKey={publicAnonKey} />}
        {activeTab === 'pedidos' && <Pedidos pedidos={pedidos} setPedidos={setPedidos} camareros={camareros} coordinadores={coordinadores} clientes={clientes} setClientes={setClientes} baseUrl={baseUrl} publicAnonKey={publicAnonKey} cargarDatos={cargarDatos} coordinadorIdPropio={user?.coordinadorId} />}
        {activeTab === 'camareros' && <Camareros camareros={camareros} setCamareros={setCamareros} pedidos={pedidos} coordinadores={coordinadores} baseUrl={baseUrl} publicAnonKey={publicAnonKey} cargarDatos={cargarDatos} />}
        {activeTab === 'coordinadores' && isAdmin && <Coordinadores coordinadores={coordinadores} setCoordinadores={setCoordinadores} baseUrl={baseUrl} publicAnonKey={publicAnonKey} cargarDatos={cargarDatos} />}
        {activeTab === 'informes' && isAdmin && <Informes camareros={camareros} pedidos={pedidos} baseUrl={baseUrl} publicAnonKey={publicAnonKey} />}
        {activeTab === 'envio-mensaje' && <EnvioMensaje pedidos={pedidos} camareros={camareros} coordinadores={coordinadores} baseUrl={baseUrl} publicAnonKey={publicAnonKey} setPedidos={setPedidos} cargarDatos={cargarDatos} />}
        {activeTab === 'envio-parte' && <EnvioParte pedidos={pedidos} camareros={camareros} coordinadores={coordinadores} clientes={clientes} baseUrl={baseUrl} publicAnonKey={publicAnonKey} cargarDatos={cargarDatos} />}
        {activeTab === 'chat-grupal' && <ChatGrupal pedidos={pedidos} camareros={camareros} coordinadores={coordinadores} baseUrl={baseUrl} publicAnonKey={publicAnonKey} cargarDatos={cargarDatos} />}
        {activeTab === 'chatbot' && <ChatbotPanel baseUrl={baseUrl} publicAnonKey={publicAnonKey} />}
        {activeTab === 'configuracion' && isAdmin && <Configuracion baseUrl={baseUrl} publicAnonKey={publicAnonKey} camareros={camareros} coordinadores={coordinadores} pedidos={pedidos} clientes={clientes} />}
        {activeTab === 'usuarios' && isAdmin && <GestionUsuarios coordinadores={coordinadores} baseUrl={baseUrl} publicAnonKey={publicAnonKey} />}
      </div>
    </div>
  );
}

function AppRouter() {
  const { user, loading } = useAuth();
  const [systemStatus, setSystemStatus] = useState<'loading' | 'needs-setup' | 'ready'>('loading');
  const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-25b11ac0`;

  useEffect(() => { checkSystemStatus(); }, []);

  const checkSystemStatus = async () => {
    try {
      const res = await fetch(`${baseUrl}/auth/status`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });
      const data = await res.json();
      setSystemStatus(data.needsSetup ? 'needs-setup' : 'ready');
    } catch {
      setSystemStatus('ready');
    }
  };

  if (loading || systemStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f172a' }}>
        <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Cargando...</div>
      </div>
    );
  }

  if (systemStatus === 'needs-setup') {
    return <SetupWizard onSetupComplete={() => setSystemStatus('ready')} />;
  }

  if (!user) return <LoginScreen />;

  return <AppShell />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
