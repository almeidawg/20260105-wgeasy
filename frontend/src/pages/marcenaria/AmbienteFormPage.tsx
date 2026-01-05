// src/pages/AmbienteFormPage.tsx
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Ambiente,
  buscarAmbiente,
  criarAmbiente,
  atualizarAmbiente,
  gerarQuantitativosBasicos,
  recalcularQuantitativosAmbiente,
} from "@/lib/ambientesApi";

const AmbienteFormPage = () => {
  const { id } = useParams();
  const editando = Boolean(id);
  const navigate = useNavigate();

  const [dados, setDados] = useState<Partial<Ambiente>>({
    nome: "",
    area_m2: null,
    perimetro_ml: null,
    pe_direito_m: null,
    pavimento: "",
    uso: "",
  });

  const [loading, setLoading] = useState<boolean>(!!id);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function carregar() {
      try {
        const amb = await buscarAmbiente(id);
        setDados(amb);
      } catch (e: any) {
        setErro(e?.message ?? "Erro ao carregar ambiente.");
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, [id]);

  function atualizarCampo<K extends keyof Ambiente>(campo: K, valor: any) {
    setDados((ant) => ({ ...ant, [campo]: valor }));
  }

  const ambienteFake: Ambiente = useMemo(
    () => ({
      id: dados.id ?? "temp",
      obra_id: dados.obra_id ?? null,
      nome: dados.nome ?? "",
      area_m2: Number(dados.area_m2 || 0),
      perimetro_ml: Number(dados.perimetro_ml || 0),
      pe_direito_m: Number(dados.pe_direito_m || 0),
      pavimento: dados.pavimento ?? null,
      uso: dados.uso ?? null,
      criado_em: "",
      atualizado_em: "",
    }),
    [dados]
  );

  const quantitativosPreview = gerarQuantitativosBasicos(ambienteFake);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro(null);

    try {
      if (editando && id) {
        const atualizado = await atualizarAmbiente(id, dados);
        await recalcularQuantitativosAmbiente(atualizado);
      } else {
        const criado = await criarAmbiente(dados);
        await recalcularQuantitativosAmbiente(criado);
      }

      navigate("/arquitetura/ambientes");
    } catch (e: any) {
      setErro(e?.message ?? "Erro ao salvar ambiente.");
    } finally {
      setSalvando(false);
    }
  }

  if (loading) return <div className="p-6">Carregando ambiente...</div>;

  return (
    <div className="p-6">
      <button
        onClick={() => navigate("/arquitetura/ambientes")}
        className="mb-4 text-sm text-[#4C4C4C]"
      >
        ← Voltar
      </button>

      <h1 className="mb-4 text-xl font-semibold uppercase tracking-[0.3em] text-[#2E2E2E]">
        {editando ? "Editar Ambiente" : "Novo Ambiente"}
      </h1>

      {erro && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {erro}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* FORMULÁRIO */}
        <form onSubmit={onSubmit} className="md:col-span-2 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#4C4C4C] uppercase tracking-[0.2em]">
              Nome do ambiente
            </label>
            <input
              type="text"
              value={dados.nome ?? ""}
              onChange={(e) => atualizarCampo("nome", e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#E5E5E5] px-3 py-2 text-sm outline-none focus:border-[#F25C26]"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#4C4C4C] uppercase tracking-[0.2em]">
                Área (m²)
              </label>
              <input
                type="number"
                step="0.01"
                value={dados.area_m2 ?? ""}
                onChange={(e) =>
                  atualizarCampo("area_m2", e.target.value ? Number(e.target.value) : null)
                }
                className="mt-1 w-full rounded-lg border border-[#E5E5E5] px-3 py-2 text-sm outline-none focus:border-[#F25C26]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4C4C4C] uppercase tracking-[0.2em]">
                Perímetro (ml)
              </label>
              <input
                type="number"
                step="0.01"
                value={dados.perimetro_ml ?? ""}
                onChange={(e) =>
                  atualizarCampo(
                    "perimetro_ml",
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                className="mt-1 w-full rounded-lg border border-[#E5E5E5] px-3 py-2 text-sm outline-none focus:border-[#F25C26]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4C4C4C] uppercase tracking-[0.2em]">
                Pé-direito (m)
              </label>
              <input
                type="number"
                step="0.01"
                value={dados.pe_direito_m ?? ""}
                onChange={(e) =>
                  atualizarCampo(
                    "pe_direito_m",
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                className="mt-1 w-full rounded-lg border border-[#E5E5E5] px-3 py-2 text-sm outline-none focus:border-[#F25C26]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#4C4C4C] uppercase tracking-[0.2em]">
                Pavimento
              </label>
              <input
                type="text"
                value={dados.pavimento ?? ""}
                onChange={(e) => atualizarCampo("pavimento", e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#E5E5E5] px-3 py-2 text-sm outline-none focus:border-[#F25C26]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4C4C4C] uppercase tracking-[0.2em]">
                Uso
              </label>
              <input
                type="text"
                value={dados.uso ?? ""}
                onChange={(e) => atualizarCampo("uso", e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#E5E5E5] px-3 py-2 text-sm outline-none focus:border-[#F25C26]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={salvando}
            className="mt-4 rounded-full bg-[#F25C26] px-6 py-2 text-sm font-medium text-white shadow-md hover:bg-[#e25221] disabled:opacity-60"
          >
            {salvando ? "Salvando..." : "Salvar ambiente"}
          </button>
        </form>

        {/* PREVIEW DE QUANTITATIVOS */}
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-[#E5E5E5]">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#4C4C4C]">
            Quantitativos calculados
          </h2>

          {quantitativosPreview.length === 0 ? (
            <p className="text-sm text-[#7A7A7A]">
              Preencha área, perímetro e pé-direito para ver os quantitativos.
            </p>
          ) : (
            <ul className="space-y-2 text-sm text-[#4C4C4C]">
              {quantitativosPreview.map((q, idx) => (
                <li
                  key={`${q.tipo}-${idx}`}
                  className="rounded-lg bg-[#FAFAFA] px-3 py-2 border border-[#F3F3F3]"
                >
                  <div className="flex justify-between">
                    <span className="font-medium">{q.tipo}</span>
                    <span>
                      {q.quantidade.toFixed(2)} {q.unidade}
                    </span>
                  </div>
                  {q.descricao && (
                    <div className="mt-1 text-xs text-[#7A7A7A]">
                      {q.descricao}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AmbienteFormPage;
