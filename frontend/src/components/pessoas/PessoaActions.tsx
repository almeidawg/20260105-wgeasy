// src/components/pessoas/PessoaActions.tsx
import React from "react";

export interface PessoaActionsProps {
  id: string;
  nome: string;
  email?: string | null;
  telefone?: string | null;
  driveFolderUrl?: string | null;
}

export const PessoaActions: React.FC<PessoaActionsProps> = ({
  id,
  nome,
  email,
  telefone,
  driveFolderUrl,
}) => {
  const openWhatsApp = () => {
    if (!telefone) return;
    const cleanPhone = telefone.replace(/\D/g, "");
    const text = encodeURIComponent(`Olá ${nome}, tudo bem? Aqui é do Grupo WG Almeida.`);
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank");
  };

  const sendEmail = () => {
    if (!email) return;
    const subject = encodeURIComponent(`Contato Grupo WG Almeida`);
    const body = encodeURIComponent(`Olá ${nome},\n\n`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  const openDrive = () => {
    if (!driveFolderUrl) return;
    window.open(driveFolderUrl, "_blank");
  };

  const criarProposta = () => {
    // Ajuste a rota conforme sua estrutura de propostas
    window.open(`/propostas/nova?pessoaId=${id}`, "_self");
  };

  const criarContrato = () => {
    window.open(`/contratos/novo?pessoaId=${id}`, "_self");
  };

  const criarObra = () => {
    window.open(`/obras/nova?pessoaId=${id}`, "_self");
  };

  return (
    <div className="flex flex-wrap gap-2">
      {telefone && (
        <button
          type="button"
          onClick={openWhatsApp}
          className="px-3 py-2 rounded-xl text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition"
        >
          WhatsApp
        </button>
      )}

      {email && (
        <button
          type="button"
          onClick={sendEmail}
          className="px-3 py-2 rounded-xl text-xs font-medium bg-gray-900 text-white hover:bg-black transition"
        >
          Enviar e-mail
        </button>
      )}

      <button
        type="button"
        onClick={criarProposta}
        className="px-3 py-2 rounded-xl text-xs font-medium bg-amber-500 text-white hover:bg-amber-600 transition"
      >
        Nova proposta
      </button>

      <button
        type="button"
        onClick={criarContrato}
        className="px-3 py-2 rounded-xl text-xs font-medium bg-sky-600 text-white hover:bg-sky-700 transition"
      >
        Novo contrato
      </button>

      <button
        type="button"
        onClick={criarObra}
        className="px-3 py-2 rounded-xl text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition"
      >
        Nova obra
      </button>

      {driveFolderUrl && (
        <button
          type="button"
          onClick={openDrive}
          className="px-3 py-2 rounded-xl text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
        >
          Pasta no Drive
        </button>
      )}
    </div>
  );
};
