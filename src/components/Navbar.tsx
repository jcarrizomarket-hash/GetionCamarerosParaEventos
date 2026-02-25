import React from 'react';
import { LogOut, User } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';

export default function Navbar() {
  const { user, role, logout } = useAuthContext();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <nav className="w-full bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <span className="text-lg font-bold text-gray-800">Gestión de Camareros</span>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-2">
            <User size={18} className="text-gray-500" />
            <div className="text-sm">
              <span className="font-medium text-gray-800">{user.nombre}</span>
              <span className="text-gray-400 mx-1">·</span>
              <span className="text-gray-500">{user.email}</span>
            </div>
            {role === 'Admin' && (
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded">
                ADMIN
              </span>
            )}
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}
