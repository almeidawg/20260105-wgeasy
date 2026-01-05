// src/pages/pessoas/painel/DocumentosTab.tsx
import React from "react";

interface DocumentosTabProps {
  pessoaId: string;
}

export const DocumentosTab: React.FC<DocumentosTabProps> = ({ pessoaId }) => {
  // TODO: integrar com tabela pessoas_documentos no Supabase
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-900">
          Documentos vinculados
        </h2>
        <button className="px-3 py-1.5 rounded-xl bg-[#F25C26] text-white text-xs hover:bg-[#d94d1a]">
          Upload documento
        </button>
      </div>

      <p className="text-xs text-gray-500 mb-2">
        Aqui entram contratos, RG, CPF, plantas, anexos, PDFs, etc.
      </p>

      <div className="text-xs text-gray-400">
        TODO: listar documentos da pessoa {pessoaId} a partir do Supabase.
      </div>
    </div>
  );
};
