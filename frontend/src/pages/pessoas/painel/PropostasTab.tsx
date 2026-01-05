// src/pages/pessoas/painel/PropostasTab.tsx
import React from "react";

interface PropostasTabProps {
  pessoaId: string;
}

export const PropostasTab: React.FC<PropostasTabProps> = ({ pessoaId }) => {
  // TODO: integrar com tabela de propostas / oportunidades
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-900">
          Propostas e oportunidades
        </h2>
        <button className="px-3 py-1.5 rounded-xl bg-amber-500 text-white text-xs hover:bg-amber-600">
          Nova proposta
        </button>
      </div>

      <p className="text-xs text-gray-500 mb-2">
        Lista de propostas, status, valores, probabilidade de fechamento e prazos.
      </p>

      <div className="text-xs text-gray-400">
        TODO: carregar propostas vinculadas à pessoa {pessoaId}.
      </div>
    </div>
  );
};
