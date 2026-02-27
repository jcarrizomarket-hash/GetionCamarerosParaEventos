import { logger } from '../utils/logger';

interface AdminProps {
  coordinadores: any[];
  setCoordinadores: (coordinadores: any[]) => void;
  baseUrl: string;
  publicAnonKey: string;
  cargarDatos: () => void;
  camareros: any[];
  pedidos: any[];
}

export function Admin({ coordinadores, setCoordinadores, baseUrl, publicAnonKey, cargarDatos, camareros, pedidos }: AdminProps) {
  logger.info('Admin panel rendered');

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Panel de Administración</h2>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow">
          <h3 className="text-lg font-semibold">Camareros</h3>
          <p className="text-3xl font-bold text-blue-600">{camareros.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <h3 className="text-lg font-semibold">Pedidos</h3>
          <p className="text-3xl font-bold text-green-600">{pedidos.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <h3 className="text-lg font-semibold">Coordinadores</h3>
          <p className="text-3xl font-bold text-purple-600">{coordinadores.length}</p>
        </div>
      </div>
    </div>
  );
}
