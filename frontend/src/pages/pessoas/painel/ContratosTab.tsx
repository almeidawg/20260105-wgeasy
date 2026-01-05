// src/pages/pessoas/painel/ContratosTab.tsx
import React from "react";

interface ContratosTabProps {
  pessoaId: string;
}

export const ContratosTab: React.FC<ContratosTabProps> = ({ pessoaId }) => {
  // TODO: integrar com tabela de contratos e pagamentos
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-900">
          Contratos e financeiro
        </h2>
        <button className="px-3 py-1.5 rounded-xl bg-sky-600 text-white text-xs hover:bg-sky-700">
          Novo contrato
        </button>
      </div>

      <p className="text-xs text-gray-500 mb-2">
        Contratos, valores, forma de pagamento, status e datas-chave.
      </p>

      <div className="text-xs text-gray-400">
        TODO: carregar contratos vinculados à pessoa {pessoaId}.
      </div>
    </div>
  );
};
