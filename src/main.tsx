import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ErrorBoundary } from "./components/error-boundary.tsx";
import { logger, setLogLevel } from "./src/utils/logger.ts";

// Initialize logger: verbose in development, errors-only in production
const isDev = import.meta.env.DEV;
setLogLevel(isDev ? "debug" : "error");
logger.info("Application starting", { env: isDev ? "development" : "production" });

// Global handler for uncaught JavaScript errors
window.onerror = (message, source, lineno, colno, error) => {
  logger.error("Uncaught error", {
    message: String(message),
    source: source ?? undefined,
    lineno: lineno ?? undefined,
    colno: colno ?? undefined,
    stack: error?.stack ?? undefined,
  });
};

// Global handler for unhandled promise rejections
window.onunhandledrejection = (event: PromiseRejectionEvent) => {
  logger.error("Unhandled promise rejection", {
    reason: event.reason instanceof Error ? event.reason.message : String(event.reason),
    stack: event.reason instanceof Error ? event.reason.stack : undefined,
  });
};

/** Fallback UI for the root error boundary. Uses only inline styles so it
 *  works even if CSS fails to load. */
function RootFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "2rem",
        fontFamily: "system-ui, sans-serif",
        background: "#fff5f5",
      }}
    >
      <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
      <h1 style={{ color: "#c53030", marginBottom: "0.5rem" }}>
        La aplicación encontró un error
      </h1>
      <p style={{ color: "#742a2a", marginBottom: "1rem", maxWidth: "480px", textAlign: "center" }}>
        {isDev ? error.message : "Ha ocurrido un error inesperado. Por favor, recarga la página."}
      </p>
      {isDev && error.stack && (
        <pre
          style={{
            background: "#fff",
            border: "1px solid #fc8181",
            borderRadius: "4px",
            padding: "1rem",
            fontSize: "0.75rem",
            maxWidth: "640px",
            overflowX: "auto",
            marginBottom: "1rem",
            color: "#742a2a",
          }}
        >
          {error.stack}
        </pre>
      )}
      <button
        onClick={reset}
        style={{
          padding: "0.5rem 1.5rem",
          background: "#c53030",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "1rem",
        }}
      >
        Intentar de nuevo
      </button>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary fallback={(error, reset) => <RootFallback error={error} reset={reset} />}>
    <App />
  </ErrorBoundary>
);
  