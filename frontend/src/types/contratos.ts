// ============================================================
// TYPES: Módulo de Contratos
// Sistema WG Easy - Grupo WG Almeida
// ============================================================

export type UnidadeNegocio = "arquitetura" | "engenharia" | "marcenaria" | "moma_engenharia" | "moma_planejados";

export type StatusContrato =
  | "rascunho"
  | "aguardando_assinatura"
  | "ativo"
  | "concluido"
  | "cancelado";

export type TipoItemContrato = "mao_obra" | "material";

// ============================================================
// Interfaces auxiliares reutilizáveis
// ============================================================
export interface ContratoDadosCliente {
  nome: string;
  nacionalidade?: string;
  estado_civil?: string;
  rg?: string;
  cpf?: string;
  endereco?: string;
  bairro?: string;
  cep?: string;
  cidade?: string;
  estado?: string;
  profissao?: string;
  telefone?: string;
  email?: string;
}

export interface ContratoDadosImovel {
  endereco_completo: string;
  numero?: string;
  complemento?: string;
  apartamento?: string;
  torre?: string;
  condominio?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  matricula?: string;
  inscricao_imobiliaria?: string;
  horario_seg_sex?: string;
  horario_sabado?: string;
}

// ============================================================
// Interface: Contrato
// ============================================================
export interface Contrato {
  id: string;
  numero: string;
  oportunidade_id: string | null;
  cliente_id: string | null;
  cliente_nome?: string; // Nome do cliente (pode vir do JOIN)
  unidade_negocio: UnidadeNegocio;

  // Valores
  valor_total: number;
  valor_mao_obra: number;
  valor_materiais: number;

  // Status
  status: StatusContrato;
  data_inicio: string | null; // ISO date
  data_previsao_termino: string | null; // ISO date
  data_termino_real: string | null; // ISO date

  // Documentos
  documento_url: string | null;
  assinatura_cliente_base64: string | null;
  assinatura_responsavel_base64: string | null;
  data_assinatura: string | null; // ISO datetime

  // Relacionamentos
  obra_id: string | null;
  cronograma_id: string | null;

  // Observações
  observacoes: string | null;
  condicoes_contratuais: string | null;

  // Dados cacheados para PDF/WhatsApp
  dados_cliente_json?: ContratoDadosCliente | null;
  dados_imovel_json?: ContratoDadosImovel | null;

  // Auditoria
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

// ============================================================
// Interface: Contrato com dados agregados (da view)
// ============================================================
export interface ContratoCompleto extends Contrato {
  cliente_nome?: string;
  oportunidade_titulo?: string;
  descricao?: string; // Descrição do contrato
  prazo_entrega_dias?: number; // Prazo em dias
  data_criacao?: string; // Alias para created_at
  total_itens: number;
  total_mao_obra_itens: number;
  total_material_itens: number;

  // Dados relacionados (carregados separadamente)
  itens?: ContratoItem[];
  cliente?: {
    id: string;
    nome: string;
    email?: string;
    telefone?: string;
  };
}

// ============================================================
// Interface: Item do Contrato
// ============================================================
export interface ContratoItem {
  id: string;
  contrato_id: string;
  tipo: TipoItemContrato;

  // Item (referência ao pricelist, se aplicável)
  pricelist_item_id: string | null;

  // Descrição customizada
  descricao: string;
  quantidade: number;
  unidade: string;
  valor_unitario: number;
  valor_total: number;
  preco_unitario?: number; // Alias legado
  preco_total?: number; // Alias legado
  producao_diaria?: number | null;
  dias_estimados?: number | null;

  // Cronograma
  percentual_valor: number | null;
  ordem_execucao: number;

  // Observações
  especificacoes: string | null;

  created_at: string;
}

// ============================================================
// Interface: Formulário de criação/edição de contrato
// ============================================================
export interface ContratoFormData {
  oportunidade_id?: string;
  cliente_id: string;
  unidade_negocio: UnidadeNegocio;
  descricao?: string; // Descrição do contrato
  prazo_entrega_dias?: number; // Prazo em dias
  data_inicio?: string;
  data_previsao_termino?: string;
  observacoes?: string;
  condicoes_contratuais?: string;
}

// ============================================================
// Interface: Formulário de item do contrato
// ============================================================
export interface ContratoItemFormData {
  tipo: TipoItemContrato;
  pricelist_item_id?: string;
  descricao: string;
  quantidade: number;
  unidade: string;
  valor_unitario: number;
  producao_diaria?: number | null;
  percentual_valor?: number;
  ordem_execucao?: number;
  especificacoes?: string;
}

// ============================================================
// Interface: Assinatura do contrato
// ============================================================
export interface ContratoAssinatura {
  contrato_id: string;
  tipo: "cliente" | "responsavel";
  assinatura_base64: string;
  nome_assinante: string;
  documento_assinante?: string; // CPF/CNPJ
  ip_address?: string;
  user_agent?: string;
}

// ============================================================
// Interface: Filtros de busca
// ============================================================
export interface ContratosFiltros {
  status?: StatusContrato[];
  unidade_negocio?: UnidadeNegocio[];
  cliente_id?: string;
  data_inicio?: string;
  data_fim?: string;
  busca?: string; // busca por número ou cliente
}

// ============================================================
// Interface: Estatísticas de contratos
// ============================================================
export interface ContratosEstatisticas {
  total_contratos: number;
  contratos_rascunho: number;
  contratos_ativos: number;
  contratos_concluidos: number;
  contratos_cancelados: number;
  valor_total_ativos: number;
  valor_total_mes: number;
}

// ============================================================
// Helpers e Utilitários
// ============================================================

export const STATUS_CONTRATO_LABELS: Record<StatusContrato, string> = {
  rascunho: "Rascunho",
  aguardando_assinatura: "Aguardando Assinatura",
  ativo: "Ativo",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

export const STATUS_CONTRATO_COLORS: Record<StatusContrato, string> = {
  rascunho: "#9CA3AF", // Cinza
  aguardando_assinatura: "#F59E0B", // Amarelo
  ativo: "#3B82F6", // Azul
  concluido: "#10B981", // Verde
  cancelado: "#EF4444", // Vermelho
};

export const UNIDADE_NEGOCIO_LABELS: Record<UnidadeNegocio, string> = {
  arquitetura: "Arquitetura",
  engenharia: "Engenharia",
  marcenaria: "Marcenaria",
  moma_engenharia: "Moma Engenharia",
  moma_planejados: "Moma Planejados",
};

export const UNIDADE_NEGOCIO_COLORS: Record<UnidadeNegocio, string> = {
  arquitetura: "#8B5CF6", // Roxo
  engenharia: "#3B82F6", // Azul
  marcenaria: "#F59E0B", // Laranja
  moma_engenharia: "#10B981", // Verde Esmeralda
  moma_planejados: "#EC4899", // Rosa/Pink
};

export const TIPO_ITEM_LABELS: Record<TipoItemContrato, string> = {
  mao_obra: "Mão de Obra",
  material: "Material",
};

// ============================================================
// Funções Utilitárias
// ============================================================

export function formatarNumeroContrato(numero: string): string {
  return numero.toUpperCase();
}

export function calcularValorTotalItens(itens: ContratoItem[]): number {
  return itens.reduce((acc, item) => {
    const total = item.valor_total ?? item.preco_total ?? 0;
    return acc + total;
  }, 0);
}

export function calcularPercentualMaoObra(contrato: Contrato): number {
  if (contrato.valor_total === 0) return 0;
  return Math.round((contrato.valor_mao_obra / contrato.valor_total) * 100);
}

export function calcularPercentualMateriais(contrato: Contrato): number {
  if (contrato.valor_total === 0) return 0;
  return Math.round((contrato.valor_materiais / contrato.valor_total) * 100);
}

export function formatarValor(valor?: number | null): string {
  const v = typeof valor === "number" && !isNaN(valor) ? valor : 0;
  return v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatarData(data?: string | null): string {
  if (!data) return "-";
  const date = new Date(data);
  return date.toLocaleDateString("pt-BR");
}

export function formatarDataHora(data?: string | null): string {
  if (!data) return "-";
  const date = new Date(data);
  return date.toLocaleString("pt-BR");
}

export function calcularDuracaoContrato(contrato: Contrato): number | null {
  if (!contrato.data_inicio || !contrato.data_previsao_termino) {
    return null;
  }

  const dataInicio = new Date(contrato.data_inicio);
  const dataFim = new Date(contrato.data_previsao_termino);
  const diff = dataFim.getTime() - dataInicio.getTime();

  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function calcularDiasRestantes(contrato: Contrato): number | null {
  if (!contrato.data_previsao_termino || contrato.status === "concluido") {
    return null;
  }

  const dataFim = new Date(contrato.data_previsao_termino);
  const hoje = new Date();
  const diff = dataFim.getTime() - hoje.getTime();

  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function validarContrato(contrato: ContratoFormData): string[] {
  const erros: string[] = [];

  if (!contrato.cliente_id) {
    erros.push("Cliente é obrigatório");
  }

  if (!contrato.unidade_negocio) {
    erros.push("Unidade de negócio é obrigatória");
  }

  if (contrato.data_inicio && contrato.data_previsao_termino) {
    const dataInicio = new Date(contrato.data_inicio);
    const dataFim = new Date(contrato.data_previsao_termino);

    if (dataFim <= dataInicio) {
      erros.push("Data de término deve ser posterior à data de início");
    }
  }

  return erros;
}

export function validarItem(item: ContratoItemFormData): string[] {
  const erros: string[] = [];

  if (!item.descricao || item.descricao.trim() === "") {
    erros.push("Descrição é obrigatória");
  }

  if (!item.quantidade || item.quantidade <= 0) {
    erros.push("Quantidade deve ser maior que zero");
  }

  if (!item.valor_unitario || item.valor_unitario < 0) {
    erros.push("Valor unitário deve ser maior ou igual a zero");
  }

  if (!item.unidade || item.unidade.trim() === "") {
    erros.push("Unidade é obrigatória");
  }

  if (item.percentual_valor !== undefined && item.percentual_valor !== null) {
    if (item.percentual_valor < 0 || item.percentual_valor > 100) {
      erros.push("Percentual deve estar entre 0 e 100");
    }
  }

  return erros;
}

export function podeAssinarContrato(contrato: Contrato): boolean {
  return (
    contrato.status === "rascunho" || contrato.status === "aguardando_assinatura"
  );
}

export function podeCancelarContrato(contrato: Contrato): boolean {
  return contrato.status !== "concluido" && contrato.status !== "cancelado";
}

export function podeEditarContrato(contrato: Contrato): boolean {
  return contrato.status === "rascunho";
}

export function getStatusContratoIcon(status: StatusContrato): string {
  const icons: Record<StatusContrato, string> = {
    rascunho: "📝",
    aguardando_assinatura: "⏳",
    ativo: "✅",
    concluido: "🎉",
    cancelado: "❌",
  };

  return icons[status] || "📄";
}

export function getStatusContratoColor(status: StatusContrato): string {
  return STATUS_CONTRATO_COLORS[status] || "#9CA3AF";
}

export function getStatusContratoLabel(status: StatusContrato): string {
  return STATUS_CONTRATO_LABELS[status] || status;
}

export function getUnidadeNegocioColor(unidade: UnidadeNegocio): string {
  return UNIDADE_NEGOCIO_COLORS[unidade] || "#9CA3AF";
}

export function getUnidadeNegocioLabel(unidade: UnidadeNegocio): string {
  return UNIDADE_NEGOCIO_LABELS[unidade] || unidade;
}
