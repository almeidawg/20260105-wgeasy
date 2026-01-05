// ============================================================
// API: Pricelist (Catálogo de Produtos e Serviços)
// Sistema WG Easy - Grupo WG Almeida
// ============================================================

import { supabase } from "@/lib/supabaseClient";
import type {
  PricelistCategoria,
  PricelistCategoriaFormData,
  PricelistItem,
  PricelistItemCompleto,
  PricelistItemFormData,
  PricelistFiltros,
  PricelistEstatisticas,
  TipoPricelist,
  PricelistSubcategoria,
  PricelistSubcategoriaFormData,
} from "@/types/pricelist";

function normalizarNumero(valor: unknown): number | null {
  if (typeof valor === "number" && !Number.isNaN(valor)) {
    return valor;
  }

  if (typeof valor === "string") {
    const trimmed = valor.trim();
    if (!trimmed) return null;

    const direto = Number(trimmed);
    if (!Number.isNaN(direto)) {
      return direto;
    }

    const sanitizado = Number(
      trimmed.replace(/\s/g, "").replace(/\./g, "").replace(",", ".")
    );
    if (!Number.isNaN(sanitizado)) {
      return sanitizado;
    }
  }

  return null;
}

function normalizarTexto(valor: unknown): string | null {
  if (valor === null || valor === undefined) return null;
  const texto = String(valor).trim();
  return texto.length > 0 ? texto : null;
}

function normalizarNucleoNome(nucleo: any): string | undefined {
  // Se for objeto do join, extrair nome
  if (nucleo && typeof nucleo === "object" && nucleo.nome) {
    return nucleo.nome.toLowerCase();
  }
  // Se for string direta (legado), usar como está
  if (typeof nucleo === "string") {
    return nucleo.toLowerCase();
  }
  return undefined;
}

function normalizarItemPricelist(raw: any): PricelistItemCompleto {
  const nomeNormalizado =
    normalizarTexto(raw.nome) ||
    normalizarTexto(raw.descricao) ||
    normalizarTexto(raw.titulo) ||
    normalizarTexto(raw.codigo) ||
    "Item sem nome";

  const descricaoNormalizada =
    normalizarTexto(raw.descricao) || normalizarTexto(raw.nome) || null;

  const unidadeNormalizada =
    normalizarTexto(raw.unidade) ||
    normalizarTexto(raw.unidade_medida) ||
    normalizarTexto(raw.unidade_padrao) ||
    normalizarTexto(raw.unit) ||
    "-";

  const precoNormalizado =
    normalizarNumero(raw.preco) ??
    normalizarNumero(raw.preco_base) ??
    normalizarNumero(raw.valor_unitario) ??
    normalizarNumero(raw.preco_unitario) ??
    normalizarNumero(raw.preco_custo) ??
    0;

  // NOVO: Normalizar núcleo para string
  const nucleoNormalizado = normalizarNucleoNome(raw.nucleo);

  return {
    ...raw,
    nome: nomeNormalizado,
    descricao: descricaoNormalizada,
    unidade: unidadeNormalizada,
    preco: precoNormalizado,
    nucleo: nucleoNormalizado, // Agora é string (ex: "arquitetura", "engenharia")
  } as PricelistItemCompleto;
}

// Re-exportar tipos para compatibilidade com imports existentes
export type {
  PricelistCategoria,
  PricelistCategoriaFormData,
  PricelistItem,
  PricelistItemCompleto,
  PricelistItemFormData,
  PricelistFiltros,
  PricelistEstatisticas,
  TipoPricelist,
  PricelistSubcategoria,
  PricelistSubcategoriaFormData,
};

// ============================================================
// CATEGORIAS
// ============================================================

/**
 * Listar todas as categorias
 */
export async function listarCategorias(): Promise<PricelistCategoria[]> {
  const { data, error } = await supabase
    .from("pricelist_categorias")
    .select("*")
    .order("nome", { ascending: true });

  if (error) throw error;
  return data as any;
}

/**
 * Listar categorias por tipo
 */
export async function listarCategoriasPorTipo(
  tipo: TipoPricelist
): Promise<PricelistCategoria[]> {
  const { data, error } = await supabase
    .from("pricelist_categorias")
    .select("*")
    .eq("tipo", tipo)
    .eq("ativo", true)
    .order("ordem", { ascending: true });

  if (error) throw error;
  return data as any;
}

/**
 * Buscar categoria por ID
 */
export async function buscarCategoria(
  id: string
): Promise<PricelistCategoria> {
  const { data, error } = await supabase
    .from("pricelist_categorias")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as any;
}

/**
 * Criar categoria
 */
export async function criarCategoria(
  payload: PricelistCategoriaFormData
): Promise<PricelistCategoria> {
  const { data, error } = await supabase
    .from("pricelist_categorias")
    .insert({
      ...payload,
      ordem: payload.ordem ?? 0,
      ativo: payload.ativo ?? true,
    })
    .select()
    .single();

  if (error) throw error;
  return data as any;
}

/**
 * Atualizar categoria
 */
export async function atualizarCategoria(
  id: string,
  payload: Partial<PricelistCategoriaFormData>
): Promise<PricelistCategoria> {
  const { data, error } = await supabase
    .from("pricelist_categorias")
    .update({
      ...payload,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as any;
}

/**
 * Deletar categoria
 */
export async function deletarCategoria(id: string): Promise<void> {
  const { error } = await supabase
    .from("pricelist_categorias")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

/**
 * Reordenar categorias
 */
export async function reordenarCategorias(
  categorias: { id: string; ordem: number }[]
): Promise<void> {
  for (const cat of categorias) {
    await supabase
      .from("pricelist_categorias")
      .update({ ordem: cat.ordem })
      .eq("id", cat.id);
  }
}

// ============================================================
// ITENS
// ============================================================

/**
 * Listar todos os itens
 */
export async function listarItens(): Promise<PricelistItemCompleto[]> {
  const { data, error } = await supabase
    .from("pricelist_itens")
    .select(
      `
      *,
      categoria:pricelist_categorias!categoria_id (
        id,
        nome,
        tipo
      ),
      subcategoria:pricelist_subcategorias!subcategoria_id (
        id,
        nome,
        tipo,
        ordem
      ),
      fornecedor:pessoas!fornecedor_id (
        id,
        nome,
        telefone,
        email
      ),
      nucleo:nucleos!nucleo_id (
        id,
        nome,
        cor
      )
    `
    )
    .order("codigo", { ascending: true, nullsFirst: false });

  if (error) throw error;
  return (data as any)?.map(normalizarItemPricelist) ?? [];
}

/**
 * Listar itens com filtros
 */
export async function listarItensComFiltros(
  filtros: PricelistFiltros
): Promise<PricelistItemCompleto[]> {
  let query = supabase.from("pricelist_itens").select(
    `
      *,
      categoria:pricelist_categorias!categoria_id (
        id,
        nome,
        tipo
      ),
      subcategoria:pricelist_subcategorias!subcategoria_id (
        id,
        nome,
        tipo,
        ordem
      ),
      fornecedor:pessoas!fornecedor_id (
        id,
        nome,
        telefone,
        email
      ),
      nucleo:nucleos!nucleo_id (
        id,
        nome,
        cor
      )
    `
  );

  if (filtros.tipo) {
    query = query.eq("tipo", filtros.tipo);
  }

  if (filtros.categoria_id) {
    query = query.eq("categoria_id", filtros.categoria_id);
  }

  if (filtros.subcategoria_id) {
    query = query.eq("subcategoria_id", filtros.subcategoria_id);
  }

  // Filtro por núcleo
  if (filtros.nucleo_id) {
    query = query.eq("nucleo_id", filtros.nucleo_id);
  }

  if (filtros.fornecedor_id) {
    query = query.eq("fornecedor_id", filtros.fornecedor_id);
  }

  if (filtros.apenas_ativos) {
    query = query.eq("ativo", true);
  }

  if (filtros.busca) {
    query = query.or(
      `codigo.ilike.%${filtros.busca}%,nome.ilike.%${filtros.busca}%,descricao.ilike.%${filtros.busca}%`
    );
  }

  if (filtros.preco_min !== undefined) {
    query = query.gte("preco", filtros.preco_min);
  }

  if (filtros.preco_max !== undefined) {
    query = query.lte("preco", filtros.preco_max);
  }

  if (filtros.estoque_baixo) {
    query = query.eq("controla_estoque", true);
  }

  query = query.order("nome", { ascending: true });

  // Limitar resultados para performance (padrão 50)
  const limite = filtros.limite || 50;
  query = query.limit(limite);

  const { data, error } = await query;

  if (error) throw error;

  let itens = data as any;

  // Filtrar estoque baixo em memória (condição complexa)
  if (filtros.estoque_baixo) {
    itens = itens.filter(
      (item: any) =>
        item.estoque_atual !== null &&
        item.estoque_minimo !== null &&
        item.estoque_atual < item.estoque_minimo
    );
  }

  return itens.map(normalizarItemPricelist);
}

/**
 * Buscar item por ID
 */
export async function buscarItem(id: string): Promise<PricelistItemCompleto> {
  const { data, error } = await supabase
    .from("pricelist_itens")
    .select(
      `
      *,
      categoria:pricelist_categorias!categoria_id (
        id,
        nome,
        tipo
      ),
      subcategoria:pricelist_subcategorias!subcategoria_id (
        id,
        nome,
        tipo,
        ordem
      ),
      fornecedor:pessoas!fornecedor_id (
        id,
        nome,
        telefone,
        email
      ),
      nucleo:nucleos!nucleo_id (
        id,
        nome,
        cor
      )
    `
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return normalizarItemPricelist(data);
}

/**
 * Buscar item por código
 */
export async function buscarItemPorCodigo(
  codigo: string
): Promise<PricelistItemCompleto | null> {
  const { data, error } = await supabase
    .from("pricelist_itens")
    .select(
      `
      *,
      categoria:pricelist_categorias!categoria_id (
        id,
        nome,
        tipo
      ),
      subcategoria:pricelist_subcategorias!subcategoria_id (
        id,
        nome,
        tipo,
        ordem
      ),
      fornecedor:pessoas!fornecedor_id (
        id,
        nome,
        telefone,
        email
      ),
      nucleo:nucleos!nucleo_id (
        id,
        nome,
        cor
      )
    `
    )
    .eq("codigo", codigo)
    .single();

  if (error && error.code !== "PGRST116") throw error; // PGRST116 = not found
  return data ? normalizarItemPricelist(data) : null;
}

/**
 * Criar item
 */
export async function criarItem(
  payload: PricelistItemFormData
): Promise<PricelistItem> {
  const { data, error } = await supabase
    .from("pricelist_itens")
    .insert({
      ...payload,
      subcategoria_id: payload.subcategoria_id ?? null,
      ativo: payload.ativo ?? true,
      controla_estoque: payload.controla_estoque ?? false,
    })
    .select()
    .single();

  if (error) throw error;
  return data as any;
}

/**
 * Atualizar item
 */
export async function atualizarItem(
  id: string,
  payload: Partial<PricelistItemFormData>
): Promise<PricelistItem> {
  const { data, error } = await supabase
    .from("pricelist_itens")
    .update({
      ...payload,
      subcategoria_id: payload.subcategoria_id ?? null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as any;
}

/**
 * Deletar item
 */
export async function deletarItem(id: string): Promise<void> {
  const { error } = await supabase
    .from("pricelist_itens")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

/**
 * Atualizar estoque
 */
export async function atualizarEstoque(
  id: string,
  quantidade: number,
  operacao: "adicionar" | "remover" | "definir"
): Promise<PricelistItem> {
  const { data: itemAtual } = await supabase
    .from("pricelist_itens")
    .select("estoque_atual")
    .eq("id", id)
    .single();

  let novoEstoque: number;

  if (operacao === "definir") {
    novoEstoque = quantidade;
  } else if (operacao === "adicionar") {
    novoEstoque = (itemAtual?.estoque_atual || 0) + quantidade;
  } else {
    // remover
    novoEstoque = (itemAtual?.estoque_atual || 0) - quantidade;
  }

  // Não permitir estoque negativo
  if (novoEstoque < 0) {
    novoEstoque = 0;
  }

  const { data, error } = await supabase
    .from("pricelist_itens")
    .update({ estoque_atual: novoEstoque })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as any;
}

/**
 * Listar itens com estoque baixo
 */
export async function listarItensEstoqueBaixo(): Promise<
  PricelistItemCompleto[]
> {
  const { data, error } = await supabase
    .from("pricelist_itens")
    .select(
      `
      *,
      categoria:pricelist_categorias!categoria_id (
        id,
        nome,
        tipo
      ),
      subcategoria:pricelist_subcategorias!subcategoria_id (
        id,
        nome,
        tipo,
        ordem
      ),
      fornecedor:pessoas!fornecedor_id (
        id,
        nome,
        telefone,
        email
      ),
      nucleo:nucleos!nucleo_id (
        id,
        nome,
        cor
      )
    `
    )
    .eq("controla_estoque", true)
    .eq("ativo", true);

  if (error) throw error;

  // Filtrar em memória itens com estoque abaixo do mínimo
  const itens = (data as any).filter(
    (item: any) =>
      item.estoque_atual !== null &&
      item.estoque_minimo !== null &&
      item.estoque_atual < item.estoque_minimo
  );

  return itens.map(normalizarItemPricelist);
}


// ============================================================
// SUBCATEGORIAS
// ============================================================

export async function listarSubcategorias(): Promise<PricelistSubcategoria[]> {
  const { data, error } = await supabase
    .from("pricelist_subcategorias")
    .select("*")
    .order("ordem", { ascending: true });
  if (error) throw error;
  return data as PricelistSubcategoria[];
}

export async function listarSubcategoriasPorCategoria(categoriaId: string): Promise<PricelistSubcategoria[]> {
  const { data, error } = await supabase
    .from("pricelist_subcategorias")
    .select("*")
    .eq("categoria_id", categoriaId)
    .order("ordem", { ascending: true });
  if (error) throw error;
  return data as PricelistSubcategoria[];
}

export async function criarSubcategoria(payload: PricelistSubcategoriaFormData): Promise<PricelistSubcategoria> {
  const { data, error } = await supabase
    .from("pricelist_subcategorias")
    .insert({
      ...payload,
      ordem: payload.ordem ?? 0,
      ativo: payload.ativo ?? true,
    })
    .select()
    .single();
  if (error) throw error;
  return data as PricelistSubcategoria;
}

export async function atualizarSubcategoria(id: string, payload: Partial<PricelistSubcategoriaFormData>): Promise<PricelistSubcategoria> {
  const { data, error } = await supabase
    .from("pricelist_subcategorias")
    .update({
      ...payload,
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as PricelistSubcategoria;
}

export async function deletarSubcategoria(id: string): Promise<void> {
  const { error } = await supabase
    .from("pricelist_subcategorias")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ============================================================
// ESTATÍSTICAS
// ============================================================

/**
 * Obter estatísticas do pricelist
 */
export async function obterEstatisticasPricelist(): Promise<PricelistEstatisticas> {
  const { data: itens, error: itensError } = await supabase
    .from("pricelist_itens")
    .select("tipo, preco, categoria_id, controla_estoque, estoque_atual, estoque_minimo");

  if (itensError) throw itensError;

  const { data: categorias, error: categoriasError } = await supabase
    .from("pricelist_categorias")
    .select("id");

  if (categoriasError) throw categoriasError;

  const itensMaoObra = itens.filter((i: any) => i.tipo === "mao_obra");
  const itensMateriais = itens.filter((i: any) => i.tipo === "material");

  const itensEstoqueBaixo = itens.filter(
    (i: any) =>
      i.controla_estoque &&
      i.estoque_atual !== null &&
      i.estoque_minimo !== null &&
      i.estoque_atual < i.estoque_minimo
  );

  const somaPrecosMaoObra = itensMaoObra.reduce(
    (acc: number, item: any) => acc + (item.preco || 0),
    0
  );

  const somaPrecosMateriais = itensMateriais.reduce(
    (acc: number, item: any) => acc + (item.preco || 0),
    0
  );

  const stats: PricelistEstatisticas = {
    total_itens: itens.length,
    total_mao_obra: itensMaoObra.length,
    total_materiais: itensMateriais.length,
    total_categorias: categorias.length,
    itens_estoque_baixo: itensEstoqueBaixo.length,
    valor_medio_mao_obra:
      itensMaoObra.length > 0 ? somaPrecosMaoObra / itensMaoObra.length : 0,
    valor_medio_material:
      itensMateriais.length > 0 ? somaPrecosMateriais / itensMateriais.length : 0,
  };

  return stats;
}

/**
 * Gerar código automático para novo item
 */
export async function gerarCodigoItem(
  tipo: TipoPricelist,
  categoriaCodigo?: string | null
): Promise<string> {
  const prefixoBase = categoriaCodigo?.trim()
    ? categoriaCodigo.trim().toUpperCase()
    : (() => {
        if (tipo === "mao_obra") return "MO";
        if (tipo === "servico") return "SRV";
        if (tipo === "produto") return "PRD";
        return "MAT";
      })();

  const likePrefix = `${prefixoBase}-%`;

  const { data, error } = await supabase
    .from("pricelist_itens")
    .select("codigo")
    .ilike("codigo", likePrefix)
    .order("codigo", { ascending: false })
    .limit(1);

  if (error) throw error;

  let proximoNumero = 1;
  let padLength = 3; // padrao mais curto para codigos compactos

  if (data && data.length > 0 && data[0].codigo) {
    const ultimoCodigo = data[0].codigo;
    const numeroMatch = ultimoCodigo.match(/(\d+)(?!.*\d)/);
    if (numeroMatch) {
      proximoNumero = parseInt(numeroMatch[1], 10) + 1;
      padLength = numeroMatch[1].length || padLength;
    }
  }

  return `${prefixoBase}-${proximoNumero.toString().padStart(padLength, "0")}`;
}

/**
 * Importar itens em lote
 */
export async function importarItens(
  itens: PricelistItemFormData[]
): Promise<{ sucesso: number; erros: number }> {
  let sucesso = 0;
  let erros = 0;

  for (const item of itens) {
    try {
      // Gerar código automaticamente se não fornecido
      if (!item.codigo) {
        item.codigo = await gerarCodigoItem(item.tipo);
      }

      // Validar nome obrigatório
      if (!item.nome || item.nome.trim() === "") {
        console.error("Item sem nome não pode ser importado");
        erros++;
        continue;
      }

      await criarItem(item);
      sucesso++;
    } catch (error) {
      console.error("Erro ao importar item:", error);
      erros++;
    }
  }

  return { sucesso, erros };
}

/**
 * Duplicar item
 */
export async function duplicarItem(id: string): Promise<PricelistItem> {
  const itemOriginal = await buscarItem(id);

  // Gerar novo código
  const novoCodigo = itemOriginal.codigo
    ? `${itemOriginal.codigo}-COPIA`
    : undefined;

  const novoItem = await criarItem({
    categoria_id: itemOriginal.categoria_id || undefined,
    codigo: novoCodigo,
    nome: `${itemOriginal.nome} (Cópia)`,
    descricao: itemOriginal.descricao || undefined,
    tipo: itemOriginal.tipo,
    unidade: itemOriginal.unidade,
    preco: itemOriginal.preco,
    fornecedor_id: itemOriginal.fornecedor_id || undefined,
    marca: itemOriginal.marca || undefined,
    especificacoes: itemOriginal.especificacoes || undefined,
    imagem_url: itemOriginal.imagem_url || undefined,
    controla_estoque: itemOriginal.controla_estoque,
    estoque_minimo: itemOriginal.estoque_minimo || undefined,
    estoque_atual: 0, // Resetar estoque na cópia
    ativo: true,
  });

  return novoItem;
}
