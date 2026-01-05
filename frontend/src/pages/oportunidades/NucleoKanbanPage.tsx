import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Plus, Edit2, Trash2, ArrowLeft, LayoutDashboard, Columns } from "lucide-react";
import { supabaseRaw as supabase } from "@/lib/supabaseClient";
import { OportunidadeModal } from "@/components/oportunidades/OportunidadeModal";
import { CORES_NUCLEOS, type Nucleo } from "@/constants/oportunidades";
import { formatarMoeda, formatarData } from "@/utils/formatadores";
import Avatar from "@/components/common/Avatar";
import type { OportunidadeChecklistResumo } from "@/types/oportunidadesChecklist";

type Coluna = {
  id: string;
  titulo: string;
  ordem: number;
  cor: string;
};

type Oportunidade = {
  id: string;
  titulo: string;
  valor_estimado: number | null;
  previsao_fechamento: string | null;
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
  posicao?: {
    coluna_id: string;
    ordem: number;
  };
  checklist_resumo?: OportunidadeChecklistResumo | null;
};

type ModoVisual = "moderno" | "classico";
const VISUAL_STORAGE_KEY = "wg-kanban-modo-visual";

// Detectar se é mobile (largura < 768px)
function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768;
}

export default function NucleoKanbanPage() {
  const { nucleo } = useParams<{ nucleo: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Detectar núcleo da URL (funciona com /oportunidades/kanban/:nucleo e /:nucleo/kanban)
  let nucleoDetectado = nucleo;
  if (!nucleoDetectado) {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    if (pathSegments[0] === 'arquitetura' || pathSegments[0] === 'engenharia' || pathSegments[0] === 'marcenaria') {
      nucleoDetectado = pathSegments[0];
    }
  }

  // Normalizar nome do núcleo (primeira letra maiúscula)
  const slug = nucleoDetectado ?? "arquitetura";
  const nucleoNormalizado = (slug.charAt(0).toUpperCase() + slug.slice(1)) as Nucleo;

  const [colunas, setColunas] = useState<Coluna[]>([]);
  const [oportunidades, setOportunidades] = useState<Oportunidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecionada, setSelecionada] = useState<Oportunidade | null>(null);
  const [editandoColunaId, setEditandoColunaId] = useState<string | null>(null);
  const [novoTituloColuna, setNovoTituloColuna] = useState("");
  const [modoVisual, setModoVisual] = useState<ModoVisual>(() => {
    if (typeof window === "undefined") return "moderno";
    // No mobile, sempre iniciar com modo clássico (lista)
    if (isMobileDevice()) return "classico";
    // No desktop, respeitar a preferência salva
    const stored = window.localStorage.getItem(VISUAL_STORAGE_KEY);
    return stored === "classico" ? "classico" : "moderno";
  });

  const cores = CORES_NUCLEOS[nucleoNormalizado];

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(VISUAL_STORAGE_KEY, modoVisual);
    }
  }, [modoVisual]);

  // Carregar colunas do núcleo
  async function carregarColunas() {
    const { data, error } = await supabase
      .from("nucleos_colunas")
      .select("*")
      .eq("nucleo", nucleoNormalizado)
      .order("ordem", { ascending: true });

    if (error) {
      console.error("Erro ao carregar colunas:", error);
      return;
    }

    setColunas(data || []);
  }

  // Carregar oportunidades posicionadas neste núcleo
  async function carregarOportunidades() {
    setLoading(true);

    // Query 1: Buscar posições das oportunidades neste núcleo
    const { data: posicoesData, error: posicoesError } = await supabase
      .from("nucleos_oportunidades_posicoes")
      .select("oportunidade_id, coluna_id, ordem")
      .eq("nucleo", nucleoNormalizado);

    if (posicoesError) {
      console.error("Erro ao carregar posições:", posicoesError);
      setLoading(false);
      return;
    }

    if (!posicoesData || posicoesData.length === 0) {
      setOportunidades([]);
      setLoading(false);
      return;
    }

    const oportIds = posicoesData.map((p: any) => p.oportunidade_id);

    // Query 2: Buscar dados das oportunidades
    const { data: oportData, error: oportError } = await supabase
      .from("oportunidades")
      .select("*")
      .in("id", oportIds);

    if (oportError) {
      console.error("Erro ao carregar oportunidades:", oportError);
      setLoading(false);
      return;
    }

    // Query 3: Buscar clientes com avatares
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

    // Resumo de checklist por oportunidade
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

    // Combinar dados
    const posicoesMap = posicoesData.reduce((acc: any, pos: any) => {
      acc[pos.oportunidade_id] = {
        coluna_id: pos.coluna_id,
        ordem: pos.ordem,
      };
      return acc;
    }, {});

    const oportunidadesComDados = (oportData || []).map((op: any) => ({
      ...op,
      clientes: op.cliente_id ? clientesMap[op.cliente_id] : null,
      posicao: posicoesMap[op.id],
      checklist_resumo: checklistMap[op.id] || null,
    }));

    setOportunidades(oportunidadesComDados as Oportunidade[]);
    setLoading(false);
  }

  useEffect(() => {
    carregarColunas();
    carregarOportunidades();
  }, [nucleoNormalizado]);

  // Criar nova coluna
  async function criarColuna() {
    const novaOrdem = colunas.length;
    const { data, error } = await supabase
      .from("nucleos_colunas")
      .insert({
        nucleo: nucleoNormalizado,
        titulo: `Nova Coluna ${novaOrdem + 1}`,
        ordem: novaOrdem,
        cor: cores.secondary,
      })
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar coluna:", error);
      alert("Erro ao criar coluna: " + error.message);
      return;
    }

    setColunas([...colunas, data]);
  }

  // Atualizar título da coluna
  async function atualizarTituloColuna(colunaId: string, novoTitulo: string) {
    if (!novoTitulo.trim()) {
      alert("O título não pode estar vazio");
      return;
    }

    const { error } = await supabase
      .from("nucleos_colunas")
      .update({ titulo: novoTitulo })
      .eq("id", colunaId);

    if (error) {
      console.error("Erro ao atualizar coluna:", error);
      alert("Erro ao atualizar coluna: " + error.message);
      return;
    }

    setColunas((prev) =>
      prev.map((col) =>
        col.id === colunaId ? { ...col, titulo: novoTitulo } : col
      )
    );
    setEditandoColunaId(null);
    setNovoTituloColuna("");
  }

  // Deletar coluna
  async function deletarColuna(colunaId: string) {
    // Verificar se há oportunidades na coluna
    const oportNaColuna = oportunidades.filter(
      (op) => op.posicao?.coluna_id === colunaId
    );

    if (oportNaColuna.length > 0) {
      alert(
        `Não é possível deletar esta coluna pois há ${oportNaColuna.length} oportunidade(s) nela. ` +
          `Mova as oportunidades para outra coluna antes de deletar.`
      );
      return;
    }

    if (!confirm("Tem certeza que deseja deletar esta coluna?")) {
      return;
    }

    const { error } = await supabase
      .from("nucleos_colunas")
      .delete()
      .eq("id", colunaId);

    if (error) {
      console.error("Erro ao deletar coluna:", error);
      alert("Erro ao deletar coluna: " + error.message);
      return;
    }

    setColunas((prev) => prev.filter((col) => col.id !== colunaId));
  }

  async function deletarOportunidade(oportunidadeId: string) {
    try {
      // IMPORTANTE: Deletar apenas a posição no kanban deste núcleo específico
      // A oportunidade continua existindo em outros núcleos
      const { error } = await supabase
        .from("nucleos_oportunidades_posicoes")
        .delete()
        .eq("oportunidade_id", oportunidadeId)
        .eq("nucleo", nucleoNormalizado);

      if (error) {
        console.error("Erro ao remover oportunidade do núcleo:", error);
        alert("Erro ao remover oportunidade: " + error.message);
        return;
      }

      // Atualizar estado local - remove apenas da visualização deste núcleo
      setOportunidades((prev) => prev.filter((op) => op.id !== oportunidadeId));
      setSelecionada(null);
    } catch (error) {
      console.error("Erro ao remover oportunidade:", error);
      alert("Erro ao remover oportunidade do núcleo");
    }
  }

  // Drag and Drop
  async function onDragEnd(result: DropResult) {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const oportunidadeId = draggableId;
    const novaColunaId = destination.droppableId;

    // Atualizar no banco
    const { error } = await supabase
      .from("nucleos_oportunidades_posicoes")
      .update({
        coluna_id: novaColunaId,
        ordem: destination.index,
      })
      .eq("oportunidade_id", oportunidadeId)
      .eq("nucleo", nucleoNormalizado);

    if (error) {
      console.error("Erro ao mover card:", error);
      alert("Erro ao mover card: " + error.message);
      return;
    }

    // Atualizar localmente
    setOportunidades((prev) =>
      prev.map((op) =>
        op.id === oportunidadeId
          ? {
              ...op,
              posicao: { coluna_id: novaColunaId, ordem: destination.index },
            }
          : op
      )
    );
  }

  // Obter oportunidades de uma coluna
  function getOportunidadesDaColuna(colunaId: string): Oportunidade[] {
    return oportunidades
      .filter((op) => op.posicao?.coluna_id === colunaId)
      .sort((a, b) => (a.posicao?.ordem || 0) - (b.posicao?.ordem || 0));
  }

  const renderOportunidadeCard = (
    oport: Oportunidade,
    index: number,
    variant: ModoVisual
  ) => {
    const isModerno = variant === "moderno";
    const baseCardClass = isModerno
      ? "bg-white p-3 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
      : "bg-neutral-50 border border-gray-200 rounded-xl p-4 text-left hover:border-gray-400 transition";

    return (
      <Draggable key={oport.id} draggableId={oport.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={() => setSelecionada(oport)}
            className={`${baseCardClass} ${
              snapshot.isDragging ? "opacity-70" : ""
            }`}
          >
            <h4 className="font-semibold text-sm mb-2 text-gray-900">
              {oport.titulo}
            </h4>

            {oport.checklist_resumo &&
              oport.checklist_resumo.total_checklist > 0 && (
                <div className="mb-2">
                  <div className="flex justify-between text-[10px] text-gray-500">
                    <span>Checklist</span>
                    <span>
                      {oport.checklist_resumo.checklist_concluidos}/
                      {oport.checklist_resumo.total_checklist} (
                      {oport.checklist_resumo.percentual_concluido}%)
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#F25C26] to-[#d94e1f]"
                      style={{
                        width: `${oport.checklist_resumo.percentual_concluido}%`,
                      }}
                    />
                  </div>
                  {oport.checklist_resumo.obrigatorios_pendentes > 0 && (
                    <div className="text-[10px] text-red-600 mt-1">
                      {oport.checklist_resumo.obrigatorios_pendentes}{" "}
                      obrigat┴io(s) pendente(s)
                    </div>
                  )}
                </div>
              )}

            {oport.clientes && (
              <div className="flex items-center gap-2 mb-2">
                <Avatar
                  nome={oport.clientes.nome}
                  avatar_url={oport.clientes.avatar_url}
                  foto_url={oport.clientes.foto_url}
                  avatar={oport.clientes.avatar}
                  size={26}
                />
                <span className="text-xs text-gray-600">
                  {oport.clientes.nome}
                </span>
              </div>
            )}

            {oport.valor_estimado && (
              <p className="text-sm font-medium text-green-700">
                {formatarMoeda(oport.valor_estimado)}
              </p>
            )}

            {oport.previsao_fechamento && (
              <p className="text-xs text-gray-500 mt-1">
                Previs釅: {formatarData(oport.previsao_fechamento)}
              </p>
            )}
          </div>
        )}
      </Draggable>
    );
  };

  const renderColuna = (coluna: Coluna, variant: ModoVisual) => {
    const oportsDaColuna = getOportunidadesDaColuna(coluna.id);
    const isModerno = variant === "moderno";

    const containerClass = isModerno
      ? "flex-shrink-0 w-80 flex flex-col rounded-lg shadow-sm"
      : "flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm";
    const headerClass = isModerno
      ? "p-3 flex items-center justify-between border-b border-gray-300"
      : "px-4 py-3 flex items-center justify-between border-b border-gray-100 bg-gray-50 rounded-t-2xl";
    const baseDroppableClass = isModerno
      ? "flex-1 p-3 space-y-3 overflow-y-auto"
      : "flex-1 px-4 py-4 space-y-3 bg-white";
    const activeDroppableClass = isModerno
      ? "bg-gray-100"
      : "ring-1 ring-gray-200 bg-gray-50";

    return (
      <div
        key={coluna.id}
        className={containerClass}
        style={isModerno ? { backgroundColor: coluna.cor } : undefined}
      >
        <div className={headerClass}>
          <div className="flex items-center gap-2">
            {!isModerno && (
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: coluna.cor }}
              />
            )}
            {editandoColunaId === coluna.id ? (
              <input
                type="text"
                className="flex-1 px-2 py-1 border rounded text-sm"
                defaultValue={coluna.titulo}
                autoFocus
                onBlur={(e) =>
                  atualizarTituloColuna(coluna.id, e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    atualizarTituloColuna(coluna.id, e.currentTarget.value);
                  } else if (e.key === "Escape") {
                    setEditandoColunaId(null);
                    setNovoTituloColuna("");
                  }
                }}
              />
            ) : (
              <h3
                className={`font-semibold ${
                  isModerno ? "text-gray-800" : "text-gray-900"
                }`}
              >
                {coluna.titulo}
                <span className="ml-2 text-sm text-gray-600">
                  ({oportsDaColuna.length})
                </span>
              </h3>
            )}
          </div>

          <div className="flex gap-1">
            <button
              onClick={() => {
                setEditandoColunaId(coluna.id);
                setNovoTituloColuna(coluna.titulo);
              }}
              className={`p-1 rounded ${
                isModerno ? "hover:bg-gray-200" : "hover:bg-gray-200"
              }`}
              title="Editar t﹀ulo"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => deletarColuna(coluna.id)}
              className="p-1 hover:bg-red-100 text-red-600 rounded"
              title="Deletar coluna"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <Droppable droppableId={coluna.id}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`${baseDroppableClass} ${
                snapshot.isDraggingOver ? activeDroppableClass : ""
              }`}
              style={{ minHeight: "220px" }}
            >
              {oportsDaColuna.map((oport, index) =>
                renderOportunidadeCard(oport, index, variant)
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div
        className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shadow-md"
        style={{ backgroundColor: cores.primary }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/oportunidades")}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors"
          >
            <ArrowLeft size={24} color="white" />
          </button>
          <h1 className="text-2xl font-bold text-white">
            Kanban - {nucleoNormalizado}
          </h1>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-3 text-white/80">
            <span className="text-[10px] uppercase tracking-[0.35em]">
              Visual
            </span>
            <div className="flex rounded-full bg-white/20 p-1 text-xs sm:text-sm font-semibold">
              <button
                type="button"
                onClick={() => setModoVisual("moderno")}
                aria-pressed={modoVisual === "moderno"}
                className={`flex items-center gap-1 rounded-full px-3 py-1 transition ${
                  modoVisual === "moderno"
                    ? "bg-white text-gray-900 shadow"
                    : "text-white/80"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Imersivo
              </button>
              <button
                type="button"
                onClick={() => setModoVisual("classico")}
                aria-pressed={modoVisual === "classico"}
                className={`flex items-center gap-1 rounded-full px-3 py-1 transition ${
                  modoVisual === "classico"
                    ? "bg-white text-gray-900 shadow"
                    : "text-white/80"
                }`}
              >
                <Columns className="w-4 h-4" />
                Classico
              </button>
            </div>
          </div>
          <button
            onClick={criarColuna}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            <Plus size={20} />
            Nova Coluna
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        {modoVisual === "moderno" ? (
          <div className="flex-1 overflow-x-auto p-4">
            <div className="flex gap-4 h-full">
              {colunas.map((coluna) => renderColuna(coluna, "moderno"))}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-x-auto p-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 min-w-full">
              {colunas.map((coluna) => renderColuna(coluna, "classico"))}
            </div>
          </div>
        )}
      </DragDropContext>

      {/* Modal de Detalhes */}
      {selecionada && (
        <OportunidadeModal
          oportunidade={selecionada}
          onClose={() => setSelecionada(null)}
          onDelete={deletarOportunidade}
        />
      )}
    </div>
  );
}
