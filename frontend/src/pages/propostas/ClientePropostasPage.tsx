// ============================================================
// PÁGINA: Propostas do Cliente com Aprovação por Núcleo
// Sistema WG Easy - Grupo WG Almeida
// ============================================================

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import type { PropostaCompleta, Nucleo } from "@/types/propostas";
import {
  getStatusPropostaLabel,
  getStatusPropostaColor,
  getNucleoLabel,
  getNucleoColor
} from "@/types/propostas";
import { gerarPropostaPDF } from "@/lib/propostaPdfUtils";

export default function ClientePropostasPage() {
  const { clienteId } = useParams<{ clienteId: string }>();
  const navigate = useNavigate();

  const [propostas, setPropostas] = useState<PropostaCompleta[]>([]);
  const [clienteNome, setClienteNome] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [nucleoFiltro, setNucleoFiltro] = useState<Nucleo | "todos">("todos");

  useEffect(() => {
    if (clienteId) {
      carregarDados();
    }
  }, [clienteId]);

  async function carregarDados() {
    setLoading(true);
    try {
      // Carregar dados do cliente
      const { data: clienteData } = await supabase
        .from("pessoas")
        .select("nome")
        .eq("id", clienteId)
        .single();

      if (clienteData) {
        setClienteNome(clienteData.nome);
      }

      // Carregar propostas do cliente
      const { data: propostasData, error } = await supabase
        .from("propostas")
        .select(`
          *,
          propostas_itens (*)
        `)
        .eq("cliente_id", clienteId)
        .order("criado_em", { ascending: false });

      if (error) throw error;

      // Mapear propostas com itens
      const propostasCompletas: PropostaCompleta[] = (propostasData || []).map((p: any) => ({
        ...p,
        cliente_nome: clienteNome,
        itens: p.propostas_itens || [],
      }));

      setPropostas(propostasCompletas);
    } catch (error) {
      console.error("Erro ao carregar propostas:", error);
      alert("Erro ao carregar propostas do cliente");
    } finally {
      setLoading(false);
    }
  }

  async function aprovarProposta(propostaId: string) {
    if (!confirm("Deseja aprovar esta proposta?")) return;

    try {
      const { error } = await supabase
        .from("propostas")
        .update({ status: "aprovada" })
        .eq("id", propostaId);

      if (error) throw error;

      alert("Proposta aprovada com sucesso!");
      carregarDados();
    } catch (error) {
      console.error("Erro ao aprovar proposta:", error);
      alert("Erro ao aprovar proposta");
    }
  }

  async function rejeitarProposta(propostaId: string) {
    if (!confirm("Deseja rejeitar esta proposta?")) return;

    try {
      const { error } = await supabase
        .from("propostas")
        .update({ status: "rejeitada" })
        .eq("id", propostaId);

      if (error) throw error;

      alert("Proposta rejeitada");
      carregarDados();
    } catch (error) {
      console.error("Erro ao rejeitar proposta:", error);
      alert("Erro ao rejeitar proposta");
    }
  }

  function gerarContrato(propostaId: string) {
    navigate(`/contratos/novo?proposta_id=${propostaId}`);
  }

  const propostasFiltradas = propostas.filter((p) => {
    if (nucleoFiltro === "todos") return true;
    return p.nucleo === nucleoFiltro;
  });

  // Agrupar por núcleo
  const propostasPorNucleo = {
    arquitetura: propostasFiltradas.filter((p) => p.nucleo === "arquitetura"),
    engenharia: propostasFiltradas.filter((p) => p.nucleo === "engenharia"),
    marcenaria: propostasFiltradas.filter((p) => p.nucleo === "marcenaria"),
    sem_nucleo: propostasFiltradas.filter((p) => !p.nucleo),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Carregando propostas...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Propostas - {clienteNome}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Visualize e gerencie as propostas deste cliente
            </p>
          </div>
          <button
            onClick={() => navigate("/pessoas/clientes")}
            className="px-4 py-2 text-sm text-[#F25C26] hover:underline"
          >
            ← Voltar para Clientes
          </button>
        </div>

        {/* Filtro por Núcleo */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setNucleoFiltro("todos")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              nucleoFiltro === "todos"
                ? "bg-[#F25C26] text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setNucleoFiltro("arquitetura")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              nucleoFiltro === "arquitetura"
                ? "bg-purple-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Arquitetura
          </button>
          <button
            onClick={() => setNucleoFiltro("engenharia")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              nucleoFiltro === "engenharia"
                ? "bg-amber-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Engenharia
          </button>
          <button
            onClick={() => setNucleoFiltro("marcenaria")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              nucleoFiltro === "marcenaria"
                ? "bg-green-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Marcenaria
          </button>
        </div>
      </div>

      {/* Lista de Propostas por Núcleo */}
      {nucleoFiltro === "todos" ? (
        <div className="space-y-8">
          {/* Arquitetura */}
          {propostasPorNucleo.arquitetura.length > 0 && (
            <NucleoSection
              titulo="Arquitetura"
              cor="#8B5CF6"
              propostas={propostasPorNucleo.arquitetura}
              onAprovar={aprovarProposta}
              onRejeitar={rejeitarProposta}
              onGerarContrato={gerarContrato}
              onVisualizarPDF={gerarPropostaPDF}
            />
          )}

          {/* Engenharia */}
          {propostasPorNucleo.engenharia.length > 0 && (
            <NucleoSection
              titulo="Engenharia"
              cor="#F59E0B"
              propostas={propostasPorNucleo.engenharia}
              onAprovar={aprovarProposta}
              onRejeitar={rejeitarProposta}
              onGerarContrato={gerarContrato}
              onVisualizarPDF={gerarPropostaPDF}
            />
          )}

          {/* Marcenaria */}
          {propostasPorNucleo.marcenaria.length > 0 && (
            <NucleoSection
              titulo="Marcenaria"
              cor="#10B981"
              propostas={propostasPorNucleo.marcenaria}
              onAprovar={aprovarProposta}
              onRejeitar={rejeitarProposta}
              onGerarContrato={gerarContrato}
              onVisualizarPDF={gerarPropostaPDF}
            />
          )}

          {/* Sem Núcleo */}
          {propostasPorNucleo.sem_nucleo.length > 0 && (
            <NucleoSection
              titulo="Outras Propostas"
              cor="#6B7280"
              propostas={propostasPorNucleo.sem_nucleo}
              onAprovar={aprovarProposta}
              onRejeitar={rejeitarProposta}
              onGerarContrato={gerarContrato}
              onVisualizarPDF={gerarPropostaPDF}
            />
          )}
        </div>
      ) : (
        <PropostasGrid
          propostas={propostasFiltradas}
          onAprovar={aprovarProposta}
          onRejeitar={rejeitarProposta}
          onGerarContrato={gerarContrato}
          onVisualizarPDF={gerarPropostaPDF}
        />
      )}

      {propostas.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Nenhuma proposta encontrada para este cliente</p>
          <button
            onClick={() => navigate("/propostas/nova")}
            className="mt-4 px-4 py-2 bg-[#F25C26] text-white rounded-lg hover:bg-[#e04a1a]"
          >
            + Nova Proposta
          </button>
        </div>
      )}
    </div>
  );
}

// Componente: Seção de Núcleo
function NucleoSection({
  titulo,
  cor,
  propostas,
  onAprovar,
  onRejeitar,
  onGerarContrato,
  onVisualizarPDF,
}: {
  titulo: string;
  cor: string;
  propostas: PropostaCompleta[];
  onAprovar: (id: string) => void;
  onRejeitar: (id: string) => void;
  onGerarContrato: (id: string) => void;
  onVisualizarPDF: (proposta: PropostaCompleta) => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: cor }}
        />
        <h2 className="text-lg font-semibold text-gray-800">{titulo}</h2>
        <span className="text-sm text-gray-500">({propostas.length})</span>
      </div>

      <PropostasGrid
        propostas={propostas}
        onAprovar={onAprovar}
        onRejeitar={onRejeitar}
        onGerarContrato={onGerarContrato}
        onVisualizarPDF={onVisualizarPDF}
      />
    </div>
  );
}

// Componente: Grid de Propostas
function PropostasGrid({
  propostas,
  onAprovar,
  onRejeitar,
  onGerarContrato,
  onVisualizarPDF,
}: {
  propostas: PropostaCompleta[];
  onAprovar: (id: string) => void;
  onRejeitar: (id: string) => void;
  onGerarContrato: (id: string) => void;
  onVisualizarPDF: (proposta: PropostaCompleta) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {propostas.map((proposta) => (
        <PropostaCard
          key={proposta.id}
          proposta={proposta}
          onAprovar={onAprovar}
          onRejeitar={onRejeitar}
          onGerarContrato={onGerarContrato}
          onVisualizarPDF={onVisualizarPDF}
        />
      ))}
    </div>
  );
}

// Componente: Card de Proposta
function PropostaCard({
  proposta,
  onAprovar,
  onRejeitar,
  onGerarContrato,
  onVisualizarPDF,
}: {
  proposta: PropostaCompleta;
  onAprovar: (id: string) => void;
  onRejeitar: (id: string) => void;
  onGerarContrato: (id: string) => void;
  onVisualizarPDF: (proposta: PropostaCompleta) => void;
}) {
  const statusColor = getStatusPropostaColor(proposta.status);
  const statusLabel = getStatusPropostaLabel(proposta.status);

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-800">{proposta.titulo}</h3>
          <p className="text-xs text-gray-500 mt-1">
            {proposta.numero || `#${proposta.id.slice(0, 8)}`}
          </p>
        </div>
        <span
          className="px-3 py-1 rounded-full text-xs font-medium text-white"
          style={{ backgroundColor: statusColor }}
        >
          {statusLabel}
        </span>
      </div>

      {/* Descrição */}
      {proposta.descricao && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {proposta.descricao}
        </p>
      )}

      {/* Data de Criação */}
      <div className="text-xs text-gray-500 mb-3">
        Criada em: {new Date(proposta.criado_em).toLocaleDateString("pt-BR")}
      </div>

      {/* Valores */}
      <div className="mb-4">
        <div className="text-sm text-gray-600">
          <span className="font-medium">Valor Total:</span>{" "}
          <span className="text-[#F25C26] font-semibold">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(proposta.valor_total)}
          </span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {proposta.itens.length} {proposta.itens.length === 1 ? "item" : "itens"}
        </div>
      </div>

      {/* Ações */}
      <div className="flex flex-wrap gap-2">
        {/* Visualizar PDF */}
        <button
          onClick={() => onVisualizarPDF(proposta)}
          className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
        >
          📄 PDF
        </button>

        {/* Aprovar */}
        {proposta.status !== "aprovada" && proposta.status !== "rejeitada" && (
          <button
            onClick={() => onAprovar(proposta.id)}
            className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
          >
            ✓ Aprovar
          </button>
        )}

        {/* Rejeitar */}
        {proposta.status !== "aprovada" && proposta.status !== "rejeitada" && (
          <button
            onClick={() => onRejeitar(proposta.id)}
            className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
          >
            ✗ Rejeitar
          </button>
        )}

        {/* Gerar Contrato (só se aprovada) */}
        {proposta.status === "aprovada" && (
          <button
            onClick={() => onGerarContrato(proposta.id)}
            className="w-full px-3 py-2 bg-[#F25C26] text-white rounded-lg text-sm font-medium hover:bg-[#e04a1a] transition-colors mt-2"
          >
            📝 Gerar Contrato
          </button>
        )}
      </div>
    </div>
  );
}
