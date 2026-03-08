import { logger } from '../utils/logger';
import { useState } from 'react';
import { Settings, MessageSquare, TestTube, Mail, TestTube2, Trash2, Bot, Database } from 'lucide-react';
import { WhatsAppConfig } from './whatsapp-config';
import { TestPanel } from './test-panel';
import { TestEmail } from './test-email';
import { WhatsAppTest } from './whatsapp-test';
import { WhatsAppChatbotConfig } from './whatsapp-chatbot-config';
import { useToast } from '../hooks/useToast';
import { ConfirmDialog } from './ui/confirm-dialog';
import { UtilidadesPanel } from './UtilidadesPanel';

interface ConfiguracionProps {
    baseUrl: string;
    publicAnonKey: string;
    camareros?: any[];
    coordinadores?: any[];
    pedidos?: any[];
    clientes?: any[];
    cargarDatos?: () => Promise<void>;
}

export function Configuracion({ baseUrl, publicAnonKey, camareros = [], coordinadores = [], pedidos = [], clientes = [], cargarDatos }: ConfiguracionProps) {
    const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';
    const [activeSubTab, setActiveSubTab] = useState<string>('whatsapp');
    const toast = useToast();

    // Confirm dialog state
    const [confirmState, setConfirmState] = useState<{
        open: boolean;
        message: string;
        onConfirm: () => void;
    }>({ open: false, message: '', onConfirm: () => {} });

    const showConfirm = (message: string): Promise<boolean> =>
    Promise.resolve(window.confirm(message));

    const handleConfirmCancel = () => {
        setConfirmState(s => ({ ...s, open: false }));
    };

    const subTabs = [
        { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
        { id: 'chatbot', label: '🤖 Chatbot', icon: Bot },
        { id: 'whatsapp-test', label: '🧪 Test de WhatsApp', icon: TestTube2 },
        ...(!isDemoMode ? [
            { id: 'test-panel', label: 'Panel de Pruebas', icon: TestTube },
            { id: 'test-email', label: 'Prueba de Email', icon: Mail },
        ] : []),
        { id: 'utilidades', label: 'Utilidades', icon: Settings }
    ];

    const eliminarPedidoPorNumero = async (numeroPedido: string) => {
        try {
            const pedido = pedidos.find(p => p.numero === numeroPedido);
            if (!pedido) {
                toast.error(`No se encontró el pedido ${numeroPedido}`);
                return;
            }
            const confirmed = await showConfirm(`¿Estás seguro de eliminar el pedido ${numeroPedido}?\n\nCliente: ${pedido.cliente}\nLugar: ${pedido.lugar}\nFecha: ${pedido.diaEvento}`);
            if (!confirmed) return;
            logger.info(`🗑️ Eliminando pedido ${numeroPedido} con ID: ${pedido.id}`);
            const response = await fetch(`${baseUrl}/pedidos/${pedido.id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${publicAnonKey}`,
                    'Content-Type': 'application/json'
                }
            });
            const result = await response.json();
            logger.info('📝 Respuesta del servidor:', result);
            if (response.ok && result.success) {
                toast.success(`Pedido ${numeroPedido} eliminado correctamente`);
                if (cargarDatos) await cargarDatos();
            } else {
                logger.error('❌ Error al eliminar:', result);
                toast.error(`Error al eliminar el pedido: ${result.error || 'Error desconocido'}`);
            }
        } catch (error) {
            logger.error('Error al eliminar pedido:', error);
            toast.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    };

    const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<string[]>([]);
    const [limpiandoDatos, setLimpiandoDatos] = useState(false);

    const toggleCategoria = (categoria: string) => {
        setCategoriasSeleccionadas(prev => prev.includes(categoria) ? prev.filter(c => c !== categoria) : [...prev, categoria]);
    };

    const limpiarDatos = async () => {
        if (categoriasSeleccionadas.length === 0) {
            toast.warning('Selecciona al menos una categoría para limpiar');
            return;
        }
        const categoriasTexto = categoriasSeleccionadas.map(c => {
            switch(c) {
                case 'pedidos': return 'Todos los Pedidos (entrada, asignación, gestión)';
                case 'chats': return 'Chats Grupales de Eventos';
                case 'mensajes': return 'Mensajes de Chats';
                case 'conversaciones': return 'Conversaciones del Chatbot';
                default: return c;
            }
        }).join('\n• ');
        const confirmed1 = await showConfirm(`⚠️ ADVERTENCIA: Esta acción es IRREVERSIBLE\n\nSe eliminarán los siguientes datos:\n\n• ${categoriasTexto}\n\n¿Estás ABSOLUTAMENTE SEGURO de que deseas continuar?`);
        if (!confirmed1) return;
        const confirmed2 = await showConfirm('⚠️ ÚLTIMA CONFIRMACIÓN\n\nEsta es tu última oportunidad para cancelar.\n\n¿Proceder con la eliminación?');
        if (!confirmed2) return;
        setLimpiandoDatos(true);
        try {
            console.log('🧹 Iniciando limpieza de datos:', categoriasSeleccionadas);
            const response = await fetch(`${baseUrl}/limpiar-datos`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${publicAnonKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ categorias: categoriasSeleccionadas })
            });
            const result = await response.json();
            if (response.ok && result.success) {
                const mensaje = Object.entries(result.eliminados)
                    .map(([key, value]) => `${key}: ${value} registros`)
                    .join(', ');
                toast.success(`Limpieza completada. Datos eliminados: ${mensaje}`);
                setCategoriasSeleccionadas([]);
                if (cargarDatos) await cargarDatos();
            } else {
                console.error('❌ Error en la limpieza:', result);
                toast.error(`Error al limpiar datos: ${result.error || 'Error desconocido'}`);
            }
        } catch (error: any) {
            console.error('Error en limpieza de datos:', error);
            toast.error(`Error: ${error.message}`);
        } finally {
            setLimpiandoDatos(false);
        }
    };

    return (
        <>
        <div className="space-y-6">
            <div className="flex items-center gap-3 min-w-0">
                <Settings className="w-8 h-8 text-blue-600 shrink-0" />
                <div className="min-w-0">
                    <h2 className="text-xl font-bold text-gray-900 truncate sm:text-2xl">Configuración del Sistema</h2>
                    <p className="text-sm text-gray-600 sm:text-base">Configura y prueba las integraciones de WhatsApp y Email</p>
                </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="border-b">
                    <div className="flex overflow-x-auto scrollbar-hide">
                        {subTabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button key={tab.id} onClick={() => setActiveSubTab(tab.id)} className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-colors whitespace-nowrap text-sm ${
                                    activeSubTab === tab.id ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}>
                                    <Icon className="w-5 h-5" /> {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div className="p-6">
                    {activeSubTab === 'whatsapp' && (
                        <WhatsAppConfig baseUrl={baseUrl} publicAnonKey={publicAnonKey} />
                    )}
                    {activeSubTab === 'chatbot' && (
                        <WhatsAppChatbotConfig baseUrl={baseUrl} publicAnonKey={publicAnonKey} />
                    )}
                    {activeSubTab === 'whatsapp-test' && (
                        <WhatsAppTest baseUrl={baseUrl} publicAnonKey={publicAnonKey} camareros={camareros} coordinadores={coordinadores} pedidos={pedidos} />
                    )}
                    {activeSubTab === 'test-panel' && !isDemoMode && (
                        <TestPanel />
                    )}
                    {activeSubTab === 'test-email' && !isDemoMode && (
                        <TestEmail baseUrl={baseUrl} publicAnonKey={publicAnonKey} />
                    )}
                    {activeSubTab === 'utilidades' && (
                        <UtilidadesPanel
                            pedidos={pedidos}
                            eliminarPedidoPorNumero={eliminarPedidoPorNumero}
                            categoriasSeleccionadas={categoriasSeleccionadas}
                            toggleCategoria={toggleCategoria}
                            limpiarDatos={limpiarDatos}
                            limpiandoDatos={limpiandoDatos}
                        />
                    )}
                </div>
            </div>
        </div>
        <ConfirmDialog
            open={confirmState.open}
            message={confirmState.message}
            onConfirm={confirmState.onConfirm}
            onCancel={handleConfirmCancel}
        />
        </>
    );
}