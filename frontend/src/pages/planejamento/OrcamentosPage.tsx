// ==========================================
// ORÇAMENTOS
// Sistema WG Easy - Grupo WG Almeida
// Com agrupamento por cliente
// ==========================================

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { listarOrcamentos, type Orcamento } from "@/lib/orcamentoApi";
import { formatarMoeda } from "@/lib/utils";
import { supabaseRaw as supabase } from "@/lib/supabaseClient";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useSwipe } from "@/hooks/useSwipe";

interface OrcamentoComCliente extends Orcamento {
  cliente?: {
    nome: string;
  };
  obra?: {
    nome: string;
  };
}

interface GrupoOrcamentos {
  cliente_id: string | null;
  cliente_nome: string;
  orcamentos: OrcamentoComCliente[];
  valor_total: number;
  quantidade: number;
}

export default function OrcamentosPage() {
  const navigate = useNavigate();
  const [orcamentos, setOrcamentos] = useState<OrcamentoComCliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [gruposExpandidos, setGruposExpandidos] = useState<Set<string>>(
    new Set()
  );
  const [modoVisualizacao, setModoVisualizacao] = useState<
    "agrupado" | "individual"
  >("agrupado");
  const { onTouchStart, onTouchEnd } = useSwipe({
    onSwipeLeft: () => navigate("/dashboard"),
    onSwipeRight: () => navigate(-1),
  });

  useEffect(() => {
    carregarOrcamentos();
  }, []);

  async function carregarOrcamentos() {
    try {
      setLoading(true);

      // Buscar orçamentos com dados de cliente
      const { data, error } = await supabase
        .from("orcamentos")
        .select(
          `
          *,
          cliente:pessoas!cliente_id(nome)

        `
        )
        .order("criado_em", { ascending: false });

      if (error) throw error;

      setOrcamentos(data || []);
    } catch (error) {
      console.error("Erro ao carregar orçamentos:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleNovoOrcamento() {
    navigate("/orcamentos/novo");
  }

  function handleVisualizarOrcamento(id: string) {
    navigate(`/orcamentos/${id}`);
  }

  // Filtrar orçamentos
  const orcamentosFiltrados = orcamentos.filter((orc) => {
    const matchBusca =
      !busca ||
      orc.titulo?.toLowerCase().includes(busca.toLowerCase()) ||
      orc.cliente?.nome?.toLowerCase().includes(busca.toLowerCase()) ||
      orc.obra?.nome?.toLowerCase().includes(busca.toLowerCase());

    return matchBusca;
  });

  // Agrupar orçamentos por cliente
  const gruposOrcamentos = useMemo((): GrupoOrcamentos[] => {
    const grupos: Record<string, GrupoOrcamentos> = {};

    orcamentosFiltrados.forEach((orc) => {
      const clienteId = orc.cliente_id || "sem_cliente";
      const clienteNome = orc.cliente?.nome || "Sem Cliente";

      if (!grupos[clienteId]) {
        grupos[clienteId] = {
          cliente_id: orc.cliente_id,
          cliente_nome: clienteNome,
          orcamentos: [],
          valor_total: 0,
          quantidade: 0,
        };
      }

      grupos[clienteId].orcamentos.push(orc);
      grupos[clienteId].valor_total += orc.valor_total || 0;
      grupos[clienteId].quantidade += 1;
    });

    // Ordenar por valor total decrescente
    return Object.values(grupos).sort((a, b) => b.valor_total - a.valor_total);
  }, [orcamentosFiltrados]);

  // Toggle para expandir/colapsar grupo
  function toggleGrupo(clienteId: string) {
    setGruposExpandidos((prev) => {
      const novo = new Set(prev);
      if (novo.has(clienteId)) {
        novo.delete(clienteId);
      } else {
        novo.add(clienteId);
      }
      return novo;
    });
  }

  // Expandir todos
  function expandirTodos() {
    setGruposExpandidos(
      new Set(gruposOrcamentos.map((g) => g.cliente_id || "sem_cliente"))
    );
  }

  // Colapsar todos
  function colapsarTodos() {
    setGruposExpandidos(new Set());
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#F25C26] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando orçamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Orçamentos
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Gestão de orçamentos e estimativas de projetos
            </p>
          </div>
          <button
            type="button"
            onClick={handleNovoOrcamento}
            className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#F25C26] text-white rounded-lg hover:bg-[#e04a1a] font-medium flex items-center justify-center gap-2 shadow-md transition-colors whitespace-nowrap shrink-0"
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
            <span>Novo Orçamento</span>
          </button>
        </div>

        {/* Filtros e Busca */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[300px]">
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por título, cliente ou obra..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F25C26] focus:border-transparent"
              />
            </div>

            {/* Toggle Modo de Visualização */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Visualização:</span>
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setModoVisualizacao("agrupado")}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    modoVisualizacao === "agrupado"
                      ? "bg-[#F25C26] text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Por Cliente
                </button>
                <button
                  type="button"
                  onClick={() => setModoVisualizacao("individual")}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    modoVisualizacao === "individual"
                      ? "bg-[#F25C26] text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Individual
                </button>
              </div>
            </div>

            {/* Botões Expandir/Colapsar */}
            {modoVisualizacao === "agrupado" && gruposOrcamentos.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={expandirTodos}
                  className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Expandir Todos
                </button>
                <button
                  type="button"
                  onClick={colapsarTodos}
                  className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Colapsar Todos
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Lista de Orçamentos */}
        {orcamentosFiltrados.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              {busca
                ? "Nenhum orçamento encontrado"
                : "Nenhum orçamento cadastrado"}
            </h2>
            <p className="text-gray-500 mb-6">
              {busca
                ? "Tente ajustar os filtros de busca"
                : "Comece criando seu primeiro orçamento"}
            </p>
            {!busca && (
              <button
                type="button"
                onClick={handleNovoOrcamento}
                className="px-6 py-3 bg-[#F25C26] text-white rounded-lg hover:bg-[#e04a1a] font-medium inline-flex items-center gap-2"
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
                Criar Primeiro Orçamento
              </button>
            )}
          </div>
        ) : modoVisualizacao === "agrupado" ? (
          /* MODO AGRUPADO POR CLIENTE */
          <div className="space-y-4">
            {gruposOrcamentos.map((grupo) => {
              const grupoKey = grupo.cliente_id || "sem_cliente";
              const isExpandido = gruposExpandidos.has(grupoKey);

              return (
                <div
                  key={grupoKey}
                  className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden"
                >
                  {/* Header do Grupo (Clicável) */}
                  <div
                    className="bg-gradient-to-r from-[#F25C26] to-[#e04a1a] p-4 text-white cursor-pointer flex items-center justify-between"
                    onClick={() => toggleGrupo(grupoKey)}
                  >
                    <div className="flex items-center gap-3">
                      {isExpandido ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                      <div>
                        <h3 className="font-semibold text-lg">
                          {grupo.cliente_nome}
                        </h3>
                        <p className="text-sm opacity-90">
                          {grupo.quantidade} orçamento
                          {grupo.quantidade > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        {formatarMoeda(grupo.valor_total)}
                      </p>
                      <p className="text-sm opacity-90">Valor Total</p>
                    </div>
                  </div>

                  {/* Lista de Orçamentos do Grupo (Expandível) */}
                  {isExpandido && (
                    <div className="p-4 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {grupo.orcamentos.map((orcamento) => (
                          <div
                            key={orcamento.id}
                            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200 overflow-hidden"
                            onClick={() =>
                              handleVisualizarOrcamento(orcamento.id)
                            }
                          >
                            <div className="p-4 space-y-3">
                              <h4 className="font-semibold text-gray-900 truncate">
                                {orcamento.titulo || "Sem título"}
                              </h4>

                              {orcamento.obra?.nome && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                    />
                                  </svg>
                                  <span className="truncate">
                                    {orcamento.obra.nome}
                                  </span>
                                </div>
                              )}

                              <div className="pt-3 border-t border-gray-200">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm text-gray-600">
                                    Valor
                                  </span>
                                  <span className="text-lg font-bold text-gray-900">
                                    {formatarMoeda(orcamento.valor_total || 0)}
                                  </span>
                                </div>

                                {orcamento.margem !== null && (
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">
                                      Margem
                                    </span>
                                    <span className="font-semibold text-green-600">
                                      {orcamento.margem.toFixed(2)}%
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className="text-xs text-gray-500">
                                {new Date(
                                  orcamento.criado_em || ""
                                ).toLocaleDateString("pt-BR")}
                              </div>
                            </div>

                            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                              <button
                                type="button"
                                className="w-full px-3 py-1.5 text-sm font-medium text-[#F25C26] hover:bg-[#F25C26] hover:text-white rounded-lg transition-colors border border-[#F25C26]"
                              >
                                Ver Detalhes
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* MODO INDIVIDUAL (ORIGINAL) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orcamentosFiltrados.map((orcamento) => (
              <div
                key={orcamento.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 overflow-hidden"
                onClick={() => handleVisualizarOrcamento(orcamento.id)}
              >
                {/* Header do Card */}
                <div className="bg-gradient-to-r from-[#F25C26] to-[#e04a1a] p-4 text-white">
                  <h3 className="font-semibold text-lg mb-1 truncate">
                    {orcamento.titulo || "Sem título"}
                  </h3>
                  <p className="text-sm opacity-90">
                    {orcamento.cliente?.nome || "Cliente não informado"}
                  </p>
                </div>

                {/* Conteúdo do Card */}
                <div className="p-4 space-y-3">
                  {orcamento.obra?.nome && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      <span className="truncate">{orcamento.obra.nome}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Valor Total</span>
                      <span className="text-xl font-bold text-gray-900">
                        {formatarMoeda(orcamento.valor_total || 0)}
                      </span>
                    </div>

                    {orcamento.margem !== null && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Margem</span>
                        <span className="font-semibold text-green-600">
                          {orcamento.margem.toFixed(2)}%
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        Criado em{" "}
                        {new Date(orcamento.criado_em || "").toLocaleDateString(
                          "pt-BR"
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer do Card */}
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                  <button
                    type="button"
                    className="w-full px-4 py-2 text-sm font-medium text-[#F25C26] hover:bg-[#F25C26] hover:text-white rounded-lg transition-colors border border-[#F25C26]"
                  >
                    Ver Detalhes
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Estatísticas */}
        {orcamentos.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total de Orçamentos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {orcamentos.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Valor Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatarMoeda(
                      orcamentos.reduce(
                        (sum, orc) => sum + (orc.valor_total || 0),
                        0
                      )
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Margem Média</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {orcamentos.length > 0
                      ? (
                          orcamentos
                            .filter((o) => o.margem !== null)
                            .reduce((sum, orc) => sum + (orc.margem || 0), 0) /
                          orcamentos.filter((o) => o.margem !== null).length
                        ).toFixed(2)
                      : "0.00"}
                    %
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
