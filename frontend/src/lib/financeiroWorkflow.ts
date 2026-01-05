// src/lib/financeiroWorkflow.ts
import { supabaseRaw as supabase } from "@/lib/supabaseClient";
import { ApprovalStatus } from "./financeiroApi";

export async function atualizarStatusAprovacao(
  financeiroId: string,
  status: ApprovalStatus,
  userId: string
) {
  const { error } = await supabase
    .from("financeiro_lancamentos")
    .update({
      approval_status: status,
      approval_user_id: userId,
      approval_at: new Date().toISOString(),
    })
    .eq("id", financeiroId);

  if (error) throw error;
  return true;
}
