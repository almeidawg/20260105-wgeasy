import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Edit2 } from "lucide-react";
import { supabaseRaw as supabase } from "@/lib/supabaseClient";
import Avatar from "@/components/common/Avatar";

type StatusFinanceiro = "previsto" | "pago" | "atrasado" | "cancelado";
type TipoLancamento = "entrada" | "saida";

const ESTAGIOS: StatusFinanceiro[] = ["previsto", "atrasado", "pago", "cancelado"];

const ESTAGIOS_LABELS: Record<StatusFinanceiro, string> = {
  previsto: "Previsto",
  pago: "Pago",
  atrasado: "Atrasado",
  cancelado: "Cancelado",
};

const ESTAGIOS_CORES: Record<StatusFinanceiro, string> = {
  previsto: "#F59E0B",
  pago: "#10B981",
  atrasado: "#EF4444",
  cancelado: "#94A3B8",
};

type LancamentoFinanceiro = {
  id: string;
  descricao: string;
  valor_total: number;
  tipo: TipoLancamento;
  status: StatusFinanceiro;
  vencimento: string;
  data_pagamento: string | null;
  categoria_id: string | null;
  centro_custo: string | null;
  projeto_id: string | null;
  created_at: string;
};

export default function FinanceiroKanbanPage() {
  const navigate = useNavigate();
  const [lancamentos, setLancamentos] = useState<LancamentoFinanceiro[]>([]);
  const [loading, setLoading] = useState(true);

  async function carregarLancamentos() {
    setLoading(true);

    // Range de até 50000 para evitar limite padrão de 1000 do Supabase
    const { data, error } = await supabase
      .from("financeiro_lancamentos")
      .select("*")
      .order("vencimento", { ascending: true })
      .range(0, 49999);

    if (error) {
      console.error("Erro ao carregar lançamentos", error);
      setLoading(false);
      return;
    }

    setLancamentos((data || []) as LancamentoFinanceiro[]);
    setLoading(false);
  }

  useEffect(() => {
    carregarLancamentos();
  }, []);

  async function atualizarStatus(id: string, novoStatus: StatusFinanceiro) {
    // Atualização otimista
    setLancamentos((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: novoStatus } : l))
    );

    const updateData: any = { status: novoStatus };

    // Se marcar como pago, definir data de pagamento
    if (novoStatus === "pago") {
      updateData.data_pagamento = new Date().toISOString().split("T")[0];
    }

    const { error } = await supabase
      .from("financeiro_lancamentos")
      .update(updateData)
      .eq("id", id);

    if (error) {
      console.error("Erro ao atualizar status", error);
      carregarLancamentos();
    }
  }

  function onDragEnd(result: DropResult) {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    const origem = source.droppableId as StatusFinanceiro;
    const destino = destination.droppableId as StatusFinanceiro;

    if (origem === destino) return;

    atualizarStatus(draggableId, destino);
  }

  function formatarValor(valor: number): string {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function formatarData(data: string): string {
    return new Date(data).toLocaleDateString("pt-BR");
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10B981] mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando lançamentos financeiros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg md:text-xl font-semibold text-[#1A1A1A]">
            Financeiro - Kanban
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Arraste os cards para alterar o status
          </p>
        </div>

        <button
          onClick={() => navigate("/financeiro/novo")}
          className="px-4 py-2 bg-[#10B981] text-white rounded-lg text-sm hover:bg-[#059669] transition-all shadow-sm hover:shadow-md"
        >
          + Novo Lançamento
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ESTAGIOS.map((estagio) => {
            const col = lancamentos.filter((l) => l.status === estagio);
            const cor = ESTAGIOS_CORES[estagio];

            // Calcular total da coluna
            const totalColuna = col.reduce((acc, l) => {
              if (l.tipo === "entrada") return acc + l.valor_total;
              return acc - l.valor_total;
            }, 0);

            return (
              <Droppable droppableId={estagio} key={estagio}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`bg-[#F9F9F9] border rounded-xl p-3 flex flex-col transition-all min-h-[200px] ${
                      snapshot.isDraggingOver
                        ? "bg-white shadow-lg"
                        : "border-[#E5E5E5]"
                    }`}
                    style={
                      snapshot.isDraggingOver
                        ? { borderColor: cor }
                        : undefined
                    }
                  >
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                      <h2 className="text-xs font-bold uppercase tracking-wide text-[#2E2E2E]">
                        {ESTAGIOS_LABELS[estagio]}
                      </h2>
                      <span
                        className="text-xs font-semibold text-white px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: cor }}
                      >
                        {col.length}
                      </span>
                    </div>

                    {/* Total da coluna */}
                    <div className="mb-3 pb-2 border-b border-gray-200">
                      <div className="text-xs text-gray-600">Total:</div>
                      <div
                        className="text-sm font-bold"
                        style={{ color: totalColuna >= 0 ? "#10B981" : "#EF4444" }}
                      >
                        {formatarValor(totalColuna)}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 flex-1">
                      {col.map((lancamento, idx) => (
                        <Draggable
                          key={lancamento.id}
                          draggableId={lancamento.id}
                          index={idx}
                        >
                          {(prov, snap) => (
                            <div
                              ref={prov.innerRef}
                              {...prov.draggableProps}
                              {...prov.dragHandleProps}
                              className={`w-full bg-white rounded-lg shadow-sm hover:shadow-lg transition-all border border-gray-100 ${
                                snap.isDragging ? "ring-2 shadow-2xl" : ""
                              }`}
                              style={{
                                ...prov.draggableProps.style,
                                borderColor: snap.isDragging ? cor : undefined,
                              }}
                            >
                              {/* Header com Tipo e Botão Editar */}
                              <div className="flex items-center justify-between p-3 pb-2 border-b border-gray-100">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="text-xs font-semibold px-2 py-0.5 rounded text-white"
                                    style={{
                                      backgroundColor:
                                        lancamento.tipo === "entrada" ? "#10B981" : "#EF4444",
                                    }}
                                  >
                                    {lancamento.tipo === "entrada" ? "ENTRADA" : "SAÍDA"}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/financeiro/editar/${lancamento.id}`);
                                  }}
                                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                                  title="Editar lançamento"
                                >
                                  <Edit2 size={14} className="text-gray-500" />
                                </button>
                              </div>

                              {/* Conteúdo do Card */}
                              <button
                                type="button"
                                onClick={() => navigate(`/financeiro/detalhe/${lancamento.id}`)}
                                className="w-full text-left p-3"
                              >
                                {/* Descrição */}
                                <div className="text-sm font-bold text-[#1A1A1A] mb-2">
                                  {lancamento.descricao}
                                </div>

                                {/* Categoria */}
                                {lancamento.categoria_id && (
                                  <div className="text-xs text-gray-500 mb-2">
                                    📁 {lancamento.categoria_id}
                                  </div>
                                )}

                                {/* Valor e Data */}
                                <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-gray-100">
                                  <div
                                    className="font-bold"
                                    style={{
                                      color: lancamento.tipo === "entrada" ? "#10B981" : "#EF4444",
                                    }}
                                  >
                                    {formatarValor(lancamento.valor_total)}
                                  </div>
                                  <div className="text-gray-500 text-[10px]">
                                    📅 {formatarData(lancamento.vencimento)}
                                  </div>
                                </div>
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))}

                      {provided.placeholder}

                      {col.length === 0 && (
                        <div className="text-center text-gray-400 text-xs py-8">
                          Nenhum lançamento
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
