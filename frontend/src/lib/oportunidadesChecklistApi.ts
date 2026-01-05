// ============================================================
// API: Checklists de Oportunidades
// Sistema WG Easy - Grupo WG Almeida
// ============================================================

import { supabase } from "@/lib/supabaseClient";
import type {
  OportunidadeChecklistTemplate,
  ChecklistTemplateFormData,
  OportunidadeChecklist,
  OportunidadeChecklistCompleto,
  OportunidadeChecklistFormData,
  OportunidadeChecklistResumo,
  AplicarTemplateRequest,
  UnidadeNegocio,
} from "@/types/oportunidadesChecklist";

// Re-exportar tipos para compatibilidade
export type {
  OportunidadeChecklistTemplate,
  ChecklistTemplateFormData,
  OportunidadeChecklist,
  OportunidadeChecklistCompleto,
  OportunidadeChecklistFormData,
  OportunidadeChecklistResumo,
  AplicarTemplateRequest,
  UnidadeNegocio,
};

// ============================================================
// TEMPLATES DE CHECKLIST
// ============================================================

/**
 * Listar todos os templates
 */
export async function listarTemplates(): Promise<
  OportunidadeChecklistTemplate[]
> {
  const { data, error } = await supabase
    .from("oportunidades_checklist_templates")
    .select("*")
    .eq("ativo", true)
    .order("nome", { ascending: true });

  if (error) throw error;
  return data as any;
}

/**
 * Listar templates por unidade de neg�cio
 */
export async function listarTemplatesPorUnidade(
  unidade: UnidadeNegocio
): Promise<OportunidadeChecklistTemplate[]> {
  const { data, error } = await supabase
    .from("oportunidades_checklist_templates")
    .select("*")
    .or(`unidade_negocio.eq.${unidade},unidade_negocio.eq.geral`)
    .eq("ativo", true)
    .order("nome", { ascending: true });

  if (error) throw error;
  return data as any;
}

/**
 * Buscar template por ID
 */
export async function buscarTemplate(
  id: string
): Promise<OportunidadeChecklistTemplate> {
  const { data, error } = await supabase
    .from("oportunidades_checklist_templates")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as any;
}

/**
 * Criar template
 */
export async function criarTemplate(
  payload: ChecklistTemplateFormData
): Promise<OportunidadeChecklistTemplate> {
  const { data, error } = await supabase
    .from("oportunidades_checklist_templates")
    .insert({
      ...payload,
      ativo: payload.ativo ?? true,
    })
    .select()
    .single();

  if (error) throw error;
  return data as any;
}

/**
 * Atualizar template
 */
export async function atualizarTemplate(
  id: string,
  payload: Partial<ChecklistTemplateFormData>
): Promise<OportunidadeChecklistTemplate> {
  const { data, error } = await supabase
    .from("oportunidades_checklist_templates")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as any;
}

/**
 * Deletar template
 */
export async function deletarTemplate(id: string): Promise<void> {
  // Desativar ao inv�s de deletar (soft delete)
  const { error } = await supabase
    .from("oportunidades_checklist_templates")
    .update({ ativo: false })
    .eq("id", id);

  if (error) throw error;
}

/**
 * Duplicar template
 */
export async function duplicarTemplate(
  id: string
): Promise<OportunidadeChecklistTemplate> {
  const templateOriginal = await buscarTemplate(id);

  const novoTemplate = await criarTemplate({
    nome: `${templateOriginal.nome} (C�pia)`,
    descricao: templateOriginal.descricao || undefined,
    items: templateOriginal.items,
    unidade_negocio: templateOriginal.unidade_negocio,
    ativo: true,
  });

  return novoTemplate;
}

// ============================================================
// CHECKLISTS DE OPORTUNIDADE
// ============================================================

/**
 * Listar checklists de uma oportunidade
 */
export async function listarChecklistsOportunidade(
  oportunidade_id: string
): Promise<OportunidadeChecklistCompleto[]> {
  const { data, error } = await supabase
    .from("oportunidades_checklist")
    .select(
      `
      *,
      template:template_id (
        nome
      )
    `
    )
    .eq("oportunidade_id", oportunidade_id)
    .order("ordem", { ascending: true });

  if (error) throw error;
  return data as any;
}

/**
 * Buscar checklist por ID
 */
export async function buscarChecklist(
  id: string
): Promise<OportunidadeChecklistCompleto> {
  const { data, error } = await supabase
    .from("oportunidades_checklist")
    .select(
      `
      *,
      template:template_id (
        nome
      )
    `
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as any;
}

/**
 * Criar item de checklist
 */
export async function criarChecklist(
  payload: OportunidadeChecklistFormData
): Promise<OportunidadeChecklist> {
  // Se n�o foi fornecida uma ordem, buscar a pr�xima dispon�vel
  let ordem = payload.ordem;
  if (ordem === undefined) {
    const { data: ultimoItem } = await supabase
      .from("oportunidades_checklist")
      .select("ordem")
      .eq("oportunidade_id", payload.oportunidade_id)
      .order("ordem", { ascending: false })
      .limit(1)
      .single();

    ordem = ultimoItem ? ultimoItem.ordem + 1 : 0;
  }

  const { data, error } = await supabase
    .from("oportunidades_checklist")
    .insert({
      ...payload,
      ordem,
      obrigatorio: payload.obrigatorio ?? false,
      concluido: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data as any;
}

/**
 * Atualizar item de checklist
 */
export async function atualizarChecklist(
  id: string,
  payload: Partial<OportunidadeChecklistFormData>
): Promise<OportunidadeChecklist> {
  const { data, error } = await supabase
    .from("oportunidades_checklist")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as any;
}

/**
 * Deletar item de checklist
 */
export async function deletarChecklist(id: string): Promise<void> {
  const { error } = await supabase
    .from("oportunidades_checklist")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

/**
 * Marcar/desmarcar checklist como conclu�do
 */
export async function toggleChecklist(
  id: string
): Promise<OportunidadeChecklist> {
  // Buscar estado atual
  const { data: itemAtual } = await supabase
    .from("oportunidades_checklist")
    .select("concluido")
    .eq("id", id)
    .single();

  const novoConcluido = !itemAtual?.concluido;

  const { data: userData } = await supabase.auth.getUser();

  const updateData: any = {
    concluido: novoConcluido,
  };

  if (novoConcluido) {
    updateData.concluido_em = new Date().toISOString();
    updateData.concluido_por_id = userData?.user?.id;
    updateData.concluido_por_nome = userData?.user?.email;
  } else {
    updateData.concluido_em = null;
    updateData.concluido_por_id = null;
    updateData.concluido_por_nome = null;
  }

  const { data, error } = await supabase
    .from("oportunidades_checklist")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as any;
}

/**
 * Aplicar template a uma oportunidade
 */
export async function aplicarTemplate(
  request: AplicarTemplateRequest
): Promise<OportunidadeChecklist[]> {
  const { oportunidade_id, template_id, substituir_existentes } = request;

  // Se deve substituir, deletar checklists existentes
  if (substituir_existentes) {
    await supabase
      .from("oportunidades_checklist")
      .delete()
      .eq("oportunidade_id", oportunidade_id);
  }

  // Buscar template
  const template = await buscarTemplate(template_id);

  // Criar checklists baseados no template
  const checklists: OportunidadeChecklist[] = [];

  for (let i = 0; i < template.items.length; i++) {
    const item = template.items[i];
    const checklist = await criarChecklist({
      oportunidade_id,
      template_id,
      item: item.item,
      ordem: i,
      obrigatorio: item.obrigatorio,
    });
    checklists.push(checklist);
  }

  return checklists;
}

/**
 * Reordenar checklists
 */
export async function reordenarChecklists(
  checklists: { id: string; ordem: number }[]
): Promise<void> {
  for (const item of checklists) {
    await supabase
      .from("oportunidades_checklist")
      .update({ ordem: item.ordem })
      .eq("id", item.id);
  }
}

/**
 * Obter resumo dos checklists de uma oportunidade
 */
export async function obterResumoChecklist(
  oportunidade_id: string
): Promise<OportunidadeChecklistResumo> {
  const { data, error } = await supabase
    .from("v_oportunidades_checklist_resumo")
    .select("*")
    .eq("oportunidade_id", oportunidade_id)
    .single();

  if (error) {
    // Se n�o encontrou, retornar resumo vazio
    const { data: oportunidade } = await supabase
      .from("oportunidades")
      .select("titulo")
      .eq("id", oportunidade_id)
      .single();

    return {
      oportunidade_id,
      oportunidade_titulo: oportunidade?.titulo || "",
      total_checklist: 0,
      checklist_concluidos: 0,
      obrigatorios_pendentes: 0,
      percentual_concluido: 0,
    };
  }

  return data as any;
}

/**
 * Verificar se pode avan�ar oportunidade (todos obrigat�rios conclu�dos)
 */
export async function podeAvancarOportunidade(
  oportunidade_id: string
): Promise<{ pode: boolean; motivo?: string }> {
  const { data: checklists } = await supabase
    .from("oportunidades_checklist")
    .select("obrigatorio, concluido")
    .eq("oportunidade_id", oportunidade_id);

  if (!checklists || checklists.length === 0) {
    return { pode: true };
  }

  const obrigatoriosPendentes = checklists.filter(
    (c: any) => c.obrigatorio && !c.concluido
  );

  if (obrigatoriosPendentes.length > 0) {
    return {
      pode: false,
      motivo: `Existem ${obrigatoriosPendentes.length} item${
        obrigatoriosPendentes.length > 1 ? "ns" : ""
      } obrigat�rio${obrigatoriosPendentes.length > 1 ? "s" : ""} pendente${
        obrigatoriosPendentes.length > 1 ? "s" : ""
      }`,
    };
  }

  return { pode: true };
}

/**
 * Copiar checklists de uma oportunidade para outra
 */
export async function copiarChecklists(
  oportunidade_origem_id: string,
  oportunidade_destino_id: string
): Promise<OportunidadeChecklist[]> {
  const checklistsOrigem = await listarChecklistsOportunidade(
    oportunidade_origem_id
  );

  const checklistsDestino: OportunidadeChecklist[] = [];

  for (const item of checklistsOrigem) {
    const novoChecklist = await criarChecklist({
      oportunidade_id: oportunidade_destino_id,
      template_id: item.template_id || undefined,
      item: item.item,
      ordem: item.ordem,
      obrigatorio: item.obrigatorio,
      observacoes: item.observacoes || undefined,
    });
    checklistsDestino.push(novoChecklist);
  }

  return checklistsDestino;
}

/**
 * Listar oportunidades com checklist pendente
 */
export async function listarOportunidadesComChecklistPendente(): Promise<
  OportunidadeChecklistResumo[]
> {
  const { data, error } = await supabase
    .from("v_oportunidades_checklist_resumo")
    .select("*")
    .gt("obrigatorios_pendentes", 0)
    .order("oportunidade_titulo", { ascending: true });

  if (error) throw error;
  return data as any;
}

/**
 * Marcar m�ltiplos itens como conclu�dos
 */
export async function concluirVariosChecklists(
  ids: string[]
): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();

  for (const id of ids) {
    await supabase
      .from("oportunidades_checklist")
      .update({
        concluido: true,
        concluido_em: new Date().toISOString(),
        concluido_por_id: userData?.user?.id,
        concluido_por_nome: userData?.user?.email,
      })
      .eq("id", id);
  }
}

/**
 * Resetar checklist (desmarcar todos)
 */
export async function resetarChecklist(oportunidade_id: string): Promise<void> {
  await supabase
    .from("oportunidades_checklist")
    .update({
      concluido: false,
      concluido_em: null,
      concluido_por_id: null,
      concluido_por_nome: null,
    })
    .eq("oportunidade_id", oportunidade_id);
}
