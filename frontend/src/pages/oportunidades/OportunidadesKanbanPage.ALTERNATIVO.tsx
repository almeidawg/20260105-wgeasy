import { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { supabase } from "@/lib/supabaseClient";
import { OportunidadeModal } from "@/components/oportunidades/OportunidadeModal";
import { ESTAGIOS, type Estagio, CORES_NUCLEOS, type Nucleo } from "@/constants/oportunidades";
import { formatarData } from "@/utils/formatadores";

type Oportunidade = {
  id: string;
  titulo: string;
  estagio: Estagio;
  valor_estimado: number | null;
  previsao_fechamento: string | null;
  origem: string | null;
  descricao: string | null;
  observacoes: string | null;
  clientes?: { id: string; nome: string } | null;
  nucleos?: Array<{ nucleo: Nucleo; valor: number | null }>;
};

export default function OportunidadesKanbanPage() {
  const [oportunidades, setOportunidades] = useState<Oportunidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecionada, setSelecionada] = useState<Oportunidade | null>(null);

  async function carregarOportunidades() {
    setLoading(true);

    // ABORDAGEM ALTERNATIVA: Duas queries separadas
    // Isso funciona mesmo se o cache do Supabase não reconhecer a FK

    // Query 1: Buscar todas as oportunidades
    const { data: oportData, error: oportError } = await supabase
      .from("oportunidades")
      .select("*")
      .order("criado_em", { ascending: false });

    if (oportError) {
      console.error("Erro ao carregar oportunidades", oportError);
      setLoading(false);
      return;
    }

    // Query 2: Buscar todos os clientes relevantes
    const clienteIds = (oportData || [])
      .map((op: any) => op.cliente_id)
      .filter((id: any) => id != null);

    let clientesMap: Record<string, { id: string; nome: string }> = {};

    if (clienteIds.length > 0) {
      const { data: clientesData } = await supabase
        .from("pessoas")
        .select("id, nome")
        .in("id", clienteIds);

      if (clientesData) {
        clientesMap = clientesData.reduce((acc: any, cliente: any) => {
          acc[cliente.id] = cliente;
          return acc;
        }, {});
      }
    }

    // Query 3: Buscar núcleos para cada oportunidade
    const { data: nucleosData } = await supabase
      .from("oportunidades_nucleos")
      .select("oportunidade_id, nucleo, valor");

    // Combinar todos os dados no código
    const oportunidadesComDados = (oportData || []).map((op: any) => ({
      ...op,
      clientes: op.cliente_id ? clientesMap[op.cliente_id] : null,
      nucleos: nucleosData?.filter((n: any) => n.oportunidade_id === op.id) || [],
    }));

    setOportunidades(oportunidadesComDados as Oportunidade[]);
    setLoading(false);
  }

  useEffect(() => {
    carregarOportunidades();
  }, []);

  async function atualizarEstagio(id: string, novoEstagio: Estagio) {
    // Atualização otimista
    setOportunidades((prev) =>
      prev.map((op) =>
        op.id === id ? { ...op, estagio: novoEstagio } : op
      )
    );

    // Registrar no histórico
    const oportAnterior = oportunidades.find((op) => op.id === id);
    if (oportAnterior && oportAnterior.estagio !== novoEstagio) {
      await supabase.from("oportunidades_historico").insert({
        oportunidade_id: id,
        estagio_anterior: oportAnterior.estagio,
        estagio_novo: novoEstagio,
        observacao: `Movido via Kanban`,
      });
    }

    const { error } = await supabase
      .from("oportunidades")
      .update({ estagio: novoEstagio })
      .eq("id", id);

    if (error) {
      console.error("Erro ao atualizar estágio", error);
      carregarOportunidades();
    }
  }

  function onDragEnd(result: DropResult) {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    const origem = source.droppableId as Estagio;
    const destino = destination.droppableId as Estagio;

    if (origem === destino) return;

    atualizarEstagio(draggableId, destino);
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A1A1A] mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando oportunidades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg md:text-xl font-semibold text-[#1A1A1A]">
            Pipeline de Oportunidades
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Arraste os cards para alterar o estágio
          </p>
        </div>

        <button
          onClick={() => (window.location.href = "/oportunidades/novo")}
          className="px-4 py-2 bg-[#1A1A1A] text-white rounded-lg text-sm hover:bg-black transition-all shadow-sm hover:shadow-md"
        >
          + Nova Oportunidade
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {ESTAGIOS.map((estagio) => {
            const col = oportunidades.filter((op) => op.estagio === estagio);

            return (
              <Droppable droppableId={estagio} key={estagio}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`bg-[#F9F9F9] border rounded-xl p-3 flex flex-col transition-all min-h-[200px] ${
                      snapshot.isDraggingOver
                        ? "bg-white border-[#C9A86A] shadow-lg"
                        : "border-[#E5E5E5]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                      <h2 className="text-xs font-bold uppercase tracking-wide text-[#2E2E2E]">
                        {estagio}
                      </h2>
                      <span className="text-xs font-semibold bg-[#1A1A1A] text-white px-2 py-0.5 rounded-full">
                        {col.length}
                      </span>
                    </div>

                    <div className="flex flex-col gap-3 flex-1">
                      {col.map((op, idx) => (
                        <Draggable
                          key={op.id}
                          draggableId={op.id}
                          index={idx}
                        >
                          {(prov, snap) => (
                            <button
                              ref={prov.innerRef}
                              {...prov.draggableProps}
                              {...prov.dragHandleProps}
                              onClick={() => setSelecionada(op)}
                              className={`w-full text-left p-3 bg-white rounded-lg shadow-sm hover:shadow-lg transition-all border border-gray-100 ${
                                snap.isDragging ? "ring-2 ring-[#C9A86A] shadow-2xl" : ""
                              }`}
                            >
                              <div className="text-sm font-semibold line-clamp-2 text-[#1A1A1A] mb-1">
                                {op.titulo}
                              </div>

                              <div className="text-xs text-gray-500 mb-2">
                                {op.clientes?.nome ?? "Cliente não informado"}
                              </div>

                              {/* Núcleos */}
                              {op.nucleos && op.nucleos.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {op.nucleos.map((n, i) => {
                                    const cores = CORES_NUCLEOS[n.nucleo as Nucleo];
                                    return (
                                      <span
                                        key={i}
                                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                        style={{
                                          backgroundColor: cores.secondary,
                                          color: cores.text,
                                          border: `1px solid ${cores.border}`,
                                        }}
                                      >
                                        {n.nucleo}
                                      </span>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Valor e Data */}
                              <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-gray-100">
                                {op.valor_estimado != null ? (
                                  <div className="font-bold text-[#1A1A1A]">
                                    R$ {op.valor_estimado.toLocaleString("pt-BR")}
                                  </div>
                                ) : (
                                  <div className="text-gray-400">Sem valor</div>
                                )}

                                {op.previsao_fechamento && (
                                  <div className="text-gray-500 text-[10px]">
                                    📅 {formatarData(op.previsao_fechamento)}
                                  </div>
                                )}
                              </div>
                            </button>
                          )}
                        </Draggable>
                      ))}

                      {provided.placeholder}

                      {col.length === 0 && (
                        <div className="text-center text-gray-400 text-xs py-8">
                          Nenhuma oportunidade
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

      {selecionada && (
        <OportunidadeModal
          oportunidade={selecionada}
          onClose={() => setSelecionada(null)}
          onUpdated={carregarOportunidades}
          onChangeStage={atualizarEstagio}
        />
      )}
    </div>
  );
}
