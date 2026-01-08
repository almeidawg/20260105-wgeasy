// ============================================================
// MODAL DE COMPARTILHAMENTO - GOOGLE KEEP
// ============================================================

import { useState, useEffect, useCallback } from "react";
import {
  X,
  Share2,
  Users,
  Building2,
  Search,
  Trash2,
  Check,
  Loader2,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import {
  compartilharNota,
  obterCompartilhamentos,
  removerCompartilhamento,
  ShareInfo,
  ShareTarget,
} from "../../lib/keepSharingApi";

interface Props {
  noteId: string;
  noteTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onShareUpdated?: () => void;
  criadoPorUsuarioId?: string;
}

interface SearchResult {
  id: string;
  nome: string;
  email: string | null;
  complemento: string | null;
  tipo: "pessoa" | "usuario";
}

interface SelectedTarget extends ShareTarget {
  nome: string;
  complemento: string | null;
}

export default function KeepSharingModal({
  noteId,
  noteTitle,
  isOpen,
  onClose,
  onShareUpdated,
  criadoPorUsuarioId,
}: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [shares, setShares] = useState<ShareInfo[]>([]);
  const [loadingShares, setLoadingShares] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedTargets, setSelectedTargets] = useState<SelectedTarget[]>([]);
  const [activeTab, setActiveTab] = useState<"clientes" | "internos">("clientes");

  // Carregar compartilhamentos existentes
  const loadShares = useCallback(async () => {
    setLoadingShares(true);
    try {
      const result = await obterCompartilhamentos(noteId);
      setShares(result.shares || []);
    } catch (error) {
      console.error("Erro ao carregar compartilhamentos:", error);
    } finally {
      setLoadingShares(false);
    }
  }, [noteId]);

  useEffect(() => {
    if (isOpen && noteId) {
      loadShares();
    }
  }, [isOpen, noteId, loadShares]);

  // Buscar pessoas/usuarios
  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const results: SearchResult[] = [];

      if (activeTab === "clientes") {
        // Buscar em pessoas (clientes ativos)
        const { data: pessoas } = await supabase
          .from("pessoas")
          .select("id, nome, email, complemento")
          .eq("tipo", "CLIENTE")
          .eq("ativo", true)
          .or(`nome.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,complemento.ilike.%${searchTerm}%`)
          .order("nome")
          .limit(10);

        if (pessoas) {
          results.push(
            ...pessoas.map((p) => ({
              id: p.id,
              nome: p.nome,
              email: p.email,
              complemento: p.complemento,
              tipo: "pessoa" as const,
            }))
          );
        }
      } else {
        // Buscar em usuarios (internos ativos)
        const { data: usuarios } = await supabase
          .from("usuarios")
          .select("id, nome, email")
          .eq("ativo", true)
          .or(`nome.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
          .order("nome")
          .limit(10);

        if (usuarios) {
          results.push(
            ...usuarios.map((u) => ({
              id: u.id,
              nome: u.nome,
              email: u.email,
              complemento: null,
              tipo: "usuario" as const,
            }))
          );
        }
      }

      // Filtrar quem ja foi compartilhado
      const filteredResults = results.filter(
        (r) =>
          !shares.some((s) => s.target_id === r.id && s.tipo === r.tipo) &&
          !selectedTargets.some((t) => t.id === r.id && t.tipo === r.tipo)
      );

      setSearchResults(filteredResults);
    } catch (error) {
      console.error("Erro na busca:", error);
    } finally {
      setSearching(false);
    }
  }, [searchTerm, activeTab, shares, selectedTargets]);

  useEffect(() => {
    const debounce = setTimeout(handleSearch, 300);
    return () => clearTimeout(debounce);
  }, [handleSearch]);

  // Adicionar alvo para compartilhar
  const handleAddTarget = (result: SearchResult) => {
    setSelectedTargets((prev) => [
      ...prev,
      {
        tipo: result.tipo,
        id: result.id,
        nome: result.nome,
        complemento: result.complemento,
        permissoes: {
          pode_marcar_itens: true,
          pode_editar: result.tipo === "usuario",
          pode_adicionar_itens: result.tipo === "usuario",
        },
      },
    ]);
    setSearchTerm("");
    setSearchResults([]);
  };

  // Remover alvo selecionado
  const handleRemoveTarget = (index: number) => {
    setSelectedTargets((prev) => prev.filter((_, i) => i !== index));
  };

  // Compartilhar
  const handleShare = async () => {
    if (selectedTargets.length === 0) return;

    setSaving(true);
    try {
      await compartilharNota(
        noteId,
        selectedTargets,
        noteTitle,
        criadoPorUsuarioId
      );
      setSelectedTargets([]);
      await loadShares();
      onShareUpdated?.();
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
      alert("Erro ao compartilhar nota");
    } finally {
      setSaving(false);
    }
  };

  // Remover compartilhamento existente
  const handleRemoveShare = async (shareId: string) => {
    if (!confirm("Remover este compartilhamento?")) return;

    try {
      await removerCompartilhamento(noteId, shareId);
      await loadShares();
      onShareUpdated?.();
    } catch (error) {
      console.error("Erro ao remover compartilhamento:", error);
      alert("Erro ao remover compartilhamento");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Share2 className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Compartilhar Nota</h3>
                <p className="text-sm text-gray-500 truncate max-w-[200px]">
                  {noteTitle}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab("clientes")}
            className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === "clientes"
                ? "text-yellow-600 border-b-2 border-yellow-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Building2 className="w-4 h-4" />
            Clientes
          </button>
          <button
            onClick={() => setActiveTab("internos")}
            className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === "internos"
                ? "text-yellow-600 border-b-2 border-yellow-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Users className="w-4 h-4" />
            Equipe Interna
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                activeTab === "clientes"
                  ? "Buscar cliente por nome ou email..."
                  : "Buscar colaborador por nome ou email..."
              }
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
            {searching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
            )}
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
              {searchResults.map((result) => (
                <button
                  key={`${result.tipo}-${result.id}`}
                  onClick={() => handleAddTarget(result)}
                  className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-0"
                >
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    {result.tipo === "pessoa" ? (
                      <Building2 className="w-4 h-4 text-gray-500" />
                    ) : (
                      <Users className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {result.nome}
                    </p>
                    {result.complemento && (
                      <p className="text-xs text-orange-600 truncate">{result.complemento}</p>
                    )}
                    {result.email && !result.complemento && (
                      <p className="text-xs text-gray-500 truncate">{result.email}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Selected Targets */}
          {selectedTargets.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">
                Compartilhar com:
              </p>
              <div className="space-y-2">
                {selectedTargets.map((target, index) => (
                  <div
                    key={`${target.tipo}-${target.id}`}
                    className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                      {target.tipo === "pessoa" ? (
                        <Building2 className="w-4 h-4 text-yellow-600" />
                      ) : (
                        <Users className="w-4 h-4 text-yellow-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {target.nome}
                      </p>
                      {target.complemento && (
                        <p className="text-xs text-orange-600 truncate">
                          {target.complemento}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveTarget(index)}
                      className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Existing Shares */}
          {loadingShares ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
            </div>
          ) : shares.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">
                Compartilhado com:
              </p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {shares.map((share) => (
                  <div
                    key={share.id}
                    className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        {share.tipo === "pessoa" ? (
                          <Building2 className="w-4 h-4 text-gray-500" />
                        ) : (
                          <Users className="w-4 h-4 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {share.nome}
                        </p>
                        <p className="text-xs text-gray-500">
                          {share.tipo === "pessoa" ? "Cliente" : "Equipe"}
                          {share.permissoes.pode_editar && " - Pode editar"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveShare(share.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              Esta nota ainda não foi compartilhada
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Fechar
          </button>
          {selectedTargets.length > 0 && (
            <button
              onClick={handleShare}
              disabled={saving}
              className="px-4 py-2 text-sm bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Compartilhando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Compartilhar
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
