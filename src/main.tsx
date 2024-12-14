import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./config/firebase"; // Initialize Firebase first
import "./index.css";
import App from "./App.tsx";

// Wait for Firebase to initialize before rendering
const renderApp = () => {
  const root = document.getElementById("root");
  if (!root) {
    throw new Error("Root element not found");
  }

  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
};

// Ensure Firebase is initialized
renderApp();
