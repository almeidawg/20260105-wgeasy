// ============================================================
// DASHBOARD JURÍDICO - CONTRATOS ATIVOS E CLIENTES
// Sistema WG Easy - Grupo WG Almeida
// Acesso restrito: Tipo de usuário JURIDICO
// ============================================================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Scale,
  FileText,
  Users,
  DollarSign,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ChevronRight,
  Search,
  Filter,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
} from "lucide-react";
import { supabaseRaw as supabase } from "@/lib/supabaseClient";
import type { Pessoa } from "@/types/pessoas";

/* ==================== TIPOS ==================== */

interface ContratoAtivo {
  id: string;
  numero: string;
  cliente_id: string;
  cliente_nome?: string;
  unidade_negocio: string;
  status: string;
  valor_total: number;
  data_inicio: string;
  data_previsao_termino: string;
  created_at: string;
}

interface ClienteContrato {
  pessoa: Pessoa;
  contratos: ContratoAtivo[];
  valorTotal: number;
}

/* ==================== CONSTANTES ==================== */

const NUCLEO_CONFIG: Record<string, { label: string; icone: string; cor: string }> = {
  arquitetura: { label: "Arquitetura", icone: "🏛️", cor: "#F25C26" },
  engenharia: { label: "Engenharia", icone: "⚙️", cor: "#3B82F6" },
  marcenaria: { label: "Marcenaria", icone: "🪵", cor: "#8B5CF6" },
};

const STATUS_CONTRATO: Record<string, { label: string; cor: string }> = {
  ativo: { label: "Ativo", cor: "#10B981" },
  rascunho: { label: "Rascunho", cor: "#6B7280" },
  aguardando_assinatura: { label: "Aguardando Assinatura", cor: "#F59E0B" },
  concluido: { label: "Concluído", cor: "#3B82F6" },
  cancelado: { label: "Cancelado", cor: "#EF4444" },
};

/* ==================== COMPONENTE PRINCIPAL ==================== */

export default function JuridicoDashboardPage() {
  const navigate = useNavigate();

  // Estados
  const [contratos, setContratos] = useState<ContratoAtivo[]>([]);
  const [clientesComContratos, setClientesComContratos] = useState<ClienteContrato[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroNucleo, setFiltroNucleo] = useState<string>("todos");
  const [filtroStatus, setFiltroStatus] = useState<string>("ativo");

  // Carregar dados
  async function carregarDados() {
    setLoading(true);
    try {
      // Buscar contratos ativos
      const { data: contratosData, error: contratosError } = await supabase
        .from("contratos")
        .select("*")
        .in("status", ["ativo", "aguardando_assinatura"])
        .order("created_at", { ascending: false });

      if (contratosError) throw contratosError;

      const contratosLista = contratosData || [];
      setContratos(contratosLista);

      // Buscar clientes únicos dos contratos
      const clienteIds = [...new Set(contratosLista.map(c => c.cliente_id).filter(Boolean))];

      if (clienteIds.length > 0) {
        const { data: pessoasData, error: pessoasError } = await supabase
          .from("pessoas")
          .select("*")
          .in("id", clienteIds);

        if (pessoasError) throw pessoasError;

        // Agrupar contratos por cliente
        const clientesMap = new Map<string, ClienteContrato>();

        (pessoasData || []).forEach((pessoa: Pessoa) => {
          const contratosCliente = contratosLista.filter(c => c.cliente_id === pessoa.id);
          const valorTotal = contratosCliente.reduce((acc, c) => acc + (c.valor_total || 0), 0);

          clientesMap.set(pessoa.id, {
            pessoa,
            contratos: contratosCliente,
            valorTotal,
          });
        });

        setClientesComContratos(Array.from(clientesMap.values()));
      }
    } catch (error: any) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  // Estatísticas
  const stats = {
    totalContratos: contratos.length,
    contratosAtivos: contratos.filter(c => c.status === "ativo").length,
    aguardandoAssinatura: contratos.filter(c => c.status === "aguardando_assinatura").length,
    valorTotal: contratos.reduce((acc, c) => acc + (c.valor_total || 0), 0),
    totalClientes: clientesComContratos.length,
  };

  // Filtrar clientes
  const clientesFiltrados = clientesComContratos.filter((item) => {
    const matchSearch =
      item.pessoa.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.pessoa.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.pessoa.cpf?.includes(searchTerm) ||
      item.pessoa.cnpj?.includes(searchTerm);

    const matchNucleo = filtroNucleo === "todos" ||
      item.contratos.some(c => c.unidade_negocio === filtroNucleo);

    const matchStatus = filtroStatus === "todos" ||
      item.contratos.some(c => c.status === filtroStatus);

    return matchSearch && matchNucleo && matchStatus;
  });

  // Formatação de valores
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString("pt-BR");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F25C26] mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando contratos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-2">
            <Scale className="h-7 w-7 text-[#F25C26]" />
            Dashboard Jurídico
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Contratos ativos e informações de clientes
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/juridico/modelos")}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm flex items-center gap-2 transition-colors"
          >
            <FileText className="h-4 w-4" />
            Modelos de Contrato
          </button>
        </div>
      </div>

      {/* CARDS DE ESTATÍSTICAS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalContratos}</div>
              <div className="text-xs text-gray-500">Total Contratos</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.contratosAtivos}</div>
              <div className="text-xs text-gray-500">Ativos</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">{stats.aguardandoAssinatura}</div>
              <div className="text-xs text-gray-500">Aguardando</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{stats.totalClientes}</div>
              <div className="text-xs text-gray-500">Clientes</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-[#F25C26]" />
            </div>
            <div>
              <div className="text-lg font-bold text-[#F25C26]">{formatarMoeda(stats.valorTotal)}</div>
              <div className="text-xs text-gray-500">Valor Total</div>
            </div>
          </div>
        </div>
      </div>

      {/* FILTROS */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Busca */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, email, CPF ou CNPJ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F25C26] focus:border-transparent"
            />
          </div>

          {/* Filtro Núcleo */}
          <select
            value={filtroNucleo}
            onChange={(e) => setFiltroNucleo(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F25C26]"
          >
            <option value="todos">Todos os Núcleos</option>
            {Object.entries(NUCLEO_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>
                {config.icone} {config.label}
              </option>
            ))}
          </select>

          {/* Filtro Status */}
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F25C26]"
          >
            <option value="todos">Todos os Status</option>
            {Object.entries(STATUS_CONTRATO).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* LISTA DE CLIENTES COM CONTRATOS */}
      {clientesFiltrados.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Nenhum cliente com contrato encontrado
          </h3>
          <p className="text-gray-500">
            {searchTerm ? "Tente ajustar os filtros de busca" : "Não há contratos ativos no momento"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {clientesFiltrados.map((item) => (
            <div
              key={item.pessoa.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Header do Card - Cliente */}
              <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-full bg-[#F25C26] flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                    {item.pessoa.nome.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-lg truncate">
                      {item.pessoa.nome}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {item.pessoa.cpf && (
                        <span className="text-xs text-gray-500">
                          CPF: {item.pessoa.cpf}
                        </span>
                      )}
                      {item.pessoa.cnpj && (
                        <span className="text-xs text-gray-500">
                          CNPJ: {item.pessoa.cnpj}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-semibold text-[#F25C26]">
                      {formatarMoeda(item.valorTotal)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.contratos.length} contrato{item.contratos.length > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dados Cadastrais */}
              <div className="p-4 space-y-3 bg-gray-50">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Dados Cadastrais
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {item.pessoa.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="truncate">{item.pessoa.email}</span>
                    </div>
                  )}

                  {item.pessoa.telefone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{item.pessoa.telefone}</span>
                    </div>
                  )}

                  {(item.pessoa.cidade || item.pessoa.estado) && (
                    <div className="flex items-center gap-2 text-gray-600 md:col-span-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>
                        {[
                          item.pessoa.logradouro,
                          item.pessoa.numero,
                          item.pessoa.bairro,
                          item.pessoa.cidade,
                          item.pessoa.estado
                        ].filter(Boolean).join(", ")}
                      </span>
                    </div>
                  )}

                  {item.pessoa.profissao && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <span>{item.pessoa.profissao}</span>
                    </div>
                  )}

                  {item.pessoa.estado_civil && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>{item.pessoa.estado_civil}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contratos do Cliente */}
              <div className="p-4 space-y-3">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Contratos
                </h4>

                <div className="space-y-2">
                  {item.contratos.map((contrato) => {
                    const nucleoConfig = NUCLEO_CONFIG[contrato.unidade_negocio] || { label: contrato.unidade_negocio, icone: "📄", cor: "#6B7280" };
                    const statusConfig = STATUS_CONTRATO[contrato.status] || { label: contrato.status, cor: "#6B7280" };

                    return (
                      <div
                        key={contrato.id}
                        onClick={() => navigate(`/contratos/${contrato.id}`)}
                        className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{nucleoConfig.icone}</span>
                          <div>
                            <div className="font-medium text-gray-900 text-sm">
                              {contrato.numero}
                            </div>
                            <div className="text-xs text-gray-500">
                              {nucleoConfig.label}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {formatarMoeda(contrato.valor_total || 0)}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Calendar className="h-3 w-3" />
                              {formatarData(contrato.data_inicio)}
                            </div>
                          </div>

                          <span
                            className="px-2 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: `${statusConfig.cor}15`,
                              color: statusConfig.cor,
                            }}
                          >
                            {statusConfig.label}
                          </span>

                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer do Card */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => navigate(`/pessoas/clientes/${item.pessoa.id}`)}
                  className="text-sm text-[#F25C26] hover:underline flex items-center gap-1"
                >
                  <Eye className="h-4 w-4" />
                  Ver cadastro completo
                </button>

                <span className="text-xs text-gray-400">
                  Cliente desde {formatarData(item.pessoa.criado_em || "")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AVISO INFORMATIVO */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-800">Área do Jurídico</h4>
            <p className="text-sm text-blue-700 mt-1">
              Este dashboard exibe todos os contratos ativos e aguardando assinatura.
              Clique em um contrato para ver detalhes completos ou acesse "Modelos de Contrato"
              para gerenciar os templates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
