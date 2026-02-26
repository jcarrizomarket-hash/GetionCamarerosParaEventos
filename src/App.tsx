import { AppProvider } from './context/AppContext';
import { MainLayout } from './components/layout/MainLayout';

// Aplicación de Gestión de Camareros para Eventos v2.2
// Última actualización: Migración a Context API + useReducer (FASE 2)
export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}