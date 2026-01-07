// Wrapper para compatibilidade de rota /juridico/financeiro

// Página Financeiro Jurídico - Conteúdo exclusivo para /juridico/financeiro
import React from "react";

const FinanceiroJuridicoPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">
        Financeiro Jurídico
      </h1>
      <p className="text-gray-600 mb-4">
        Esta página exibe informações financeiras específicas do módulo
        jurídico.
      </p>
      {/* TODO: Adicionar integração financeira jurídica */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <span className="text-gray-500">
          Em breve: Dashboard financeiro jurídico, lançamentos, cobranças, etc.
        </span>
      </div>
    </div>
  );
};

export default FinanceiroJuridicoPage;
