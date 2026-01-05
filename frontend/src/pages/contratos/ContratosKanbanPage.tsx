import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Edit2, Trash2, LayoutGrid, Kanban } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import Avatar from "@/components/common/Avatar";
import { formatarData, formatarValor } from "@/types/contratos";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

type StatusContrato =
  | "rascunho"
  | "aguardando_assinatura"
  | "ativo"
  | "concluido"
  | "cancelado";

const ESTAGIOS: StatusContrato[] = [
  "rascunho",
  "aguardando_assinatura",
  "ativo",
  "concluido",
  "cancelado",
];

const ESTAGIOS_LABELS: Record<StatusContrato, string> = {
  rascunho: "Rascunho",
  aguardando_assinatura: "Aguardando",
  ativo: "Ativo",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

const ESTAGIOS_CORES: Record<StatusContrato, string> = {
  rascunho: "#9CA3AF",
  aguardando_assinatura: "#F59E0B",
  ativo: "#3B82F6",
  concluido: "#10B981",
  cancelado: "#EF4444",
};

type Contrato = {
  id: string;
  numero: string;
  cliente_id: string | null;
  cliente_nome?: string;
  cliente_avatar_url?: string | null;
  cliente_foto_url?: string | null;
  valor_total: number;
  status: StatusContrato;
  unidade_negocio: string;
  data_inicio: string | null;
  data_previsao_termino: string | null;
  created_at: string;
};

type ViewMode = "kanban" | "cards";

export default function ContratosKanbanPage() {
  const navigate = useNavigate();
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(true);
  const [contratoParaExcluir, setContratoParaExcluir] = useState<Contrato | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");

  async function carregarContratos() {
    setLoading(true);

    // Query 1: Buscar todos os contratos
    const { data: contratosData, error } = await supabase
      .from("contratos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao carregar contratos", error);
      setLoading(false);
      return;
    }

    // Query 2: Buscar clientes
    const clienteIds = (contratosData || [])
      .map((c: any) => c.cliente_id)
      .filter((id: any) => id != null);

    let clientesMap: Record<string, { id: string; nome: string; avatar_url?: string | null; foto_url?: string | null }> = {};

    if (clienteIds.length > 0) {
      const { data: clientesData } = await supabase
        .from("pessoas")
        .select("id, nome, avatar_url, foto_url")
        .in("id", clienteIds);

      if (clientesData) {
        clientesMap = clientesData.reduce((acc: any, cliente: any) => {
          acc[cliente.id] = cliente;
          return acc;
        }, {});
      }
    }

    // Combinar dados
    const contratosComDados = (contratosData || []).map((c: any) => ({
      ...c,
      cliente_nome: c.cliente_id ? clientesMap[c.cliente_id]?.nome : null,
      cliente_avatar_url: c.cliente_id ? clientesMap[c.cliente_id]?.avatar_url : null,
      cliente_foto_url: c.cliente_id ? clientesMap[c.cliente_id]?.foto_url : null,
    }));

    setContratos(contratosComDados as Contrato[]);
    setLoading(false);
  }

  useEffect(() => {
    carregarContratos();
  }, []);

  async function atualizarStatus(id: string, novoStatus: StatusContrato) {
    // Guardar status anterior para rollback
    const contratoAnterior = contratos.find(c => c.id === id);
    const statusAnterior = contratoAnterior?.status;

    // Atualização otimista
    setContratos((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: novoStatus } : c))
    );

    const { error } = await supabase
      .from("contratos")
      .update({ status: novoStatus })
      .eq("id", id);

    if (error) {
      console.error("Erro ao atualizar status", error);

      // Rollback para status anterior
      if (statusAnterior) {
        setContratos((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: statusAnterior } : c))
        );
      }

      // Mensagem de erro mais amigável
      if (error.code === 'PGRST301' || error.message?.includes('policy')) {
        alert("Você não tem permissão para alterar o status deste contrato.");
      } else if (error.code === '23514' || error.message?.includes('check')) {
        alert("Não é possível alterar para este status. Verifique as regras de negócio.");
      } else {
        alert(`Erro ao atualizar status: ${error.message || 'Erro de conexão'}`);
      }
    }
  }

  async function deletarContrato() {
    if (!contratoParaExcluir) return;

    try {
      const { error } = await supabase
        .from("contratos")
        .delete()
        .eq("id", contratoParaExcluir.id);

      if (error) {
        console.error("Erro ao deletar contrato:", error);
        alert("Erro ao excluir contrato: " + error.message);
        return;
      }

      // Atualizar estado local
      setContratos((prev) => prev.filter((c) => c.id !== contratoParaExcluir.id));
      setContratoParaExcluir(null);
    } catch (error) {
      console.error("Erro ao deletar contrato:", error);
      alert("Erro ao excluir contrato");
    }
  }

  function onDragEnd(result: DropResult) {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    const origem = source.droppableId as StatusContrato;
    const destino = destination.droppableId as StatusContrato;

    if (origem === destino) return;

    atualizarStatus(draggableId, destino);
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6] mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando contratos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {/* Seletores de Visualização */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-2 rounded-md transition-all ${
                viewMode === "kanban"
                  ? "bg-white text-[#3B82F6] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              title="Visualização Kanban"
            >
              <Kanban size={18} />
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`p-2 rounded-md transition-all ${
                viewMode === "cards"
                  ? "bg-white text-[#3B82F6] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              title="Visualização em Cards"
            >
              <LayoutGrid size={18} />
            </button>
          </div>

          <div>
            <h1 className="text-lg md:text-xl font-semibold text-[#1A1A1A]">
              Contratos
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {viewMode === "kanban" ? "Arraste os cards para alterar o status" : "Visualização em blocos de cards"}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/contratos/novo")}
          className="px-4 py-2 bg-[#3B82F6] text-white rounded-lg text-sm hover:bg-[#2563EB] transition-all shadow-sm hover:shadow-md"
        >
          + Novo Contrato
        </button>
      </div>

      {/* VISUALIZAÇÃO KANBAN */}
      {viewMode === "kanban" && (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
            {ESTAGIOS.map((estagio) => {
              const col = contratos.filter((c) => c.status === estagio);
              const cor = ESTAGIOS_CORES[estagio];

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

                      <div className="flex flex-col gap-3 flex-1">
                        {col.map((contrato, idx) => (
                          <Draggable
                            key={contrato.id}
                            draggableId={contrato.id}
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
                                {/* Header com Avatar e Botões Ação */}
                                <div className="flex items-center justify-between p-3 pb-2 border-b border-gray-100">
                                  <div className="flex items-center gap-2">
                                    <Avatar
                                      nome={contrato.cliente_nome ?? "Cliente"}
                                      avatar_url={contrato.cliente_avatar_url}
                                      foto_url={contrato.cliente_foto_url}
                                      tamanho={28}
                                    />
                                    <span className="text-xs text-gray-600 font-medium truncate">
                                      {contrato.cliente_nome ?? "Não informado"}
                                    </span>
                                  </div>
                                  <div className="flex gap-1">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/contratos/editar/${contrato.id}`);
                                      }}
                                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                                      title="Editar contrato"
                                    >
                                      <Edit2 size={14} className="text-gray-500" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setContratoParaExcluir(contrato);
                                      }}
                                      className="p-1 hover:bg-red-50 rounded transition-colors"
                                      title="Excluir contrato"
                                    >
                                      <Trash2 size={14} className="text-red-600" />
                                    </button>
                                  </div>
                                </div>

                                {/* Conteúdo do Card */}
                                <button
                                  type="button"
                                  onClick={() => navigate(`/contratos/${contrato.id}`)}
                                  className="w-full text-left p-3"
                                >
                                  {/* Número do Contrato */}
                                  <div className="text-sm font-bold text-[#1A1A1A] mb-1">
                                    {contrato.numero}
                                  </div>

                                  {/* Data e Hora de Criação */}
                                  <div className="text-[10px] text-gray-400 mb-2">
                                    Criado em {new Date(contrato.created_at).toLocaleDateString('pt-BR', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric'
                                    })} às {new Date(contrato.created_at).toLocaleTimeString('pt-BR', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </div>

                                  {/* Unidade de Negócio com Cor */}
                                  <div className="mb-2">
                                    <span
                                      className="px-2 py-1 rounded-full text-xs font-semibold text-white capitalize"
                                      style={{
                                        backgroundColor:
                                          contrato.unidade_negocio?.toLowerCase() === 'arquitetura' ? '#5E9B94' :
                                          contrato.unidade_negocio?.toLowerCase() === 'engenharia' ? '#2B4580' :
                                          contrato.unidade_negocio?.toLowerCase() === 'marcenaria' ? '#8B5E3C' :
                                          '#6B7280'
                                      }}
                                    >
                                      {contrato.unidade_negocio || 'Não definido'}
                                    </span>
                                  </div>

                                  {/* Valor */}
                                  <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-gray-100">
                                    <div className="font-bold text-[#1A1A1A]">
                                      {formatarValor(contrato.valor_total)}
                                    </div>
                                    {contrato.data_previsao_termino && (
                                      <div className="text-gray-500 text-[10px]">
                                        📅 {formatarData(contrato.data_previsao_termino)}
                                      </div>
                                    )}
                                  </div>
                                </button>
                              </div>
                            )}
                          </Draggable>
                        ))}

                        {provided.placeholder}

                        {col.length === 0 && (
                          <div className="text-center text-gray-400 text-xs py-8">
                            Nenhum contrato
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
      )}

      {/* VISUALIZAÇÃO EM CARDS/BLOCOS */}
      {viewMode === "cards" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {contratos.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 text-sm">Nenhum contrato encontrado</div>
            </div>
          ) : (
            contratos.map((contrato) => {
              const cor = ESTAGIOS_CORES[contrato.status];
              return (
                <div
                  key={contrato.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all overflow-hidden"
                >
                  {/* Header com Avatar */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Avatar
                        nome={contrato.cliente_nome ?? "Cliente"}
                        avatar_url={contrato.cliente_avatar_url}
                        foto_url={contrato.cliente_foto_url}
                        tamanho={40}
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-900 block">
                          {contrato.cliente_nome ?? "Cliente não informado"}
                        </span>
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: `${cor}20`, color: cor }}
                        >
                          {ESTAGIOS_LABELS[contrato.status]}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => navigate(`/contratos/editar/${contrato.id}`)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        title="Editar contrato"
                      >
                        <Edit2 size={16} className="text-gray-500" />
                      </button>
                      <button
                        onClick={() => setContratoParaExcluir(contrato)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir contrato"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <button
                    onClick={() => navigate(`/contratos/${contrato.id}`)}
                    className="w-full text-left p-4"
                  >
                    {/* Número do Contrato */}
                    <h3 className="text-base font-bold text-[#1A1A1A] mb-2">
                      {contrato.numero}
                    </h3>

                    {/* Data de Criação */}
                    <div className="text-xs text-gray-400 mb-3">
                      Criado em {new Date(contrato.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </div>

                    {/* Unidade de Negócio */}
                    <div className="mb-3">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold text-white capitalize"
                        style={{
                          backgroundColor:
                            contrato.unidade_negocio?.toLowerCase() === 'arquitetura' ? '#5E9B94' :
                            contrato.unidade_negocio?.toLowerCase() === 'engenharia' ? '#2B4580' :
                            contrato.unidade_negocio?.toLowerCase() === 'marcenaria' ? '#8B5E3C' :
                            '#6B7280'
                        }}
                      >
                        {contrato.unidade_negocio || 'Não definido'}
                      </span>
                    </div>

                    {/* Valor e Data */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="text-lg font-bold text-[#1A1A1A]">
                        {formatarValor(contrato.valor_total)}
                      </div>
                      {contrato.data_previsao_termino && (
                        <div className="text-xs text-gray-500">
                          📅 {formatarData(contrato.data_previsao_termino)}
                        </div>
                      )}
                    </div>
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {contratoParaExcluir && (
        <ConfirmDialog
          isOpen={true}
          title="Excluir Contrato?"
          message={`Deseja realmente excluir o contrato "${contratoParaExcluir.numero}"? Esta ação não poderá ser desfeita e todos os dados relacionados serão perdidos.`}
          confirmLabel="Excluir"
          cancelLabel="Cancelar"
          type="danger"
          onConfirm={deletarContrato}
          onCancel={() => setContratoParaExcluir(null)}
        />
      )}
    </div>
  );
}
