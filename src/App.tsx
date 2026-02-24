import { ErrorBoundary } from './components/ErrorBoundary';
import { AppProvider } from './context/AppContext';
import { AppLayout } from './components/AppLayout';

// Aplicación de Gestión de Camareros para Eventos v2.1
export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppLayout />
      </AppProvider>
    </ErrorBoundary>
  );
}