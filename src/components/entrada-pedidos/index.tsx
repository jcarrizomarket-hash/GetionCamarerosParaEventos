import { logger } from '../../utils/logger';
import { supabase } from '../../hooks/useAuth';
import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import type { EntradaPedidosProps, FormData, Pedido } from './types';
import { PedidoEntryDetail } from './PedidoEntryDetail';
import { PedidoEntryForm } from './PedidoEntryForm';
import { PedidoEntryList } from './PedidoEntryList';
import { deduplicarPorId } from '../../utils/deduplicar';
import { useToast } from '../../hooks/useToast';
import { ConfirmDialog } from '../ui/confirm-dialog';
import { playNotificationSound as playSound, loadNotifConfig } from '../../hooks/useNotificationSounds';
import { useConfirm } from '../../hooks/useConfirm';

export function EntradaPedidos({
  clientes,
  setClientes,
  pedidos,
  setPedidos,
  camareros = [],
  coordinadores = [],
  baseUrl,
  publicAnonKey,
  cargarDatos,
}: EntradaPedidosProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reportPeriod, setReportPeriod] = useState('mensual');
  const toast = useToast();

  // Confirm dialog state
  const { confirm } = useConfirm();
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    message: string;
    onConfirm: () => void;
  }>({ open: false, message: '', onConfirm: () => {} });

  const showConfirm = (message: string): Promise<boolean> =>
    confirm(message);

  const handleConfirmCancel = () => {
    setConfirmState(s => ({ ...s, open: false }));
  };

  const initialFormState: FormData = {
    numero: '',
    cliente: '',
    lugar: '',
    ubicacion: '',
    diaEvento: '',
    cantidadCamareros: 1,
    horaEntrada: '',
    horaSalida: '',
    totalHoras: '',
    cantidadCamareros2: 0,
    horaEntrada2: '',
    horaSalida2: '',
    totalHoras2: '',
    catering: 'no',
    camisa: 'negra',
    notas: '',
    coordinadorId: '',
    coordinadorNombre: '',
  };

  const [formData, setFormData] = useState<FormData>(initialFormState);

  const uniqueClientes = useMemo(() => {
    return deduplicarPorId(clientes);
  }, [clientes]);

  const uniquePedidos = useMemo(() => {
    return deduplicarPorId(pedidos);
  }, [pedidos]);

  // --- Lógica del Calendario ---
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
    return { days, firstDay: adjustedFirstDay };
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    setCurrentDate(newDate);
  };

  const monthData = getDaysInMonth(currentDate);

  const pedidosMes = uniquePedidos.filter((p) => {
    const fecha = new Date(p.diaEvento);
    return (
      fecha.getMonth() === currentDate.getMonth() &&
      fecha.getFullYear() === currentDate.getFullYear()
    );
  });

  const isPedidoCompleto = (pedido: Pedido) => {
    if (!pedido.asignaciones || pedido.asignaciones.length === 0) return false;
    const totalRequeridos =
      parseInt(String(pedido.cantidadCamareros || 0)) +
      parseInt(String(pedido.cantidadCamareros2 || 0));
    const totalConfirmados = pedido.asignaciones.filter((a) => a.estado === 'confirmado').length;
    return totalConfirmados >= totalRequeridos;
  };

  // --- Lógica de Informes ---
  const reportMetrics = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    let filteredPedidos: Pedido[] = [];

    if (reportPeriod === 'diario') {
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      filteredPedidos = uniquePedidos.filter((p) => p.diaEvento === todayStr);
    } else if (reportPeriod === 'semanal') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(now);
      monday.setDate(diff);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      filteredPedidos = uniquePedidos.filter((p) => {
        const d = new Date(p.diaEvento);
        d.setHours(0, 0, 0, 0);
        return d >= monday && d <= sunday;
      });
    } else {
      filteredPedidos = pedidosMes;
    }

    const cantidadPedidos = filteredPedidos.length;
    let cantidadCamareros = 0;
    let camarerosConfirmados = 0;
    let camarerosFaltantes = 0;

    filteredPedidos.forEach((p) => {
      const req =
        parseInt(String(p.cantidadCamareros || 0)) +
        parseInt(String(p.cantidadCamareros2 || 0));
      const asigs = p.asignaciones || [];
      const conf = asigs.filter((a) => a.estado === 'confirmado').length;
      const assignedCount = asigs.length;

      cantidadCamareros += req;
      camarerosConfirmados += conf;
      camarerosFaltantes += Math.max(0, req - assignedCount);
    });

    const camarerosApercibidos = camareros.filter((c) => c.estado === 'apercibido').length;
    const camarerosDisponibles = camareros.length - camarerosApercibidos;

    return {
      cantidadPedidos,
      cantidadCamareros,
      camarerosDisponibles,
      camarerosConfirmados,
      camarerosFaltantes,
      camarerosApercibidos,
    };
  }, [reportPeriod, uniquePedidos, pedidosMes, camareros]);

  // --- Lógica del Formulario ---
  const generarNumeroPedido = () => {
    if (uniquePedidos.length === 0) return 'PED001';
    const numeros = uniquePedidos.map((p) => {
      const match = p.numero?.match(/PED(\d+)/);
      return match ? parseInt(match[1]) : 0;
    });
    const max = Math.max(0, ...numeros);
    return `PED${String(max + 1).padStart(3, '0')}`;
  };

  const calcularHoras = (entrada: string, salida: string) => {
    if (!entrada || !salida) return '';
    const [h1, m1] = entrada.split(':').map(Number);
    const [h2, m2] = salida.split(':').map(Number);
    let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (diff < 0) diff += 24 * 60;
    const horas = Math.floor(diff / 60);
    const minutos = diff % 60;
    return `${horas}h ${minutos > 0 ? minutos + 'm' : ''}`;
  };

  const handleTimeChange = (field: string, value: string, type: number) => {
    const newFormData = { ...formData, [field]: value };
    if (type === 1) {
      if (field === 'horaEntrada' && newFormData.horaSalida) {
        newFormData.totalHoras = calcularHoras(value, newFormData.horaSalida);
      } else if (field === 'horaSalida' && newFormData.horaEntrada) {
        newFormData.totalHoras = calcularHoras(newFormData.horaEntrada, value);
      }
    } else {
      if (field === 'horaEntrada2' && newFormData.horaSalida2) {
        newFormData.totalHoras2 = calcularHoras(value, newFormData.horaSalida2);
      } else if (field === 'horaSalida2' && newFormData.horaEntrada2) {
        newFormData.totalHoras2 = calcularHoras(newFormData.horaEntrada2, value);
      }
    }
    setFormData(newFormData);
  };

  const handleEdit = (pedido: Pedido) => {
    console.log('📝 Editando pedido:', pedido.id, pedido.numero);
    console.log('📋 Datos completos del pedido:', pedido);
    setShowForm(false);
    setTimeout(() => {
      setEditingId(pedido.id);
      setFormData({
        numero: pedido.numero || '',
        cliente: pedido.cliente,
        lugar: pedido.lugar,
        ubicacion: pedido.ubicacion || '',
        diaEvento: pedido.diaEvento,
        cantidadCamareros: pedido.cantidadCamareros,
        horaEntrada: pedido.horaEntrada,
        horaSalida: pedido.horaSalida,
        totalHoras: pedido.totalHoras,
        cantidadCamareros2: pedido.cantidadCamareros2 || 0,
        horaEntrada2: pedido.horaEntrada2 || '',
        horaSalida2: pedido.horaSalida2 || '',
        totalHoras2: pedido.totalHoras2 || '',
        catering: pedido.catering,
        camisa: pedido.camisa,
        notas: pedido.notas || '',
        coordinadorId: pedido.coordinadorId || '',
        coordinadorNombre: pedido.coordinadorNombre || '',
      });
      console.log('✅ Estado editingId configurado a:', pedido.id);
      setShowForm(true);
    }, 50);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm('¿Estás seguro de eliminar este pedido?');
    if (!confirmed) return;
    try {
      logger.info(`🗑️ Eliminando pedido con ID: ${id}`);
      const response = await fetch(`${baseUrl}/pedidos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || publicAnonKey}` },
      });
      const result = await response.json();
      logger.info('📝 Respuesta del servidor:', { status: response.status, result });
      if (response.ok && result.success) {
        logger.info('✅ Pedido eliminado, recargando datos...');
        await cargarDatos();
        toast.success('Pedido eliminado correctamente');
      } else {
        logger.error('❌ Error del servidor:', result);
        toast.error(`Error: ${result.error || 'No se pudo eliminar el pedido'}`);
      }
    } catch (error) {
      logger.error('❌ Error al eliminar:', error);
      toast.error(`Error: ${(error as Error).message}`);
    }
  };

  // --- Lógica de Alertas y Sonido ---
  const playNotificationSound = () => {
    const cfg = loadNotifConfig();
    const notif = cfg.find(n => n.id === 'pedido_nuevo');
    if (notif?.habilitada) playSound('pedido_nuevo', notif.volumen);
  };

  const enviarConfirmacionCliente = (pedido: Pedido) => {
    const clienteData = clientes.find((c) => c.nombre === pedido.cliente);
    const contacto = clienteData?.telefono || clienteData?.email || '';

    const mensaje = `*Confirmación de Pedido - ${pedido.numero}*
    
📅 *Día:* ${new Date(pedido.diaEvento).toLocaleDateString('es-ES')}
⏰ *Horario:* ${pedido.horaEntrada} - ${pedido.horaSalida}
📍 *Lugar:* ${pedido.lugar}
👥 *Camareros:* ${pedido.cantidadCamareros + (pedido.cantidadCamareros2 || 0)}
📝 *Notas:* ${pedido.notas || 'Sin notas adicionales'}

_Por favor confirme recepción de este mensaje._`;

    if (!contacto) {
      toast.warning('El cliente no tiene teléfono ni email registrado.');
      return;
    }

    const isEmail = contacto.includes('@');
    if (isEmail) {
      const subject = `Confirmación de Evento - ${pedido.numero}`;
      const body = mensaje.replace(/\*/g, '');
      window.open(
        `mailto:${contacto}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
        '_blank'
      );
    } else {
      let phone = contacto.replace(/\D/g, '');
      if (!phone.startsWith('34') && phone.length === 9) phone = '34' + phone;
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(mensaje)}`;
      window.open(url, '_blank');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${baseUrl}/pedidos/${editingId}` : `${baseUrl}/pedidos`;
      const dataToSend = {
        ...formData,
        numero: editingId ? formData.numero : generarNumeroPedido(),
      };
      if (editingId) {
        const pedidoOriginal = uniquePedidos.find((p) => p.id === editingId);
        if (pedidoOriginal) {
          (dataToSend as Pedido & { asignaciones?: unknown }).asignaciones = pedidoOriginal.asignaciones;
        }
      }
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || publicAnonKey}`,
        },
        body: JSON.stringify(dataToSend),
      });
      if (response.ok) {
        await cargarDatos();
        if (!editingId) {
          playNotificationSound();
        }
        setShowForm(false);
        setEditingId(null);
        setFormData(initialFormState);
      }
    } catch (error) {
      logger.error('Error al guardar:', error);
    }
  };

  return (
    <div className="space-y-8">
      <PedidoEntryDetail
        reportPeriod={reportPeriod}
        setReportPeriod={setReportPeriod}
        reportMetrics={reportMetrics}
        currentDate={currentDate}
        changeMonth={changeMonth}
        monthData={monthData}
        pedidosMes={pedidosMes}
        isPedidoCompleto={isPedidoCompleto}
        handleEdit={handleEdit}
      />

      {/* --- BOTÓN NUEVO PEDIDO --- */}
      <div className="flex justify-center">
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ ...initialFormState, numero: generarNumeroPedido() });
            setShowForm(true);
          }}
          className="px-6 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transform hover:scale-105 transition-all flex items-center gap-2 font-medium"
        >
          <Plus className="w-5 h-5" />
          Nuevo Pedido
        </button>
      </div>

      <PedidoEntryForm
        showForm={showForm}
        setShowForm={setShowForm}
        editingId={editingId}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        handleTimeChange={handleTimeChange}
        uniqueClientes={uniqueClientes}
        coordinadores={coordinadores}
      />

      <PedidoEntryList
        uniquePedidos={uniquePedidos}
        isPedidoCompleto={isPedidoCompleto}
        enviarConfirmacionCliente={enviarConfirmacionCliente}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
      />
      <ConfirmDialog
        open={confirmState.open}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onCancel={handleConfirmCancel}
      />
    </div>
  );
}
