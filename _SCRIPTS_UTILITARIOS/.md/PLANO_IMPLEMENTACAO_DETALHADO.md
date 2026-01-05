# 🚀 PLANO DE IMPLEMENTAÇÃO DETALHADO - WGEASY

## Guia Técnico com Código Pronto para Executar

---

## FASE 1: UNIFICAÇÃO DE TIPOS (Dia 1-2)

### Tarefa 1.1: Criar Schema Canônico

**Arquivo:** `src/types/schema.ts` (NOVO)

```typescript
// ============================================================
// TIPOS CANÔNICOS - Fonte única de verdade
// ============================================================
// Este arquivo define todos os tipos principais do sistema
// Evita duplicação e inconsistência

import type { Database } from "@/types/supabase"; // se disponível

// ============================================================
// PESSOAS & AUTENTICAÇÃO
// ============================================================

export type TipoPessoa =
  | "cliente"
  | "colaborador"
  | "fornecedor"
  | "especificador";

export interface Pessoa {
  readonly id: string;
  readonly email: string;
  readonly nome: string;
  readonly tipo: TipoPessoa;
  readonly empresa?: string | null;
  readonly avatar_url?: string | null;
  readonly criado_em: string; // ISO date
  readonly atualizado_em: string;
}

export interface UsuarioLogado extends Pessoa {
  readonly pessoa_id: string;
  readonly auth_user_id: string;
  readonly ultimo_acesso: string | null;
}

// Type Guards
export function isPessoa(obj: unknown): obj is Pessoa {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "email" in obj &&
    "nome" in obj &&
    "tipo" in obj
  );
}

export function isUsuarioLogado(obj: unknown): obj is UsuarioLogado {
  return isPessoa(obj) && "pessoa_id" in obj && "auth_user_id" in obj;
}

// Conversores
export const toPessoa = (raw: any): Pessoa => {
  if (!raw || typeof raw !== "object") throw new Error("Invalid pessoa data");
  return {
    id: String(raw.id),
    email: String(raw.email),
    nome: String(raw.nome || raw.name || ""),
    tipo: raw.tipo as TipoPessoa,
    empresa: raw.empresa || null,
    avatar_url: raw.avatar_url || null,
    criado_em: String(raw.criado_em),
    atualizado_em: String(raw.atualizado_em),
  };
};

// ============================================================
// OPORTUNIDADES
// ============================================================

export type OportunidadeEstágio =
  | "lead"
  | "qualificacao"
  | "proposta"
  | "negociacao"
  | "fechamento"
  | "ganho"
  | "perdido";

export interface Oportunidade {
  readonly id: string;
  readonly numero: string;
  readonly cliente_id: string;
  readonly titulo: string;
  readonly descricao?: string | null;
  readonly valor: number;
  readonly estagio: OportunidadeEstágio;
  readonly probabilidade: number; // 0-100
  readonly data_prevista_fechamento: string | null; // ISO date
  readonly criado_em: string;
  readonly atualizado_em: string;
  readonly criado_por: string;
}

export const toOportunidade = (raw: any): Oportunidade => {
  return {
    id: String(raw.id),
    numero: String(raw.numero),
    cliente_id: String(raw.cliente_id),
    titulo: String(raw.titulo),
    descricao: raw.descricao || null,
    valor: Number(raw.valor || 0),
    estagio: raw.estagio as OportunidadeEstágio,
    probabilidade: Number(raw.probabilidade || 0),
    data_prevista_fechamento: raw.data_prevista_fechamento || null,
    criado_em: String(raw.criado_em),
    atualizado_em: String(raw.atualizado_em),
    criado_por: String(raw.criado_por),
  };
};

// ============================================================
// CONTRATOS
// ============================================================

export type StatusContrato =
  | "rascunho"
  | "ativo"
  | "pausado"
  | "concluido"
  | "cancelado"
  | "pendente";

export type UnidadeNegocio =
  | "arquitetura"
  | "engenharia"
  | "marcenaria"
  | "produtos";

export interface Contrato {
  readonly id: string;
  readonly numero: string;
  readonly cliente_id: string;
  readonly cliente_nome?: string;
  readonly oportunidade_id: string | null;
  readonly proposta_id?: string | null;
  readonly unidade_negocio: UnidadeNegocio;
  readonly valor_total: number;
  readonly valor_mao_obra: number;
  readonly valor_materiais: number;
  readonly status: StatusContrato;
  readonly data_inicio: string | null;
  readonly data_previsao_termino: string | null;
  readonly data_termino_real: string | null;
  readonly criado_em: string;
  readonly atualizado_em: string;
}

export const toContrato = (raw: any): Contrato => {
  return {
    id: String(raw.id),
    numero: String(raw.numero),
    cliente_id: String(raw.cliente_id),
    cliente_nome: raw.cliente_nome || raw.cliente?.nome || undefined,
    oportunidade_id: raw.oportunidade_id || null,
    proposta_id: raw.proposta_id || null,
    unidade_negocio: raw.unidade_negocio as UnidadeNegocio,
    valor_total: Number(raw.valor_total || 0),
    valor_mao_obra: Number(raw.valor_mao_obra || 0),
    valor_materiais: Number(raw.valor_materiais || 0),
    status: raw.status as StatusContrato,
    data_inicio: raw.data_inicio || null,
    data_previsao_termino: raw.data_previsao_termino || null,
    data_termino_real: raw.data_termino_real || null,
    criado_em: String(raw.criado_em),
    atualizado_em: String(raw.atualizado_em),
  };
};

// ============================================================
// PROJETOS (Cronograma)
// ============================================================

export type StatusProjeto =
  | "rascunho"
  | "planejamento"
  | "execucao"
  | "atrasado"
  | "ativo"
  | "concluido"
  | "cancelado";

export interface Projeto {
  readonly id: string;
  readonly nome: string;
  readonly descricao?: string | null;
  readonly cliente_id: string;
  readonly contrato_id?: string | null;
  readonly unidade_negocio?: UnidadeNegocio;
  readonly status: StatusProjeto;
  readonly data_inicio: string | null;
  readonly data_fim_prevista: string | null;
  readonly data_fim_real: string | null;
  readonly percentual_conclusao: number; // 0-100
  readonly criado_em: string;
  readonly atualizado_em: string;
}

export const toProjeto = (raw: any): Projeto => {
  return {
    id: String(raw.id),
    nome: String(raw.nome || raw.name || ""),
    descricao: raw.descricao || null,
    cliente_id: String(raw.cliente_id),
    contrato_id: raw.contrato_id || null,
    unidade_negocio: raw.unidade_negocio as UnidadeNegocio | undefined,
    status: raw.status as StatusProjeto,
    data_inicio: raw.data_inicio || null,
    data_fim_prevista: raw.data_fim_prevista || raw.data_termino || null,
    data_fim_real: raw.data_fim_real || null,
    percentual_conclusao: Number(raw.percentual_conclusao || 0),
    criado_em: String(raw.criado_em),
    atualizado_em: String(raw.atualizado_em),
  };
};

// ============================================================
// TAREFAS (Cronograma)
// ============================================================

export type StatusTarefa =
  | "nao_iniciada"
  | "em_andamento"
  | "bloqueada"
  | "concluida"
  | "atrasada";

export interface CronogramaTarefa {
  readonly id: string;
  readonly projeto_id: string;
  readonly titulo: string;
  readonly descricao?: string | null;
  readonly status: StatusTarefa;
  readonly data_inicio: string | null;
  readonly data_fim_prevista: string | null;
  readonly data_fim_real: string | null;
  readonly percentual_conclusao: number;
  readonly responsavel_id?: string | null;
  readonly ordem: number;
  readonly criado_em: string;
}

export const toCronogramaTarefa = (raw: any): CronogramaTarefa => {
  return {
    id: String(raw.id),
    projeto_id: String(raw.projeto_id),
    titulo: String(raw.titulo || raw.title || ""),
    descricao: raw.descricao || null,
    status: raw.status as StatusTarefa,
    data_inicio: raw.data_inicio || null,
    data_fim_prevista: raw.data_fim_prevista || raw.data_fim || null,
    data_fim_real: raw.data_fim_real || null,
    percentual_conclusao: Number(raw.percentual_conclusao || 0),
    responsavel_id: raw.responsavel_id || null,
    ordem: Number(raw.ordem || 0),
    criado_em: String(raw.criado_em),
  };
};

// ============================================================
// FINANCEIRO
// ============================================================

export type TipoLancamento = "entrada" | "saida";
export type StatusLancamento = "previsto" | "pendente" | "pago" | "cancelado";

export interface LancamentoFinanceiro {
  readonly id: string;
  readonly contrato_id?: string | null;
  readonly projeto_id?: string | null;
  readonly tipo: TipoLancamento;
  readonly descricao: string;
  readonly valor_total: number;
  readonly valor_pago?: number | null;
  readonly status: StatusLancamento;
  readonly data_competencia: string;
  readonly vencimento: string;
  readonly data_pagamento?: string | null;
  readonly criado_em: string;
}

export const toLancamentoFinanceiro = (raw: any): LancamentoFinanceiro => {
  return {
    id: String(raw.id),
    contrato_id: raw.contrato_id || null,
    projeto_id: raw.projeto_id || null,
    tipo: raw.tipo as TipoLancamento,
    descricao: String(raw.descricao || ""),
    valor_total: Number(raw.valor_total || 0),
    valor_pago: raw.valor_pago || null,
    status: raw.status as StatusLancamento,
    data_competencia: String(raw.data_competencia),
    vencimento: String(raw.vencimento),
    data_pagamento: raw.data_pagamento || null,
    criado_em: String(raw.criado_em),
  };
};

// ============================================================
// PRICELIST
// ============================================================

export interface PricelistItem {
  readonly id: string;
  readonly nome: string;
  readonly descricao?: string | null;
  readonly categoria_id: string;
  readonly subcategoria_id?: string | null;
  readonly nucleo_id?: string | null;
  readonly preco: number;
  readonly custo?: number | null;
  readonly margem?: number | null;
  readonly ativo: boolean;
  readonly criado_em: string;
}

export const toPricelistItem = (raw: any): PricelistItem => {
  return {
    id: String(raw.id),
    nome: String(raw.nome || raw.description || ""),
    descricao: raw.descricao || null,
    categoria_id: String(raw.categoria_id),
    subcategoria_id: raw.subcategoria_id || null,
    nucleo_id: raw.nucleo_id || null,
    preco: Number(raw.preco || raw.unitPrice || 0),
    custo: raw.custo || null,
    margem: raw.margem || null,
    ativo: raw.ativo !== false,
    criado_em: String(raw.criado_em),
  };
};

// ============================================================
// EXPORTS
// ============================================================

export const Converters = {
  pessoa: toPessoa,
  oportunidade: toOportunidade,
  contrato: toContrato,
  projeto: toProjeto,
  tarefa: toCronogramaTarefa,
  lancamento: toLancamentoFinanceiro,
  pricelist: toPricelistItem,
} as const;
```

---

### Tarefa 1.2: Criar Enum Maps

**Arquivo:** `src/constants/enums.ts` (NOVO)

```typescript
// ============================================================
// ENUMERAÇÕES & MAPEAMENTOS
// ============================================================

import type {
  StatusContrato,
  StatusProjeto,
  StatusTarefa,
  OportunidadeEstágio,
  TipoLancamento,
  TipoPessoa,
  UnidadeNegocio,
} from "@/types/schema";

// ============================================================
// STATUS CONTRATO
// ============================================================

export const STATUS_CONTRATO = {
  RASCUNHO: "rascunho",
  ATIVO: "ativo",
  PAUSADO: "pausado",
  CONCLUIDO: "concluido",
  CANCELADO: "cancelado",
  PENDENTE: "pendente",
} as const;

export const STATUS_CONTRATO_LABELS: Record<StatusContrato, string> = {
  rascunho: "Rascunho",
  ativo: "Ativo",
  pausado: "Pausado",
  concluido: "Concluído",
  cancelado: "Cancelado",
  pendente: "Pendente",
};

export const STATUS_CONTRATO_COLORS: Record<StatusContrato, string> = {
  rascunho: "#9ca3af", // gray
  ativo: "#10b981", // green
  pausado: "#f59e0b", // amber
  concluido: "#3b82f6", // blue
  cancelado: "#ef4444", // red
  pendente: "#f25c26", // orange (WG)
};

export const STATUS_CONTRATO_ICONS: Record<StatusContrato, string> = {
  rascunho: "FileText",
  ativo: "CheckCircle2",
  pausado: "Pause",
  concluido: "CheckSquare",
  cancelado: "XCircle",
  pendente: "Clock",
};

// ============================================================
// STATUS PROJETO
// ============================================================

export const STATUS_PROJETO = {
  RASCUNHO: "rascunho",
  PLANEJAMENTO: "planejamento",
  EXECUCAO: "execucao",
  ATRASADO: "atrasado",
  ATIVO: "ativo",
  CONCLUIDO: "concluido",
  CANCELADO: "cancelado",
} as const;

export const STATUS_PROJETO_LABELS: Record<StatusProjeto, string> = {
  rascunho: "Rascunho",
  planejamento: "Planejamento",
  execucao: "Em Execução",
  atrasado: "Atrasado",
  ativo: "Ativo",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

export const STATUS_PROJETO_COLORS: Record<StatusProjeto, string> = {
  rascunho: "#9ca3af", // gray
  planejamento: "#8b5cf6", // violet
  execucao: "#f59e0b", // amber
  atrasado: "#ef4444", // red
  ativo: "#10b981", // green
  concluido: "#3b82f6", // blue
  cancelado: "#6b7280", // gray-500
};

// ============================================================
// STATUS TAREFA
// ============================================================

export const STATUS_TAREFA = {
  NAO_INICIADA: "nao_iniciada",
  EM_ANDAMENTO: "em_andamento",
  BLOQUEADA: "bloqueada",
  CONCLUIDA: "concluida",
  ATRASADA: "atrasada",
} as const;

export const STATUS_TAREFA_LABELS: Record<StatusTarefa, string> = {
  nao_iniciada: "Não Iniciada",
  em_andamento: "Em Andamento",
  bloqueada: "Bloqueada",
  concluida: "Concluída",
  atrasada: "Atrasada",
};

// ============================================================
// OPORTUNIDADE ESTÁGIO
// ============================================================

export const OPORTUNIDADE_ESTAGIO = {
  LEAD: "lead",
  QUALIFICACAO: "qualificacao",
  PROPOSTA: "proposta",
  NEGOCIACAO: "negociacao",
  FECHAMENTO: "fechamento",
  GANHO: "ganho",
  PERDIDO: "perdido",
} as const;

export const OPORTUNIDADE_ESTAGIO_LABELS: Record<OportunidadeEstágio, string> =
  {
    lead: "Lead",
    qualificacao: "Qualificação",
    proposta: "Proposta",
    negociacao: "Negociação",
    fechamento: "Fechamento",
    ganho: "Ganho",
    perdido: "Perdido",
  };

// ============================================================
// UNIDADE DE NEGÓCIO
// ============================================================

export const UNIDADE_NEGOCIO = {
  ARQUITETURA: "arquitetura",
  ENGENHARIA: "engenharia",
  MARCENARIA: "marcenaria",
  PRODUTOS: "produtos",
} as const;

export const UNIDADE_NEGOCIO_LABELS: Record<UnidadeNegocio, string> = {
  arquitetura: "Arquitetura",
  engenharia: "Engenharia",
  marcenaria: "Marcenaria",
  produtos: "Produtos",
};

export const UNIDADE_NEGOCIO_COLORS: Record<UnidadeNegocio, string> = {
  arquitetura: "#5E9B94", // Verde Mineral
  engenharia: "#2B4580", // Azul Técnico
  marcenaria: "#8B5E3C", // Marrom Carvalho
  produtos: "#F25C26", // Laranja WG
};

// ============================================================
// TIPO PESSOA
// ============================================================

export const TIPO_PESSOA = {
  CLIENTE: "cliente",
  COLABORADOR: "colaborador",
  FORNECEDOR: "fornecedor",
  ESPECIFICADOR: "especificador",
} as const;

export const TIPO_PESSOA_LABELS: Record<TipoPessoa, string> = {
  cliente: "Cliente",
  colaborador: "Colaborador",
  fornecedor: "Fornecedor",
  especificador: "Especificador",
};

// ============================================================
// TIPO LANÇAMENTO
// ============================================================

export const TIPO_LANCAMENTO = {
  ENTRADA: "entrada",
  SAIDA: "saida",
} as const;

export const TIPO_LANCAMENTO_LABELS: Record<TipoLancamento, string> = {
  entrada: "Entrada (Receita)",
  saida: "Saída (Despesa)",
};
```

---

## FASE 2: EXPORTAR TIPOS FALTANTES (Dia 2-3)

### Tarefa 2.1: Corrigir AssistenciaApi

**Arquivo:** `src/lib/assistenciaApi.ts`

```typescript
// Adicionar ao final do arquivo:

// ============================================================
// TIPOS EXPORTÁVEIS
// ============================================================

export type OrdemServicoCompleta = ReturnType<
  typeof listarOrdensServico
> extends Promise<infer T>
  ? T[0]
  : never;

export interface OrdemServicoFormData {
  cliente_id: string;
  descricao: string;
  data_prevista: string;
  prioridade: "baixa" | "media" | "alta";
}

export interface ItemOSFormData {
  ordem_servico_id: string;
  descricao: string;
  valor: number;
  quantidade: number;
}

export interface OSEstatisticas {
  total: number;
  abertas: number;
  em_andamento: number;
  concluidas: number;
  valor_total: number;
}

// Implementar função que falta:
export async function obterEstatisticasOS(): Promise<OSEstatisticas> {
  const { data } = await supabase
    .from("assistencia_ordens_servico")
    .select("id, status, valor_total", { count: "exact" });

  const ordens = data || [];

  return {
    total: ordens.length,
    abertas: ordens.filter((o) => o.status === "aberta").length,
    em_andamento: ordens.filter((o) => o.status === "em_andamento").length,
    concluidas: ordens.filter((o) => o.status === "concluida").length,
    valor_total: ordens.reduce((sum, o) => sum + (o.valor_total || 0), 0),
  };
}
```

---

### Tarefa 2.2: Corrigir AmbientesApi

**Arquivo:** `src/lib/ambientesApi.ts`

```typescript
// Adicionar ao final:

export interface AmbienteQuantitativo {
  id: string;
  ambiente_id: string;
  nucleo_id: string;
  quantidade_itens: number;
  valor_total: number;
  criado_em: string;
}

export async function listarQuantitativosAmbiente(ambiente_id: string) {
  const { data, error } = await supabase
    .from("ambientes_quantitativos")
    .select("*")
    .eq("ambiente_id", ambiente_id);

  if (error) throw error;
  return data || [];
}

export async function gerarQuantitativosBasicos(ambiente_id: string) {
  // Gera estrutura padrão de quantitativo
  const { data, error } = await supabase
    .from("ambientes_quantitativos")
    .insert({
      ambiente_id,
      nucleo_id: "arquitetura",
      quantidade_itens: 0,
      valor_total: 0,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function recalcularQuantitativosAmbiente(ambiente_id: string) {
  // Recalcula totais baseado em items vinculados
  const { data: itens } = await supabase
    .from("ambientes_quantitativo_itens")
    .select("quantidade, preco_unitario")
    .eq("ambiente_id", ambiente_id);

  const total = (itens || []).reduce(
    (sum, item) => sum + item.quantidade * item.preco_unitario,
    0
  );

  await supabase
    .from("ambientes_quantitativos")
    .update({
      valor_total: total,
      quantidade_itens: itens?.length || 0,
    })
    .eq("ambiente_id", ambiente_id);
}
```

---

### Tarefa 2.3: Corrigir PessoasApi

**Arquivo:** `src/lib/pessoasApi.ts`

```typescript
// Adicionar função que falta:

export async function listarObrasPessoa(pessoa_id: string) {
  const { data, error } = await supabase
    .from("projetos")
    .select("*")
    .eq("cliente_id", pessoa_id)
    .order("criado_em", { ascending: false });

  if (error) throw error;
  return data || [];
}
```

---

## FASE 3: MIGRAR PARA REACT QUERY (Dia 4-7)

### Tarefa 3.1: Criar Query Hooks

**Arquivo:** `src/hooks/queries/useProjeto.ts` (NOVO)

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cronogramaApi } from "@/lib/cronogramaApi";
import { Projeto, toProjeto } from "@/types/schema";

// Query key factory
export const projetoKeys = {
  all: ["projetos"] as const,
  lists: () => [...projetoKeys.all, "list"] as const,
  list: (filters?: any) => [...projetoKeys.lists(), { filters }] as const,
  details: () => [...projetoKeys.all, "detail"] as const,
  detail: (id: string) => [...projetoKeys.details(), id] as const,
  completo: (id: string) => [...projetoKeys.detail(id), "completo"] as const,
};

// ============================================================
// QUERIES
// ============================================================

export function useProjeto(id: string) {
  return useQuery({
    queryKey: projetoKeys.detail(id),
    queryFn: async () => {
      const data = await cronogramaApi.buscarProjeto(id);
      return toProjeto(data);
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

export function useProjetoCompleto(id: string) {
  return useQuery({
    queryKey: projetoKeys.completo(id),
    queryFn: async () => {
      // Uma única query otimizada com JOINs
      const { data } = await supabase
        .from("projetos")
        .select(
          `
          *,
          tarefas: cronograma_tarefas(
            *,
            comentarios: comentarios(*)
          ),
          equipe: projeto_equipes(
            *,
            pessoa: pessoas(nome, email, avatar_url)
          )
        `
        )
        .eq("id", id)
        .single();

      return data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

export function useProjetos(filters?: any) {
  return useQuery({
    queryKey: projetoKeys.list(filters),
    queryFn: async () => {
      let query = supabase.from("projetos").select("*");

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.cliente_id) {
        query = query.eq("cliente_id", filters.cliente_id);
      }

      const { data } = await query.order("criado_em", { ascending: false });
      return (data || []).map(toProjeto);
    },
    staleTime: 1000 * 60 * 2,
  });
}

// ============================================================
// MUTATIONS
// ============================================================

export function useCriarProjeto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Projeto>) => {
      const response = await cronogramaApi.criarProjeto(data);
      return toProjeto(response);
    },
    onSuccess: (data) => {
      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: projetoKeys.lists() });
      // Adicionar à cache
      queryClient.setQueryData(projetoKeys.detail(data.id), data);
    },
  });
}

export function useAtualizarProjeto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Projeto> & { id: string }) => {
      const { id, ...updates } = data;
      const response = await cronogramaApi.atualizarProjeto(id, updates);
      return toProjeto(response);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(projetoKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: projetoKeys.lists() });
    },
  });
}

export function useDeletarProjeto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await cronogramaApi.deletarProjeto(id);
      return id;
    },
    onSuccess: (id) => {
      queryClient.removeQueries({ queryKey: projetoKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: projetoKeys.lists() });
    },
  });
}
```

---

### Tarefa 3.2: Usar em Componente

**Arquivo:** `src/pages/cronograma/ProjectDetailPage.tsx` (REFATORADO)

```typescript
// Antes: 2000 linhas com 20+ estados
// Depois: 300 linhas, orquestra hooks

import {
  useProjetoCompleto,
  useAtualizarProjeto,
} from "@/hooks/queries/useProjeto";
import ProjectHeader from "./components/ProjectHeader";
import TasksTable from "./components/TasksTable";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: projeto, isLoading, error } = useProjetoCompleto(id!);
  const { mutate: atualizar, isPending } = useAtualizarProjeto();

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error.message}</div>;
  if (!projeto) return <div>Projeto não encontrado</div>;

  return (
    <div className="space-y-6">
      <ProjectHeader
        projeto={projeto}
        onUpdate={(data) => atualizar({ ...projeto, ...data })}
      />
      <TasksTable tarefas={projeto.tarefas} projetoId={id!} />
      {/* ... mais componentes */}
    </div>
  );
}
```

---

## FASE 4: IMPLEMENTAR RLS POLICIES (Dia 8-9)

### Tarefa 4.1: Ativar RLS

**Arquivo:** `supabase/migrations/add_rls_policies.sql` (NOVO)

```sql
-- ============================================================
-- ATIVAR RLS EM TABELAS CRÍTICAS
-- ============================================================

-- Contratos
ALTER TABLE contratos ENABLE ROW LEVEL SECURITY;

-- Projetos
ALTER TABLE projetos ENABLE ROW LEVEL SECURITY;

-- Tarefas
ALTER TABLE cronograma_tarefas ENABLE ROW LEVEL SECURITY;

-- Financeiro
ALTER TABLE financeiro ENABLE ROW LEVEL SECURITY;

-- Oportunidades
ALTER TABLE oportunidades ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLICIES: CONTRATOS
-- ============================================================

-- Usuário vê contratos do seu cliente
CREATE POLICY "contratos_see_own"
  ON contratos
  FOR SELECT
  USING (
    cliente_id = (
      SELECT pessoa_id FROM usuarios
      WHERE auth_user_id = auth.uid()
    )
    OR created_by = auth.uid()
  );

-- Apenas criador ou admin edita contratos não-finalizados
CREATE POLICY "contratos_update_own"
  ON contratos
  FOR UPDATE
  USING (
    (
      created_by = auth.uid()
      AND status NOT IN ('concluido', 'cancelado')
    )
    OR EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo = 'admin'
    )
  );

-- ============================================================
-- POLICIES: PROJETOS
-- ============================================================

CREATE POLICY "projetos_see_own"
  ON projetos
  FOR SELECT
  USING (
    cliente_id = (
      SELECT pessoa_id FROM usuarios
      WHERE auth_user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM projeto_equipes pe
      WHERE pe.projeto_id = projetos.id
      AND pe.pessoa_id = (
        SELECT pessoa_id FROM usuarios
        WHERE auth_user_id = auth.uid()
      )
    )
  );

-- ============================================================
-- POLICIES: TAREFAS
-- ============================================================

CREATE POLICY "tarefas_see_if_projeto_accessible"
  ON cronograma_tarefas
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projetos p
      WHERE p.id = cronograma_tarefas.projeto_id
      AND (
        p.cliente_id = (
          SELECT pessoa_id FROM usuarios
          WHERE auth_user_id = auth.uid()
        )
        OR EXISTS (
          SELECT 1 FROM projeto_equipes pe
          WHERE pe.projeto_id = p.id
          AND pe.pessoa_id = (
            SELECT pessoa_id FROM usuarios
            WHERE auth_user_id = auth.uid()
          )
        )
      )
    )
  );

-- ============================================================
-- POLICIES: FINANCEIRO
-- ============================================================

CREATE POLICY "financeiro_see_own_contracts"
  ON financeiro
  FOR SELECT
  USING (
    contrato_id IS NULL
    OR EXISTS (
      SELECT 1 FROM contratos c
      WHERE c.id = financeiro.contrato_id
      AND c.cliente_id = (
        SELECT pessoa_id FROM usuarios
        WHERE auth_user_id = auth.uid()
      )
    )
  );
```

---

## PRÓXIMOS PASSOS

1. **Executar arquivos de tipo:** Aplicar `schema.ts` e `enums.ts`
2. **Testar compilação:** `npx tsc --noEmit`
3. **Verificar erros:** Deve reduzir para ~50 erros
4. **Migrar páginas:** Começar com ProjectDetailPage
5. **Ativar RLS:** Testar policies em staging

---

**Tempo estimado:** 5-7 dias para todas as fases
**Benefício esperado:** Redução 70% de erros, eliminação de race conditions, melhor performance
