// src/pages/pessoas/painel/HistoricoTab.tsx
import React from "react";

interface HistoricoTabProps {
  pessoaId: string;
}

export const HistoricoTab: React.FC<HistoricoTabProps> = ({ pessoaId }) => {
  // TODO: integrar com pessoas_avaliacoes, interações, atividades, etc.
  const timelineMock = [
    {
      id: 1,
      data: "10/01/2025",
      tipo: "Contato",
      descricao: "Reunião inicial e entendimento da necessidade da obra.",
    },
    {
      id: 2,
      data: "20/01/2025",
      tipo: "Proposta",
      descricao: "Envio da proposta comercial WG Easy.",
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <h2 className="text-sm font-semibold text-gray-900 mb-3">
        Histórico de interações
      </h2>
      <p className="text-xs text-gray-500 mb-4">
        Linha do tempo da jornada desse cliente com o Grupo WG Almeida.
      </p>

      <div className="space-y-4">
        {timelineMock.map((item) => (
          <div key={item.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-2 h-2 rounded-full bg-gray-900 mt-1" />
              <div className="flex-1 w-px bg-gray-200" />
            </div>
            <div>
              <div className="text-[11px] text-gray-500">{item.data}</div>
              <div className="text-xs font-semibold text-gray-900">
                {item.tipo}
              </div>
              <div className="text-xs text-gray-600">{item.descricao}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-[11px] text-gray-400">
        TODO: integrar com registros reais de atividades da pessoa {pessoaId}.
      </div>
    </div>
  );
};
