// src/pages/ProjectTimelinePage.tsx
import { useEffect, useState } from "react";
import { listarTasks } from "@/lib/tasksApi";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";

// ===============================
// TEMA WG EASY 2026
// ===============================
const WG_COLORS = {
  barra: "#F25C26",
  fundo: "#F3F3F3",
  borda: "#E5E5E5",
  texto: "#2E2E2E",
  cinza: "#4C4C4C",
};

export default function ProjectTimelinePage() {
  const { id } = useParams();
  const [tarefas, setTarefas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function carregar() {
    if (!id) return;
    setLoading(true);
    const lista = await listarTasks(id);
    setTarefas(lista);
    setLoading(false);
  }

  useEffect(() => {
    carregar();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh] text-[#4C4C4C]">
        Carregando timeline...
      </div>
    );
  }

  if (!tarefas.length) {
    return (
      <div className="flex justify-center items-center h-[50vh] text-[#4C4C4C]">
        Nenhuma tarefa cadastrada.
      </div>
    );
  }

  // ===============================
  // CÁLCULOS DE GANTT
  // ===============================

  const inicioProjeto = dayjs(
    tarefas.reduce(
      (menor, t) => (dayjs(t.inicio).isBefore(dayjs(menor)) ? t.inicio : menor),
      tarefas[0].inicio
    )
  );

  function diasEntre(i: string, f: string) {
    return dayjs(f).diff(dayjs(i), "day") || 1;
  }

  return (
    <div className="space-y-8">

      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-semibold text-[#2E2E2E]">Linha do Tempo (Gantt)</h1>
        <p className="text-sm text-[#4C4C4C]">
          Visualização executiva do cronograma do projeto.
        </p>
      </div>

      {/* Gantt Chart */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl shadow p-6 overflow-x-auto">

        <table className="min-w-[900px] w-full text-sm">
          <thead>
            <tr>
              <th className="p-2 text-left">Tarefa</th>
              <th className="p-2 text-left">Responsável</th>
              <th className="p-2 text-left">Linha do Tempo</th>
            </tr>
          </thead>

          <tbody>
            {tarefas.map((t) => {
              const offsetDias = diasEntre(
                inicioProjeto.format("YYYY-MM-DD"),
                t.inicio
              );

              const duracaoDias = diasEntre(t.inicio, t.fim);

              // pixels por dia (ajustável)
              const pxPorDia = 22;

              return (
                <tr key={t.id} className="border-b hover:bg-[#fafafa]">

                  {/* Nome */}
                  <td className="p-3 font-medium text-[#2E2E2E]">{t.titulo}</td>

                  {/* Responsável */}
                  <td className="p-3 text-[#4C4C4C]">{t.responsavel || "-"}</td>

                  {/* Barra */}
                  <td className="p-3">
                    <div
                      className="relative h-6 rounded-lg"
                      style={{
                        background: WG_COLORS.fundo,
                        border: `1px solid ${WG_COLORS.borda}`,
                        minHeight: "24px",
                      }}
                    >
                      <div
                        className="absolute h-6 rounded-lg shadow-md transition-all"
                        style={{
                          marginLeft: offsetDias * pxPorDia,
                          width: duracaoDias * pxPorDia,
                          background: WG_COLORS.barra,
                        }}
                      />
                    </div>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>

      </div>
    </div>
  );
}
