import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Edit2, Trash2, LayoutGrid, Kanban } from "lucide-react";
import { supabaseRaw as supabase } from "@/lib/supabaseClient";
import { OportunidadeModal } from "@/components/oportunidades/OportunidadeModal";
import { ESTAGIOS, type Estagio, CORES_NUCLEOS, type Nucleo } from "@/constants/oportunidades";
import { formatarData } from "@/utils/formatadores";
import Avatar from "@/components/common/Avatar";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import type { OportunidadeChecklistResumo } from "@/types/oportunidadesChecklist";

type Oportunidade = {
  id: string;
  titulo: string;
  estagio: Estagio;
  valor: number | null; // Campo correto do banco de dados
  valor_estimado?: number | null; // Alias para compatibilidade
  previsao_fechamento: string | null;
  data_fechamento_prevista?: string | null; // Campo correto do banco
  origem: string | null;
  descricao: string | null;
  observacoes: string | null;
  clientes?: {
    id: string;
    nome: string;
    avatar_url?: string | null;
    foto_url?: string | null;
    avatar?: string | null;
  } | null;
  nucleos?: Array<{ nucleo: Nucleo; valor: number | null }>;
  checklist_resumo?: OportunidadeChecklistResumo | null;
};

type ViewMode = "kanban" | "cards";

// Detectar se é mobile (largura < 768px)
function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768;
}

export default function OportunidadesKanbanPage() {
  const navigate = useNavigate();
  const [oportunidades, setOportunidades] = useState<Oportunidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecionada, setSelecionada] = useState<Oportunidade | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [oportunidadeToDelete, setOportunidadeToDelete] = useState<Oportunidade | null>(null);
  // No mobile, iniciar com modo "cards" (lista) para melhor usabilidade
  const [viewMode, setViewMode] = useState<ViewMode>(() =>
    isMobileDevice() ? "cards" : "kanban"
  );

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

    const oportIds = (oportData || []).map((op: any) => op.id);

    // Query 2: Buscar todos os clientes relevantes com avatares
    const clienteIds = (oportData || [])
      .map((op: any) => op.cliente_id)
      .filter((id: any) => id != null);

    let clientesMap: Record<string, { id: string; nome: string; avatar_url?: string | null; foto_url?: string | null; avatar?: string | null }> = {};
    let checklistMap: Record<string, OportunidadeChecklistResumo> = {};

    if (clienteIds.length > 0) {
      const { data: clientesData } = await supabase
        .from("pessoas")
        .select("id, nome, avatar_url, foto_url, avatar")
        .in("id", clienteIds);

      if (clientesData) {
        clientesMap = clientesData.reduce((acc: any, cliente: any) => {
          acc[cliente.id] = cliente;
          return acc;
        }, {});
      }
    }

    // Query 2.1: Resumo de checklist por oportunidade
    if (oportIds.length > 0) {
      const { data: checklistData } = await supabase
        .from("v_oportunidades_checklist_resumo")
        .select(
          "oportunidade_id, total_checklist, checklist_concluidos, percentual_concluido, obrigatorios_pendentes"
        )
        .in("oportunidade_id", oportIds);

      if (checklistData) {
        checklistMap = checklistData.reduce((acc: any, item: any) => {
          acc[item.oportunidade_id] = item;
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
      checklist_resumo: checklistMap[op.id] || null,
    }));

    setOportunidades(oportunidadesComDados as Oportunidade[]);
    setLoading(false);
  }

  useEffect(() => {
    carregarOportunidades();
  }, []);

  // Recarregar quando a página recebe foco (volta da edição)
  useEffect(() => {
    const handleFocus = () => {
      carregarOportunidades();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
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
      return;
    }

    // Se chegou em Fechamento, criar contratos E copiar para Kanbans dos núcleos
    if (novoEstagio === "Fechamento" && oportAnterior) {
      await criarContratosAutomaticamente(oportAnterior);
      await copiarParaKanbansNucleos(id);
    }
  }

  // Criar contratos automaticamente quando oportunidade é fechada
  async function criarContratosAutomaticamente(oportunidade: Oportunidade) {
    try {
      // Buscar núcleos da oportunidade
      const nucleos = oportunidade.nucleos || [];

      if (nucleos.length === 0) {
        console.log("Oportunidade sem núcleos definidos, não será criado contrato");
        return;
      }

      // Buscar dados completos da oportunidade incluindo cliente_id
      const { data: oportCompleta } = await supabase
        .from("oportunidades")
        .select("cliente_id, valor_estimado")
        .eq("id", oportunidade.id)
        .single();

      if (!oportCompleta || !oportCompleta.cliente_id) {
        console.error("Oportunidade sem cliente definido");
        return;
      }

      // Criar um contrato para cada núcleo
      for (const nucleo of nucleos) {
        const contratoData = {
          oportunidade_id: oportunidade.id,
          cliente_id: oportCompleta.cliente_id,
          titulo: oportunidade.titulo,
          descricao: oportunidade.descricao || "",
          unidade_negocio: nucleo.nucleo.toLowerCase() as "arquitetura" | "engenharia" | "marcenaria",
          valor_total: nucleo.valor || oportCompleta.valor_estimado || 0,
          status: "aguardando_assinatura",
          data_inicio: new Date().toISOString().split('T')[0],
        };

        const { error: contratoError } = await supabase
          .from("contratos")
          .insert(contratoData);

        if (contratoError) {
          console.error(`Erro ao criar contrato para ${nucleo.nucleo}:`, contratoError);
        } else {
          console.log(`✅ Contrato criado automaticamente para ${nucleo.nucleo}`);
        }
      }
    } catch (error) {
      console.error("Erro ao criar contratos automaticamente:", error);
    }
  }

  // Copiar cards para Kanbans dos núcleos quando oportunidade chega em Fechamento
  async function copiarParaKanbansNucleos(oportunidadeId: string) {
    try {
      console.log(`🎯 Copiando oportunidade ${oportunidadeId} para Kanbans dos núcleos...`);

      // Buscar núcleos da oportunidade
      const { data: nucleosData, error: nucleosError } = await supabase
        .from("oportunidades_nucleos")
        .select("nucleo")
        .eq("oportunidade_id", oportunidadeId);

      if (nucleosError) {
        console.error("Erro ao buscar núcleos:", nucleosError);
        return;
      }

      if (!nucleosData || nucleosData.length === 0) {
        console.log("⚠️ Oportunidade sem núcleos, não será copiada");
        return;
      }

      // Para cada núcleo, criar posição na primeira coluna
      for (const { nucleo } of nucleosData) {
        // Verificar se já existe posição para este núcleo
        const { data: posicaoExistente } = await supabase
          .from("nucleos_oportunidades_posicoes")
          .select("id")
          .eq("oportunidade_id", oportunidadeId)
          .eq("nucleo", nucleo)
          .single();

        if (posicaoExistente) {
          console.log(`ℹ️ Card já existe no Kanban de ${nucleo}, pulando...`);
          continue;
        }

        // Buscar a primeira coluna (ordem=0) deste núcleo
        const { data: primeiraColuna, error: colunaError } = await supabase
          .from("nucleos_colunas")
          .select("id")
          .eq("nucleo", nucleo)
          .order("ordem", { ascending: true })
          .limit(1)
          .single();

        if (colunaError || !primeiraColuna) {
          console.error(`❌ Erro ao buscar primeira coluna do núcleo ${nucleo}:`, colunaError);
          continue;
        }

        // Criar posição na primeira coluna
        const { error: posicaoError } = await supabase
          .from("nucleos_oportunidades_posicoes")
          .insert({
            oportunidade_id: oportunidadeId,
            nucleo: nucleo,
            coluna_id: primeiraColuna.id,
            ordem: 0,
          });

        if (posicaoError) {
          console.error(`❌ Erro ao criar posição no núcleo ${nucleo}:`, posicaoError);
        } else {
          console.log(`✅ Card copiado para Kanban de ${nucleo}`);
        }
      }

      console.log(`🎉 Oportunidade copiada para ${nucleosData.length} núcleo(s)!`);
    } catch (error) {
      console.error("❌ Erro ao copiar para Kanbans dos núcleos:", error);
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

  function handleDeleteClick(oportunidade: Oportunidade, e: React.MouseEvent) {
    e.stopPropagation();
    setOportunidadeToDelete(oportunidade);
    setConfirmDelete(true);
  }

  async function handleConfirmDelete() {
    if (!oportunidadeToDelete) return;

    try {
      // Deletar núcleos relacionados primeiro
      const { error: nucleosError } = await supabase
        .from("oportunidades_nucleos")
        .delete()
        .eq("oportunidade_id", oportunidadeToDelete.id);

      if (nucleosError) {
        console.error("Erro ao deletar núcleos:", nucleosError);
        alert("Erro ao excluir oportunidade. Tente novamente.");
        return;
      }

      // Deletar posições em kanbans de núcleos
      await supabase
        .from("nucleos_oportunidades_posicoes")
        .delete()
        .eq("oportunidade_id", oportunidadeToDelete.id);

      // Deletar a oportunidade
      const { error: deleteError } = await supabase
        .from("oportunidades")
        .delete()
        .eq("id", oportunidadeToDelete.id);

      if (deleteError) {
        console.error("Erro ao deletar oportunidade:", deleteError);
        alert("Erro ao excluir oportunidade. Tente novamente.");
        return;
      }

      // Remover da lista local
      setOportunidades((prev) =>
        prev.filter((op) => op.id !== oportunidadeToDelete.id)
      );

      // Fechar modal de confirmação
      setConfirmDelete(false);
      setOportunidadeToDelete(null);

      // Feedback de sucesso
      console.log("✅ Oportunidade excluída com sucesso!");
    } catch (error) {
      console.error("Erro inesperado ao excluir:", error);
      alert("Erro ao excluir oportunidade. Tente novamente.");
    }
  }

  function handleCancelDelete() {
    setConfirmDelete(false);
    setOportunidadeToDelete(null);
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
        <div className="flex items-center gap-4">
          {/* Seletores de Visualização */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-2 rounded-md transition-all ${
                viewMode === "kanban"
                  ? "bg-white text-[#F25C26] shadow-sm"
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
                  ? "bg-white text-[#F25C26] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              title="Visualização em Cards"
            >
              <LayoutGrid size={18} />
            </button>
          </div>

          <div>
            <h1 className="text-lg md:text-xl font-semibold text-[#1A1A1A]">
              Pipeline de Oportunidades
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {viewMode === "kanban" ? "Arraste os cards para alterar o estágio" : "Visualização em blocos de cards"}
            </p>
          </div>
        </div>

        <button
          onClick={() => (window.location.href = "/oportunidades/novo")}
          className="px-4 py-2 bg-[#F25C26] text-white rounded-lg text-sm hover:bg-[#D94E1F] transition-all shadow-sm hover:shadow-md"
        >
          + Nova Oportunidade
        </button>
      </div>

      {/* Botões de Acesso aos Kanbans por Núcleo */}
      <div className="mb-6 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-sm font-medium text-gray-700 mb-3">
          📋 Kanbans por Unidade de Negócio
        </h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate("/oportunidades/kanban/arquitetura")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all shadow-sm hover:shadow-md"
            style={{
              backgroundColor: "#5E9B94",
              color: "white",
            }}
          >
            <span>🟩 Arquitetura</span>
          </button>

          <button
            onClick={() => navigate("/oportunidades/kanban/engenharia")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all shadow-sm hover:shadow-md"
            style={{
              backgroundColor: "#2B4580",
              color: "white",
            }}
          >
            <span>🔵 Engenharia</span>
          </button>

          <button
            onClick={() => navigate("/oportunidades/kanban/marcenaria")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all shadow-sm hover:shadow-md"
            style={{
              backgroundColor: "#8B5E3C",
              color: "white",
            }}
          >
            <span>🟫 Marcenaria</span>
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Clique para ver o Kanban específico de cada núcleo com colunas personalizadas
        </p>
      </div>

      {/* VISUALIZAÇÃO KANBAN */}
      {viewMode === "kanban" && (
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
                        <span className="text-xs font-semibold bg-[#F25C26] text-white px-2 py-0.5 rounded-full">
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
                              <div
                                ref={prov.innerRef}
                                {...prov.draggableProps}
                                {...prov.dragHandleProps}
                                className={`w-full bg-white rounded-lg shadow-sm hover:shadow-lg transition-all border border-gray-100 ${
                                  snap.isDragging ? "ring-2 ring-[#C9A86A] shadow-2xl" : ""
                                }`}
                              >
                                {/* Header com Avatar e Botões de Ação */}
                                <div className="flex items-center justify-between p-3 pb-2 border-b border-gray-100">
                                  <div className="flex items-center gap-2">
                                    <Avatar
                                      nome={op.clientes?.nome ?? "Cliente"}
                                      avatar_url={op.clientes?.avatar_url}
                                      foto_url={op.clientes?.foto_url}
                                      avatar={op.clientes?.avatar}
                                      size={28}
                                    />
                                    <span className="text-xs text-gray-600 font-medium">
                                      {op.clientes?.nome ?? "Cliente não informado"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/oportunidades/editar/${op.id}`);
                                      }}
                                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                                      title="Editar oportunidade"
                                    >
                                      <Edit2 size={14} className="text-gray-500" />
                                    </button>
                                    <button
                                      onClick={(e) => handleDeleteClick(op, e)}
                                      className="p-1 hover:bg-red-50 rounded transition-colors"
                                      title="Excluir oportunidade"
                                    >
                                      <Trash2 size={14} className="text-red-600" />
                                    </button>
                                  </div>
                                </div>

                                {/* Conteúdo do Card */}
                                <button
                                  onClick={() => setSelecionada(op)}
                                  className="w-full text-left p-3"
                                >
                                  <div className="text-sm font-semibold line-clamp-2 text-[#1A1A1A] mb-2">
                                    {op.titulo}
                                  </div>

                                  {/* Checklist - progresso */}
                                  {op.checklist_resumo &&
                                    op.checklist_resumo.total_checklist > 0 && (
                                      <div className="mb-2">
                                        <div className="flex justify-between text-[10px] text-gray-500">
                                          <span>Checklist</span>
                                          <span>
                                            {op.checklist_resumo.checklist_concluidos}/
                                            {op.checklist_resumo.total_checklist} (
                                            {op.checklist_resumo.percentual_concluido}%)
                                          </span>
                                        </div>
                                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                          <div
                                            className="h-full bg-gradient-to-r from-[#F25C26] to-[#d94e1f]"
                                            style={{
                                              width: `${op.checklist_resumo.percentual_concluido}%`,
                                            }}
                                          />
                                        </div>
                                        {op.checklist_resumo.obrigatorios_pendentes > 0 && (
                                          <div className="text-[10px] text-red-600 mt-1">
                                            {op.checklist_resumo.obrigatorios_pendentes}{" "}
                                            obrigatório(s) pendente(s)
                                          </div>
                                        )}
                                      </div>
                                    )}

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
                                  {(op.valor != null && op.valor > 0) ? (
                                    <div className="font-bold text-[#1A1A1A]">
                                      R$ {op.valor.toLocaleString("pt-BR")}
                                    </div>
                                  ) : (
                                    <div className="text-gray-400">Sem valor</div>
                                  )}

                                  {(op.data_fechamento_prevista || op.previsao_fechamento) && (
                                    <div className="text-gray-500 text-[10px]">
                                      📅 {formatarData(op.data_fechamento_prevista || op.previsao_fechamento || "")}
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
      )}

      {/* VISUALIZAÇÃO EM CARDS/BLOCOS */}
      {viewMode === "cards" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {oportunidades.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 text-sm">Nenhuma oportunidade encontrada</div>
            </div>
          ) : (
            oportunidades.map((op) => (
              <div
                key={op.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all overflow-hidden"
              >
                {/* Header com Avatar */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <Avatar
                      nome={op.clientes?.nome ?? "Cliente"}
                      avatar_url={op.clientes?.avatar_url}
                      foto_url={op.clientes?.foto_url}
                      avatar={op.clientes?.avatar}
                      size={40}
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900 block">
                        {op.clientes?.nome ?? "Cliente não informado"}
                      </span>
                      <span className="text-xs text-gray-500">{op.estagio}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => navigate(`/oportunidades/editar/${op.id}`)}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      title="Editar oportunidade"
                    >
                      <Edit2 size={16} className="text-gray-500" />
                    </button>
                    <button
                      onClick={() => {
                        setOportunidadeToDelete(op);
                        setConfirmDelete(true);
                      }}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir oportunidade"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </div>
                </div>

                {/* Conteúdo */}
                <button
                  onClick={() => setSelecionada(op)}
                  className="w-full text-left p-4"
                >
                  <h3 className="text-base font-semibold text-[#1A1A1A] mb-3 line-clamp-2">
                    {op.titulo}
                  </h3>

                  {/* Checklist */}
                  {op.checklist_resumo && op.checklist_resumo.total_checklist > 0 && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Checklist</span>
                        <span>
                          {op.checklist_resumo.checklist_concluidos}/{op.checklist_resumo.total_checklist}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#F25C26] to-[#d94e1f]"
                          style={{ width: `${op.checklist_resumo.percentual_concluido}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Núcleos */}
                  {op.nucleos && op.nucleos.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {op.nucleos.map((n, i) => {
                        const cores = CORES_NUCLEOS[n.nucleo as Nucleo];
                        return (
                          <span
                            key={i}
                            className="text-xs font-semibold px-3 py-1 rounded-full"
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
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="text-lg font-bold text-[#1A1A1A]">
                      {(op.valor != null && op.valor > 0)
                        ? `R$ ${op.valor.toLocaleString("pt-BR")}`
                        : "Sem valor"}
                    </div>
                    {(op.data_fechamento_prevista || op.previsao_fechamento) && (
                      <div className="text-xs text-gray-500">
                        📅 {formatarData(op.data_fechamento_prevista || op.previsao_fechamento || "")}
                      </div>
                    )}
                  </div>
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {selecionada && (
        <OportunidadeModal
          oportunidade={selecionada}
          onClose={() => setSelecionada(null)}
          onUpdated={carregarOportunidades}
          onChangeStage={atualizarEstagio}
        />
      )}

      <ConfirmDialog
        isOpen={confirmDelete}
        title="Excluir Oportunidade"
        message={`Tem certeza que deseja excluir a oportunidade "${oportunidadeToDelete?.titulo}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        type="danger"
      />
    </div>
  );
}
