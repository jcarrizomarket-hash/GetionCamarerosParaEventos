import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import {
  Camarero,
  Pedido,
  Coordinador,
  Cliente,
  ApiError,
  LoadingState,
  ErrorState,
} from '../types';
import { createApiClient } from '../api/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { useAuth } from '../hooks/useAuth';
import { toApiError } from '../utils/errorHandler';

const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-25b11ac0`;

interface AppContextType {
  // State
  camareros: Camarero[];
  pedidos: Pedido[];
  coordinadores: Coordinador[];
  clientes: Cliente[];
  loading: LoadingState;
  error: ErrorState;
  activeTab: string;

  // Setters
  setCamareros: (camareros: Camarero[]) => void;
  setPedidos: (pedidos: Pedido[]) => void;
  setCoordinadores: (coordinadores: Coordinador[]) => void;
  setClientes: (clientes: Cliente[]) => void;
  setActiveTab: (tab: string) => void;

  // Data loading
  cargarCamareros: () => Promise<void>;
  cargarPedidos: () => Promise<void>;
  cargarCoordinadores: () => Promise<void>;
  cargarClientes: () => Promise<void>;
  cargarTodosDatos: () => Promise<void>;
}

const initialLoading: LoadingState = {
  camareros: false,
  pedidos: false,
  coordinadores: false,
  clientes: false,
};

const initialError: ErrorState = {
  camareros: null,
  pedidos: null,
  coordinadores: null,
  clientes: null,
};

export const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [camareros, setCamareros] = useState<Camarero[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [coordinadores, setCoordinadores] = useState<Coordinador[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoadingState] = useState<LoadingState>(initialLoading);
  const [error, setErrorState] = useState<ErrorState>(initialError);
  const [activeTab, setActiveTab] = useState('dashboard');

  const { getAuthHeaders } = useAuth();

  const setLoading = useCallback(
    (key: keyof LoadingState, value: boolean) => {
      setLoadingState((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const setError = useCallback(
    (key: keyof ErrorState, err: ApiError | null) => {
      setErrorState((prev) => ({ ...prev, [key]: err }));
    },
    []
  );

  const cargarCamareros = useCallback(async () => {
    setLoading('camareros', true);
    setError('camareros', null);
    try {
      const client = createApiClient(baseUrl, getAuthHeaders().Authorization.replace('Bearer ', ''));
      const res = await client.get<Camarero[]>('/camareros');
      if (res.success && res.data) {
        setCamareros(res.data);
      } else if (res.error) {
        setError('camareros', { code: 'API_ERROR', message: res.error, status: 400 });
      }
    } catch (err: unknown) {
      setError('camareros', toApiError(err));
    } finally {
      setLoading('camareros', false);
    }
  }, [getAuthHeaders, setLoading, setError]);

  const cargarPedidos = useCallback(async () => {
    setLoading('pedidos', true);
    setError('pedidos', null);
    try {
      const client = createApiClient(baseUrl, getAuthHeaders().Authorization.replace('Bearer ', ''));
      const res = await client.get<Pedido[]>('/pedidos');
      if (res.success && res.data) {
        setPedidos(res.data);
      } else if (res.error) {
        setError('pedidos', { code: 'API_ERROR', message: res.error, status: 400 });
      }
    } catch (err: unknown) {
      setError('pedidos', toApiError(err));
    } finally {
      setLoading('pedidos', false);
    }
  }, [getAuthHeaders, setLoading, setError]);

  const cargarCoordinadores = useCallback(async () => {
    setLoading('coordinadores', true);
    setError('coordinadores', null);
    try {
      const client = createApiClient(baseUrl, getAuthHeaders().Authorization.replace('Bearer ', ''));
      const res = await client.get<Coordinador[]>('/coordinadores');
      if (res.success && res.data) {
        setCoordinadores(res.data);
      } else if (res.error) {
        setError('coordinadores', { code: 'API_ERROR', message: res.error, status: 400 });
      }
    } catch (err: unknown) {
      setError('coordinadores', toApiError(err));
    } finally {
      setLoading('coordinadores', false);
    }
  }, [getAuthHeaders, setLoading, setError]);

  const cargarClientes = useCallback(async () => {
    setLoading('clientes', true);
    setError('clientes', null);
    try {
      const client = createApiClient(baseUrl, getAuthHeaders().Authorization.replace('Bearer ', ''));
      const res = await client.get<Cliente[]>('/clientes');
      if (res.success && res.data) {
        setClientes(res.data);
      } else if (res.error) {
        setError('clientes', { code: 'API_ERROR', message: res.error, status: 400 });
      }
    } catch (err: unknown) {
      setError('clientes', toApiError(err));
    } finally {
      setLoading('clientes', false);
    }
  }, [getAuthHeaders, setLoading, setError]);

  const cargarTodosDatos = useCallback(async () => {
    await Promise.all([
      cargarCamareros(),
      cargarPedidos(),
      cargarCoordinadores(),
      cargarClientes(),
    ]);
  }, [cargarCamareros, cargarPedidos, cargarCoordinadores, cargarClientes]);

  return (
    <AppContext.Provider
      value={{
        camareros,
        pedidos,
        coordinadores,
        clientes,
        loading,
        error,
        activeTab,
        setCamareros,
        setPedidos,
        setCoordinadores,
        setClientes,
        setActiveTab,
        cargarCamareros,
        cargarPedidos,
        cargarCoordinadores,
        cargarClientes,
        cargarTodosDatos,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

/**
 * Hook to consume the AppContext. Must be used inside an AppProvider.
 */
export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe usarse dentro de AppProvider');
  }
  return context;
}
