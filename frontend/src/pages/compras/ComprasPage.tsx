import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSwipe } from "@/hooks/useSwipe";
import {
  listarPedidosCompra,
  deletarPedidoCompra,
  alterarStatusPedidoCompra,
  obterEstatisticasPedidosCompra,
  type PedidoCompraCompleto,
  type PedidosCompraEstatisticas,
} from "@/lib/comprasApi";
import {
  STATUS_PEDIDO_LABELS,
  STATUS_PEDIDO_COLORS,
  formatarValor,
  formatarData,
  getStatusPedidoIcon,
  getUrgenciaPedido,
} from "@/types/pedidosCompra";
import { ResponsiveTable } from "@/components/ResponsiveTable";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function ComprasPage() {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState<PedidoCompraCompleto[]>([]);
  const [stats, setStats] = useState<PedidosCompraEstatisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<string>("");
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Swipe gestures para navegação
  const { onTouchStart, onTouchEnd } = useSwipe({
    onSwipeLeft: () => navigate("/compras/lista"),
    onSwipeRight: () => navigate(-1),
    threshold: 50,
  });

  async function carregar() {
    setLoading(true);
    try {
      const [pedidosData, statsData] = await Promise.all([
        listarPedidosCompra(),
        obterEstatisticasPedidosCompra(),
      ]);
      setPedidos(pedidosData);
      setStats(statsData);
    } catch (err) {
      console.error("Erro ao carregar pedidos de compra:", err);
    }
    setLoading(false);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function remover(id: string) {
    if (!confirm("Excluir este pedido de compra?")) return;
    try {
      await deletarPedidoCompra(id);
      carregar();
    } catch (err) {
      console.error("Erro ao deletar pedido:", err);
      alert("Erro ao deletar pedido");
    }
  }

  async function mudarStatus(id: string, novoStatus: any) {
    try {
      await alterarStatusPedidoCompra(id, novoStatus);
      carregar();
    } catch (err) {
      console.error("Erro ao alterar status:", err);
      alert("Erro ao alterar status");
    }
  }

  const pedidosFiltrados = filtroStatus
    ? pedidos.filter((p) => p.status === filtroStatus)
    : pedidos;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh] text-[#4C4C4C]">
        Carregando pedidos de compra...
      </div>
    );
  }

  return (
    <div className="space-y-6" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[#2E2E2E]">
            Pedidos de Compra
          </h1>
          <p className="text-sm text-[#4C4C4C]">
            Gerencie pedidos de compra, fornecedores e controle de entregas.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/compras/importar"
            className="px-3 py-2 text-sm bg-white border border-[#E5E5E5] rounded hover:bg-[#F3F3F3]"
          >
            Importar Item
          </Link>
          <Link
            to="/compras/novo"
            className="px-4 py-2 text-sm bg-[#F25C26] text-white rounded hover:bg-[#d54b1c]"
          >
            Novo Pedido
          </Link>
        </div>
      </div>

      {/* CARDS DE ESTATÍSTICAS */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-[#E5E5E5]">
            <div className="text-xs text-[#4C4C4C] mb-1">Total de Pedidos</div>
            <div className="text-2xl font-bold text-[#2E2E2E]">
              {stats.total_pedidos}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-[#E5E5E5]">
            <div className="text-xs text-[#4C4C4C] mb-1">Pendentes</div>
            <div className="text-2xl font-bold text-[#F59E0B]">
              {stats.pedidos_pendentes}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-[#E5E5E5]">
            <div className="text-xs text-[#4C4C4C] mb-1">Em Trânsito</div>
            <div className="text-2xl font-bold text-[#8B5CF6]">
              {stats.pedidos_em_transito}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-[#E5E5E5]">
            <div className="text-xs text-[#4C4C4C] mb-1">Valor Mês</div>
            <div className="text-2xl font-bold text-[#10B981]">
              {formatarValor(stats.valor_total_mes)}
            </div>
          </div>
        </div>
      )}

      {/* FILTROS */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-[#E5E5E5]">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFiltroStatus("")}
            className={`px-3 py-1 text-sm rounded ${
              filtroStatus === ""
                ? "bg-[#F25C26] text-white"
                : "bg-[#F3F3F3] text-[#4C4C4C] hover:bg-[#E5E5E5]"
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFiltroStatus("pendente")}
            className={`px-3 py-1 text-sm rounded ${
              filtroStatus === "pendente"
                ? "bg-[#F25C26] text-white"
                : "bg-[#F3F3F3] text-[#4C4C4C] hover:bg-[#E5E5E5]"
            }`}
          >
            Pendentes
          </button>
          <button
            onClick={() => setFiltroStatus("aprovado")}
            className={`px-3 py-1 text-sm rounded ${
              filtroStatus === "aprovado"
                ? "bg-[#F25C26] text-white"
                : "bg-[#F3F3F3] text-[#4C4C4C] hover:bg-[#E5E5E5]"
            }`}
          >
            Aprovados
          </button>
          <button
            onClick={() => setFiltroStatus("em_transito")}
            className={`px-3 py-1 text-sm rounded ${
              filtroStatus === "em_transito"
                ? "bg-[#F25C26] text-white"
                : "bg-[#F3F3F3] text-[#4C4C4C] hover:bg-[#E5E5E5]"
            }`}
          >
            Em Trânsito
          </button>
          <button
            onClick={() => setFiltroStatus("entregue")}
            className={`px-3 py-1 text-sm rounded ${
              filtroStatus === "entregue"
                ? "bg-[#F25C26] text-white"
                : "bg-[#F3F3F3] text-[#4C4C4C] hover:bg-[#E5E5E5]"
            }`}
          >
            Entregues
          </button>
        </div>
      </div>

      {/* TABELA RESPONSIVA */}
      <ResponsiveTable
        data={pedidosFiltrados}
        columns={[
          {
            key: "numero",
            label: "Número",
            render: (pedido: PedidoCompraCompleto) => (
              <div className="flex items-center gap-2">
                <span>{getStatusPedidoIcon(pedido.status)}</span>
                <span className="font-mono">{pedido.numero}</span>
              </div>
            ),
          },
          {
            key: "fornecedor",
            label: "Fornecedor",
            render: (pedido: PedidoCompraCompleto) =>
              pedido.fornecedor?.nome || "-",
          },
          {
            key: "data_pedido",
            label: "Data Pedido",
            render: (pedido: PedidoCompraCompleto) =>
              formatarData(pedido.data_pedido),
          },
          {
            key: "data_previsao_entrega",
            label: "Previsão",
            render: (pedido: PedidoCompraCompleto) =>
              formatarData(pedido.data_previsao_entrega),
          },
          {
            key: "status",
            label: "Status",
            render: (pedido: PedidoCompraCompleto) => (
              <span
                className="px-2 py-1 rounded text-xs text-white"
                style={{ backgroundColor: STATUS_PEDIDO_COLORS[pedido.status] }}
              >
                {STATUS_PEDIDO_LABELS[pedido.status]}
              </span>
            ),
          },
          {
            key: "urgencia",
            label: "Urgência",
            render: (pedido: PedidoCompraCompleto) => {
              const urgencia = getUrgenciaPedido(pedido);
              return (
                <span
                  className="text-xs font-medium"
                  style={{ color: urgencia.color }}
                >
                  {urgencia.label}
                </span>
              );
            },
          },
          {
            key: "total_itens",
            label: "Itens",
            render: (pedido: PedidoCompraCompleto) => pedido.total_itens,
          },
          {
            key: "valor_total",
            label: "Valor Total",
            render: (pedido: PedidoCompraCompleto) => (
              <span className="font-semibold">
                {formatarValor(pedido.valor_total)}
              </span>
            ),
          },
          {
            key: "acoes",
            label: "Ações",
            render: (pedido: PedidoCompraCompleto) => (
              <div className="flex flex-col gap-2 md:flex-row md:space-x-2">
                <Link
                  to={`/compras/${pedido.id}`}
                  className="text-blue-600 hover:underline text-sm"
                >
                  Ver
                </Link>
                <Link
                  to={`/compras/${pedido.id}`}
                  className="text-green-600 hover:underline text-sm"
                >
                  Editar
                </Link>
                {pedido.status === "pendente" && (
                  <button
                    onClick={() => mudarStatus(pedido.id, "aprovado")}
                    className="text-green-700 hover:underline text-sm"
                  >
                    Aprovar
                  </button>
                )}
                {pedido.status === "aprovado" && (
                  <button
                    onClick={() => mudarStatus(pedido.id, "em_transito")}
                    className="text-purple-600 hover:underline text-sm"
                  >
                    Em Trânsito
                  </button>
                )}
                {(pedido.status === "em_transito" ||
                  pedido.status === "aprovado") && (
                  <button
                    onClick={() => mudarStatus(pedido.id, "entregue")}
                    className="text-green-700 hover:underline text-sm"
                  >
                    Entregue
                  </button>
                )}
                <button
                  onClick={() => remover(pedido.id)}
                  className="text-red-600 hover:underline text-sm"
                >
                  Excluir
                </button>
              </div>
            ),
          },
        ]}
        loading={loading}
        onRowClick={(pedido) => {
          // Navegação ao clicar na linha em mobile
          if (isMobile) {
            window.location.href = `/compras/${pedido.id}`;
          }
        }}
      />
    </div>
  );
}
