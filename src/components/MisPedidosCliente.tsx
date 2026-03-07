import { useMemo } from 'react';
import { Calendar, Clock, Users, MapPin } from 'lucide-react';
import type { AuthUser } from '../hooks/useAuth';

interface MisPedidosClienteProps {
  pedidos: any[];
  user: AuthUser;
}

export function MisPedidosCliente({ pedidos, user }: MisPedidosClienteProps) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const misPedidos = useMemo(() => {
    return pedidos
      .filter(p => p.cliente === user.clienteNombre)
      .sort((a, b) => new Date(b.diaEvento).getTime() - new Date(a.diaEvento).getTime());
  }, [pedidos, user.clienteNombre]);

  const futuros = misPedidos.filter(p => new Date(p.diaEvento) >= hoy);
  const pasados = misPedidos.filter(p => new Date(p.diaEvento) < hoy);

  function calcHoras(entrada: string, salida: string): number {
    if (!entrada || !salida) return 0;
    const [eh, em] = entrada.split(':').map(Number);
    const [sh, sm] = salida.split(':').map(Number);
    const mins = (sh * 60 + sm) - (eh * 60 + em);
    return Math.max(0, mins / 60);
  }

  function totalHorasPedido(pedido: any): string {
    const h1 = calcHoras(pedido.horaEntrada, pedido.horaSalida) * (parseInt(pedido.cantidadCamareros) || 0);
    const h2 = calcHoras(pedido.horaEntrada2, pedido.horaSalida2) * (parseInt(pedido.cantidadCamareros2) || 0);
    const total = h1 + h2;
    if (total === 0) return '-';
    const horas = Math.floor(total);
    const mins = Math.round((total - horas) * 60);
    return mins > 0 ? `${horas}h ${mins}m` : `${horas}h`;
  }

  function formatHora(entrada: string, salida: string): string {
    if (!entrada && !salida) return '-';
    return `${entrada || '-'} → ${salida || '-'}`;
  }

  function PedidoCard({ pedido, pasado }: { pedido: any; pasado: boolean }) {
    const fecha = new Date(pedido.diaEvento);
    const diaStr = fecha.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const totalPersonal = (parseInt(pedido.cantidadCamareros) || 0) + (parseInt(pedido.cantidadCamareros2) || 0);
    const confirmados = (pedido.asignaciones || []).filter((a: any) => a.estado === 'confirmado').length;

    return (
      <div className={`bg-white rounded-xl border p-5 shadow-sm ${pasado ? 'opacity-70 border-gray-100' : 'border-gray-200 hover:shadow-md transition-shadow'}`}>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="font-bold text-gray-900 text-base">{pedido.lugar}</p>
            <span className="text-xs font-mono text-gray-400">{pedido.numero}</span>
          </div>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            pasado ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-700'
          }`}>
            {pasado ? 'Realizado' : 'Próximo'}
          </span>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <span className="capitalize">{diaStr}</span>
          </div>

          {pedido.horaEntrada && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <span>Turno 1: {formatHora(pedido.horaEntrada, pedido.horaSalida)}</span>
            </div>
          )}

          {pedido.horaEntrada2 && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <span>Turno 2: {formatHora(pedido.horaEntrada2, pedido.horaSalida2)}</span>
            </div>
          )}

          {pedido.ubicacion && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <a href={pedido.ubicacion} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                Ver ubicación
              </a>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <span>{confirmados}/{totalPersonal} personal confirmado</span>
          </div>
        </div>

        {/* Total horas */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-500">Total horas de servicio</span>
          <span className="text-sm font-bold text-blue-700">{totalHorasPedido(pedido)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 p-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Hola, {user.nombre} 👋</h2>
        <p className="text-sm text-gray-500 mt-1">Tus servicios contratados</p>
      </div>

      <section>
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full" />
          Próximos ({futuros.length})
        </h3>
        {futuros.length === 0 ? (
          <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            No tenés servicios próximos.
          </div>
        ) : (
          <div className="space-y-3">
            {futuros.map((p, i) => <PedidoCard key={i} pedido={p} pasado={false} />)}
          </div>
        )}
      </section>

      {pasados.length > 0 && (
        <section>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-gray-400 rounded-full" />
            Anteriores ({pasados.length})
          </h3>
          <div className="space-y-3">
            {pasados.map((p, i) => <PedidoCard key={i} pedido={p} pasado={true} />)}
          </div>
        </section>
      )}

      {misPedidos.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No tenés servicios registrados todavía.</p>
        </div>
      )}
    </div>
  );
}
