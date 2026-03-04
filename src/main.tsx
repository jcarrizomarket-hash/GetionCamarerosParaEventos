
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";
  import { validateRequiredEnvVars } from "./config/env";

  validateRequiredEnvVars();

  createRoot(document.getElementById("root")!).render(<App />);
  