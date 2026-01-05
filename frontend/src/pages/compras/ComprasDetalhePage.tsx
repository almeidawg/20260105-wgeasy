import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  buscarPedidoCompra,
  alterarStatusPedidoCompra,
  duplicarPedidoCompra,
  type PedidoCompraCompleto,
} from "@/lib/comprasApi";
import {
  STATUS_PEDIDO_LABELS,
  STATUS_PEDIDO_COLORS,
  formatarValor,
  formatarData,
  getStatusPedidoIcon,
  getUrgenciaPedido,
  podeAprovarPedido,
  podeCancelarPedido,
  podeMarcarComoEntregue,
} from "@/types/pedidosCompra";

export default function ComprasDetalhePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState<PedidoCompraCompleto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      carregar();
    }
  }, [id]);

  async function carregar() {
    if (!id) return;

    setLoading(true);
    try {
      const data = await buscarPedidoCompra(id);
      setPedido(data);
    } catch (err) {
      console.error("Erro ao carregar pedido:", err);
      alert("Erro ao carregar pedido");
    }
    setLoading(false);
  }

  async function mudarStatus(novoStatus: any) {
    if (!id) return;

    try {
      await alterarStatusPedidoCompra(id, novoStatus);
      await carregar();
      alert(`Status alterado para ${STATUS_PEDIDO_LABELS[novoStatus]}`);
    } catch (err) {
      console.error("Erro ao alterar status:", err);
      alert("Erro ao alterar status");
    }
  }

  async function duplicar() {
    if (!id || !confirm("Duplicar este pedido?")) return;

    try {
      const novoPedido = await duplicarPedidoCompra(id);
      alert("Pedido duplicado com sucesso!");
      navigate(`/compras/${novoPedido.id}`);
    } catch (err) {
      console.error("Erro ao duplicar pedido:", err);
      alert("Erro ao duplicar pedido");
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh] text-[#4C4C4C]">
        Carregando pedido...
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="flex justify-center items-center h-[50vh] text-[#4C4C4C]">
        Pedido não encontrado
      </div>
    );
  }

  const urgencia = getUrgenciaPedido(pedido);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{getStatusPedidoIcon(pedido.status)}</span>
            <div>
              <h1 className="text-2xl font-semibold text-[#2E2E2E]">
                Pedido {pedido.numero}
              </h1>
              <p className="text-sm text-[#4C4C4C]">
                Detalhes do pedido de compra
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate("/compras")}
            className="px-3 py-2 text-sm bg-white border border-[#E5E5E5] rounded hover:bg-[#F3F3F3]"
          >
            Voltar
          </button>
          <button
            onClick={duplicar}
            className="px-3 py-2 text-sm bg-white border border-[#E5E5E5] rounded hover:bg-[#F3F3F3]"
          >
            Duplicar
          </button>
          <Link
            to={`/compras/editar/${pedido.id}`}
            className="px-4 py-2 text-sm bg-[#F25C26] text-white rounded hover:bg-[#d54b1c]"
          >
            Editar
          </Link>
        </div>
      </div>

      {/* STATUS E URGÊNCIA */}
      <div className="flex gap-3">
        <div
          className="px-4 py-2 rounded text-white font-semibold"
          style={{ backgroundColor: STATUS_PEDIDO_COLORS[pedido.status] }}
        >
          {STATUS_PEDIDO_LABELS[pedido.status]}
        </div>
        {urgencia.urgente && (
          <div
            className="px-4 py-2 rounded text-white font-semibold"
            style={{ backgroundColor: urgencia.color }}
          >
            {urgencia.label}
          </div>
        )}
      </div>

      {/* AÇÕES RÁPIDAS */}
      <div className="bg-white rounded-xl shadow-md border border-[#E5E5E5] p-4">
        <h2 className="text-sm font-semibold text-[#2E2E2E] mb-3">Ações Rápidas</h2>
        <div className="flex flex-wrap gap-2">
          {podeAprovarPedido(pedido) && (
            <button
              onClick={() => mudarStatus("aprovado")}
              className="px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              ✅ Aprovar Pedido
            </button>
          )}
          {pedido.status === "aprovado" && (
            <button
              onClick={() => mudarStatus("em_transito")}
              className="px-3 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              🚚 Marcar Em Trânsito
            </button>
          )}
          {podeMarcarComoEntregue(pedido) && (
            <button
              onClick={() => mudarStatus("entregue")}
              className="px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              📦 Marcar Como Entregue
            </button>
          )}
          {podeCancelarPedido(pedido) && (
            <button
              onClick={() => mudarStatus("cancelado")}
              className="px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            >
              ❌ Cancelar Pedido
            </button>
          )}
        </div>
      </div>

      {/* INFORMAÇÕES DO PEDIDO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* DADOS PRINCIPAIS */}
        <div className="bg-white rounded-xl shadow-md border border-[#E5E5E5] p-6">
          <h2 className="text-lg font-semibold text-[#2E2E2E] mb-4">
            Dados do Pedido
          </h2>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-[#4C4C4C]">Número:</span>
              <span className="ml-2 font-mono font-semibold">{pedido.numero}</span>
            </div>
            <div>
              <span className="text-[#4C4C4C]">Fornecedor:</span>
              <span className="ml-2 font-semibold">{pedido.fornecedor?.nome || "-"}</span>
            </div>
            {pedido.fornecedor?.email && (
              <div>
                <span className="text-[#4C4C4C]">Email:</span>
                <span className="ml-2">{pedido.fornecedor.email}</span>
              </div>
            )}
            {pedido.fornecedor?.telefone && (
              <div>
                <span className="text-[#4C4C4C]">Telefone:</span>
                <span className="ml-2">{pedido.fornecedor.telefone}</span>
              </div>
            )}
            <div>
              <span className="text-[#4C4C4C]">Data do Pedido:</span>
              <span className="ml-2">{formatarData(pedido.data_pedido)}</span>
            </div>
            <div>
              <span className="text-[#4C4C4C]">Previsão de Entrega:</span>
              <span className="ml-2">{formatarData(pedido.data_previsao_entrega)}</span>
            </div>
            {pedido.data_entrega_real && (
              <div>
                <span className="text-[#4C4C4C]">Data de Entrega:</span>
                <span className="ml-2">{formatarData(pedido.data_entrega_real)}</span>
              </div>
            )}
            {pedido.condicoes_pagamento && (
              <div>
                <span className="text-[#4C4C4C]">Condições de Pagamento:</span>
                <span className="ml-2">{pedido.condicoes_pagamento}</span>
              </div>
            )}
          </div>
        </div>

        {/* VALORES */}
        <div className="bg-white rounded-xl shadow-md border border-[#E5E5E5] p-6">
          <h2 className="text-lg font-semibold text-[#2E2E2E] mb-4">Valores</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[#4C4C4C]">Total de Itens:</span>
              <span className="font-semibold">{pedido.total_itens}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t">
              <span className="text-xl font-semibold text-[#2E2E2E]">Valor Total:</span>
              <span className="text-2xl font-bold text-[#F25C26]">
                {formatarValor(pedido.valor_total)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* OBSERVAÇÕES */}
      {pedido.observacoes && (
        <div className="bg-white rounded-xl shadow-md border border-[#E5E5E5] p-6">
          <h2 className="text-lg font-semibold text-[#2E2E2E] mb-3">Observações</h2>
          <p className="text-sm text-[#4C4C4C] whitespace-pre-wrap">{pedido.observacoes}</p>
        </div>
      )}

      {/* ITENS DO PEDIDO */}
      <div className="bg-white rounded-xl shadow-md border border-[#E5E5E5] p-6">
        <h2 className="text-lg font-semibold text-[#2E2E2E] mb-4">
          Itens do Pedido ({pedido.total_itens})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F3F3F3]">
              <tr>
                <th className="p-3 text-left">Descrição</th>
                <th className="p-3 text-left">Código</th>
                <th className="p-3 text-left">Quantidade</th>
                <th className="p-3 text-left">Unidade</th>
                <th className="p-3 text-left">Preço Unitário</th>
                <th className="p-3 text-left">Total</th>
              </tr>
            </thead>
            <tbody>
              {pedido.itens && pedido.itens.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="p-3">
                    <div>
                      <div className="font-medium">{item.descricao}</div>
                      {item.pricelist_item?.marca && (
                        <div className="text-xs text-[#4C4C4C]">
                          Marca: {item.pricelist_item.marca}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-3 font-mono text-xs">
                    {item.pricelist_item?.codigo || "-"}
                  </td>
                  <td className="p-3">{item.quantidade}</td>
                  <td className="p-3">{item.unidade}</td>
                  <td className="p-3">{formatarValor(item.preco_unitario)}</td>
                  <td className="p-3 font-semibold">{formatarValor(item.preco_total)}</td>
                </tr>
              ))}
              {(!pedido.itens || pedido.itens.length === 0) && (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-[#4C4C4C]">
                    Nenhum item adicionado ao pedido
                  </td>
                </tr>
              )}
            </tbody>
            {pedido.itens && pedido.itens.length > 0 && (
              <tfoot className="bg-[#F3F3F3]">
                <tr>
                  <td colSpan={5} className="p-3 text-right font-semibold">
                    TOTAL:
                  </td>
                  <td className="p-3 font-bold text-[#F25C26]">
                    {formatarValor(pedido.valor_total)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* AUDITORIA */}
      <div className="bg-white rounded-xl shadow-md border border-[#E5E5E5] p-6">
        <h2 className="text-lg font-semibold text-[#2E2E2E] mb-3">Informações de Auditoria</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-[#4C4C4C]">
          <div>
            <span>Criado em:</span>
            <span className="ml-2">{formatarData(pedido.created_at)}</span>
          </div>
          <div>
            <span>Atualizado em:</span>
            <span className="ml-2">{formatarData(pedido.updated_at)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
