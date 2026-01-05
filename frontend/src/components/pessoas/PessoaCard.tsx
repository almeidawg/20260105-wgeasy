import { Pencil, Trash2, Mail, FileText, MessageCircle, FileCheck, Calendar, Phone } from "lucide-react";
import type { Pessoa } from "@/types/pessoas";
import { obterAvatarUrl } from "@/utils/avatarUtils";

interface PessoaCardProps {
  pessoa: Pessoa & { data_vinculo?: string | null };
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onPdf?: () => void;
  onVerPropostas?: () => void;
}

export default function PessoaCard({
  pessoa,
  onClick,
  onEdit,
  onDelete,
  onPdf,
  onVerPropostas,
}: PessoaCardProps) {
  const avatarUrl = obterAvatarUrl(
    pessoa.nome,
    pessoa.avatar_url,
    pessoa.foto_url,
    undefined,
    undefined,
    "fff",
    64
  );

  // Links condicionais
  const telefoneNumeros = pessoa.telefone?.replace(/\D/g, "");
  const whatsappLink = telefoneNumeros ? `https://wa.me/55${telefoneNumeros}` : null;
  const emailLink = pessoa.email ? `mailto:${pessoa.email}` : null;

  // Helpers para determinar disponibilidade
  const temTelefone = !!telefoneNumeros;
  const temEmail = !!pessoa.email;

  // Label para data baseado no tipo
  const getLabelData = () => {
    switch (pessoa.tipo) {
      case "CLIENTE":
        return "Cliente desde";
      case "COLABORADOR":
        return "Colaborador desde";
      case "FORNECEDOR":
        return "Fornecedor desde";
      case "PRESTADOR":
        return "Prestador desde";
      default:
        return "Desde";
    }
  };

  return (
    <div
      className="w-full p-4 bg-white border rounded-xl shadow-sm flex items-center gap-4 hover:shadow-md transition cursor-pointer"
      onClick={onClick}
    >
      {/* Avatar */}
      <img
        src={avatarUrl}
        alt={pessoa.nome}
        className="w-12 h-12 rounded-full object-cover border"
      />

      {/* Informações */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm truncate">{pessoa.nome}</h3>

        <div className="flex flex-wrap items-center text-xs text-gray-500 mt-1 gap-2">
          {pessoa.cargo && <span>{pessoa.cargo}</span>}
          {pessoa.unidade && <span className="border-l pl-2">{pessoa.unidade}</span>}
          {pessoa.data_vinculo && (
            <span className="flex items-center gap-1 text-[#F25C26] border-l pl-2">
              <Calendar size={12} />
              {getLabelData()} {new Date(pessoa.data_vinculo).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center text-xs text-gray-400 mt-1 gap-3">
          {pessoa.email && (
            <span className="flex items-center gap-1">
              <Mail size={10} />
              {pessoa.email}
            </span>
          )}
          {pessoa.telefone && (
            <span className="flex items-center gap-1">
              <Phone size={10} />
              {pessoa.telefone}
            </span>
          )}
        </div>
      </div>

      {/* Ações - ícones padronizados */}
      <div
        className="flex items-center gap-1"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ver Propostas (só para clientes) */}
        {pessoa.tipo === "CLIENTE" && onVerPropostas && (
          <button
            onClick={onVerPropostas}
            className="p-2 rounded-md hover:bg-[#F25C26]/10 text-[#F25C26]"
            title="Ver Propostas"
          >
            <FileCheck size={16} />
          </button>
        )}

        {/* Editar */}
        <button
          onClick={onEdit}
          className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
          title="Editar"
        >
          <Pencil size={16} />
        </button>

        {/* PDF */}
        <button
          onClick={onPdf}
          className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
          title="Gerar PDF"
        >
          <FileText size={16} />
        </button>

        {/* WhatsApp - sempre visível, desabilitado se não tem telefone */}
        {temTelefone ? (
          <a
            href={whatsappLink!}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-md hover:bg-green-50 text-green-600"
            title={`WhatsApp: ${pessoa.telefone}`}
          >
            <MessageCircle size={16} />
          </a>
        ) : (
          <span
            className="p-2 rounded-md text-gray-300 cursor-not-allowed"
            title="Sem telefone cadastrado"
          >
            <MessageCircle size={16} />
          </span>
        )}

        {/* Email - sempre visível, desabilitado se não tem email */}
        {temEmail ? (
          <a
            href={emailLink!}
            className="p-2 rounded-md hover:bg-blue-50 text-blue-600"
            title={`Email: ${pessoa.email}`}
          >
            <Mail size={16} />
          </a>
        ) : (
          <span
            className="p-2 rounded-md text-gray-300 cursor-not-allowed"
            title="Sem email cadastrado"
          >
            <Mail size={16} />
          </span>
        )}

        {/* Excluir */}
        <button
          onClick={onDelete}
          className="p-2 rounded-md hover:bg-red-50 text-red-600"
          title="Excluir"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
