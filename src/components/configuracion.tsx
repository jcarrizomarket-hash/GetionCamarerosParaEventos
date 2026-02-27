import { logger } from '../utils/logger';
import { useState } from 'react';
import { Settings, MessageSquare, TestTube, Mail, TestTube2, Trash2, Bot, Database } from 'lucide-react';
import { WhatsAppConfig } from './whatsapp-config';
import { TestPanel } from './test-panel';
import { TestEmail } from './test-email';
import { WhatsAppTest } from './whatsapp-test';
import { WhatsAppChatbotConfig } from './whatsapp-chatbot-config';

interface ConfiguracionProps {
    baseUrl: string;
    publicAnonKey: string;
    camareros?: any[];
    coordinadores?: any[];
    pedidos?: any[];
    clientes?: any[];
}

export function Configuracion({ baseUrl, publicAnonKey, camareros = [], coordinadores = [], pedidos = [], clientes = [] }: ConfiguracionProps) {
    const [activeSubTab, setActiveSubTab] = useState<'whatsapp' | 'chatbot' | 'whatsapp-test' | 'test-panel' | 'test-email' | 'utilidades'>('whatsapp');
    const subTabs = [
        { id: 'whatsapp' as const, label: 'WhatsApp', icon: MessageSquare },
        { id: 'chatbot' as const, label: '🤖 Chatbot', icon: Bot },
        { id: 'whatsapp-test' as const, label: '🧪 Test de WhatsApp', icon: TestTube2 },
        { id: 'test-panel' as const, label: 'Panel de Pruebas', icon: TestTube },
        { id: 'test-email' as const, label: 'Prueba de Email', icon: Mail },
        { id: 'utilidades' as const, label: 'Utilidades', icon: Settings }
    ];

    const eliminarPedidoPorNumero = async (numeroPedido: string) => {
        try {
            const pedido = pedidos.find(p => p.numero === numeroPedido);
            if (!pedido) {
                alert(`❌ No se encontró el pedido ${numeroPedido}`);
                return;
            }
            if (!window.confirm(`¿Estás seguro de eliminar el pedido ${numeroPedido}?

Cliente: ${pedido.cliente}
Lugar: ${pedido.lugar}
Fecha: ${pedido.diaEvento}`)) {
                return;
            }
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
                alert(`✅ Pedido ${numeroPedido} eliminado correctamente`);
                window.location.reload();
            } else {
                logger.error('❌ Error al eliminar:', result);
                alert(`❌ Error al eliminar el pedido: ${result.error || 'Error desconocido'}`);
            }
        } catch (error) {
            logger.error('Error al eliminar pedido:', error);
            alert(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    };

    const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<string[]>([]);
    const [limpiandoDatos, setLimpiandoDatos] = useState(false);
    const [estadoLimpieza, setEstadoLimpieza] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [resultadoLimpieza, setResultadoLimpieza] = useState<{ eliminados: Record<string, number>; fechaHora?: string } | null>(null);
    const [errorLimpieza, setErrorLimpieza] = useState<string | null>(null);

    const toggleCategoria = (categoria: string) => {
        setCategoriasSeleccionadas(prev => prev.includes(categoria) ? prev.filter(c => c !== categoria) : [...prev, categoria]);
    };

    const limpiarDatos = async () => {
        if (categoriasSeleccionadas.length === 0) {
            alert('⚠️ Selecciona al menos una categoría para limpiar');
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
        if (!window.confirm(`⚠️ ADVERTENCIA: Esta acción es IRREVERSIBLE\n\nSe eliminarán los siguientes datos:\n\n• ${categoriasTexto}\n\n¿Estás ABSOLUTAMENTE SEGURO de que deseas continuar?`)) {
            return;
        }
        if (!window.confirm('⚠️ ÚLTIMA CONFIRMACIÓN\n\nEsta es tu última oportunidad para cancelar.\n\n¿Proceder con la eliminación?')) {
            return;
        }
        setLimpiandoDatos(true);
        setEstadoLimpieza('loading');
        setResultadoLimpieza(null);
        setErrorLimpieza(null);
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
                setResultadoLimpieza({ eliminados: result.eliminados, fechaHora: new Date().toLocaleString('es-AR') });
                setEstadoLimpieza('success');
                setCategoriasSeleccionadas([]);
            } else {
                console.error('❌ Error en la limpieza:', result);
                setErrorLimpieza(result.error || 'Error desconocido');
                setEstadoLimpieza('error');
            }
        } catch (error: any) {
            console.error('Error en limpieza de datos:', error);
            setErrorLimpieza(error.message);
            setEstadoLimpieza('error');
        } finally {
            setLimpiandoDatos(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Settings className="w-8 h-8 text-blue-600" />
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Configuración del Sistema</h2>
                    <p className="text-gray-600">Configura y prueba las integraciones de WhatsApp y Email</p>
                </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border">
                <div className="border-b">
                    <div className="flex">
                        {subTabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button key={tab.id} onClick={() => setActiveSubTab(tab.id)} className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
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
                    {activeSubTab === 'test-panel' && (
                        <TestPanel />
                    )}
                    {activeSubTab === 'test-email' && (
                        <TestEmail baseUrl={baseUrl} publicAnonKey={publicAnonKey} />
                    )}
                    {activeSubTab === 'utilidades' && (
                        <div className="space-y-6">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                                <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center gap-2">
                                    <Trash2 className="w-5 h-5" /> Eliminar Pedido Específico
                                </h3>
                                <p className="text-sm text-red-700 mb-4"> Esta herramienta permite eliminar pedidos que no se pueden eliminar desde la interfaz normal.</p>
                                <div className="bg-white rounded-lg p-4 border border-red-200">
                                    <h4 className="font-semibold text-gray-900 mb-3">Pedidos Actuales:</h4>
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {pedidos.map(pedido => (
                                            <div key={pedido.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                                                <div className="flex-1">
                                                    <span className="font-mono font-bold text-blue-600">{pedido.numero}</span>
                                                    <span className="text-gray-600 ml-3">{pedido.cliente}</span>
                                                    <span className="text-gray-500 ml-3 text-sm">{pedido.lugar}</span>
                                                    <span className="text-gray-400 ml-3 text-sm">{pedido.diaEvento}</span>
                                                </div>
                                                <button onClick={() => eliminarPedidoPorNumero(pedido.numero)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm font-medium">
                                                    <Trash2 className="w-4 h-4" /> Eliminar
                                                </button>
                                            </div>
                                        ))}
                                        {pedidos.length === 0 && (
                                            <p className="text-gray-500 text-center py-4">No hay pedidos en el sistema</p>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                    <p className="text-sm text-amber-800 font-medium">⚠️ Precaución:</p>
                                    <p className="text-sm text-amber-700 mt-1"> La eliminación es permanente y no se puede deshacer. Asegúrate de seleccionar el pedido correcto.</p>
                                </div>
                            </div>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                                <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center gap-2">
                                    <Trash2 className="w-5 h-5" /> Limpieza Masiva de Datos
                                </h3>
                                <p className="text-sm text-red-700 mb-4"> Esta herramienta permite eliminar datos de manera masiva del sistema.</p>
                                <div className="bg-white rounded-lg p-4 border border-red-200">
                                    <h4 className="font-semibold text-gray-900 mb-3">Categorías Disponibles:</h4>
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                                            <div className="flex-1">
                                                <span className="font-mono font-bold text-blue-600">Pedidos</span>
                                                <span className="text-gray-600 ml-3">Todos los Pedidos (entrada, asignación, gestión)</span>
                                            </div>
                                            <button onClick={() => toggleCategoria('pedidos')} className={`px-4 py-2 ${categoriasSeleccionadas.includes('pedidos') ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'} rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm font-medium`}> <Trash2 className="w-4 h-4" /> {categoriasSeleccionadas.includes('pedidos') ? 'Seleccionado' : 'Seleccionar'} </button>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                                            <div className="flex-1">
                                                <span className="font-mono font-bold text-blue-600">Chats</span>
                                                <span className="text-gray-600 ml-3">Chats Grupales de Eventos</span>
                                            </div>
                                            <button onClick={() => toggleCategoria('chats')} className={`px-4 py-2 ${categoriasSeleccionadas.includes('chats') ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'} rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm font-medium`}> <Trash2 className="w-4 h-4" /> {categoriasSeleccionadas.includes('chats') ? 'Seleccionado' : 'Seleccionar'} </button>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                                            <div className="flex-1">
                                                <span className="font-mono font-bold text-blue-600">Mensajes</span>
                                                <span className="text-gray-600 ml-3">Mensajes de Chats</span>
                                            </div>
                                            <button onClick={() => toggleCategoria('mensajes')} className={`px-4 py-2 ${categoriasSeleccionadas.includes('mensajes') ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'} rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm font-medium`}> <Trash2 className="w-4 h-4" /> {categoriasSeleccionadas.includes('mensajes') ? 'Seleccionado' : 'Seleccionar'} </button>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                                            <div className="flex-1">
                                                <span className="font-mono font-bold text-blue-600">Conversaciones</span>
                                                <span className="text-gray-600 ml-3">Conversaciones del Chatbot</span>
                                            </div>
                                            <button onClick={() => toggleCategoria('conversaciones')} className={`px-4 py-2 ${categoriasSeleccionadas.includes('conversaciones') ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'} rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm font-medium`}> <Trash2 className="w-4 h-4" /> {categoriasSeleccionadas.includes('conversaciones') ? 'Seleccionado' : 'Seleccionar'} </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                    <p className="text-sm text-amber-800 font-medium">⚠️ Precaución:</p>
                                    <p className="text-sm text-amber-700 mt-1"> La eliminación es permanente y no se puede deshacer. Asegúrate de seleccionar las categorías correctas.</p>
                                </div>
                                <div className="mt-4">
                                    <button onClick={limpiarDatos} className={`px-4 py-2 ${limpiandoDatos ? 'bg-gray-500 text-gray-300' : 'bg-red-600 text-white'} rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm font-medium`} disabled={limpiandoDatos}>
                                        <Trash2 className="w-4 h-4" /> {limpiandoDatos ? 'Limpiando...' : 'Limpiar Datos'}
                                    </button>
                                </div>
                                {/* Panel de estado de limpieza */}
                                {estadoLimpieza !== 'idle' && (
                                    <div className={`mt-4 p-4 rounded-lg border ${estadoLimpieza === 'loading' ? 'bg-blue-50 border-blue-200' : estadoLimpieza === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                        <div className="mb-2">
                                            {estadoLimpieza === 'loading' && <span className="text-blue-700 font-semibold">🧹 Limpieza en progreso...</span>}
                                            {estadoLimpieza === 'success' && <span className="text-green-700 font-semibold">✅ Limpieza completada exitosamente</span>}
                                            {estadoLimpieza === 'error' && <span className="text-red-700 font-semibold">❌ Error en la limpieza</span>}
                                        </div>
                                        {estadoLimpieza === 'loading' && (
                                            <p className="text-sm text-blue-600">Eliminando datos seleccionados, por favor espera...</p>
                                        )}
                                        {estadoLimpieza === 'success' && resultadoLimpieza && (
                                            <div>
                                                {resultadoLimpieza.fechaHora && (
                                                    <p className="text-xs text-green-600 mb-2">Completado el: {resultadoLimpieza.fechaHora}</p>
                                                )}
                                                <p className="text-sm text-green-700 font-medium mb-1">Registros eliminados:</p>
                                                <ul className="text-sm text-green-700 space-y-1">
                                                    {Object.entries(resultadoLimpieza.eliminados).map(([key, value]) => (
                                                        <li key={key} className="flex items-center gap-2">
                                                            <Database className="w-3 h-3" />
                                                            <span className="capitalize font-medium">{key}:</span>
                                                            <span>{value} registro{value !== 1 ? 's' : ''}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {estadoLimpieza === 'error' && errorLimpieza && (
                                            <p className="text-sm text-red-700">{errorLimpieza}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}