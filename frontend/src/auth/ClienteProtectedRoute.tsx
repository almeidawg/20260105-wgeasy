// src/auth/ClienteProtectedRoute.tsx
// Rota protegida que redireciona CLIENTES para área exclusiva

import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { supabaseRaw as supabase } from "@/lib/supabaseClient";
import { Loader2 } from "lucide-react";

interface ClienteProtectedRouteProps {
  children: ReactNode;
}

export default function ClienteProtectedRoute({
  children,
}: ClienteProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const [tipoUsuario, setTipoUsuario] = useState<string | null>(null);
  const [pessoaId, setPessoaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verificarTipoUsuario() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Buscar tipo do usuário
        const { data, error } = await supabase
          .from("usuarios")
          .select("tipo_usuario, pessoa_id")
          .eq("auth_user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Erro ao buscar tipo de usuário:", error);
        } else if (data) {
          setTipoUsuario(data.tipo_usuario);
          setPessoaId(data.pessoa_id);
        }
      } catch (e) {
        console.error("Erro ao verificar tipo de usuário:", e);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      verificarTipoUsuario();
    }
  }, [user, authLoading]);

  // Loading
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  // Não logado
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Usuário sem perfil conhecido não deve acessar o sistema
  if (!tipoUsuario) {
    return <Navigate to="/login" replace />;
  }

  // Validar redirecionamentos por tipo de usuário
  // NOTA: MASTER e ADMIN podem acessar todas as áreas, mas ainda passam pela validação
  const isAdminOrMaster = tipoUsuario === "MASTER" || tipoUsuario === "ADMIN";

  if (tipoUsuario === "CLIENTE") {
    const isAreaCliente = location.pathname.startsWith("/wgx");
    if (!isAreaCliente) {
      const redirectUrl = pessoaId ? `/wgx?cliente_id=${pessoaId}` : "/wgx";
      return <Navigate to={redirectUrl} replace />;
    }
  }

  if (tipoUsuario === "FORNECEDOR") {
    const isFornecedor = location.pathname.startsWith("/fornecedor");
    if (!isFornecedor && !isAdminOrMaster) {
      return <Navigate to="/fornecedor" replace />;
    }
  }

  if (tipoUsuario === "COLABORADOR") {
    const isColaborador = location.pathname.startsWith("/colaborador");
    if (!isColaborador && !isAdminOrMaster) {
      return <Navigate to="/colaborador" replace />;
    }
  }

  if (tipoUsuario === "JURIDICO") {
    const isJuridico = location.pathname.startsWith("/juridico");
    if (!isJuridico && !isAdminOrMaster) {
      return <Navigate to="/juridico" replace />;
    }
  }

  if (tipoUsuario === "FINANCEIRO") {
    const isFinanceiro = location.pathname.startsWith("/financeiro");
    if (!isFinanceiro && !isAdminOrMaster) {
      return <Navigate to="/financeiro" replace />;
    }
  }

  if (tipoUsuario === "ESPECIFICADOR") {
    const isEspecificador = location.pathname.startsWith("/especificador");
    if (!isEspecificador && !isAdminOrMaster) {
      return <Navigate to="/especificador" replace />;
    }
  }

  return children;
}

// Rota exclusiva para clientes - só permite acesso de CLIENTES
// Verifica também se o cliente já confirmou seus dados (NO BANCO DE DADOS)
export function ClienteOnlyRoute({ children }: ClienteProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const [tipoUsuario, setTipoUsuario] = useState<string | null>(null);
  const [pessoaId, setPessoaId] = useState<string | null>(null);
  const [dadosConfirmados, setDadosConfirmados] = useState<boolean | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verificarTipoUsuario() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Buscar tipo do usuário E status de confirmação de dados do BANCO
        const { data, error } = await supabase
          .from("usuarios")
          .select("tipo_usuario, pessoa_id, dados_confirmados")
          .eq("auth_user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Erro ao buscar tipo de usuário:", error);
        } else if (data) {
          setTipoUsuario(data.tipo_usuario);
          setPessoaId(data.pessoa_id);

          // Verificar se os dados foram confirmados (BANCO DE DADOS - mais seguro)
          if (data.pessoa_id && data.tipo_usuario === "CLIENTE") {
            // Prioriza o banco de dados, fallback para localStorage (migração)
            const confirmadoBanco = (data as any).dados_confirmados;
            if (confirmadoBanco !== undefined && confirmadoBanco !== null) {
              setDadosConfirmados(confirmadoBanco === true);
            } else {
              // Fallback: verificar localStorage (para clientes que confirmaram antes da migração)
              const confirmadoLocal = localStorage.getItem(
                `dados_confirmados_${data.pessoa_id}`
              );
              setDadosConfirmados(confirmadoLocal === "true");
            }
          } else {
            // Não é cliente, não precisa confirmar
            setDadosConfirmados(true);
          }
        }
      } catch (e) {
        console.error("Erro ao verificar tipo de usuário:", e);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      verificarTipoUsuario();
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se é CLIENTE e ainda não confirmou os dados, redirecionar para confirmação
  // Exceto se já estiver na página de confirmação
  const isConfirmacaoPage = location.pathname === "/wgx/confirmar-dados";

  if (
    tipoUsuario === "CLIENTE" &&
    dadosConfirmados === false &&
    !isConfirmacaoPage
  ) {
    return <Navigate to="/wgx/confirmar-dados" replace />;
  }

  // Admins e colaboradores também podem acessar (para suporte)
  // Mas clientes só veem a área deles
  return children;
}
