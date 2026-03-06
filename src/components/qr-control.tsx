import { useState, useEffect } from 'react';
import { QrCode, Copy, RefreshCw, X, Check, Download } from 'lucide-react';
import QRCodeLib from 'qrcode';
import { ConfirmDialog } from './ui/confirm-dialog';

interface QRControlProps {
  pedido: any;
  baseUrl: string;
  publicAnonKey: string;
  onClose: () => void;
}

export function QRControl({ pedido, baseUrl, publicAnonKey, onClose }: QRControlProps) {
  const [qrData, setQrData] = useState<{ token: string; url: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState('');

  // Confirm dialog state
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    message: string;
    onConfirm: () => void;
  }>({ open: false, message: '', onConfirm: () => {} });

  const showConfirm = (message: string): Promise<boolean> =>
    new Promise((resolve) => {
      setConfirmState({
        open: true,
        message,
        onConfirm: () => {
          setConfirmState(s => ({ ...s, open: false }));
          resolve(true);
        },
      });
    });

  const handleConfirmCancel = () => {
    setConfirmState(s => ({ ...s, open: false }));
  };

  useEffect(() => {
    cargarQRToken();
  }, [pedido.id]);

  useEffect(() => {
    if (qrData?.url) {
      generarImagenQR(qrData.url);
    }
  }, [qrData]);

  const cargarQRToken = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/pedidos/${pedido.id}/qr-token`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` }
      });
      
      const data = await response.json();
      if (data.success) {
        setQrData({ token: data.token, url: data.url });
      }
    } catch (error) {
      console.error('Error al cargar token QR:', error);
    } finally {
      setLoading(false);
    }
  };

  const regenerarToken = async () => {
    const confirmed = await showConfirm('¿Estás seguro de regenerar el código QR? El código anterior dejará de funcionar.');
    if (!confirmed) return;

    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/pedidos/${pedido.id}/qr-regenerate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${publicAnonKey}` }
      });
      
      const data = await response.json();
      if (data.success) {
        setQrData({ token: data.token, url: data.url });
      }
    } catch (error) {
      console.error('Error al regenerar token QR:', error);
    } finally {
      setLoading(false);
    }
  };

  const generarImagenQR = async (url: string) => {
    try {
      const qrDataURL = await QRCodeLib.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrImageUrl(qrDataURL);
    } catch (error) {
      console.error('Error al generar imagen QR:', error);
    }
  };

  const copiarLink = () => {
    if (qrData?.url) {
      navigator.clipboard.writeText(qrData.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const descargarQR = () => {
    if (qrImageUrl) {
      const link = document.createElement('a');
      link.download = `QR-${pedido.cliente}-${pedido.numero}.png`;
      link.href = qrImageUrl;
      link.click();
    }
  };

  return (
    <>
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <QrCode className="w-6 h-6 text-blue-600" />
              Control de Entrada/Salida
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Código QR para {pedido.cliente} - {pedido.numero}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* QR Code Display */}
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 flex flex-col items-center border border-gray-200">
                {qrImageUrl && (
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <img src={qrImageUrl} alt="Código QR" className="w-64 h-64" />
                  </div>
                )}
                <p className="text-sm text-gray-600 mt-4 text-center max-w-md">
                  Los clientes pueden escanear este código QR para registrar entrada y salida del personal
                </p>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={copiarLink}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copiar Link
                    </>
                  )}
                </button>
                <button
                  onClick={descargarQR}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Descargar QR
                </button>
                <button
                  onClick={regenerarToken}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Regenerar
                </button>
              </div>

              {/* Link Display */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  Link de Escaneo
                </p>
                <div className="bg-white rounded-md p-3 border border-gray-300 break-all font-mono text-sm text-gray-700">
                  {qrData?.url}
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <QrCode className="w-4 h-4" />
                  Instrucciones de Uso
                </h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="font-bold mt-0.5">1.</span>
                    <span>Envía el código QR o el link al cliente del evento</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold mt-0.5">2.</span>
                    <span>El cliente puede escanearlo o acceder al link desde cualquier dispositivo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold mt-0.5">3.</span>
                    <span>Permite registrar la entrada y salida de cada camarero asignado</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold mt-0.5">4.</span>
                    <span>Si regeneras el código, el anterior dejará de funcionar</span>
                  </li>
                </ul>
              </div>

              {/* Event Info */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Información del Evento</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Cliente</p>
                    <p className="font-medium text-gray-900">{pedido.cliente}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Fecha</p>
                    <p className="font-medium text-gray-900">
                      {new Date(pedido.diaEvento).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Lugar</p>
                    <p className="font-medium text-gray-900">{pedido.lugar}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Horario</p>
                    <p className="font-medium text-gray-900">
                      {pedido.horaEntrada} - {pedido.horaSalida}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Personal Asignado</p>
                    <p className="font-medium text-gray-900">
                      {pedido.asignaciones?.length || 0} camareros
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Tipo de Evento</p>
                    <p className="font-medium text-gray-900">{pedido.tipoEvento}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
    <ConfirmDialog
      open={confirmState.open}
      message={confirmState.message}
      onConfirm={confirmState.onConfirm}
      onCancel={handleConfirmCancel}
    />
    </>
  );
}
