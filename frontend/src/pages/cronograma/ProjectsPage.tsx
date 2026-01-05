// src/pages/ProjectsPage.tsx
import { useEffect, useState } from "react";
import { listarProjects, deletarProject } from "@/lib/projectsApi";
import { Link } from "react-router-dom";
import ResponsiveTable from "@/components/ResponsiveTable";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function ProjectsPage() {
  const [dados, setDados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const projectsColumns = [
    { label: "Projeto", key: "nome" },
    { label: "Obra", key: "obras", render: (val: any) => val?.nome ?? "-" },
    {
      label: "Período",
      key: "periodo",
      render: (val: any, row: any) => `${row.inicio} → ${row.fim}`,
    },
    {
      label: "Status",
      key: "status",
      render: (val: any) => {
        const statusConfig: any = {
          ativo: { bg: "bg-green-100", text: "text-green-700", label: "Ativo" },
          inativo: {
            bg: "bg-gray-100",
            text: "text-gray-600",
            label: "Inativo",
          },
          concluido: {
            bg: "bg-blue-100",
            text: "text-blue-700",
            label: "Concluído",
          },
          cancelado: {
            bg: "bg-red-100",
            text: "text-red-700",
            label: "Cancelado",
          },
        };
        const config =
          statusConfig[val?.toLowerCase()] || statusConfig["inativo"];
        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
          >
            {config.label}
          </span>
        );
      },
    },
    {
      label: "Ações",
      key: "id",
      render: (val: any, row: any) => (
        <div className="flex gap-2 flex-wrap">
          <Link
            to={`/projects/tarefas/${val}`}
            className="text-blue-600 hover:underline text-xs"
          >
            Tarefas
          </Link>
          <Link
            to={`/projects/editar/${val}`}
            className="text-blue-600 hover:underline text-xs"
          >
            Editar
          </Link>
          <Link
            to={`/projects/timeline/${val}`}
            className="text-blue-600 hover:underline text-xs"
          >
            Timeline
          </Link>
          <button
            onClick={() => {
              if (confirm("Excluir projeto?")) {
                deletarProject(val).then(carregar);
              }
            }}
            className="text-red-600 hover:underline text-xs"
          >
            Excluir
          </button>
        </div>
      ),
    },
  ];

  async function carregar() {
    setDados(await listarProjects());
    setLoading(false);
  }

  useEffect(() => {
    carregar();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        Carregando projetos...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#2E2E2E]">
          Cronograma (Projects)
        </h1>
        <Link
          to="/projects/novo"
          className="px-4 py-2 bg-[#F25C26] text-white rounded"
        >
          Novo Projeto
        </Link>
      </div>

      <div className="bg-white border border-[#E5E5E5] rounded-xl shadow">
        <ResponsiveTable
          columns={projectsColumns}
          data={dados}
          emptyMessage="Nenhum projeto encontrado."
        />
      </div>
    </div>
  );
}
