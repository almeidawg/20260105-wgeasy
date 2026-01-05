import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/auth/AuthContext";
import "@/styles/obra-detalhes.css";

type Obra = {
  id: string;
  nome: string;
  descricao: string | null;
  endereco: string | null;
  status: string | null;
  data_prevista_entrega: string | null;
  data_inicio: string | null;
  criado_em: string | null;
  empresa_id: string | null;
  responsavel_id: string | null;
};

const STATUS_LABEL: Record<string, string> = {
  em_planejamento: "Em planejamento",
  planejamento: "Planejamento",
  em_execucao: "Em execução",
  concluida: "Concluída",
};

export default function ObraDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [obra, setObra] = useState<Obra | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setErro("Obra não encontrada.");
      setLoading(false);
      return;
    }

    async function carregar() {
      setLoading(true);
      setErro(null);

      const { data, error } = await supabase
        .from("obras")
        .select("*")
        .eq("id", id)
        .limit(1)
        .single();

      if (error) {
        console.error("Erro ao buscar obra:", error);
        setErro("Não foi possível carregar os dados da obra.");
        setObra(null);
      } else {
        setObra(data as Obra);
      }

      setLoading(false);
    }

    carregar();
  }, [id]);

  const statusTexto =
    obra?.status && STATUS_LABEL[obra.status]
      ? STATUS_LABEL[obra.status]
      : obra?.status ?? "Sem status";

  function formatarData(valor: string | null | undefined) {
    if (!valor) return "-";
    const d = new Date(valor);
    if (Number.isNaN(d.getTime())) return valor;
    return d.toLocaleDateString("pt-BR");
  }

  return (
    <div className="obra-detalhes-page">
      <div className="obra-detalhes-header">
        <button className="obra-voltar" onClick={() => navigate("/obras")}>
          ← Voltar para obras
        </button>

        <div>
          <h1>{obra?.nome ?? "Detalhes da obra"}</h1>
          {obra && (
            <span className={`obra-status-pill status-${obra.status ?? "default"}`}>
              {statusTexto}
            </span>
          )}
        </div>
      </div>

      {loading && (
        <div className="obra-card">
          <p>Carregando informações da obra...</p>
        </div>
      )}

      {!loading && erro && (
        <div className="obra-card erro">
          <p>{erro}</p>
        </div>
      )}

      {!loading && obra && (
        <>
          {/* Card principal com dados da obra */}
          <section className="obra-card obra-card-principal">
            <div className="obra-card-header">
              <h2>Informações gerais</h2>
              {user && (
                <button className="obra-acao-secundaria" disabled>
                  Editar (em breve)
                </button>
              )}
            </div>

            <div className="obra-grid">
              <div className="obra-info-bloco">
                <span className="obra-info-label">Endereço</span>
                <p className="obra-info-valor">
                  {obra.endereco || "Não informado"}
                </p>
              </div>

              <div className="obra-info-bloco">
                <span className="obra-info-label">Data prevista de entrega</span>
                <p className="obra-info-valor">
                  {formatarData(obra.data_prevista_entrega)}
                </p>
              </div>

              <div className="obra-info-bloco">
                <span className="obra-info-label">Início da obra</span>
                <p className="obra-info-valor">
                  {formatarData(obra.data_inicio)}
                </p>
              </div>

              <div className="obra-info-bloco">
                <span className="obra-info-label">Criada em</span>
                <p className="obra-info-valor">
                  {formatarData(obra.criado_em)}
                </p>
              </div>
            </div>

            <div className="obra-descricao">
              <span className="obra-info-label">Descrição</span>
              <p className="obra-info-valor">
                {obra.descricao || "Nenhuma descrição cadastrada."}
              </p>
            </div>
          </section>

          {/* Card de ações / módulos vinculados */}
          <section className="obra-card obra-card-modulos">
            <div className="obra-card-header">
              <h2>Módulos da obra</h2>
              <span className="obra-modulos-sub">
                Em breve, toda a operação conectada aqui.
              </span>
            </div>

            <div className="obra-modulos-grid">
              <button
                className="obra-modulo-botao"
                onClick={() => navigate(`/obras/${obra.id}`)}
              >
                🧭 Etapas da obra
                <span>Planejamento, execução e entrega.</span>
              </button>

              <button
                className="obra-modulo-botao"
                onClick={() => navigate("/marcenaria")}
              >
                🪚 Marcenaria
                <span>Ambientes, peças e status de produção.</span>
              </button>

              <button
                className="obra-modulo-botao"
                onClick={() => navigate("/upload")}
              >
                📎 Anexos e documentos
                <span>PDFs, contratos, plantas e relatórios.</span>
              </button>

              <button
                className="obra-modulo-botao"
                onClick={() => navigate("/financeiro")}
              >
                💰 Financeiro
                <span>Custos, receitas e fluxo da obra.</span>
              </button>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
