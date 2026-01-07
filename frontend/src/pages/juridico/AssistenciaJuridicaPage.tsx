// Wrapper para compatibilidade de rota /juridico/assistencia

// Página Assistência Jurídica - Conteúdo exclusivo para /juridico/assistencia
import React from "react";

const AssistenciaJuridicaPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">
        Assistência Jurídica
      </h1>
      <p className="text-gray-600 mb-4">
        Esta página exibe informações e suporte de assistência jurídica.
      </p>
      {/* TODO: Adicionar integração de assistência jurídica */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <span className="text-gray-500">
          Em breve: Solicitações, histórico de assistência, contatos jurídicos,
          etc.
        </span>
      </div>
    </div>
  );
};

export default AssistenciaJuridicaPage;
