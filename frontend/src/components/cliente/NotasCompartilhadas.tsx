// ============================================================
// NOTAS COMPARTILHADAS - AREA DO CLIENTE
// Exibe notas do Google Keep compartilhadas com o cliente
// ============================================================

import { useState, useEffect, useCallback } from "react";
import {
  CheckCircle2,
  Circle,
  Sparkles,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  obterNotasCompartilhadasComigo,
  atualizarItemNota,
  KeepNoteWithPermissions,
} from "@/lib/keepSharingApi";

interface Props {
  pessoaId: string;
}

export default function NotasCompartilhadas({ pessoaId }: Props) {
  const [notas, setNotas] = useState<KeepNoteWithPermissions[]>([]);
  const [loading, setLoading] = useState(true);
  const [atualizandoItem, setAtualizandoItem] = useState<string | null>(null);
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set());

  const carregarNotas = useCallback(async () => {
    if (!pessoaId) return;

    setLoading(true);
    try {
      const resultado = await obterNotasCompartilhadasComigo(pessoaId);
      setNotas(resultado);
      // Expandir a primeira nota por padrao se houver apenas uma
      if (resultado.length === 1) {
        setExpandidos(new Set([resultado[0].id]));
      }
    } catch (error) {
      console.error("Erro ao carregar notas compartilhadas:", error);
    } finally {
      setLoading(false);
    }
  }, [pessoaId]);

  useEffect(() => {
    carregarNotas();
  }, [carregarNotas]);

  const toggleExpandir = (noteId: string) => {
    setExpandidos((prev) => {
      const next = new Set(prev);
      if (next.has(noteId)) {
        next.delete(noteId);
      } else {
        next.add(noteId);
      }
      return next;
    });
  };

  const handleToggleItem = async (
    nota: KeepNoteWithPermissions,
    itemIndex: number
  ) => {
    if (!nota.permissoes.pode_marcar_itens) return;
    if (!nota.items || !nota.items[itemIndex]) return;

    const itemId = `${nota.id}-${itemIndex}`;
    setAtualizandoItem(itemId);

    try {
      const novoChecked = !nota.items[itemIndex].checked;
      await atualizarItemNota(nota.id, itemIndex, novoChecked, pessoaId);

      // Atualizar estado local
      setNotas((prev) =>
        prev.map((n) => {
          if (n.id !== nota.id) return n;
          const novosItens = [...(n.items || [])];
          novosItens[itemIndex] = { ...novosItens[itemIndex], checked: novoChecked };
          return { ...n, items: novosItens };
        })
      );
    } catch (error) {
      console.error("Erro ao atualizar item:", error);
      alert("Erro ao atualizar item");
    } finally {
      setAtualizandoItem(null);
    }
  };

  // Se nao tem notas compartilhadas, nao renderiza nada
  if (!loading && notas.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Tarefas Compartilhadas
              </h3>
              <p className="text-sm text-gray-500">
                Checklists compartilhados com voce
              </p>
            </div>
          </div>
          <button
            onClick={carregarNotas}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Atualizar"
          >
            <RefreshCw className={`w-5 h-5 text-gray-400 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-yellow-500 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {notas.map((nota) => {
              const isExpandido = expandidos.has(nota.id);
              const totalItens = nota.items?.length || 0;
              const itensConcluidos = nota.items?.filter((i) => i.checked).length || 0;
              const progresso = totalItens > 0 ? (itensConcluidos / totalItens) * 100 : 0;

              return (
                <div
                  key={nota.id}
                  className="border border-gray-200 rounded-xl overflow-hidden"
                >
                  {/* Card Header */}
                  <button
                    onClick={() => toggleExpandir(nota.id)}
                    className="w-full p-4 bg-gradient-to-r from-yellow-50 to-amber-50 flex items-center justify-between hover:bg-yellow-100/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-medium text-gray-900">
                          {nota.title || "Checklist"}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {itensConcluidos} de {totalItens} concluidos
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Mini barra de progresso */}
                      <div className="hidden sm:block w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 transition-all"
                          style={{ width: `${progresso}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-emerald-600">
                        {Math.round(progresso)}%
                      </span>
                      {isExpandido ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* Card Content (Expandido) */}
                  {isExpandido && (
                    <div className="p-4 space-y-2">
                      {nota.items && nota.items.length > 0 ? (
                        nota.items.map((item, idx) => {
                          const itemId = `${nota.id}-${idx}`;
                          const isAtualizando = atualizandoItem === itemId;
                          const podeMarcar = nota.permissoes.pode_marcar_itens;

                          return (
                            <div
                              key={idx}
                              className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                                item.checked
                                  ? "bg-emerald-50 border-emerald-200"
                                  : "bg-white border-gray-200"
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => handleToggleItem(nota, idx)}
                                disabled={!podeMarcar || isAtualizando}
                                className={`mt-0.5 flex-shrink-0 ${
                                  podeMarcar
                                    ? "cursor-pointer hover:scale-110 transition-transform"
                                    : "cursor-not-allowed opacity-50"
                                }`}
                              >
                                {isAtualizando ? (
                                  <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />
                                ) : item.checked ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                ) : (
                                  <Circle className="w-5 h-5 text-gray-400" />
                                )}
                              </button>
                              <span
                                className={`flex-1 text-sm ${
                                  item.checked
                                    ? "text-gray-400 line-through"
                                    : "text-gray-700"
                                }`}
                              >
                                {item.text}
                              </span>
                            </div>
                          );
                        })
                      ) : nota.text ? (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {nota.text}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 text-center py-4">
                          Nenhum item neste checklist
                        </p>
                      )}

                      {/* Barra de progresso completa */}
                      {totalItens > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-gray-600">Progresso</span>
                            <span className="font-medium text-gray-900">
                              {itensConcluidos} de {totalItens}
                            </span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all"
                              style={{ width: `${progresso}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
