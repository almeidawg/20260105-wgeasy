// src/lib/financeiroApi.ts
// ✅ ATUALIZADO para usar estrutura do deploy limpo
import { supabaseRaw as supabase } from "@/lib/supabaseClient";

// ============================================================
// TIPOS E INTERFACES
// ============================================================

export type TipoLancamento = "entrada" | "saida";
export type StatusLancamento = "pendente" | "previsto" | "parcialmente_pago" | "pago" | "atrasado" | "cancelado";
export type ApprovalStatus = "pendente" | "aprovado" | "rejeitado";

export interface LancamentoFinanceiro {
  id?: string;
  numero?: string;
  descricao: string;
  valor_total: number;
  tipo: TipoLancamento;
  categoria_id?: string | null;
  status?: StatusLancamento;

  // Núcleo / unidade de negócio
  nucleo?: string | null;
  unidade_negocio?: string | null;

  // Datas
  data_competencia?: string;
  vencimento?: string | null;  // aceitar null quando código passa null
  data_pagamento?: string | null;

  // Relacionamentos
  projeto_id?: string | null;
  contrato_id?: string | null;
  pessoa_id?: string | null;
  cliente_centro_custo_id?: string | null; // Cliente direto como Centro de Custo (sem contrato)

  // Referência genérica
  referencia_tipo?: string | null;
  referencia_id?: string | null;

  // Pagamento
  conta_bancaria?: string | null;
  forma_pagamento?: string | null;
  comprovante_url?: string | null;

  // Observações
  observacoes?: string | null;

  // Subcategoria (ex: Pintura, Pedreiro, Elétrica)
  subcategoria?: string | null;

  // Auditoria
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
  updated_by?: string | null;

  // Aprovação
  approval_status?: ApprovalStatus;
  approval_user_id?: string | null;
  approval_at?: string | null;

  // Relações (para SELECT com JOIN)
  projeto?: { nome: string };
  contrato?: { numero: string; titulo: string; unidade_negocio?: string };
  pessoa?: { nome: string; tipo: string };
  cliente_centro_custo?: { id: string; nome: string }; // Cliente direto como Centro de Custo
}

// ============================================================
// LISTAR LANÇAMENTOS
// ============================================================
export async function listarFinanceiro(): Promise<LancamentoFinanceiro[]> {
  console.log("🔍 Buscando lançamentos...");

  // Primeiro, contar o total de registros no banco
  const { count: totalNoBanco } = await supabase
    .from("financeiro_lancamentos")
    .select("*", { count: "exact", head: true });

  console.log("📊 Total de registros no banco:", totalNoBanco);

  // Supabase tem limite padrão de 1000 registros por consulta
  // Vamos buscar em lotes de 1000 e concatenar
  const BATCH_SIZE = 1000;
  const totalBatches = Math.ceil((totalNoBanco || 0) / BATCH_SIZE);
  let allData: LancamentoFinanceiro[] = [];

  console.log(`📦 Buscando em ${totalBatches} lotes de ${BATCH_SIZE} registros...`);

  for (let i = 0; i < totalBatches; i++) {
    const from = i * BATCH_SIZE;
    const to = from + BATCH_SIZE - 1;

    const { data, error } = await supabase
      .from("financeiro_lancamentos")
      .select(`
        *,
        projeto:projetos(nome),
        pessoa:pessoas!financeiro_lancamentos_pessoa_id_fkey(nome, tipo),
        cliente_centro_custo:pessoas!financeiro_lancamentos_cliente_centro_custo_id_fkey(id, nome)
      `)
      .order("data_competencia", { ascending: false })
      .range(from, to);

    if (error) {
      console.error(`Erro no lote ${i + 1}:`, error);
      throw error;
    }

    if (data && data.length > 0) {
      allData = [...allData, ...data];
      console.log(`✅ Lote ${i + 1}/${totalBatches}: ${data.length} registros (total: ${allData.length})`);
    }
  }

  console.log("📊 Total retornado:", allData.length);

  return allData as LancamentoFinanceiro[];
}

// ============================================================
// BUSCAR LANÇAMENTO POR ID
// ============================================================
export async function buscarLancamento(id: string): Promise<LancamentoFinanceiro | null> {
  const { data, error } = await supabase
    .from("financeiro_lancamentos")
    .select(`
      *,
      projeto:projetos(nome),
      pessoa:pessoas!financeiro_lancamentos_pessoa_id_fkey(nome, tipo),
      cliente_centro_custo:pessoas!financeiro_lancamentos_cliente_centro_custo_id_fkey(id, nome)
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Erro ao buscar lançamento:", error);
    throw error;
  }

  return data as LancamentoFinanceiro;
}

// ============================================================
// CRIAR LANÇAMENTO
// ============================================================
export async function criarLancamento(dados: Omit<LancamentoFinanceiro, 'id' | 'created_at' | 'updated_at'>) {
  // Definir valores padrão e converter strings vazias em null
  const lancamento = {
    ...dados,
    status: dados.status || 'previsto',
    data_competencia: dados.data_competencia || new Date().toISOString().split('T')[0],
    // Converter strings vazias em null para campos de FK
    categoria_id: dados.categoria_id && dados.categoria_id !== '' ? dados.categoria_id : null,
    contrato_id: dados.contrato_id && dados.contrato_id !== '' ? dados.contrato_id : null,
    pessoa_id: dados.pessoa_id && dados.pessoa_id !== '' ? dados.pessoa_id : null,
    projeto_id: dados.projeto_id && dados.projeto_id !== '' ? dados.projeto_id : null,
  };

  console.log('🔍 Criando lançamento:', lancamento);

  const { data, error } = await supabase
    .from("financeiro_lancamentos")
    .insert(lancamento)
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar lançamento:", error);
    console.error("Detalhes:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
    throw new Error(error.message || "Erro desconhecido ao criar lançamento");
  }

  return data;
}

// ============================================================
// ATUALIZAR LANÇAMENTO
// ============================================================
export async function atualizarLancamento(id: string, dados: Partial<LancamentoFinanceiro>) {
  const { data, error } = await supabase
    .from("financeiro_lancamentos")
    .update(dados)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar lançamento:", error);
    throw error;
  }

  return data;
}

// ============================================================
// DELETAR LANÇAMENTO
// ============================================================
export async function deletarLancamento(id: string) {
  const { error } = await supabase
    .from("financeiro_lancamentos")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao deletar lançamento:", error);
    throw error;
  }

  return true;
}

// ============================================================
// LISTAR LANÇAMENTOS POR CONTRATO
// ============================================================
export async function listarFinanceiroPorContrato(contratoId: string): Promise<LancamentoFinanceiro[]> {
  const { data, error } = await supabase
    .from("financeiro_lancamentos")
    .select(`
      *,
      projeto:projetos(nome),
      pessoa:pessoas!financeiro_lancamentos_pessoa_id_fkey(nome, tipo)
    `)
    .eq("contrato_id", contratoId)
    .order("data_competencia", { ascending: false });

  if (error) {
    console.error("Erro ao listar financeiro por contrato:", error);
    throw error;
  }

  return data as LancamentoFinanceiro[];
}

// ============================================================
// LISTAR LANÇAMENTOS POR PROJETO
// ============================================================
export async function listarFinanceiroPorProjeto(projetoId: string): Promise<LancamentoFinanceiro[]> {
  const { data, error } = await supabase
    .from("financeiro_lancamentos")
    .select(`
      *,
      projeto:projetos(nome),
      pessoa:pessoas!financeiro_lancamentos_pessoa_id_fkey(nome, tipo)
    `)
    .eq("projeto_id", projetoId)
    .order("data_competencia", { ascending: false });

  if (error) {
    console.error("Erro ao listar financeiro por projeto:", error);
    throw error;
  }

  return data as LancamentoFinanceiro[];
}

// ============================================================
// LISTAR PESSOAS (CLIENTES/FORNECEDORES)
// ============================================================
export async function listarPessoas(tipo?: string) {
  let query = supabase
    .from("pessoas")
    .select("id, nome, tipo, email, telefone")
    .eq("ativo", true)
    .order("nome");

  if (tipo) {
    query = query.eq("tipo", tipo);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao listar pessoas:", error);
    throw error;
  }

  return data || [];
}

// ============================================================
// LISTAR PROJETOS
// ============================================================
export async function listarProjetos() {
  const { data, error } = await supabase
    .from("projetos")
    .select("id, nome, status, cliente_id, contrato_id")
    .order("nome");

  if (error) {
    console.error("Erro ao listar projetos:", error);
    throw error;
  }

  return data || [];
}

// ============================================================
// LISTAR CONTRATOS
// ============================================================
export async function listarContratos() {
  const { data, error } = await supabase
    .from("contratos")
    .select("id, numero, titulo, status, cliente_id, unidade_negocio, valor_total")
    .order("numero", { ascending: false });

  if (error) {
    console.error("Erro ao listar contratos:", error);
    throw error;
  }

  return data || [];
}

// ============================================================
// BUSCAR NÚCLEOS (UNIDADES DE NEGÓCIO) POR CLIENTE
// ============================================================
export async function buscarNucleosPorCliente(clienteId: string) {
  const { data, error } = await supabase
    .from("contratos")
    .select("unidade_negocio")
    .eq("cliente_id", clienteId)
    .eq("status", "ativo");

  if (error) {
    console.error("Erro ao buscar núcleos:", error);
    throw error;
  }

  // Retornar núcleos únicos
  const nucleosUnicos = [...new Set(data?.map(c => c.unidade_negocio) || [])];
  return nucleosUnicos;
}

// ============================================================
// BUSCAR CONTRATOS POR CLIENTE E NÚCLEO
// ============================================================
export async function buscarContratosPorClienteNucleo(clienteId: string, nucleo?: string) {
  // Se for núcleo especial (produtos, materiais, grupo), não busca contratos
  if (nucleo && ["produtos", "materiais", "grupo"].includes(nucleo)) {
    return [];
  }

  // Status válidos para vincular lançamentos
  const statusValidos = ["ativo", "em_andamento", "Em Andamento", "rascunho"];

  let query = supabase
    .from("contratos")
    .select(`
      id,
      numero,
      titulo,
      descricao,
      status,
      unidade_negocio,
      valor_total,
      cliente_id,
      pessoas!contratos_cliente_id_fkey(nome)
    `)
    .eq("cliente_id", clienteId)
    .in("status", statusValidos)
    .order("numero", { ascending: false });

  // Filtrar por núcleo se fornecido (coluna correta é unidade_negocio)
  if (nucleo) {
    query = query.eq("unidade_negocio", nucleo);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao buscar contratos:", error);
    throw error;
  }

  // Mapear para manter compatibilidade
  return (data || []).map(c => ({
    ...c,
    nucleo: c.unidade_negocio // Alias para compatibilidade
  }));
}

// ============================================================
// BUSCAR CONTRATOS POR NÚCLEO (PARA DESPESAS)
// Busca TODOS os contratos ativos do núcleo, sem filtrar por cliente
// ============================================================
export async function buscarContratosPorNucleo(nucleo: string) {
  // Se for núcleo especial (produtos, materiais, grupo), não busca contratos
  if (["produtos", "materiais", "grupo"].includes(nucleo)) {
    return [];
  }

  // Status válidos para vincular lançamentos
  const statusValidos = ["ativo", "em_andamento", "Em Andamento", "rascunho"];

  const { data, error } = await supabase
    .from("contratos")
    .select(`
      id,
      numero,
      titulo,
      descricao,
      status,
      unidade_negocio,
      valor_total,
      cliente_id,
      pessoas!contratos_cliente_id_fkey(nome)
    `)
    .eq("unidade_negocio", nucleo)
    .in("status", statusValidos)
    .order("numero", { ascending: false });

  if (error) {
    console.error("Erro ao buscar contratos por núcleo:", error);
    throw error;
  }

  // Mapear para incluir nome do cliente no label
  return (data || []).map(c => ({
    ...c,
    nucleo: c.unidade_negocio,
    label: `${c.numero} - ${(c.pessoas as any)?.nome || 'Sem cliente'}`
  }));
}

// ============================================================
// CALCULAR SALDO DO CONTRATO
// ============================================================
export async function calcularSaldoContrato(contratoId: string) {
  const { data: contrato, error: contratoError } = await supabase
    .from("contratos")
    .select("valor_total")
    .eq("id", contratoId)
    .single();

  if (contratoError) {
    console.error("Erro ao buscar contrato:", contratoError);
    throw contratoError;
  }

  const { data: lancamentos, error: lancError } = await supabase
    .from("financeiro_lancamentos")
    .select("tipo, valor_total, status")
    .eq("contrato_id", contratoId);

  if (lancError) {
    console.error("Erro ao buscar lançamentos:", lancError);
    throw lancError;
  }

  // Calcular receita paga
  const receitaPaga = lancamentos
    ?.filter(l => l.tipo === 'entrada' && l.status === 'pago')
    .reduce((sum, l) => sum + Number(l.valor_total), 0) || 0;

  // Calcular despesas
  const despesas = lancamentos
    ?.filter(l => l.tipo === 'saida')
    .reduce((sum, l) => sum + Number(l.valor_total), 0) || 0;

  // Calcular saldo
  const valorContrato = Number(contrato.valor_total) || 0;
  const saldo = receitaPaga - despesas;

  return {
    valorContrato,
    receitaPaga,
    despesas,
    saldo,
    percentualRecebido: valorContrato > 0 ? (receitaPaga / valorContrato) * 100 : 0,
  };
}

// ============================================================
// ESTATÍSTICAS FINANCEIRAS
// ============================================================
export async function obterEstatisticasFinanceiras(dataInicio?: string, dataFim?: string) {
  let query = supabase
    .from("financeiro_lancamentos")
    .select("tipo, valor_total, status, data_competencia");

  if (dataInicio) {
    query = query.gte("data_competencia", dataInicio);
  }
  if (dataFim) {
    query = query.lte("data_competencia", dataFim);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao obter estatísticas:", error);
    throw error;
  }

  // Calcular totais
  const entradas = data?.filter(l => l.tipo === 'entrada').reduce((sum, l) => sum + Number(l.valor_total), 0) || 0;
  const saidas = data?.filter(l => l.tipo === 'saida').reduce((sum, l) => sum + Number(l.valor_total), 0) || 0;
  const saldo = entradas - saidas;

  const entradasPagas = data?.filter(l => l.tipo === 'entrada' && l.status === 'pago').reduce((sum, l) => sum + Number(l.valor_total), 0) || 0;
  const saidasPagas = data?.filter(l => l.tipo === 'saida' && l.status === 'pago').reduce((sum, l) => sum + Number(l.valor_total), 0) || 0;
  const saldoRealizado = entradasPagas - saidasPagas;

  return {
    entradas,
    saidas,
    saldo,
    entradasPagas,
    saidasPagas,
    saldoRealizado,
    totalLancamentos: data?.length || 0
  };
}

// ============================================================
// MARCAR COMO PAGO
// ============================================================
export async function marcarComoPago(id: string, dataPagamento?: string) {
  return atualizarLancamento(id, {
    status: 'pago',
    data_pagamento: dataPagamento || new Date().toISOString().split('T')[0]
  });
}

// ============================================================
// LISTAR EMPRESAS DO GRUPO (para Centro de Custo)
// Busca em pessoas pelo CNPJ das empresas do grupo
// ============================================================
export interface EmpresaGrupo {
  id: string; // ID da pessoa (para usar como cliente_centro_custo_id)
  razao_social: string;
  nome_fantasia: string | null;
  cnpj: string | null;
  nucleo_id: string | null;
  pessoa_id?: string; // ID correspondente em pessoas
}

export async function listarEmpresasGrupo(): Promise<EmpresaGrupo[]> {
  // Buscar empresas do grupo
  const { data: empresas, error: empresasError } = await supabase
    .from("empresas_grupo")
    .select("id, razao_social, nome_fantasia, cnpj, nucleo_id")
    .eq("ativo", true)
    .order("nome_fantasia");

  if (empresasError) {
    console.error("Erro ao listar empresas do grupo:", empresasError);
    throw empresasError;
  }

  if (!empresas || empresas.length === 0) {
    return [];
  }

  // Buscar pessoas correspondentes pelo CNPJ
  const cnpjs = empresas.map(e => e.cnpj).filter(Boolean);

  const { data: pessoas, error: pessoasError } = await supabase
    .from("pessoas")
    .select("id, nome, cnpj")
    .in("cnpj", cnpjs)
    .eq("ativo", true);

  if (pessoasError) {
    console.error("Erro ao buscar pessoas das empresas:", pessoasError);
  }

  // Mapear empresas com IDs de pessoas
  return empresas.map(emp => {
    const pessoa = pessoas?.find(p => p.cnpj === emp.cnpj);
    return {
      ...emp,
      id: pessoa?.id || emp.id, // Usar ID da pessoa se existir
      pessoa_id: pessoa?.id
    };
  });
}

// ============================================================
// CATEGORIAS
// ============================================================
export interface CategoriaFinanceira {
  id: string;
  name: string;
  kind: 'income' | 'expense';
}

// Carregar categorias do banco de dados
export async function obterCategorias(tipo?: TipoLancamento): Promise<CategoriaFinanceira[]> {
  let query = supabase
    .from("fin_categories")
    .select("id, name, kind")
    .order("name");

  // Filtrar por tipo se especificado
  if (tipo) {
    const kind = tipo === 'entrada' ? 'income' : 'expense';
    query = query.eq("kind", kind);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao obter categorias:", error);
    throw error;
  }

  return data as CategoriaFinanceira[];
}

// Categorias hardcoded como fallback (não usar - carregar do banco)
export const CATEGORIAS_FINANCEIRAS = [
  // Receitas
  { nome: 'Vendas', tipo: 'entrada' },
  { nome: 'Prestação de Serviços', tipo: 'entrada' },
  { nome: 'Comissões', tipo: 'entrada' },
  { nome: 'Recebimento de Cliente', tipo: 'entrada' },
  { nome: 'Outras Receitas', tipo: 'entrada' },

  // Despesas
  { nome: 'Salários', tipo: 'saida' },
  { nome: 'Fornecedores', tipo: 'saida' },
  { nome: 'Materiais', tipo: 'saida' },
  { nome: 'Aluguel', tipo: 'saida' },
  { nome: 'Energia', tipo: 'saida' },
  { nome: 'Telefone/Internet', tipo: 'saida' },
  { nome: 'Impostos', tipo: 'saida' },
  { nome: 'Serviços Terceirizados', tipo: 'saida' },
  { nome: 'Despesas Administrativas', tipo: 'saida' },
  { nome: 'Outras Despesas', tipo: 'saida' },
];
