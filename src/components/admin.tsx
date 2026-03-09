// src/components/admin.tsx
import { useMemo, useState } from 'react';
import ExcelJS from 'exceljs';
import { Shield, UserPlus, Download, Filter, X, Trash2, Edit2, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface AdminProps {
  coordinadores: any[];
  setCoordinadores: (coordinadores: any[]) => void;
  baseUrl: string;
  publicAnonKey: string;
  cargarDatos: () => Promise<void>;
  camareros: any[];
  pedidos: any[];
}

type AltaRow = {
  fechaISO: string; // YYYY-MM-DD (para filtrar)
  fechaFormateada: string;
  dia: string;
  cliente: string;
  evento: string;
  codigoPerfil: string;
  nombrePerfil: string;
  turno: string;
  estado: string;
};

const formatISODate = (d: any): string => {
  try {
    const date = d instanceof Date ? d : new Date(d);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

const formatESDate = (d: any): string => {
  try {
    const date = d instanceof Date ? d : new Date(d);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
  } catch {
    return '';
  }
};

const dayNameES = (d: any): string => {
  try {
    const date = d instanceof Date ? d : new Date(d);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(date);
  } catch {
    return '';
  }
};

export function Admin({
  coordinadores,
  setCoordinadores,
  baseUrl,
  publicAnonKey,
  cargarDatos,
  camareros,
  pedidos,
}: AdminProps) {
  const [activeSubTab, setActiveSubTab] = useState<'coordinadores' | 'altas' | 'overview'>('overview');
  const [loading, setLoading] = useState(false);

  // Filtros para "Altas"
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [clienteFiltro, setClienteFiltro] = useState('');

  // --- Datos "Altas" (derivados de pedidos, para que el panel sea consistente)
  // Si tu backend tiene otra estructura, esto igual compila y te sirve como base.
  const datosAltas: AltaRow[] = useMemo(() => {
    return (pedidos || []).map((p: any) => {
      const fechaRaw = p?.fecha || p?.fecha_evento || p?.created_at || p?.createdAt || p?.dia || p?.date;
      const iso = formatISODate(fechaRaw);
      const form = formatESDate(fechaRaw);
      const dia = dayNameES(fechaRaw);

      return {
        fechaISO: iso,
        fechaFormateada: form || iso || '',
        dia: dia ? dia.charAt(0).toUpperCase() + dia.slice(1) : '',
        cliente: String(p?.cliente ?? p?.nombreCliente ?? p?.empresa ?? '—'),
        evento: String(p?.evento ?? p?.nombreEvento ?? p?.descripcion ?? '—'),
        codigoPerfil: String(p?.codigoPerfil ?? p?.perfilCodigo ?? p?.perfil_id ?? '—'),
        nombrePerfil: String(p?.nombrePerfil ?? p?.perfilNombre ?? p?.perfil ?? '—'),
        turno: String(p?.turno ?? p?.franja ?? '—'),
        estado: String(p?.estado ?? 'pendiente'),
      };
    });
  }, [pedidos]);

  const datosAltasFiltrados = useMemo(() => {
    let resultado = [...datosAltas];

    if (fechaDesde) {
      resultado = resultado.filter((d) => d.fechaISO && d.fechaISO >= fechaDesde);
    }
    if (fechaHasta) {
      resultado = resultado.filter((d) => d.fechaISO && d.fechaISO <= fechaHasta);
    }
    if (clienteFiltro.trim()) {
      const q = clienteFiltro.trim().toLowerCase();
      resultado = resultado.filter((d) => (d.cliente || '').toLowerCase().includes(q));
    }

    return resultado;
  }, [datosAltas, fechaDesde, fechaHasta, clienteFiltro]);

  const stats = useMemo(() => {
    const totalCamareros = (camareros || []).length;
    const totalPedidos = (pedidos || []).length;
    const totalCoordinadores = (coordinadores || []).length;
    const pedidosPendientes = (pedidos || []).filter((p: any) => String(p?.estado || '').toLowerCase() === 'pendiente').length;
    const pedidosConfirmados = (pedidos || []).filter((p: any) => String(p?.estado || '').toLowerCase() === 'confirmado').length;

    return {
      totalCamareros,
      totalPedidos,
      totalCoordinadores,
      pedidosPendientes,
      pedidosConfirmados,
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

  const limpiarFiltros = () => {
    setFechaDesde('');
    setFechaHasta('');
    setClienteFiltro('');
  };

  // Exportar a Excel con filtros (ExcelJS)
  const exportarExcel = async () => {
    if (datosAltasFiltrados.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const datosExcel = datosAltasFiltrados.map((d) => ({
      Fecha: d.fechaFormateada,
      Día: d.dia,
      Cliente: d.cliente,
      Evento: d.evento,
      'Código Perfil': d.codigoPerfil,
      'Nombre Perfil': d.nombrePerfil,
      Turno: d.turno,
      Estado: d.estado === 'confirmado' ? 'Confirmado' : d.estado,
    }));

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Altas Personal');

    sheet.columns = [
      { header: 'Fecha', key: 'Fecha', width: 12 },
      { header: 'Día', key: 'Día', width: 12 },
      { header: 'Cliente', key: 'Cliente', width: 28 },
      { header: 'Evento', key: 'Evento', width: 24 },
      { header: 'Código Perfil', key: 'Código Perfil', width: 14 },
      { header: 'Nombre Perfil', key: 'Nombre Perfil', width: 32 },
      { header: 'Turno', key: 'Turno', width: 14 },
      { header: 'Estado', key: 'Estado', width: 14 },
    ];

    sheet.getRow(1).font = { bold: true };
    datosExcel.forEach((row: any) => sheet.addRow(row));

    sheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: sheet.columns.length },
    };

    sheet.views = [{ state: 'frozen', ySplit: 1 }];

    const fecha = new Date().toISOString().split('T')[0];
    const buffer = await workbook.xlsx.writeBuffer();

    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `altas_personal_${fecha}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // --- Coordinadores (CRUD simple en memoria)
  const crearCoordinador = () => {
    const nombre = prompt('Nombre del coordinador:');
    if (!nombre?.trim()) return;

    const telefono = prompt('Teléfono (opcional):') || '';
    const email = prompt('Email (opcional):') || '';

    const nuevo = {
      id: `coord_${Date.now()}`,
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      email: email.trim(),
      creado_en: new Date().toISOString(),
    };

    setCoordinadores([nuevo, ...(coordinadores || [])]);
  };

  const editarCoordinador = (c: any) => {
    const nombre = prompt('Nombre:', c?.nombre ?? '');
    if (!nombre?.trim()) return;

    const telefono = prompt('Teléfono:', c?.telefono ?? '') ?? '';
    const email = prompt('Email:', c?.email ?? '') ?? '';

    const actualizado = (coordinadores || []).map((x: any) =>
      x?.id === c?.id ? { ...x, nombre: nombre.trim(), telefono: telefono.trim(), email: email.trim() } : x
    );

    setCoordinadores(actualizado);
  };

  const borrarCoordinador = (c: any) => {
    const ok = confirm(`¿Eliminar coordinador "${c?.nombre ?? ''}"?`);
    if (!ok) return;

    const actualizado = (coordinadores || []).filter((x: any) => x?.id !== c?.id);
    setCoordinadores(actualizado);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-gray-900 text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Panel de Administración
          </h2>
          <p className="text-gray-600 mt-1">Gestión de coordinadores y exportación de altas</p>
          <p className="text-gray-400 text-xs mt-1">
            baseUrl: {baseUrl ? 'OK' : '—'} · anonKey: {publicAnonKey ? 'OK' : '—'}
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-60"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      <Tabs value={activeSubTab} onValueChange={(v: any) => setActiveSubTab(v)}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="coordinadores">Coordinadores</TabsTrigger>
          <TabsTrigger value="altas">Altas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard title="Camareros" value={stats.totalCamareros} />
            <StatCard title="Pedidos" value={stats.totalPedidos} />
            <StatCard title="Coordinadores" value={stats.totalCoordinadores} />
            <StatCard title="Pendientes" value={stats.pedidosPendientes} />
            <StatCard title="Confirmados" value={stats.pedidosConfirmados} />
            <StatCard title="Altas (filtrables)" value={datosAltas.length} />
          </div>
        </TabsContent>

        <TabsContent value="coordinadores">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900 font-semibold text-lg">Coordinadores</h3>
            <button
              onClick={crearCoordinador}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 bg-blue-600 text-white hover:bg-blue-700"
            >
              <UserPlus className="h-4 w-4" />
              Nuevo
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-gray-50 text-xs font-semibold text-gray-600">
              <div className="col-span-4">Nombre</div>
              <div className="col-span-3">Teléfono</div>
              <div className="col-span-3">Email</div>
              <div className="col-span-2 text-right">Acciones</div>
            </div>

            {(coordinadores || []).length === 0 ? (
              <div className="p-6 text-gray-500">No hay coordinadores cargados.</div>
            ) : (
              (coordinadores || []).map((c: any) => (
                <div key={c?.id} className="grid grid-cols-12 gap-2 px-4 py-3 border-t border-gray-100 items-center">
                  <div className="col-span-4 font-medium text-gray-900">{c?.nombre ?? '—'}</div>
                  <div className="col-span-3 text-gray-700">{c?.telefono ?? '—'}</div>
                  <div className="col-span-3 text-gray-700">{c?.email ?? '—'}</div>
                  <div className="col-span-2 flex justify-end gap-2">
                    <button
                      onClick={() => editarCoordinador(c)}
                      className="p-2 rounded-lg hover:bg-gray-100"
                      title="Editar"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => borrarCoordinador(c)}
                      className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="altas">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="text-gray-900 font-semibold text-lg">Altas</h3>
              <p className="text-gray-600 text-sm">Filtra y exporta a Excel (ExcelJS).</p>
            </div>

            <button
              onClick={exportarExcel}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 bg-green-600 text-white hover:bg-green-700"
            >
              <Download className="h-4 w-4" />
              Exportar Excel
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
            <div className="flex flex-col md:flex-row gap-3 md:items-end">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Cliente</label>
                <input
                  value={clienteFiltro}
                  onChange={(e) => setClienteFiltro(e.target.value)}
                  placeholder="Buscar por cliente…"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Desde</label>
                <input
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Hasta</label>
                <input
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>

              <button
                onClick={limpiarFiltros}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 bg-gray-100 hover:bg-gray-200"
              >
                <X className="h-4 w-4" />
                Limpiar
              </button>
            </div>

            <div className="mt-3 text-xs text-gray-500 flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtrados: <span className="font-semibold text-gray-700">{datosAltasFiltrados.length}</span> de{' '}
              <span className="font-semibold text-gray-700">{datosAltas.length}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-gray-50 text-xs font-semibold text-gray-600">
              <div className="col-span-2">Fecha</div>
              <div className="col-span-2">Cliente</div>
              <div className="col-span-2">Evento</div>
              <div className="col-span-2">Perfil</div>
              <div className="col-span-2">Turno</div>
              <div className="col-span-2 text-right">Estado</div>
            </div>

            {datosAltasFiltrados.length === 0 ? (
              <div className="p-6 text-gray-500">No hay registros para mostrar.</div>
            ) : (
              datosAltasFiltrados.slice(0, 200).map((d, idx) => (
                <div key={`${d.fechaISO}-${idx}`} className="grid grid-cols-12 gap-2 px-4 py-3 border-t border-gray-100">
                  <div className="col-span-2 text-gray-800">{d.fechaFormateada || '—'}</div>
                  <div className="col-span-2 text-gray-800">{d.cliente}</div>
                  <div className="col-span-2 text-gray-800">{d.evento}</div>
                  <div className="col-span-2 text-gray-800">{d.nombrePerfil}</div>
                  <div className="col-span-2 text-gray-800">{d.turno}</div>
                  <div className="col-span-2 text-right">
                    <span className="inline-flex rounded-full px-2 py-1 text-xs bg-gray-100">
                      {d.estado === 'confirmado' ? 'Confirmado' : d.estado}
                    </span>
                  </div>
                </div>
              ))
            )}

            {datosAltasFiltrados.length > 200 && (
              <div className="p-3 text-xs text-gray-500 bg-gray-50">
                Mostrando 200 de {datosAltasFiltrados.length}. Exporta a Excel para ver todo.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: any }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="text-xs font-semibold text-gray-500">{title}</div>
      <div className="text-2xl font-bold text-gray-900 mt-2">{value}</div>
    </div>
  );
}
