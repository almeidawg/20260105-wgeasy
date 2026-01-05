import { ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useUsuarioLogado } from "@/hooks/useUsuarioLogado";

interface Props {
  children?: ReactNode;
}

export default function EspecificadorOnlyRoute({ children }: Props) {
  const { user } = useAuth();
  const { usuario, loading } = useUsuarioLogado();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F25C26]" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const tipoUsuario = usuario?.tipo_usuario;

  if (tipoUsuario === "CLIENTE") {
    return <Navigate to="/wgx" replace />;
  }

  if (tipoUsuario === "FORNECEDOR") {
    return <Navigate to="/fornecedor" replace />;
  }

  if (tipoUsuario === "COLABORADOR") {
    return <Navigate to="/colaborador" replace />;
  }

  if (
    ![
      "ESPECIFICADOR",
      "MASTER",
      "ADMIN",
      "COMERCIAL",
      "ATENDIMENTO",
      "FINANCEIRO",
    ].includes(tipoUsuario || "")
  ) {
    return <Navigate to="/login" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
