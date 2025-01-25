import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "@/App.tsx";
import Navbar from "@/components/ui/navbar.tsx";
import { DotPattern } from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Navbar />

    <App />

    <DotPattern
      cy={1}
      cr={1}
      cx={1}
      className={cn(
        "[mask-image:radial-gradient(400px_circle_at_center,white,transparent)]"
      )}
    />
  </StrictMode>
);
