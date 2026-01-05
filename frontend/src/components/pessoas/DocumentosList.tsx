// src/components/pessoas/DocumentosList.tsx
import { PessoaDocumento } from "@/lib/pessoasApi";

interface Props {
  documentos: PessoaDocumento[];
}

const DocumentosList: React.FC<Props> = ({ documentos = [] }) => {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#4C4C4C]">
        Documentos
      </h2>
      {documentos.length === 0 ? (
        <p className="text-sm text-[#7A7A7A]">Nenhum documento cadastrado.</p>
      ) : (
        <ul className="space-y-2 text-sm text-[#4C4C4C]">
          {documentos.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center justify-between rounded-xl border border-[#F3F3F3] bg-[#FAFAFA] px-3 py-2"
            >
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-[#7A7A7A]">
                  {doc.tipo}
                </div>
                <div className="text-xs text-[#4C4C4C]">
                  {doc.validade
                    ? `Validade: ${new Date(doc.validade).toLocaleDateString("pt-BR")}`
                    : "Sem validade definida"}
                </div>
              </div>
              {doc.arquivo_url && (
                <a
                  href={doc.arquivo_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-medium uppercase tracking-[0.18em] text-[#F25C26] hover:underline"
                >
                  Abrir
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DocumentosList;
