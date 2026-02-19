import { useState } from 'react';
import { Send, CheckCircle, XCircle, AlertCircle, Loader, MessageCircle, Users, Phone } from 'lucide-react';

interface WhatsAppTestProps {
  baseUrl: string;
  publicAnonKey: string;
  camareros: any[];
  coordinadores: any[];
  pedidos: any[];
}

export function WhatsAppTest({ baseUrl, publicAnonKey, camareros, coordinadores, pedidos }: WhatsAppTestProps) {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [testing, setTesting] = useState(false);
  const [telefonoTest, setTelefonoTest] = useState('');
  const [mensajeTest, setMensajeTest] = useState('Hola! Este es un mensaje de prueba de WhatsApp Business API. ✅');

  const addTestResult = (test: string, status: 'success' | 'error' | 'warning' | 'info', message: string, details?: any) => {
    setTestResults(prev => [...prev, {
      test,
      status,
      message,
      details,
      timestamp: new Date().toISOString()
    }]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  // Test 1: Verificar configuración
  const testConfiguracion = async () => {
    addTestResult('Configuración', 'info', 'Verificando configuración de WhatsApp Business API...');
    
    try {
      const response = await fetch(`${baseUrl}/verificar-whatsapp-config`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`
        }
      });
      
      const result = await response.json();
      
      if (result.configured) {
        addTestResult(
          'Configuración',
          'success',
          '✅ WhatsApp Business API está configurado correctamente',
          {
            phoneId: result.phoneId,
            hasToken: result.hasToken,
            tokenLength: result.tokenLength,
            configSource: result.configSource
          }
        );
        return true;
      } else {
        addTestResult(
          'Configuración',
          'error',
          '❌ WhatsApp Business API NO está configurado',
          {
            error: result.error,
            configSource: result.configSource
          }
        );
        return false;
      }
    } catch (error) {
      addTestResult(
        'Configuración',
        'error',
        '❌ Error al verificar configuración',
        { error: String(error) }
      );
      return false;
    }
  };

  // Test 2: Enviar mensaje de prueba
  const testEnvioMensaje = async () => {
    if (!telefonoTest) {
      addTestResult('Envío Mensaje', 'error', '❌ Debes ingresar un número de teléfono');
      return false;
    }

    addTestResult('Envío Mensaje', 'info', `Enviando mensaje de prueba a ${telefonoTest}...`);
    
    try {
      const response = await fetch(`${baseUrl}/enviar-whatsapp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          telefono: telefonoTest,
          mensaje: mensajeTest
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        addTestResult(
          'Envío Mensaje',
          'success',
          `✅ Mensaje enviado exitosamente a ${telefonoTest}`,
          {
            messageId: result.messageId,
            response: result.data
          }
        );
        return true;
      } else {
        addTestResult(
          'Envío Mensaje',
          'error',
          `❌ Error al enviar mensaje: ${result.error}`,
          {
            error: result.error,
            debugInfo: result.debugInfo,
            needsConfiguration: result.needsConfiguration
          }
        );
        return false;
      }
    } catch (error) {
      addTestResult(
        'Envío Mensaje',
        'error',
        '❌ Error de conexión al enviar mensaje',
        { error: String(error) }
      );
      return false;
    }
  };

  // Test 3: Verificar endpoint de confirmación
  const testEndpointConfirmacion = async () => {
    addTestResult('Endpoint Confirmación', 'info', 'Verificando que los endpoints de confirmación estén disponibles...');
    
    try {
      // Intentar acceder a un token inexistente (debería devolver error amigable)
      const response = await fetch(`${baseUrl}/confirmar/test-token-12345`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`
        }
      });
      
      // Verificar que el endpoint responde (aunque sea con error)
      if (response.ok || response.status === 404) {
        addTestResult(
          'Endpoint Confirmación',
          'success',
          '✅ Endpoints de confirmación están disponibles',
          { status: response.status }
        );
        return true;
      } else {
        addTestResult(
          'Endpoint Confirmación',
          'warning',
          '⚠️ Respuesta inesperada del endpoint de confirmación',
          { status: response.status }
        );
        return false;
      }
    } catch (error) {
      addTestResult(
        'Endpoint Confirmación',
        'error',
        '❌ Error al verificar endpoint de confirmación',
        { error: String(error) }
      );
      return false;
    }
  };

  // Test 4: Verificar guardado de tokens
  const testGuardarToken = async () => {
    addTestResult('Guardar Token', 'info', 'Verificando sistema de guardado de tokens de confirmación...');
    
    try {
      const testToken = `test-token-${Date.now()}`;
      const response = await fetch(`${baseUrl}/guardar-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          token: testToken,
          pedidoId: 'test-pedido',
          camareroId: 'test-camarero',
          coordinadorId: 'test-coordinador'
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        addTestResult(
          'Guardar Token',
          'success',
          '✅ Sistema de tokens de confirmación funciona correctamente',
          { token: testToken }
        );
        return true;
      } else {
        addTestResult(
          'Guardar Token',
          'error',
          `❌ Error al guardar token: ${result.error}`,
          result
        );
        return false;
      }
    } catch (error) {
      addTestResult(
        'Guardar Token',
        'error',
        '❌ Error al verificar sistema de tokens',
        { error: String(error) }
      );
      return false;
    }
  };

  // Test 5: Verificar endpoints de chat grupal
  const testChatGrupal = async () => {
    addTestResult('Chat Grupal', 'info', 'Verificando sistema de chats grupales...');
    
    if (coordinadores.length === 0) {
      addTestResult('Chat Grupal', 'warning', '⚠️ No hay coordinadores para probar chats');
      return false;
    }

    const coordinadorId = coordinadores[0].id;
    
    try {
      const response = await fetch(`${baseUrl}/chats/${coordinadorId}`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        addTestResult(
          'Chat Grupal',
          'success',
          `✅ Sistema de chats grupales funciona correctamente`,
          {
            totalChats: result.data?.length || 0,
            chats: result.data
          }
        );
        return true;
      } else {
        addTestResult(
          'Chat Grupal',
          'error',
          `❌ Error al verificar chats: ${result.error}`,
          result
        );
        return false;
      }
    } catch (error) {
      addTestResult(
        'Chat Grupal',
        'error',
        '❌ Error al verificar sistema de chats',
        { error: String(error) }
      );
      return false;
    }
  };

  // Test 6: Estadísticas del sistema
  const testEstadisticas = async () => {
    addTestResult('Estadísticas', 'info', 'Recopilando estadísticas del sistema...');
    
    try {
      const camarerosSinTelefono = camareros.filter(c => !c.telefono);
      const camarerosConTelefono = camareros.filter(c => c.telefono);
      const coordinadoresSinTelefono = coordinadores.filter(c => !c.telefono);
      const coordinadoresConTelefono = coordinadores.filter(c => c.telefono);
      
      const pedidosConAsignaciones = pedidos.filter(p => p.asignaciones?.length > 0);
      const totalAsignaciones = pedidos.reduce((sum, p) => sum + (p.asignaciones?.length || 0), 0);
      const asignacionesConfirmadas = pedidos.reduce((sum, p) => {
        return sum + (p.asignaciones?.filter(a => a.estado === 'confirmado').length || 0);
      }, 0);
      const asignacionesEnviadas = pedidos.reduce((sum, p) => {
        return sum + (p.asignaciones?.filter(a => a.estado === 'enviado').length || 0);
      }, 0);

      const stats = {
        camareros: {
          total: camareros.length,
          conTelefono: camarerosConTelefono.length,
          sinTelefono: camarerosSinTelefono.length,
          porcentajeConTelefono: camareros.length > 0 ? ((camarerosConTelefono.length / camareros.length) * 100).toFixed(1) : 0
        },
        coordinadores: {
          total: coordinadores.length,
          conTelefono: coordinadoresConTelefono.length,
          sinTelefono: coordinadoresSinTelefono.length
        },
        pedidos: {
          total: pedidos.length,
          conAsignaciones: pedidosConAsignaciones.length,
          totalAsignaciones,
          confirmadas: asignacionesConfirmadas,
          enviadas: asignacionesEnviadas,
          pendientes: totalAsignaciones - asignacionesConfirmadas - asignacionesEnviadas
        }
      };

      let warnings = [];
      if (camarerosSinTelefono.length > 0) {
        warnings.push(`${camarerosSinTelefono.length} camarero(s) sin teléfono configurado`);
      }
      if (coordinadoresSinTelefono.length > 0) {
        warnings.push(`${coordinadoresSinTelefono.length} coordinador(es) sin teléfono configurado`);
      }

      addTestResult(
        'Estadísticas',
        warnings.length > 0 ? 'warning' : 'success',
        warnings.length > 0 
          ? `⚠️ Sistema operativo con advertencias: ${warnings.join(', ')}`
          : '✅ Sistema completamente operativo',
        stats
      );
      
      return true;
    } catch (error) {
      addTestResult(
        'Estadísticas',
        'error',
        '❌ Error al recopilar estadísticas',
        { error: String(error) }
      );
      return false;
    }
  };

  // Ejecutar todos los tests
  const runAllTests = async () => {
    setTesting(true);
    clearResults();
    
    addTestResult('Inicio', 'info', '🚀 Iniciando batería completa de tests de WhatsApp Business API...');
    
    // Test 1: Configuración
    const configOk = await testConfiguracion();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Test 2: Guardar Token
    await testGuardarToken();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Test 3: Endpoint Confirmación
    await testEndpointConfirmacion();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Test 4: Chat Grupal
    await testChatGrupal();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Test 5: Estadísticas
    await testEstadisticas();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Test 6: Envío (solo si configuración está OK)
    if (configOk && telefonoTest) {
      await new Promise(resolve => setTimeout(resolve, 500));
      await testEnvioMensaje();
    }
    
    addTestResult('Finalizado', 'success', '🎉 Batería de tests completada');
    setTesting(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'info':
        return <Loader className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-orange-50 border-orange-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <MessageCircle className="w-8 h-8" />
          <h2 className="text-2xl font-bold">Test Completo WhatsApp Business API</h2>
        </div>
        <p className="text-green-100">
          Prueba todos los componentes del sistema de mensajería automática
        </p>
      </div>

      {/* Panel de Configuración del Test */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Phone className="w-5 h-5" />
          Configuración del Test de Envío
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de teléfono para prueba (con código de país)
            </label>
            <input
              type="text"
              value={telefonoTest}
              onChange={(e) => setTelefonoTest(e.target.value)}
              placeholder="Ejemplo: 34612345678 o 34 612 345 678"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Formato: código de país + número (sin +). Ejemplo: 34612345678 para España
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mensaje de prueba
            </label>
            <textarea
              value={mensajeTest}
              onChange={(e) => setMensajeTest(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex gap-3">
        <button
          onClick={runAllTests}
          disabled={testing}
          className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
        >
          {testing ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Ejecutando tests...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Ejecutar Todos los Tests
            </>
          )}
        </button>

        {testResults.length > 0 && (
          <button
            onClick={clearResults}
            disabled={testing}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            Limpiar Resultados
          </button>
        )}
      </div>

      {/* Tests Individuales */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tests Individuales</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={testConfiguracion}
            disabled={testing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 text-sm"
          >
            Test Configuración
          </button>
          <button
            onClick={testGuardarToken}
            disabled={testing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 text-sm"
          >
            Test Tokens
          </button>
          <button
            onClick={testEndpointConfirmacion}
            disabled={testing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 text-sm"
          >
            Test Confirmación
          </button>
          <button
            onClick={testChatGrupal}
            disabled={testing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 text-sm"
          >
            Test Chat Grupal
          </button>
          <button
            onClick={testEstadisticas}
            disabled={testing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 text-sm"
          >
            Test Estadísticas
          </button>
          <button
            onClick={testEnvioMensaje}
            disabled={testing || !telefonoTest}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 text-sm"
          >
            Test Envío Mensaje
          </button>
        </div>
      </div>

      {/* Resultados */}
      {testResults.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Resultados ({testResults.length})
          </h3>
          
          <div className="space-y-3">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getStatusIcon(result.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">{result.test}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(result.timestamp).toLocaleTimeString('es-ES')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{result.message}</p>
                    
                    {result.details && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                          Ver detalles técnicos
                        </summary>
                        <pre className="mt-2 p-3 bg-gray-900 text-gray-100 rounded text-xs overflow-x-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Información de Ayuda */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-semibold text-blue-900 mb-3">📋 Guía de Tests</h4>
        <div className="space-y-2 text-sm text-blue-800">
          <p><strong>Test Configuración:</strong> Verifica que WhatsApp Business API esté configurado con Phone ID y Token</p>
          <p><strong>Test Tokens:</strong> Verifica el sistema de tokens de confirmación para camareros</p>
          <p><strong>Test Confirmación:</strong> Verifica que los endpoints de confirmación estén activos</p>
          <p><strong>Test Chat Grupal:</strong> Verifica el sistema de chats grupales automáticos</p>
          <p><strong>Test Estadísticas:</strong> Recopila información sobre camareros, coordinadores y pedidos</p>
          <p><strong>Test Envío:</strong> Envía un mensaje real de prueba al número configurado (requiere configuración válida)</p>
        </div>
      </div>
    </div>
  );
}
