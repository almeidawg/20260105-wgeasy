import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/auth/AuthContext";

import AnexosUpload from "@/components/AnexosUpload";
import AnexosGaleria from "@/components/AnexosGaleria";
import AnexosCategorias from "@/components/AnexosCategorias";

import "@/styles/anexos.css";
import "@/styles/anexos-tabs.css";

export type Anexo = {
  id: string;
  obra_id: string;
  categoria: string;
  nome_arquivo: string;
  url_publica: string;
  mime_type: string | null;
  tamanho_bytes: number | null;
  criado_em: string | null;
  criado_por: string | null;
};

type Tab = "galeria" | "categorias";

export default function ObraAnexos() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [anexos, setAnexos] = useState<Anexo[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [tabAtiva, setTabAtiva] = useState<Tab>("galeria");

  async function carregarAnexos() {
    if (!id) return;
    setLoading(true);
    setErro(null);

    const { data, error } = await supabase
      .from("obras_anexos")
      .select("*")
      .eq("obra_id", id)
      .order("criado_em", { ascending: false });

    if (error) {
      console.error("Erro ao carregar anexos:", error);
      setErro("Não foi possível carregar os anexos.");
      setAnexos([]);
    } else {
      setAnexos((data ?? []) as Anexo[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    carregarAnexos();
  }, [id]);

  async function handleExcluir(idAnexo: string) {
    const confirmar = window.confirm("Deseja realmente remover este anexo?");
    if (!confirmar) return;

    const { error } = await supabase
      .from("obras_anexos")
      .delete()
      .eq("id", idAnexo);

    if (error) {
      console.error("Erro ao excluir anexo:", error);
      alert("Não foi possível excluir o anexo.");
      return;
    }

    setAnexos((prev) => prev.filter((a) => a.id !== idAnexo));
  }

  return (
    <div className="anexos-page">
      <button
        className="anexos-voltar"
        onClick={() => navigate(`/obras/${id}`)}
      >
        ← Voltar
      </button>

      <div className="anexos-header">
        <div>
          <h1>Anexos da obra</h1>
          <p className="anexos-subtitulo">
            Centralize contratos, plantas, PDFs, imagens e arquivos técnicos da
            obra.
          </p>
        </div>

        <AnexosUpload
          obraId={id ?? ""}
          userId={user?.id ?? null}
          onUploaded={carregarAnexos}
        />
      </div>

      <div className="anexos-tabs-container">
        <div className="anexos-tabs">
          <button
            className={`anexos-tab ${tabAtiva === "galeria" ? "active" : ""}`}
            onClick={() => setTabAtiva("galeria")}
          >
            Galeria
          </button>
          <button
            className={`anexos-tab ${
              tabAtiva === "categorias" ? "active" : ""
            }`}
            onClick={() => setTabAtiva("categorias")}
          >
            Categorias
          </button>
        </div>
      </div>

      {erro && (
        <p style={{ color: "#b91c1c", marginTop: 8, fontSize: 14 }}>{erro}</p>
      )}

      {loading && <p>Carregando anexos...</p>}

      {!loading && !erro && (
        <>
          {tabAtiva === "galeria" && (
            <AnexosGaleria anexos={anexos} onDelete={handleExcluir} />
          )}

          {tabAtiva === "categorias" && (
            <AnexosCategorias anexos={anexos} onDelete={handleExcluir} />
          )}
        </>
      )}
    </div>
  );
}
