import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add console log to track mounting
console.log("Main.tsx is executing, attempting to mount App");

const rootElement = document.getElementById("root");
if (rootElement) {
  try {
    const root = createRoot(rootElement);
    root.render(<App />);
    console.log("App successfully mounted");
  } catch (error) {
    console.error("Failed to mount App:", error);
  }
} else {
  console.error("Root element not found. DOM may not be fully loaded.");
}
