import { useMemo } from 'react';
import { Calendar, Clock, MapPin, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import type { AuthUser } from '../hooks/useAuth';

interface MisPedidosCamareroProps {
  pedidos: any[];
  user: AuthUser;
}

export function MisPedidosCamarero({ pedidos, user }: MisPedidosCamareroProps) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const misServicios = useMemo(() => {
    const servicios: any[] = [];
    for (const pedido of pedidos) {
      const asignaciones = pedido.asignaciones || [];
      const miAsignacion = asignaciones.find((a: any) => a.camareroId === user.camareroId);
      if (!miAsignacion) continue;
      servicios.push({ pedido, asignacion: miAsignacion });
    }
    return servicios.sort((a, b) =>
      new Date(a.pedido.diaEvento).getTime() - new Date(b.pedido.diaEvento).getTime()
    );
  }, [pedidos, user.camareroId]);

  const futuros = misServicios.filter(s => new Date(s.pedido.diaEvento) >= hoy);
  const pasados = misServicios.filter(s => new Date(s.pedido.diaEvento) < hoy);

  function calcHoras(entrada: string, salida: string): string {
    if (!entrada || !salida) return '-';
    const [eh, em] = entrada.split(':').map(Number);
    const [sh, sm] = salida.split(':').map(Number);
    const mins = (sh * 60 + sm) - (eh * 60 + em);
    if (mins <= 0) return '-';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }

  function estadoBadge(estado: string) {
    if (estado === 'confirmado') return <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full"><CheckCircle className="w-3 h-3" />Confirmado</span>;
    if (estado === 'rechazado') return <span className="flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-full"><XCircle className="w-3 h-3" />Rechazado</span>;
    return <span className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full"><AlertCircle className="w-3 h-3" />Pendiente</span>;
  }

  function ServicioCard({ s }: { s: any }) {
    const fecha = new Date(s.pedido.diaEvento);
    const diaStr = fecha.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const turno = s.asignacion.turno === 2 ? 2 : 1;
    const entrada = turno === 1 ? s.pedido.horaEntrada : s.pedido.horaEntrada2;
    const salida = turno === 1 ? s.pedido.horaSalida : s.pedido.horaSalida2;

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="font-bold text-gray-900 text-base">{s.pedido.cliente}</p>
            <p className="text-sm text-gray-500">{s.pedido.lugar}</p>
          </div>
          {estadoBadge(s.asignacion.estado)}
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <span className="capitalize">{diaStr}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <span>
              {entrada || '-'} → {salida || '-'}
              {entrada && salida && (
                <span className="ml-2 font-semibold text-blue-600">({calcHoras(entrada, salida)})</span>
              )}
            </span>
          </div>
          {s.pedido.lugar && (
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <span>{s.pedido.lugar}</span>
            </div>
          )}
        </div>

        {s.asignacion.tipoPerfil && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <span className="text-xs font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
              {s.asignacion.tipoPerfil}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 p-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Hola, {user.nombre} 👋</h2>
        <p className="text-sm text-gray-500 mt-1">Tus servicios asignados</p>
      </div>

      {/* Próximos */}
      <section>
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full" />
          Próximos servicios ({futuros.length})
        </h3>
        {futuros.length === 0 ? (
          <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            No tenés servicios futuros asignados.
          </div>
        ) : (
          <div className="space-y-3">
            {futuros.map((s, i) => <ServicioCard key={i} s={s} />)}
          </div>
        )}
      </section>

      {/* Pasados */}
      {pasados.length > 0 && (
        <section>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-gray-400 rounded-full" />
            Servicios anteriores ({pasados.length})
          </h3>
          <div className="space-y-3 opacity-70">
            {pasados.slice().reverse().map((s, i) => <ServicioCard key={i} s={s} />)}
          </div>
        </section>
      )}

      {misServicios.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No tenés servicios asignados todavía.</p>
        </div>
      )}
    </div>
  );
}
