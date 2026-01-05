// ============================================================
// PÁGINA: Listagem de Contratos
// Sistema WG Easy - Grupo WG Almeida
// ============================================================

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listarContratos, type Contrato } from "@/lib/contratosApi";
import {
  getStatusContratoColor,
  getStatusContratoLabel,
  getUnidadeNegocioColor,
  getUnidadeNegocioLabel,
} from "@/types/contratos";
import ResponsiveTable from "@/components/ResponsiveTable";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useSwipe } from "@/hooks/useSwipe";

export default function ContratosPage() {
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { onTouchStart, onTouchEnd } = useSwipe({
    onSwipeLeft: () => navigate("/dashboard"),
    onSwipeRight: () => navigate(-1),
  });

  const columns = [
    {
      label: "Número",
      key: "numero",
      render: (val: any) => <span className="font-semibold">{val}</span>,
    },
    { label: "Cliente", key: "cliente_nome" },
    {
      label: "Unidade",
      key: "unidade_negocio",
      render: (val: any) => (
        <span
          className="px-2 py-1 rounded text-xs font-semibold text-white"
          style={{ backgroundColor: getUnidadeNegocioColor(val) }}
        >
          {getUnidadeNegocioLabel(val)}
        </span>
      ),
    },
    {
      label: "Valor",
      key: "valor_total",
      render: (val: any) =>
        `R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
    },
    {
      label: "Status",
      key: "status",
      render: (val: any) => (
        <span
          className="px-2 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: `${getStatusContratoColor(val)}20`,
            color: getStatusContratoColor(val),
          }}
        >
          {getStatusContratoLabel(val)}
        </span>
      ),
    },
    {
      label: "Data",
      key: "data_criacao",
      render: (val: any) => new Date(val).toLocaleDateString("pt-BR"),
    },
  ];

  useEffect(() => {
    carregarContratos();
  }, []);

  async function carregarContratos() {
    try {
      setLoading(true);
      const data = await listarContratos();
      setContratos(data);
    } catch (error) {
      console.error("Erro ao carregar contratos:", error);
    } finally {
      setLoading(false);
    }
  }

  const contratosFiltrados =
    filtroStatus === "todos"
      ? contratos
      : contratos.filter((c) => c.status === filtroStatus);

  return (
    <div
      className="p-6 space-y-4"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2E2E2E]">Contratos</h1>
          <p className="text-sm text-gray-600 mt-1">
            Gerencie todos os contratos do sistema
          </p>
        </div>
        <button
          onClick={() => navigate("/contratos/novo")}
          className="px-4 py-2 bg-[#F25C26] text-white rounded-lg hover:bg-[#e04a1a] font-medium flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Novo Contrato
        </button>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Status:</span>
        <button
          onClick={() => setFiltroStatus("todos")}
          className={`px-3 py-1 rounded-lg text-sm font-medium ${
            filtroStatus === "todos"
              ? "bg-[#F25C26] text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Todos ({contratos.length})
        </button>
        <button
          onClick={() => setFiltroStatus("rascunho")}
          className={`px-3 py-1 rounded-lg text-sm font-medium ${
            filtroStatus === "rascunho"
              ? "bg-[#F25C26] text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Rascunhos ({contratos.filter((c) => c.status === "rascunho").length})
        </button>
        <button
          onClick={() => setFiltroStatus("aguardando_assinatura")}
          className={`px-3 py-1 rounded-lg text-sm font-medium ${
            filtroStatus === "aguardando_assinatura"
              ? "bg-[#F25C26] text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Aguardando (
          {contratos.filter((c) => c.status === "aguardando_assinatura").length}
          )
        </button>
        <button
          onClick={() => setFiltroStatus("ativo")}
          className={`px-3 py-1 rounded-lg text-sm font-medium ${
            filtroStatus === "ativo"
              ? "bg-[#F25C26] text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Ativos ({contratos.filter((c) => c.status === "ativo").length})
        </button>
      </div>

      {/* Tabela */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#F25C26]" />
            <p className="text-sm text-gray-600 mt-2">
              Carregando contratos...
            </p>
          </div>
        ) : (
          <ResponsiveTable
            columns={columns}
            data={contratosFiltrados}
            emptyMessage="Nenhum contrato encontrado. Comece criando um novo contrato."
            onRowClick={(contrato: Contrato) =>
              navigate(`/contratos/${contrato.id}`)
            }
            actions={(contrato: Contrato) => (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/contratos/${contrato.id}`);
                }}
                className="text-[#F25C26] hover:text-[#e04a1a] font-medium text-xs md:text-sm"
              >
                Ver
              </button>
            )}
          />
        )}
      </div>

      {/* Estatísticas */}
      {!loading && contratos.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Total de Contratos
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {contratos.length}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Valor Total
            </p>
            <p className="text-2xl font-bold text-[#F25C26] mt-1">
              R${" "}
              {contratos
                .reduce((acc, c) => acc + c.valor_total, 0)
                .toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 0,
                })}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Contratos Ativos
            </p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {contratos.filter((c) => c.status === "ativo").length}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Em Execução
            </p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {contratos.filter((c) => c.status === "em_execucao").length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
