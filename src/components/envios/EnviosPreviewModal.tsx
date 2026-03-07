import { useState } from 'react';
import { X, CheckCircle, XCircle, Send, Loader2 } from 'lucide-react';
import { updatePedido, enviarWhatsApp } from '../../api/client';
import {
  generarMensajeServicio,
  generarMensajeConfirmacion,
  generarMensajeServicioCompleto,
  labelPerfil,
  type MensajeParams,
} from './messageTemplates';

interface EnviosPreviewModalProps {
  selectedEvento: any;
  camareros: any[];
  setShowVistaPreviaServicio: (v: boolean) => void;
  onEstadoActualizado: (pedidoActualizado: any) => void;
}

type EstadoEnvio = 'idle' | 'enviando' | 'ok' | 'error';

export function EnviosPreviewModal({
  selectedEvento,
  camareros,
  setShowVistaPreviaServicio,
  onEstadoActualizado,
}: EnviosPreviewModalProps) {
  const [estadosEnvio, setEstadosEnvio] = useState<Record<string, EstadoEnvio>>({});
  const [procesandoAceptar, setProcesandoAceptar] = useState<Record<string, boolean>>({});
  const [procesandoRechazar, setProcesandoRechazar] = useState<Record<string, boolean>>({});

  const modalidad: 'catering' | 'restauracion' =
    selectedEvento.catering === 'si' ? 'catering' : 'restauracion';

  const asignaciones: any[] = selectedEvento.asignaciones || [];

  function buildParams(camarero: any): MensajeParams {
    return {
      modalidad,
      tipoPerfil: camarero?.tipoPerfil ?? 'CAM',
      fecha: selectedEvento.diaEvento,
      cliente: selectedEvento.cliente,
      evento: selectedEvento.nombre || selectedEvento.evento || selectedEvento.numero,
      horaEntrada: selectedEvento.horaEntrada,
      ubicacion: selectedEvento.ubicacion || selectedEvento.lugar || '',
      camisa: selectedEvento.camisa,
    };
  }

  async function actualizarEstadoAsignacion(camareroId: string, nuevoEstado: 'confirmado' | 'rechazado') {
    const asignacionesActualizadas = asignaciones.map(a =>
      a.camareroId === camareroId
        ? {
            ...a,
            estado: nuevoEstado,
            ...(nuevoEstado === 'rechazado'
              ? { eliminacionProgramada: new Date(Date.now() + 10 * 60 * 1000).toISOString() }
              : { eliminacionProgramada: null }),
          }
        : a
    );
    const pedidoActualizado = { ...selectedEvento, asignaciones: asignacionesActualizadas };
    await updatePedido(selectedEvento.id, pedidoActualizado);
    return pedidoActualizado;
  }

  async function handleAceptar(asignacion: any) {
    const camarero = camareros.find(c => c.id === asignacion.camareroId);
    const camareroId = asignacion.camareroId;
    setProcesandoAceptar(prev => ({ ...prev, [camareroId]: true }));
    setEstadosEnvio(prev => ({ ...prev, [camareroId]: 'enviando' }));
    try {
      const pedidoActualizado = await actualizarEstadoAsignacion(camareroId, 'confirmado');
      onEstadoActualizado(pedidoActualizado);

      // Enviar mensaje de confirmación con QR al que aceptó
      if (camarero?.telefono) {
        const msgConf = generarMensajeConfirmacion({
          fecha: selectedEvento.diaEvento,
          cliente: selectedEvento.cliente,
          evento: selectedEvento.nombre || selectedEvento.evento || selectedEvento.numero,
          horaEntrada: selectedEvento.horaEntrada,
          qrUrl: selectedEvento.qrUrl,
        });
        await enviarWhatsApp(camarero.telefono, msgConf);
      }

      // ── SERVICIO COMPLETO ──────────────────────────────────────────────
      // Verificar si con esta confirmación se alcanza el cupo requerido
      const requeridos =
        (parseInt(selectedEvento.cantidadCamareros || 0)) +
        (parseInt(selectedEvento.cantidadCamareros2 || 0));

      const confirmadosAhora = (pedidoActualizado.asignaciones || []).filter(
        (a: any) => a.estado === 'confirmado'
      ).length;

      if (requeridos > 0 && confirmadosAhora >= requeridos) {
        // Enviar "SERVICIO COMPLETO" a todos los que aún tienen estado 'enviado' (no contestaron)
        const pendientesDeRespuesta = (pedidoActualizado.asignaciones || []).filter(
          (a: any) => a.estado === 'enviado'
        );

        if (pendientesDeRespuesta.length > 0) {
          const msgCompleto = generarMensajeServicioCompleto({
            fecha: selectedEvento.diaEvento,
            cliente: selectedEvento.cliente,
            evento: selectedEvento.nombre || selectedEvento.evento || selectedEvento.numero,
            horaEntrada: selectedEvento.horaEntrada,
          });

          for (const pendiente of pendientesDeRespuesta) {
            const camPendiente = camareros.find(c => c.id === pendiente.camareroId);
            if (camPendiente?.telefono) {
              await enviarWhatsApp(camPendiente.telefono, msgCompleto);
            }
          }
        }
      }
      // ──────────────────────────────────────────────────────────────────

      setEstadosEnvio(prev => ({ ...prev, [camareroId]: 'ok' }));
    } catch {
      setEstadosEnvio(prev => ({ ...prev, [camareroId]: 'error' }));
    } finally {
      setProcesandoAceptar(prev => ({ ...prev, [camareroId]: false }));
    }
  }

  async function handleRechazar(asignacion: any) {
    const camareroId = asignacion.camareroId;
    setProcesandoRechazar(prev => ({ ...prev, [camareroId]: true }));
    try {
      const pedidoActualizado = await actualizarEstadoAsignacion(camareroId, 'rechazado');
      onEstadoActualizado(pedidoActualizado);
    } catch (err) {
      console.error(err);
    } finally {
      setProcesandoRechazar(prev => ({ ...prev, [camareroId]: false }));
    }
  }

  async function handleEnviarMensaje(asignacion: any) {
    const camarero = camareros.find(c => c.id === asignacion.camareroId);
    if (!camarero?.telefono) return;
    const camareroId = asignacion.camareroId;
    setEstadosEnvio(prev => ({ ...prev, [camareroId]: 'enviando' }));
    try {
      const params = buildParams(camarero);
      const mensaje = generarMensajeServicio(params);
      await enviarWhatsApp(camarero.telefono, mensaje);
      setEstadosEnvio(prev => ({ ...prev, [camareroId]: 'ok' }));
      if (!asignacion.estado || asignacion.estado === 'pendiente') {
        const asignacionesActualizadas = asignaciones.map(a =>
          a.camareroId === camareroId ? { ...a, estado: 'enviado' } : a
        );
        const pedidoActualizado = { ...selectedEvento, asignaciones: asignacionesActualizadas };
        await updatePedido(selectedEvento.id, pedidoActualizado);
        onEstadoActualizado(pedidoActualizado);
      }
    } catch {
      setEstadosEnvio(prev => ({ ...prev, [camareroId]: 'error' }));
    }
  }

  async function handleEnviarTodos() {
    for (const asignacion of asignaciones) {
      if (asignacion.estado !== 'rechazado') await handleEnviarMensaje(asignacion);
    }
  }

  const titulo = modalidad === 'catering' ? '🍽️ Catering' : '🍴 Restauración';

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-xl flex-shrink-0">
          <div>
            <h3 className="text-xl font-bold">Vista Previa de Mensajes</h3>
            <p className="text-sm opacity-90">
              {titulo} · {selectedEvento.cliente} · {new Date(selectedEvento.diaEvento).toLocaleDateString('es-ES')}
            </p>
          </div>
          <button onClick={() => setShowVistaPreviaServicio(false)} className="p-2 hover:bg-white/20 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {asignaciones.length === 0 && (
            <p className="text-center text-gray-500 py-8">No hay personal asignado a este evento.</p>
          )}

          {asignaciones.map(asignacion => {
            const camarero = camareros.find(c => c.id === asignacion.camareroId);
            const nombre = camarero?.nombre || asignacion.camareroNombre || 'Desconocido';
            const perfil = camarero?.tipoPerfil ?? 'CAM';
            const params = buildParams(camarero ?? { tipoPerfil: perfil });
            const mensaje = generarMensajeServicio(params);
            const estadoActual = asignacion.estado ?? 'pendiente';
            const envioState = estadosEnvio[asignacion.camareroId] ?? 'idle';
            const aceptando = procesandoAceptar[asignacion.camareroId] ?? false;
            const rechazando = procesandoRechazar[asignacion.camareroId] ?? false;
            const yaConfirmado = estadoActual === 'confirmado';
            const yaRechazado = estadoActual === 'rechazado';

            return (
              <div key={asignacion.camareroId} className="border border-gray-200 rounded-xl overflow-hidden">
                {/* Cabecera camarero */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                      yaConfirmado ? 'bg-green-500' :
                      yaRechazado  ? 'bg-red-500' :
                      estadoActual === 'enviado' ? 'bg-orange-400' : 'bg-gray-300'
                    }`} />
                    <span className="font-semibold text-gray-900 truncate">{nombre}</span>
                    <span className="text-xs text-gray-500 bg-gray-200 rounded px-2 py-0.5 flex-shrink-0">
                      {labelPerfil(perfil)}
                    </span>
                    {camarero?.telefono && (
                      <span className="text-xs text-gray-400 hidden sm:block">{camarero.telefono}</span>
                    )}
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ml-2 ${
                    yaConfirmado ? 'bg-green-100 text-green-700' :
                    yaRechazado  ? 'bg-red-100 text-red-700' :
                    estadoActual === 'enviado' ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {yaConfirmado ? 'Confirmado' : yaRechazado ? 'Rechazado' :
                     estadoActual === 'enviado' ? 'Enviado' : 'Pendiente'}
                  </span>
                </div>

                {/* Bubble WhatsApp */}
                <div className="bg-[#E5DDD5] p-4">
                  <div className="bg-white rounded-lg rounded-tl-none px-4 py-3 shadow-sm max-w-[92%] text-sm">
                    <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed text-sm">
                      {mensaje}
                    </pre>

                    {/* Botones ACEPTAR / RECHAZAR */}
                    {!yaConfirmado && !yaRechazado && (
                      <div className="flex gap-3 mt-4 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => handleAceptar(asignacion)}
                          disabled={aceptando || rechazando}
                          className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-sm font-bold py-2.5 rounded-lg transition-colors"
                        >
                          {aceptando
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <CheckCircle className="w-4 h-4" />}
                          ACEPTAR
                        </button>
                        <button
                          onClick={() => handleRechazar(asignacion)}
                          disabled={aceptando || rechazando}
                          className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-bold py-2.5 rounded-lg transition-colors"
                        >
                          {rechazando
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <XCircle className="w-4 h-4" />}
                          RECHAZAR
                        </button>
                      </div>
                    )}

                    {yaConfirmado && (
                      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-green-600 text-sm font-medium">
                        <CheckCircle className="w-4 h-4" />
                        Confirmado · mensaje QR enviado
                      </div>
                    )}
                    {yaRechazado && (
                      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-red-500 text-sm font-medium">
                        <XCircle className="w-4 h-4" />
                        Servicio rechazado
                      </div>
                    )}
                  </div>
                </div>

                {/* Fila enviar */}
                {!yaRechazado && (
                  <div className="px-4 py-3 bg-white flex items-center justify-between gap-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400">
                      {envioState === 'ok'      && '✅ Mensaje enviado'}
                      {envioState === 'error'   && '❌ Error al enviar'}
                      {envioState === 'enviando' && '⏳ Enviando...'}
                      {envioState === 'idle'    && (camarero?.telefono ? `→ ${camarero.telefono}` : 'Sin teléfono registrado')}
                    </span>
                    <button
                      onClick={() => handleEnviarMensaje(asignacion)}
                      disabled={envioState === 'enviando' || !camarero?.telefono}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      {envioState === 'enviando'
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Send className="w-4 h-4" />}
                      Enviar mensaje
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex gap-3 flex-shrink-0 bg-gray-50 rounded-b-xl">
          <button
            onClick={handleEnviarTodos}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            <Send className="w-5 h-5" />
            Enviar a todos
          </button>
          <button
            onClick={() => setShowVistaPreviaServicio(false)}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
