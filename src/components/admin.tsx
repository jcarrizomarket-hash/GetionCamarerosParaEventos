import { useMemo, useState } from 'react';
import ExcelJS from 'exceljs';
import {
  Shield,
  Users,
  RefreshCw,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';

interface AdminProps {
  coordinadores: any[];
  setCoordinadores: (coordinadores: any[]) => void;
  baseUrl: string;
  publicAnonKey: string;
  cargarDatos: () => Promise<void>;
  camareros: any[];
  pedidos: any[];
}

type SectionKey = 'overview' | 'pedidos' | 'camareros' | 'coordinadores';

function safeString(v: any) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

function toISODateLike(v: any) {
  if (!v) return '';
  // si viene como string ya “date-like”
  if (typeof v === 'string') return v;
  // Date
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    return v.toISOString().slice(0, 10);
  }
  // timestamp
  if (typeof v === 'number') {
    const d = new Date(v);
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  }
  return safeString(v);
}

async function downloadWorkbook(workbook: ExcelJS.Workbook, fileName: string) {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function Admin({
  coordinadores,
  setCoordinadores,
  baseUrl,
  publicAnonKey,
  cargarDatos,
  camareros,
  pedidos,
}: AdminProps) {
  const [activeSection, setActiveSection] = useState<SectionKey>('overview');
  const [loading, setLoading] = useState(false);

  const stats = useMemo(() => {
    const totalCamareros = camareros?.length ?? 0;
    const totalPedidos = pedidos?.length ?? 0;
    const totalCoordinadores = coordinadores?.length ?? 0;

    const pedidosPendientes = (pedidos ?? []).filter((p: any) => p?.estado === 'pendiente')
      .length;
    const pedidosConfirmados = (pedidos ?? []).filter((p: any) => p?.estado === 'confirmado')
      .length;
    const camarerosDisponibles = (camareros ?? []).filter((c: any) => c?.estado === 'disponible')
      .length;

    return {
      totalCamareros,
      totalPedidos,
      totalCoordinadores,
      pedidosPendientes,
      pedidosConfirmados,
      camarerosDisponibles,
    };
  }, [camareros, pedidos, coordinadores]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await cargarDatos();
    } finally {
      setLoading(false);
    }
  };

  // ========= EXPORTACIONES EXCEL (exceljs) =========

  const exportPedidosToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Pedidos');

    // Ajusta estas columnas si tu modelo tiene otros campos.
    sheet.columns = [
      { header: 'ID', key: 'id', width: 14 },
      { header: 'Evento', key: 'evento', width: 28 },
      { header: 'Fecha', key: 'fecha', width: 14 },
      { header: 'Estado', key: 'estado', width: 14 },
      { header: 'Coordinador', key: 'coordinador', width: 22 },
      { header: 'Camareros', key: 'camareros', width: 10 },
      { header: 'Notas', key: 'notas', width: 30 },
    ];
    sheet.getRow(1).font = { bold: true };

    for (const p of pedidos ?? []) {
      const camarerosCount =
        Array.isArray(p?.camareros) ? p.camareros.length : p?.camareros_count ?? '';

      sheet.addRow({
        id: safeString(p?.id ?? p?.pedido_id ?? ''),
        evento: safeString(p?.evento ?? p?.nombre_evento ?? p?.titulo ?? ''),
        fecha: toISODateLike(p?.fecha ?? p?.fecha_evento ?? p?.created_at ?? ''),
        estado: safeString(p?.estado ?? ''),
        coordinador: safeString(p?.coordinador_nombre ?? p?.coordinador ?? p?.coordinador_id ?? ''),
        camareros: safeString(camarerosCount),
        notas: safeString(p?.notas ?? p?.comentarios ?? ''),
      });
    }

    await downloadWorkbook(
      workbook,
      `pedidos-${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  const exportCamarerosToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Camareros');

    sheet.columns = [
      { header: 'ID', key: 'id', width: 14 },
      { header: 'Nombre', key: 'nombre', width: 24 },
      { header: 'Teléfono', key: 'telefono', width: 18 },
      { header: 'Email', key: 'email', width: 26 },
      { header: 'Estado', key: 'estado', width: 14 },
      { header: 'Notas', key: 'notas', width: 30 },
    ];
    sheet.getRow(1).font = { bold: true };

    for (const c of camareros ?? []) {
      sheet.addRow({
        id: safeString(c?.id ?? ''),
        nombre: safeString(c?.nombre ?? c?.name ?? ''),
        telefono: safeString(c?.telefono ?? c?.phone ?? ''),
        email: safeString(c?.email ?? ''),
        estado: safeString(c?.estado ?? ''),
        notas: safeString(c?.notas ?? c?.comentarios ?? ''),
      });
    }

    await downloadWorkbook(
      workbook,
      `camareros-${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  const exportCoordinadoresToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Coordinadores');

    sheet.columns = [
      { header: 'ID', key: 'id', width: 14 },
      { header: 'Nombre', key: 'nombre', width: 24 },
      { header: 'Teléfono', key: 'telefono', width: 18 },
      { header: 'Email', key: 'email', width: 26 },
      { header: 'Rol', key: 'rol', width: 16 },
      { header: 'Activo', key: 'activo', width: 10 },
    ];
    sheet.getRow(1).font = { bold: true };

    for (const u of coordinadores ?? []) {
      sheet.addRow({
        id: safeString(u?.id ?? ''),
        nombre: safeString(u?.nombre ?? u?.name ?? ''),
        telefono: safeString(u?.telefono ?? u?.phone ?? ''),
        email: safeString(u?.email ?? ''),
        rol: safeString(u?.rol ?? u?.role ?? 'coordinador'),
        activo: safeString(u?.activo ?? u?.is_active ?? ''),
      });
    }

    await downloadWorkbook(
      workbook,
      `coordinadores-${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  // ========= UI =========

  const sections: Array<{ key: SectionKey; label: string; icon: any }> = [
    { key: 'overview', label: 'Resumen', icon: Shield },
    { key: 'pedidos', label: 'Pedidos', icon: FileText },
    { key: 'camareros', label: 'Camareros', icon: Users },
    { key: 'coordinadores', label: 'Coordinadores', icon: Users },
  ];

  const StatCard = ({
    title,
    value,
    icon: Icon,
    hint,
  }: {
    title: string;
    value: string | number;
    icon: any;
    hint?: string;
  }) => (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">{title}</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">{value}</div>
          {hint ? <div className="mt-1 text-xs text-gray-500">{hint}</div> : null}
        </div>
        <div className="rounded-lg bg-gray-100 p-2">
          <Icon className="h-5 w-5 text-gray-700" />
        </div>
      </div>
    </div>
  );

  const Pill = ({ estado }: { estado: string }) => {
    const base = 'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium';
    if (estado === 'confirmado')
      return (
        <span className={`${base} bg-green-50 text-green-700`}>
          <CheckCircle className="h-3.5 w-3.5" />
          Confirmado
        </span>
      );
    if (estado === 'pendiente')
      return (
        <span className={`${base} bg-yellow-50 text-yellow-700`}>
          <Clock className="h-3.5 w-3.5" />
          Pendiente
        </span>
      );
    if (estado === 'cancelado')
      return (
        <span className={`${base} bg-red-50 text-red-700`}>
          <XCircle className="h-3.5 w-3.5" />
          Cancelado
        </span>
      );
    return <span className={`${base} bg-gray-100 text-gray-700`}>{safeString(estado)}</span>;
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Panel Admin</h1>
          <div className="mt-1 text-xs text-gray-500">
            Base URL: {baseUrl ? baseUrl : '—'} · Key: {publicAnonKey ? 'OK' : '—'}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Actualizando…' : 'Actualizar'}
          </button>

          <button
            onClick={exportPedidosToExcel}
            className="inline-flex items-center gap-2 rounded-lg bg-black px-3 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90"
          >
            <FileText className="h-4 w-4" />
            Exportar Pedidos
          </button>

          <button
            onClick={exportCamarerosToExcel}
            className="inline-flex items-center gap-2 rounded-lg bg-black px-3 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90"
          >
            <FileText className="h-4 w-4" />
            Exportar Camareros
          </button>

          <button
            onClick={exportCoordinadoresToExcel}
            className="inline-flex items-center gap-2 rounded-lg bg-black px-3 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90"
          >
            <FileText className="h-4 w-4" />
            Exportar Coordinadores
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="mb-6 flex flex-wrap gap-2">
        {sections.map(({ key, label, icon: Icon }) => {
          const active = activeSection === key;
          return (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              className={[
                'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium',
                active
                  ? 'bg-gray-900 text-white'
                  : 'border border-gray-200 bg-white text-gray-800 hover:bg-gray-50',
              ].join(' ')}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {activeSection === 'overview' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard title="Camareros" value={stats.totalCamareros} icon={Users} />
          <StatCard title="Pedidos" value={stats.totalPedidos} icon={FileText} />
          <StatCard title="Coordinadores" value={stats.totalCoordinadores} icon={Shield} />
          <StatCard
            title="Pedidos pendientes"
            value={stats.pedidosPendientes}
            icon={Clock}
            hint="Pendientes de confirmación"
          />
          <StatCard
            title="Pedidos confirmados"
            value={stats.pedidosConfirmados}
            icon={CheckCircle}
            hint="Confirmados por el equipo"
          />
          <StatCard
            title="Camareros disponibles"
            value={stats.camarerosDisponibles}
            icon={Users}
            hint="Disponibles para asignación"
          />
        </div>
      )}

      {activeSection === 'pedidos' && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 p-4">
            <div className="text-sm font-semibold text-gray-900">Pedidos</div>
            <div className="text-xs text-gray-500">Listado operativo</div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Evento</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Coordinador</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(pedidos ?? []).map((p: any) => (
                  <tr key={safeString(p?.id ?? p?.pedido_id ?? Math.random())}>
                    <td className="px-4 py-3 text-gray-700">{safeString(p?.id ?? p?.pedido_id)}</td>
                    <td className="px-4 py-3 text-gray-900">
                      {safeString(p?.evento ?? p?.nombre_evento ?? p?.titulo ?? '—')}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {toISODateLike(p?.fecha ?? p?.fecha_evento ?? p?.created_at ?? '')}
                    </td>
                    <td className="px-4 py-3">
                      <Pill estado={safeString(p?.estado ?? '')} />
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {safeString(p?.coordinador_nombre ?? p?.coordinador ?? p?.coordinador_id ?? '—')}
                    </td>
                  </tr>
                ))}

                {(pedidos ?? []).length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-center text-gray-500" colSpan={5}>
                      No hay pedidos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSection === 'camareros' && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 p-4">
            <div className="text-sm font-semibold text-gray-900">Camareros</div>
            <div className="text-xs text-gray-500">Equipo y disponibilidad</div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Teléfono</th>
                  <th className="px-4 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(camareros ?? []).map((c: any) => (
                  <tr key={safeString(c?.id ?? Math.random())}>
                    <td className="px-4 py-3 text-gray-700">{safeString(c?.id ?? '')}</td>
                    <td className="px-4 py-3 text-gray-900">{safeString(c?.nombre ?? c?.name ?? '—')}</td>
                    <td className="px-4 py-3 text-gray-700">{safeString(c?.telefono ?? c?.phone ?? '—')}</td>
                    <td className="px-4 py-3">
                      <Pill estado={safeString(c?.estado ?? '')} />
                    </td>
                  </tr>
                ))}

                {(camareros ?? []).length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-center text-gray-500" colSpan={4}>
                      No hay camareros
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSection === 'coordinadores' && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-gray-900">Coordinadores</div>
                <div className="text-xs text-gray-500">Usuarios con permisos</div>
              </div>

              <button
                onClick={() => setCoordinadores([])}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
              >
                <XCircle className="h-4 w-4" />
                Vaciar lista (demo)
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Rol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(coordinadores ?? []).map((u: any) => (
                  <tr key={safeString(u?.id ?? Math.random())}>
                    <td className="px-4 py-3 text-gray-700">{safeString(u?.id ?? '')}</td>
                    <td className="px-4 py-3 text-gray-900">{safeString(u?.nombre ?? u?.name ?? '—')}</td>
                    <td className="px-4 py-3 text-gray-700">{safeString(u?.email ?? '—')}</td>
                    <td className="px-4 py-3 text-gray-700">{safeString(u?.rol ?? u?.role ?? 'coordinador')}</td>
                  </tr>
                ))}

                {(coordinadores ?? []).length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-center text-gray-500" colSpan={4}>
                      No hay coordinadores
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
