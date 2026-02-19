import { useState } from 'react';
import { Building2, Briefcase, CalendarDays } from 'lucide-react';
import { Clientes } from './clientes';
import { EntradaPedidos } from './entrada-pedidos';
import { GestionPedidos } from './gestion-pedidos';

interface PedidosProps {
  pedidos: any[];
  setPedidos: (pedidos: any[]) => void;
  camareros: any[];
  coordinadores: any[];
  clientes: any[];
  setClientes: (clientes: any[]) => void;
  baseUrl: string;
  publicAnonKey: string;
  cargarDatos: () => void;
}

export function Pedidos({ 
  pedidos, 
  setPedidos, 
  camareros,
  coordinadores,
  clientes,
  setClientes,
  baseUrl, 
  publicAnonKey, 
  cargarDatos 
}: PedidosProps) {
  const [activeSubTab, setActiveSubTab] = useState('clientes');

  // FIX: Eliminada la doble carga de clientes — recibidos desde el estado global de App.tsx

  const subTabs = [
    { id: 'clientes', label: 'Clientes', icon: Building2 },
    { id: 'entrada-pedidos', label: 'Entrada de Pedidos', icon: Briefcase },
    { id: 'gestion-pedidos', label: 'Gestión de Pedidos', icon: CalendarDays }
  ];

  return (
    <div className="space-y-6">
      {/* Sub-pestañas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap flex-1 justify-center ${
                  activeSubTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Contenido de sub-pestañas */}
        <div className="p-6">
          {activeSubTab === 'clientes' && (
            <Clientes
              clientes={clientes}
              setClientes={setClientes}
              baseUrl={baseUrl}
              publicAnonKey={publicAnonKey}
              cargarDatos={cargarDatos}
            />
          )}

          {activeSubTab === 'entrada-pedidos' && (
            <EntradaPedidos
              clientes={clientes}
              setClientes={setClientes}
              pedidos={pedidos}
              setPedidos={setPedidos}
              camareros={camareros}
              coordinadores={coordinadores}
              baseUrl={baseUrl}
              publicAnonKey={publicAnonKey}
              cargarDatos={cargarDatos}
            />
          )}

          {activeSubTab === 'gestion-pedidos' && (
            <GestionPedidos
              pedidos={pedidos}
              setPedidos={setPedidos}
              camareros={camareros}
              baseUrl={baseUrl}
              publicAnonKey={publicAnonKey}
              cargarDatos={cargarDatos}
            />
          )}
        </div>
      </div>
    </div>
  );
}
