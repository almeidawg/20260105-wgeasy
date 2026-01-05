// src/pages/ProjectKanbanPage.tsx
import { useEffect, useState } from "react";
import { listarTasks, atualizarTask } from "@/lib/tasksApi";
import { useParams } from "react-router-dom";

const colunas = {
  pendente: "Pendente",
  andamento: "Em andamento",
  atrasado: "Atrasado",
  concluida: "Concluída",
};

export default function ProjectKanbanPage() {
  const { id } = useParams();
  const [tasks, setTasks] = useState<any[]>([]);
  const [drag, setDrag] = useState<any>(null);

  async function carregar() {
    if (!id) return;
    setTasks(await listarTasks(id));
  }

  useEffect(() => {
    carregar();
  }, [id]);

  async function mover(item: any, novaColuna: string) {
    await atualizarTask(item.id, { status: novaColuna });
    carregar();
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {Object.entries(colunas).map(([status, label]) => (
        <div key={status} className="bg-white border rounded-xl shadow p-4">

          <h2 className="text-lg font-semibold text-[#2E2E2E] mb-4">
            {label}
          </h2>

          <div
            className="space-y-3 min-h-[200px]"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => mover(drag, status)}
          >
            {tasks
              .filter((t) => t.status === status)
              .map((t) => (
                <div
                  key={t.id}
                  draggable
                  onDragStart={() => setDrag(t)}
                  className="p-3 bg-[#F3F3F3] border border-[#E5E5E5] rounded-lg shadow hover:shadow-md cursor-grab"
                >
                  <p className="font-medium text-[#2E2E2E]">{t.titulo}</p>
                  <p className="text-xs text-[#4C4C4C]">
                    {t.inicio} → {t.fim}
                  </p>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
