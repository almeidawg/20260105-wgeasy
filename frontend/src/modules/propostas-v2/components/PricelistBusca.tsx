// ============================================================
// PricelistBusca - Busca no pricelist (coluna central)
// Sistema WG Easy - Grupo WG Almeida
// ============================================================

import { useState } from "react";
import { Search, Plus, Package, Loader2, Sparkles } from "lucide-react";
import Badge from "@/components/ui/badge";
import type { ItemPricelist, FiltrosPricelist, Ambiente, TipoItem, SugestaoIA } from "../types";
import { formatarMoeda } from "@/lib/utils";

interface PricelistBuscaProps {
  itens: ItemPricelist[];
  loading: boolean;
  filtros: FiltrosPricelist;
  ambientes: Ambiente[];
  sugestoes: SugestaoIA[];
  onBuscar: (termo: string) => void;
  onFiltrar: (filtros: FiltrosPricelist) => void;
  onAdicionar: (item: ItemPricelist, ambienteId?: string) => void;
  onCriarNovo: () => void;
}

function getBadgeVariant(tipo: TipoItem) {
  switch (tipo) {
    case "material": return "info";
    case "mao_obra": return "success";
    case "servico": return "warning";
    case "produto": return "primary";
    default: return "default";
  }
}

function getTipoLabel(tipo: TipoItem) {
  switch (tipo) {
    case "material": return "Material";
    case "mao_obra": return "Mão de obra";
    case "servico": return "Serviço";
    case "produto": return "Produto";
    case "ambos": return "Material + MO";
    default: return tipo;
  }
}

export default function PricelistBusca({
  itens,
  loading,
  filtros,
  ambientes,
  sugestoes,
  onBuscar,
  onFiltrar,
  onAdicionar,
  onCriarNovo,
}: PricelistBuscaProps) {
  const [ambienteSelecionado, setAmbienteSelecionado] = useState<string>("");

  const handleAdicionar = (item: ItemPricelist) => {
    // Para itens com m² ou ml, mostrar seletor de ambiente
    if ((item.unidade === "m2" || item.unidade === "ml") && ambientes.length > 0 && !ambienteSelecionado) {
      // Se não tem ambiente selecionado, adicionar sem ambiente
      onAdicionar(item);
    } else {
      onAdicionar(item, ambienteSelecionado || undefined);
    }
  };

  const tiposFiltro: { value: TipoItem | null; label: string }[] = [
    { value: null, label: "Todos" },
    { value: "material", label: "Material" },
    { value: "mao_obra", label: "Mão de obra" },
    { value: "servico", label: "Serviço" },
    { value: "produto", label: "Produto" },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col h-full">
      {/* Header com busca */}
      <div className="p-4 border-b border-gray-200 space-y-3">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold text-gray-900">Catálogo de Itens</h2>
        </div>

        {/* Campo de busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar itens, materiais, serviços..."
            value={filtros.busca || ""}
            onChange={(e) => onBuscar(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
          />
        </div>

        {/* Filtros por tipo */}
        <div className="flex items-center gap-1 flex-wrap">
          {tiposFiltro.map((tipo) => (
            <button
              key={tipo.value || "all"}
              onClick={() => onFiltrar({ ...filtros, tipo: tipo.value })}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                filtros.tipo === tipo.value
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tipo.label}
            </button>
          ))}
        </div>

        {/* Seletor de ambiente para aplicar metragem */}
        {ambientes.length > 0 && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Aplicar metragem do ambiente:
            </label>
            <select
              value={ambienteSelecionado}
              onChange={(e) => setAmbienteSelecionado(e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Quantidade manual</option>
              {ambientes.map((amb) => (
                <option key={amb.id} value={amb.id}>
                  {amb.nome} ({amb.area_piso.toFixed(1)}m²)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Sugestões da IA */}
      {sugestoes.length > 0 && (
        <div className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-semibold text-purple-700 uppercase">
              Sugestões da IA ({sugestoes.length})
            </span>
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {sugestoes.slice(0, 5).map((sug) => (
              <button
                key={sug.id}
                onClick={() => sug.itemSugerido && handleAdicionar(sug.itemSugerido)}
                disabled={!sug.itemSugerido}
                className="w-full p-2 bg-white rounded-lg border border-purple-200 text-left hover:border-purple-400 transition-colors disabled:opacity-50"
              >
                <p className="text-xs font-medium text-gray-900 truncate">
                  {sug.itemSugerido?.nome || sug.descricao}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {sug.ambiente && `${sug.ambiente} • `}
                  {sug.quantidade && `${sug.quantidade}x`}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lista de resultados */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        ) : itens.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {filtros.busca && filtros.busca.length >= 2 ? (
              <>
                <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nenhum item encontrado</p>
                <button
                  onClick={onCriarNovo}
                  className="mt-3 px-3 py-1.5 bg-[#F25C26] text-white rounded-lg text-xs font-medium hover:bg-[#e04a1a] transition-colors"
                >
                  + Criar novo item
                </button>
              </>
            ) : (
              <>
                <Search className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Digite para buscar</p>
                <p className="text-xs mt-1">Mínimo 2 caracteres</p>
              </>
            )}
          </div>
        ) : (
          itens.map((item) => (
            <div
              key={item.id}
              className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">{item.nome}</p>
                  {item.descricao && (
                    <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{item.descricao}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1.5">
                  <Badge variant={getBadgeVariant(item.tipo) as any} size="sm">
                    {getTipoLabel(item.tipo)}
                  </Badge>
                  {item.categoria && (
                    <Badge variant="default" size="sm" className="bg-gray-100 text-gray-600">
                      {item.categoria}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {formatarMoeda(item.preco)}/{item.unidade}
                  </span>
                  <button
                    onClick={() => handleAdicionar(item)}
                    className="p-1.5 bg-[#F25C26] text-white rounded-lg hover:bg-[#e04a1a] transition-colors"
                    title="Adicionar à proposta"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer com contagem */}
      {itens.length > 0 && (
        <div className="p-2 border-t border-gray-200 text-center">
          <span className="text-xs text-gray-500">
            {itens.length} {itens.length === 1 ? "item encontrado" : "itens encontrados"}
          </span>
        </div>
      )}
    </div>
  );
}
