import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import type {
  Camarero,
  Pedido,
  Coordinador,
  Cliente,
} from '../src/types';
import type {
  ApiError,
  LoadingState,
  ErrorState,
} from '../types';
import { createApiClient } from '../api/client';
import { projectId } from '../utils/supabase/info';
import { useAuth } from '../hooks/useAuth';
import { toApiError } from '../utils/errorHandler';
import { validarCamarero, validarCoordinador } from '../utils/validators';

const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-25b11ac0`;

/** Result type for CRUD operations that run client-side validation first. */
interface MutationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  /** Field-level validation errors, populated before the API call is made. */
  validationErrors?: Record<string, string>;
}

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

  // CRUD operations (validate → API call → update local state)
  crearCamarero: (data: Record<string, string>) => Promise<MutationResult<Camarero>>;
  crearCoordinador: (data: Record<string, string>) => Promise<MutationResult<Coordinador>>;
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

  /**
   * Create a fresh API client using the current auth token.
   * Recreated automatically whenever the auth session changes.
   */
  const apiClient = useMemo(() => {
    const authValue = getAuthHeaders()?.Authorization ?? '';
    const token = authValue.startsWith('Bearer ')
      ? authValue.slice('Bearer '.length)
      : authValue;
    return createApiClient(baseUrl, token);
  }, [getAuthHeaders]);

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
      const res = await apiClient.get<Camarero[]>('/camareros');
      if (res.success && res.data) {
        setCamareros(res.data);
      } else {
        setError('camareros', res.apiError ?? { code: 'API_ERROR', message: res.error ?? 'Error al cargar camareros', status: 400 });
      }
    } catch (err: unknown) {
      setError('camareros', toApiError(err));
    } finally {
      setLoading('camareros', false);
    }
  }, [apiClient, setLoading, setError]);

  const cargarPedidos = useCallback(async () => {
    setLoading('pedidos', true);
    setError('pedidos', null);
    try {
      const res = await apiClient.get<Pedido[]>('/pedidos');
      if (res.success && res.data) {
        setPedidos(res.data);
      } else {
        setError('pedidos', res.apiError ?? { code: 'API_ERROR', message: res.error ?? 'Error al cargar pedidos', status: 400 });
      }
    } catch (err: unknown) {
      setError('pedidos', toApiError(err));
    } finally {
      setLoading('pedidos', false);
    }
  }, [apiClient, setLoading, setError]);

  const cargarCoordinadores = useCallback(async () => {
    setLoading('coordinadores', true);
    setError('coordinadores', null);
    try {
      const res = await apiClient.get<Coordinador[]>('/coordinadores');
      if (res.success && res.data) {
        setCoordinadores(res.data);
      } else {
        setError('coordinadores', res.apiError ?? { code: 'API_ERROR', message: res.error ?? 'Error al cargar coordinadores', status: 400 });
      }
    } catch (err: unknown) {
      setError('coordinadores', toApiError(err));
    } finally {
      setLoading('coordinadores', false);
    }
  }, [apiClient, setLoading, setError]);

  const cargarClientes = useCallback(async () => {
    setLoading('clientes', true);
    setError('clientes', null);
    try {
      const res = await apiClient.get<Cliente[]>('/clientes');
      if (res.success && res.data) {
        setClientes(res.data);
      } else {
        setError('clientes', res.apiError ?? { code: 'API_ERROR', message: res.error ?? 'Error al cargar clientes', status: 400 });
      }
    } catch (err: unknown) {
      setError('clientes', toApiError(err));
    } finally {
      setLoading('clientes', false);
    }
  }, [apiClient, setLoading, setError]);

  const cargarTodosDatos = useCallback(async () => {
    await Promise.all([
      cargarCamareros(),
      cargarPedidos(),
      cargarCoordinadores(),
      cargarClientes(),
    ]);
  }, [cargarCamareros, cargarPedidos, cargarCoordinadores, cargarClientes]);

  /**
   * Validates camarero data using field validators, then creates the record
   * via the API and appends it to local state on success.
   */
  const crearCamarero = useCallback(
    async (data: Record<string, string>): Promise<MutationResult<Camarero>> => {
      const validation = validarCamarero(data);
      if (!validation.isValid) {
        return { success: false, validationErrors: validation.errors };
      }
      try {
        const res = await apiClient.post<Camarero>('/camareros', data);
        if (res.success && res.data) {
          setCamareros((prev) => [...prev, res.data]);
          return { success: true, data: res.data };
        }
        return { success: false, error: res.error ?? 'Error al crear camarero' };
      } catch (err: unknown) {
        return { success: false, error: toApiError(err).message };
      }
    },
    [apiClient]
  );

  /**
   * Validates coordinador data using field validators, then creates the record
   * via the API and appends it to local state on success.
   */
  const crearCoordinador = useCallback(
    async (data: Record<string, string>): Promise<MutationResult<Coordinador>> => {
      const validation = validarCoordinador(data);
      if (!validation.isValid) {
        return { success: false, validationErrors: validation.errors };
      }
      try {
        const res = await apiClient.post<Coordinador>('/coordinadores', data);
        if (res.success && res.data) {
          setCoordinadores((prev) => [...prev, res.data]);
          return { success: true, data: res.data };
        }
        return { success: false, error: res.error ?? 'Error al crear coordinador' };
      } catch (err: unknown) {
        return { success: false, error: toApiError(err).message };
      }
    },
    [apiClient]
  );

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
        crearCamarero,
        crearCoordinador,
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
