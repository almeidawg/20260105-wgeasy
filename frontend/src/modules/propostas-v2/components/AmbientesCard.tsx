// ============================================================
// AmbientesCard - Card resumo de ambientes
// Sistema WG Easy - Grupo WG Almeida
// ============================================================

import { Home, Plus, Upload } from "lucide-react";
import type { TotaisAmbientes } from "../types";

interface AmbientesCardProps {
  totalAmbientes: number;
  totais: TotaisAmbientes;
  onAdicionar: () => void;
  onImportar: () => void;
}

export default function AmbientesCard({
  totalAmbientes,
  totais,
  onAdicionar,
  onImportar,
}: AmbientesCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
            <Home className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Ambientes
          </h3>
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
            {totalAmbientes}
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

      {/* Resumo de áreas */}
      {totalAmbientes > 0 ? (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-50 rounded-lg p-2">
            <span className="text-gray-500">Piso</span>
            <p className="font-bold text-gray-900">{totais.area_piso.toFixed(1)}m²</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <span className="text-gray-500">Parede</span>
            <p className="font-bold text-gray-900">{totais.area_parede.toFixed(1)}m²</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <span className="text-gray-500">Teto</span>
            <p className="font-bold text-gray-900">{totais.area_teto.toFixed(1)}m²</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <span className="text-gray-500">Perímetro</span>
            <p className="font-bold text-gray-900">{totais.perimetro.toFixed(1)}ml</p>
          </div>
        </div>
      ) : (
        <div className="text-center py-3 text-sm text-gray-500">
          Adicione ambientes para calcular metragens
        </div>
      )}
    </div>
  );
}
