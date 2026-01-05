// src/lib/workflowFinanceiro.ts
import { supabase } from "./supabaseClient";

export async function solicitarAprovacao(lancamentoId: string, usuarioId: string) {
  return supabase.from("workflow_financeiro").insert({
    lancamento_id: lancamentoId,
    solicitado_por: usuarioId,
    status: "pendente"
  });
}

export async function aprovarLancamento(workflowId: string, aprovadorId: string) {
  return supabase.from("workflow_financeiro").update({
    status: "aprovado",
    aprovado_por: aprovadorId,
    data_aprovacao: new Date().toISOString()
  }).eq("id", workflowId);
}

export async function rejeitarLancamento(workflowId: string, aprovadorId: string) {
  return supabase.from("workflow_financeiro").update({
    status: "rejeitado",
    aprovado_por: aprovadorId,
    data_aprovacao: new Date().toISOString()
  }).eq("id", workflowId);
}
