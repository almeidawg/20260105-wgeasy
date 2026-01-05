// src/layout/ClienteLayout.tsx
// Layout exclusivo para clientes - SEM SIDEBAR
import { Outlet } from "react-router-dom";

export default function ClienteLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Área do cliente sem sidebar - tela cheia */}
      <main className="w-full">
        <Outlet />
      </main>
    </div>
  );
}
