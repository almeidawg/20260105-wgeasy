// ============================================================
// STEP INDICATOR - Indicador de passos do wizard
// Sistema WG Easy - Grupo WG Almeida
// ============================================================

import { Check, LucideIcon } from "lucide-react";

export interface Step {
  id: number;
  nome: string;
  descricao?: string;
  icone: LucideIcon;
}

interface StepIndicatorProps {
  passos: Step[];
  passoAtual: number;
  onPassoClick?: (passo: number) => void;
  permitirNavegacao?: boolean;
}

export function StepIndicator({
  passos,
  passoAtual,
  onPassoClick,
  permitirNavegacao = false,
}: StepIndicatorProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        {passos.map((passo, idx) => {
          const Icone = passo.icone;
          const isAtivo = passoAtual === passo.id;
          const isCompleto = passoAtual > passo.id;
          const podeNavegar = permitirNavegacao && (isCompleto || isAtivo);

          return (
            <div key={passo.id} className="flex items-center flex-1">
              <button
                type="button"
                onClick={() => podeNavegar && onPassoClick?.(passo.id)}
                disabled={!podeNavegar}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
                  isAtivo
                    ? "bg-[#F25C26]/10 text-[#F25C26]"
                    : isCompleto
                    ? "bg-green-50 text-green-600"
                    : "text-gray-400"
                } ${podeNavegar ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isAtivo
                      ? "bg-[#F25C26] text-white"
                      : isCompleto
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {isCompleto ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Icone className="w-4 h-4" />
                  )}
                </div>
                <div className="text-left">
                  <span className={`font-medium block ${isAtivo ? "text-[#F25C26]" : ""}`}>
                    {passo.nome}
                  </span>
                  {passo.descricao && (
                    <span className="text-xs text-gray-400">{passo.descricao}</span>
                  )}
                </div>
              </button>

              {idx < passos.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    isCompleto ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StepIndicator;
