// ============================================================
// COMPONENTE: OportunidadeCard (padrão WG EASY)
// Usado em Kanban, listas, modal, etc.
// ============================================================

import {
  Pencil,
  Trash2,
  FileText,
  MessageCircle,
  Mail,
  ChevronRight,
} from "lucide-react";
import { obterAvatarUrl, gerarCorPorNome } from "@/utils/avatarUtils";
import { formatarMoeda } from "@/utils/formatadores";
import type { Estagio, Nucleo } from "@/constants/oportunidades";

export interface OportunidadeClienteUI {
  id: string;
  nome: string;
  razao_social?: string | null;
  email?: string | null;
  telefone?: string | null;
  cargo?: string | null;
  unidade?: string | null;
  avatar_url?: string | null;
  foto_url?: string | null;
  avatar?: string | null;
}

export interface OportunidadeUI {
  id: string;
  titulo: string;
  estagio: Estagio;
  valor_estimado?: number | null;
  previsao_fechamento?: string | null;
  origem?: string | null;
  descricao?: string | null;
  observacoes?: string | null;
  cliente?: OportunidadeClienteUI | null;
  nucleos?: Array<{ nucleo: Nucleo; valor: number | null }>;
}

interface OportunidadeCardProps {
  oportunidade: OportunidadeUI;
  mode?: "kanban" | "list";
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onPdf?: () => void;
}

export default function OportunidadeCard({
  oportunidade,
  mode = "kanban",
  onClick,
  onEdit,
  onDelete,
  onPdf,
}: OportunidadeCardProps) {
  const cliente = oportunidade.cliente;

  const avatarUrl = obterAvatarUrl(
    cliente?.nome || "Cliente",
    cliente?.avatar_url,
    cliente?.foto_url,
    cliente?.avatar,
    gerarCorPorNome(cliente?.nome || "Cliente")
  );

  const whatsappLink = cliente?.telefone
    ? "https://wa.me/55" + cliente.telefone.replace(/\D/g, "")
    : null;

  const emailLink = cliente?.email ? `mailto:${cliente.email}` : null;

  const isKanban = mode === "kanban";

  return (
    <div
      className={`w-full bg-white rounded-xl border shadow-sm hover:shadow-md hover:border-[#F25C26] transition cursor-pointer ${
        isKanban ? "" : "p-3"
      }`}
      onClick={onClick}
    >
      <div className={`${isKanban ? "p-3 pb-2" : "pb-2"} flex items-start justify-between border-b border-gray-100`}>
        {/* Avatar + Cliente + Origem */}
        <div className="flex items-center gap-2 min-w-0">
          <img
            src={avatarUrl}
            alt={cliente?.nome || "Cliente"}
            className="w-8 h-8 rounded-full object-cover border"
          />

          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-gray-800 truncate">
              {cliente?.nome ?? "Cliente não informado"}
            </span>
            {oportunidade.origem && (
              <span className="text-[10px] text-gray-500 truncate">
                {oportunidade.origem}
              </span>
            )}
          </div>
        </div>

        {/* AÇÕES */}
        <div
          className="flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600"
              title="Editar"
            >
              <Pencil size={14} />
            </button>
          )}

          {onPdf && (
            <button
              onClick={onPdf}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600"
              title="PDF"
            >
              <FileText size={14} />
            </button>
          )}

          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              className="p-1.5 rounded-md hover:bg-green-50 text-green-600"
              title="WhatsApp"
            >
              <MessageCircle size={14} />
            </a>
          )}

          {emailLink && (
            <a
              href={emailLink}
              className="p-1.5 rounded-md hover:bg-blue-50 text-blue-600"
              title="E-mail"
            >
              <Mail size={14} />
            </a>
          )}

          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1.5 rounded-md hover:bg-red-50 text-red-600"
              title="Excluir"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <div className={`${isKanban ? "p-3 pt-2" : "pt-2"}`}>
        <div className="text-sm font-semibold text-[#1A1A1A] mb-1 line-clamp-2">
          {oportunidade.titulo}
        </div>

        {oportunidade.descricao && (
          <div className="text-xs text-gray-500 line-clamp-2 mb-2">
            {oportunidade.descricao}
          </div>
        )}

        {/* Núcleos */}
        {oportunidade.nucleos && oportunidade.nucleos.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {oportunidade.nucleos.map((n, idx) => (
              <span
                key={idx}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200"
              >
                {n.nucleo}
                {n.valor != null && ` • ${formatarMoeda(n.valor)}`}
              </span>
            ))}
          </div>
        )}

        {/* RODAPÉ */}
        <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100">
          <div className="flex flex-col">
            <span className="text-[11px] text-gray-500">Estágio</span>
            <span className="text-[11px] font-semibold text-gray-800">
              {oportunidade.estagio}
            </span>
          </div>

          {(() => {
            // Calcular valor: usar valor_estimado ou somar núcleos
            const valorNucleos = oportunidade.nucleos?.reduce((acc, n) => acc + (n.valor || 0), 0) || 0;
            const valorFinal = oportunidade.valor_estimado ?? (valorNucleos > 0 ? valorNucleos : null);

            return valorFinal != null ? (
              <div className="flex flex-col text-right">
                <span className="text-[11px] text-gray-500">Valor estimado</span>
                <span className="text-[12px] font-bold text-[#F25C26]">
                  {formatarMoeda(valorFinal)}
                </span>
              </div>
            ) : null;
          })()}
        </div>

        {!isKanban && (
          <div className="flex justify-end mt-2 text-[11px] text-gray-400 items-center gap-1">
            Ver detalhes <ChevronRight size={12} />
          </div>
        )}
      </div>
    </div>
  );
}
