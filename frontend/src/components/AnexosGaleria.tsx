import { useState } from "react";
import type { Anexo } from "@/pages/engenharia/ObraAnexos";
import AnexoPreviewModal from "@/components/AnexoPreviewModal";
import "@/styles/anexos-galeria.css";

type Props = {
  anexos: Anexo[];
  onDelete: (id: string) => void;
};

function ehImagem(anexo: Anexo) {
  if (anexo.mime_type?.startsWith("image/")) return true;
  return /\.(png|jpe?g|gif|webp)$/i.test(anexo.nome_arquivo);
}

export default function AnexosGaleria({ anexos, onDelete }: Props) {
  const [selecionado, setSelecionado] = useState<Anexo | null>(null);

  if (anexos.length === 0) {
    return <p>Nenhum anexo cadastrado ainda.</p>;
  }

  return (
    <>
      <div className="anexos-grid">
        {anexos.map((anexo) => {
          const image = ehImagem(anexo);

          return (
            <div
              key={anexo.id}
              className="anexo-card"
              onClick={() => setSelecionado(anexo)}
            >
              <div className="anexo-thumb">
                {image ? (
                  <img src={anexo.url_publica} alt={anexo.nome_arquivo} />
                ) : (
                  <div className="anexo-icon">
                    {anexo.mime_type?.includes("pdf") ? "PDF" : "ARQ"}
                  </div>
                )}
              </div>

              <div className="anexo-info">
                <div className="anexo-nome" title={anexo.nome_arquivo}>
                  {anexo.nome_arquivo}
                </div>
                <div className="anexo-meta">
                  <span className={`anexo-tag cat-${anexo.categoria}`}>
                    {anexo.categoria}
                  </span>
                  <a
                    href={anexo.url_publica}
                    className="anexo-link"
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Baixar
                  </a>
                  <button
                    className="anexo-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(anexo.id);
                    }}
                  >
                    Remover
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selecionado && (
        <AnexoPreviewModal
          anexo={selecionado}
          onClose={() => setSelecionado(null)}
        />
      )}
    </>
  );
}
