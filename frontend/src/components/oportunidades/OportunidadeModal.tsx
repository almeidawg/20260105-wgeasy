// ============================================================
// COMPONENTE: OportunidadeModal (Padrão WG Easy)
// Usado no Kanban e futuramente na Lista
// ============================================================

import { useState } from "react";
import { ESTAGIOS, type Estagio } from "@/constants/oportunidades";
import OportunidadeCard, {
  OportunidadeUI,
} from "@/components/oportunidades/OportunidadeCard";
import { gerarPdfOportunidade } from "@/utils/gerarPdfOportunidade";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { Trash2 } from "lucide-react";
import CardChecklist from "@/components/checklist/CardChecklist";
import OportunidadeArquivos from "@/components/oportunidades/OportunidadeArquivos";

type OportunidadeModalProps = {
  oportunidade: any;
  onClose: () => void;
  onUpdated?: () => void;
  onChangeStage?: (id: string, novo: Estagio) => Promise<void> | void;
  onDelete?: (id: string) => Promise<void> | void;
};

export function OportunidadeModal({
  oportunidade,
  onClose,
  onUpdated,
  onChangeStage,
  onDelete,
}: OportunidadeModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [dailyTasks, setDailyTasks] = useState<
    { id: string; titulo: string; done: boolean; createdAt: string; createdBy: string }[]
  >(() => {
    try {
      const saved = localStorage.getItem(`op_daily_${oportunidade.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [taskInput, setTaskInput] = useState("");
  const [comments, setComments] = useState<
    { id: string; texto: string; createdAt: string; createdBy: string }[]
  >(() => {
    try {
      const saved = localStorage.getItem(`op_comments_${oportunidade.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [commentDraft, setCommentDraft] = useState("");
  const currentUserName =
    localStorage.getItem("user_name") ||
    localStorage.getItem("usuario_nome") ||
    localStorage.getItem("email") ||
    "Usuário";

  const clienteNormalizado =
    oportunidade.cliente ?? oportunidade.clientes ?? null;

  // Normalizar os dados no formato UI
  const op: OportunidadeUI = {
    id: oportunidade.id,
    titulo: oportunidade.titulo,
    estagio: oportunidade.estagio,
    valor_estimado: oportunidade.valor_estimado,
    previsao_fechamento: oportunidade.previsao_fechamento,
    origem: oportunidade.origem,
    descricao: oportunidade.descricao,
    observacoes: oportunidade.observacoes,
    cliente: clienteNormalizado,
    nucleos: oportunidade.nucleos,
  };

  async function handleStageChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const novo = e.target.value as Estagio;
    if (onChangeStage) {
      await onChangeStage(op.id, novo);
      onUpdated && onUpdated();
    }
  }

  async function handleDeleteConfirm() {
    if (onDelete) {
      await onDelete(op.id);
      onClose();
    }
    setShowDeleteConfirm(false);
  }

  function persistDailyTasks(next: typeof dailyTasks) {
    setDailyTasks(next);
    localStorage.setItem(`op_daily_${op.id}`, JSON.stringify(next));
  }

  function persistComments(next: typeof comments) {
    setComments(next);
    localStorage.setItem(`op_comments_${op.id}`, JSON.stringify(next));
  }

  function handleAddTask() {
    const titulo = taskInput.trim();
    if (!titulo) return;
    const now = new Date().toISOString();
    const next = [
      { id: crypto.randomUUID(), titulo, done: false, createdAt: now, createdBy: currentUserName },
      ...dailyTasks,
    ];
    persistDailyTasks(next);
    setTaskInput("");
  }

  function toggleTask(id: string) {
    const next = dailyTasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
    persistDailyTasks(next);
  }

  function removeTask(id: string) {
    const next = dailyTasks.filter((t) => t.id !== id);
    persistDailyTasks(next);
  }

  function handleAddComment() {
    const texto = commentDraft.trim();
    if (!texto) return;
    const now = new Date().toISOString();
    const next = [
      { id: crypto.randomUUID(), texto, createdAt: now, createdBy: currentUserName },
      ...comments,
    ];
    persistComments(next);
    setCommentDraft("");
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-50">
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-gray-900">
              Detalhes da Oportunidade
            </h2>
            <p className="text-xs text-gray-500">{op.titulo}</p>
          </div>

          <div className="flex items-center gap-2">
            {onDelete && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Excluir oportunidade"
              >
                <Trash2 size={16} />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 text-xs rounded border hover:bg-gray-100"
            >
              Fechar
            </button>
          </div>
        </div>

        {/* SCROLL CONTENT */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid lg:grid-cols-3 gap-3">
            <div className="lg:col-span-2 space-y-3">
              {/* Card Principal */}
              <OportunidadeCard
                oportunidade={op}
                mode="list"
                onPdf={() =>
                  gerarPdfOportunidade({
                    oportunidade: op,
                    cliente: op.cliente,
                  })
                }
              />

              {/* Descrição */}
              {op.descricao && (
                <div className="bg-white border rounded-xl p-4 text-sm">
                  <div className="text-xs text-gray-500 mb-1">Descrição</div>
                  <p className="text-gray-700 whitespace-pre-wrap">{op.descricao}</p>
                </div>
              )}

              {/* Observações */}
              {op.observacoes && (
                <div className="bg-white border rounded-xl p-4 text-sm">
                  <div className="text-xs text-gray-500 mb-1">Observações</div>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {op.observacoes}
                  </p>
                </div>
              )}

              {/* CHECKLISTS */}
              <div className="bg-white border rounded-xl p-4">
                <CardChecklist oportunidadeId={op.id} />
              </div>

              {/* ARQUIVOS E DOCUMENTOS - Compacto */}
              <div className="bg-white border rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-gray-800">Arquivos e Documentos</h3>
                  <span className="text-[10px] text-gray-400">Plantas, fotos, docs</span>
                </div>
                <OportunidadeArquivos
                  oportunidadeId={op.id}
                  clienteNome={op.cliente?.nome || op.cliente?.razao_social || 'Cliente'}
                />
              </div>
            </div>

            {/* Coluna lateral: Checklist diário + Comentários */}
            <div className="space-y-4">
              <div className="bg-white border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">Checklist diário</h3>
                    <p className="text-xs text-gray-500">
                      Pendentes: {dailyTasks.filter((t) => !t.done).length}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mb-3">
                  <input
                    className="flex-1 border rounded px-3 py-2 text-sm"
                    placeholder="Adicionar atividade"
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTask();
                      }
                    }}
                  />
                  <button
                    className="px-3 py-2 bg-[#F25C26] text-white text-sm rounded hover:bg-[#e04a1a]"
                    onClick={handleAddTask}
                  >
                    Adicionar
                  </button>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {dailyTasks.length === 0 && (
                    <p className="text-xs text-gray-500">Nenhuma atividade diária.</p>
                  )}
                  {dailyTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start justify-between gap-2 border rounded px-2 py-2"
                    >
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          className="mt-1"
                          checked={task.done}
                          onChange={() => toggleTask(task.id)}
                        />
                        <div>
                          <div className={`text-sm ${task.done ? "line-through text-gray-500" : "text-gray-800"}`}>
                            {task.titulo}
                          </div>
                          <div className="text-[11px] text-gray-500">
                            {task.createdBy} · {new Date(task.createdAt).toLocaleString("pt-BR")}
                          </div>
                        </div>
                      </div>
                      <button
                        className="text-xs text-red-500 hover:text-red-700"
                        onClick={() => removeTask(task.id)}
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">Comentários rápidos</h3>
                <textarea
                  className="w-full border rounded px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Digite e saia do campo para salvar automaticamente"
                  value={commentDraft}
                  onChange={(e) => setCommentDraft(e.target.value)}
                  onBlur={handleAddComment}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                />
                <div className="mt-3 space-y-2 max-h-60 overflow-y-auto pr-1">
                  {comments.length === 0 && (
                    <p className="text-xs text-gray-500">Nenhum comentário ainda.</p>
                  )}
                  {comments.map((c) => (
                    <div key={c.id} className="border rounded px-3 py-2 text-sm">
                      <div className="flex justify-between text-[11px] text-gray-500 mb-1">
                        <span>{c.createdBy}</span>
                        <span>{new Date(c.createdAt).toLocaleString("pt-BR")}</span>
                      </div>
                      <p className="text-gray-800 whitespace-pre-wrap">{c.texto}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Remover Oportunidade deste Núcleo?"
        message={`Deseja remover a oportunidade "${op.titulo}" deste núcleo? A oportunidade continuará disponível nos outros núcleos.`}
        confirmLabel="Remover"
        cancelLabel="Cancelar"
        type="warning"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
