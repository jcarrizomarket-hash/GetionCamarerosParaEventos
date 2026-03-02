import { Send, Users } from 'lucide-react';

interface EnviosCoordinadoresProps {
  coordinadores: any[];
}

export function EnviosCoordinadores({ coordinadores }: EnviosCoordinadoresProps) {
  return (
    <div className="flex flex-col h-[600px]">
      <div className="bg-green-600 text-white p-4 rounded-t-lg">
        <h3 className="font-bold flex items-center gap-2">
          <Users className="w-5 h-5" />
          Chat de Coordinadores
        </h3>
        <p className="text-sm opacity-90">{coordinadores.length} coordinadores activos</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="text-center text-gray-500 py-8">
          Chat grupal para comunicación interna entre coordinadores
        </div>
      </div>

      <div className="p-4 bg-white border-t border-gray-200 rounded-b-lg">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Mensaje para coordinadores..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
          <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
