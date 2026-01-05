// ============================================================
// TIPOS: Propostas Comerciais
// ============================================================

export type PropostaStatus = 'rascunho' | 'enviada' | 'aprovada' | 'rejeitada' | 'cancelada';
export type FormaPagamento = 'a_vista' | 'parcelado' | 'etapas';
export type TipoItem = 'material' | 'mao_obra' | 'ambos' | 'servico' | 'produto';
export type Nucleo = 'arquitetura' | 'engenharia' | 'marcenaria';
export type NucleoItem = 'arquitetura' | 'engenharia' | 'marcenaria' | 'produtos';

export interface Proposta {
  id: string;
  cliente_id: string;
  oportunidade_id?: string | null;
  nucleo?: Nucleo | null;
  numero?: string | null;
  titulo: string;
  descricao?: string | null;
  forma_pagamento?: FormaPagamento | null;
  percentual_entrada?: number;
  numero_parcelas?: number;
  validade_dias?: number;
  prazo_execucao_dias?: number;
  valor_materiais: number;
  valor_mao_obra: number;
  valor_total: number;
  exibir_valores: boolean;
  pagamento_cartao?: boolean; // Se true, taxa de cartão foi aplicada ao valor_total
  status: PropostaStatus;
  criado_em: string;
  updated_at?: string;
  created_by?: string | null;
}

export interface PropostaItem {
  id: string;
  proposta_id: string;
  pricelist_item_id?: string | null;
  codigo?: string | null;
  nome: string;
  descricao?: string | null;
  categoria?: string | null;
  tipo: TipoItem;
  unidade?: string | null;
  quantidade: number;
  valor_unitario: number;
  valor_subtotal: number;
  descricao_customizada?: string | null;
  ambiente_id?: string | null;
  nucleo?: NucleoItem | null;
  ordem: number;
  criado_em: string;
}

export interface PropostaCompleta extends Proposta {
  cliente_nome?: string;
  itens: PropostaItem[];
}

export interface PropostaFormData {
  cliente_id: string;
  oportunidade_id?: string | null;
  titulo: string;
  descricao?: string | null;
  forma_pagamento?: FormaPagamento;
  percentual_entrada?: number;
  numero_parcelas?: number;
  validade_dias?: number;
  prazo_execucao_dias?: number;
  exibir_valores?: boolean;
  pagamento_cartao?: boolean; // Se true, aplica taxa de cartão ao valor total
  valor_total?: number; // Valor total já com taxa de cartão aplicada (se houver)
  valor_materiais?: number; // Valor total dos materiais
  valor_mao_obra?: number; // Valor total da mão de obra
}

export interface PropostaItemInput {
  pricelist_item_id?: string | null;
  codigo?: string | null;
  nome: string;
  descricao?: string | null;
  categoria?: string | null;
  tipo: TipoItem;
  unidade?: string | null;
  quantidade: number;
  valor_unitario: number;
  descricao_customizada?: string | null;
  ambiente_id?: string | null;
  ordem?: number;
  nucleo?: string | null; // Núcleo do item (arquitetura, engenharia, marcenaria)
}

// Funções helper
export function getStatusPropostaLabel(status: PropostaStatus): string {
  const labels: Record<PropostaStatus, string> = {
    rascunho: 'Rascunho',
    enviada: 'Enviada',
    aprovada: 'Aprovada',
    rejeitada: 'Rejeitada',
    cancelada: 'Cancelada',
  };
  return labels[status];
}

export function getStatusPropostaColor(status: PropostaStatus): string {
  const colors: Record<PropostaStatus, string> = {
    rascunho: '#6B7280',
    enviada: '#3B82F6',
    aprovada: '#10B981',
    rejeitada: '#EF4444',
    cancelada: '#9CA3AF',
  };
  return colors[status];
}

export function getFormaPagamentoLabel(forma: FormaPagamento): string {
  const labels: Record<FormaPagamento, string> = {
    a_vista: 'À Vista',
    parcelado: 'Parcelado',
    etapas: 'Sinal + Etapas',
  };
  return labels[forma];
}

export function getNucleoLabel(nucleo: Nucleo): string {
  const labels: Record<Nucleo, string> = {
    arquitetura: 'Arquitetura',
    engenharia: 'Engenharia',
    marcenaria: 'Marcenaria',
  };
  return labels[nucleo];
}

export function getNucleoColor(nucleo: Nucleo): string {
  const colors: Record<Nucleo, string> = {
    arquitetura: '#5E9B94', // Verde mineral - design racional, equilíbrio e intenção
    engenharia: '#2B4580',  // Azul técnico - estrutura, método e precisão
    marcenaria: '#8B5E3C',  // Marrom carvalho - materialidade, artesania e luxo discreto
  };
  return colors[nucleo];
}

// Cor para produtos (itens sem núcleo específico)
export function getCorProdutos(): string {
  return '#F25C26'; // Laranja WG - energia, inovação e ação
}
