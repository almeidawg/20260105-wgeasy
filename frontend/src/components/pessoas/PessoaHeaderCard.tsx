// src/components/pessoas/PessoaHeaderCard.tsx
import { Pessoa } from "@/lib/pessoasApi";
import { obterAvatarUrl } from "@/utils/avatarUtils";

interface Props {
  pessoa: Pessoa;
}

const PessoaHeaderCard: React.FC<Props> = ({ pessoa }) => {
  const avatarUrl = obterAvatarUrl(
    pessoa.nome,
    pessoa.avatar_url,
    pessoa.foto_url,
    undefined,
    undefined,
    "fff",
    48
  );

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center gap-4">
        <img
          src={avatarUrl}
          alt={pessoa.nome}
          className="h-12 w-12 rounded-full object-cover"
        />
        <div className="flex flex-1 flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-semibold text-[#2E2E2E]">
              {pessoa.nome}
            </div>
            <div className="text-xs text-[#7A7A7A]">
              {pessoa.cargo} • {pessoa.unidade}
            </div>
            <div className="text-xs text-[#7A7A7A]">
              {pessoa.email} {pessoa.telefone ? `• ${pessoa.telefone}` : ""}
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2 md:mt-0">
            <span
              className={[
                "rounded-full px-3 py-1 text-xs font-medium",
                pessoa.ativo
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-700",
              ].join(" ")}
            >
              {pessoa.ativo ? "Ativo" : "Inativo"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PessoaHeaderCard;
