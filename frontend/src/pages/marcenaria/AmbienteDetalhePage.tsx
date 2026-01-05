// src/pages/AmbienteDetalhePage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Ambiente,
  AmbienteQuantitativo,
  buscarAmbiente,
  listarQuantitativosAmbiente,
} from "@/lib/ambientesApi";
import AmbientesTimeline from "@/components/ambientes/AmbientesTimeline";

const AmbienteDetalhePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ambiente, setAmbiente] = useState<Ambiente | null>(null);
  const [quantitativos, setQuantitativos] = useState<AmbienteQuantitativo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function carregar() {
      const a = await buscarAmbiente(id);
      const qs = await listarQuantitativosAmbiente(id);
      setAmbiente(a);
      setQuantitativos(qs);
      setLoading(false);
    }

    carregar();
  }, [id]);

  if (loading) return <div className="p-6">Carregando ambiente...</div>;
  if (!ambiente) return <div className="p-6 text-red-600">Ambiente não encontrado.</div>;

  return (
    <div className="p-6">
      <button
        onClick={() => navigate("/arquitetura/ambientes")}
        className="mb-4 text-sm text-[#4C4C4C]"
      >
        ← Voltar
      </button>

      <h1 className="text-xl font-semibold uppercase tracking-[0.3em] text-[#2E2E2E]">
        {ambiente.nome}
      </h1>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-[#E5E5E5]">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4C4C4C] mb-3">
            Dados do Ambiente
          </h2>

          <div className="text-sm text-[#4C4C4C] space-y-2">
            <p>Área: {ambiente.area_m2} m²</p>
            <p>Perímetro: {ambiente.perimetro_ml} ml</p>
            <p>Pé-direito: {ambiente.pe_direito_m} m</p>
            <p>Uso: {ambiente.uso ?? "-"}</p>
            <p>Pavimento: {ambiente.pavimento ?? "-"}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm border border-[#E5E5E5]">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4C4C4C] mb-3">
            Quantitativos
          </h2>

          {quantitativos.length === 0 ? (
            <p className="text-[#7A7A7A] text-sm">Nenhum quantitativo calculado.</p>
          ) : (
            <ul className="space-y-2">
              {quantitativos.map((q) => (
                <li
                  key={q.id}
                  className="rounded-xl bg-[#FAFAFA] px-3 py-2 border border-[#F3F3F3]"
                >
                  <div className="flex justify-between text-sm text-[#2E2E2E]">
                    <span>{q.tipo}</span>
                    <span>
                      {q.quantidade.toFixed(2)} {q.unidade}
                    </span>
                  </div>
                  {q.descricao && (
                    <div className="mt-1 text-xs text-[#7A7A7A]">{q.descricao}</div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-8">
        <AmbientesTimeline ambientes={[ambiente]} />
      </div>
    </div>
  );
};

export default AmbienteDetalhePage;
