// ============================================================
// API: Checklist Diário do CEO/Founder
// Sistema WG Easy - Grupo WG Almeida
// ============================================================
//
// SUPABASE STUDIO - TABELAS:
// - ceo_checklist_diario: https://supabase.com/dashboard/project/ahlqzzkxuutwoepirpzr/editor/ceo_checklist_diario
// - ceo_checklist_itens:  https://supabase.com/dashboard/project/ahlqzzkxuutwoepirpzr/editor/ceo_checklist_itens
// - Menções (comentários): https://supabase.com/dashboard/project/ahlqzzkxuutwoepirpzr/editor/project_tasks_comentarios
//
// ============================================================

import { supabase } from "./supabaseClient";

// ============================================================
// TIPOS
// ============================================================

export type PrioridadeItem = "alta" | "media" | "baixa";
export type FonteItem = "manual" | "mencao" | "automatico" | "recorrente";

export interface CEOChecklistItem {
  id: string;
  checklist_id: string;
  texto: string;
  prioridade: PrioridadeItem;
  concluido: boolean;
  concluido_em: string | null;
  ordem: number;
  fonte: FonteItem;
  referencia_id: string | null;
  created_at: string;
}

export interface CEOChecklist {
  id: string;
  data: string;
  usuario_id: string;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
  itens?: CEOChecklistItem[];
}

export interface NovoItemInput {
  texto: string;
  prioridade?: PrioridadeItem;
  ordem?: number;
  fonte?: FonteItem;
  referencia_id?: string;
  criado_por?: string;
}

// ============================================================
// FUNÇÕES
// ============================================================

/**
 * Obter ou criar o checklist do dia atual
 * Se não existir, copia itens não concluídos do dia anterior
 */
export async function obterChecklistDiario(usuarioId: string): Promise<CEOChecklist | null> {
  const hoje = new Date().toISOString().split("T")[0];
  const ontem = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  // Tentar buscar checklist de hoje
  let { data: checklist, error } = await supabase
    .from("ceo_checklist_diario")
    .select("*, itens:ceo_checklist_itens(*)")
    .eq("usuario_id", usuarioId)
    .eq("data", hoje)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("[obterChecklistDiario] Erro ao buscar:", error);
    throw error;
  }

  // Se não existe, criar novo checklist
  if (!checklist) {
    // Primeiro, criar o checklist de hoje
    const { data: novoChecklist, error: createError } = await supabase
      .from("ceo_checklist_diario")
      .insert({ data: hoje, usuario_id: usuarioId })
      .select()
      .single();

    if (createError) {
      console.error("[obterChecklistDiario] Erro ao criar:", createError);
      throw createError;
    }

    checklist = { ...novoChecklist, itens: [] };

    // Copiar itens não concluídos do dia anterior
    await copiarItensNaoConcluidos(usuarioId, ontem, hoje);

    // Buscar novamente com os itens copiados
    const { data: checklistAtualizado } = await supabase
      .from("ceo_checklist_diario")
      .select("*, itens:ceo_checklist_itens(*)")
      .eq("id", checklist.id)
      .single();

    if (checklistAtualizado) {
      checklist = checklistAtualizado;
    }
  }

  // Ordenar itens por ordem
  if (checklist?.itens) {
    checklist.itens.sort((a: CEOChecklistItem, b: CEOChecklistItem) => a.ordem - b.ordem);
  }

  return checklist;
}

/**
 * Copiar itens não concluídos de um dia para outro
 */
async function copiarItensNaoConcluidos(
  usuarioId: string,
  dataOrigem: string,
  dataDestino: string
): Promise<void> {
  // Buscar checklist de origem
  const { data: checklistOrigem } = await supabase
    .from("ceo_checklist_diario")
    .select("id")
    .eq("usuario_id", usuarioId)
    .eq("data", dataOrigem)
    .single();

  if (!checklistOrigem) return;

  // Buscar checklist de destino
  const { data: checklistDestino } = await supabase
    .from("ceo_checklist_diario")
    .select("id")
    .eq("usuario_id", usuarioId)
    .eq("data", dataDestino)
    .single();

  if (!checklistDestino) return;

  // Buscar itens não concluídos do dia anterior
  const { data: itensNaoConcluidos } = await supabase
    .from("ceo_checklist_itens")
    .select("texto, prioridade, ordem")
    .eq("checklist_id", checklistOrigem.id)
    .eq("concluido", false);

  if (!itensNaoConcluidos || itensNaoConcluidos.length === 0) return;

  // Buscar itens já existentes no destino para evitar duplicatas
  const { data: itensExistentes } = await supabase
    .from("ceo_checklist_itens")
    .select("texto")
    .eq("checklist_id", checklistDestino.id);

  const textosExistentes = new Set(itensExistentes?.map((i) => i.texto) || []);

  // Filtrar apenas itens que não existem no destino
  const itensParaCopiar = itensNaoConcluidos.filter(
    (item) => !textosExistentes.has(item.texto)
  );

  if (itensParaCopiar.length === 0) return;

  // Inserir itens copiados
  const { error } = await supabase.from("ceo_checklist_itens").insert(
    itensParaCopiar.map((item) => ({
      checklist_id: checklistDestino.id,
      texto: item.texto,
      prioridade: item.prioridade,
      ordem: item.ordem,
      fonte: "recorrente" as FonteItem,
    }))
  );

  if (error) {
    console.error("[copiarItensNaoConcluidos] Erro:", error);
  }
}

/**
 * Adicionar novo item ao checklist
 */
export async function adicionarItem(
  checklistId: string,
  item: NovoItemInput
): Promise<CEOChecklistItem> {
  // Buscar próxima ordem (não usar .single() pois pode não haver itens)
  const { data: itensOrdem } = await supabase
    .from("ceo_checklist_itens")
    .select("ordem")
    .eq("checklist_id", checklistId)
    .order("ordem", { ascending: false })
    .limit(1);

  const ultimoItem = itensOrdem?.[0];
  const proximaOrdem = (ultimoItem?.ordem || 0) + 1;

  // Montar objeto de insert (criado_por é opcional pois a coluna pode não existir)
  const insertData: Record<string, any> = {
    checklist_id: checklistId,
    texto: item.texto,
    prioridade: item.prioridade || "media",
    ordem: item.ordem ?? proximaOrdem,
    fonte: item.fonte || "manual",
    referencia_id: item.referencia_id || null,
  };

  // Adicionar criado_por apenas se fornecido
  if (item.criado_por) {
    insertData.criado_por = item.criado_por;
  }

  const { data, error } = await supabase
    .from("ceo_checklist_itens")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error("[adicionarItem] Erro:", error);
    throw error;
  }

  return data;
}

/**
 * Marcar item como concluído/não concluído
 */
export async function toggleItemConcluido(
  itemId: string,
  concluido: boolean
): Promise<CEOChecklistItem> {
  const { data, error } = await supabase
    .from("ceo_checklist_itens")
    .update({
      concluido,
      concluido_em: concluido ? new Date().toISOString() : null,
    })
    .eq("id", itemId)
    .select()
    .single();

  if (error) {
    console.error("[toggleItemConcluido] Erro:", error);
    throw error;
  }

  return data;
}

/**
 * Atualizar texto ou prioridade de um item
 */
export async function atualizarItem(
  itemId: string,
  updates: Partial<Pick<CEOChecklistItem, "texto" | "prioridade" | "ordem">>
): Promise<CEOChecklistItem> {
  const { data, error } = await supabase
    .from("ceo_checklist_itens")
    .update(updates)
    .eq("id", itemId)
    .select()
    .single();

  if (error) {
    console.error("[atualizarItem] Erro:", error);
    throw error;
  }

  return data;
}

/**
 * Remover item do checklist
 */
export async function removerItem(itemId: string): Promise<void> {
  const { error } = await supabase
    .from("ceo_checklist_itens")
    .delete()
    .eq("id", itemId);

  if (error) {
    console.error("[removerItem] Erro:", error);
    throw error;
  }
}

/**
 * Calcular progresso do checklist (percentual de itens concluídos)
 */
export function calcularProgresso(itens: CEOChecklistItem[]): number {
  if (!itens || itens.length === 0) return 0;
  const concluidos = itens.filter((i) => i.concluido).length;
  return Math.round((concluidos / itens.length) * 100);
}

/**
 * Buscar menções do usuário em comentários de tarefas
 * Retorna tarefas onde o usuário foi @mencionado
 *
 * NOTA: Funcionalidade de menções ainda não implementada no sistema.
 * O sistema atual usa task_comments que não possui campo de menções.
 * Esta função retorna array vazio até que a funcionalidade seja implementada.
 */
export async function buscarMencoesUsuario(
  _usuarioId: string,
  _dias: number = 7
): Promise<any[]> {
  // Funcionalidade de menções não implementada no sistema atual
  // O sistema usa task_comments (cronogramaApi) que não tem campo "mencoes"
  // Retornar vazio até implementação futura
  return [];
}

/**
 * Importar menção como item do checklist
 */
export async function importarMencaoParaChecklist(
  checklistId: string,
  mencaoId: string,
  texto: string
): Promise<CEOChecklistItem> {
  return adicionarItem(checklistId, {
    texto,
    prioridade: "alta",
    fonte: "mencao",
    referencia_id: mencaoId,
  });
}

// ============================================================
// SISTEMA DE MENÇÕES (@usuario)
// ============================================================

export interface UsuarioParaMencao {
  id: string;
  nome: string;
  tipo_usuario: string;
  avatar_url: string | null;
}

export interface ChecklistMencao {
  id: string;
  item_id: string;
  usuario_mencionado_id: string;
  usuario_autor_id: string;
  lido: boolean;
  created_at: string;
  // Dados expandidos
  item?: CEOChecklistItem;
  autor_nome?: string;
}

/**
 * Extrair menções (@nome) do texto
 * Retorna array de nomes mencionados (sem o @)
 */
export function extrairMencoes(texto: string): string[] {
  const regex = /@([a-zA-ZÀ-ÿ]+(?:\s+[a-zA-ZÀ-ÿ]+)?)/gi;
  const matches = texto.matchAll(regex);
  const mencoes: string[] = [];

  for (const match of matches) {
    mencoes.push(match[1].toLowerCase());
  }

  return [...new Set(mencoes)]; // Remove duplicatas
}

/**
 * Buscar usuários para autocomplete de menções
 * Busca por nome ou email
 */
export async function buscarUsuariosParaMencao(termo: string): Promise<UsuarioParaMencao[]> {
  if (!termo || termo.length < 2) return [];

  const { data, error } = await supabase
    .from("usuarios")
    .select(`
      id,
      tipo_usuario,
      pessoas:pessoa_id (
        nome,
        avatar_url,
        foto_url
      )
    `)
    .eq("ativo", true)
    .limit(10);

  if (error) {
    console.error("[buscarUsuariosParaMencao] Erro:", error);
    return [];
  }

  // Filtrar e mapear resultados
  const termoLower = termo.toLowerCase();
  return (data || [])
    .filter((u: any) => {
      const nome = u.pessoas?.nome?.toLowerCase() || "";
      return nome.includes(termoLower);
    })
    .map((u: any) => ({
      id: u.id,
      nome: u.pessoas?.nome || "Sem nome",
      tipo_usuario: u.tipo_usuario,
      avatar_url: u.pessoas?.avatar_url || u.pessoas?.foto_url || null,
    }));
}

/**
 * Buscar usuário por nome (para resolver @menção)
 */
export async function buscarUsuarioPorNome(nome: string): Promise<UsuarioParaMencao | null> {
  const { data, error } = await supabase
    .from("usuarios")
    .select(`
      id,
      tipo_usuario,
      pessoas:pessoa_id (
        nome,
        avatar_url,
        foto_url
      )
    `)
    .eq("ativo", true);

  if (error || !data) return null;

  // Buscar por nome similar (case insensitive, parcial)
  const nomeLower = nome.toLowerCase();
  const usuario = data.find((u: any) => {
    const nomeUsuario = u.pessoas?.nome?.toLowerCase() || "";
    // Primeiro nome ou nome completo
    const primeiroNome = nomeUsuario.split(" ")[0];
    return primeiroNome === nomeLower || nomeUsuario.includes(nomeLower);
  });

  if (!usuario) return null;

  return {
    id: (usuario as any).id,
    nome: (usuario as any).pessoas?.nome || "Sem nome",
    tipo_usuario: (usuario as any).tipo_usuario,
    avatar_url: (usuario as any).pessoas?.avatar_url || (usuario as any).pessoas?.foto_url || null,
  };
}

/**
 * Criar menções para um item do checklist
 * Detecta @nomes no texto e cria registros na tabela de menções
 */
export async function criarMencoesDoItem(
  itemId: string,
  texto: string,
  autorId: string
): Promise<void> {
  const nomesMencionados = extrairMencoes(texto);

  if (nomesMencionados.length === 0) return;

  // Resolver cada @nome para um usuário
  for (const nome of nomesMencionados) {
    const usuario = await buscarUsuarioPorNome(nome);

    if (usuario && usuario.id !== autorId) {
      // Criar registro de menção
      const { error } = await supabase
        .from("ceo_checklist_mencoes")
        .insert({
          item_id: itemId,
          usuario_mencionado_id: usuario.id,
          usuario_autor_id: autorId,
        });

      if (error && error.code !== "23505") { // Ignora duplicatas
        console.error("[criarMencoesDoItem] Erro ao criar menção:", error);
      }

      // Criar a tarefa no checklist do usuário mencionado também
      await criarTarefaParaMencionado(usuario.id, texto, autorId, itemId);
    }
  }
}

/**
 * Criar tarefa no checklist do usuário mencionado
 */
async function criarTarefaParaMencionado(
  usuarioMencionadoId: string,
  texto: string,
  autorId: string,
  itemOriginalId: string
): Promise<void> {
  const hoje = new Date().toISOString().split("T")[0];

  // Buscar ou criar checklist do usuário mencionado
  let { data: checklist } = await supabase
    .from("ceo_checklist_diario")
    .select("id")
    .eq("usuario_id", usuarioMencionadoId)
    .eq("data", hoje)
    .single();

  if (!checklist) {
    // Criar checklist para o usuário
    const { data: novoChecklist, error } = await supabase
      .from("ceo_checklist_diario")
      .insert({ data: hoje, usuario_id: usuarioMencionadoId })
      .select("id")
      .single();

    if (error) {
      console.error("[criarTarefaParaMencionado] Erro ao criar checklist:", error);
      return;
    }
    checklist = novoChecklist;
  }

  // Buscar nome do autor
  const { data: autorData } = await supabase
    .from("usuarios")
    .select("pessoas:pessoa_id(nome)")
    .eq("id", autorId)
    .single();

  const autorNome = (autorData as any)?.pessoas?.nome || "Alguém";

  // Criar o item no checklist do mencionado
  const { error } = await supabase
    .from("ceo_checklist_itens")
    .insert({
      checklist_id: checklist!.id,
      texto: `📌 ${autorNome}: ${texto}`,
      prioridade: "alta",
      fonte: "mencao",
      referencia_id: itemOriginalId,
      criado_por: autorId,
    });

  if (error) {
    console.error("[criarTarefaParaMencionado] Erro ao criar item:", error);
  }
}

/**
 * Buscar tarefas onde o usuário foi mencionado (não lidas)
 */
export async function buscarTarefasMencionadas(usuarioId: string): Promise<ChecklistMencao[]> {
  const { data, error } = await supabase
    .from("ceo_checklist_mencoes")
    .select(`
      *,
      item:ceo_checklist_itens(*),
      autor:usuario_autor_id(
        pessoas:pessoa_id(nome)
      )
    `)
    .eq("usuario_mencionado_id", usuarioId)
    .eq("lido", false)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("[buscarTarefasMencionadas] Erro:", error);
    return [];
  }

  return (data || []).map((m: any) => ({
    ...m,
    autor_nome: m.autor?.pessoas?.nome || "Desconhecido",
  }));
}

/**
 * Marcar menção como lida
 */
export async function marcarMencaoComoLida(mencaoId: string): Promise<void> {
  const { error } = await supabase
    .from("ceo_checklist_mencoes")
    .update({ lido: true })
    .eq("id", mencaoId);

  if (error) {
    console.error("[marcarMencaoComoLida] Erro:", error);
  }
}

/**
 * Adicionar item com suporte a menções
 * Wrapper do adicionarItem que processa @menções
 */
export async function adicionarItemComMencoes(
  checklistId: string,
  item: NovoItemInput,
  autorId: string
): Promise<CEOChecklistItem> {
  // Criar o item com criado_por incluído diretamente
  const novoItem = await adicionarItem(checklistId, {
    ...item,
    criado_por: autorId,
  });

  // Processar menções no texto
  await criarMencoesDoItem(novoItem.id, item.texto, autorId);

  return novoItem;
}
