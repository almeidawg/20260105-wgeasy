// ============================================================
// PÁGINA: Pricelist (Catálogo de Itens)
// Sistema WG Easy - Grupo WG Almeida
// ============================================================

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  listarCategorias,
  listarSubcategorias,
  listarItens,
  atualizarItem,
  type PricelistCategoria,
  type PricelistItemCompleto,
  type PricelistSubcategoria,
} from "@/lib/pricelistApi";
import { sincronizarItensComPricelist } from "@/lib/propostasApi";
import { listarNucleos, type Nucleo } from "@/lib/nucleosApi";
import {
  getStatusEstoque,
  getTipoItemLabel,
  type TipoPricelist,
} from "@/types/pricelist";
import { downloadPricelistTemplate } from "@/lib/templates/pricelistTemplate";

export default function PricelistPage() {
  const [categorias, setCategorias] = useState<PricelistCategoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<PricelistSubcategoria[]>([]);
  const [itens, setItens] = useState<PricelistItemCompleto[]>([]);
  const [nucleos, setNucleos] = useState<Nucleo[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string | null>(
    null
  );
  const [subcategoriaSelecionada, setSubcategoriaSelecionada] =
    useState<string | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroNucleo, setFiltroNucleo] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [precosEmEdicao, setPrecosEmEdicao] = useState<Record<string, string>>(
    {}
  );
  const [salvandoInline, setSalvandoInline] = useState<Record<string, boolean>>(
    {}
  );
  const [sincronizando, setSincronizando] = useState(false);
  const navigate = useNavigate();

  // Sincronizar itens do pricelist com propostas existentes
  async function handleSincronizarPropostas() {
    if (!confirm("Deseja sincronizar todos os itens das propostas com os dados atuais do pricelist?\n\nIsso atualizará categoria, núcleo e tipo de todos os itens vinculados.")) {
      return;
    }

    setSincronizando(true);
    try {
      const resultado = await sincronizarItensComPricelist();
      alert(`Sincronização concluída!\n\n${resultado.detalhes[0] || `${resultado.atualizados} itens atualizados`}${resultado.erros > 0 ? `\n⚠️ ${resultado.erros} erros` : ''}`);
    } catch (error) {
      console.error("Erro ao sincronizar:", error);
      alert("Erro ao sincronizar itens. Verifique o console.");
    } finally {
      setSincronizando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      setLoading(true);
      const [categoriasData, subcategoriasData, itensData, nucleosData] = await Promise.all([
        listarCategorias(),
        listarSubcategorias(),
        listarItens(),
        listarNucleos(),
      ]);
      const ordemNucleos = [
        "Arquitetura",
        "Engenharia",
        "Marcenaria",
        "Materiais",
        "Geral",
        "Produtos",
      ];
      const nucleosFiltrados = nucleosData
        .filter((n) => ordemNucleos.includes(n.nome))
        .sort(
          (a, b) => ordemNucleos.indexOf(a.nome) - ordemNucleos.indexOf(b.nome)
        );

      setCategorias(categoriasData);
      setSubcategorias(subcategoriasData);
      setNucleos(nucleosFiltrados);
      setItens(itensData);
    } catch (error) {
      console.error("Erro ao carregar pricelist:", error);
    } finally {
      setLoading(false);
    }
  }


  const tipoOptions: { value: TipoPricelist; label: string }[] = (
    ["mao_obra", "material", "servico", "produto"] as TipoPricelist[]
  ).map((tipo) => ({
    value: tipo,
    label: getTipoItemLabel(tipo),
  }));


  
  function formatarNucleoLabel(nucleo?: Nucleo | null) {
    if (!nucleo) return "Sem nucleo";
    if (nucleo.nome === "Geral") return "Materiais";
    return nucleo.nome;
  }

  function formatarLabelCategoria(cat: PricelistCategoria) {
    if (!cat) return "-";
    if (cat.codigo) return `${cat.codigo} - ${cat.nome}`;
    return `${String(cat.ordem || 0).padStart(3, "0")} - ${cat.nome}`;
  }

  async function salvarInline(
    itemId: string,
    campo: "categoria" | "subcategoria" | "tipo" | "preco" | "nucleo",
    payload: Partial<
      Pick<
        PricelistItemCompleto,
        "categoria_id" | "subcategoria_id" | "tipo" | "preco" | "nucleo_id"
      >
    >
  ) {
    const itemAnterior = itens.find((i) => i.id === itemId);
    if (!itemAnterior) return;

    setSalvandoInline((prev) => ({ ...prev, [`${itemId}-${campo}`]: true }));

    setItens((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;

        const categoriaAtualizada =
          payload.categoria_id !== undefined
            ? payload.categoria_id
              ? categorias.find((cat) => cat.id === payload.categoria_id) || null
              : null
            : item.categoria;
        const subcategoriaAtualizada =
          payload.subcategoria_id !== undefined
            ? payload.subcategoria_id
              ? subcategorias.find((sub) => sub.id === payload.subcategoria_id) ||
                null
              : null
            : item.subcategoria;

        return {
          ...item,
          ...payload,
          nucleo_id:
            payload.nucleo_id !== undefined ? payload.nucleo_id : item.nucleo_id,
          categoria: categoriaAtualizada || undefined,
          subcategoria: subcategoriaAtualizada || undefined,
        };
      })
    );

    const payloadLimpo: Partial<
      Pick<
        PricelistItemCompleto,
        "categoria_id" | "subcategoria_id" | "tipo" | "preco" | "nucleo_id"
      >
    > =
      {};
    if (payload.categoria_id !== undefined) payloadLimpo.categoria_id = payload.categoria_id;
    if (payload.subcategoria_id !== undefined) payloadLimpo.subcategoria_id = payload.subcategoria_id;
    if (payload.tipo !== undefined) payloadLimpo.tipo = payload.tipo;
    if (payload.preco !== undefined) payloadLimpo.preco = payload.preco;
    if (payload.nucleo_id !== undefined) payloadLimpo.nucleo_id = payload.nucleo_id;

    try {
      await atualizarItem(itemId, payloadLimpo);
    } catch (error) {
      console.error("Erro ao salvar edi‡Æo r pida do item:", error);
      setItens((prev) =>
        prev.map((item) => (item.id === itemId && itemAnterior ? itemAnterior : item))
      );
      alert("NÆo foi poss¡vel salvar a altera‡Æo. Tente novamente.");
    } finally {
      setSalvandoInline((prev) => {
        const novo = { ...prev };
        delete novo[`${itemId}-${campo}`];
        return novo;
      });
    }
  }

  const handleSalvarPreco = async (item: PricelistItemCompleto) => {
    const valorDigitado =
      precosEmEdicao[item.id] !== undefined
        ? precosEmEdicao[item.id]
        : item.preco.toString();

    const valorLimpo = valorDigitado.trim();
    if (!valorLimpo) {
      alert("Digite um valor de pre‡o v lido.");
      setPrecosEmEdicao((prev) => ({ ...prev, [item.id]: item.preco.toString() }));
      return;
    }

    const normalizado = Number(
      valorLimpo.replace(/\s/g, "").replace(/\./g, "").replace(",", ".")
    );

    if (Number.isNaN(normalizado)) {
      alert("Digite um valor de pre‡o v lido.");
      setPrecosEmEdicao((prev) => ({ ...prev, [item.id]: item.preco.toString() }));
      return;
    }

    await salvarInline(item.id, "preco", { preco: normalizado });
    setPrecosEmEdicao((prev) => ({ ...prev, [item.id]: normalizado.toString() }));
  };

  const handleCategoriaChange = async (
    item: PricelistItemCompleto,
    categoriaId: string
  ) => {
    await salvarInline(item.id, "categoria", {
      categoria_id: categoriaId || null,
      subcategoria_id: null,
    });
  };

  const handleSubcategoriaChange = async (
    item: PricelistItemCompleto,
    subcategoriaId: string
  ) => {
    await salvarInline(item.id, "subcategoria", {
      subcategoria_id: subcategoriaId || null,
    });
  };

  const handleTipoChange = async (item: PricelistItemCompleto, tipo: TipoPricelist) => {
    await salvarInline(item.id, "tipo", { tipo });
  };

  const handleNucleoChange = async (item: PricelistItemCompleto, nucleoId: string) => {
    await salvarInline(item.id, "nucleo", {
      nucleo_id: nucleoId || null,
      categoria_id: null,
    });
  };

  // Filtrar itens
  const itensFiltrados = itens.filter((item) => {
    // Filtro por núcleo
    if (filtroNucleo && item.nucleo_id !== filtroNucleo) {
      return false;
    }
    // Filtro por categoria
    if (categoriaSelecionada && item.categoria_id !== categoriaSelecionada) {
      return false;
    }
    // Filtro por subcategoria
    if (subcategoriaSelecionada && item.subcategoria_id !== subcategoriaSelecionada) {
      return false;
    }

    // Filtro por tipo
    if (filtroTipo !== "todos" && item.tipo !== filtroTipo) {
      return false;
    }

    // Busca por nome/código
    if (busca) {
      const buscaLower = busca.toLowerCase();
      return (
        item.nome.toLowerCase().includes(buscaLower) ||
        item.codigo?.toLowerCase().includes(buscaLower)
      );
    }

    return true;
  });

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2E2E2E]">Pricelist</h1>
          <p className="text-sm text-gray-600 mt-1">
            Catálogo de itens de mão de obra e materiais
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/pricelist/categorias")}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            Categorias
          </button>
          <button
            type="button"
            onClick={handleSincronizarPropostas}
            disabled={sincronizando}
            className="px-4 py-2 border border-purple-300 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 font-medium flex items-center gap-2 disabled:opacity-50"
            title="Atualiza categoria, núcleo e tipo dos itens em todas as propostas"
          >
            {sincronizando ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            {sincronizando ? "Sincronizando..." : "Sincronizar Propostas"}
          </button>
          <button
            type="button"
            onClick={() => downloadPricelistTemplate()}
            className="px-4 py-2 border border-green-300 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 font-medium flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Baixar Modelo Excel
          </button>
          <button
            type="button"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.xlsx,.xls,.csv,.pdf';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  alert(`Arquivo selecionado: ${file.name}\n\nFuncionalidade de importação será implementada em breve.`);
                }
              };
              input.click();
            }}
            className="px-4 py-2 border border-blue-300 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            Upload Excel/PDF
          </button>
          <button
            type="button"
            onClick={() => navigate("/pricelist/importar-imagens")}
            className="px-4 py-2 border border-orange-300 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 font-medium flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Importar Imagens
          </button>
          <button
            type="button"
            onClick={() => navigate("/pricelist/importar-lote")}
            className="px-4 py-2 border border-blue-300 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            Importar em Lote
          </button>
          <button
            type="button"
            onClick={() => navigate("/pricelist/exportar-importar")}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Exportar Excel
          </button>
          <button
            type="button"
            onClick={() => navigate("/pricelist/novo")}
            className="px-4 py-2 bg-[#F25C26] text-white rounded-lg hover:bg-[#e04a1a] font-medium flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Novo Item
          </button>
        </div>
      </div>

      {/* Busca e Filtros */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
        {/* Busca */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou código..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F25C26] focus:border-transparent"
          />
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Núcleo */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Núcleo:</span>
            <select
              value={filtroNucleo || ""}
              onChange={(e) => {
                setFiltroNucleo(e.target.value || null);
                setCategoriaSelecionada(null);
                setSubcategoriaSelecionada(null);
              }}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F25C26] focus:border-transparent"
            >
              <option value="">Todos</option>
              {nucleos.map((n) => (
                <option key={n.id} value={n.id}>
                  {formatarNucleoLabel(n)}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Tipo:</span>
            <button
              onClick={() => setFiltroTipo("todos")}
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                filtroTipo === "todos"
                  ? "bg-[#F25C26] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltroTipo("mao_obra")}
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                filtroTipo === "mao_obra"
                  ? "bg-[#F25C26] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Mão de Obra
            </button>
            <button
              onClick={() => setFiltroTipo("material")}
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                filtroTipo === "material"
                  ? "bg-[#F25C26] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Materiais
            </button>
            <button
              onClick={() => setFiltroTipo("servico")}
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                filtroTipo === "servico"
                  ? "bg-[#F25C26] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Serviços
            </button>
          </div>

          {/* Categoria */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Categoria:</span>
            <select
              value={categoriaSelecionada || ""}
              onChange={(e) =>
                {
                  setCategoriaSelecionada(e.target.value || null);
                  setSubcategoriaSelecionada(null);
                }
              }
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F25C26] focus:border-transparent"
            >
              <option value="">Todas</option>
              {categorias.map((cat) => {
                const codigoDisplay = cat.ordem !== undefined && cat.codigo
                  ? `${String(cat.ordem).padStart(3, "0")}-${cat.codigo} - `
                  : cat.codigo
                  ? `${cat.codigo} - `
                  : "";
                return (
                  <option key={cat.id} value={cat.id}>
                    {codigoDisplay}{cat.nome}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Subcategoria */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Subcategoria:</span>
            <select
              value={subcategoriaSelecionada || ""}
              onChange={(e) => setSubcategoriaSelecionada(e.target.value || null)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F25C26] focus:border-transparent"
            >
              <option value="">Todas</option>
              {subcategorias
                .filter((sub) =>
                  categoriaSelecionada ? sub.categoria_id === categoriaSelecionada : true
                )
                .map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.nome}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#F25C26]" />
            <p className="text-sm text-gray-600 mt-2">Carregando itens...</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#F5F5F5] border-b border-gray-200">
              <tr>
                <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-16">
                  Imagem
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Fabricante
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Formato
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  M²/Cx
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Núcleo
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Preço
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Estoque
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {itensFiltrados.map((item) => {
                const statusEstoque = getStatusEstoque(item);
                const precoEmEdicao = precosEmEdicao[item.id] ?? item.preco.toString();
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/pricelist/${item.id}`)}
                  >
                    {/* Imagem */}
                    <td className="px-2 py-2 text-center">
                      {item.imagem_url ? (
                        <img
                          src={item.imagem_url}
                          alt={item.nome}
                          className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </td>
                    {/* Código */}
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-gray-600">
                        {item.codigo || "-"}
                      </span>
                    </td>
                    {/* Nome */}
                    <td className="px-4 py-3">
                      <span className="text-gray-900 font-medium">
                        {item.nome}
                      </span>
                      {item.modelo && (
                        <p className="text-xs text-gray-500 mt-0.5">{item.modelo}</p>
                      )}
                    </td>
                    {/* Fabricante */}
                    <td className="px-4 py-3">
                      <span className="text-gray-700 text-sm">
                        {item.fabricante || "-"}
                      </span>
                    </td>
                    {/* Formato */}
                    <td className="px-4 py-3">
                      <span className="text-gray-700 text-sm">
                        {item.formato || "-"}
                      </span>
                    </td>
                    {/* M²/Caixa */}
                    <td className="px-4 py-3 text-right">
                      <span className="text-gray-700 text-sm font-medium">
                        {item.m2_caixa ? `${item.m2_caixa.toFixed(2)}` : "-"}
                      </span>
                    </td>
                    {/* Núcleo */}
                    <td className="px-4 py-3">
                      <div
                        className="flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <select
                          value={item.nucleo_id || ""}
                          onChange={(e) =>
                            handleNucleoChange(item, e.target.value)
                          }
                          disabled={!!salvandoInline[`${item.id}-nucleo`]}
                          className="px-2 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F25C26] focus:border-transparent"
                        >
                          <option value="">Sem núcleo</option>
                          {nucleos.map((n) => (
                            <option key={n.id} value={n.id}>
                              {formatarNucleoLabel(n)}
                            </option>
                          ))}
                        </select>
                        {salvandoInline[`${item.id}-nucleo`] && (
                          <span className="text-xs text-gray-400">Salvando...</span>
                        )}
                      </div>
                    </td>
                    {/* Categoria */}
                    <td className="px-4 py-3">
                      <div
                        className="flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <select
                          value={item.categoria_id || ""}
                          onChange={(e) =>
                            handleCategoriaChange(item, e.target.value)
                          }
                          disabled={!!salvandoInline[`${item.id}-categoria`]}
                          className="px-2 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F25C26] focus:border-transparent"
                        >
                          <option value="">Sem categoria</option>
                          {categorias.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {formatarLabelCategoria(cat)}
                            </option>
                          ))}
                        </select>
                        {salvandoInline[`${item.id}-categoria`] && (
                          <span className="text-xs text-gray-400">Salvando...</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className="flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <select
                          value={item.tipo}
                          onChange={(e) =>
                            handleTipoChange(item, e.target.value as TipoPricelist)
                          }
                          disabled={!!salvandoInline[`${item.id}-tipo`]}
                          className="px-2 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F25C26] focus:border-transparent"
                        >
                          {tipoOptions.map((tipo) => (
                            <option key={tipo.value} value={tipo.value}>
                              {tipo.label}
                            </option>
                          ))}
                        </select>
                        {salvandoInline[`${item.id}-tipo`] && (
                          <span className="text-xs text-gray-400">Salvando...</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div
                        className="flex items-center justify-end gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="text-sm text-gray-600">R$</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={precoEmEdicao}
                          onChange={(e) =>
                            setPrecosEmEdicao((prev) => ({
                              ...prev,
                              [item.id]: e.target.value,
                            }))
                          }
                          onBlur={() => handleSalvarPreco(item)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleSalvarPreco(item);
                            }
                          }}
                          disabled={!!salvandoInline[`${item.id}-preco`]}
                          className="w-28 px-2 py-1 border border-gray-300 rounded-lg text-right text-sm focus:outline-none focus:ring-2 focus:ring-[#F25C26] focus:border-transparent"
                        />
                        <span className="text-xs text-gray-500">
                          / {item.unidade}
                        </span>
                        {salvandoInline[`${item.id}-preco`] && (
                          <span className="text-xs text-gray-400">Salvando...</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${statusEstoque.color}20`,
                          color: statusEstoque.color,
                        }}
                      >
                        {statusEstoque.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/pricelist/editar/${item.id}`);
                        }}
                        className="text-[#F25C26] hover:text-[#e04a1a] font-medium"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                );
              })}

              {itensFiltrados.length === 0 && (
                <tr>
                  <td colSpan={12} className="px-4 py-8 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <svg
                        className="w-12 h-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                      <p className="text-gray-600 font-medium">
                        {busca || filtroTipo !== "todos" || categoriaSelecionada || filtroNucleo
                          ? "Nenhum item encontrado com esses filtros"
                          : "Nenhum item cadastrado"}
                      </p>
                      {!busca && filtroTipo === "todos" && !categoriaSelecionada && !filtroNucleo && (
                        <p className="text-sm text-gray-500">
                          Comece criando um novo item
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Estatísticas */}
      {!loading && itens.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Total de Itens
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {itens.length}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Mão de Obra
            </p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {itens.filter((i) => i.tipo === "mao_obra").length}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Materiais
            </p>
            <p className="text-2xl font-bold text-orange-600 mt-1">
              {itens.filter((i) => i.tipo === "material").length}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Estoque Baixo
            </p>
            <p className="text-2xl font-bold text-red-600 mt-1">
              {
                itens.filter(
                  (i) =>
                    i.controla_estoque &&
                    i.estoque_atual < i.estoque_minimo
                ).length
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
