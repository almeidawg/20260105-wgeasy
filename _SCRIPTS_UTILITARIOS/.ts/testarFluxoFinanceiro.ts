/**
 * TESTE FINANCEIRO - usa credenciais do .env (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)
 * Cria dados fictícios e lança receitas/despesas para validar o módulo financeiro.
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || (!supabaseAnonKey && !supabaseServiceKey)) {
  console.error("❌ Defina VITE_SUPABASE_URL e a chave (anon ou service) no .env");
  process.exit(1);
}

console.log("➡️ Supabase URL:", supabaseUrl);
console.log("➡️ Chave usada:", supabaseServiceKey ? "service" : "anon");

const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

async function main() {
  try {
    // 1) Cliente fictício
    const { data: cliente, error: cliErr } = await supabase
      .from("pessoas")
      .upsert(
        {
          cpf: "99999999999",
          nome: "Cliente Teste Financeiro",
          email: "financeiro+teste@wgeasy.com",
          telefone: "11999990000",
          tipo: "cliente",
          estado_civil: "Solteiro(a)",
        },
        { onConflict: "cpf" }
      )
      .select()
      .single();
    if (cliErr) throw cliErr;

    // 2) Contrato fictício
    const { data: contrato, error: ctrErr } = await supabase
      .from("contratos")
      .insert({
        numero: "AUTO-FIN-001",
        titulo: "Contrato Fictício Financeiro",
        cliente_id: cliente.id,
        unidade_negocio: "engenharia",
        status: "ativo",
        valor_total: 10000,
        data_inicio: new Date().toISOString().split("T")[0],
      })
      .select()
      .single();
    if (ctrErr) throw ctrErr;

    // 3) Lançamentos: uma entrada paga e uma despesa paga
    const hoje = new Date().toISOString().split("T")[0];
    const lancamentos = [
      {
        contrato_id: contrato.id,
        pessoa_id: cliente.id,
        tipo: "entrada",
        descricao: "Entrada contrato AUTO-FIN-001",
        valor_total: 6000,
        status: "pago",
        unidade_negocio: "engenharia",
        data_competencia: hoje,
      },
      {
        contrato_id: contrato.id,
        pessoa_id: cliente.id,
        tipo: "saida",
        descricao: "Compra materiais AUTO-FIN-001",
        valor_total: 2000,
        status: "pago",
        unidade_negocio: "engenharia",
        data_competencia: hoje,
      },
    ];

    const { error: lancErr } = await supabase.from("financeiro_lancamentos").insert(lancamentos);
    if (lancErr) throw lancErr;

    console.log("✅ Dados de teste inseridos com sucesso:");
    console.log("   Cliente:", cliente.id);
    console.log("   Contrato:", contrato.id);
    console.log("   Lançamentos criados (entrada 6000, saída 2000)");
    console.log("   Verifique em /financeiro/lancamentos e /financeiro/obras");
  } catch (err) {
    console.error("❌ Erro no teste financeiro:", err);
    try {
      console.error("Detalhe:", JSON.stringify(err, null, 2));
    } catch {}
  }
}

main().catch((err) => {
  console.error("❌ Erro no teste financeiro (catch):", err);
  try {
    console.error("Detalhe:", JSON.stringify(err, null, 2));
  } catch {}
});
process.on("unhandledRejection", (err) => {
  console.error("❌ Erro não tratado:", err);
  try {
    console.error("Detalhe:", JSON.stringify(err, null, 2));
  } catch {}
});
