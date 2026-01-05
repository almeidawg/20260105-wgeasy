// ============================================================
// RESUMO TOTAIS - Componente reutilizável
// Sistema WG Easy - Grupo WG Almeida
// ============================================================

import { Package, Layers, Calculator, DollarSign } from "lucide-react";

interface ResumoTotaisProps {
  totalItens: number;
  totalQuantidade: number;
  valorTotal: number;
  valorComAjustes?: number;
  temAjustes?: boolean;
  compacto?: boolean;
}

export function ResumoTotais({
  totalItens,
  totalQuantidade,
  valorTotal,
  valorComAjustes,
  temAjustes = false,
  compacto = false,
}: ResumoTotaisProps) {
  if (compacto) {
    return (
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-600">
              <strong className="text-gray-900">{totalItens}</strong> itens
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-600">
              <strong className="text-gray-900">{totalQuantidade.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</strong> un.
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-green-600">
            {(valorComAjustes ?? valorTotal).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
          {temAjustes && valorComAjustes !== valorTotal && (
            <p className="text-xs text-gray-400 line-through">
              {valorTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Total de Itens */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium">Total de Itens</p>
            <p className="text-3xl font-bold mt-1">{totalItens}</p>
            <p className="text-blue-100 text-xs mt-1">materiais diferentes</p>
          </div>
          <div className="p-3 bg-white/20 rounded-lg">
            <Package className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Quantidade Total */}
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100 text-sm font-medium">Quantidade Total</p>
            <p className="text-3xl font-bold mt-1">
              {totalQuantidade.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
            </p>
            <p className="text-purple-100 text-xs mt-1">unidades/peças</p>
          </div>
          <div className="p-3 bg-white/20 rounded-lg">
            <Layers className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Valor Calculado */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm font-medium">Valor Calculado</p>
            <p className="text-2xl font-bold mt-1">
              {valorTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </p>
            <p className="text-green-100 text-xs mt-1">estimativa inicial</p>
          </div>
          <div className="p-3 bg-white/20 rounded-lg">
            <Calculator className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Valor Final */}
      <div className={`rounded-xl shadow-lg p-5 text-white ${
        temAjustes
          ? "bg-gradient-to-br from-orange-500 to-orange-600"
          : "bg-gradient-to-br from-teal-500 to-teal-600"
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium">
              {temAjustes ? "Valor com Ajustes" : "Valor Total"}
            </p>
            <p className="text-2xl font-bold mt-1">
              {(valorComAjustes ?? valorTotal).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </p>
            <p className="text-white/80 text-xs mt-1">
              {temAjustes ? "ajustes aplicados" : "valor final"}
            </p>
          </div>
          <div className="p-3 bg-white/20 rounded-lg">
            <DollarSign className="w-7 h-7" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResumoTotais;
