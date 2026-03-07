import { useMemo, useState } from 'react';
import ExcelJS from 'exceljs';
import {
  Shield,
  Users,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Pencil,
  Trash2,
  Download,
  RefreshCw,
  SlidersHorizontal,
  QrCode,
  UserCheck,
} from 'lucide-react';
import {
  createCoordinador,
  updateCoordinador,
  deleteCoordinador,
} from '../api/client';

type AdminTab = 'coordinadores' | 'altas' | 'registros-qr';

export interface Alta {
  id: string;
  fecha: string;
  dia: string;
  cliente: string;
  evento: string;
  codigoPerfil?: string;
  nombrePerfil: string;
  estado: 'confirmado' | 'pendiente' | 'cancelado';
  altaActiva: boolean;
  bajaActiva: boolean;
  pedidoId: string;
  camareroId: string;
}

export interface RegistroQR {
  id: string;
  fecha: string;
  cliente: string;
  camarero: string;
  entradaPrevista: string;
  entradaReal?: string;
  salidaPrevista?: string;
  salidaReal?: string;
  horas?: string;
  estado: 'pendiente' | 'en-servicio' | 'completado';
  pedidoId: string;
  camareroId: string;
}

interface AdminProps {
  coordinadores: any[];
  setCoordinadores: (coordinadores: any[]) => void;
  baseUrl: string;
  publicAnonKey: string;
  cargarDatos: () => Promise<void>;
  camareros: any[];
  pedidos: any[];
}

function safeString(v: any): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  try { return JSON.stringify(v); } catch { return String(v); }
}

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
function fechaToDia(fecha: string): string {
  if (!fecha) return '';
  const d = new Date(fecha + 'T00:00:00');
  return DIAS[d.getDay()] ?? '';
}

async function downloadWorkbook(workbook: ExcelJS.Workbook, fileName: string) {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = fileName;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

function downloadCSV(rows: string[][], fileName: string) {
  const csv = rows.map(r => r.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = fileName;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

function deriveAltas(pedidos: any[], _camareros: any[]): Alta[] {
  const altas: Alta[] = [];
  for (const p of pedidos ?? []) {
    for (const asig of p?.asignaciones ?? []) {
      if (asig.estado === 'confirmado') {
        altas.push({
          id: `${p.id}-${asig.camareroId}`,
          fecha: p.diaEvento ?? '',
          dia: fechaToDia(p.diaEvento ?? ''),
          cliente: p.cliente ?? '',
          evento: p.lugar ?? '',
          codigoPerfil: asig.camareroNumero ? String(asig.camareroNumero) : '',
          nombrePerfil: asig.camareroNombre ?? '',
          estado: 'confirmado',
          altaActiva: false,
          bajaActiva: false,
          pedidoId: p.id,
          camareroId: asig.camareroId,
        });
      }
    }
  }
  return altas;
}

function deriveRegistrosQR(pedidos: any[]): RegistroQR[] {
  const registros: RegistroQR[] = [];
  for (const p of pedidos ?? []) {
    for (const asig of p?.asignaciones ?? []) {
      registros.push({
        id: `qr-${p.id}-${asig.camareroId}`,
        fecha: p.diaEvento ?? '',
        cliente: p.cliente ?? '',
        camarero: asig.camareroNombre ?? '',
        entradaPrevista: p.horaEntrada ?? '',
        entradaReal: asig.entradaReal,
        salidaPrevista: p.horaSalida,
        salidaReal: asig.salidaReal,
        horas: asig.horasReales,
        estado: asig.entradaReal && asig.salidaReal ? 'completado' : asig.entradaReal ? 'en-servicio' : 'pendiente',
        pedidoId: p.id,
        camareroId: asig.camareroId,
      });
    }
  }
  return registros;
}

function StatCard({ title, value, icon: Icon, hint }: { title: string; value: string | number; icon: any; hint?: string; }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">{title}</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">{value}</div>
          {hint && <div className="mt-1 text-xs text-gray-500">{hint}</div>}
        </div>
        <div className="rounded-lg bg-gray-100 p-2"><Icon className="h-5 w-5 text-gray-700" /></div>
      </div>
    </div>
  );
}

function EstadoBadge({ estado }: { estado: string }) {
  const base = 'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium';
  if (estado === 'confirmado') return <span className={`${base} bg-green-50 text-green-700`}><CheckCircle className="h-3 w-3" />Confirmado</span>;
  if (estado === 'pendiente') return <span className={`${base} bg-amber-50 text-amber-700`}><Clock className="h-3 w-3" />Pendiente</span>;
  if (estado === 'cancelado') return <span className={`${base} bg-red-50 text-red-700`}><XCircle className="h-3 w-3" />Cancelado</span>;
  if (estado === 'en-servicio') return <span className={`${base} bg-blue-50 text-blue-700`}><UserCheck className="h-3 w-3" />En servicio</span>;
  if (estado === 'completado') return <span className={`${base} bg-green-50 text-green-700`}><CheckCircle className="h-3 w-3" />Completado</span>;
  return <span className={`${base} bg-gray-100 text-gray-600`}>{safeString(estado)}</span>;
}

function TabCoordinadores({ coordinadores, onRefresh }: { coordinadores: any[]; onRefresh: () => Promise<void>; }) {
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<any | null>(null);
  const [form, setForm] = useState({ nombre: '', telefono: '', email: '', activo: true });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const openNew = () => { setEditando(null); setForm({ nombre: '', telefono: '', email: '', activo: true }); setShowForm(true); };
  const openEdit = (c: any) => { setEditando(c); setForm({ nombre: c.nombre ?? '', telefono: c.telefono ?? '', email: c.email ?? '', activo: c.activo ?? true }); setShowForm(true); };

  const handleSave = async () => {
    if (!form.nombre.trim()) return;
    setSaving(true);
    try {
      if (editando) { await updateCoordinador(editando.id, form); } else { await createCoordinador(form); }
      await onRefresh();
      setShowForm(false);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este coordinador?')) return;
    setDeletingId(id);
    try { await deleteCoordinador(id); await onRefresh(); } finally { setDeletingId(null); }
  };

  return (
    <div>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Gestión de Coordinadores</h2>
          <p className="text-sm text-gray-500">Administra los coordinadores del sistema</p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700">
          <Plus className="h-4 w-4" />Nuevo Coordinador
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-base font-semibold text-gray-900">{editando ? 'Editar Coordinador' : 'Nuevo Coordinador'}</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Nombre *</label>
                <input className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Nombre completo" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Teléfono</label>
                <input className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} placeholder="+34 600 000 000" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Email</label>
                <input type="email" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="coordinador@empresa.com" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="activo" checked={form.activo} onChange={e => setForm(f => ({ ...f, activo: e.target.checked }))} className="h-4 w-4 rounded border-gray-300 text-indigo-600" />
                <label htmlFor="activo" className="text-sm text-gray-700">Activo</label>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
              <button onClick={handleSave} disabled={saving || !form.nombre.trim()} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">{saving ? 'Guardando…' : 'Guardar'}</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {coordinadores.map((c, idx) => (
          <div key={c.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3 mb-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-xs font-bold text-indigo-700">#{idx + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-gray-900 truncate">{c.nombre}</div>
                {c.telefono && <div className="mt-0.5 text-sm text-gray-500">📱 {c.telefono}</div>}
                {c.email && <div className="text-sm text-gray-500 break-all">📧 {c.email}</div>}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(c)} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-white hover:bg-amber-600"><Pencil className="h-4 w-4" />Editar</button>
              <button onClick={() => handleDelete(c.id)} disabled={deletingId === c.id} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-60"><Trash2 className="h-4 w-4" />{deletingId === c.id ? '…' : 'Eliminar'}</button>
            </div>
          </div>
        ))}
        {coordinadores.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-12 text-center text-sm text-gray-500">No hay coordinadores. Haz click en "Nuevo Coordinador" para agregar uno.</div>
        )}
      </div>
    </div>
  );
}

function TabAltas({ altas }: { altas: Alta[] }) {
  const [estadosAlta, setEstadosAlta] = useState<Record<string, boolean>>({});
  const [estadosBaja, setEstadosBaja] = useState<Record<string, boolean>>({});
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroCamarero, setFiltroCamarero] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const filtradas = altas.filter(a =>
    (!filtroCliente || a.cliente.toLowerCase().includes(filtroCliente.toLowerCase())) &&
    (!filtroFecha || a.fecha === filtroFecha) &&
    (!filtroCamarero || a.nombrePerfil.toLowerCase().includes(filtroCamarero.toLowerCase()))
  );

  const toggleAlta = (id: string) => { setEstadosAlta(prev => ({ ...prev, [id]: !prev[id] })); };
  const toggleBaja = (id: string) => { setEstadosBaja(prev => ({ ...prev, [id]: !prev[id] })); };

  const exportarCSV = () => {
    const headers = ['Fecha', 'Día', 'Cliente', 'Evento', 'Cód. Perfil', 'Nombre Perfil', 'Estado', 'Alta', 'Baja'];
    const rows = filtradas.map(a => [a.fecha, a.dia, a.cliente, a.evento, a.codigoPerfil ?? '', a.nombrePerfil, a.estado, estadosAlta[a.id] ? 'Sí' : 'No', estadosBaja[a.id] ? 'Sí' : 'No']);
    downloadCSV([headers, ...rows], `altas-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const exportarExcel = async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Altas');
    ws.columns = [
      { header: 'Fecha', key: 'fecha', width: 12 }, { header: 'Día', key: 'dia', width: 12 },
      { header: 'Cliente', key: 'cliente', width: 24 }, { header: 'Evento', key: 'evento', width: 28 },
      { header: 'Cód. Perfil', key: 'codigo', width: 12 }, { header: 'Nombre Perfil', key: 'nombre', width: 24 },
      { header: 'Estado', key: 'estado', width: 14 }, { header: 'Alta', key: 'alta', width: 8 }, { header: 'Baja', key: 'baja', width: 8 },
    ];
    ws.getRow(1).font = { bold: true };
    for (const a of filtradas) {
      ws.addRow({ fecha: a.fecha, dia: a.dia, cliente: a.cliente, evento: a.evento, codigo: a.codigoPerfil, nombre: a.nombrePerfil, estado: a.estado, alta: estadosAlta[a.id] ? 'Sí' : 'No', baja: estadosBaja[a.id] ? 'Sí' : 'No' });
    }
    await downloadWorkbook(wb, `altas-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Lista de Altas de Personal</h2>
          <p className="text-sm text-gray-500">Total de registros: {filtradas.length}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setMostrarFiltros(f => !f)} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"><SlidersHorizontal className="h-4 w-4" />Mostrar Filtros</button>
          <button onClick={exportarCSV} className="inline-flex items-center gap-2 rounded-lg border border-emerald-600 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"><Download className="h-4 w-4" />CSV</button>
          <button onClick={exportarExcel} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"><Download className="h-4 w-4" />Exportar Excel</button>
        </div>
      </div>

      {mostrarFiltros && (
        <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Fecha</label>
              <input type="date" className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none" value={filtroFecha} onChange={e => setFiltroFecha(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Cliente</label>
              <input className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none" placeholder="Filtrar por cliente…" value={filtroCliente} onChange={e => setFiltroCliente(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Camarero</label>
              <input className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none" placeholder="Filtrar por camarero…" value={filtroCamarero} onChange={e => setFiltroCamarero(e.target.value)} />
            </div>
            {(filtroFecha || filtroCliente || filtroCamarero) && (
              <div className="flex items-end">
                <button onClick={() => { setFiltroFecha(''); setFiltroCliente(''); setFiltroCamarero(''); }} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100">Limpiar filtros</button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Fecha</th><th className="px-4 py-3">Día</th>
              <th className="px-4 py-3">Cliente</th><th className="px-4 py-3">Evento</th>
              <th className="px-4 py-3">Cód. Perfil</th><th className="px-4 py-3">Nombre Perfil</th>
              <th className="px-4 py-3">Estado</th><th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtradas.map(a => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-700">{a.fecha}</td>
                <td className="px-4 py-3 text-gray-700">{a.dia}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{a.cliente}</td>
                <td className="px-4 py-3 text-gray-700">{a.evento}</td>
                <td className="px-4 py-3">{a.codigoPerfil && <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-xs font-bold text-indigo-700">{a.codigoPerfil}</span>}</td>
                <td className="px-4 py-3 text-gray-900">{a.nombrePerfil}</td>
                <td className="px-4 py-3"><EstadoBadge estado={a.estado} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => toggleAlta(a.id)} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${estadosAlta[a.id] ? 'bg-green-400 text-white hover:bg-green-500' : 'bg-green-600 text-white hover:bg-green-700'}`}>
                      <UserCheck className="h-3.5 w-3.5" />Alta
                    </button>
                    <button onClick={() => toggleBaja(a.id)} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${estadosBaja[a.id] ? 'bg-red-400 text-white hover:bg-red-500' : 'bg-red-600 text-white hover:bg-red-700'}`}>
                      <XCircle className="h-3.5 w-3.5" />Baja
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtradas.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-500">No hay altas confirmadas todavía.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TabRegistrosQR({ registros, onRefresh }: { registros: RegistroQR[]; onRefresh: () => Promise<void>; }) {
  const [refreshing, setRefreshing] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtroCamarero, setFiltroCamarero] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroCliente, setFiltroCliente] = useState('');

  const filtrados = registros.filter(r =>
    (!filtroCamarero || r.camarero.toLowerCase().includes(filtroCamarero.toLowerCase())) &&
    (!filtroFecha || r.fecha === filtroFecha) &&
    (!filtroCliente || r.cliente.toLowerCase().includes(filtroCliente.toLowerCase()))
  );

  const handleRefresh = async () => { setRefreshing(true); try { await onRefresh(); } finally { setRefreshing(false); } };

  const exportarCSV = () => {
    const headers = ['Fecha', 'Cliente', 'Camarero', 'Entrada Prevista', 'Entrada Real', 'Salida Prevista', 'Salida Real', 'Horas', 'Estado'];
    const rows = filtrados.map(r => [r.fecha, r.cliente, r.camarero, r.entradaPrevista, r.entradaReal ?? '', r.salidaPrevista ?? '', r.salidaReal ?? '', r.horas ?? '', r.estado]);
    downloadCSV([headers, ...rows], `registros-qr-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const exportarExcel = async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Registros QR');
    ws.columns = [
      { header: 'Fecha', key: 'fecha', width: 12 }, { header: 'Cliente', key: 'cliente', width: 24 },
      { header: 'Camarero', key: 'camarero', width: 22 }, { header: 'Entrada Prevista', key: 'ep', width: 16 },
      { header: 'Entrada Real', key: 'er', width: 16 }, { header: 'Salida Prevista', key: 'sp', width: 16 },
      { header: 'Salida Real', key: 'sr', width: 16 }, { header: 'Horas', key: 'horas', width: 10 }, { header: 'Estado', key: 'estado', width: 14 },
    ];
    ws.getRow(1).font = { bold: true };
    for (const r of filtrados) {
      ws.addRow({ fecha: r.fecha, cliente: r.cliente, camarero: r.camarero, ep: r.entradaPrevista, er: r.entradaReal ?? '—', sp: r.salidaPrevista ?? '—', sr: r.salidaReal ?? '—', horas: r.horas ?? '—', estado: r.estado });
    }
    await downloadWorkbook(wb, `registros-qr-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Registros de Entrada/Salida QR</h2>
          <p className="text-sm text-gray-500">Historial completo de registros de entrada y salida del personal</p>
          <p className="text-xs text-gray-400 mt-0.5">Total de registros: {filtrados.length}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setMostrarFiltros(f => !f)} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"><SlidersHorizontal className="h-4 w-4" />Mostrar Filtros</button>
          <button onClick={handleRefresh} disabled={refreshing} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"><RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />Actualizar</button>
          <button onClick={exportarCSV} className="inline-flex items-center gap-2 rounded-lg border border-emerald-600 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"><Download className="h-4 w-4" />CSV</button>
          <button onClick={exportarCSV} className="inline-flex items-center gap-2 rounded-lg border border-emerald-600 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"><Download className="h-4 w-4" />CSV</button>
          <button onClick={exportarExcel} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"><Download className="h-4 w-4" />Exportar Excel</button>
        </div>
      </div>

      {mostrarFiltros && (
        <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Fecha</label>
              <input type="date" className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none" value={filtroFecha} onChange={e => setFiltroFecha(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Cliente</label>
              <input className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none" placeholder="Filtrar por cliente…" value={filtroCliente} onChange={e => setFiltroCliente(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Camarero</label>
              <input className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none" placeholder="Filtrar por camarero…" value={filtroCamarero} onChange={e => setFiltroCamarero(e.target.value)} />
            </div>
            {(filtroFecha || filtroCliente || filtroCamarero) && (
              <div className="flex items-end">
                <button onClick={() => { setFiltroFecha(''); setFiltroCliente(''); setFiltroCamarero(''); }} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100">Limpiar filtros</button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Fecha</th><th className="px-4 py-3">Cliente</th><th className="px-4 py-3">Camarero</th>
              <th className="px-4 py-3">Entrada Prevista</th><th className="px-4 py-3">Entrada Real</th>
              <th className="px-4 py-3">Salida Prevista</th><th className="px-4 py-3">Salida Real</th>
              <th className="px-4 py-3">Horas</th><th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtrados.map(r => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-700">{r.fecha}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{r.cliente}</td>
                <td className="px-4 py-3 text-gray-900">{r.camarero}</td>
                <td className="px-4 py-3 text-gray-700">{r.entradaPrevista}</td>
                <td className="px-4 py-3">{r.entradaReal ? <span className="font-medium text-green-700">{r.entradaReal}</span> : <span className="text-gray-400">—</span>}</td>
                <td className="px-4 py-3 text-gray-700">{r.salidaPrevista ?? '—'}</td>
                <td className="px-4 py-3">{r.salidaReal ? <span className="font-medium text-green-700">{r.salidaReal}</span> : <span className="text-gray-400">—</span>}</td>
                <td className="px-4 py-3">{r.horas ? <span className="font-medium text-gray-900">{r.horas}</span> : <span className="text-gray-400">—</span>}</td>
                <td className="px-4 py-3"><EstadoBadge estado={r.estado} /></td>
              </tr>
            ))}
            {filtrados.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-10 text-center text-sm text-gray-500">No hay registros QR todavía.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Admin({ coordinadores, setCoordinadores: _setCoordinadores, cargarDatos, camareros, pedidos }: AdminProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('coordinadores');

  const altas = useMemo(() => deriveAltas(pedidos, camareros), [pedidos, camareros]);
  const registrosQR = useMemo(() => deriveRegistrosQR(pedidos), [pedidos]);

  const stats = useMemo(() => ({
    totalCamareros: camareros?.length ?? 0,
    totalPedidos: pedidos?.length ?? 0,
    totalCoordinadores: coordinadores?.length ?? 0,
    pedidosPendientes: (pedidos ?? []).filter((p: any) => (p?.asignaciones ?? []).some((a: any) => a.estado === 'pendiente')).length,
    pedidosConfirmados: (pedidos ?? []).filter((p: any) => (p?.asignaciones ?? []).every((a: any) => a.estado === 'confirmado')).length,
    camarerosDisponibles: (camareros ?? []).filter((c: any) => c?.activo).length,
  }), [camareros, pedidos, coordinadores]);

  const tabs: Array<{ key: AdminTab; label: string; icon: any }> = [
    { key: 'coordinadores', label: 'Coordinadores', icon: Users },
    { key: 'altas', label: 'Altas', icon: UserCheck },
    { key: 'registros-qr', label: 'Registros QR', icon: QrCode },
  ];

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Panel de Administración</h1>
        <p className="text-sm text-gray-500">Gestión de coordinadores y altas de personal</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatCard title="Camareros" value={stats.totalCamareros} icon={Users} />
        <StatCard title="Pedidos" value={stats.totalPedidos} icon={FileText} />
        <StatCard title="Coordinadores" value={stats.totalCoordinadores} icon={Shield} />
        <StatCard title="Pedidos pendientes" value={stats.pedidosPendientes} icon={Clock} hint="Pendientes de confirmación" />
        <StatCard title="Pedidos confirmados" value={stats.pedidosConfirmados} icon={CheckCircle} hint="Confirmados por el equipo" />
        <StatCard title="Camareros disponibles" value={stats.camarerosDisponibles} icon={Users} hint="Disponibles para asignación" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex border-b border-gray-200">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-7 py-4 text-base font-semibold transition-colors ${activeTab === key ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
              <Icon className="h-4 w-4" />{label}
            </button>
          ))}
        </div>
        <div className="p-5">
          {activeTab === 'coordinadores' && <TabCoordinadores coordinadores={coordinadores} onRefresh={cargarDatos} />}
          {activeTab === 'altas' && <TabAltas altas={altas} />}
          {activeTab === 'registros-qr' && <TabRegistrosQR registros={registrosQR} onRefresh={cargarDatos} />}
        </div>
      </div>
    </div>
  );
}
