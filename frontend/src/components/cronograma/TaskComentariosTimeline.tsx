// ============================================================
// COMPONENTE: Timeline de Comentários de Tasks
// Sistema WG Easy - Grupo WG Almeida
// ============================================================

import React, { useState, useEffect } from "react";
import {
  listarComentariosTask,
  deletarComentario,
  calcularTempoDecorrido,
  type TaskComentario,
} from "@/lib/taskComentariosApi";

// ============================================================
// TIPOS
// ============================================================

interface TaskComentariosTimelineProps {
  task_id: string;
  onNovoComentario?: () => void;
  onEditarComentario?: (comentario: TaskComentario) => void;
}

// ============================================================
// COMPONENTE
// ============================================================

const TaskComentariosTimeline: React.FC<TaskComentariosTimelineProps> = ({
  task_id,
  onNovoComentario,
  onEditarComentario,
}) => {
  const [comentarios, setComentarios] = useState<TaskComentario[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletandoId, setDeletandoId] = useState<string | null>(null);

  useEffect(() => {
    carregarComentarios();
  }, [task_id]);

  async function carregarComentarios() {
    try {
      setLoading(true);
      const data = await listarComentariosTask(task_id);
      setComentarios(data);
    } catch (error) {
      console.error("Erro ao carregar comentários:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeletar(id: string) {
    if (!confirm("Tem certeza que deseja deletar este comentário?")) {
      return;
    }

    try {
      setDeletandoId(id);
      await deletarComentario(id);
      await carregarComentarios();
    } catch (error: any) {
      alert(`Erro ao deletar comentário: ${error.message}`);
    } finally {
      setDeletandoId(null);
    }
  }

  // Gerar iniciais do nome para o avatar
  const getIniciais = (nome: string) => {
    const partes = nome.trim().split(" ");
    if (partes.length >= 2) {
      return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
    }
    return nome.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F25C26]" />
      </div>
    );
  }

  if (comentarios.length === 0) {
    return (
      <div className="text-center py-8">
        <svg
          className="w-12 h-12 text-gray-400 mx-auto mb-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <p className="text-gray-600 font-medium mb-1">
          Nenhum comentário ainda
        </p>
        <p className="text-sm text-gray-500">
          Seja o primeiro a comentar nesta tarefa
        </p>
        {onNovoComentario && (
          <button
            onClick={onNovoComentario}
            className="mt-4 px-4 py-2 bg-[#F25C26] text-white rounded-lg hover:bg-[#e04a1a] text-sm font-medium"
          >
            Adicionar Comentário
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Comentários ({comentarios.length})
        </h3>
        {onNovoComentario && (
          <button
            onClick={onNovoComentario}
            className="px-3 py-1.5 bg-[#F25C26] text-white rounded-lg hover:bg-[#e04a1a] text-xs font-medium flex items-center gap-1"
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
            Novo
          </button>
        )}
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {comentarios.map((comentario, index) => (
          <div key={comentario.id} className="flex gap-3">
            {/* Avatar com linha de conexão */}
            <div className="flex flex-col items-center">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {comentario.usuario_avatar ? (
                  <img
                    src={comentario.usuario_avatar}
                    alt={comentario.usuario_nome}
                    className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F25C26] to-[#e04a1a] flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm">
                    {getIniciais(comentario.usuario_nome)}
                  </div>
                )}
              </div>

              {/* Linha de conexão (exceto no último) */}
              {index < comentarios.length - 1 && (
                <div className="w-0.5 flex-1 bg-gray-200 mt-2" />
              )}
            </div>

            {/* Conteúdo do comentário */}
            <div className="flex-1 pb-6">
              {/* Header do comentário */}
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                      {comentario.usuario_nome}
                    </span>
                    {comentario.editado && (
                      <span className="text-xs text-gray-500 italic">
                        (editado)
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {calcularTempoDecorrido(comentario.created_at)}
                  </span>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-1">
                  {onEditarComentario && (
                    <button
                      onClick={() => onEditarComentario(comentario)}
                      className="p-1 text-gray-400 hover:text-blue-600 rounded"
                      title="Editar"
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => handleDeletar(comentario.id)}
                    disabled={deletandoId === comentario.id}
                    className="p-1 text-gray-400 hover:text-red-600 rounded disabled:opacity-50"
                    title="Deletar"
                  >
                    {deletandoId === comentario.id ? (
                      <div className="w-4 h-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                    ) : (
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Conteúdo */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {comentario.comentario}
                </p>

                {/* Menções */}
                {comentario.mencoes && comentario.mencoes.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="flex items-center gap-1 flex-wrap">
                      <svg
                        className="w-3.5 h-3.5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span className="text-xs text-gray-500">
                        Mencionou {comentario.mencoes.length} pessoa
                        {comentario.mencoes.length > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Indicador de fim */}
      <div className="flex items-center gap-3 pt-4">
        <div className="w-8 h-8 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-gray-300" />
        </div>
        <span className="text-xs text-gray-400">Início da conversa</span>
      </div>
    </div>
  );
};

export default TaskComentariosTimeline;
