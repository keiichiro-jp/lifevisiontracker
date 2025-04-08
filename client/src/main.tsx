import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Root element
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

// Create root and render app
createRoot(rootElement).render(<App />);
