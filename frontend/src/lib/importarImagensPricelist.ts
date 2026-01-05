// ============================================================
// IMPORTADOR DE IMAGENS PARA PRICELIST
// Sistema WG Easy - Busca automática de imagens para produtos
// ============================================================

import { supabase, supabaseUrl } from "./supabaseClient";

export interface ProdutoSemImagem {
  id: string;
  nome: string;
  codigo?: string;
  fabricante?: string;
  categoria_nome?: string;
  link_produto?: string;
}

export interface ResultadoBuscaImagem {
  id: string;
  nome: string;
  imagem_url: string | null;
  fonte: string | null;
  sucesso: boolean;
  erro?: string;
}

// URL da Edge Function
const EDGE_FUNCTION_URL = `${supabaseUrl}/functions/v1/buscar-produto-ia`;

/**
 * Busca produtos da pricelist que não possuem imagem
 */
export async function buscarProdutosSemImagem(
  limite: number = 100,
  offset: number = 0,
  filtroCategoria?: string
): Promise<{ produtos: ProdutoSemImagem[]; total: number }> {
  let query = supabase
    .from("pricelist_itens")
    .select(`
      id,
      nome,
      codigo,
      fabricante,
      link_produto,
      pricelist_categorias!pricelist_itens_categoria_id_fkey(nome)
    `, { count: 'exact' })
    .or("imagem_url.is.null,imagem_url.eq.")
    .eq("ativo", true)
    .order("nome");

  if (filtroCategoria) {
    query = query.eq("categoria_id", filtroCategoria);
  }

  const { data, error, count } = await query.range(offset, offset + limite - 1);

  if (error) {
    console.error("Erro ao buscar produtos sem imagem:", error);
    throw new Error("Erro ao buscar produtos sem imagem");
  }

  const produtos = (data || []).map((item: any) => ({
    id: item.id,
    nome: item.nome,
    codigo: item.codigo,
    fabricante: item.fabricante,
    link_produto: item.link_produto,
    categoria_nome: item.pricelist_categorias?.nome,
  }));

  return { produtos, total: count || 0 };
}

/**
 * Busca imagem para um produto específico
 * Prioridade: 1. Link do produto, 2. Busca na Leroy Merlin, 3. IA
 */
export async function buscarImagemProduto(
  produto: ProdutoSemImagem
): Promise<ResultadoBuscaImagem> {
  try {
    // Obter token de autenticação
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    // 1. Primeiro tentar extrair imagem do link do produto, se existir
    if (produto.link_produto) {
      console.log(`[BuscarImagem] Tentando extrair de URL: ${produto.link_produto}`);
      const imagemUrl = await extrairImagemDePaginaProduto(produto.link_produto);
      if (imagemUrl) {
        return {
          id: produto.id,
          nome: produto.nome,
          imagem_url: imagemUrl,
          fonte: "link_produto",
          sucesso: true,
        };
      }
    }

    // 2. Buscar na Leroy Merlin usando o nome do produto
    console.log(`[BuscarImagem] Buscando na Leroy Merlin: ${produto.nome}`);
    const imagemLeroy = await buscarImagemNaLeroyMerlin(produto.nome, produto.fabricante);
    if (imagemLeroy) {
      return {
        id: produto.id,
        nome: produto.nome,
        imagem_url: imagemLeroy,
        fonte: "leroy_merlin",
        sucesso: true,
      };
    }

    // 3. Fallback: buscar imagem via IA (Edge Function)
    if (token) {
      console.log(`[BuscarImagem] Tentando via IA para: ${produto.nome}`);
      const termoBusca = JSON.stringify({
        nome: produto.nome,
        fabricante: produto.fabricante,
        url_referencia: produto.link_produto,
      });

      const response = await fetch(EDGE_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          termoBusca,
          tipo: "buscar_imagem",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.imagem_url) {
          return {
            id: produto.id,
            nome: produto.nome,
            imagem_url: data.imagem_url,
            fonte: data.fonte || "ia",
            sucesso: true,
          };
        }
      }
    }

    // Nenhuma imagem encontrada
    return {
      id: produto.id,
      nome: produto.nome,
      imagem_url: null,
      fonte: null,
      sucesso: false,
    };
  } catch (error: any) {
    console.error(`Erro ao buscar imagem para ${produto.nome}:`, error);
    return {
      id: produto.id,
      nome: produto.nome,
      imagem_url: null,
      fonte: null,
      sucesso: false,
      erro: error.message,
    };
  }
}

/**
 * Busca imagem na Leroy Merlin pelo nome do produto
 */
async function buscarImagemNaLeroyMerlin(
  nomeProduto: string,
  fabricante?: string
): Promise<string | null> {
  try {
    // Construir termo de busca
    let termoBusca = nomeProduto;
    if (fabricante && !nomeProduto.toLowerCase().includes(fabricante.toLowerCase())) {
      termoBusca = `${nomeProduto} ${fabricante}`;
    }

    // Limpar termo mas manter caracteres especiais relevantes (como ")
    termoBusca = termoBusca.trim();

    // URL correta da Leroy Merlin (formato /search?term=)
    const termoEncoded = encodeURIComponent(termoBusca);
    const urlBusca = `https://www.leroymerlin.com.br/search?term=${termoEncoded}&searchTerm=${termoEncoded}&searchType=default`;
    console.log(`[BuscarImagem] URL de busca Leroy: ${urlBusca}`);

    // Tentar múltiplos proxies CORS
    const proxies = [
      `https://api.allorigins.win/raw?url=${encodeURIComponent(urlBusca)}`,
      `https://corsproxy.io/?${encodeURIComponent(urlBusca)}`,
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(urlBusca)}`,
    ];

    for (const proxyUrl of proxies) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const response = await fetch(proxyUrl, {
          signal: controller.signal,
          headers: {
            Accept: "text/html,application/xhtml+xml",
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) continue;

        const html = await response.text();
        const imagemUrl = extrairImagemDoResultadoLeroy(html);

        if (imagemUrl) {
          console.log(`[BuscarImagem] Imagem encontrada via proxy: ${imagemUrl}`);
          return imagemUrl;
        }
      } catch (e) {
        console.log(`[BuscarImagem] Proxy falhou, tentando próximo...`);
        continue;
      }
    }

    return null;
  } catch (error) {
    console.error("[BuscarImagem] Erro na busca Leroy Merlin:", error);
    return null;
  }
}

/**
 * Extrai URL da imagem do HTML de resultados da Leroy Merlin
 * IMPORTANTE: Filtra apenas imagens de produtos (pasta /products/)
 */
function extrairImagemDoResultadoLeroy(html: string): string | null {
  // Padrões para IGNORAR (não são imagens de produtos)
  const ignorarPatterns = [
    /\/assets\//i,
    /\/footer\//i,
    /\/icons?\//i,
    /\/logos?\//i,
    /\/banners?\//i,
    /\/header\//i,
    /sustentabilidade/i,
    /selo[_-]/i,
    /badge/i,
    /sprite/i,
    /placeholder/i,
  ];

  const isImagemValida = (url: string): boolean => {
    // Deve conter /products/ no caminho
    if (!url.includes("/products/")) return false;
    // Não deve conter padrões de não-produto
    for (const pattern of ignorarPatterns) {
      if (pattern.test(url)) return false;
    }
    return true;
  };

  // Método 1: Buscar imagens APENAS da pasta /products/ do CDN
  const productPattern = /https:\/\/cdn\.leroymerlin\.com\.br\/products\/[^"'\s]+\.(?:jpg|jpeg|png|webp)/gi;
  const matches = html.match(productPattern);

  if (matches && matches.length > 0) {
    // Filtrar apenas imagens válidas de produtos
    const imagensValidas = matches.filter(isImagemValida);

    if (imagensValidas.length > 0) {
      // Priorizar imagens 600x600
      const imagem600 = imagensValidas.find(url => url.includes("600x600"));
      if (imagem600) {
        // Garantir que termina com .jpg
        return imagem600.includes(".jpg") || imagem600.includes(".jpeg") || imagem600.includes(".png") || imagem600.includes(".webp")
          ? imagem600
          : imagem600 + ".jpg";
      }

      // Se não encontrar 600x600, pegar a primeira e converter
      let primeiraImagem = imagensValidas[0];
      // Tentar converter para versão 600x600
      primeiraImagem = primeiraImagem.replace(/_\d+x\d+/, "_600x600");
      // Garantir extensão
      if (!primeiraImagem.match(/\.(jpg|jpeg|png|webp)$/i)) {
        primeiraImagem = primeiraImagem + ".jpg";
      }
      return primeiraImagem;
    }
  }

  // Método 2: Buscar via og:image (geralmente tem imagem do produto)
  const ogImage = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"/i);
  if (ogImage && ogImage[1] && ogImage[1].includes("/products/")) {
    return ogImage[1];
  }

  // Método 3: Buscar via JSON-LD (Schema.org Product)
  const jsonLdMatch = html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
  if (jsonLdMatch) {
    for (const match of jsonLdMatch) {
      try {
        const jsonContent = match.replace(/<[^>]*>/g, "");
        const data = JSON.parse(jsonContent);
        // Procurar por Product ou ItemList
        const product = data["@type"] === "Product" ? data :
          (Array.isArray(data["@graph"]) ? data["@graph"].find((item: any) => item["@type"] === "Product") : null);

        if (product?.image) {
          const img = Array.isArray(product.image) ? product.image[0] : product.image;
          const imgUrl = typeof img === "string" ? img : img?.url;
          if (imgUrl && imgUrl.includes("/products/")) return imgUrl;
        }
      } catch {
        continue;
      }
    }
  }

  // Método 4: Buscar imagem de produto em tags img
  const imgMatches = html.match(/<img[^>]*src="(https:\/\/cdn\.leroymerlin\.com\.br\/products\/[^"]+)"/gi);
  if (imgMatches) {
    for (const imgTag of imgMatches) {
      const srcMatch = imgTag.match(/src="([^"]+)"/);
      if (srcMatch && srcMatch[1] && isImagemValida(srcMatch[1])) {
        let url = srcMatch[1];
        // Converter para 600x600
        url = url.replace(/_\d+x\d+/, "_600x600");
        return url;
      }
    }
  }

  return null;
}

/**
 * Extrai imagem diretamente de uma página de produto
 */
async function extrairImagemDePaginaProduto(url: string): Promise<string | null> {
  try {
    const proxies = [
      `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
      `https://corsproxy.io/?${encodeURIComponent(url)}`,
    ];

    for (const proxyUrl of proxies) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const response = await fetch(proxyUrl, {
          signal: controller.signal,
          headers: {
            Accept: "text/html,application/xhtml+xml",
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) continue;

        const html = await response.text();

        // Buscar via JSON-LD (mais confiável)
        const jsonLdRegex = /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
        let jsonLdMatch;
        while ((jsonLdMatch = jsonLdRegex.exec(html)) !== null) {
          try {
            const jsonData = JSON.parse(jsonLdMatch[1]);
            const product = Array.isArray(jsonData)
              ? jsonData.find((item) => item["@type"] === "Product")
              : jsonData["@type"] === "Product"
              ? jsonData
              : null;

            if (product?.image) {
              const img = Array.isArray(product.image) ? product.image[0] : product.image;
              if (typeof img === "string") return img;
            }
          } catch {
            continue;
          }
        }

        // Buscar via og:image
        const ogImage = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"/i);
        if (ogImage && ogImage[1]) {
          return ogImage[1];
        }

        // Buscar imagem CDN Leroy
        if (url.includes("leroymerlin")) {
          const imagemLeroy = extrairImagemDoResultadoLeroy(html);
          if (imagemLeroy) return imagemLeroy;
        }

        return null;
      } catch {
        continue;
      }
    }

    return null;
  } catch (error) {
    console.error("[BuscarImagem] Erro ao extrair imagem da página:", error);
    return null;
  }
}


/**
 * Atualiza a imagem de um produto no banco de dados
 */
export async function atualizarImagemProduto(
  produtoId: string,
  imagemUrl: string
): Promise<boolean> {
  const { error } = await supabase
    .from("pricelist_itens")
    .update({ imagem_url: imagemUrl, updated_at: new Date().toISOString() })
    .eq("id", produtoId);

  if (error) {
    console.error("Erro ao atualizar imagem:", error);
    return false;
  }

  return true;
}

/**
 * Busca imagens para múltiplos produtos em lote
 * Retorna um AsyncGenerator para processar progressivamente
 */
export async function* buscarImagensEmLote(
  produtos: ProdutoSemImagem[],
  delayMs: number = 1000
): AsyncGenerator<ResultadoBuscaImagem & { progresso: number }> {
  for (let i = 0; i < produtos.length; i++) {
    const produto = produtos[i];
    const resultado = await buscarImagemProduto(produto);

    // Se encontrou imagem, atualiza no banco
    if (resultado.sucesso && resultado.imagem_url) {
      await atualizarImagemProduto(produto.id, resultado.imagem_url);
    }

    yield {
      ...resultado,
      progresso: Math.round(((i + 1) / produtos.length) * 100),
    };

    // Delay entre requisições para não sobrecarregar
    if (i < produtos.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

/**
 * Busca imagem na internet via Google Images (usando IA)
 */
export async function buscarImagemNaInternet(
  termoBusca: string
): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (!token) {
      throw new Error("Usuário não autenticado");
    }

    // Usar buscar_imagem com termo simples
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        termoBusca: JSON.stringify({ nome: termoBusca }),
        tipo: "buscar_imagem",
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.imagem_url || null;
  } catch {
    return null;
  }
}

/**
 * Valida se uma URL de imagem é válida e acessível
 */
export async function validarUrlImagem(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: "HEAD" });
    const contentType = response.headers.get("content-type") || "";
    return response.ok && contentType.startsWith("image/");
  } catch {
    return false;
  }
}

/**
 * Busca imagem do produto na Leroy Merlin
 */
export async function buscarImagemLeroy(
  nomeProduto: string
): Promise<string | null> {
  try {
    // Construir URL de busca na Leroy Merlin (formato correto /search?term=)
    const termoBusca = encodeURIComponent(nomeProduto);
    const url = `https://www.leroymerlin.com.br/search?term=${termoBusca}&searchTerm=${termoBusca}&searchType=default`;

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (!token) return null;

    // Usar Edge Function para extrair imagem da página de busca
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        termoBusca: url,
        tipo: "extrair_imagem_url",
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.imagem_url || null;
  } catch {
    return null;
  }
}
