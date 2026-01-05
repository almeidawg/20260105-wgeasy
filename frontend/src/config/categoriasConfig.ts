// ============================================================
// Configuração Centralizada de Categorias do Sistema
// Sistema WG Easy - Grupo WG Almeida
// ============================================================
// Cores e códigos padronizados para uso em:
// - Pricelist (categorias e subcategorias)
// - Orçamentos (headers de categoria)
// - EVF (Estudo de Viabilidade)
// - Tags e identificadores visuais
// ============================================================

export interface CategoriaConfig {
  id: string;
  codigo: string;        // Ex: ELE, AUT, HID
  nome: string;
  cor: string;           // Cor principal (hex)
  corClara: string;      // Cor clara para backgrounds
  icone: string;         // Nome do ícone lucide-react
  ordem: number;         // Ordem cronológica de obra
  tipo: 'material' | 'mao_de_obra' | 'servico' | 'equipamento';
}

export interface SubcategoriaConfig {
  prefixo: string;       // MAT, ACA, PRO, MDO, etc.
  nome: string;
  descricao: string;
}

// ============================================================
// SUBCATEGORIAS PADRÃO
// ============================================================
export const SUBCATEGORIAS_PADRAO: SubcategoriaConfig[] = [
  { prefixo: "MAT", nome: "Material", descricao: "Materiais de construção" },
  { prefixo: "ACA", nome: "Acabamento", descricao: "Itens de acabamento" },
  { prefixo: "PRO", nome: "Produto", descricao: "Produtos e equipamentos" },
  { prefixo: "MDO", nome: "Mão de Obra", descricao: "Serviços e mão de obra" },
  { prefixo: "FER", nome: "Ferramenta", descricao: "Ferramentas e equipamentos" },
  { prefixo: "EPI", nome: "EPI", descricao: "Equipamentos de proteção" },
  { prefixo: "INS", nome: "Insumo", descricao: "Insumos e consumíveis" },
];

// ============================================================
// CATEGORIAS PRINCIPAIS - Ordem Cronológica de Obra
// ============================================================
export const CATEGORIAS_CONFIG: CategoriaConfig[] = [
  // Fase 1: Pré-Obra e Preparação
  {
    id: "pre_obra",
    codigo: "PRE",
    nome: "Pré Obra e Remoções",
    cor: "#78716C",
    corClara: "#F5F5F4",
    icone: "Trash2",
    ordem: 1,
    tipo: "servico",
  },
  {
    id: "demolicoes",
    codigo: "DEM",
    nome: "Demolições",
    cor: "#EF4444",
    corClara: "#FEE2E2",
    icone: "Hammer",
    ordem: 2,
    tipo: "servico",
  },

  // Fase 2: Estrutura e Alvenaria
  {
    id: "paredes",
    codigo: "PAR",
    nome: "Paredes",
    cor: "#F59E0B",
    corClara: "#FEF3C7",
    icone: "LayoutGrid",
    ordem: 3,
    tipo: "material",
  },
  {
    id: "icamento",
    codigo: "ICA",
    nome: "Içamento",
    cor: "#8B5CF6",
    corClara: "#EDE9FE",
    icone: "ArrowUp",
    ordem: 4,
    tipo: "servico",
  },

  // Fase 3: Instalações
  {
    id: "hidrossanitaria",
    codigo: "HID",
    nome: "Hidrossanitária",
    cor: "#3B82F6",
    corClara: "#DBEAFE",
    icone: "Droplets",
    ordem: 5,
    tipo: "material",
  },
  {
    id: "gas",
    codigo: "GAS",
    nome: "Gás",
    cor: "#EF4444",
    corClara: "#FEE2E2",
    icone: "Flame",
    ordem: 6,
    tipo: "material",
  },
  {
    id: "eletrica",
    codigo: "ELE",
    nome: "Elétrica",
    cor: "#FBBF24",
    corClara: "#FEF3C7",
    icone: "Zap",
    ordem: 7,
    tipo: "material",
  },
  {
    id: "automacao",
    codigo: "AUT",
    nome: "Automação",
    cor: "#8B5CF6",
    corClara: "#EDE9FE",
    icone: "Cpu",
    ordem: 8,
    tipo: "equipamento",
  },
  {
    id: "infra_ar",
    codigo: "IAR",
    nome: "Infra Ar",
    cor: "#06B6D4",
    corClara: "#CFFAFE",
    icone: "Wind",
    ordem: 9,
    tipo: "material",
  },
  {
    id: "ar_condicionado",
    codigo: "ACO",
    nome: "Ar Condicionado",
    cor: "#60A5FA",
    corClara: "#DBEAFE",
    icone: "Snowflake",
    ordem: 10,
    tipo: "equipamento",
  },

  // Fase 4: Eletrodomésticos
  {
    id: "eletrodomesticos",
    codigo: "ELT",
    nome: "Eletrodomésticos",
    cor: "#F97316",
    corClara: "#FFEDD5",
    icone: "Refrigerator",
    ordem: 11,
    tipo: "equipamento",
  },

  // Fase 5: Revestimentos
  {
    id: "piso",
    codigo: "PIS",
    nome: "Piso",
    cor: "#A78BFA",
    corClara: "#EDE9FE",
    icone: "Grid3X3",
    ordem: 12,
    tipo: "material",
  },
  {
    id: "gesso",
    codigo: "GES",
    nome: "Gesso",
    cor: "#6B7280",
    corClara: "#F3F4F6",
    icone: "Square",
    ordem: 13,
    tipo: "material",
  },

  // Fase 6: Acabamentos
  {
    id: "pintura",
    codigo: "PIN",
    nome: "Pintura",
    cor: "#14B8A6",
    corClara: "#CCFBF1",
    icone: "PaintBucket",
    ordem: 14,
    tipo: "material",
  },
  {
    id: "vidracaria",
    codigo: "VID",
    nome: "Vidraçaria",
    cor: "#22D3EE",
    corClara: "#CFFAFE",
    icone: "GalleryVertical",
    ordem: 15,
    tipo: "material",
  },
  {
    id: "marcenaria",
    codigo: "MAR",
    nome: "Marcenaria",
    cor: "#8B5E3C",
    corClara: "#FED7AA",
    icone: "Hammer",
    ordem: 16,
    tipo: "material",
  },
  {
    id: "marmoraria",
    codigo: "MRM",
    nome: "Marmoraria",
    cor: "#A78BFA",
    corClara: "#EDE9FE",
    icone: "Gem",
    ordem: 17,
    tipo: "material",
  },

  // Fase 7: Louças e Metais
  {
    id: "loucas_metais",
    codigo: "LMT",
    nome: "Louças e Metais",
    cor: "#06B6D4",
    corClara: "#CFFAFE",
    icone: "Droplets",
    ordem: 18,
    tipo: "material",
  },
  {
    id: "iluminacao",
    codigo: "ILU",
    nome: "Iluminação",
    cor: "#FBBF24",
    corClara: "#FEF3C7",
    icone: "Lightbulb",
    ordem: 19,
    tipo: "equipamento",
  },
  {
    id: "tomadas_interruptores",
    codigo: "TOM",
    nome: "Tomadas e Interruptores",
    cor: "#F97316",
    corClara: "#FFEDD5",
    icone: "PlugZap",
    ordem: 20,
    tipo: "material",
  },

  // Fase 8: Finalização
  {
    id: "acabamentos",
    codigo: "ABA",
    nome: "Acabamentos",
    cor: "#EC4899",
    corClara: "#FCE7F3",
    icone: "Palette",
    ordem: 21,
    tipo: "material",
  },
  {
    id: "finalizacao",
    codigo: "FIN",
    nome: "Finalização",
    cor: "#22C55E",
    corClara: "#DCFCE7",
    icone: "CheckCircle",
    ordem: 22,
    tipo: "servico",
  },
  {
    id: "limpeza",
    codigo: "LIM",
    nome: "Limpeza Pós Obra",
    cor: "#14B8A6",
    corClara: "#CCFBF1",
    icone: "Sparkles",
    ordem: 23,
    tipo: "servico",
  },

  // Apoio
  {
    id: "mao_obra",
    codigo: "MOB",
    nome: "Mão de Obra",
    cor: "#2B4580",
    corClara: "#DBEAFE",
    icone: "HardHat",
    ordem: 24,
    tipo: "mao_de_obra",
  },
  {
    id: "material_basico",
    codigo: "MBA",
    nome: "Material Básico",
    cor: "#78716C",
    corClara: "#F5F5F4",
    icone: "Package",
    ordem: 25,
    tipo: "material",
  },
  {
    id: "producao",
    codigo: "PRD",
    nome: "Produção",
    cor: "#64748B",
    corClara: "#F1F5F9",
    icone: "Factory",
    ordem: 26,
    tipo: "servico",
  },
];

// ============================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================

/**
 * Busca configuração de categoria pelo nome
 */
export function getCategoriaConfig(nome: string): CategoriaConfig | undefined {
  const nomeNormalizado = nome.toLowerCase().trim();
  return CATEGORIAS_CONFIG.find(
    c => c.nome.toLowerCase() === nomeNormalizado ||
         c.id === nomeNormalizado ||
         c.codigo.toLowerCase() === nomeNormalizado
  );
}

/**
 * Retorna a cor de uma categoria pelo nome
 */
export function getCorCategoria(nome: string): string {
  const config = getCategoriaConfig(nome);
  return config?.cor || "#6B7280";
}

/**
 * Retorna a cor clara (background) de uma categoria
 */
export function getCorClaraCategoria(nome: string): string {
  const config = getCategoriaConfig(nome);
  return config?.corClara || "#F3F4F6";
}

/**
 * Retorna o código de uma categoria pelo nome
 */
export function getCodigoCategoria(nome: string): string {
  const config = getCategoriaConfig(nome);
  return config?.codigo || nome.substring(0, 3).toUpperCase();
}

/**
 * Retorna a ordem cronológica de uma categoria
 */
export function getOrdemCategoria(nome: string): number {
  const config = getCategoriaConfig(nome);
  return config?.ordem || 99;
}

/**
 * Gera código de item: SUBCAT/CAT-NNN
 * Ex: MAT/ELE-001
 */
export function gerarCodigoItem(
  categoria: string,
  subcategoria: string,
  numero: number
): string {
  const codigoCat = getCodigoCategoria(categoria);
  const prefixoSub = SUBCATEGORIAS_PADRAO.find(
    s => s.nome.toLowerCase() === subcategoria.toLowerCase() ||
         s.prefixo.toLowerCase() === subcategoria.toLowerCase()
  )?.prefixo || subcategoria.substring(0, 3).toUpperCase();

  return `${prefixoSub}/${codigoCat}-${String(numero).padStart(3, '0')}`;
}

/**
 * Ordena categorias por ordem cronológica de obra
 */
export function ordenarCategorias<T extends { categoria?: string; nome?: string }>(
  itens: T[]
): T[] {
  return [...itens].sort((a, b) => {
    const ordemA = getOrdemCategoria(a.categoria || a.nome || "");
    const ordemB = getOrdemCategoria(b.categoria || b.nome || "");
    return ordemA - ordemB;
  });
}

/**
 * Mapa de cores por nome de categoria (para uso direto)
 */
export const CORES_CATEGORIAS: Record<string, string> = CATEGORIAS_CONFIG.reduce(
  (acc, cat) => {
    acc[cat.nome] = cat.cor;
    acc[cat.nome.toLowerCase()] = cat.cor;
    acc[cat.id] = cat.cor;
    acc[cat.codigo] = cat.cor;
    return acc;
  },
  {} as Record<string, string>
);

/**
 * Mapa de cores claras por nome de categoria
 */
export const CORES_CLARAS_CATEGORIAS: Record<string, string> = CATEGORIAS_CONFIG.reduce(
  (acc, cat) => {
    acc[cat.nome] = cat.corClara;
    acc[cat.nome.toLowerCase()] = cat.corClara;
    acc[cat.id] = cat.corClara;
    acc[cat.codigo] = cat.corClara;
    return acc;
  },
  {} as Record<string, string>
);
