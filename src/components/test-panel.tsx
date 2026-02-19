/**
 * Panel de Testing Integrado
 * 
 * Componente para realizar pruebas manuales rápidas del sistema
 * desde la interfaz de usuario
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Send, 
  Mail, 
  MessageSquare,
  TestTube,
  RefreshCw,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { TestEmail } from './test-email';

const TEST_PHONE = '+15558327331';
const TEST_EMAIL = 'pruebas@sistema-camareros.com';

export function TestPanel() {
  const [whatsappStatus, setWhatsappStatus] = useState<any>(null);
  const [emailStatus, setEmailStatus] = useState<any>(null);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Datos de prueba
  const [testData, setTestData] = useState({
    whatsapp: {
      phone: TEST_PHONE,
      message: '🧪 MENSAJE DE PRUEBA\n\nEste es un mensaje de prueba del sistema de gestión de camareros.\n\nFecha: ' + new Date().toLocaleDateString('es-ES') + '\nHora: ' + new Date().toLocaleTimeString('es-ES') + '\n\n✅ Si recibes este mensaje, la integración está funcionando correctamente.'
    },
    email: {
      to: TEST_EMAIL,
      subject: '🧪 Prueba de Sistema - Gestión de Camareros',
      body: '<h1>Prueba de Sistema</h1><p>Este es un email de prueba del sistema de gestión de camareros.</p><p>Fecha: ' + new Date().toLocaleString('es-ES') + '</p>'
    }
  });

  const addResult = (test: string, status: 'success' | 'error' | 'warning', message: string, details?: any) => {
    setTestResults(prev => [{
      test,
      status,
      message,
      details,
      timestamp: new Date().toLocaleTimeString('es-ES')
    }, ...prev.slice(0, 9)]); // Mantener últimos 10 resultados
  };

  const checkWhatsAppConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-25b11ac0/verificar-whatsapp-config`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );
      const data = await response.json();
      setWhatsappStatus(data);
      
      if (data.configured) {
        addResult('WhatsApp Config', 'success', `Configurado correctamente desde ${data.source}`, data);
      } else {
        addResult('WhatsApp Config', 'warning', 'WhatsApp no configurado', data);
      }
    } catch (error) {
      addResult('WhatsApp Config', 'error', 'Error al verificar configuración', error);
    } finally {
      setLoading(false);
    }
  };

  const sendTestWhatsApp = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-25b11ac0/enviar-whatsapp`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            telefono: testData.whatsapp.phone,
            mensaje: testData.whatsapp.message
          })
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        addResult('Envío WhatsApp', 'success', `Mensaje enviado exitosamente a ${testData.whatsapp.phone}`, data);
      } else {
        addResult('Envío WhatsApp', 'error', data.error || 'Error al enviar mensaje', data);
      }
    } catch (error) {
      addResult('Envío WhatsApp', 'error', 'Error de conexión', error);
    } finally {
      setLoading(false);
    }
  };

  const testPhoneNumberIdValidation = () => {
    const testCases = [
      { input: '106540852500791', expected: true, name: 'Phone Number ID válido' },
      { input: '+34628904614', expected: false, name: 'Número de teléfono con +' },
      { input: '628 904 614', expected: false, name: 'Número con espacios' },
      { input: '12345', expected: false, name: 'Número muy corto' }
    ];

    testCases.forEach(test => {
      const isValid = validatePhoneNumberId(test.input);
      const status = (isValid === test.expected) ? 'success' : 'error';
      addResult(
        'Validación Phone ID',
        status,
        `${test.name}: ${isValid ? 'Válido' : 'Inválido'}`,
        { input: test.input, expected: test.expected, actual: isValid }
      );
    });
  };

  const validatePhoneNumberId = (phoneId: string): boolean => {
    if (!phoneId || phoneId.length === 0) return false;
    if (phoneId.includes('+') || phoneId.includes(' ') || phoneId.includes('-')) return false;
    if (phoneId.length < 10) return false;
    if (!/^\d+$/.test(phoneId)) return false;
    return true;
  };

  const testPhoneNumberFormatting = () => {
    const testCases = [
      { input: '628904614', expected: '34628904614', name: 'Número español 9 dígitos' },
      { input: '+34628904614', expected: '34628904614', name: 'Número español con +34' },
      { input: '+1 555 832 7331', expected: '15558327331', name: 'Número USA con formato' },
      { input: TEST_PHONE, expected: '15558327331', name: 'Número de prueba' }
    ];

    testCases.forEach(test => {
      const formatted = formatPhoneNumber(test.input);
      const status = (formatted === test.expected) ? 'success' : 'error';
      addResult(
        'Formato de Número',
        status,
        `${test.name}: ${formatted}`,
        { input: test.input, expected: test.expected, actual: formatted }
      );
    });
  };

  const formatPhoneNumber = (phone: string): string => {
    let cleaned = phone.replace(/[^\d+]/g, '');
    cleaned = cleaned.replace('+', '');
    if (cleaned.length === 9 && !cleaned.startsWith('34')) {
      cleaned = '34' + cleaned;
    }
    return cleaned;
  };

  const runAllTests = async () => {
    setTestResults([]);
    addResult('Test Suite', 'success', 'Iniciando batería de pruebas...', null);
    
    // Pruebas de validación
    testPhoneNumberIdValidation();
    testPhoneNumberFormatting();
    
    // Pruebas de configuración
    await checkWhatsAppConfig();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Panel de Testing
          </CardTitle>
          <CardDescription>
            Herramientas de prueba para validar la configuración e integraciones del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button onClick={runAllTests} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Ejecutar Todas las Pruebas
            </Button>
            <Button variant="outline" onClick={() => setTestResults([])}>
              Limpiar Resultados
            </Button>
          </div>

          <Tabs defaultValue="whatsapp">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="results">Resultados</TabsTrigger>
            </TabsList>

            <TabsContent value="whatsapp" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pruebas de WhatsApp</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Estado de configuración */}
                  <div>
                    <Button onClick={checkWhatsAppConfig} disabled={loading} variant="outline" className="w-full">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Verificar Configuración
                    </Button>
                    
                    {whatsappStatus && (
                      <Alert className="mt-2">
                        <AlertDescription>
                          {whatsappStatus.configured ? (
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                              <span>Configurado desde: {whatsappStatus.source}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-amber-600" />
                              <span>{whatsappStatus.message}</span>
                            </div>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {/* Pruebas de validación */}
                  <div className="space-y-2">
                    <Button onClick={testPhoneNumberIdValidation} disabled={loading} variant="outline" className="w-full">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Test: Validación de Phone Number ID
                    </Button>
                    
                    <Button onClick={testPhoneNumberFormatting} disabled={loading} variant="outline" className="w-full">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Test: Formato de Números
                    </Button>
                  </div>

                  {/* Envío de mensaje de prueba */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Número de Prueba:</label>
                    <div className="flex gap-2">
                      <Input
                        value={testData.whatsapp.phone}
                        onChange={(e) => setTestData({
                          ...testData,
                          whatsapp: { ...testData.whatsapp, phone: e.target.value }
                        })}
                        placeholder="+15558327331"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(TEST_PHONE)}
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mensaje de Prueba:</label>
                    <Textarea
                      value={testData.whatsapp.message}
                      onChange={(e) => setTestData({
                        ...testData,
                        whatsapp: { ...testData.whatsapp, message: e.target.value }
                      })}
                      rows={6}
                    />
                  </div>

                  <Button onClick={sendTestWhatsApp} disabled={loading} className="w-full">
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Mensaje de Prueba
                  </Button>

                  <Alert>
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>
                      <strong>Importante:</strong> El número {TEST_PHONE} debe estar registrado como "número de prueba" en tu configuración de WhatsApp Business API para recibir mensajes del número sandbox.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="email" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pruebas de Email</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>
                      Las pruebas de email requieren que tengas configurado al menos un proveedor (Resend, SendGrid, o Mailgun).
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email de Prueba:</label>
                    <Input
                      value={testData.email.to}
                      onChange={(e) => setTestData({
                        ...testData,
                        email: { ...testData.email, to: e.target.value }
                      })}
                      placeholder="pruebas@ejemplo.com"
                      type="email"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Asunto:</label>
                    <Input
                      value={testData.email.subject}
                      onChange={(e) => setTestData({
                        ...testData,
                        email: { ...testData.email, subject: e.target.value }
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Contenido HTML:</label>
                    <Textarea
                      value={testData.email.body}
                      onChange={(e) => setTestData({
                        ...testData,
                        email: { ...testData.email, body: e.target.value }
                      })}
                      rows={6}
                    />
                  </div>

                  <Button disabled className="w-full">
                    <Mail className="w-4 h-4 mr-2" />
                    Enviar Email de Prueba (Próximamente)
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="results" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resultados de Pruebas</CardTitle>
                  <CardDescription>
                    Últimos {testResults.length} resultados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {testResults.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      No hay resultados aún. Ejecuta algunas pruebas para ver los resultados aquí.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {testResults.map((result, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border ${
                            result.status === 'success'
                              ? 'bg-green-50 border-green-200'
                              : result.status === 'error'
                              ? 'bg-red-50 border-red-200'
                              : 'bg-amber-50 border-amber-200'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {result.status === 'success' ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            ) : result.status === 'error' ? (
                              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs">
                                  {result.test}
                                </Badge>
                                <span className="text-xs text-gray-500">{result.timestamp}</span>
                              </div>
                              <p className="text-sm font-medium">{result.message}</p>
                              {result.details && (
                                <details className="mt-2">
                                  <summary className="text-xs text-gray-600 cursor-pointer">
                                    Ver detalles
                                  </summary>
                                  <pre className="text-xs bg-white p-2 rounded mt-1 overflow-x-auto">
                                    {JSON.stringify(result.details, null, 2)}
                                  </pre>
                                </details>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Información de configuración */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Información de Configuración de Prueba</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">WhatsApp</h4>
              <dl className="text-sm space-y-1">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Número de prueba:</dt>
                  <dd className="font-mono">{TEST_PHONE}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Número limpio:</dt>
                  <dd className="font-mono">15558327331</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Phone ID ejemplo:</dt>
                  <dd className="font-mono text-xs">106540852500791</dd>
                </div>
              </dl>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Email</h4>
              <dl className="text-sm space-y-1">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Email de prueba:</dt>
                  <dd className="font-mono text-xs">{TEST_EMAIL}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Proveedores:</dt>
                  <dd>Resend, SendGrid, Mailgun</dd>
                </div>
              </dl>
            </div>
          </div>

          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription className="text-xs">
              <strong>Nota:</strong> Este panel de testing está diseñado para desarrollo y pruebas. 
              En producción, deberías ocultar o proteger este panel con autenticación adecuada.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}