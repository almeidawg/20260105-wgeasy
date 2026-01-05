// ============================================================
// PÁGINA: Listagem de Análises de Projeto
// Sistema WG Easy - Grupo WG Almeida
// ============================================================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Filter, Ruler, Eye, Trash2, Copy, CheckCircle, Clock, FileText, Building2 } from "lucide-react";
import { listarAnalises, deletarAnalise, duplicarAnalise, buscarEstatisticas } from "@/lib/analiseProjetoApi";
import type { AnaliseProjetoCompleta, StatusAnaliseProjeto } from "@/types/analiseProjeto";
import { getStatusLabel, getStatusColor, getTipoProjetoLabel, formatarArea } from "@/types/analiseProjeto";
import { useToast } from "@/components/ui/use-toast";

export default function AnaliseProjetoListPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Estados
  const [analises, setAnalises] = useState<AnaliseProjetoCompleta[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<StatusAnaliseProjeto | "">("");
  const [estatisticas, setEstatisticas] = useState({
    total: 0,
    rascunhos: 0,
    analisadas: 0,
    aprovadas: 0,
    vinculadas: 0,
  });

  // Carregar dados
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [analisesList, stats] = await Promise.all([
        listarAnalises(),
        buscarEstatisticas(),
      ]);
      setAnalises(analisesList);
      setEstatisticas(stats);
    } catch (error: any) {
      console.error("Erro ao carregar análises:", error);
      toast({
        title: "Erro ao carregar dados",
        description: error.message || "Não foi possível carregar as análises.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtrar análises
  const analisesFiltradas = analises.filter((analise) => {
    // Filtro de busca
    if (busca) {
      const buscaLower = busca.toLowerCase();
      const match =
        analise.titulo?.toLowerCase().includes(buscaLower) ||
        analise.numero?.toLowerCase().includes(buscaLower) ||
        analise.cliente_nome?.toLowerCase().includes(buscaLower) ||
        analise.endereco_obra?.toLowerCase().includes(buscaLower);
      if (!match) return false;
    }

    // Filtro de status
    if (filtroStatus && analise.status !== filtroStatus) {
      return false;
    }

    return true;
  });

  // Deletar análise
  const handleDeletar = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta análise?")) return;

    try {
      await deletarAnalise(id);
      toast({
        title: "Análise excluída",
        description: "A análise foi excluída com sucesso.",
      });
      carregarDados();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir",
        description: error.message || "Não foi possível excluir a análise.",
        variant: "destructive",
      });
    }
  };

  // Duplicar análise
  const handleDuplicar = async (id: string, titulo: string) => {
    try {
      const novaAnalise = await duplicarAnalise(id);
      toast({
        title: "Análise duplicada",
        description: `"${titulo}" foi duplicada com sucesso.`,
      });
      carregarDados();
      // Navegar para a nova análise
      navigate(`/analise-projeto/${novaAnalise.id}`);
    } catch (error: any) {
      toast({
        title: "Erro ao duplicar",
        description: error.message || "Não foi possível duplicar a análise.",
        variant: "destructive",
      });
    }
  };

  // Formatar data
  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#5E9B94] to-[#4A7A74] rounded-xl flex items-center justify-center shadow-lg">
              <Ruler className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Análise de Projeto</h1>
              <p className="text-sm text-gray-500">
                Análise inteligente de plantas arquitetônicas com IA
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/analise-projeto/nova")}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#5E9B94] to-[#4A7A74] text-white rounded-lg font-medium hover:opacity-90 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Nova Análise
          </button>
        </div>
      </div>

      {/* Cards de Estatísticas - Layout compacto */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="bg-white rounded-lg px-3 py-2 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gray-100 rounded-md">
              <FileText className="w-4 h-4 text-gray-600" />
            </div>
            <span className="text-xl font-bold text-gray-900">{estatisticas.total}</span>
            <span className="text-xs text-gray-500">Total</span>
          </div>
        </div>

        <div className="bg-white rounded-lg px-3 py-2 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gray-100 rounded-md">
              <Clock className="w-4 h-4 text-gray-500" />
            </div>
            <span className="text-xl font-bold text-gray-900">{estatisticas.rascunhos}</span>
            <span className="text-xs text-gray-500">Rascunhos</span>
          </div>
        </div>

        <div className="bg-white rounded-lg px-3 py-2 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 rounded-md">
              <Ruler className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-xl font-bold text-gray-900">{estatisticas.analisadas}</span>
            <span className="text-xs text-gray-500">Analisadas</span>
          </div>
        </div>

        <div className="bg-white rounded-lg px-3 py-2 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-green-100 rounded-md">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-xl font-bold text-gray-900">{estatisticas.aprovadas}</span>
            <span className="text-xs text-gray-500">Aprovadas</span>
          </div>
        </div>

        <div className="bg-white rounded-lg px-3 py-2 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-100 rounded-md">
              <Building2 className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-xl font-bold text-gray-900">{estatisticas.vinculadas}</span>
            <span className="text-xs text-gray-500">Vinculadas</span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl p-4 mb-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          {/* Busca */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por título, número, cliente ou endereço..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5E9B94] focus:border-transparent outline-none"
            />
          </div>

          {/* Filtro Status */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value as StatusAnaliseProjeto | "")}
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5E9B94] focus:border-transparent outline-none"
            >
              <option value="">Todos os Status</option>
              <option value="rascunho">Rascunho</option>
              <option value="analisando">Analisando</option>
              <option value="analisado">Analisado</option>
              <option value="aprovado">Aprovado</option>
              <option value="vinculado">Vinculado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Análises */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-[#5E9B94] border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500">Carregando análises...</p>
          </div>
        </div>
      ) : analisesFiltradas.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm">
          <Ruler className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {busca || filtroStatus ? "Nenhuma análise encontrada" : "Nenhuma análise ainda"}
          </h3>
          <p className="text-gray-500 mb-6">
            {busca || filtroStatus
              ? "Tente ajustar os filtros de busca."
              : "Comece criando sua primeira análise de projeto."}
          </p>
          {!busca && !filtroStatus && (
            <button
              onClick={() => navigate("/analise-projeto/nova")}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#5E9B94] text-white rounded-lg font-medium hover:bg-[#4A7A74] transition-all"
            >
              <Plus className="w-5 h-5" />
              Criar Primeira Análise
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {analisesFiltradas.map((analise) => (
            <div
              key={analise.id}
              className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              onClick={() => navigate(`/analise-projeto/${analise.id}`)}
            >
              <div className="flex items-start justify-between">
                {/* Info Principal */}
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#5E9B94]/10 to-[#5E9B94]/20 rounded-xl flex items-center justify-center">
                    <Ruler className="w-7 h-7 text-[#5E9B94]" />
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-[#5E9B94] transition-colors">
                        {analise.titulo}
                      </h3>
                      {analise.numero && (
                        <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          {analise.numero}
                        </span>
                      )}
                      <span
                        className="text-xs px-2.5 py-1 rounded-full font-medium"
                        style={{
                          backgroundColor: `${getStatusColor(analise.status)}20`,
                          color: getStatusColor(analise.status),
                        }}
                      >
                        {getStatusLabel(analise.status)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">{analise.cliente_nome}</span>
                      {analise.endereco_obra && (
                        <span className="text-gray-400"> • {analise.endereco_obra}</span>
                      )}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        {getTipoProjetoLabel(analise.tipo_projeto)}
                      </span>
                      {analise.total_ambientes > 0 && (
                        <span className="flex items-center gap-1">
                          <Ruler className="w-3.5 h-3.5" />
                          {analise.total_ambientes} ambientes
                        </span>
                      )}
                      {analise.total_area_piso > 0 && (
                        <span>{formatarArea(analise.total_area_piso)}</span>
                      )}
                      <span>{formatarData(analise.criado_em)}</span>
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/analise-projeto/${analise.id}`);
                    }}
                    className="p-2 text-gray-400 hover:text-[#5E9B94] hover:bg-[#5E9B94]/10 rounded-lg transition-all"
                    title="Visualizar"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicar(analise.id, analise.titulo);
                    }}
                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                    title="Duplicar análise"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletar(analise.id);
                    }}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title="Excluir"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
