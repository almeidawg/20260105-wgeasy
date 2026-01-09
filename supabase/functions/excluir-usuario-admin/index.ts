// supabase/functions/excluir-usuario-admin/index.ts
// Edge Function para excluir usuário do Auth e tabela usuarios

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-wg-app, x-wg-version, x-supabase-api-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { usuario_id, excluir_pessoa } = await req.json();

    if (!usuario_id) {
      return new Response(
        JSON.stringify({ sucesso: false, erro: "usuario_id é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resultado = {
      sucesso: false,
      auth_excluido: false,
      usuario_excluido: false,
      pessoa_excluida: false,
      mensagem: "",
      erros: [] as string[],
    };

    // 1. Buscar dados do usuário
    const { data: usuario } = await supabaseAdmin
      .from("usuarios")
      .select("auth_user_id, pessoa_id")
      .eq("id", usuario_id)
      .single();

    // 2. Excluir do Auth (se tiver auth_user_id)
    if (usuario?.auth_user_id) {
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(
        usuario.auth_user_id
      );
      if (authError) {
        resultado.erros.push(`Auth: ${authError.message}`);
      } else {
        resultado.auth_excluido = true;
      }
    }

    // 3. Excluir da tabela usuarios
    const { error: usuarioError } = await supabaseAdmin
      .from("usuarios")
      .delete()
      .eq("id", usuario_id);

    if (usuarioError) {
      resultado.erros.push(`Usuario: ${usuarioError.message}`);
    } else {
      resultado.usuario_excluido = true;
    }

    // 4. Excluir pessoa (se solicitado)
    if (excluir_pessoa && usuario?.pessoa_id) {
      const { error: pessoaError } = await supabaseAdmin
        .from("pessoas")
        .delete()
        .eq("id", usuario.pessoa_id);

      if (pessoaError) {
        resultado.erros.push(`Pessoa: ${pessoaError.message}`);
      } else {
        resultado.pessoa_excluida = true;
      }
    }

    resultado.sucesso = resultado.usuario_excluido;
    resultado.mensagem = resultado.sucesso
      ? "Usuário excluído com sucesso"
      : "Erro ao excluir usuário";

    return new Response(JSON.stringify(resultado), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Erro na Edge Function:", error);
    return new Response(
      JSON.stringify({ sucesso: false, erro: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
