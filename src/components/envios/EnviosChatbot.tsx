import { Bot, Send } from 'lucide-react';

interface EnviosChatbotProps {
  chatbotMessages: any[];
  chatbotInput: string;
  setChatbotInput: (s: string) => void;
  isProcessing: boolean;
  enviarMensajeChatbot: () => void;
}

export function EnviosChatbot({ chatbotMessages, chatbotInput, setChatbotInput, isProcessing, enviarMensajeChatbot }: EnviosChatbotProps) {
  return (
    <div className="flex flex-col h-[600px]">
      <div className="bg-purple-600 text-white p-4 rounded-t-lg">
        <h3 className="font-bold flex items-center gap-2">
          <Bot className="w-5 h-5" />
          Asistente Virtual con IA
        </h3>
        <p className="text-sm opacity-90">Interacción automatizada con clientes</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
        {chatbotMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 shadow-sm'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-1">
                  <Bot className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-semibold text-purple-600">Asistente</span>
                </div>
              )}
              {msg.content}
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-2 text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                <span>Procesando...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-200 rounded-b-lg">
        <div className="flex gap-2">
          <input
            type="text"
            value={chatbotInput}
            onChange={(e) => setChatbotInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && enviarMensajeChatbot()}
            placeholder="Pregunta algo al asistente..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            disabled={isProcessing}
          />
          <button
            onClick={enviarMensajeChatbot}
            disabled={!chatbotInput.trim() || isProcessing}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          💡 El asistente puede ayudarte con información sobre eventos, disponibilidad y consultas generales
        </p>
      </div>
    </div>
  );
}
