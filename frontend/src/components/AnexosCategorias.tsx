import type { Anexo } from "@/pages/engenharia/ObraAnexos";
import "@/styles/anexos-lista.css";

type Props = {
  anexos: Anexo[];
  onDelete: (id: string) => void;
};

const LABELS: Record<string, string> = {
  contratos: "Contratos",
  plantas: "Plantas / Arquitetura",
  tecnico: "Técnico / Marcenaria",
  fotos: "Fotos da obra",
  relatorios: "Relatórios",
  outros: "Outros",
};

function formatarTamanho(bytes: number | null) {
  if (!bytes) return "-";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export default function AnexosCategorias({ anexos, onDelete }: Props) {
  const porCategoria: Record<string, Anexo[]> = {};

  anexos.forEach((a) => {
    if (!porCategoria[a.categoria]) porCategoria[a.categoria] = [];
    porCategoria[a.categoria].push(a);
  });

  const categorias = Object.keys(porCategoria);

  if (categorias.length === 0) {
    return <p>Nenhum anexo cadastrado ainda.</p>;
  }

  return (
    <div className="anexos-categorias">
      {categorias.map((cat) => (
        <section key={cat} className="anexos-categoria-bloco">
          <h2>{LABELS[cat] ?? cat}</h2>

          <ul>
            {porCategoria[cat].map((a) => (
              <li key={a.id} className="anexos-categoria-item">
                <div className="anexos-categoria-info">
                  <strong>{a.nome_arquivo}</strong>
                  <span>{formatarTamanho(a.tamanho_bytes)}</span>
                  {a.criado_em && (
                    <span>
                      {new Date(a.criado_em).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                </div>
                <div className="anexos-categoria-actions">
                  <a
                    href={a.url_publica}
                    target="_blank"
                    rel="noreferrer"
                    className="anexos-categoria-link"
                  >
                    Abrir
                  </a>
                  <button
                    onClick={() => onDelete(a.id)}
                    className="anexos-categoria-delete"
                  >
                    Remover
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
