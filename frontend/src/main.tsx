import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import { AuthProvider } from "@/auth/AuthContext";
import { ToastProvider } from "@/components/ui/ToastProvider";

// SEGURANÇA: Desativa console.log em produção
import { disableConsoleInProduction } from "@/lib/logger";
disableConsoleInProduction();

// Utilitários para admin (disponíveis no console)
import { mesclarPessoas } from "@/lib/pessoasApi";

// Expor função de merge para uso no console do navegador
declare global {
  interface Window {
    mesclarPessoas: typeof mesclarPessoas;
  }
}
window.mesclarPessoas = mesclarPessoas;

// Fonts carregadas via Google Fonts (index.html). Removido @fontsource para evitar erros 404/OTS.
// import "@fontsource/oswald";
// import "@fontsource/poppins";

// Tailwind
import "@/index.css";

// Estilos do sistema
import "@/styles/wg-system.css";
import "@/styles/wg-sidebar.css";
import "@/styles/layout.css";
import "@/styles/touch-targets.css";

const root = document.getElementById("root")!;

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <ToastProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ToastProvider>
  </React.StrictMode>
);
