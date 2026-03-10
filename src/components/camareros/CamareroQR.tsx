import { useState, useEffect } from 'react';
import { QrCode, X, Send, CheckCircle, Loader2, Smartphone, Mail } from 'lucide-react';
import QRCode from 'qrcode';

interface CamareroQRProps {
    camarero: any;
    pedidoId: string;
    pedidoNumero?: string;
    onClose: () => void;
}

type SendStatus = 'idle' | 'sending' | 'sent' | 'error';

export function CamareroQR({ camarero, pedidoId, pedidoNumero, onClose }: CamareroQRProps) {
    const [qrDataUrl, setQrDataUrl] = useState<string>('');
    const [whatsappStatus, setWhatsappStatus] = useState<SendStatus>('idle');
    const [emailStatus, setEmailStatus] = useState<SendStatus>('idle');

    const checkInUrl = `${window.location.origin}/checkin/${pedidoId}/${camarero.id}`;

    useEffect(() => {
        QRCode.toDataURL(checkInUrl, {
            width: 220,
            margin: 2,
            color: { dark: '#1e293b', light: '#f8fafc' },
            errorCorrectionLevel: 'H',
        }).then(setQrDataUrl);
    }, [checkInUrl]);

    const sendWhatsApp = async () => {
        if (!camarero.telefono) return;
        setWhatsappStatus('sending');
        try {
            const res = await fetch(
                `${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/make-server-25b11ac0/send-whatsapp`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                    },
                    body: JSON.stringify({
                        to: camarero.telefono,
                        message: `Hola ${camarero.nombre}, tu enlace de check-in para el evento ${pedidoNumero || pedidoId}:\n\n${checkInUrl}`,
                    }),
                }
            );
            if (!res.ok) throw new Error();
            setWhatsappStatus('sent');
        } catch {
            setWhatsappStatus('error');
        }
    };

    const sendEmail = async () => {
        if (!camarero.email) return;
        setEmailStatus('sending');
        try {
            const res = await fetch(
                `${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/make-server-25b11ac0/send-email`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                    },
                    body: JSON.stringify({
                        to: camarero.email,
                        subject: `Check-in Evento ${pedidoNumero || pedidoId}`,
                        html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto"><h2>Hola, ${camarero.nombre}</h2><p>Tu enlace de check-in para el evento <strong>${pedidoNumero || pedidoId}</strong>:</p><a href="${checkInUrl}" style="display:inline-block;background:#2563eb;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">Hacer Check-in</a><p style="color:#64748b;font-size:13px">${checkInUrl}</p></div>`,
                    }),
                }
            );
            if (!res.ok) throw new Error();
            setEmailStatus('sent');
        } catch {
            setEmailStatus('error');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
                <div className="bg-slate-800 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <QrCode className="w-5 h-5 text-slate-300" />
                        <span className="text-white font-semibold text-sm">Check-in QR</span>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="px-6 pt-5 pb-3 border-b border-gray-100">
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-medium mb-1">Personal</p>
                    <p className="text-lg font-bold text-gray-900">{camarero.nombre} {camarero.apellido}</p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">
                        {camarero.codigo || `#${camarero.numero}`} · Evento {pedidoNumero || pedidoId}
                    </p>
                </div>
                <div className="flex flex-col items-center py-6 bg-slate-50">
                    {qrDataUrl ? (
                        <img src={qrDataUrl} alt="QR Check-in" className="rounded-xl border border-slate-200 shadow-sm" style={{ width: 180, height: 180 }} />
                    ) : (
                        <div className="w-44 h-44 bg-slate-200 rounded-xl animate-pulse" />
                    )}
                    <p className="text-xs text-slate-400 mt-3 font-mono break-all px-4 text-center">{checkInUrl}</p>
                </div>
                <div className="px-6 py-5 space-y-3">
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">Enviar a</p>
                    <button
                        onClick={sendWhatsApp}
                        disabled={!camarero.telefono || whatsappStatus === 'sending' || whatsappStatus === 'sent'}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all ${whatsappStatus === 'sent' ? 'bg-green-50 border-green-200 text-green-700' :
                                whatsappStatus === 'error' ? 'bg-red-50 border-red-200 text-red-600' :
                                    !camarero.telefono ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed' :
                                        'bg-white border-gray-200 text-gray-700 hover:border-green-300 hover:bg-green-50'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Smartphone className="w-4 h-4" />
                            <span>{whatsappStatus === 'sent' ? 'WhatsApp enviado' : whatsappStatus === 'error' ? 'Error al enviar' : `WhatsApp · ${camarero.telefono || 'Sin teléfono'}`}</span>
                        </div>
                        {whatsappStatus === 'sending' ? <Loader2 className="w-4 h-4 animate-spin" /> :
                            whatsappStatus === 'sent' ? <CheckCircle className="w-4 h-4 text-green-500" /> :
                                <Send className="w-4 h-4 text-gray-400" />}
                    </button>
                    <button
                        onClick={sendEmail}
                        disabled={!camarero.email || emailStatus === 'sending' || emailStatus === 'sent'}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all ${emailStatus === 'sent' ? 'bg-green-50 border-green-200 text-green-700' :
                                emailStatus === 'error' ? 'bg-red-50 border-red-200 text-red-600' :
                                    !camarero.email ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed' :
                                        'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <span>{emailStatus === 'sent' ? 'Email enviado' : emailStatus === 'error' ? 'Error al enviar' : `Email · ${camarero.email || 'Sin email'}`}</span>
                        </div>
                        {emailStatus === 'sending' ? <Loader2 className="w-4 h-4 animate-spin" /> :
                            emailStatus === 'sent' ? <CheckCircle className="w-4 h-4 text-green-500" /> :
                                <Send className="w-4 h-4 text-gray-400" />}
                    </button>
                </div>
            </div>
        </div>
    );
}
