// ============================================================
// ItensPropostaPanel - Painel de itens agrupados por núcleo
// Sistema WG Easy - Grupo WG Almeida
// ============================================================

import { useState } from "react";
import { ShoppingCart, Trash2, ChevronDown, ChevronRight, Minus, Plus } from "lucide-react";
import type { ItemProposta, GrupoNucleo, TotaisGerais, Ambiente } from "../types";
import { formatarMoeda } from "@/lib/utils";

interface ItensPropostaPanelProps {
  gruposPorNucleo: GrupoNucleo[];
  totais: TotaisGerais;
  ambientes: Ambiente[];
  onAtualizarQuantidade: (id: string, quantidade: number) => void;
  onRemover: (id: string) => void;
}

export default function ItensPropostaPanel({
  gruposPorNucleo,
  totais,
  ambientes,
  onAtualizarQuantidade,
  onRemover,
}: ItensPropostaPanelProps) {
  const [gruposAbertos, setGruposAbertos] = useState<Set<string>>(
    new Set(gruposPorNucleo.map(g => g.nucleo))
  );

  const toggleGrupo = (nucleo: string) => {
    setGruposAbertos(prev => {
      const next = new Set(prev);
      if (next.has(nucleo)) {
        next.delete(nucleo);
      } else {
        next.add(nucleo);
      }
      return next;
    });
  };

  const getAmbienteNome = (ambienteId?: string) => {
    if (!ambienteId) return null;
    const ambiente = ambientes.find(a => a.id === ambienteId);
    return ambiente?.nome;
  };

  const totalItens = gruposPorNucleo.reduce((acc, g) => acc + g.itens.length, 0);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-[#F25C26]" />
            <h2 className="font-semibold text-gray-900">Itens da Proposta</h2>
            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
              {totalItens}
            </span>
          </div>
        </div>

        {/* Resumo de totais */}
        {totalItens > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-blue-50 rounded-lg p-2">
              <span className="text-blue-600">Materiais</span>
              <p className="font-bold text-blue-700">{formatarMoeda(totais.materiais)}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-2">
              <span className="text-green-600">Mão de Obra</span>
              <p className="font-bold text-green-700">{formatarMoeda(totais.maoObra)}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-2">
              <span className="text-orange-600">Total</span>
              <p className="font-bold text-orange-700">{formatarMoeda(totais.total)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Lista agrupada por núcleo */}
      <div className="flex-1 overflow-y-auto">
        {totalItens === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">Nenhum item na proposta</p>
            <p className="text-xs mt-1">Busque e adicione itens do catálogo</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {gruposPorNucleo.map((grupo) => {
              const aberto = gruposAbertos.has(grupo.nucleo);

              return (
                <div key={grupo.nucleo}>
                  {/* Cabeçalho do grupo */}
                  <button
                    onClick={() => toggleGrupo(grupo.nucleo)}
                    className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    style={{ borderLeftWidth: 4, borderLeftColor: grupo.cor }}
                  >
                    <div className="flex items-center gap-2">
                      {aberto ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                      <span
                        className="font-semibold text-sm"
                        style={{ color: grupo.cor }}
                      >
                        {grupo.label}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({grupo.itens.length})
                      </span>
                    </div>
                    <span className="font-bold text-sm text-gray-900">
                      {formatarMoeda(grupo.total)}
                    </span>
                  </button>

                  {/* Itens do grupo */}
                  {aberto && (
                    <div className="px-3 pb-3 space-y-2">
                      {grupo.itens.map((item) => (
                        <ItemCard
                          key={item.id}
                          item={item}
                          ambienteNome={getAmbienteNome(item.ambiente_id)}
                          onAtualizarQuantidade={(qtd) => onAtualizarQuantidade(item.id, qtd)}
                          onRemover={() => onRemover(item.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer com total geral */}
      {totalItens > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-[#F25C26] to-[#e04a1a]">
          <div className="flex items-center justify-between text-white">
            <span className="font-semibold">Total Geral</span>
            <span className="text-xl font-bold">{formatarMoeda(totais.total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente de card individual do item
interface ItemCardProps {
  item: ItemProposta;
  ambienteNome?: string | null;
  onAtualizarQuantidade: (quantidade: number) => void;
  onRemover: () => void;
}

function ItemCard({
  item,
  ambienteNome,
  onAtualizarQuantidade,
  onRemover,
}: ItemCardProps) {
  const [editando, setEditando] = useState(false);
  const subtotal = item.quantidade * item.valor_unitario;

  return (
    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-gray-900 truncate">{item.item.nome}</p>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
            {ambienteNome && (
              <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded">
                {ambienteNome}
              </span>
            )}
            <span>{formatarMoeda(item.valor_unitario)}/{item.item.unidade}</span>
          </div>
        </div>

        <button
          onClick={onRemover}
          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          title="Remover"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Quantidade e subtotal */}
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onAtualizarQuantidade(Math.max(0.01, item.quantidade - 1))}
            className="w-6 h-6 flex items-center justify-center rounded bg-gray-200 hover:bg-gray-300 text-gray-600"
          >
            <Minus className="w-3 h-3" />
          </button>
          <input
            type="number"
            value={item.quantidade}
            onChange={(e) => onAtualizarQuantidade(Math.max(0.01, parseFloat(e.target.value) || 0))}
            step="0.01"
            min="0.01"
            className="w-16 px-1 py-0.5 text-center text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#F25C26]"
          />
          <button
            onClick={() => onAtualizarQuantidade(item.quantidade + 1)}
            className="w-6 h-6 flex items-center justify-center rounded bg-gray-200 hover:bg-gray-300 text-gray-600"
          >
            <Plus className="w-3 h-3" />
          </button>
          <span className="text-xs text-gray-500">{item.item.unidade}</span>
        </div>

        <span className="font-bold text-sm text-gray-900">
          {formatarMoeda(subtotal)}
        </span>
      </div>
    </div>
  );
}
