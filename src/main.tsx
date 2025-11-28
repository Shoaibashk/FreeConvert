import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "@/App.tsx";
import Navbar from "@/components/ui/navbar.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <App />
      </main>
    </div>
  </StrictMode>
);
