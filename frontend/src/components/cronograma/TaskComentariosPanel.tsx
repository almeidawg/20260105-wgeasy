// ============================================================
// COMPONENTE: Painel Completo de Comentários de Tasks
// Combina Timeline + Editor em um único componente
// Sistema WG Easy - Grupo WG Almeida
// ============================================================

import React, { useState } from "react";
import TaskComentariosTimeline from "./TaskComentariosTimeline";
import TaskComentarioEditor from "./TaskComentarioEditor";
import type { TaskComentario } from "@/lib/taskComentariosApi";

// ============================================================
// TIPOS
// ============================================================

interface TaskComentariosPanelProps {
  task_id: string;
  task_titulo?: string;
  className?: string;
}

// ============================================================
// COMPONENTE
// ============================================================

const TaskComentariosPanel: React.FC<TaskComentariosPanelProps> = ({
  task_id,
  task_titulo,
  className = "",
}) => {
  const [comentarioEditando, setComentarioEditando] = useState<
    TaskComentario | undefined
  >(undefined);
  const [mostrandoEditor, setMostrandoEditor] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  function handleSucesso() {
    // Atualizar timeline
    setRefreshKey((prev) => prev + 1);

    // Fechar editor
    setMostrandoEditor(false);
    setComentarioEditando(undefined);
  }

  function handleNovoComentario() {
    setComentarioEditando(undefined);
    setMostrandoEditor(true);
  }

  function handleEditarComentario(comentario: TaskComentario) {
    setComentarioEditando(comentario);
    setMostrandoEditor(true);
  }

  function handleCancelar() {
    setMostrandoEditor(false);
    setComentarioEditando(undefined);
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-xl ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[#2E2E2E]">
              Comentários
            </h3>
            {task_titulo && (
              <p className="text-sm text-gray-600 mt-1">{task_titulo}</p>
            )}
          </div>
          {!mostrandoEditor && (
            <button
              onClick={handleNovoComentario}
              className="px-4 py-2 bg-[#F25C26] text-white rounded-lg hover:bg-[#e04a1a] text-sm font-medium flex items-center gap-2"
            >
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Novo Comentário
            </button>
          )}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-6 space-y-6">
        {/* Editor (se visível) */}
        {mostrandoEditor && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="mb-3">
              <span className="text-sm font-semibold text-gray-700">
                {comentarioEditando
                  ? "Editando comentário"
                  : "Novo comentário"}
              </span>
            </div>
            <TaskComentarioEditor
              task_id={task_id}
              comentarioEditando={comentarioEditando}
              onSucesso={handleSucesso}
              onCancelar={handleCancelar}
              autoFocus
            />
          </div>
        )}

        {/* Timeline */}
        <TaskComentariosTimeline
          key={refreshKey}
          task_id={task_id}
          onNovoComentario={handleNovoComentario}
          onEditarComentario={handleEditarComentario}
        />
      </div>
    </div>
  );
};

export default TaskComentariosPanel;
