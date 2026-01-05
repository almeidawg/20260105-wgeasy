import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

interface PublicRouteProps {
  children: ReactNode;
}

/**
 * PublicRoute - Rota pública que redireciona usuários logados
 *
 * Usado para páginas como Login, Signup, Reset Password
 * Se o usuário já estiver autenticado, redireciona para o dashboard
 */
export default function PublicRoute({ children }: PublicRouteProps) {
  const { user, loading } = useAuth();

  // Enquanto carrega, mostra loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Se já está logado, redireciona para home
  if (user) {
    return <Navigate to="/" replace />;
  }

  // Se não está logado, renderiza a página pública
  return <>{children}</>;
}
