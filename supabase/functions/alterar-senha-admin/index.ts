// supabase/functions/alterar-senha-admin/index.ts
// Edge Function para alterar senha de usuário usando Admin API

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

    const { usuario_id, auth_user_id, email, nova_senha } = await req.json();

    if (!nova_senha) {
      return new Response(
        JSON.stringify({ sucesso: false, erro: "nova_senha é obrigatória" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let targetAuthUserId = auth_user_id;

    // Se não tem auth_user_id, buscar pelo usuario_id ou email
    if (!targetAuthUserId) {
      if (usuario_id) {
        const { data: usuario } = await supabaseAdmin
          .from("usuarios")
          .select("auth_user_id")
          .eq("id", usuario_id)
          .single();
        targetAuthUserId = usuario?.auth_user_id;
      } else if (email) {
        // Buscar por email no Auth
        const { data: users } = await supabaseAdmin.auth.admin.listUsers();
        const user = users?.users?.find(
          (u) => u.email?.toLowerCase() === email.toLowerCase()
        );
        targetAuthUserId = user?.id;
      }
    }

    if (!targetAuthUserId) {
      return new Response(
        JSON.stringify({ sucesso: false, erro: "Usuário não encontrado no Auth" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Alterar senha usando Admin API
    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      targetAuthUserId,
      { password: nova_senha }
    );

    if (error) {
      return new Response(
        JSON.stringify({ sucesso: false, erro: error.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Atualizar flag primeiro_acesso se existir usuario_id
    if (usuario_id) {
      await supabaseAdmin
        .from("usuarios")
        .update({ primeiro_acesso: true, atualizado_em: new Date().toISOString() })
        .eq("id", usuario_id);
    }

    return new Response(
      JSON.stringify({
        sucesso: true,
        mensagem: "Senha alterada com sucesso!",
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
