// src/hooks/useUsuarioLogado.ts
// Hook para buscar dados completos do usuário logado

import { useEffect, useState } from "react";
import { useAuth } from "@/auth/AuthContext";
import { supabaseRaw as supabase } from "@/lib/supabaseClient";

export interface UsuarioLogado {
  id: string;
  auth_user_id: string;
  pessoa_id: string | null;
  tipo_usuario: "MASTER" | "ADMIN" | "COMERCIAL" | "ATENDIMENTO" | "COLABORADOR" | "CLIENTE" | "ESPECIFICADOR" | "FORNECEDOR" | "JURIDICO" | "FINANCEIRO";
  ativo: boolean;
  nucleo_id: string | null;
  // Permissões de cliente
  cliente_pode_ver_valores: boolean;
  cliente_pode_ver_cronograma: boolean;
  cliente_pode_ver_documentos: boolean;
  cliente_pode_ver_proposta: boolean;
  cliente_pode_ver_contratos: boolean;
  cliente_pode_fazer_upload: boolean;
  cliente_pode_comentar: boolean;
  // Dados da pessoa
  nome: string | null;
  email: string | null;
  telefone: string | null;
  avatar_url: string | null;
  foto_url: string | null;
  // Campos adicionais para AreaHeader
  cargo: string | null;
  empresa: string | null;
  data_inicio_wg: string | null;
}

export function useUsuarioLogado() {
  const { user, loading: authLoading } = useAuth();
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function buscarUsuario() {
      if (!user) {
        setUsuario(null);
        setLoading(false);
        return;
      }

      try {
        // Buscar usuário pela relação com auth.users
        const { data, error: err } = await supabase
          .from("vw_usuarios_completo")
          .select("*")
          .eq("auth_user_id", user.id)
          .maybeSingle();

        if (err || !data) {
          // Se não encontrou na view, tentar buscar diretamente
          const { data: usuarioData, error: err2 } = await supabase
            .from("usuarios")
            .select(`
              *,
              pessoas:pessoa_id (
                nome,
                email,
                telefone,
                avatar_url,
                foto_url,
                cargo,
                empresa,
                data_inicio_wg
              )
            `)
            .eq("auth_user_id", user.id)
            .maybeSingle();

          if (err2) {
            console.error("Erro ao buscar usuário:", err2);
            setError("Usuário não encontrado no sistema");
            setUsuario(null);
          } else if (usuarioData) {
            const pessoa = usuarioData.pessoas as any;
            // Prioridade: avatar_url > foto_url
            const avatarFinal = pessoa?.avatar_url || pessoa?.foto_url || null;
            setUsuario({
              ...usuarioData,
              nome: pessoa?.nome || null,
              email: pessoa?.email || user.email || null,
              telefone: pessoa?.telefone || null,
              avatar_url: avatarFinal,
              foto_url: pessoa?.foto_url || null,
              cargo: pessoa?.cargo || null,
              empresa: pessoa?.empresa || null,
              data_inicio_wg: pessoa?.data_inicio_wg || null,
            } as UsuarioLogado);
          }
        } else if (data) {
          // Aplicar fallback: avatar_url > foto_url
          const viewData = data as any;
          const avatarFinal = viewData.avatar_url || viewData.foto_url || null;
          setUsuario({
            ...viewData,
            avatar_url: avatarFinal,
            cargo: viewData.cargo || null,
            empresa: viewData.empresa || null,
            data_inicio_wg: viewData.data_inicio_wg || null,
          } as UsuarioLogado);
        }
      } catch (e: any) {
        console.error("Erro ao buscar usuário:", e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      buscarUsuario();
    }
  }, [user, authLoading]);

  // Helpers
  const isMaster = usuario?.tipo_usuario === "MASTER";
  const isAdmin = usuario?.tipo_usuario === "ADMIN";
  const isComercial = usuario?.tipo_usuario === "COMERCIAL";
  const isAtendimento = usuario?.tipo_usuario === "ATENDIMENTO";
  const isColaborador = usuario?.tipo_usuario === "COLABORADOR";
  const isCliente = usuario?.tipo_usuario === "CLIENTE";
  const isEspecificador = usuario?.tipo_usuario === "ESPECIFICADOR";
  const isFornecedor = usuario?.tipo_usuario === "FORNECEDOR";
  const isJuridico = usuario?.tipo_usuario === "JURIDICO";
  const isFinanceiro = usuario?.tipo_usuario === "FINANCEIRO";

  // Helpers de acesso
  const isAdminOuMaster = isMaster || isAdmin;
  const isInterno = isMaster || isAdmin || isComercial || isAtendimento || isColaborador || isJuridico || isFinanceiro;

  return {
    usuario,
    loading: loading || authLoading,
    error,
    isMaster,
    isAdmin,
    isComercial,
    isAtendimento,
    isColaborador,
    isCliente,
    isEspecificador,
    isFornecedor,
    isJuridico,
    isFinanceiro,
    isAdminOuMaster,
    isInterno,
    // Permissões específicas de cliente
    podeVerValores: usuario?.cliente_pode_ver_valores ?? false,
    podeVerCronograma: usuario?.cliente_pode_ver_cronograma ?? false,
    podeVerDocumentos: usuario?.cliente_pode_ver_documentos ?? false,
    podeVerProposta: usuario?.cliente_pode_ver_proposta ?? false,
    podeVerContratos: usuario?.cliente_pode_ver_contratos ?? false,
    podeFazerUpload: usuario?.cliente_pode_fazer_upload ?? false,
    podeComentarem: usuario?.cliente_pode_comentar ?? false,
  };
}
