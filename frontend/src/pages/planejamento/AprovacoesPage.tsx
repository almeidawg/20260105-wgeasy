// ==========================================
// APROVAÇÕES
// Sistema WG Easy - Grupo WG Almeida
// Central de aprovações de orçamentos, compras e solicitações
// ==========================================

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabaseRaw as supabase } from "@/lib/supabaseClient";
import { formatarMoeda } from "@/lib/utils";

interface ItemPendente {
  id: string;
  tipo: "orcamento" | "compra" | "solicitacao";
  titulo: string;
  descricao?: string;
  valor: number;
  data_criacao: string;
  solicitante?: string;
  cliente?: string;
  status: string;
  urgencia: "baixa" | "media" | "alta";
}

interface EstatisticasAprovacao {
  total_pendentes: number;
  orcamentos_pendentes: number;
  compras_pendentes: number;
  solicitacoes_pendentes: number;
  valor_total_pendente: number;
}

export default function AprovacoesPage() {
  const [itens, setItens] = useState<ItemPendente[]>([]);
  const [estatisticas, setEstatisticas] = useState<EstatisticasAprovacao>({
    total_pendentes: 0,
    orcamentos_pendentes: 0,
    compras_pendentes: 0,
    solicitacoes_pendentes: 0,
    valor_total_pendente: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroUrgencia, setFiltroUrgencia] = useState<string>("todos");

  useEffect(() => {
    carregarPendentes();
  }, []);

  async function carregarPendentes() {
    try {
      setLoading(true);
      const itensPendentes: ItemPendente[] = [];

      // Buscar orçamentos pendentes (status em elaboração)
      const { data: orcamentos, error: errOrc } = await supabase
        .from("orcamentos")
        .select(`
          id,
          titulo,
          valor_total,
          criado_em,
          cliente:pessoas!cliente_id(nome)
        `)
        .order("criado_em", { ascending: false })
        .limit(50);

      if (!errOrc && orcamentos) {
        orcamentos.forEach((orc: any) => {
          itensPendentes.push({
            id: orc.id,
            tipo: "orcamento",
            titulo: orc.titulo || "Orçamento sem título",
            descricao: `Cliente: ${orc.cliente?.nome || "Não informado"}`,
            valor: orc.valor_total || 0,
            data_criacao: orc.criado_em,
            cliente: orc.cliente?.nome,
            status: "pendente",
            urgencia: "media",
          });
        });
      }

      // Buscar pedidos de compra pendentes (query simples, sem join)
      try {
        const { data: compras } = await supabase
          .from("pedidos_compra")
          .select("id, numero, descricao, valor_total, data_pedido, status, fornecedor_id")
          .eq("status", "pendente")
          .order("data_pedido", { ascending: false })
          .limit(50);

        if (compras && compras.length > 0) {
          compras.forEach((comp: any) => {
            itensPendentes.push({
              id: comp.id,
              tipo: "compra",
              titulo: `Pedido #${comp.numero || comp.id.slice(0, 8)}`,
              descricao: comp.descricao || "Pedido de compra",
              valor: comp.valor_total || 0,
              data_criacao: comp.data_pedido,
              status: comp.status,
              urgencia: "alta",
            });
          });
        }
      } catch (e) {
        console.log("Tabela pedidos_compra não disponível");
      }

      // Buscar solicitações de depósito pendentes (query simples)
      try {
        const { data: solicitacoes } = await supabase
          .from("financeiro_solicitacoes")
          .select("id, descricao, valor, created_at, status")
          .eq("status", "pendente")
          .order("created_at", { ascending: false })
          .limit(50);

        if (solicitacoes && solicitacoes.length > 0) {
          solicitacoes.forEach((sol: any) => {
            itensPendentes.push({
              id: sol.id,
              tipo: "solicitacao",
              titulo: sol.descricao || "Solicitação de Depósito",
              descricao: "Solicitação financeira pendente",
              valor: sol.valor || 0,
              data_criacao: sol.created_at,
              status: sol.status,
              urgencia: "baixa",
            });
          });
        }
      } catch (e) {
        console.log("Tabela financeiro_solicitacoes não disponível");
      }

      // Buscar projetos de compras pendentes (pedidos de materiais de obra)
      try {
        const { data: projetosCompras } = await supabase
          .from("projetos_compras")
          .select("id, codigo, nome, cliente_nome, endereco, status, created_at")
          .eq("status", "PENDENTE")
          .order("created_at", { ascending: false })
          .limit(50);

        if (projetosCompras && projetosCompras.length > 0) {
          // Buscar valor total de cada projeto
          for (const proj of projetosCompras) {
            const { data: itensProj } = await supabase
              .from("projeto_lista_compras")
              .select("valor_total")
              .eq("projeto_id", proj.id);

            const valorTotal = itensProj?.reduce((acc, i) => acc + (i.valor_total || 0), 0) || 0;
            const totalItens = itensProj?.length || 0;

            itensPendentes.push({
              id: proj.id,
              tipo: "compra",
              titulo: `${proj.codigo} - ${proj.nome}`,
              descricao: `${proj.cliente_nome}${proj.endereco ? ` | ${proj.endereco}` : ""} (${totalItens} itens)`,
              valor: valorTotal,
              data_criacao: proj.created_at,
              cliente: proj.cliente_nome,
              status: "pendente",
              urgencia: "alta",
            });
          }
        }
      } catch (e) {
        console.log("Tabela projetos_compras não disponível");
      }

      // Buscar itens de lista de compras pendentes de aprovação (itens individuais)
      try {
        const { data: listaCompras } = await supabase
          .from("projeto_lista_compras")
          .select("id, codigo, descricao, valor_total, created_at, status, projeto_id")
          .eq("status", "PENDENTE")
          .is("projeto_id", null) // Apenas itens órfãos (sem projeto vinculado)
          .order("created_at", { ascending: false })
          .limit(50);

        if (listaCompras && listaCompras.length > 0) {
          listaCompras.forEach((item: any) => {
            itensPendentes.push({
              id: item.id,
              tipo: "compra",
              titulo: `Material #${item.codigo || item.id.slice(0, 8)}`,
              descricao: item.descricao || "Item de material",
              valor: item.valor_total || 0,
              data_criacao: item.created_at,
              status: item.status?.toLowerCase() || "pendente",
              urgencia: "media",
            });
          });
        }
      } catch (e) {
        console.log("Tabela projeto_lista_compras não disponível");
      }

      // Ordenar por data (mais recentes primeiro)
      itensPendentes.sort((a, b) =>
        new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime()
      );

      setItens(itensPendentes);

      // Calcular estatísticas
      const stats: EstatisticasAprovacao = {
        total_pendentes: itensPendentes.length,
        orcamentos_pendentes: itensPendentes.filter(i => i.tipo === "orcamento").length,
        compras_pendentes: itensPendentes.filter(i => i.tipo === "compra").length,
        solicitacoes_pendentes: itensPendentes.filter(i => i.tipo === "solicitacao").length,
        valor_total_pendente: itensPendentes.reduce((sum, i) => sum + i.valor, 0),
      };
      setEstatisticas(stats);

    } catch (error) {
      console.error("Erro ao carregar pendências:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAprovar(item: ItemPendente) {
    if (!confirm(`Aprovar "${item.titulo}"?`)) return;

    try {
      // Verificar se é um projeto de compras (pelo formato do título)
      const isProjetoCompras = item.titulo.startsWith("PC-");

      if (isProjetoCompras) {
        // Aprovar projeto de compras
        const { error } = await supabase
          .from("projetos_compras")
          .update({ status: "APROVADO", updated_at: new Date().toISOString() })
          .eq("id", item.id);

        if (error) throw error;

        // Atualizar status dos itens também
        await supabase
          .from("projeto_lista_compras")
          .update({ status: "APROVADO", data_aprovacao: new Date().toISOString() })
          .eq("projeto_id", item.id);

        alert("Projeto de compras aprovado com sucesso!");
      } else {
        let tabela = "";
        let novoStatus = "aprovado";

        switch (item.tipo) {
          case "compra":
            tabela = "pedidos_compra";
            break;
          case "solicitacao":
            tabela = "financeiro_solicitacoes";
            break;
          default:
            alert("Tipo de item não suporta aprovação direta.");
            return;
        }

        const { error } = await supabase
          .from(tabela)
          .update({ status: novoStatus })
          .eq("id", item.id);

        if (error) throw error;

        alert("Item aprovado com sucesso!");
      }

      carregarPendentes();
    } catch (error) {
      console.error("Erro ao aprovar:", error);
      alert("Erro ao aprovar item.");
    }
  }

  async function handleRejeitar(item: ItemPendente) {
    const motivo = prompt("Motivo da rejeição (opcional):");
    if (motivo === null) return; // Cancelou

    try {
      // Verificar se é um projeto de compras (pelo formato do título)
      const isProjetoCompras = item.titulo.startsWith("PC-");

      if (isProjetoCompras) {
        // Rejeitar projeto de compras
        const { error } = await supabase
          .from("projetos_compras")
          .update({
            status: "CANCELADO",
            updated_at: new Date().toISOString(),
            observacoes: motivo || undefined,
          })
          .eq("id", item.id);

        if (error) throw error;

        alert("Projeto de compras rejeitado.");
      } else {
        let tabela = "";
        let novoStatus = "rejeitado";

        switch (item.tipo) {
          case "compra":
            tabela = "pedidos_compra";
            break;
          case "solicitacao":
            tabela = "financeiro_solicitacoes";
            break;
          default:
            alert("Tipo de item não suporta rejeição direta.");
            return;
        }

        const { error } = await supabase
          .from(tabela)
          .update({
            status: novoStatus,
            observacoes: motivo || undefined
          })
          .eq("id", item.id);

        if (error) throw error;

        alert("Item rejeitado.");
      }

      carregarPendentes();
    } catch (error) {
      console.error("Erro ao rejeitar:", error);
      alert("Erro ao rejeitar item.");
    }
  }

  async function handleExcluir(item: ItemPendente) {
    if (!confirm(`Excluir "${item.titulo}"?\n\nEsta ação não pode ser desfeita.`)) return;

    try {
      let tabela = "";

      switch (item.tipo) {
        case "orcamento":
          tabela = "orcamentos";
          break;
        case "compra":
          tabela = "pedidos_compra";
          break;
        case "solicitacao":
          tabela = "financeiro_solicitacoes";
          break;
        default:
          alert("Tipo de item não suporta exclusão.");
          return;
      }

      const { error } = await supabase
        .from(tabela)
        .delete()
        .eq("id", item.id);

      if (error) throw error;

      alert("Item excluído com sucesso!");
      carregarPendentes();
    } catch (error) {
      console.error("Erro ao excluir:", error);
      alert("Erro ao excluir item. Verifique se não há dependências.");
    }
  }

  // Filtrar itens
  const itensFiltrados = itens.filter(item => {
    if (filtroTipo !== "todos" && item.tipo !== filtroTipo) return false;
    if (filtroUrgencia !== "todos" && item.urgencia !== filtroUrgencia) return false;
    return true;
  });

  function getTipoLabel(tipo: string) {
    switch (tipo) {
      case "orcamento": return "Orçamento";
      case "compra": return "Pedido de Compra";
      case "solicitacao": return "Solicitação";
      default: return tipo;
    }
  }

  function getTipoColor(tipo: string) {
    switch (tipo) {
      case "orcamento": return "bg-blue-100 text-blue-800";
      case "compra": return "bg-purple-100 text-purple-800";
      case "solicitacao": return "bg-amber-100 text-amber-800";
      default: return "bg-gray-100 text-gray-800";
    }
  }

  function getUrgenciaColor(urgencia: string) {
    switch (urgencia) {
      case "alta": return "bg-red-100 text-red-800";
      case "media": return "bg-yellow-100 text-yellow-800";
      case "baixa": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  }

  function getLinkDetalhe(item: ItemPendente) {
    switch (item.tipo) {
      case "orcamento": return `/planejamento/orcamentos/${item.id}`;
      case "compra": return `/compras/${item.id}`;
      case "solicitacao": return `/financeiro/solicitacoes`;
      default: return "#";
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#F25C26] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando pendências...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Central de Aprovações
          </h1>
          <p className="text-gray-600">
            Gerencie aprovações de orçamentos, pedidos de compra e solicitações
          </p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">{estatisticas.total_pendentes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Orçamentos</p>
                <p className="text-2xl font-bold text-blue-600">{estatisticas.orcamentos_pendentes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Compras</p>
                <p className="text-2xl font-bold text-purple-600">{estatisticas.compras_pendentes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 rounded-lg">
                <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Solicitações</p>
                <p className="text-2xl font-bold text-amber-600">{estatisticas.solicitacoes_pendentes}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#F25C26] to-[#e04a1a] rounded-lg shadow p-6 text-white">
            <div>
              <p className="text-sm opacity-90">Valor Total Pendente</p>
              <p className="text-2xl font-bold">{formatarMoeda(estatisticas.valor_total_pendente)}</p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-4 mb-6 border border-gray-200">
          <div className="flex flex-wrap gap-4">
            <div>
              <label htmlFor="filtro-tipo" className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                id="filtro-tipo"
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F25C26]"
              >
                <option value="todos">Todos</option>
                <option value="orcamento">Orçamentos</option>
                <option value="compra">Pedidos de Compra</option>
                <option value="solicitacao">Solicitações</option>
              </select>
            </div>

            <div>
              <label htmlFor="filtro-urgencia" className="block text-sm font-medium text-gray-700 mb-1">Urgência</label>
              <select
                id="filtro-urgencia"
                value={filtroUrgencia}
                onChange={(e) => setFiltroUrgencia(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F25C26]"
              >
                <option value="todos">Todas</option>
                <option value="alta">Alta</option>
                <option value="media">Média</option>
                <option value="baixa">Baixa</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  setFiltroTipo("todos");
                  setFiltroUrgencia("todos");
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Pendências */}
        {itensFiltrados.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center border border-gray-200">
            <div className="text-6xl mb-4">✓</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Nenhuma pendência encontrada
            </h2>
            <p className="text-gray-500">
              {filtroTipo !== "todos" || filtroUrgencia !== "todos"
                ? "Tente ajustar os filtros para ver mais itens"
                : "Todas as aprovações estão em dia!"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {itensFiltrados.map((item) => (
              <div
                key={`${item.tipo}-${item.id}`}
                className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Info Principal */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoColor(item.tipo)}`}>
                        {getTipoLabel(item.tipo)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgenciaColor(item.urgencia)}`}>
                        {item.urgencia.charAt(0).toUpperCase() + item.urgencia.slice(1)}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {item.titulo}
                    </h3>

                    {item.descricao && (
                      <p className="text-sm text-gray-600 mb-2">{item.descricao}</p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(item.data_criacao).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>

                  {/* Valor */}
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Valor</p>
                    <p className="text-2xl font-bold text-gray-900">{formatarMoeda(item.valor)}</p>
                  </div>

                  {/* Ações */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Link
                      to={getLinkDetalhe(item)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 text-center"
                    >
                      Ver Detalhes
                    </Link>

                    {item.tipo !== "orcamento" && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleAprovar(item)}
                          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                        >
                          Aprovar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRejeitar(item)}
                          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                        >
                          Rejeitar
                        </button>
                      </>
                    )}

                    {/* Botão Excluir - disponível para todos os tipos */}
                    <button
                      type="button"
                      onClick={() => handleExcluir(item)}
                      className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 hover:text-gray-800"
                      title="Excluir item"
                    >
                      <svg className="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Legenda */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Legenda de Urgência</h4>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="text-gray-600">Alta - Requer ação imediata</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              <span className="text-gray-600">Média - Ação em até 48h</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span className="text-gray-600">Baixa - Sem prazo definido</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
