
  import React from "react";
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import { ErrorBoundary } from "./components/error-boundary";
  import { setupGlobalErrorHandlers } from "./utils/error-logger";
  import "./index.css";

  // Setup global error handlers
  setupGlobalErrorHandlers();

  createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <ErrorBoundary section="app">
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
  