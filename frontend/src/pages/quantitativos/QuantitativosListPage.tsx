// ============================================================
// PÁGINA: Listagem de Quantitativos de Projeto
// Sistema WG Easy - Grupo WG Almeida
// ============================================================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ResponsiveTable from "@/components/ResponsiveTable";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  listarQuantitativosProjetos,
  obterEstatisticasQuantitativos,
  deletarQuantitativoProjeto,
} from "../../services/quantitativosApi";
import type {
  QuantitativoProjetoCompleto,
  QuantitativosFiltros,
  QuantitativosEstatisticas,
  NucleoQuantitativo,
  StatusQuantitativo,
} from "../../types/quantitativos";
import {
  getNucleoLabel,
  getNucleoColor,
  getStatusLabel,
  getStatusColor,
  formatarPreco,
  formatarAreaComUnidade,
} from "../../types/quantitativos";

export default function QuantitativosListPage() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Estados
  const [quantitativos, setQuantitativos] = useState<QuantitativoProjetoCompleto[]>([]);
  const [estatisticas, setEstatisticas] = useState<QuantitativosEstatisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState<QuantitativosFiltros>({});

  const quantitativosColumns = [
    { label: "Número", key: "numero", render: (val: any) => `#${val || '-'}` },
    { label: "Nome", key: "nome" },
    { label: "Cliente", key: "cliente_nome" },
    {
      label: "Núcleo",
      key: "nucleo",
      render: (val: any) => {
        const config = { bg: 'bg-blue-100', text: 'text-blue-700' };
        return <span className={`px-2 py-1 rounded text-xs font-medium ${config.bg} ${config.text}`}>{getNucleoLabel(val)}</span>;
      }
    },
    {
      label: "Status",
      key: "status",
      render: (val: any) => {
        const statusColors: any = {
          'em_elaboracao': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Em Elaboração' },
          'aprovado': { bg: 'bg-green-100', text: 'text-green-700', label: 'Aprovado' },
          'revisao': { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Em Revisão' },
          'arquivado': { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Arquivado' },
        };
        const config = statusColors[val] || { bg: 'bg-gray-100', text: 'text-gray-600', label: getStatusLabel(val) };
        return <span className={`px-2 py-1 rounded text-xs font-medium ${config.bg} ${config.text}`}>{config.label}</span>;
      }
    },
    { label: "Área", key: "area_total", render: (val: any) => formatarAreaComUnidade(val || 0) },
    { label: "Ambientes", key: "total_ambientes" },
    { label: "Itens", key: "total_itens" },
    { label: "Valor", key: "valor_total", render: (val: any) => formatarPreco(val || 0) },
    {
      label: "Ações",
      key: "id",
      render: (val: any, row: any) => (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => navigate(`/quantitativos/${val}`)}
            className="text-blue-600 hover:underline text-xs"
          >
            Ver
          </button>
          <button
            onClick={() => navigate(`/quantitativos/editar/${val}`)}
            className="text-blue-600 hover:underline text-xs"
          >
            Editar
          </button>
          <button
            onClick={() => handleDeletar(val, row.nome)}
            className="text-red-600 hover:underline text-xs"
          >
            Deletar
          </button>
        </div>
      )
    },
  ];

  // Carregar dados
  useEffect(() => {
    carregarDados();
  }, [filtros]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [projetosData, statsData] = await Promise.all([
        listarQuantitativosProjetos(filtros),
        obterEstatisticasQuantitativos(),
      ]);
      setQuantitativos(projetosData);
      setEstatisticas(statsData);
    } catch (error) {
      console.error("Erro ao carregar quantitativos:", error);
      alert("Erro ao carregar quantitativos");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletar = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja deletar o quantitativo "${nome}"?`)) {
      return;
    }

    try {
      await deletarQuantitativoProjeto(id);
      alert("Quantitativo deletado com sucesso!");
      carregarDados();
    } catch (error) {
      console.error("Erro ao deletar quantitativo:", error);
      alert("Erro ao deletar quantitativo");
    }
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "600", marginBottom: "8px" }}>
              📐 Quantitativos de Projeto
            </h1>
            <p style={{ color: "#666", fontSize: "14px" }}>
              Gestão completa de quantitativos executivos
            </p>
          </div>
          <button
            onClick={() => navigate("/quantitativos/novo")}
            style={{
              background: "linear-gradient(135deg, #5E9B94 0%, #2B4580 100%)",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              fontSize: "15px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "transform 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            + Novo Quantitativo
          </button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      {estatisticas && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <StatCard
            label="Total de Projetos"
            value={estatisticas.total_projetos}
            color="#5E9B94"
          />
          <StatCard
            label="Em Elaboração"
            value={estatisticas.total_em_elaboracao}
            color="#FFA726"
          />
          <StatCard
            label="Aprovados"
            value={estatisticas.total_aprovados}
            color="#66BB6A"
          />
          <StatCard
            label="Valor Total"
            value={formatarPreco(estatisticas.valor_total_geral)}
            color="#2B4580"
          />
        </div>
      )}

      {/* Filtros */}
      <div
        style={{
          background: "#F8F9FA",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
          }}
        >
          {/* Busca */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "13px",
                fontWeight: "500",
                color: "#333",
              }}
            >
              Buscar
            </label>
            <input
              type="text"
              placeholder="Número ou nome..."
              value={filtros.busca || ""}
              onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #DDD",
                borderRadius: "6px",
                fontSize: "14px",
              }}
            />
          </div>

          {/* Núcleo */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "13px",
                fontWeight: "500",
                color: "#333",
              }}
            >
              Núcleo
            </label>
            <select
              value={filtros.nucleo || ""}
              onChange={(e) =>
                setFiltros({
                  ...filtros,
                  nucleo: e.target.value as NucleoQuantitativo | undefined,
                })
              }
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #DDD",
                borderRadius: "6px",
                fontSize: "14px",
              }}
            >
              <option value="">Todos os núcleos</option>
              <option value="arquitetura">Arquitetura</option>
              <option value="engenharia">Engenharia</option>
              <option value="marcenaria">Marcenaria</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "13px",
                fontWeight: "500",
                color: "#333",
              }}
            >
              Status
            </label>
            <select
              value={filtros.status || ""}
              onChange={(e) =>
                setFiltros({
                  ...filtros,
                  status: e.target.value as StatusQuantitativo | undefined,
                })
              }
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #DDD",
                borderRadius: "6px",
                fontSize: "14px",
              }}
            >
              <option value="">Todos os status</option>
              <option value="em_elaboracao">Em Elaboração</option>
              <option value="aprovado">Aprovado</option>
              <option value="revisao">Em Revisão</option>
              <option value="arquivado">Arquivado</option>
            </select>
          </div>

          {/* Botão Limpar */}
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button
              onClick={() => setFiltros({})}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #DDD",
                borderRadius: "6px",
                background: "white",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Tabela */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
          Carregando...
        </div>
      ) : (
        <div className="bg-white border border-[#E5E5E5] rounded-xl shadow">
          <ResponsiveTable
            columns={quantitativosColumns}
            data={quantitativos}
            emptyMessage="Nenhum quantitativo encontrado. Crie seu primeiro quantitativo clicando no botão acima."
          />
        </div>
      )}
    </div>
  );
}

// ============================================================
// Componente: Card de Estatística
// ============================================================

interface StatCardProps {
  label: string;
  value: string | number;
  color: string;
}

function StatCard({ label, value, color }: StatCardProps) {
  return (
    <div
      style={{
        background: "white",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        borderLeft: `4px solid ${color}`,
      }}
    >
      <div
        style={{
          fontSize: "28px",
          fontWeight: "bold",
          color: color,
          marginBottom: "8px",
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: "13px", color: "#666", fontWeight: "500" }}>
        {label}
      </div>
    </div>
  );
}

// ============================================================
// Estilos
// ============================================================

const tableHeaderStyle: React.CSSProperties = {
  padding: "14px 16px",
  textAlign: "left",
  fontSize: "13px",
  fontWeight: "600",
  color: "#666",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const tableCellStyle: React.CSSProperties = {
  padding: "16px",
  fontSize: "14px",
  color: "#333",
};
