import { useState, useEffect, useRef } from 'react';
import { Toaster } from 'sonner';
import { Users, FileText, LayoutDashboard, ShoppingCart, Settings, Send, Shield, AlertCircle, RefreshCw, FlaskConical, Menu, X, ChevronDown, Building2, Briefcase, UserCheck, QrCode, MessageSquare, Wrench, CalendarDays, LogOut, UserCog } from 'lucide-react';

const IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true';
import { Dashboard } from './components/dashboard';
import { Pedidos } from './components/pedidos';
import { Camareros } from './components/camareros';
import { Admin } from './components/admin';
import { Informes } from './components/informes';
import { Envios } from './components/envios';
import { Configuracion } from './components/configuracion';
import { LoginPage } from './components/LoginPage';
import { MisPedidosCamarero } from './components/MisPedidosCamarero';
import { MisPedidosCliente } from './components/MisPedidosCliente';
import { GestionUsuarios } from './components/GestionUsuarios';
import { ErrorBoundary } from './components/error-boundary';
import { supabaseFunctionEndpoint as baseUrl, supabaseAnonKey as publicAnonKey } from './config/env';
import { getCamareros, getPedidos, getCoordinadores, getClientes } from './api/client';
import type { Camarero, Pedido, Coordinador, Cliente } from './types';
import { logger } from './utils/logger';
import { playNotificationSound, loadNotifConfig } from './hooks/useNotificationSounds';
import { useAuth } from './hooks/useAuth';
import type { UserRole } from './hooks/useAuth';

// Aplicación de Gestión de Camareros para Eventos v2.2
// Última actualización: Panel de Admin con gestión de Altas
export default function App() {
  const { user, loading: authLoading, login, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedMenuTab, setExpandedMenuTab] = useState<string | null>(null);
  const [pedidosSubTab, setPedidosSubTab] = useState('clientes');

  const tabSubItems: Record<string, Array<{ id: string; label: string; icon: any }>> = {
    pedidos: [
      { id: 'clientes', label: 'Clientes', icon: Building2 },
      { id: 'entrada-pedidos', label: 'Entrada de Pedidos', icon: Briefcase },
      { id: 'gestion-pedidos', label: 'Gestión de Pedidos', icon: CalendarDays },
    ],
    admin: [
      { id: 'coordinadores', label: 'Coordinadores', icon: Users },
      { id: 'altas', label: 'Altas', icon: UserCheck },
      { id: 'registros-qr', label: 'Registros QR', icon: QrCode },
    ],
    configuracion: [
      { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
      { id: 'utilidades', label: 'Utilidades', icon: Wrench },
    ],
  };
  const [camareros, setCamareros] = useState<Camarero[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [coordinadores, setCoordinadores] = useState<Coordinador[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  // ── Alerta sonora 24h antes del evento con perfiles sin confirmar ─────────
  const alertas24hDisparadas = useRef<Set<string>>(new Set());

  useEffect(() => {
    function checkAlertas() {
      const cfg = loadNotifConfig();
      const notif = cfg.find(n => n.id === 'alerta_24h');
      if (!notif?.habilitada) return;

      const ahora = Date.now();
      const en24h = ahora + 24 * 60 * 60 * 1000;

      for (const pedido of pedidos) {
        const fechaEvento = new Date(pedido.diaEvento).getTime();
        // Ventana: entre ahora y 24h desde ahora
        if (fechaEvento <= ahora || fechaEvento > en24h) continue;

        // ¿Tiene perfiles sin confirmar?
        const asignaciones = pedido.asignaciones || [];
        const totalRequeridos =
          (parseInt(String(pedido.cantidadCamareros ?? 0))) +
          (parseInt(String(pedido.cantidadCamareros2 ?? 0)));
        const confirmados = asignaciones.filter((a: any) => a.estado === 'confirmado').length;
        if (totalRequeridos > 0 && confirmados >= totalRequeridos) continue;

        // Disparar solo una vez por pedido por sesión
        if (alertas24hDisparadas.current.has(pedido.id)) continue;
        alertas24hDisparadas.current.add(pedido.id);
        playNotificationSound('alerta_24h', notif.volumen);
        logger.info(`[Alerta 24h] Pedido ${pedido.numero} sin perfiles completos`);
      }
    }

    // Chequeo inmediato y luego cada 30 minutos
    checkAlertas();
    const interval = setInterval(checkAlertas, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [pedidos]);
  // ──────────────────────────────────────────────────────────────────────────

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

  // Tabs según rol
  const ALL_TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'coordinador'] as UserRole[] },
    { id: 'pedidos', label: 'Pedidos', icon: ShoppingCart, roles: ['admin', 'coordinador'] as UserRole[] },
    { id: 'camareros', label: 'Personal', icon: Users, roles: ['admin', 'coordinador'] as UserRole[] },
    { id: 'admin', label: 'Admin', icon: Shield, roles: ['admin', 'coordinador'] as UserRole[] },
    { id: 'informes', label: 'Informes', icon: FileText, roles: ['admin', 'coordinador'] as UserRole[] },
    { id: 'envios', label: 'Envíos', icon: Send, roles: ['admin', 'coordinador'] as UserRole[] },
    { id: 'configuracion', label: 'Configuración', icon: Settings, roles: ['admin'] as UserRole[] },
    { id: 'usuarios', label: 'Usuarios', icon: UserCog, roles: ['admin'] as UserRole[] },
    { id: 'mis-servicios', label: 'Mis Servicios', icon: CalendarDays, roles: ['camarero'] as UserRole[] },
    { id: 'mis-pedidos', label: 'Mis Pedidos', icon: CalendarDays, roles: ['cliente'] as UserRole[] },
  ];

  const tabs = ALL_TABS.filter(t => !user || t.roles.includes(user.role));

  if (authLoading || cargando) {
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
            <p className="text-sm text-gray-600">Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  // Sin sesión → Login
  if (!IS_DEMO && !user) {
    return <LoginPage onLogin={login} />;
  }

  // Camarero → solo sus servicios
  if (!IS_DEMO && user?.role === 'camarero') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Toaster richColors position="top-right" />
        <div className="bg-white shadow-sm border-b px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">Eukos Gestión</h1>
              <p className="text-xs text-gray-500">Personal · {user.nombre}</p>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg border border-gray-200 transition-colors">
            <LogOut className="w-4 h-4" /> Salir
          </button>
        </div>
        <MisPedidosCamarero pedidos={pedidos} user={user} />
      </div>
    );
  }

  // Cliente → solo sus pedidos
  if (!IS_DEMO && user?.role === 'cliente') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Toaster richColors position="top-right" />
        <div className="bg-white shadow-sm border-b px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">Eukos Gestión</h1>
              <p className="text-xs text-gray-500">Cliente · {user.nombre}</p>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg border border-gray-200 transition-colors">
            <LogOut className="w-4 h-4" /> Salir
          </button>
        </div>
        <MisPedidosCliente pedidos={pedidos} user={user} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster richColors position="top-right" />
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="sm:hidden flex items-center justify-center w-9 h-9 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Menú"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">Gestión de Camareros para Eventos</h1>
              <p className="text-xs text-gray-500">Sistema de gestión · v2.2</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {IS_DEMO && (
              <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-700 border border-amber-300 rounded-full text-xs font-semibold">
                <FlaskConical className="w-3.5 h-3.5" />
                MODO DEMO — los datos no se guardan
              </span>
            )}
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
            {!IS_DEMO && user && (
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-gray-200"
                title={`Sesión: ${user.nombre} (${user.role})`}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Desktop tabs */}
      <div className="hidden sm:block bg-white border-b shadow-sm">
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

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <>
          {/* Overlay */}
          <div className="sm:hidden fixed inset-0 z-40 bg-black/20" onClick={() => setMenuOpen(false)} />
          {/* Panel */}
          <div className="sm:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-white shadow-2xl flex flex-col relative overflow-visible">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <span className="text-base font-bold text-gray-900">Menú</span>
              <button onClick={() => setMenuOpen(false)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                const subItems = tabSubItems[tab.id];
                const expanded = expandedMenuTab === tab.id;
                return (
                  <div key={tab.id}>
                    <button
                      onClick={() => {
                        if (subItems) {
                          setExpandedMenuTab(expanded ? null : tab.id);
                        } else {
                          setActiveTab(tab.id);
                          setMenuOpen(false);
                        }
                      }}
                      className={`w-full flex items-center gap-4 px-5 py-4 text-base font-medium transition-colors border-l-4 ${
                        active
                          ? 'border-blue-500 bg-blue-50 text-blue-600'
                          : 'border-transparent text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-6 h-6 shrink-0" />
                      <span className="flex-1 text-left">{tab.label}</span>
                      {subItems && (
                        <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                      )}
                    </button>
                    {subItems && expanded && (
                      <div className="absolute left-72 top-0 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-60 py-1">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100 mb-1">{tab.label}</div>
                        {subItems.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => { setActiveTab(tab.id); if (tab.id === 'pedidos') setPedidosSubTab(sub.id); setMenuOpen(false); setExpandedMenuTab(null); }}
                            className="w-full flex items-center gap-3 px-4 py-3.5 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          >
                            <sub.icon className="w-5 h-5 shrink-0" />
                            {sub.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

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
              initialSubTab={pedidosSubTab}
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

          {activeTab === 'usuarios' && (
            <GestionUsuarios
              camareros={camareros}
              clientes={clientes}
              baseUrl={baseUrl}
              publicAnonKey={publicAnonKey}
            />
          )}

          {/* Remove whatsapp-test tab content as it's now inside Configuracion */}
        </ErrorBoundary>
      </div>
    </div>
  );
}