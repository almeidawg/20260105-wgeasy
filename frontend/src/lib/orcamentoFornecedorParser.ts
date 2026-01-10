// ============================================================
// PARSER: Orçamentos de Fornecedores - Multi-formato
// Sistema WG Easy - Grupo WG Almeida
// Extrai dados de orçamentos colados (texto) para cadastro automático
// ============================================================

// ============================================================
// MAPA DE CATEGORIZAÇÃO AUTOMÁTICA
// Identifica categoria pelo nome do fornecedor ou produtos
// ============================================================

export interface CategoriaFornecedor {
  codigo: string;
  nome: string;
  palavrasChave: string[];
  icone: string;
  pricelistCategoria: string; // Categoria correspondente no pricelist
}

/**
 * Mapa de categorias de fornecedores baseado em palavras-chave
 * O sistema detecta automaticamente a categoria pelo nome do fornecedor
 */
export const MAPA_CATEGORIAS_FORNECEDOR: CategoriaFornecedor[] = [
  {
    codigo: "ELETRICA_HIDRAULICA",
    nome: "Material Elétrico e Hidráulico",
    palavrasChave: [
      "eletric", "hidraulic", "maraca", "eletro", "hidro",
      "fio", "cabo", "disjuntor", "tomada", "interruptor",
      "tubo pvc", "conexao", "valvula", "registro", "sifao"
    ],
    icone: "⚡",
    pricelistCategoria: "material"
  },
  {
    codigo: "GESSO_DRYWALL",
    nome: "Gesso e Drywall",
    palavrasChave: [
      "gesso", "drywall", "gdsul", "placo", "knauf",
      "placa st", "montante", "guia", "perfil", "forro"
    ],
    icone: "🏗️",
    pricelistCategoria: "material"
  },
  {
    codigo: "FERRAMENTAS",
    nome: "Ferramentas e Equipamentos",
    palavrasChave: [
      "ferramenta", "zona sul", "deposito", "ferrag",
      "martelete", "furadeira", "esmerilhadeira", "serra",
      "worker", "makita", "bosch", "dewalt", "stanley"
    ],
    icone: "🔧",
    pricelistCategoria: "material"
  },
  {
    codigo: "PORTAS_ESQUADRIAS",
    nome: "Portas e Esquadrias",
    palavrasChave: [
      "porta", "esquadria", "otimizi", "unique",
      "correr", "embutir", "batente", "marco", "alisar"
    ],
    icone: "🚪",
    pricelistCategoria: "material"
  },
  {
    codigo: "PROTECAO_OBRA",
    nome: "Proteção de Obra",
    palavrasChave: [
      "protecao", "salvabras", "salva obra", "salva piso",
      "lona", "fita crepe", "papelao", "kraft"
    ],
    icone: "🛡️",
    pricelistCategoria: "material"
  },
  {
    codigo: "TINTAS_PINTURA",
    nome: "Tintas e Pintura",
    palavrasChave: [
      "tinta", "pintura", "suvinil", "coral", "sherwin",
      "massa corrida", "selador", "verniz", "lixa", "rolo"
    ],
    icone: "🎨",
    pricelistCategoria: "material"
  },
  {
    codigo: "PEDRAS_MARMORES",
    nome: "Pedras e Mármores",
    palavrasChave: [
      "marmore", "granito", "pedra", "quartzo", "silestone",
      "marmoraria", "bancada", "soleira"
    ],
    icone: "🪨",
    pricelistCategoria: "material"
  },
  {
    codigo: "VIDROS_ESPELHOS",
    nome: "Vidros e Espelhos",
    palavrasChave: [
      "vidro", "espelho", "vidracaria", "box", "temperado",
      "blindex", "cristal"
    ],
    icone: "🪟",
    pricelistCategoria: "material"
  },
  {
    codigo: "MARCENARIA",
    nome: "Marcenaria e Móveis",
    palavrasChave: [
      "marcenaria", "movel", "armario", "cozinha planejada",
      "mdf", "compensado", "madeira"
    ],
    icone: "🪵",
    pricelistCategoria: "material"
  },
  {
    codigo: "PISOS_REVESTIMENTOS",
    nome: "Pisos e Revestimentos",
    palavrasChave: [
      "piso", "revestimento", "ceramica", "porcelanato",
      "azulejo", "rejunte", "argamassa"
    ],
    icone: "🧱",
    pricelistCategoria: "material"
  },
  {
    codigo: "MOLDURAS_RODAPES",
    nome: "Molduras e Rodapés",
    palavrasChave: [
      "moldura", "rodape", "moldurama", "sanca", "forro"
    ],
    icone: "📐",
    pricelistCategoria: "material"
  },
  {
    codigo: "MATERIAL_CONSTRUCAO",
    nome: "Material de Construção Geral",
    palavrasChave: [
      "construcao", "cimento", "areia", "tijolo", "bloco",
      "argamassa", "cal", "brita"
    ],
    icone: "🏠",
    pricelistCategoria: "material"
  }
];

// ============================================================
// INTERFACES
// ============================================================

export interface FornecedorDetectado {
  nome: string;
  cnpj: string;
  telefone: string;
  endereco: string;
  email: string;
  vendedor: string;
  categoriaDetectada: CategoriaFornecedor | null;
}

export interface ItemOrcamento {
  codigo: string;
  descricao: string;
  unidade: string;
  quantidade: number;
  precoUnitario: number;
  valorTotal: number;
  marca?: string;
  ncm?: string;
}

export interface OrcamentoExtraido {
  // Identificação
  numero: string;
  data: Date | null;
  formato: FormatoOrcamento;

  // Fornecedor
  fornecedor: FornecedorDetectado;

  // Itens
  itens: ItemOrcamento[];

  // Totais
  valorProdutos: number;
  valorFrete: number;
  valorDesconto: number;
  valorTotal: number;

  // Pagamento
  formaPagamento: string;
  condicaoPagamento: string;
  validadeProposta: string;
  prazoEntrega: string;

  // Metadados
  textoOriginal: string;
  confianca: number; // 0-100
}

export type FormatoOrcamento =
  | "MARACA"
  | "GDSUL"
  | "ZONA_SUL"
  | "OTIMIZI"
  | "SALVABRAS"
  | "MOLDURAMA"
  | "GENERICO";

// ============================================================
// FUNÇÕES DE DETECÇÃO
// ============================================================

/**
 * Detecta a categoria do fornecedor baseado em palavras-chave
 */
export function detectarCategoriaFornecedor(texto: string): CategoriaFornecedor | null {
  const textoLower = texto.toLowerCase();

  for (const categoria of MAPA_CATEGORIAS_FORNECEDOR) {
    for (const palavra of categoria.palavrasChave) {
      if (textoLower.includes(palavra.toLowerCase())) {
        return categoria;
      }
    }
  }

  return null;
}

/**
 * Detecta o formato do orçamento baseado em padrões do texto
 */
export function detectarFormatoOrcamento(texto: string): FormatoOrcamento {
  const textoLower = texto.toLowerCase();

  // MARACA - Formato específico de depósito elétrico/hidráulico
  if (textoLower.includes("maraca eletric") ||
      (textoLower.includes("sysit") && textoLower.includes("orçamento nº"))) {
    return "MARACA";
  }

  // GDSUL - Gesso e Drywall
  if (textoLower.includes("gdsul") ||
      textoLower.includes("construção inteligente") ||
      (textoLower.includes("sequencia:") && textoLower.includes("produtos / servicos"))) {
    return "GDSUL";
  }

  // Zona Sul - Depósito
  if (textoLower.includes("zona sul") ||
      textoLower.includes("dep. zona sul") ||
      textoLower.includes("a loja + próxima de você")) {
    return "ZONA_SUL";
  }

  // OTIMIZI - Portas
  if (textoLower.includes("otimizi") ||
      textoLower.includes("soluções em ambientes")) {
    return "OTIMIZI";
  }

  // SALVABRAS - Proteção
  if (textoLower.includes("salvabras") ||
      textoLower.includes("salva obra") ||
      textoLower.includes("0800 591 9352")) {
    return "SALVABRAS";
  }

  // MOLDURAMA - Molduras e rodapés
  if (textoLower.includes("moldurama")) {
    return "MOLDURAMA";
  }

  return "GENERICO";
}

// ============================================================
// PARSERS ESPECÍFICOS POR FORMATO
// ============================================================

/**
 * Parser para formato MARACA (Depósito Elétrico/Hidráulico)
 */
function parseMaraca(texto: string): Partial<OrcamentoExtraido> {
  const linhas = texto.split("\n").map(l => l.trim()).filter(l => l);

  // Extrair número do orçamento
  const matchNumero = texto.match(/ORÇAMENTO Nº\s*(\d+)/i) ||
                      texto.match(/Orcamento:\s*(\d+)/i);
  const numero = matchNumero ? matchNumero[1] : "";

  // Extrair fornecedor
  const matchFornecedor = texto.match(/^(MARACA[^-\n]+)/im);
  const matchCNPJ = texto.match(/CNPJ\s*(\d{14}|\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})/i);
  const matchTelefone = texto.match(/FONE:\s*\(?(\d{2})\)?\s*(\d{4,5}[-\s]?\d{4})/i);

  // Extrair data
  const matchData = texto.match(/(\d{2}\/\d{2}\/\d{4})\s+\d{2}:\d{2}:\d{2}/);
  let data: Date | null = null;
  if (matchData) {
    const [dia, mes, ano] = matchData[1].split("/");
    data = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
  }

  // Extrair vendedor
  const matchVendedor = texto.match(/VENDEDOR:\s*(\w+)/i);

  // Extrair itens
  const itens: ItemOrcamento[] = [];
  const regexItem = /(\d{5})\s+([^\.]+)\.+\s*\n\s*QTD\s*:\s*([\d.,]+)\s*X\s*Unitario:\s*([\d.,]+)\s*SUB-TOTAL:\s*([\d.,]+)/gi;

  let match;
  while ((match = regexItem.exec(texto)) !== null) {
    const quantidade = parseFloat(match[3].replace(/\./g, "").replace(",", "."));
    const precoUnitario = parseFloat(match[4].replace(/\./g, "").replace(",", "."));
    const valorTotal = parseFloat(match[5].replace(/\./g, "").replace(",", "."));

    // Ignorar itens negativos (devoluções)
    if (quantidade > 0 && precoUnitario > 0) {
      itens.push({
        codigo: match[1],
        descricao: match[2].trim(),
        unidade: "UN",
        quantidade,
        precoUnitario,
        valorTotal
      });
    }
  }

  // Extrair total
  const matchTotal = texto.match(/TOTAL\s*R\$\s*([\d.,]+)/i);
  const valorTotal = matchTotal ? parseFloat(matchTotal[1].replace(/\./g, "").replace(",", ".")) : 0;

  return {
    numero,
    data,
    formato: "MARACA",
    fornecedor: {
      nome: matchFornecedor ? matchFornecedor[1].trim() : "MARACA ELÉTRICA E HIDRÁULICA",
      cnpj: matchCNPJ ? matchCNPJ[1].replace(/\D/g, "") : "",
      telefone: matchTelefone ? `(${matchTelefone[1]}) ${matchTelefone[2]}` : "",
      endereco: "",
      email: "",
      vendedor: matchVendedor ? matchVendedor[1] : "",
      categoriaDetectada: detectarCategoriaFornecedor("MARACA ELÉTRICA HIDRÁULICA")
    },
    itens,
    valorProdutos: valorTotal,
    valorFrete: 0,
    valorDesconto: 0,
    valorTotal,
    formaPagamento: "",
    condicaoPagamento: "",
    validadeProposta: "",
    prazoEntrega: "",
    confianca: itens.length > 0 ? 85 : 40
  };
}

/**
 * Parser para formato GDSUL (Gesso/Drywall)
 */
function parseGDSUL(texto: string): Partial<OrcamentoExtraido> {
  // Extrair sequência
  const matchSequencia = texto.match(/Sequ[eê]ncia:\s*(\d+)/i);
  const numero = matchSequencia ? matchSequencia[1] : "";

  // Extrair data
  const matchData = texto.match(/(\d{2}\/\d{2}\/\d{4})\s+\d{2}:\d{2}:\d{2}/);
  let data: Date | null = null;
  if (matchData) {
    const [dia, mes, ano] = matchData[1].split("/");
    data = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
  }

  // Extrair CNPJ da empresa (GDSUL)
  const matchCNPJEmpresa = texto.match(/RECEBEMOS DA EMPRESA:.*?(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})/i);

  // Extrair vendedor
  const matchVendedor = texto.match(/Vendedor:\s*(\w+)/i);

  // Extrair forma de pagamento
  const matchPagto = texto.match(/PAGTO:\s*([^\n]+)/i);

  // Extrair itens - Formato GDSUL
  const itens: ItemOrcamento[] = [];

  // Padrão: Codigo Descricao Unid Qtde R$ Unitario R$ Total
  const regexItem = /(\d{1,5})\s+([A-ZÀ-Ú][A-ZÀ-Úa-zà-ú0-9\s\-\/\.\,\(\)]+?)\s+(UN|CT|M2|M²|ML|PC|PÇ|CX|KG|1)\s+(\d+)\s+([\d.,]+)\s+([\d.,]+)/g;

  let match;
  while ((match = regexItem.exec(texto)) !== null) {
    const quantidade = parseFloat(match[4]);
    const precoUnitario = parseFloat(match[5].replace(/\./g, "").replace(",", "."));
    const valorTotal = parseFloat(match[6].replace(/\./g, "").replace(",", "."));

    if (quantidade > 0) {
      itens.push({
        codigo: match[1],
        descricao: match[2].trim(),
        unidade: match[3] === "1" ? "UN" : match[3],
        quantidade,
        precoUnitario,
        valorTotal
      });
    }
  }

  // Extrair totais
  const matchProdutos = texto.match(/Produtos:\s*([\d.,]+)/i);
  const matchFrete = texto.match(/Frete:\s*([\d.,]+)/i);
  const matchTotal = texto.match(/Valor\s*Total:\s*([\d.,]+)/i);

  const valorProdutos = matchProdutos ? parseFloat(matchProdutos[1].replace(/\./g, "").replace(",", ".")) : 0;
  const valorFrete = matchFrete ? parseFloat(matchFrete[1].replace(/\./g, "").replace(",", ".")) : 0;
  const valorTotal = matchTotal ? parseFloat(matchTotal[1].replace(/\./g, "").replace(",", ".")) : 0;

  return {
    numero,
    data,
    formato: "GDSUL",
    fornecedor: {
      nome: "GDSUL CONSTRUÇÕES INTELIGENTES LTDA",
      cnpj: matchCNPJEmpresa ? matchCNPJEmpresa[1].replace(/\D/g, "") : "29028142000149",
      telefone: "(11) 5565-1521",
      endereco: "Av. Ver. João de Luca, 1811 - São Paulo/SP",
      email: "contato@gdsul.com",
      vendedor: matchVendedor ? matchVendedor[1] : "",
      categoriaDetectada: detectarCategoriaFornecedor("GDSUL GESSO DRYWALL")
    },
    itens,
    valorProdutos,
    valorFrete,
    valorDesconto: 0,
    valorTotal,
    formaPagamento: matchPagto ? matchPagto[1].trim() : "",
    condicaoPagamento: "",
    validadeProposta: "2 dias",
    prazoEntrega: "",
    confianca: itens.length > 0 ? 90 : 40
  };
}

/**
 * Parser para formato Zona Sul (Depósito de Ferramentas)
 */
function parseZonaSul(texto: string): Partial<OrcamentoExtraido> {
  // Extrair número do orçamento
  const matchNumero = texto.match(/Orçamento\s*(\d+)/i);
  const numero = matchNumero ? matchNumero[1] : "";

  // Extrair data
  const matchData = texto.match(/Data\s*Emissão.*?(\d{2}\/\d{2}\/\d{4})/i) ||
                    texto.match(/(\d{2}\/\d{2}\/\d{4})/);
  let data: Date | null = null;
  if (matchData) {
    const [dia, mes, ano] = matchData[1].split("/");
    data = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
  }

  // Extrair vendedor
  const matchVendedor = texto.match(/Vendedor\s*(\w+)/i);

  // Extrair forma de pagamento
  const matchPagto = texto.match(/Forma\/Condição:\s*([^\n]+)/i);

  // Extrair itens - Formato Zona Sul
  const itens: ItemOrcamento[] = [];

  // Padrão: RI Qtde Un Codigo Descricao $ Venda $ Total
  const regexItem = /(?:RI|I)\s+([\d.,]+)\s+(PC|UN|CX|KG|M|MT)\s+(\d{11})\s+([^\d\n]+?)\s+([\d.,]+)\s+([\d.,]+)/gi;

  let match;
  while ((match = regexItem.exec(texto)) !== null) {
    const quantidade = parseFloat(match[1].replace(",", "."));
    const precoUnitario = parseFloat(match[5].replace(/\./g, "").replace(",", "."));
    const valorTotal = parseFloat(match[6].replace(/\./g, "").replace(",", "."));

    if (quantidade > 0) {
      itens.push({
        codigo: match[3],
        descricao: match[4].trim(),
        unidade: match[2],
        quantidade,
        precoUnitario,
        valorTotal
      });
    }
  }

  // Extrair total
  const matchTotal = texto.match(/Total\s*(?:Geral|do\s*Pedido):\s*([\d.,]+)/i);
  const valorTotal = matchTotal ? parseFloat(matchTotal[1].replace(/\./g, "").replace(",", ".")) : 0;

  return {
    numero,
    data,
    formato: "ZONA_SUL",
    fornecedor: {
      nome: "DEPÓSITO ZONA SUL",
      cnpj: "",
      telefone: "(11) 5545-1900",
      endereco: "Av. Interlagos, 1386 - São Paulo/SP",
      email: "",
      vendedor: matchVendedor ? matchVendedor[1] : "",
      categoriaDetectada: detectarCategoriaFornecedor("ZONA SUL FERRAMENTAS DEPOSITO")
    },
    itens,
    valorProdutos: valorTotal,
    valorFrete: 0,
    valorDesconto: 0,
    valorTotal,
    formaPagamento: matchPagto ? matchPagto[1].trim() : "",
    condicaoPagamento: "",
    validadeProposta: "",
    prazoEntrega: "",
    confianca: itens.length > 0 ? 80 : 40
  };
}

/**
 * Parser para formato OTIMIZI (Portas)
 */
function parseOtimizi(texto: string): Partial<OrcamentoExtraido> {
  // Extrair número da proposta
  const matchNumero = texto.match(/Proposta\s*Comercial\s*N[º°]\s*(\d+)/i);
  const numero = matchNumero ? matchNumero[1] : "";

  // Extrair data
  const matchData = texto.match(/(\d{2}\/\d{2}\/\d{4})/);
  let data: Date | null = null;
  if (matchData) {
    const [dia, mes, ano] = matchData[1].split("/");
    data = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
  }

  // Extrair CNPJ
  const matchCNPJ = texto.match(/(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})/);

  // Extrair vendedor
  const matchVendedor = texto.match(/Vendedor\(a\):\s*([^\n]+)/i);

  // Extrair itens - Formato OTIMIZI
  const itens: ItemOrcamento[] = [];

  // Padrão simplificado para OTIMIZI
  const regexItem = /Modelo\s+([^\n]+?)\s*-[^\n]*?\n.*?([\d.,]+)\s+([\d.,]+)\s+([\d.,]+)/gi;

  let match;
  while ((match = regexItem.exec(texto)) !== null) {
    const quantidade = parseFloat(match[2].replace(",", "."));
    const precoUnitario = parseFloat(match[3].replace(/\./g, "").replace(",", "."));
    const valorTotal = parseFloat(match[4].replace(/\./g, "").replace(",", "."));

    if (quantidade > 0) {
      itens.push({
        codigo: "",
        descricao: `Porta ${match[1].trim()}`,
        unidade: "UN",
        quantidade,
        precoUnitario,
        valorTotal
      });
    }
  }

  // Extrair totais
  const matchTotalItens = texto.match(/Total\s*dos\s*itens\s*([\d.,]+)/i);
  const matchDesconto = texto.match(/Desconto\s*([\d%,]+)/i);
  const matchFrete = texto.match(/Frete\s*([\d.,]+)/i);
  const matchTotalProposta = texto.match(/Total\s*da\s*proposta\s*([\d.,]+)/i);

  const valorTotal = matchTotalProposta
    ? parseFloat(matchTotalProposta[1].replace(/\./g, "").replace(",", "."))
    : 0;

  // Forma de pagamento
  const matchPagto = texto.match(/Forma\s*de\s*Pagamento:\s*([^\n]+)/i);
  const matchValidade = texto.match(/Validade\s*da\s*proposta\s*(\d+\s*dias?)/i);
  const matchPrazo = texto.match(/Prazo\s*de\s*entrega\s*([^\n]+)/i);

  return {
    numero,
    data,
    formato: "OTIMIZI",
    fornecedor: {
      nome: "OTIMIZI SOLUÇÕES EM AMBIENTES LTDA",
      cnpj: matchCNPJ ? matchCNPJ[1].replace(/\D/g, "") : "14046480000136",
      telefone: "(11) 4003-4742",
      endereco: "Rua Luciano Francisco da Silva, 643 - Osasco/SP",
      email: "financeiro@otimizi.com",
      vendedor: matchVendedor ? matchVendedor[1].trim() : "",
      categoriaDetectada: detectarCategoriaFornecedor("OTIMIZI PORTA EMBUTIR")
    },
    itens,
    valorProdutos: matchTotalItens ? parseFloat(matchTotalItens[1].replace(/\./g, "").replace(",", ".")) : valorTotal,
    valorFrete: matchFrete ? parseFloat(matchFrete[1].replace(/\./g, "").replace(",", ".")) : 0,
    valorDesconto: 0,
    valorTotal,
    formaPagamento: matchPagto ? matchPagto[1].trim() : "",
    condicaoPagamento: "",
    validadeProposta: matchValidade ? matchValidade[1] : "",
    prazoEntrega: matchPrazo ? matchPrazo[1].trim() : "",
    confianca: itens.length > 0 ? 75 : 40
  };
}

/**
 * Parser para formato SALVABRAS (Proteção de Obra)
 */
function parseSalvabras(texto: string): Partial<OrcamentoExtraido> {
  // Extrair número da proposta
  const matchNumero = texto.match(/Proposta\s*N[º°]:\s*(\d+\/?\d*)/i);
  const numero = matchNumero ? matchNumero[1] : "";

  // Extrair data
  const matchData = texto.match(/Data[\.]*:\s*(\d{2}\/\d{2}\/\d{4})/i);
  let data: Date | null = null;
  if (matchData) {
    const [dia, mes, ano] = matchData[1].split("/");
    data = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
  }

  // Extrair vendedor
  const matchVendedor = texto.match(/Vendedor[\.]*:\s*([^\n]+)/i);

  // Extrair itens - Formato SALVABRAS
  const itens: ItemOrcamento[] = [];

  // Padrão: Codigo.: PXXXXX Descrição: XXXX Unidade...: XX
  // Quantidade R$ Unitário ... Subtotal
  const regexItem = /Código\.?:\s*(P\d+)\s+Descrição:\s*([^\n]+?)Unidade\.+:\s*(\w+).*?Quantidade\s+R\$\s*Unitário.*?\n\s*([\d.,]+)\s+([\d.,]+)\s+[\-\d.,]*\s+([\d.,]+)/gis;

  let match;
  while ((match = regexItem.exec(texto)) !== null) {
    const quantidade = parseFloat(match[4].replace(",", "."));
    const precoUnitario = parseFloat(match[5].replace(/\./g, "").replace(",", "."));
    const valorTotal = parseFloat(match[6].replace(/\./g, "").replace(",", "."));

    if (quantidade > 0) {
      itens.push({
        codigo: match[1],
        descricao: match[2].trim(),
        unidade: match[3],
        quantidade,
        precoUnitario,
        valorTotal
      });
    }
  }

  // Extrair totais
  const matchTotalProdutos = texto.match(/Total\s*de\s*produtos:\s*([\d.,]+)/i);
  const matchTotalGeral = texto.match(/Total\s*Geral:\s*([\d.,]+)/i);
  const matchFrete = texto.match(/Frete\s*Estimado:\s*([\d.,]+)/i);

  const valorTotal = matchTotalGeral
    ? parseFloat(matchTotalGeral[1].replace(/\./g, "").replace(",", "."))
    : 0;

  // Condições
  const matchPagto = texto.match(/Cond\.\s*Pagamento[\.]*:\s*([^\n]+)/i);
  const matchPrazo = texto.match(/Prazo\s*Entrega[\.]*:\s*([^\n]+)/i);

  return {
    numero,
    data,
    formato: "SALVABRAS",
    fornecedor: {
      nome: "SALVABRAS SOLUÇÕES EM PROTEÇÃO LTDA",
      cnpj: "16557984000146",
      telefone: "0800 591 9352",
      endereco: "Rua Anhanguera, 425 - Osasco/SP",
      email: "contato@salvabras.com.br",
      vendedor: matchVendedor ? matchVendedor[1].trim() : "",
      categoriaDetectada: detectarCategoriaFornecedor("SALVABRAS PROTECAO OBRA")
    },
    itens,
    valorProdutos: matchTotalProdutos ? parseFloat(matchTotalProdutos[1].replace(/\./g, "").replace(",", ".")) : valorTotal,
    valorFrete: matchFrete ? parseFloat(matchFrete[1].replace(/\./g, "").replace(",", ".")) : 0,
    valorDesconto: 0,
    valorTotal,
    formaPagamento: matchPagto ? matchPagto[1].trim() : "",
    condicaoPagamento: "",
    validadeProposta: "",
    prazoEntrega: matchPrazo ? matchPrazo[1].trim() : "",
    confianca: itens.length > 0 ? 85 : 40
  };
}

/**
 * Parser genérico para formatos não identificados
 */
function parseGenerico(texto: string): Partial<OrcamentoExtraido> {
  // Tentar extrair dados básicos
  const matchNumero = texto.match(/(?:orçamento|proposta|pedido|seq)[^\d]*(\d+)/i);
  const matchData = texto.match(/(\d{2}\/\d{2}\/\d{4})/);
  const matchCNPJ = texto.match(/(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})/);
  const matchTotal = texto.match(/total[^\d]*([\d.,]+)/i);

  let data: Date | null = null;
  if (matchData) {
    const [dia, mes, ano] = matchData[1].split("/");
    data = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
  }

  // Tentar extrair primeira linha como nome do fornecedor
  const primeiraLinha = texto.split("\n")[0]?.trim() || "Fornecedor não identificado";

  return {
    numero: matchNumero ? matchNumero[1] : "",
    data,
    formato: "GENERICO",
    fornecedor: {
      nome: primeiraLinha.substring(0, 100),
      cnpj: matchCNPJ ? matchCNPJ[1].replace(/\D/g, "") : "",
      telefone: "",
      endereco: "",
      email: "",
      vendedor: "",
      categoriaDetectada: detectarCategoriaFornecedor(texto)
    },
    itens: [],
    valorProdutos: matchTotal ? parseFloat(matchTotal[1].replace(/\./g, "").replace(",", ".")) : 0,
    valorFrete: 0,
    valorDesconto: 0,
    valorTotal: matchTotal ? parseFloat(matchTotal[1].replace(/\./g, "").replace(",", ".")) : 0,
    formaPagamento: "",
    condicaoPagamento: "",
    validadeProposta: "",
    prazoEntrega: "",
    confianca: 30
  };
}

// ============================================================
// FUNÇÃO PRINCIPAL DE PARSING
// ============================================================

/**
 * Faz o parsing do texto do orçamento e retorna dados estruturados
 * Detecta automaticamente o formato e aplica o parser apropriado
 */
export function parseOrcamentoFornecedor(texto: string): OrcamentoExtraido {
  // Limpar texto
  const textoLimpo = texto
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();

  // Detectar formato
  const formato = detectarFormatoOrcamento(textoLimpo);

  // Aplicar parser específico
  let resultado: Partial<OrcamentoExtraido>;

  switch (formato) {
    case "MARACA":
      resultado = parseMaraca(textoLimpo);
      break;
    case "GDSUL":
      resultado = parseGDSUL(textoLimpo);
      break;
    case "ZONA_SUL":
      resultado = parseZonaSul(textoLimpo);
      break;
    case "OTIMIZI":
      resultado = parseOtimizi(textoLimpo);
      break;
    case "SALVABRAS":
      resultado = parseSalvabras(textoLimpo);
      break;
    default:
      resultado = parseGenerico(textoLimpo);
  }

  // Completar dados faltantes
  return {
    numero: resultado.numero || "",
    data: resultado.data || null,
    formato: resultado.formato || "GENERICO",
    fornecedor: resultado.fornecedor || {
      nome: "",
      cnpj: "",
      telefone: "",
      endereco: "",
      email: "",
      vendedor: "",
      categoriaDetectada: null
    },
    itens: resultado.itens || [],
    valorProdutos: resultado.valorProdutos || 0,
    valorFrete: resultado.valorFrete || 0,
    valorDesconto: resultado.valorDesconto || 0,
    valorTotal: resultado.valorTotal || 0,
    formaPagamento: resultado.formaPagamento || "",
    condicaoPagamento: resultado.condicaoPagamento || "",
    validadeProposta: resultado.validadeProposta || "",
    prazoEntrega: resultado.prazoEntrega || "",
    textoOriginal: textoLimpo,
    confianca: resultado.confianca || 0
  };
}

// ============================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================

/**
 * Normaliza unidade do fornecedor para o sistema
 */
export const MAPA_UNIDADES: Record<string, string> = {
  UN: "und",
  UND: "und",
  UNID: "und",
  UNIDADE: "und",
  PC: "pç",
  PÇ: "pç",
  PEÇA: "pç",
  CX: "cx",
  CAIXA: "cx",
  M: "m",
  ML: "m",
  MT: "m",
  METRO: "m",
  "M²": "m²",
  M2: "m²",
  KG: "kg",
  L: "l",
  LT: "l",
  CT: "ct",
  CENTO: "ct",
  RL: "rolo",
  ROLO: "rolo",
  KT: "kit",
  KIT: "kit",
  "1": "und"
};

export function normalizarUnidade(unidade: string): string {
  const unidadeUpper = unidade.trim().toUpperCase();
  return MAPA_UNIDADES[unidadeUpper] || unidade.toLowerCase();
}

/**
 * Formata CNPJ para exibição
 */
export function formatarCNPJ(cnpj: string): string {
  const numeros = cnpj.replace(/\D/g, "");
  if (numeros.length !== 14) return cnpj;
  return numeros.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5"
  );
}

/**
 * Gera sugestão de descrição para item do pricelist
 */
export function gerarDescricaoPricelist(item: ItemOrcamento, fornecedor: string): string {
  let descricao = item.descricao;

  // Limpar descrição
  descricao = descricao
    .replace(/\.+$/, "") // Remover pontos no final
    .replace(/\s+/g, " ") // Normalizar espaços
    .trim();

  // Capitalizar primeira letra de cada palavra
  descricao = descricao
    .toLowerCase()
    .replace(/(?:^|\s)\S/g, (a) => a.toUpperCase());

  return descricao;
}

/**
 * Calcula similaridade entre strings (para match com pricelist)
 */
export function calcularSimilaridade(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 100;

  // Verifica se uma contém a outra
  if (s1.includes(s2) || s2.includes(s1)) {
    const maior = Math.max(s1.length, s2.length);
    const menor = Math.min(s1.length, s2.length);
    return Math.round((menor / maior) * 100);
  }

  // Conta palavras em comum
  const palavras1 = s1.split(/\s+/).filter((p) => p.length > 2);
  const palavras2 = s2.split(/\s+/).filter((p) => p.length > 2);

  let matches = 0;
  for (const p1 of palavras1) {
    for (const p2 of palavras2) {
      if (p1 === p2 || p1.includes(p2) || p2.includes(p1)) {
        matches++;
        break;
      }
    }
  }

  const totalPalavras = Math.max(palavras1.length, palavras2.length);
  if (totalPalavras === 0) return 0;

  return Math.round((matches / totalPalavras) * 100);
}
