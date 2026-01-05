// ============================================================================
// TIPOS DO MÓDULO EVF - Estudo de Viabilidade Financeira
// Sistema WG Easy - Grupo WG Almeida
// ============================================================================

// Padrões de acabamento com multiplicadores
export type PadraoAcabamento = 'economico' | 'medio_alto' | 'alto_luxo';

export const PADRAO_MULTIPLICADORES: Record<PadraoAcabamento, number> = {
  economico: 0.7,
  medio_alto: 1.0,
  alto_luxo: 1.5,
};

export const PADRAO_LABELS: Record<PadraoAcabamento, { label: string; descricao: string }> = {
  economico: {
    label: 'Econômico',
    descricao: 'Materiais básicos, acabamento simples (0.7x)'
  },
  medio_alto: {
    label: 'Médio/Alto',
    descricao: 'Materiais de qualidade, acabamento padrão (1.0x)'
  },
  alto_luxo: {
    label: 'Alto/Luxo',
    descricao: 'Materiais premium, acabamento sofisticado (1.5x)'
  },
};

// 18 Categorias do EVF
export type CategoriaEVF =
  | 'aquecedor_gas'
  | 'arquitetura'
  | 'infra_ar_condicionado'
  | 'automacao'
  | 'cubas_loucas_metais'
  | 'eletros'
  | 'envidracamento'
  | 'gesso'
  | 'iluminacao'
  | 'mao_obra'
  | 'marcenaria'
  | 'marmoraria'
  | 'material_basico'
  | 'acabamentos'
  | 'material_pintura'
  | 'tomadas_interruptores'
  | 'vidracaria'
  | 'ar_condicionado';

// Configuração de cada categoria
export interface CategoriaEVFConfig {
  id: CategoriaEVF;
  nome: string;
  valorM2Padrao: number;
  icone: string;
  cor: string;
  ordem: number;
}

// Configuração padrão das 18 categorias (Valores atualizados - Pesquisa Mercado Dez/2025)
// Fontes: SINAPI, CUB, Cronoshare, MySide, WebArCondicionado
export const CATEGORIAS_EVF_CONFIG: CategoriaEVFConfig[] = [
  { id: 'aquecedor_gas', nome: 'Aquecedor a Gás', valorM2Padrao: 55.00, icone: 'Flame', cor: '#EF4444', ordem: 1 },
  { id: 'arquitetura', nome: 'Arquitetura', valorM2Padrao: 120.00, icone: 'Compass', cor: '#5E9B94', ordem: 2 },
  { id: 'infra_ar_condicionado', nome: 'Infra de Ar Condicionado', valorM2Padrao: 170.00, icone: 'Wind', cor: '#3B82F6', ordem: 3 },
  { id: 'automacao', nome: 'Automação', valorM2Padrao: 200.00, icone: 'Cpu', cor: '#8B5CF6', ordem: 4 },
  { id: 'cubas_loucas_metais', nome: 'Cubas, Louças e Metais', valorM2Padrao: 120.00, icone: 'Droplets', cor: '#06B6D4', ordem: 5 },
  { id: 'eletros', nome: 'Eletros', valorM2Padrao: 250.00, icone: 'Refrigerator', cor: '#F59E0B', ordem: 6 },
  { id: 'envidracamento', nome: 'Envidraçamento', valorM2Padrao: 280.00, icone: 'LayoutGrid', cor: '#10B981', ordem: 7 },
  { id: 'gesso', nome: 'Gesso', valorM2Padrao: 140.00, icone: 'Square', cor: '#6B7280', ordem: 8 },
  { id: 'iluminacao', nome: 'Iluminação', valorM2Padrao: 100.00, icone: 'Lightbulb', cor: '#FBBF24', ordem: 9 },
  { id: 'mao_obra', nome: 'Mão de Obra', valorM2Padrao: 950.00, icone: 'HardHat', cor: '#2B4580', ordem: 10 },
  { id: 'marcenaria', nome: 'Marcenaria', valorM2Padrao: 1800.00, icone: 'Hammer', cor: '#8B5E3C', ordem: 11 },
  { id: 'marmoraria', nome: 'Marmoraria', valorM2Padrao: 350.00, icone: 'Gem', cor: '#A78BFA', ordem: 12 },
  { id: 'material_basico', nome: 'Material Básico', valorM2Padrao: 250.00, icone: 'Package', cor: '#78716C', ordem: 13 },
  { id: 'acabamentos', nome: 'Acabamentos', valorM2Padrao: 280.00, icone: 'Palette', cor: '#EC4899', ordem: 14 },
  { id: 'material_pintura', nome: 'Material Pintura', valorM2Padrao: 70.00, icone: 'PaintBucket', cor: '#14B8A6', ordem: 15 },
  { id: 'tomadas_interruptores', nome: 'Tomadas e Interruptores', valorM2Padrao: 55.00, icone: 'PlugZap', cor: '#F97316', ordem: 16 },
  { id: 'vidracaria', nome: 'Vidraçaria', valorM2Padrao: 250.00, icone: 'GalleryVertical', cor: '#22D3EE', ordem: 17 },
  { id: 'ar_condicionado', nome: 'Ar Condicionado', valorM2Padrao: 280.00, icone: 'Snowflake', cor: '#60A5FA', ordem: 18 },
];

// Item individual do estudo
export interface EVFItem {
  id?: string;
  estudo_id?: string;
  categoria: CategoriaEVF;
  nome: string;
  valorM2Base: number;
  valorM2Ajustado: number;
  valorPrevisao: number;
  valorMinimo: number; // -15%
  valorMaximo: number; // +15%
  valorEstudoReal: number;
  percentualTotal: number;
  ordem: number;
}

// Estudo completo
export interface EVFEstudo {
  id: string;
  analise_projeto_id: string | null;
  cliente_id: string | null;
  titulo: string;
  metragem_total: number;
  padrao_acabamento: PadraoAcabamento;
  valor_total: number;
  valor_m2_medio: number;
  observacoes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// Estudo com dados relacionados
export interface EVFEstudoCompleto extends EVFEstudo {
  itens: EVFItem[];
  analise_projeto?: {
    id: string;
    titulo: string;
    area_total: number;
  } | null;
  cliente?: {
    id: string;
    nome: string;
  } | null;
}

// Formulário de criação/edição
export interface EVFEstudoFormData {
  analise_projeto_id?: string;  // Opcional - EVF é criado ANTES da análise de projeto
  // Permitir null/undefined pois formulários existentes às vezes passam `null`
  cliente_id?: string | null;           // Obrigatório no fluxo, mas aceitar null em formulários
  titulo: string;
  metragem_total: number;
  padrao_acabamento: PadraoAcabamento;
  observacoes?: string;
}

// Configuração de categoria do banco
export interface EVFCategoriaConfig {
  id: string;
  codigo: CategoriaEVF;
  nome: string;
  valor_m2_padrao: number;
  icone: string | null;
  cor: string | null;
  ordem: number;
  ativo: boolean;
  updated_at: string;
}

// ============================================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================================

/**
 * Calcula os itens do EVF baseado na metragem e padrão
 */
export function calcularItensEVF(
  metragem: number,
  padrao: PadraoAcabamento,
  categoriasConfig?: EVFCategoriaConfig[]
): EVFItem[] {
  const multiplicador = PADRAO_MULTIPLICADORES[padrao];

  // Usar configuração do banco ou valores padrão
  const categorias = categoriasConfig?.length
    ? categoriasConfig.map(c => ({
        id: c.codigo,
        nome: c.nome,
        valorM2Padrao: c.valor_m2_padrao,
        ordem: c.ordem,
      }))
    : CATEGORIAS_EVF_CONFIG.map(c => ({
        id: c.id,
        nome: c.nome,
        valorM2Padrao: c.valorM2Padrao,
        ordem: c.ordem,
      }));

  const itens: EVFItem[] = categorias.map(cat => {
    const valorM2Ajustado = cat.valorM2Padrao * multiplicador;
    const valorPrevisao = valorM2Ajustado * metragem;
    const valorMinimo = valorPrevisao * 0.85;
    const valorMaximo = valorPrevisao * 1.15;

    return {
      categoria: cat.id as CategoriaEVF,
      nome: cat.nome,
      valorM2Base: cat.valorM2Padrao,
      valorM2Ajustado,
      valorPrevisao,
      valorMinimo,
      valorMaximo,
      valorEstudoReal: valorPrevisao, // Valor inicial = previsão
      percentualTotal: 0,
      ordem: cat.ordem,
    };
  });

  // Calcular percentuais
  return calcularPercentuais(itens);
}

/**
 * Recalcula os percentuais de cada item
 */
export function calcularPercentuais(itens: EVFItem[]): EVFItem[] {
  const total = itens.reduce((sum, item) => sum + item.valorEstudoReal, 0);

  return itens.map(item => ({
    ...item,
    percentualTotal: total > 0 ? (item.valorEstudoReal / total) * 100 : 0,
  }));
}

/**
 * Calcula totais do estudo
 */
export function calcularTotaisEVF(itens: EVFItem[], metragem: number): {
  valorTotal: number;
  valorM2Medio: number;
  valorPrevisaoTotal: number;
  valorMinimoTotal: number;
  valorMaximoTotal: number;
} {
  const valorTotal = itens.reduce((sum, item) => sum + item.valorEstudoReal, 0);
  const valorPrevisaoTotal = itens.reduce((sum, item) => sum + item.valorPrevisao, 0);
  const valorMinimoTotal = itens.reduce((sum, item) => sum + item.valorMinimo, 0);
  const valorMaximoTotal = itens.reduce((sum, item) => sum + item.valorMaximo, 0);

  return {
    valorTotal,
    valorM2Medio: metragem > 0 ? valorTotal / metragem : 0,
    valorPrevisaoTotal,
    valorMinimoTotal,
    valorMaximoTotal,
  };
}

/**
 * Formata valor em reais
 */
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

/**
 * Formata número com separadores
 */
export function formatarNumero(valor: number, decimais: number = 2): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimais,
    maximumFractionDigits: decimais,
  }).format(valor);
}

/**
 * Retorna a cor da categoria
 */
export function getCorCategoria(categoria: CategoriaEVF): string {
  const config = CATEGORIAS_EVF_CONFIG.find(c => c.id === categoria);
  return config?.cor || '#6B7280';
}

/**
 * Retorna o ícone da categoria
 */
export function getIconeCategoria(categoria: CategoriaEVF): string {
  const config = CATEGORIAS_EVF_CONFIG.find(c => c.id === categoria);
  return config?.icone || 'Package';
}
