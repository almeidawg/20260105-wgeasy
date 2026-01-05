// ============================================================
// API: Propostas Comerciais
// ============================================================

import { supabase } from "./supabaseClient";
import type {
  Proposta,
  PropostaItem,
  PropostaCompleta,
  PropostaFormData,
  PropostaItemInput,
} from "@/types/propostas";

// ============================================================
// PROPOSTAS
// ============================================================

export async function listarPropostas(): Promise<PropostaCompleta[]> {
  const { data, error } = await supabase
    .from("propostas")
    .select(`
      *,
      pessoas!cliente_id(nome)
    `)
    .order("criado_em", { ascending: false });

  if (error) throw error;

  return (data || []).map((row: any) => ({
    ...row,
    cliente_nome: row.pessoas?.nome || "Cliente não encontrado",
    itens: [], // Itens carregados separadamente quando necessário
  }));
}

export async function buscarProposta(id: string): Promise<PropostaCompleta> {
  // Buscar proposta
  const { data: proposta, error: propostaError } = await supabase
    .from("propostas")
    .select(`
      *,
      pessoas!cliente_id(nome)
    `)
    .eq("id", id)
    .single();

  if (propostaError) throw propostaError;
  if (!proposta) throw new Error("Proposta não encontrada");

  // Buscar itens da proposta com JOIN do pricelist para trazer informações completas
  const { data: itens, error: itensError } = await supabase
    .from("propostas_itens")
    .select(`
      *,
      pricelist:pricelist_itens!pricelist_item_id(
        id,
        codigo,
        nome,
        descricao,
        categoria,
        tipo,
        unidade,
        nucleo_id,
        imagem_url,
        nucleo:nucleos!nucleo_id(id, nome)
      )
    `)
    .eq("proposta_id", id)
    .order("ordem", { ascending: true });

  if (itensError) throw itensError;

  // Mesclar dados do item da proposta com dados do pricelist
  const itensCompletos = (itens || []).map((item: any) => ({
    ...item,
    // Se tiver dados do pricelist, mesclar com os dados do item
    nome: item.nome || item.pricelist?.nome || "Item sem nome",
    descricao: item.descricao || item.pricelist?.descricao || "",
    categoria: item.categoria || item.pricelist?.categoria || "",
    tipo: item.tipo || item.pricelist?.tipo || "material",
    unidade: item.unidade || item.pricelist?.unidade || "un",
    // NOVO: Usar nome do núcleo do join
    nucleo: item.nucleo || item.pricelist?.nucleo?.nome || undefined,
    nucleo_id: item.nucleo_id || item.pricelist?.nucleo_id || undefined,
    codigo: item.codigo || item.pricelist?.codigo || "",
    imagem_url: item.imagem_url || item.pricelist?.imagem_url || undefined,
  }));

  return {
    ...proposta,
    cliente_nome: proposta.pessoas?.nome || "Cliente não encontrado",
    itens: itensCompletos,
  };
}

export async function criarProposta(
  dados: PropostaFormData,
  itens: PropostaItemInput[] = []
): Promise<PropostaCompleta> {
  // Calcular totais
  const totais = itens.reduce(
    (acc, item) => {
      const subtotal = item.quantidade * item.valor_unitario;
      if (item.tipo === "material") {
        acc.materiais += subtotal;
      } else if (item.tipo === "mao_obra") {
        acc.maoObra += subtotal;
      } else {
        acc.materiais += subtotal / 2;
        acc.maoObra += subtotal / 2;
      }
      acc.total += subtotal;
      return acc;
    },
    { materiais: 0, maoObra: 0, total: 0 }
  );

  // Criar proposta usando INSERT direto
  const { data: novaProposta, error: propostaError } = await supabase
    .from("propostas")
    .insert({
      cliente_id: dados.cliente_id,
      oportunidade_id: dados.oportunidade_id || null,
      titulo: dados.titulo,
      descricao: dados.descricao || null,
      forma_pagamento: dados.forma_pagamento || 'parcelado',
      percentual_entrada: dados.percentual_entrada || 30,
      numero_parcelas: dados.numero_parcelas || 3,
      validade_dias: dados.validade_dias || 30,
      prazo_execucao_dias: dados.prazo_execucao_dias || 60,
      valor_materiais: totais.materiais,
      valor_mao_obra: totais.maoObra,
      valor_total: totais.total,
      exibir_valores: dados.exibir_valores ?? true,
      status: 'rascunho',
    })
    .select()
    .single();

  if (propostaError) throw propostaError;
  if (!novaProposta) throw new Error("Erro ao criar proposta");

  // Usar a proposta criada
  const proposta = novaProposta;

  // Criar itens da proposta
  if (itens.length > 0) {
    const itensParaInserir = itens.map((item, index) => ({
      proposta_id: proposta.id,
      pricelist_item_id: item.pricelist_item_id,
      codigo: item.codigo,
      nome: item.nome,
      descricao: item.descricao,
      categoria: item.categoria,
      tipo: item.tipo,
      unidade: item.unidade,
      quantidade: item.quantidade,
      valor_unitario: item.valor_unitario,
      descricao_customizada: item.descricao_customizada,
      ambiente_id: item.ambiente_id,
      ordem: item.ordem ?? index,
      // Persistir sempre o n£cleo atual do item (herdado do Pricelist)
      nucleo: item.nucleo ?? null,
    }));

    const { error: itensError } = await supabase
      .from("propostas_itens")
      .insert(itensParaInserir);

    if (itensError) throw itensError;
  }

  // Retornar proposta completa
  return buscarProposta(proposta.id);
}

export async function atualizarProposta(
  id: string,
  dados: Partial<PropostaFormData>
): Promise<Proposta> {
  const { data, error } = await supabase
    .from("propostas")
    .update(dados)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error("Proposta não encontrada");

  return data;
}

export async function atualizarStatusProposta(
  id: string,
  status: string
): Promise<Proposta> {
  const { data, error } = await supabase
    .from("propostas")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error("Proposta não encontrada");

  return data;
}

export async function deletarProposta(id: string): Promise<void> {
  const { error } = await supabase.from("propostas").delete().eq("id", id);

  if (error) throw error;
}

/**
 * Gerar número de revisão para proposta duplicada
 * Formato: NÚCLEO/DATA-SEQ#CLIENTE/REV01
 */
async function gerarNumeroRevisao(
  numeroOriginal: string | null,
  clienteId: string,
  nucleo: string
): Promise<string | null> {
  if (!numeroOriginal) return null;

  // Buscar todas as propostas com o mesmo número base (original + revisões)
  const numeroBase = numeroOriginal.split("/REV")[0]; // Remove /REV01, /REV02, etc.

  const { data: propostas } = await supabase
    .from("propostas")
    .select("numero")
    .eq("cliente_id", clienteId)
    .ilike("numero", `${numeroBase}%`)
    .order("numero", { ascending: false });

  if (!propostas || propostas.length === 0) {
    // Primeira revisão
    return `${numeroBase}/REV01`;
  }

  // Encontrar o maior número de revisão
  let maiorRevisao = 0;
  propostas.forEach((p) => {
    if (p.numero) {
      const match = p.numero.match(/\/REV(\d+)$/);
      if (match) {
        const numRevisao = parseInt(match[1], 10);
        if (numRevisao > maiorRevisao) {
          maiorRevisao = numRevisao;
        }
      }
    }
  });

  // Próxima revisão
  const proximaRevisao = (maiorRevisao + 1).toString().padStart(2, "0");
  return `${numeroBase}/REV${proximaRevisao}`;
}

/**
 * Duplicar uma proposta existente (cópia completa com todos os itens)
 */
export async function duplicarProposta(id: string): Promise<string> {
  // 1. Buscar proposta original
  const propostaOriginal = await buscarProposta(id);

  // 2. Gerar número de revisão
  const numeroRevisao = await gerarNumeroRevisao(
    propostaOriginal.numero ?? null,
    propostaOriginal.cliente_id,
    propostaOriginal.nucleo || ""
  );

  // 3. Criar nova proposta (sem ID, com numero de revisão, status rascunho)
  const { data: novaProposta, error: erroproposta } = await supabase
    .from("propostas")
    .insert({
      cliente_id: propostaOriginal.cliente_id,
      titulo: propostaOriginal.titulo,
      descricao: propostaOriginal.descricao,
      valor_total: propostaOriginal.valor_total,
      valor_materiais: propostaOriginal.valor_materiais,
      valor_mao_obra: propostaOriginal.valor_mao_obra,
      numero_parcelas: propostaOriginal.numero_parcelas,
      percentual_entrada: propostaOriginal.percentual_entrada,
      forma_pagamento: propostaOriginal.forma_pagamento,
      prazo_execucao_dias: propostaOriginal.prazo_execucao_dias,
      validade_dias: propostaOriginal.validade_dias,
      exibir_valores: propostaOriginal.exibir_valores,
      status: "rascunho",
      nucleo: propostaOriginal.nucleo,
      numero: numeroRevisao,
    })
    .select()
    .single();

  if (erroproposta) throw erroproposta;
  if (!novaProposta) throw new Error("Erro ao criar cópia da proposta");

  // 3. Copiar todos os itens (valor_subtotal é calculado automaticamente)
  if (propostaOriginal.itens && propostaOriginal.itens.length > 0) {
    const itensParaCopiar = propostaOriginal.itens.map((item: any) => ({
      proposta_id: novaProposta.id,
      pricelist_item_id: item.pricelist_item_id,
      nome: item.nome,
      descricao: item.descricao,
      descricao_customizada: item.descricao_customizada,
      quantidade: item.quantidade,
      unidade: item.unidade,
      valor_unitario: item.valor_unitario,
      // valor_subtotal: REMOVIDO - é coluna calculada automaticamente (quantidade * valor_unitario)
      categoria: item.categoria,
      tipo: item.tipo,
      nucleo: item.nucleo,
      ordem: item.ordem,
    }));

    const { error: erroItens } = await supabase
      .from("propostas_itens")
      .insert(itensParaCopiar);

    if (erroItens) throw erroItens;
  }

  return novaProposta.id;
}

// ============================================================
// ITENS DA PROPOSTA
// ============================================================

export async function adicionarItemProposta(
  propostaId: string,
  item: PropostaItemInput
): Promise<PropostaItem> {
  const { data, error } = await supabase
    .from("propostas_itens")
    .insert({
      proposta_id: propostaId,
      pricelist_item_id: item.pricelist_item_id,
      codigo: item.codigo,
      nome: item.nome,
      descricao: item.descricao,
      categoria: item.categoria,
      tipo: item.tipo,
      unidade: item.unidade,
      quantidade: item.quantidade,
      valor_unitario: item.valor_unitario,
      descricao_customizada: item.descricao_customizada,
      ambiente_id: item.ambiente_id,
      ordem: item.ordem || 0,
      // Quando vier do Pricelist, o item j  tem n£cleo definido
      nucleo: item.nucleo ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error("Erro ao adicionar item");

  return data;
}

export async function atualizarItemProposta(
  itemId: string,
  dados: Partial<PropostaItemInput>
): Promise<PropostaItem> {
  const { data, error } = await supabase
    .from("propostas_itens")
    .update(dados)
    .eq("id", itemId)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error("Item não encontrado");

  return data;
}

export async function deletarItemProposta(itemId: string): Promise<void> {
  const { error } = await supabase
    .from("propostas_itens")
    .delete()
    .eq("id", itemId);

  if (error) throw error;
}

// ============================================================
// SINCRONIZAR ITENS COM PRICELIST
// Atualiza categoria, núcleo e tipo dos itens das propostas
// com base nos dados atuais do pricelist
// ============================================================

export interface SincronizacaoResultado {
  total: number;
  atualizados: number;
  erros: number;
  detalhes: string[];
}

// Tipos válidos para propostas_itens.tipo (conforme ENUM ou CHECK constraint)
const TIPOS_VALIDOS = ['material', 'mao_obra', 'ambos', 'servico', 'produto'];

// Núcleos válidos para propostas_itens.nucleo (conforme CHECK constraint)
const NUCLEOS_VALIDOS = ['arquitetura', 'engenharia', 'marcenaria', 'produtos'];

/**
 * Mapeia tipo do pricelist para tipo válido em propostas_itens
 */
function mapearTipoValido(tipo: string | null): string | null {
  if (!tipo) return null;

  const tipoLower = tipo.toLowerCase().trim();

  // Se já é um tipo válido, retornar
  if (TIPOS_VALIDOS.includes(tipoLower)) {
    return tipoLower;
  }

  // Mapeamentos comuns
  const mapeamentos: Record<string, string> = {
    'mão de obra': 'mao_obra',
    'mao de obra': 'mao_obra',
    'mão-de-obra': 'mao_obra',
    'mao-de-obra': 'mao_obra',
    'serviço': 'servico',
    'service': 'servico',
    'materials': 'material',
    'produtos': 'produto',
    'product': 'produto',
    'both': 'ambos',
  };

  if (mapeamentos[tipoLower]) {
    return mapeamentos[tipoLower];
  }

  // Default: material (mais comum)
  console.warn(`[Sync] Tipo "${tipo}" não reconhecido, usando "material"`);
  return 'material';
}

/**
 * Mapeia nome do núcleo para código válido em propostas_itens
 */
function mapearNucleoValido(nucleo: string | null): string | null {
  if (!nucleo) return null;

  const nucleoLower = nucleo.toLowerCase().trim();

  // Se já é um código válido, retornar
  if (NUCLEOS_VALIDOS.includes(nucleoLower)) {
    return nucleoLower;
  }

  // Mapeamentos de nomes para códigos
  const mapeamentos: Record<string, string> = {
    'arquitetura': 'arquitetura',
    'engenharia': 'engenharia',
    'marcenaria': 'marcenaria',
    'produtos': 'produtos',
    // Variações comuns
    'arq': 'arquitetura',
    'eng': 'engenharia',
    'marc': 'marcenaria',
    'prod': 'produtos',
  };

  if (mapeamentos[nucleoLower]) {
    return mapeamentos[nucleoLower];
  }

  // Tentar normalizar removendo acentos
  const nucleoNormalizado = nucleoLower
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (NUCLEOS_VALIDOS.includes(nucleoNormalizado)) {
    return nucleoNormalizado;
  }

  console.warn(`[Sync] Núcleo "${nucleo}" não reconhecido, ignorando`);
  return null;
}

/**
 * Sincroniza TODOS os itens de propostas com o pricelist atual
 * Atualiza os campos que existirem na tabela
 */
export async function sincronizarItensComPricelist(): Promise<SincronizacaoResultado> {
  const resultado: SincronizacaoResultado = {
    total: 0,
    atualizados: 0,
    erros: 0,
    detalhes: [],
  };

  // 1. Buscar todos os itens de propostas que têm vínculo com pricelist
  const { data: itensPropostas, error: erroItens } = await supabase
    .from("propostas_itens")
    .select("*")
    .not("pricelist_item_id", "is", null);

  if (erroItens) {
    throw new Error(`Erro ao buscar itens: ${erroItens.message}`);
  }

  if (!itensPropostas || itensPropostas.length === 0) {
    resultado.detalhes.push("Nenhum item vinculado ao pricelist encontrado.");
    return resultado;
  }

  resultado.total = itensPropostas.length;

  // Detectar quais colunas existem baseado no primeiro item
  const primeiroItem = itensPropostas[0];
  const colunasExistentes = Object.keys(primeiroItem);
  console.log("[Sync] Colunas existentes em propostas_itens:", colunasExistentes);

  // 2. Buscar todos os itens do pricelist de uma vez (mais eficiente)
  const pricelistIds = [...new Set(itensPropostas.map(i => i.pricelist_item_id))];

  const { data: itensPricelist, error: erroPricelist } = await supabase
    .from("pricelist_itens")
    .select(`
      id,
      codigo,
      nome,
      descricao,
      categoria,
      tipo,
      unidade,
      nucleo_id,
      nucleo:nucleos!nucleo_id(id, nome)
    `)
    .in("id", pricelistIds);

  if (erroPricelist) {
    throw new Error(`Erro ao buscar pricelist: ${erroPricelist.message}`);
  }

  // Criar mapa para acesso rápido
  const pricelistMap = new Map(
    (itensPricelist || []).map((item: any) => [item.id, item])
  );

  // Log dos tipos únicos encontrados no pricelist
  const tiposUnicos = [...new Set((itensPricelist || []).map((i: any) => i.tipo))];
  console.log("[Sync] Tipos únicos no pricelist:", tiposUnicos);

  // 3. Atualizar cada item da proposta - apenas campos que existem
  for (const itemProposta of itensPropostas) {
    const pricelistItem = pricelistMap.get(itemProposta.pricelist_item_id);

    if (!pricelistItem) {
      resultado.erros++;
      continue;
    }

    // Extrair nome do núcleo do JOIN
    const nucleoNome = (pricelistItem as any).nucleo?.nome || null;

    // Montar objeto de update apenas com campos que existem na tabela
    const dadosUpdate: Record<string, any> = {};

    // Verificar cada campo e só incluir se existir na tabela
    // IMPORTANTE: Mapear tipo para valor válido
    if (colunasExistentes.includes('tipo') && pricelistItem.tipo) {
      const tipoMapeado = mapearTipoValido(pricelistItem.tipo);
      if (tipoMapeado) {
        dadosUpdate.tipo = tipoMapeado;
      }
    }
    // IMPORTANTE: Mapear núcleo para código válido (arquitetura, engenharia, etc.)
    if (colunasExistentes.includes('nucleo') && nucleoNome) {
      const nucleoMapeado = mapearNucleoValido(nucleoNome);
      if (nucleoMapeado) {
        dadosUpdate.nucleo = nucleoMapeado;
      }
    }
    if (colunasExistentes.includes('categoria') && pricelistItem.categoria) {
      dadosUpdate.categoria = pricelistItem.categoria;
    }
    if (colunasExistentes.includes('unidade') && pricelistItem.unidade) {
      dadosUpdate.unidade = pricelistItem.unidade;
    }
    if (colunasExistentes.includes('codigo') && pricelistItem.codigo) {
      dadosUpdate.codigo = pricelistItem.codigo;
    }

    // Só fazer update se tiver algo para atualizar
    if (Object.keys(dadosUpdate).length === 0) {
      resultado.atualizados++;
      continue;
    }

    // Log detalhado do primeiro update para debug
    if (resultado.atualizados === 0 && resultado.erros === 0) {
      console.log("[Sync] Primeiro update - dados:", dadosUpdate);
      console.log("[Sync] Item ID:", itemProposta.id);
    }

    const { error: erroUpdate, data: dataUpdate } = await supabase
      .from("propostas_itens")
      .update(dadosUpdate)
      .eq("id", itemProposta.id)
      .select();

    if (erroUpdate) {
      resultado.erros++;
      // Log detalhado nos primeiros 3 erros
      if (resultado.erros <= 3) {
        console.error("[Sync] Erro ao atualizar item:", {
          itemId: itemProposta.id,
          dadosEnviados: dadosUpdate,
          erro: erroUpdate,
          mensagem: erroUpdate.message,
          codigo: erroUpdate.code,
          detalhes: erroUpdate.details,
          hint: erroUpdate.hint,
        });
        resultado.detalhes.push(
          `Erro ${resultado.erros}: ${erroUpdate.message} (code: ${erroUpdate.code})`
        );
      }
    } else {
      resultado.atualizados++;
    }
  }

  resultado.detalhes.unshift(
    `✅ ${resultado.atualizados} itens atualizados de ${resultado.total} total`
  );

  if (resultado.erros > 0) {
    resultado.detalhes.push(
      `Tipos válidos para propostas_itens: ${TIPOS_VALIDOS.join(', ')}`
    );
  }

  return resultado;
}

/**
 * Sincroniza itens de UMA proposta específica com o pricelist atual
 */
export async function sincronizarItensProposta(propostaId: string): Promise<SincronizacaoResultado> {
  const resultado: SincronizacaoResultado = {
    total: 0,
    atualizados: 0,
    erros: 0,
    detalhes: [],
  };

  // 1. Buscar itens desta proposta que têm vínculo com pricelist
  const { data: itensPropostas, error: erroItens } = await supabase
    .from("propostas_itens")
    .select("id, pricelist_item_id, nome")
    .eq("proposta_id", propostaId)
    .not("pricelist_item_id", "is", null);

  if (erroItens) {
    throw new Error(`Erro ao buscar itens: ${erroItens.message}`);
  }

  if (!itensPropostas || itensPropostas.length === 0) {
    resultado.detalhes.push("Nenhum item vinculado ao pricelist nesta proposta.");
    return resultado;
  }

  resultado.total = itensPropostas.length;

  // 2. Buscar dados atualizados do pricelist
  const pricelistIds = [...new Set(itensPropostas.map(i => i.pricelist_item_id))];

  const { data: itensPricelist, error: erroPricelist } = await supabase
    .from("pricelist_itens")
    .select(`
      id,
      codigo,
      nome,
      descricao,
      categoria,
      tipo,
      unidade,
      nucleo_id,
      nucleo:nucleos!nucleo_id(id, nome)
    `)
    .in("id", pricelistIds);

  if (erroPricelist) {
    throw new Error(`Erro ao buscar pricelist: ${erroPricelist.message}`);
  }

  const pricelistMap = new Map(
    (itensPricelist || []).map((item: any) => [item.id, item])
  );

  // 3. Atualizar cada item
  for (const itemProposta of itensPropostas) {
    const pricelistItem = pricelistMap.get(itemProposta.pricelist_item_id);

    if (!pricelistItem) {
      resultado.erros++;
      continue;
    }

    const nucleoNome = (pricelistItem as any).nucleo?.nome || null;

    // Atualizar apenas campos essenciais (tipo e nucleo) - com mapeamento
    const dadosUpdate: Record<string, any> = {};
    if (pricelistItem.tipo) {
      const tipoMapeado = mapearTipoValido(pricelistItem.tipo);
      if (tipoMapeado) dadosUpdate.tipo = tipoMapeado;
    }
    if (nucleoNome) {
      const nucleoMapeado = mapearNucleoValido(nucleoNome);
      if (nucleoMapeado) dadosUpdate.nucleo = nucleoMapeado;
    }

    if (Object.keys(dadosUpdate).length === 0) {
      resultado.atualizados++;
      continue;
    }

    const { error: erroUpdate } = await supabase
      .from("propostas_itens")
      .update(dadosUpdate)
      .eq("id", itemProposta.id);

    if (erroUpdate) {
      resultado.erros++;
    } else {
      resultado.atualizados++;
    }
  }

  return resultado;
}

// Exportar tipos também
export type {
  Proposta,
  PropostaItem,
  PropostaCompleta,
  PropostaFormData,
  PropostaItemInput,
};
