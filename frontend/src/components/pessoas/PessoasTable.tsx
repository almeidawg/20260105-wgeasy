// src/components/pessoas/PessoasTable.tsx
import { useNavigate } from "react-router-dom";
import { Pessoa } from "@/lib/pessoasApi";
import { obterAvatarUrl } from "@/utils/avatarUtils";

interface Props {
  pessoas: Pessoa[];
}

const PessoasTable: React.FC<Props> = ({ pessoas }) => {
  const navigate = useNavigate();

  if (pessoas.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#E5E5E5] bg-[#FAFAFA] p-6 text-sm text-[#7A7A7A]">
        Nenhuma pessoa cadastrada ainda.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E5E5E5] bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-[#F3F3F3] text-xs uppercase tracking-[0.2em] text-[#4C4C4C]">
          <tr>
            <th className="px-4 py-3">Nome</th>
            <th className="px-4 py-3">E-mail</th>
            <th className="px-4 py-3">Unidade</th>
            <th className="px-4 py-3">Cargo</th>
            <th className="px-4 py-3">Tipo</th>
            <th className="px-4 py-3 text-right">Status</th>
          </tr>
        </thead>
        <tbody>
          {pessoas.map((pessoa, index) => (
            <tr
              key={pessoa.id}
              className={[
                "cursor-pointer text-[#4C4C4C] hover:bg-[#FAFAFA] transition",
                index % 2 === 1 ? "bg-[#FCFCFC]" : "",
              ].join(" ")}
              onClick={() => navigate(`/pessoas/${pessoa.id}`)}
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <img
                    src={obterAvatarUrl(
                      pessoa.nome,
                      pessoa.avatar_url,
                      pessoa.foto_url,
                      undefined,
                      undefined,
                      "fff",
                      32
                    )}
                    alt={pessoa.nome}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-medium text-[#2E2E2E]">
                      {pessoa.nome}
                    </div>
                    <div className="text-xs text-[#7A7A7A]">
                      {pessoa.cargo}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">{pessoa.email}</td>
              <td className="px-4 py-3">{pessoa.unidade}</td>
              <td className="px-4 py-3">{pessoa.cargo}</td>
              <td className="px-4 py-3">{pessoa.tipo}</td>
              <td className="px-4 py-3 text-right">
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PessoasTable;
