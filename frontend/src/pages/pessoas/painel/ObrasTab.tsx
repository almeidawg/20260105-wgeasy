// src/pages/pessoas/painel/ObrasTab.tsx
import React from "react";

interface ObrasTabProps {
  pessoaId: string;
}

export const ObrasTab: React.FC<ObrasTabProps> = ({ pessoaId }) => {
  // TODO: integrar com pessoas_obras, obras, cronograma, etc.
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-900">
          Obras e cronograma
        </h2>
        <button className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs hover:bg-indigo-700">
          Nova obra
        </button>
      </div>

      <p className="text-xs text-gray-500 mb-2">
        Obras vinculadas, status, entregas, medições e marcos importantes.
      </p>

      <div className="text-xs text-gray-400">
        TODO: carregar obras vinculadas à pessoa {pessoaId}.
      </div>
    </div>
  );
};
