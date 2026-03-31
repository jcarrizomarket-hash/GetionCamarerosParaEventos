import { ArrowLeft, QrCode, Download, Check, AlertCircle, Calendar } from 'lucide-react';

interface PedidoDetailProps {
  selectedPedido: any;
  setSelectedPedido: (p: any) => void;
  requeridos: number;
  asignadosCount: number;
  faltantes: number;
  isCompleto: boolean;
  exportarDatos: (tipo: string) => void;
  setShowQRControl: (v: boolean) => void;
}

export function PedidoDetail({
  selectedPedido,
  setSelectedPedido,
  requeridos,
  faltantes,
  isCompleto,
  exportarDatos,
  setShowQRControl,
}: PedidoDetailProps) {
  return (
    <>
      {/* HEADER MODO ENFOQUE */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setSelectedPedido(null)}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors font-medium px-3 py-2 hover:bg-white rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver al Calendario
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowQRControl(true)}
            className="flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-sm font-medium border border-purple-200 transition-colors"
          >
            <QrCode className="w-4 h-4" />
            Código QR
          </button>
          <button
            onClick={() => exportarDatos('pedido')}
            className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-sm font-medium border border-green-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar Pedido
          </button>
          <span className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 ${
            isCompleto ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {isCompleto ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {isCompleto ? 'Equipo Completo' : `Faltan ${faltantes} camareros`}
          </span>
        </div>
      </div>

      {/* INFO DEL EVENTO */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{selectedPedido.cliente}</h1>
            <div className="flex items-center gap-2 text-gray-500 mb-4">
              <span className="bg-gray-100 px-2 py-0.5 rounded text-sm font-mono">{selectedPedido.numero}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4"/> {new Date(selectedPedido.diaEvento).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex gap-6 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Lugar</p>
                <p className="font-medium text-gray-800">{selectedPedido.lugar}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Horario</p>
                <p className="font-medium text-gray-800">{selectedPedido.horaEntrada} - {selectedPedido.horaSalida}</p>
                {(selectedPedido.horaEntrada2 || selectedPedido.horaSalida2) && (
                  <p className="text-xs text-gray-600 mt-1">2º Turno: {selectedPedido.horaEntrada2} - {selectedPedido.horaSalida2}</p>
                )}
              </div>
              <div>
                <p className="text-gray-500 mb-1">Requeridos</p>
                <p className="font-medium text-gray-800">{requeridos} empleados</p>
              </div>
            </div>
          </div>
          {selectedPedido.notas && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 max-w-md">
              <p className="text-xs font-bold text-yellow-700 uppercase mb-1">Notas</p>
              <p className="text-sm text-yellow-800 italic">{selectedPedido.notas}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
