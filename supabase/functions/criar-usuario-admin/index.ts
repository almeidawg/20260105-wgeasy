// supabase/functions/criar-usuario-admin/index.ts
// Edge Function para criar usuário já confirmado no Supabase Auth
// Usa Admin API para criar usuário sem necessidade de confirmação de email

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-wg-app, x-wg-version, x-supabase-api-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Cliente com privilégios admin
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { email, senha, pessoa_id, tipo_usuario, cpf, nome, telefone } = await req.json();

    if (!email || !senha) {
      return new Response(
        JSON.stringify({ sucesso: false, erro: "Email e senha são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verificar se email já existe
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const emailExists = existingUsers?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (emailExists) {
      // Email já existe - retornar info para usar recuperação de senha
      return new Response(
        JSON.stringify({
          sucesso: true,
          ja_existia: true,
          auth_user_id: emailExists.id,
          mensagem: "Email já cadastrado. Use recuperação de senha.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Criar usuário já confirmado usando Admin API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase(),
      password: senha,
      email_confirm: true, // Já confirmado!
      user_metadata: {
        tipo_usuario: tipo_usuario || "CLIENTE",
        pessoa_id: pessoa_id,
        cpf: cpf,
        nome: nome,
      },
    });

    if (authError) {
      console.error("Erro ao criar usuário no Auth:", authError);
      return new Response(
        JSON.stringify({ sucesso: false, erro: authError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Criar registro na tabela usuarios
    if (authData.user && pessoa_id) {
      const { error: usuarioError } = await supabaseAdmin
        .from("usuarios")
        .insert({
          auth_user_id: authData.user.id,
          pessoa_id: pessoa_id,
          cpf: cpf?.replace(/[^0-9]/g, "") || "",
          tipo_usuario: tipo_usuario || "CLIENTE",
          ativo: true,
          primeiro_acesso: true,
          criado_em: new Date().toISOString(),
          atualizado_em: new Date().toISOString(),
        })
        .single();

      if (usuarioError) {
        console.error("Aviso: Erro ao criar registro de usuário:", usuarioError);
        // Não falhar - o usuário foi criado no Auth
      }
    }

    return new Response(
      JSON.stringify({
        sucesso: true,
        auth_user_id: authData.user?.id,
        email: authData.user?.email,
        mensagem: "Usuário criado com sucesso! Pode logar imediatamente.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Erro na Edge Function:", error);
    return new Response(
      JSON.stringify({ sucesso: false, erro: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
