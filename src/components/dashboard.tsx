import { useMemo, useEffect, useState } from 'react';
import { 
  Calendar, 
  Users, 
  Clock, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  MessageSquare, 
  Send, 
  MessageCircle,
  Building2,
  Briefcase,
  CalendarDays,
  UserCheck,
  UserX,
  UserCog,
  FileText,
  Shield,
  Star,
  ChevronRight
} from 'lucide-react';

export function Dashboard({ camareros, pedidos, setActiveTab, baseUrl, publicAnonKey }) {
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      const response = await fetch(`${baseUrl}/clientes`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` }
      });
      const data = await response.json();
      if (data.success) setClientes(data.data);
    } catch (error) {
      console.log('Error al cargar clientes:', error);
    }
  };

  // Deduplicar datos
  const uniquePedidos = useMemo(() => Array.from(new Map(pedidos.map(p => [p.id, p])).values()), [pedidos]);
  const uniqueCamareros = useMemo(() => Array.from(new Map(camareros.map(c => [c.id, c])).values()), [camareros]);
  const uniqueClientes = useMemo(() => Array.from(new Map(clientes.map(c => [c.id, c])).values()), [clientes]);

  // Calcular métricas
  const metrics = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calcular inicio de semana (lunes)
    const currentDay = today.getDay();
    const diffToMonday = currentDay === 0 ? 6 : currentDay - 1;
    const monday = new Date(today);
    monday.setDate(today.getDate() - diffToMonday);
    const nextSunday = new Date(monday);
    nextSunday.setDate(monday.getDate() + 6);

    // Calcular inicio de mes
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Filtrar eventos
    const eventosDiarios = uniquePedidos.filter(p => {
      const fecha = new Date(p.diaEvento);
      fecha.setHours(0, 0, 0, 0);
      return fecha.getTime() === today.getTime();
    });

    const eventosSemanales = uniquePedidos.filter(p => {
      const fecha = new Date(p.diaEvento);
      fecha.setHours(0, 0, 0, 0);
      return fecha >= monday && fecha <= nextSunday;
    });

    const eventosMensuales = uniquePedidos.filter(p => {
      const fecha = new Date(p.diaEvento);
      fecha.setHours(0, 0, 0, 0);
      return fecha >= firstDayOfMonth && fecha <= lastDayOfMonth;
    });

    // Calcular camareros necesarios (considerando ocupación mínima de 5 horas)
    const calcularCamarerosNecesarios = (eventos) => {
      // Crear un mapa de franjas horarias ocupadas por día
      const ocupacionPorDia = {};

      eventos.forEach(evento => {
        const dia = evento.diaEvento;
        if (!ocupacionPorDia[dia]) {
          ocupacionPorDia[dia] = [];
        }

        const cant1 = parseInt(evento.cantidadCamareros || 0);
        const cant2 = parseInt(evento.cantidadCamareros2 || 0);
        const totalCamareros = cant1 + cant2;

        // Calcular hora de inicio y duración mínima (5 horas)
        const horaInicio = evento.horaEntrada || '00:00';
        const [hora, minuto] = horaInicio.split(':').map(Number);
        const inicioEnMinutos = hora * 60 + minuto;
        const finEnMinutos = inicioEnMinutos + (5 * 60); // 5 horas

        ocupacionPorDia[dia].push({
          inicio: inicioEnMinutos,
          fin: finEnMinutos,
          cantidad: totalCamareros
        });
      });

      // Calcular el máximo de camareros simultáneos por día
      let maxCamareros = 0;
      Object.values(ocupacionPorDia).forEach(franjas => {
        // Crear eventos de inicio y fin
        const eventos = [];
        franjas.forEach(franja => {
          eventos.push({ tiempo: franja.inicio, tipo: 'inicio', cantidad: franja.cantidad });
          eventos.push({ tiempo: franja.fin, tipo: 'fin', cantidad: franja.cantidad });
        });

        // Ordenar por tiempo
        eventos.sort((a, b) => a.tiempo - b.tiempo);

        // Calcular ocupación simultánea
        let ocupacionActual = 0;
        eventos.forEach(evento => {
          if (evento.tipo === 'inicio') {
            ocupacionActual += evento.cantidad;
          } else {
            ocupacionActual -= evento.cantidad;
          }
          maxCamareros = Math.max(maxCamareros, ocupacionActual);
        });
      });

      return maxCamareros;
    };

    const camarerosNecesariosDiario = calcularCamarerosNecesarios(eventosDiarios);
    const camarerosNecesariosSemanal = calcularCamarerosNecesarios(eventosSemanales);
    const camarerosNecesariosMensual = calcularCamarerosNecesarios(eventosMensuales);

    // Calcular estados de camareros
    const camarerosDisponibles = uniqueCamareros.filter(c => !c.estado || c.estado === 'disponible').length;
    const camarerosApercibidos = uniqueCamareros.filter(c => c.estado === 'apercibido').length;
    const camarerosActivos = uniqueCamareros.filter(c => c.estado === 'activo').length;
    const camarerosReserva = uniqueCamareros.filter(c => c.estado === 'reserva').length;

    // Calcular estados de mensajes
    let mensajesSinEnviar = 0;
    let mensajesEnviados = 0;
    let mensajesSinConfirmar = 0;

    uniquePedidos.forEach(pedido => {
      const asignaciones = pedido.asignaciones || [];
      asignaciones.forEach(asig => {
        if (!asig.estado || asig.estado === '') {
          mensajesSinEnviar++;
        } else if (asig.estado === 'enviado') {
          mensajesEnviados++;
          mensajesSinConfirmar++;
        } else if (asig.estado === 'confirmado') {
          mensajesEnviados++;
        }
      });
    });

    return {
      eventosDiarios: eventosDiarios.length,
      eventosSemanales: eventosSemanales.length,
      eventosMensuales: eventosMensuales.length,
      camarerosNecesariosDiario,
      camarerosNecesariosSemanal,
      camarerosNecesariosMensual,
      totalClientes: uniqueClientes.length,
      totalCamareros: uniqueCamareros.length,
      camarerosDisponibles,
      camarerosApercibidos,
      camarerosActivos,
      camarerosReserva,
      mensajesSinEnviar,
      mensajesEnviados,
      mensajesSinConfirmar
    };
  }, [uniquePedidos, uniqueCamareros, uniqueClientes]);

  const quickAccessCards = [
    {
      title: 'Clientes',
      icon: Building2,
      color: 'blue',
      action: () => setActiveTab('pedidos'),
      count: metrics.totalClientes
    },
    {
      title: 'Entrada de Pedidos',
      icon: Briefcase,
      color: 'purple',
      action: () => setActiveTab('pedidos')
    },
    {
      title: 'Gestión de Pedidos',
      icon: CalendarDays,
      color: 'indigo',
      action: () => setActiveTab('pedidos')
    },
    {
      title: 'Camareros Disponibles',
      icon: UserCheck,
      color: 'green',
      action: () => setActiveTab('camareros'),
      count: metrics.camarerosDisponibles
    },
    {
      title: 'Camareros Apercibidos',
      icon: UserX,
      color: 'red',
      action: () => setActiveTab('camareros'),
      count: metrics.camarerosApercibidos
    },
    {
      title: 'Camareros Activos',
      icon: Users,
      color: 'teal',
      action: () => setActiveTab('camareros'),
      count: metrics.camarerosActivos
    },
    {
      title: 'Camareros en Reserva',
      icon: Shield,
      color: 'orange',
      action: () => setActiveTab('camareros'),
      count: metrics.camarerosReserva
    },
    {
      title: 'Valoración Equipo',
      icon: Star,
      color: 'yellow',
      action: () => setActiveTab('camareros')
    },
    {
      title: 'Mensajes sin Enviar',
      icon: MessageSquare,
      color: 'gray',
      action: () => setActiveTab('envio-mensaje'),
      count: metrics.mensajesSinEnviar
    },
    {
      title: 'Mensajes Enviados',
      icon: Send,
      color: 'cyan',
      action: () => setActiveTab('envio-mensaje'),
      count: metrics.mensajesEnviados
    },
    {
      title: 'Mensajes sin Confirmar',
      icon: MessageCircle,
      color: 'amber',
      action: () => setActiveTab('envio-mensaje'),
      count: metrics.mensajesSinConfirmar
    },
    {
      title: 'Informes',
      icon: FileText,
      color: 'pink',
      action: () => setActiveTab('informes')
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
      purple: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100',
      indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100',
      green: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
      red: 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100',
      teal: 'bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100',
      orange: 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100',
      yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100',
      gray: 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100',
      cyan: 'bg-cyan-50 border-cyan-200 text-cyan-700 hover:bg-cyan-100',
      amber: 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100',
      pink: 'bg-pink-50 border-pink-200 text-pink-700 hover:bg-pink-100'
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className="space-y-6">
      {/* Bienvenida */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Dashboard de Gestión</h1>
        <p className="text-blue-100">Resumen general de eventos, camareros y operaciones</p>
      </div>

      {/* Métricas de Eventos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-600" />
          Eventos Programados
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Diario */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500 rounded-full">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-600 font-medium uppercase tracking-wide">Hoy</p>
                <p className="text-4xl font-bold text-blue-900">{metrics.eventosDiarios}</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-blue-300">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-700 font-medium">Camareros necesarios</span>
              </div>
              <span className="text-xl font-bold text-blue-900">{metrics.camarerosNecesariosDiario}</span>
            </div>
          </div>

          {/* Semanal */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border-2 border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500 rounded-full">
                <CalendarDays className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-purple-600 font-medium uppercase tracking-wide">Esta Semana</p>
                <p className="text-4xl font-bold text-purple-900">{metrics.eventosSemanales}</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-purple-300">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-purple-700 font-medium">Camareros necesarios</span>
              </div>
              <span className="text-xl font-bold text-purple-900">{metrics.camarerosNecesariosSemanal}</span>
            </div>
          </div>

          {/* Mensual */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-6 border-2 border-indigo-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-500 rounded-full">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-indigo-600 font-medium uppercase tracking-wide">Este Mes</p>
                <p className="text-4xl font-bold text-indigo-900">{metrics.eventosMensuales}</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-indigo-300">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span className="text-sm text-indigo-700 font-medium">Camareros necesarios</span>
              </div>
              <span className="text-xl font-bold text-indigo-900">{metrics.camarerosNecesariosMensual}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen de Camareros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Users className="w-6 h-6 text-purple-600" />
          Estado de Camareros
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-center">
            <p className="text-sm text-gray-600 font-medium mb-1">Total</p>
            <p className="text-3xl font-bold text-gray-900">{metrics.totalCamareros}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200 text-center">
            <p className="text-sm text-green-600 font-medium mb-1">Disponibles</p>
            <p className="text-3xl font-bold text-green-700">{metrics.camarerosDisponibles}</p>
          </div>
          <div className="bg-teal-50 rounded-lg p-4 border border-teal-200 text-center">
            <p className="text-sm text-teal-600 font-medium mb-1">Activos</p>
            <p className="text-3xl font-bold text-teal-700">{metrics.camarerosActivos}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200 text-center">
            <p className="text-sm text-orange-600 font-medium mb-1">Reserva</p>
            <p className="text-3xl font-bold text-orange-700">{metrics.camarerosReserva}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4 border border-red-200 text-center">
            <p className="text-sm text-red-600 font-medium mb-1">Apercibidos</p>
            <p className="text-3xl font-bold text-red-700">{metrics.camarerosApercibidos}</p>
          </div>
        </div>
      </div>

      {/* Estado de Mensajes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-cyan-600" />
          Estado de Comunicaciones
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-gray-400 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Sin Enviar</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.mensajesSinEnviar}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-gray-400" />
          </div>
          <div className="bg-cyan-50 rounded-lg p-4 border-l-4 border-cyan-400 flex items-center justify-between">
            <div>
              <p className="text-sm text-cyan-600 font-medium mb-1">Enviados</p>
              <p className="text-3xl font-bold text-cyan-700">{metrics.mensajesEnviados}</p>
            </div>
            <Send className="w-8 h-8 text-cyan-400" />
          </div>
          <div className="bg-amber-50 rounded-lg p-4 border-l-4 border-amber-400 flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-600 font-medium mb-1">Sin Confirmar</p>
              <p className="text-3xl font-bold text-amber-700">{metrics.mensajesSinConfirmar}</p>
            </div>
            <MessageCircle className="w-8 h-8 text-amber-400" />
          </div>
        </div>
      </div>

      {/* Accesos Rápidos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <UserCog className="w-6 h-6 text-green-600" />
          Accesos Rápidos
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {quickAccessCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <button
                key={index}
                onClick={card.action}
                className={`${getColorClasses(card.color)} rounded-lg p-4 border-2 transition-all hover:shadow-md hover:scale-105 active:scale-95 text-left relative group`}
              >
                <div className="flex items-start justify-between mb-3">
                  <Icon className="w-6 h-6" />
                  {card.count !== undefined && (
                    <span className="bg-white px-2 py-1 rounded-full text-xs font-bold shadow-sm">
                      {card.count}
                    </span>
                  )}
                </div>
                <p className="font-semibold text-sm mb-1">{card.title}</p>
                <ChevronRight className="w-4 h-4 absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Indicadores de Alerta */}
      {(metrics.mensajesSinEnviar > 0 || metrics.mensajesSinConfirmar > 5 || metrics.camarerosApercibidos > 0) && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg shadow-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-800 mb-2">Atención Requerida</h3>
              <ul className="space-y-1 text-sm text-yellow-700">
                {metrics.mensajesSinEnviar > 0 && (
                  <li>• Tienes {metrics.mensajesSinEnviar} mensaje(s) pendiente(s) de enviar</li>
                )}
                {metrics.mensajesSinConfirmar > 5 && (
                  <li>• Hay {metrics.mensajesSinConfirmar} mensaje(s) sin confirmar</li>
                )}
                {metrics.camarerosApercibidos > 0 && (
                  <li>• {metrics.camarerosApercibidos} camarero(s) apercibido(s) requieren atención</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}