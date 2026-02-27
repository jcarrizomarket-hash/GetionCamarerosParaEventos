
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";
  import { logErrorWithContext } from "./src/utils/error-handler";

  // Global handler for uncaught synchronous errors
  window.onerror = (message, source, lineno, colno, error) => {
    logErrorWithContext(error ?? new Error(String(message)), 'window.onerror', {
      source,
      lineno,
      colno,
    });
    return false;
  };

  // Global handler for unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logErrorWithContext(event.reason ?? new Error('Unhandled promise rejection'), 'window.unhandledrejection');
  });

  createRoot(document.getElementById("root")!).render(<App />);
  