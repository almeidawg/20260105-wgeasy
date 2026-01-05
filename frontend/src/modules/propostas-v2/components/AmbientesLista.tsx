// ============================================================
// AmbientesLista - Lista de ambientes (coluna esquerda)
// Sistema WG Easy - Grupo WG Almeida
// ============================================================

import { Home, Edit2, Trash2, Plus, Upload, ChevronRight } from "lucide-react";
import type { Ambiente, TotaisAmbientes } from "../types";

interface AmbientesListaProps {
  ambientes: Ambiente[];
  totais: TotaisAmbientes;
  ambienteSelecionado: string | null;
  onSelecionar: (id: string | null) => void;
  onEditar: (ambiente: Ambiente) => void;
  onRemover: (id: string) => void;
  onAdicionar: () => void;
  onImportar: () => void;
}

export default function AmbientesLista({
  ambientes,
  totais,
  ambienteSelecionado,
  onSelecionar,
  onEditar,
  onRemover,
  onAdicionar,
  onImportar,
}: AmbientesListaProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-emerald-600" />
            <h2 className="font-semibold text-gray-900">Ambientes</h2>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
              {ambientes.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onImportar}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Importar com IA"
            >
              <Upload className="w-4 h-4" />
            </button>
            <button
              onClick={onAdicionar}
              className="p-1.5 text-[#F25C26] hover:bg-orange-50 rounded-lg transition-colors"
              title="Adicionar ambiente"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filtro rápido por ambiente */}
        <div className="flex items-center gap-1 flex-wrap">
          <button
            onClick={() => onSelecionar(null)}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              !ambienteSelecionado
                ? "bg-emerald-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Todos
          </button>
        </div>
      </div>

      {/* Lista de ambientes */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {ambientes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Home className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nenhum ambiente</p>
            <p className="text-xs mt-1">Adicione ou importe ambientes</p>
          </div>
        ) : (
          ambientes.map((ambiente) => (
            <div
              key={ambiente.id}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                ambienteSelecionado === ambiente.id
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-gray-200 hover:border-emerald-300 hover:bg-gray-50"
              }`}
              onClick={() => onSelecionar(
                ambienteSelecionado === ambiente.id ? null : ambiente.id
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm text-gray-900 truncate">
                      {ambiente.nome}
                    </p>
                    {ambienteSelecionado === ambiente.id && (
                      <ChevronRight className="w-4 h-4 text-emerald-500" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {ambiente.largura.toFixed(1)} × {ambiente.comprimento.toFixed(1)}m
                  </p>
                </div>

                <div className="flex items-center gap-0.5 ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditar(ambiente);
                    }}
                    className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemover(ambiente.id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Remover"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Métricas */}
              <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
                <div className="flex items-center justify-between bg-white/80 rounded px-2 py-1">
                  <span className="text-gray-500">Piso</span>
                  <span className="font-semibold">{ambiente.area_piso.toFixed(1)}m²</span>
                </div>
                <div className="flex items-center justify-between bg-white/80 rounded px-2 py-1">
                  <span className="text-gray-500">Parede</span>
                  <span className="font-semibold">{ambiente.area_parede.toFixed(1)}m²</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer com totais */}
      {ambientes.length > 0 && (
        <div className="p-3 border-t border-gray-200 bg-gradient-to-r from-emerald-500 to-teal-600">
          <div className="grid grid-cols-4 gap-2 text-center text-white">
            <div>
              <p className="text-xs opacity-80">Piso</p>
              <p className="text-sm font-bold">{totais.area_piso.toFixed(0)}m²</p>
            </div>
            <div>
              <p className="text-xs opacity-80">Parede</p>
              <p className="text-sm font-bold">{totais.area_parede.toFixed(0)}m²</p>
            </div>
            <div>
              <p className="text-xs opacity-80">Teto</p>
              <p className="text-sm font-bold">{totais.area_teto.toFixed(0)}m²</p>
            </div>
            <div>
              <p className="text-xs opacity-80">Perímetro</p>
              <p className="text-sm font-bold">{totais.perimetro.toFixed(0)}ml</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
