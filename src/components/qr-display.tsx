import { useState, useEffect } from 'react';
import { Download, Loader2, AlertCircle, QrCode } from 'lucide-react';
import { fetchQrDataUrl, validateQrContent, type QrOptions } from '../utils/qr-generator';

interface QrDisplayProps {
  /** Texto o URL a codificar en el QR */
  content: string;
  /** URL base del servidor Supabase Functions */
  baseUrl: string;
  /** Token de autorización (anon key) */
  authToken: string;
  /** Opciones de generación del QR */
  options?: QrOptions;
  /** Ancho de visualización en píxeles (default: 200) */
  displayWidth?: number;
  /** Texto alternativo para la imagen */
  alt?: string;
  /** Si se muestra el botón de descarga (default: true) */
  showDownload?: boolean;
  /** Nombre de archivo para la descarga (default: 'qr-codigo.png') */
  downloadFilename?: string;
}

/**
 * Componente de visualización de código QR.
 *
 * Obtiene el QR del backend como data URL y lo renderiza como imagen.
 * Incluye estados de carga y error, y un botón de descarga opcional.
 */
export function QrDisplay({
  content,
  baseUrl,
  authToken,
  options,
  displayWidth = 200,
  alt = 'Código QR',
  showDownload = true,
  downloadFilename = 'qr-codigo.png',
}: QrDisplayProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!content) return;

    const validation = validateQrContent(content);
    if (!validation.valid) {
      setError(validation.reason ?? 'Contenido inválido');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setDataUrl(null);

    fetchQrDataUrl(content, baseUrl, authToken, options)
      .then((url) => {
        if (!cancelled) {
          setDataUrl(url);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error al generar el QR');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [content, baseUrl, authToken, options?.errorCorrectionLevel, options?.scale, options?.margin]);

  const handleDownload = () => {
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = downloadFilename;
    link.click();
  };

  if (!content) {
    return (
      <div
        className="flex flex-col items-center justify-center bg-gray-100 rounded-lg text-gray-400"
        style={{ width: displayWidth, height: displayWidth }}
      >
        <QrCode className="w-12 h-12 mb-2" />
        <p className="text-xs">Sin contenido</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className="flex flex-col items-center justify-center bg-gray-50 rounded-lg text-gray-500"
        style={{ width: displayWidth, height: displayWidth }}
      >
        <Loader2 className="w-8 h-8 animate-spin mb-2" />
        <p className="text-xs">Generando QR...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex flex-col items-center justify-center bg-red-50 rounded-lg text-red-500 p-3"
        style={{ width: displayWidth, minHeight: displayWidth }}
      >
        <AlertCircle className="w-8 h-8 mb-2" />
        <p className="text-xs text-center">{error}</p>
      </div>
    );
  }

  if (!dataUrl) return null;

  return (
    <div className="flex flex-col items-center gap-2">
      <img
        src={dataUrl}
        alt={alt}
        width={displayWidth}
        height={displayWidth}
        className="rounded border border-gray-200"
      />
      {showDownload && (
        <button
          onClick={handleDownload}
          className="flex items-center gap-1 px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
        >
          <Download className="w-3 h-3" />
          Descargar QR
        </button>
      )}
    </div>
  );
}
