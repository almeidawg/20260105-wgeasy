// ============================================================
// ListaComprasPage - Página principal da lista de compras
// Sistema WG Easy - Grupo WG Almeida
// ============================================================

import { useState, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Plus,
  ArrowLeft,
  RefreshCw,
  Loader2,
  Package,
  AlertCircle,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

// Hooks
import { useListaCompras } from '../hooks/useListaCompras';
import { usePricelistSearch } from '../hooks/usePricelistSearch';
import { useDashboard } from '../hooks/useDashboard';
import { useComplementares } from '../hooks/useComplementares';

// Componentes
import DashboardFinanceiro from './DashboardFinanceiro';
import FiltrosLista from './FiltrosLista';
import ItemCard from './ItemCard';
import PricelistSearch from './PricelistSearch';
import AddItemModal from './AddItemModal';
import ComplementaresModal from './ComplementaresModal';

// Types e Utils
import type { ProdutoPricelist, TipoCompra, NovoItemListaCompra } from '../types';
import {
  agruparPorAmbiente,
  ordenarComComplementares,
  extrairAmbientes,
  extrairCategorias,
  extrairFornecedores,
  formatCurrency,
} from '../utils/formatters';

export default function ListaComprasPage() {
  const { projetoId } = useParams<{ projetoId: string }>();

  // Estados locais
  const [produtoSelecionado, setProdutoSelecionado] = useState<ProdutoPricelist | null>(null);
  const [modalAddAberto, setModalAddAberto] = useState(false);
  const [modalComplementaresAberto, setModalComplementaresAberto] = useState(false);
  const [dadosItem, setDadosItem] = useState<{
    quantidade: number;
    ambiente: string;
    tipo_compra: TipoCompra;
    observacoes?: string;
  } | null>(null);
  const [secoesFechadas, setSecoesFechadas] = useState<Set<string>>(new Set());

  // Hooks
  const {
    itens,
    loading,
    error,
    filtros,
    setFiltros,
    itensFiltrados,
    adicionarItem,
    adicionarMultiplos,
    atualizarItem,
    removerItem,
    alterarStatus,
    alterarTipoCompra,
    alterarQuantidade,
    carregar,
  } = useListaCompras(projetoId || '');

  const {
    produtos: produtosBusca,
    loading: loadingBusca,
    termo,
    buscar,
    limpar: limparBusca,
  } = usePricelistSearch();

  const { dados: dashboard, loading: loadingDashboard, recarregar: recarregarDashboard } = useDashboard(
    projetoId || ''
  );

  const {
    complementares,
    loading: loadingComplementares,
    calcular: calcularComplementares,
    calcularPorCategoria,
    toggleSelecao,
    getComplementaresSelecionados,
    getTotalSelecionados,
    limpar: limparComplementares,
  } = useComplementares();

  // Dados derivados
  const ambientes = useMemo(() => extrairAmbientes(itens), [itens]);
  const categorias = useMemo(() => extrairCategorias(itens), [itens]);
  const fornecedores = useMemo(() => extrairFornecedores(itens), [itens]);

  const grupos = useMemo(() => {
    const itensOrdenados = ordenarComComplementares(itensFiltrados);
    return agruparPorAmbiente(itensOrdenados);
  }, [itensFiltrados]);

  // Handlers
  const handleSelecionarProduto = useCallback((produto: ProdutoPricelist) => {
    setProdutoSelecionado(produto);
    setModalAddAberto(true);
  }, []);

  const handleConfirmarDados = useCallback(
    async (dados: {
      quantidade: number;
      ambiente: string;
      tipo_compra: TipoCompra;
      observacoes?: string;
    }) => {
      if (!produtoSelecionado) return;

      setDadosItem(dados);
      setModalAddAberto(false);

      // Calcular complementares
      if (produtoSelecionado.id) {
        await calcularComplementares(produtoSelecionado.id, dados.quantidade);
      }

      setModalComplementaresAberto(true);
    },
    [produtoSelecionado, calcularComplementares]
  );

  const handleConfirmarAdicao = useCallback(async () => {
    if (!produtoSelecionado || !dadosItem || !projetoId) return;

    // Criar item principal
    const novoItem: NovoItemListaCompra = {
      projeto_id: projetoId,
      pricelist_item_id: produtoSelecionado.id,
      ambiente: dadosItem.ambiente,
      categoria: '', // Pode ser preenchido depois
      item: produtoSelecionado.nome,
      descricao: produtoSelecionado.descricao,
      imagem_url: produtoSelecionado.imagem_url,
      link_produto: produtoSelecionado.link_produto,
      qtd_compra: dadosItem.quantidade,
      unidade: produtoSelecionado.unidade,
      preco_unit: produtoSelecionado.preco,
      tipo_compra: dadosItem.tipo_compra,
      fornecedor_id: produtoSelecionado.fornecedor_id,
      observacoes: dadosItem.observacoes,
    };

    const itemPrincipal = await adicionarItem(novoItem);

    if (itemPrincipal) {
      // Adicionar complementares selecionados
      const complementaresSelecionados = getComplementaresSelecionados();

      if (complementaresSelecionados.length > 0) {
        const itensComplementares: NovoItemListaCompra[] = complementaresSelecionados.map(
          (comp) => ({
            projeto_id: projetoId,
            ambiente: dadosItem.ambiente,
            item: comp.complemento_descricao,
            qtd_compra: comp.quantidade_necessaria,
            unidade: comp.unidade,
            preco_unit: comp.preco_referencia,
            tipo_compra: dadosItem.tipo_compra,
            is_complementar: true,
            item_pai_id: itemPrincipal.id,
          })
        );

        await adicionarMultiplos(itensComplementares);
      }

      // Recarregar dashboard
      recarregarDashboard();
    }

    // Limpar estados
    setModalComplementaresAberto(false);
    setProdutoSelecionado(null);
    setDadosItem(null);
    limparComplementares();
    limparBusca();
  }, [
    produtoSelecionado,
    dadosItem,
    projetoId,
    adicionarItem,
    adicionarMultiplos,
    getComplementaresSelecionados,
    recarregarDashboard,
    limparComplementares,
    limparBusca,
  ]);

  const handleFecharModais = useCallback(() => {
    setModalAddAberto(false);
    setModalComplementaresAberto(false);
    setProdutoSelecionado(null);
    setDadosItem(null);
    limparComplementares();
  }, [limparComplementares]);

  const toggleSecao = useCallback((ambiente: string) => {
    setSecoesFechadas((prev) => {
      const next = new Set(prev);
      if (next.has(ambiente)) {
        next.delete(ambiente);
      } else {
        next.add(ambiente);
      }
      return next;
    });
  }, []);

  const handleRecarregar = useCallback(() => {
    carregar();
    recarregarDashboard();
  }, [carregar, recarregarDashboard]);

  // Render de loading
  if (loading && itens.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-wg-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to={`/cronograma/projects/${projetoId}`}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Lista de Compras</h1>
                <p className="text-sm text-gray-500">
                  Gerencie os materiais do projeto
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRecarregar}
                disabled={loading}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                title="Atualizar"
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Busca */}
          <div className="mt-4">
            <PricelistSearch
              produtos={produtosBusca}
              loading={loadingBusca}
              termo={termo}
              onBuscar={buscar}
              onLimpar={limparBusca}
              onSelecionar={handleSelecionarProduto}
              placeholder="Buscar produto para adicionar..."
            />
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Erro */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Dashboard */}
        <DashboardFinanceiro dados={dashboard} loading={loadingDashboard} />

        {/* Filtros */}
        <FiltrosLista
          filtros={filtros}
          onChange={setFiltros}
          ambientes={ambientes}
          categorias={categorias}
          fornecedores={fornecedores}
          totalItens={itens.length}
          itensFiltrados={itensFiltrados.length}
        />

        {/* Lista de Itens */}
        {itensFiltrados.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Package className="mx-auto mb-4 text-gray-300" size={48} />
            <h3 className="font-medium text-gray-900 mb-2">Nenhum item na lista</h3>
            <p className="text-gray-500 mb-6">
              {itens.length === 0
                ? 'Comece buscando um produto no catálogo acima'
                : 'Nenhum item corresponde aos filtros aplicados'}
            </p>
            {itens.length > 0 && (
              <button
                onClick={() => setFiltros({})}
                className="px-4 py-2 bg-wg-primary text-white rounded-lg font-medium hover:bg-wg-primary-dark"
              >
                Limpar Filtros
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {grupos.map((grupo) => {
              const fechada = secoesFechadas.has(grupo.ambiente);

              return (
                <div key={grupo.ambiente} className="bg-white rounded-xl border border-gray-200">
                  {/* Cabeçalho do Grupo */}
                  <button
                    onClick={() => toggleSecao(grupo.ambiente)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-t-xl"
                  >
                    <div className="flex items-center gap-3">
                      {fechada ? (
                        <ChevronRight size={18} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={18} className="text-gray-400" />
                      )}
                      <h2 className="font-semibold text-gray-900">{grupo.ambiente}</h2>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {grupo.itens.length} {grupo.itens.length === 1 ? 'item' : 'itens'}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(grupo.totalValor)}</p>
                      {grupo.totalFee > 0 && (
                        <p className="text-xs text-purple-600">FEE: {formatCurrency(grupo.totalFee)}</p>
                      )}
                    </div>
                  </button>

                  {/* Itens do Grupo */}
                  {!fechada && (
                    <div className="px-4 pb-4 space-y-3">
                      {grupo.itens.map((item) => (
                        <ItemCard
                          key={item.id}
                          item={item}
                          onUpdateStatus={alterarStatus}
                          onUpdateTipoCompra={alterarTipoCompra}
                          onUpdateQuantidade={alterarQuantidade}
                          onRemover={removerItem}
                          isComplementar={item.is_complementar}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modais */}
      <AddItemModal
        aberto={modalAddAberto}
        onFechar={handleFecharModais}
        produto={produtoSelecionado}
        onConfirmar={handleConfirmarDados}
        ambientes={ambientes}
      />

      <ComplementaresModal
        aberto={modalComplementaresAberto}
        onFechar={handleFecharModais}
        produto={produtoSelecionado}
        quantidade={dadosItem?.quantidade || 1}
        complementares={complementares}
        loading={loadingComplementares}
        onToggleComplementar={toggleSelecao}
        onConfirmar={handleConfirmarAdicao}
        totalComplementares={getTotalSelecionados()}
      />
    </div>
  );
}
