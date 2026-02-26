import { createContext, useContext, useReducer, type ReactNode } from 'react';

// ─── State ───────────────────────────────────────────────────────────────────

export interface AppState {
  camareros: any[];
  pedidos: any[];
  coordinadores: any[];
  clientes: any[];
  loading: boolean;
  error: string | null;
}

const initialState: AppState = {
  camareros: [],
  pedidos: [],
  coordinadores: [],
  clientes: [],
  loading: false,
  error: null,
};

// ─── Actions ─────────────────────────────────────────────────────────────────

export type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CAMAREROS'; payload: any[] }
  | { type: 'SET_PEDIDOS'; payload: any[] }
  | { type: 'SET_COORDINADORES'; payload: any[] }
  | { type: 'SET_CLIENTES'; payload: any[] }
  | { type: 'SET_ALL_DATA'; payload: Omit<AppState, 'loading' | 'error'> };

// ─── Reducer ─────────────────────────────────────────────────────────────────

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_CAMAREROS':
      return { ...state, camareros: action.payload };
    case 'SET_PEDIDOS':
      return { ...state, pedidos: action.payload };
    case 'SET_COORDINADORES':
      return { ...state, coordinadores: action.payload };
    case 'SET_CLIENTES':
      return { ...state, clientes: action.payload };
    case 'SET_ALL_DATA':
      return {
        ...state,
        camareros: action.payload.camareros,
        pedidos: action.payload.pedidos,
        coordinadores: action.payload.coordinadores,
        clientes: action.payload.clientes,
      };
    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// ─── Main hook ───────────────────────────────────────────────────────────────

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

// ─── Specialized hooks ───────────────────────────────────────────────────────

export function usePedidos() {
  const { state, dispatch } = useAppContext();
  return {
    pedidos: state.pedidos,
    loading: state.loading,
    setPedidos: (pedidos: any[]) => dispatch({ type: 'SET_PEDIDOS', payload: pedidos }),
  };
}

export function useCamareros() {
  const { state, dispatch } = useAppContext();
  return {
    camareros: state.camareros,
    loading: state.loading,
    setCamareros: (camareros: any[]) => dispatch({ type: 'SET_CAMAREROS', payload: camareros }),
  };
}

export function useCoordinadores() {
  const { state, dispatch } = useAppContext();
  return {
    coordinadores: state.coordinadores,
    loading: state.loading,
    setCoordinadores: (coordinadores: any[]) =>
      dispatch({ type: 'SET_COORDINADORES', payload: coordinadores }),
  };
}

export function useClientes() {
  const { state, dispatch } = useAppContext();
  return {
    clientes: state.clientes,
    loading: state.loading,
    setClientes: (clientes: any[]) => dispatch({ type: 'SET_CLIENTES', payload: clientes }),
  };
}
