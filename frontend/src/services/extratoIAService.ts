// ========================================
// SERVIÇO DE IA PARA CLASSIFICAÇÃO DE EXTRATOS
// Usa padrões aprendidos + heurísticas + IA externa
// ========================================

import { supabase } from '@/lib/supabaseClient';
import type { LinhaExtrato } from './extratoParserService';

export interface ClassificacaoIA {
  categoria_id: string | null;
  categoria_sugerida: string | null;
  projeto_id: string | null;
  projeto_sugerido: string | null;
  contrato_id: string | null;
  contrato_sugerido: string | null;
  pessoa_id: string | null;
  pessoa_sugerida: string | null;
  confianca: number; // 0-100
  motivo: string;
  descricao_formatada: string;
}

interface PadraoAprendido {
  id: string;
  padrao_texto: string;
  tipo_match: string;
  categoria_id: string | null;
  projeto_id: string | null;
  contrato_id: string | null;
  pessoa_id: string | null;
}

interface ProjetoContrato {
  id: string;
  nome?: string;
  numero?: string;
  titulo?: string;
  cliente_nome?: string;
}

// ========================================
// CLASSIFICADOR PRINCIPAL
// ========================================
export async function classificarLinhas(
  linhas: LinhaExtrato[],
  promptPersonalizado?: string
): Promise<Map<number, ClassificacaoIA>> {
  const resultados = new Map<number, ClassificacaoIA>();

  // 1. Carregar dados de referência
  const [padroes, projetos, contratos, categorias, pessoas] = await Promise.all([
    carregarPadroes(),
    carregarProjetos(),
    carregarContratos(),
    carregarCategorias(),
    carregarPessoas(),
  ]);

  // 2. Se houver prompt personalizado, adicionar regras extras
  const padroesExtras = promptPersonalizado
    ? processarPromptPersonalizado(promptPersonalizado)
    : [];

  // 3. Classificar cada linha
  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i];
    const classificacao = await classificarLinha(
      linha,
      [...padroes, ...padroesExtras],
      projetos,
      contratos,
      categorias,
      pessoas,
      promptPersonalizado
    );
    resultados.set(i, classificacao);
  }

  return resultados;
}

// ========================================
// PROCESSAR PROMPT PERSONALIZADO
// ========================================
function processarPromptPersonalizado(prompt: string): PadraoAprendido[] {
  const padroes: PadraoAprendido[] = [];

  // Extrair padrões do texto do prompt
  // Exemplo: "pagamentos para 'CONSTRUTORA XYZ' são do projeto X"
  const regexPadrao = /(?:pagamento|despesa|transação|gasto)s?\s+(?:para|com|de)\s+['"]([^'"]+)['"]/gi;
  let match;

  while ((match = regexPadrao.exec(prompt)) !== null) {
    padroes.push({
      id: `custom-${padroes.length}`,
      padrao_texto: match[1],
      tipo_match: 'contains',
      categoria_id: null,
      projeto_id: null,
      contrato_id: null,
      pessoa_id: null,
    });
  }

  return padroes;
}

// ========================================
// CLASSIFICAR UMA LINHA
// ========================================
async function classificarLinha(
  linha: LinhaExtrato,
  padroes: PadraoAprendido[],
  projetos: ProjetoContrato[],
  contratos: ProjetoContrato[],
  categorias: any[],
  pessoas: any[],
  promptPersonalizado?: string
): Promise<ClassificacaoIA> {
  const descricao = linha.descricao.toUpperCase();
  let resultado: ClassificacaoIA = {
    categoria_id: null,
    categoria_sugerida: null,
    projeto_id: null,
    projeto_sugerido: null,
    contrato_id: null,
    contrato_sugerido: null,
    pessoa_id: null,
    pessoa_sugerida: null,
    confianca: 0,
    motivo: 'Não identificado',
    descricao_formatada: formatarDescricao(linha.descricao),
  };

  // 1. Verificar padrões aprendidos (maior prioridade)
  const padraoMatch = encontrarPadrao(descricao, padroes);
  if (padraoMatch) {
    resultado = {
      ...resultado,
      categoria_id: padraoMatch.categoria_id,
      projeto_id: padraoMatch.projeto_id,
      contrato_id: padraoMatch.contrato_id,
      pessoa_id: padraoMatch.pessoa_id,
      confianca: 95,
      motivo: 'Padrão aprendido',
    };
  }

  // 2. Buscar projeto/contrato pelo nome na descrição
  if (!resultado.projeto_id) {
    const projetoMatch = encontrarProjeto(descricao, projetos);
    if (projetoMatch) {
      resultado.projeto_id = projetoMatch.id;
      resultado.projeto_sugerido = projetoMatch.nome || projetoMatch.numero;
      resultado.confianca = Math.max(resultado.confianca, 80);
      resultado.motivo = resultado.motivo === 'Não identificado'
        ? 'Nome do projeto encontrado'
        : resultado.motivo;
    }
  }

  if (!resultado.contrato_id) {
    const contratoMatch = encontrarContrato(descricao, contratos);
    if (contratoMatch) {
      resultado.contrato_id = contratoMatch.id;
      resultado.contrato_sugerido = contratoMatch.numero || contratoMatch.titulo;
      resultado.confianca = Math.max(resultado.confianca, 80);
      resultado.motivo = resultado.motivo === 'Não identificado'
        ? 'Número do contrato encontrado'
        : resultado.motivo;
    }
  }

  // 3. Identificar categoria por palavras-chave
  if (!resultado.categoria_id) {
    const categoriaMatch = identificarCategoria(descricao, linha.tipo, categorias);
    if (categoriaMatch) {
      resultado.categoria_id = categoriaMatch.id;
      resultado.categoria_sugerida = categoriaMatch.nome;
      resultado.confianca = Math.max(resultado.confianca, 70);
    }
  }

  // 4. Identificar pessoa/fornecedor
  if (!resultado.pessoa_id) {
    const pessoaMatch = encontrarPessoa(descricao, pessoas);
    if (pessoaMatch) {
      resultado.pessoa_id = pessoaMatch.id;
      resultado.pessoa_sugerida = pessoaMatch.nome;
      resultado.confianca = Math.max(resultado.confianca, 75);
    }
  }

  // 5. Se não identificou nada, marcar como baixa confiança
  if (resultado.confianca === 0) {
    resultado.confianca = 10;
    resultado.motivo = 'A definir - requer classificação manual';
  }

  return resultado;
}

// ========================================
// FUNÇÕES DE BUSCA E MATCH
// ========================================

function encontrarPadrao(descricao: string, padroes: PadraoAprendido[]): PadraoAprendido | null {
  for (const padrao of padroes) {
    const texto = padrao.padrao_texto.toUpperCase();

    switch (padrao.tipo_match) {
      case 'exact':
        if (descricao === texto) return padrao;
        break;
      case 'starts_with':
        if (descricao.startsWith(texto)) return padrao;
        break;
      case 'contains':
        if (descricao.includes(texto)) return padrao;
        break;
      case 'regex':
        try {
          if (new RegExp(padrao.padrao_texto, 'i').test(descricao)) return padrao;
        } catch {}
        break;
    }
  }
  return null;
}

function encontrarProjeto(descricao: string, projetos: ProjetoContrato[]): ProjetoContrato | null {
  for (const projeto of projetos) {
    const termos = [
      projeto.nome?.toUpperCase(),
      projeto.numero?.toUpperCase(),
      projeto.cliente_nome?.toUpperCase(),
    ].filter(Boolean) as string[];

    for (const termo of termos) {
      if (termo && termo.length > 3 && descricao.includes(termo)) {
        return projeto;
      }
    }
  }
  return null;
}

function encontrarContrato(descricao: string, contratos: ProjetoContrato[]): ProjetoContrato | null {
  for (const contrato of contratos) {
    const termos = [
      contrato.numero?.toUpperCase(),
      contrato.titulo?.toUpperCase(),
    ].filter(Boolean) as string[];

    for (const termo of termos) {
      if (termo && termo.length > 2 && descricao.includes(termo)) {
        return contrato;
      }
    }
  }
  return null;
}

function encontrarPessoa(descricao: string, pessoas: any[]): any | null {
  for (const pessoa of pessoas) {
    const nome = pessoa.nome?.toUpperCase();
    const razaoSocial = pessoa.razao_social?.toUpperCase();

    // Buscar nome completo ou parcial (mínimo 4 caracteres)
    if (nome && nome.length > 4) {
      const partes = nome.split(' ').filter((p: string) => p.length > 3);
      for (const parte of partes) {
        if (descricao.includes(parte)) return pessoa;
      }
    }

    if (razaoSocial && razaoSocial.length > 4 && descricao.includes(razaoSocial)) {
      return pessoa;
    }
  }
  return null;
}

function identificarCategoria(descricao: string, tipo: string, categorias: any[]): any | null {
  // Palavras-chave para categorias comuns
  const keywords: Record<string, string[]> = {
    // Despesas
    'SALARIO': ['FOLHA', 'SALARIO', 'PAGTO FUNC', 'ADIANTAMENTO', 'FERIAS', '13'],
    'IMPOSTOS': ['DARF', 'GPS', 'FGTS', 'INSS', 'ICMS', 'ISS', 'IPTU', 'IPVA'],
    'ENERGIA': ['CEMIG', 'CPFL', 'LIGHT', 'ELETROPAULO', 'ENERGIA', 'CELESC'],
    'AGUA': ['COPASA', 'SABESP', 'CEDAE', 'SANEPAR', 'AGUA'],
    'TELEFONE': ['VIVO', 'CLARO', 'TIM', 'OI', 'TELEFONE', 'CELULAR'],
    'INTERNET': ['INTERNET', 'FIBRA', 'BANDA LARGA'],
    'ALUGUEL': ['ALUGUEL', 'LOCACAO', 'CONDOMINIO'],
    'COMBUSTIVEL': ['POSTO', 'COMBUSTIVEL', 'GASOLINA', 'DIESEL', 'ETANOL', 'SHELL', 'IPIRANGA', 'BR'],
    'MATERIAL': ['MATERIAL', 'LEROY', 'TELHA', 'CIMENTO', 'AREIA', 'BRITA', 'FERRAG'],
    'ALIMENTACAO': ['RESTAURANTE', 'LANCHONETE', 'IFOOD', 'RAPPI', 'ALIMENTA'],
    'BANCO': ['TARIFA', 'IOF', 'TED', 'DOC', 'MANUT CONTA', 'ANUIDADE'],
    // Receitas
    'VENDAS': ['VENDA', 'RECEBIMENTO', 'CLIENTE', 'PARCELA'],
    'SERVICOS': ['SERVICO', 'HONORARIO', 'CONSULTORIA'],
  };

  const descUpper = descricao.toUpperCase();

  for (const [categoriaNome, palavras] of Object.entries(keywords)) {
    for (const palavra of palavras) {
      if (descUpper.includes(palavra)) {
        // Buscar categoria correspondente no banco
        const categoria = categorias.find(c =>
          c.nome?.toUpperCase().includes(categoriaNome) ||
          categoriaNome.includes(c.nome?.toUpperCase())
        );
        if (categoria) return categoria;

        // Se não encontrou, retornar sugestão de nome
        return { id: null, nome: categoriaNome };
      }
    }
  }

  return null;
}

function formatarDescricao(descricao: string): string {
  // Limpar e formatar a descrição
  let formatada = descricao
    .replace(/\s+/g, ' ')
    .trim();

  // Capitalizar primeira letra de cada palavra significativa
  formatada = formatada
    .toLowerCase()
    .replace(/(?:^|\s)\S/g, (a) => a.toUpperCase());

  // Manter siglas em maiúsculas
  formatada = formatada.replace(/\b(PIX|TED|DOC|DARF|GPS|FGTS|INSS)\b/gi, (m) => m.toUpperCase());

  return formatada;
}

// ========================================
// CARREGAR DADOS DE REFERÊNCIA
// ========================================

async function carregarPadroes(): Promise<PadraoAprendido[]> {
  try {
    const { data } = await supabase
      .from('financeiro_padroes_aprendidos')
      .select('*')
      .order('vezes_usado', { ascending: false });

    return data || [];
  } catch {
    return [];
  }
}

async function carregarProjetos(): Promise<ProjetoContrato[]> {
  try {
    const { data } = await supabase
      .from('projetos')
      .select('id, nome, numero')
      .order('created_at', { ascending: false })
      .limit(100);

    return data || [];
  } catch {
    return [];
  }
}

async function carregarContratos(): Promise<ProjetoContrato[]> {
  try {
    const { data } = await supabase
      .from('contratos')
      .select('id, numero, titulo')
      .order('created_at', { ascending: false })
      .limit(100);

    return data || [];
  } catch {
    return [];
  }
}

async function carregarCategorias(): Promise<any[]> {
  try {
    const { data } = await supabase
      .from('financeiro_categorias')
      .select('id, nome, tipo')
      .order('nome');

    return data || [];
  } catch {
    return [];
  }
}

async function carregarPessoas(): Promise<any[]> {
  try {
    const { data } = await supabase
      .from('pessoas')
      .select('id, nome, razao_social, tipo')
      .order('nome')
      .limit(500);

    return data || [];
  } catch {
    return [];
  }
}

// ========================================
// SALVAR PADRÃO APRENDIDO
// ========================================
export async function salvarPadraoAprendido(
  padrao: string,
  classificacao: {
    categoria_id?: string;
    projeto_id?: string;
    contrato_id?: string;
    pessoa_id?: string;
  }
): Promise<void> {
  await supabase
    .from('financeiro_padroes_aprendidos')
    .upsert({
      padrao_texto: padrao,
      tipo_match: 'contains',
      ...classificacao,
      vezes_usado: 1,
      ativo: true,
    }, {
      onConflict: 'padrao_texto',
    });
}

// ========================================
// VERIFICAR DUPLICATAS
// ========================================
export async function verificarDuplicatas(
  linhas: LinhaExtrato[]
): Promise<Map<number, string>> {
  const duplicatas = new Map<number, string>();

  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i];

    // Buscar lançamento com mesma data e valor
    const { data } = await supabase
      .from('financeiro_lancamentos')
      .select('id, descricao')
      .eq('data_competencia', linha.data)
      .gte('valor', linha.valor - 0.01)
      .lte('valor', linha.valor + 0.01)
      .limit(1);

    if (data && data.length > 0) {
      duplicatas.set(i, data[0].id);
    }
  }

  return duplicatas;
}
