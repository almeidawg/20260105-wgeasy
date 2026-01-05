// ============================================================
// SERVICE: Cronograma
// Sistema WG Easy - Grupo WG Almeida
// ============================================================

import { supabase } from "@/lib/supabaseClient";
import type {
  Projeto,
  ProjetoCompleto,
  ProjetoFormData,
  CronogramaTarefa,
  CronogramaTarefaFormData,
  ProjetoEquipe,
  ProjetoEquipeFormData,
  ProjetoEquipeCompleta,
  FiltrosProjetos,
  FiltrosTarefas,
  EstatisticasCronograma,
} from "@/types/cronograma";

// ============================================================
// PROJETOS
// ============================================================

/**
 * Buscar todos os projetos (com filtros opcionais)
 */
export async function buscarProjetos(filtros?: FiltrosProjetos): Promise<Projeto[]> {
  let query = supabase
    .from("projetos")
    .select("*")
    .order("created_at", { ascending: false });

  // Aplicar filtros
  if (filtros?.status && filtros.status.length > 0) {
    query = query.in("status", filtros.status);
  }

  if (filtros?.nucleo && filtros.nucleo.length > 0) {
    query = query.in("nucleo", filtros.nucleo);
  }

  if (filtros?.cliente_id) {
    query = query.eq("cliente_id", filtros.cliente_id);
  }

  if (filtros?.data_inicio) {
    query = query.gte("data_inicio", filtros.data_inicio);
  }

  if (filtros?.data_fim) {
    query = query.lte("data_termino", filtros.data_fim);
  }

  if (filtros?.busca) {
    query = query.ilike("nome", `%${filtros.busca}%`);
  }

  if (filtros?.mostrar_concluidos === false) {
    query = query.neq("status", "concluido");
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao buscar projetos:", error);
    throw error;
  }

  return data || [];
}

/**
 * Buscar projetos completos (com dados de cliente e contrato)
 */
export async function buscarProjetosCompletos(filtros?: FiltrosProjetos): Promise<ProjetoCompleto[]> {
  let query = supabase
    .from("projetos")
    .select(`
      *,
      cliente:pessoas!cliente_id(nome, cpf, telefone, email),
      contrato:contratos!contrato_id(numero, valor_total)
    `)
    .order("created_at", { ascending: false });

  // Aplicar mesmos filtros
  if (filtros?.status && filtros.status.length > 0) {
    query = query.in("status", filtros.status);
  }

  if (filtros?.nucleo && filtros.nucleo.length > 0) {
    query = query.in("nucleo", filtros.nucleo);
  }

  if (filtros?.cliente_id) {
    query = query.eq("cliente_id", filtros.cliente_id);
  }

  if (filtros?.data_inicio) {
    query = query.gte("data_inicio", filtros.data_inicio);
  }

  if (filtros?.data_fim) {
    query = query.lte("data_termino", filtros.data_fim);
  }

  if (filtros?.busca) {
    query = query.ilike("nome", `%${filtros.busca}%`);
  }

  if (filtros?.mostrar_concluidos === false) {
    query = query.neq("status", "concluido");
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao buscar projetos completos:", error);
    throw error;
  }

  // Mapear dados do JOIN para formato correto
  const projetos: ProjetoCompleto[] = (data || []).map((item: any) => ({
    ...item,
    cliente_nome: item.cliente?.nome,
    cliente_cpf: item.cliente?.cpf,
    cliente_telefone: item.cliente?.telefone,
    cliente_email: item.cliente?.email,
    contrato_numero: item.contrato?.numero,
    contrato_valor_total: item.contrato?.valor_total,
  }));

  return projetos;
}

/**
 * Buscar projeto por ID com dados completos
 */
export async function buscarProjetoPorId(id: string): Promise<ProjetoCompleto | null> {
  const { data, error } = await supabase
    .from("projetos")
    .select(`
      *,
      cliente:pessoas!cliente_id(nome, cpf, telefone, email),
      contrato:contratos!contrato_id(numero, valor_total)
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Erro ao buscar projeto:", error);
    throw error;
  }

  if (!data) return null;

  // Mapear dados do JOIN
  const projeto: ProjetoCompleto = {
    ...data,
    cliente_nome: data.cliente?.nome,
    cliente_cpf: data.cliente?.cpf,
    cliente_telefone: data.cliente?.telefone,
    cliente_email: data.cliente?.email,
    contrato_numero: data.contrato?.numero,
    contrato_valor_total: data.contrato?.valor_total,
  };

  return projeto;
}

/**
 * Criar novo projeto
 */
export async function criarProjeto(dados: ProjetoFormData): Promise<Projeto> {
  const { data, error } = await supabase
    .from("projetos")
    .insert(dados)
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar projeto:", error);
    throw error;
  }

  return data;
}

/**
 * Atualizar projeto
 */
export async function atualizarProjeto(id: string, dados: Partial<ProjetoFormData>): Promise<Projeto> {
  const { data, error } = await supabase
    .from("projetos")
    .update(dados)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar projeto:", error);
    throw error;
  }

  return data;
}

/**
 * Deletar projeto
 */
export async function deletarProjeto(id: string): Promise<void> {
  const { error } = await supabase
    .from("projetos")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao deletar projeto:", error);
    throw error;
  }
}

// ============================================================
// TAREFAS
// ============================================================

/**
 * Buscar tarefas de um projeto
 */
export async function buscarTarefasDoProjeto(
  projetoId: string,
  filtros?: FiltrosTarefas
): Promise<CronogramaTarefa[]> {
  let query = supabase
    .from("cronograma_tarefas")
    .select("*")
    .eq("projeto_id", projetoId)
    .order("ordem", { ascending: true });

  // Aplicar filtros
  if (filtros?.status && filtros.status.length > 0) {
    query = query.in("status", filtros.status);
  }

  if (filtros?.prioridade && filtros.prioridade.length > 0) {
    query = query.in("prioridade", filtros.prioridade);
  }

  if (filtros?.nucleo && filtros.nucleo.length > 0) {
    query = query.in("nucleo", filtros.nucleo);
  }

  if (filtros?.categoria && filtros.categoria.length > 0) {
    query = query.in("categoria", filtros.categoria);
  }

  if (filtros?.mostrar_concluidas === false) {
    query = query.neq("status", "concluido");
  }

  if (filtros?.apenas_atrasadas) {
    query = query.eq("status", "atrasado");
  }

  if (filtros?.data_inicio) {
    query = query.gte("data_inicio", filtros.data_inicio);
  }

  if (filtros?.data_fim) {
    query = query.lte("data_termino", filtros.data_fim);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao buscar tarefas:", error);
    throw error;
  }

  return data || [];
}

/**
 * Criar nova tarefa
 */
export async function criarTarefa(dados: CronogramaTarefaFormData): Promise<CronogramaTarefa> {
  const { data, error } = await supabase
    .from("cronograma_tarefas")
    .insert(dados)
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar tarefa:", error);
    throw error;
  }

  return data;
}

/**
 * Atualizar tarefa
 */
export async function atualizarTarefa(
  id: string,
  dados: Partial<CronogramaTarefaFormData>
): Promise<CronogramaTarefa> {
  const { data, error } = await supabase
    .from("cronograma_tarefas")
    .update(dados)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar tarefa:", error);
    throw error;
  }

  return data;
}

/**
 * Deletar tarefa
 */
export async function deletarTarefa(id: string): Promise<void> {
  const { error } = await supabase
    .from("cronograma_tarefas")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao deletar tarefa:", error);
    throw error;
  }
}

/**
 * Atualizar progresso de uma tarefa
 */
export async function atualizarProgressoTarefa(
  id: string,
  progresso: number
): Promise<CronogramaTarefa> {
  const { data, error } = await supabase
    .from("cronograma_tarefas")
    .update({ progresso })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar progresso:", error);
    throw error;
  }

  return data;
}

/**
 * Reordenar tarefas (atualizar ordem em lote)
 */
export async function reordenarTarefas(atualizacoes: { id: string; ordem: number }[]): Promise<void> {
  const promises = atualizacoes.map(({ id, ordem }) =>
    supabase.from("cronograma_tarefas").update({ ordem }).eq("id", id)
  );

  const resultados = await Promise.all(promises);

  const erros = resultados.filter((r) => r.error);
  if (erros.length > 0) {
    console.error("Erros ao reordenar tarefas:", erros);
    throw new Error("Falha ao reordenar algumas tarefas");
  }
}

// ============================================================
// EQUIPES
// ============================================================

/**
 * Buscar equipe de um projeto
 */
export async function buscarEquipeDoProjeto(projetoId: string): Promise<ProjetoEquipeCompleta[]> {
  const { data, error } = await supabase
    .from("vw_projeto_equipes_completa") // Usando a VIEW criada no banco
    .select("*")
    .eq("projeto_id", projetoId)
    .order("is_responsavel", { ascending: false });

  if (error) {
    console.error("Erro ao buscar equipe:", error);
    throw error;
  }

  return data || [];
}

/**
 * Buscar equipe de uma tarefa específica
 */
export async function buscarEquipeDaTarefa(tarefaId: string): Promise<ProjetoEquipeCompleta[]> {
  const { data, error } = await supabase
    .from("vw_projeto_equipes_completa")
    .select("*")
    .eq("tarefa_id", tarefaId)
    .order("is_responsavel", { ascending: false });

  if (error) {
    console.error("Erro ao buscar equipe da tarefa:", error);
    throw error;
  }

  return data || [];
}

/**
 * Adicionar membro à equipe do projeto
 */
export async function adicionarMembroEquipe(dados: ProjetoEquipeFormData): Promise<ProjetoEquipe> {
  const { data, error } = await supabase
    .from("projeto_equipes")
    .insert(dados)
    .select()
    .single();

  if (error) {
    console.error("Erro ao adicionar membro:", error);
    throw error;
  }

  return data;
}

/**
 * Atualizar membro da equipe
 */
export async function atualizarMembroEquipe(
  id: string,
  dados: Partial<ProjetoEquipeFormData>
): Promise<ProjetoEquipe> {
  const { data, error } = await supabase
    .from("projeto_equipes")
    .update(dados)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar membro:", error);
    throw error;
  }

  return data;
}

/**
 * Remover membro da equipe
 */
export async function removerMembroEquipe(id: string): Promise<void> {
  const { error } = await supabase
    .from("projeto_equipes")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao remover membro:", error);
    throw error;
  }
}

// ============================================================
// ESTATÍSTICAS
// ============================================================

/**
 * Obter estatísticas gerais do cronograma
 */
export async function obterEstatisticas(): Promise<EstatisticasCronograma> {
  // Buscar projetos
  const { data: projetos, error: errorProjetos } = await supabase
    .from("projetos")
    .select("status, nucleo, progresso");

  if (errorProjetos) {
    console.error("Erro ao buscar projetos para estatísticas:", errorProjetos);
    throw errorProjetos;
  }

  // Buscar tarefas
  const { data: tarefas, error: errorTarefas } = await supabase
    .from("cronograma_tarefas")
    .select("status");

  if (errorTarefas) {
    console.error("Erro ao buscar tarefas para estatísticas:", errorTarefas);
    throw errorTarefas;
  }

  // Calcular estatísticas
  const totalProjetos = projetos?.length || 0;
  const projetosPendentes = projetos?.filter((p) => p.status === "pendente").length || 0;
  const projetosEmAndamento = projetos?.filter((p) => p.status === "em_andamento").length || 0;
  const projetosConcluidos = projetos?.filter((p) => p.status === "concluido").length || 0;
  const projetosPausados = projetos?.filter((p) => p.status === "pausado").length || 0;
  const projetosCancelados = projetos?.filter((p) => p.status === "cancelado").length || 0;

  const totalTarefas = tarefas?.length || 0;
  const tarefasPendentes = tarefas?.filter((t) => t.status === "pendente").length || 0;
  const tarefasEmAndamento = tarefas?.filter((t) => t.status === "em_andamento").length || 0;
  const tarefasConcluidas = tarefas?.filter((t) => t.status === "concluido").length || 0;
  const tarefasAtrasadas = tarefas?.filter((t) => t.status === "atrasado").length || 0;

  const progressoMedioGeral =
    projetos && projetos.length > 0
      ? Math.round(
          projetos.reduce((acc, p) => acc + (p.progresso || 0), 0) / projetos.length
        )
      : 0;

  // Agrupar por núcleo
  const nucleos = Array.from(new Set(projetos?.map((p) => p.nucleo).filter(Boolean)));
  const porNucleo = nucleos.map((nucleo) => {
    const projetosDoNucleo = projetos?.filter((p) => p.nucleo === nucleo) || [];
    const progressoMedio =
      projetosDoNucleo.length > 0
        ? Math.round(
            projetosDoNucleo.reduce((acc, p) => acc + (p.progresso || 0), 0) /
              projetosDoNucleo.length
          )
        : 0;

    return {
      nucleo,
      total_projetos: projetosDoNucleo.length,
      progresso_medio: progressoMedio,
    };
  });

  return {
    total_projetos: totalProjetos,
    projetos_pendentes: projetosPendentes,
    projetos_em_andamento: projetosEmAndamento,
    projetos_concluidos: projetosConcluidos,
    projetos_pausados: projetosPausados,
    projetos_cancelados: projetosCancelados,
    total_tarefas: totalTarefas,
    tarefas_pendentes: tarefasPendentes,
    tarefas_em_andamento: tarefasEmAndamento,
    tarefas_concluidas: tarefasConcluidas,
    tarefas_atrasadas: tarefasAtrasadas,
    progresso_medio_geral: progressoMedioGeral,
    por_nucleo: porNucleo,
  };
}

// ============================================================
// HELPERS
// ============================================================

/**
 * Buscar pessoas disponíveis para adicionar em projetos
 * (colaboradores e fornecedores)
 */
export async function buscarPessoasDisponiveis(busca?: string) {
  let query = supabase
    .from("pessoas")
    .select("id, nome, tipo, cpf, telefone, email, avatar_url, foto_url")
    .in("tipo", ["COLABORADOR", "FORNECEDOR", "colaborador", "fornecedor"])
    .order("nome");

  if (busca) {
    query = query.or(`nome.ilike.%${busca}%,cpf.ilike.%${busca}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao buscar pessoas:", error);
    throw error;
  }

  return data || [];
}

/**
 * Buscar contratos ativos para criar novos projetos
 */
export async function buscarContratosAtivos() {
  const { data, error } = await supabase
    .from("contratos")
    .select(`
      id,
      numero,
      cliente_id,
      unidade_negocio,
      data_inicio,
      data_previsao_termino,
      cliente:pessoas!fk_contratos_cliente(id, nome, cpf)
    `)
    .eq("status", "ativo")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar contratos ativos:", error);
    throw error;
  }

  return data || [];
}

// ============================================================
// SINCRONIZACAO AUTOMATICA DE CONTRATOS ATIVOS
// ============================================================

interface ContratoParaSincronizar {
  id: string;
  numero: string;
  cliente_id?: string;
  cliente_nome?: string;
  nucleo?: string;
  data_inicio?: string;
  data_previsao_termino?: string;
  valor_total?: number;
  descricao?: string;
}

interface ItemContrato {
  id: string;
  descricao: string;
  quantidade: number;
  unidade?: string;
  valor_unitario?: number;
  valor_total?: number;
  tipo?: string;
  nucleo?: string;
  categoria?: string;
  ordem: number;
}

interface ResultadoSincronizacao {
  sucesso: boolean;
  projetos_criados: number;
  tarefas_criadas: number;
  contratos_processados: string[];
  erros: string[];
}

/**
 * Buscar contratos ativos que ainda nao tem projeto no cronograma
 */
export async function buscarContratosAtivosSemProjeto(): Promise<ContratoParaSincronizar[]> {
  // Primeiro buscar IDs de contratos que ja tem projeto
  const { data: projetosExistentes } = await supabase
    .from("projetos")
    .select("contrato_id")
    .not("contrato_id", "is", null);

  const idsComProjeto = new Set((projetosExistentes || []).map(p => p.contrato_id));

  // Buscar contratos ativos
  const { data: contratos, error } = await supabase
    .from("contratos")
    .select(`
      id,
      numero,
      cliente_id,
      unidade_negocio,
      data_inicio,
      data_previsao_termino,
      valor_total,
      descricao,
      cliente:pessoas!fk_contratos_cliente(nome)
    `)
    .eq("status", "ativo")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar contratos:", error);
    throw error;
  }

  // Filtrar contratos que nao tem projeto
  const contratosSemProjeto = (contratos || [])
    .filter(c => !idsComProjeto.has(c.id))
    .map(c => ({
      id: c.id,
      numero: c.numero,
      cliente_id: c.cliente_id,
      cliente_nome: (c as any).cliente?.nome,
      nucleo: c.unidade_negocio,
      data_inicio: c.data_inicio,
      data_previsao_termino: (c as any).data_previsao_termino,
      valor_total: c.valor_total,
      descricao: c.descricao,
    }));

  return contratosSemProjeto;
}

/**
 * Criar projeto a partir de um contrato ativo
 */
export async function criarProjetoDeContrato(contrato: ContratoParaSincronizar): Promise<{
  projeto_id: string;
  tarefas_criadas: number;
}> {
  // Criar o projeto
  const { data: projeto, error: projetoError } = await supabase
    .from("projetos")
    .insert({
      nome: `Obra ${contrato.numero} - ${contrato.cliente_nome || 'Cliente'}`,
      descricao: contrato.descricao || `Projeto gerado automaticamente do contrato ${contrato.numero}`,
      cliente_id: contrato.cliente_id,
      contrato_id: contrato.id,
      nucleo: contrato.nucleo || 'engenharia',
      data_inicio: contrato.data_inicio || new Date().toISOString().split('T')[0],
      data_termino: contrato.data_previsao_termino,
      status: 'em_andamento',
      progresso: 0,
    })
    .select()
    .single();

  if (projetoError || !projeto) {
    console.error("Erro ao criar projeto:", projetoError);
    throw new Error(`Erro ao criar projeto para contrato ${contrato.numero}`);
  }

  // Buscar itens do contrato
  const { data: itensContrato, error: itensError } = await supabase
    .from("contratos_itens")
    .select("*")
    .eq("contrato_id", contrato.id)
    .order("ordem", { ascending: true });

  if (itensError) {
    console.error("Erro ao buscar itens:", itensError);
  }

  let tarefas_criadas = 0;

  if (itensContrato && itensContrato.length > 0) {
    // Criar tarefas baseadas nos itens do contrato
    const tarefas = itensContrato.map((item: ItemContrato, index: number) => ({
      projeto_id: projeto.id,
      titulo: item.descricao || `Item ${index + 1}`,
      descricao: `${item.quantidade || 1} ${item.unidade || 'un'} - ${item.tipo || 'servico'}`,
      nucleo: item.nucleo || contrato.nucleo || 'engenharia',
      categoria: item.categoria,
      progresso: 0,
      status: 'pendente',
      ordem: item.ordem || index + 1,
    }));

    const { data: tarefasCriadas, error: tarefasError } = await supabase
      .from("cronograma_tarefas")
      .insert(tarefas)
      .select();

    if (tarefasError) {
      console.error("Erro ao criar tarefas:", tarefasError);
    } else {
      tarefas_criadas = tarefasCriadas?.length || 0;
    }
  } else {
    // Se nao tem itens, criar uma tarefa padrao
    const { data: tarefaPadrao, error: tarefaPadraoError } = await supabase
      .from("cronograma_tarefas")
      .insert({
        projeto_id: projeto.id,
        titulo: "Execucao da Obra",
        descricao: contrato.descricao || "Executar conforme contrato",
        nucleo: contrato.nucleo || 'engenharia',
        progresso: 0,
        status: 'pendente',
        ordem: 1,
      })
      .select();

    if (!tarefaPadraoError) {
      tarefas_criadas = 1;
    }
  }

  return {
    projeto_id: projeto.id,
    tarefas_criadas,
  };
}

/**
 * Sincronizar TODOS os contratos ativos que nao tem projeto
 * Esta funcao cria projetos e tarefas automaticamente
 */
export async function sincronizarContratosAtivos(): Promise<ResultadoSincronizacao> {
  const resultado: ResultadoSincronizacao = {
    sucesso: true,
    projetos_criados: 0,
    tarefas_criadas: 0,
    contratos_processados: [],
    erros: [],
  };

  try {
    // Buscar contratos sem projeto
    const contratosSemProjeto = await buscarContratosAtivosSemProjeto();

    if (contratosSemProjeto.length === 0) {
      return resultado;
    }

    // Processar cada contrato
    for (const contrato of contratosSemProjeto) {
      try {
        const { projeto_id, tarefas_criadas } = await criarProjetoDeContrato(contrato);

        resultado.projetos_criados++;
        resultado.tarefas_criadas += tarefas_criadas;
        resultado.contratos_processados.push(contrato.numero);
      } catch (error: any) {
        resultado.erros.push(`Contrato ${contrato.numero}: ${error.message}`);
      }
    }

    if (resultado.erros.length > 0 && resultado.projetos_criados === 0) {
      resultado.sucesso = false;
    }

    return resultado;
  } catch (error: any) {
    resultado.sucesso = false;
    resultado.erros.push(error.message);
    return resultado;
  }
}
