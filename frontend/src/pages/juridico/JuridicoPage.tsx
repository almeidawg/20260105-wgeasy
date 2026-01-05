// ============================================================
// MÓDULO JURÍDICO - PÁGINA PRINCIPAL
// Sistema WG Easy - Grupo WG Almeida
// Acesso restrito: Conforme permissões por tipo de usuário
// ============================================================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  FileText,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Archive,
  Send,
  Copy,
  MoreVertical,
  Building2,
  Shield,
  AlertTriangle,
  History,
} from "lucide-react";
import { supabaseRaw as supabase } from "@/lib/supabaseClient";
import { verificarPermissao as verificarPermissaoModulo } from "@/lib/permissoesModuloApi";

/* ==================== TIPOS ==================== */

type StatusModelo = "rascunho" | "em_revisao" | "aprovado" | "publicado" | "arquivado";
type NucleoContrato = "arquitetura" | "engenharia" | "marcenaria" | "produtos" | "materiais" | "empreitada" | "geral";

type ModeloContrato = {
  id: string;
  codigo: string;
  nome: string;
  descricao: string | null;
  empresa_id: string | null;
  nucleo: NucleoContrato;
  status: StatusModelo;
  versao: number;
  versao_texto: string;
  conteudo_html: string;
  clausulas: any[];
  variaveis_obrigatorias: string[];
  prazo_execucao_padrao: number;
  prorrogacao_padrao: number;
  criado_por: string | null;
  aprovado_por: string | null;
  data_aprovacao: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  empresa?: {
    id: string;
    razao_social: string;
    nome_fantasia: string;
  };
  criador?: {
    id: string;
    nome: string;
  };
  aprovador?: {
    id: string;
    nome: string;
  };
};

type Empresa = {
  id: string;
  razao_social: string;
  nome_fantasia: string;
};

/* ==================== CONSTANTES ==================== */

const STATUS_CONFIG: Record<StatusModelo, { label: string; cor: string; icone: React.ElementType }> = {
  rascunho: { label: "Rascunho", cor: "#6B7280", icone: Edit },
  em_revisao: { label: "Em Revisão", cor: "#F59E0B", icone: Clock },
  aprovado: { label: "Aprovado", cor: "#10B981", icone: CheckCircle },
  publicado: { label: "Publicado", cor: "#3B82F6", icone: Send },
  arquivado: { label: "Arquivado", cor: "#9CA3AF", icone: Archive },
};

const NUCLEO_CONFIG: Record<NucleoContrato, { label: string; icone: string; cor: string }> = {
  arquitetura: { label: "Arquitetura", icone: "🏛️", cor: "#F25C26" },
  engenharia: { label: "Engenharia", icone: "⚙️", cor: "#3B82F6" },
  marcenaria: { label: "Marcenaria", icone: "🪵", cor: "#8B5CF6" },
  produtos: { label: "Produtos", icone: "🛒", cor: "#10B981" },
  materiais: { label: "Materiais", icone: "🧰", cor: "#F59E0B" },
  empreitada: { label: "Empreitada", icone: "🔨", cor: "#EF4444" },
  geral: { label: "Geral", icone: "📄", cor: "#6B7280" },
};

/* ==================== COMPONENTE PRINCIPAL ==================== */

export default function JuridicoPage() {
  const navigate = useNavigate();

  // Estados
  const [modelos, setModelos] = useState<ModeloContrato[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<StatusModelo | "todos">("todos");
  const [filtroNucleo, setFiltroNucleo] = useState<NucleoContrato | "todos">("todos");
  const [filtroEmpresa, setFiltroEmpresa] = useState<string>("todos");
  const [menuAberto, setMenuAberto] = useState<string | null>(null);
  const [usuarioPermitido, setUsuarioPermitido] = useState<boolean | null>(null);
  const [permissoes, setPermissoes] = useState({
    podeCriar: false,
    podeEditar: false,
    podeExcluir: false,
  });

  // Verificar permissão do usuário usando sistema de permissões
  async function verificarPermissao() {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setUsuarioPermitido(false);
        return;
      }

      // Verificar permissão de visualização no módulo JURIDICO
      const podeVisualizar = await verificarPermissaoModulo(user.id, "JURIDICO", "pode_visualizar");
      const podeCriar = await verificarPermissaoModulo(user.id, "JURIDICO", "pode_criar");
      const podeEditar = await verificarPermissaoModulo(user.id, "JURIDICO", "pode_editar");
      const podeExcluir = await verificarPermissaoModulo(user.id, "JURIDICO", "pode_excluir");

      setUsuarioPermitido(podeVisualizar);
      setPermissoes({
        podeCriar,
        podeEditar,
        podeExcluir,
      });
    } catch (error) {
      console.error("Erro ao verificar permissão:", error);
      // Fallback: permitir acesso se houver erro (para não bloquear sistema)
      const { data: { user } } = await supabase.auth.getUser();
      setUsuarioPermitido(!!user);
      setPermissoes({ podeCriar: true, podeEditar: true, podeExcluir: false });
    }
  }

  // Carregar dados
  async function carregarDados() {
    setLoading(true);
    try {
      // Carregar modelos (sem JOINs para evitar erros de FK)
      const { data: modelosData, error: modelosError } = await supabase
        .from("juridico_modelos_contrato")
        .select("*")
        .eq("ativo", true)
        .order("updated_at", { ascending: false });

      if (modelosError) throw modelosError;

      setModelos(modelosData || []);
      setEmpresas([]);
    } catch (error: any) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    verificarPermissao();
    carregarDados();
  }, []);

  // Ações do modelo
  async function alterarStatus(id: string, novoStatus: StatusModelo) {
    try {
      const updateData: any = { status: novoStatus };

      if (novoStatus === "aprovado") {
        const { data: { user } } = await supabase.auth.getUser();
        updateData.aprovado_por = user?.id;
        updateData.data_aprovacao = new Date().toISOString();
      }

      const { error } = await supabase
        .from("juridico_modelos_contrato")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      // Registrar auditoria
      await registrarAuditoria(id, novoStatus === "aprovado" ? "aprovar" : "editar", { status: novoStatus });

      alert(`Status alterado para ${STATUS_CONFIG[novoStatus].label}`);
      carregarDados();
    } catch (error: any) {
      alert("Erro ao alterar status: " + error.message);
    }
    setMenuAberto(null);
  }

  async function duplicarModelo(modelo: ModeloContrato) {
    try {
      const novoCodigo = `${modelo.codigo}-COPIA-${Date.now().toString(36).toUpperCase()}`;

      const { error } = await supabase.from("juridico_modelos_contrato").insert([
        {
          codigo: novoCodigo,
          nome: `${modelo.nome} (Cópia)`,
          descricao: modelo.descricao,
          empresa_id: modelo.empresa_id,
          nucleo: modelo.nucleo,
          status: "rascunho",
          conteudo_html: modelo.conteudo_html,
          clausulas: modelo.clausulas,
          variaveis_obrigatorias: modelo.variaveis_obrigatorias,
          prazo_execucao_padrao: modelo.prazo_execucao_padrao,
          prorrogacao_padrao: modelo.prorrogacao_padrao,
        },
      ]);

      if (error) throw error;

      alert("Modelo duplicado com sucesso!");
      carregarDados();
    } catch (error: any) {
      alert("Erro ao duplicar: " + error.message);
    }
    setMenuAberto(null);
  }

  async function excluirModelo(id: string) {
    if (!confirm("Deseja realmente excluir este modelo? Esta ação não pode ser desfeita.")) return;

    try {
      const { error } = await supabase
        .from("juridico_modelos_contrato")
        .update({ ativo: false })
        .eq("id", id);

      if (error) throw error;

      await registrarAuditoria(id, "arquivar");

      alert("Modelo excluído com sucesso!");
      carregarDados();
    } catch (error: any) {
      alert("Erro ao excluir: " + error.message);
    }
    setMenuAberto(null);
  }

  async function registrarAuditoria(entidadeId: string, acao: string, dados?: any) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      await supabase.from("juridico_auditoria").insert([
        {
          entidade: "juridico_modelos_contrato",
          entidade_id: entidadeId,
          acao,
          dados_depois: dados,
          usuario_id: user?.id,
        },
      ]);
    } catch (error) {
      console.error("Erro ao registrar auditoria:", error);
    }
  }

  // Filtrar modelos
  const modelosFiltrados = modelos.filter((modelo) => {
    const matchSearch =
      modelo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      modelo.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filtroStatus === "todos" || modelo.status === filtroStatus;
    const matchNucleo = filtroNucleo === "todos" || modelo.nucleo === filtroNucleo;
    const matchEmpresa = filtroEmpresa === "todos" || modelo.empresa_id === filtroEmpresa;

    return matchSearch && matchStatus && matchNucleo && matchEmpresa;
  });

  // Estatísticas
  const stats = {
    total: modelos.length,
    rascunho: modelos.filter((m) => m.status === "rascunho").length,
    em_revisao: modelos.filter((m) => m.status === "em_revisao").length,
    aprovado: modelos.filter((m) => m.status === "aprovado").length,
    publicado: modelos.filter((m) => m.status === "publicado").length,
  };

  // Verificação de acesso
  if (usuarioPermitido === null) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F25C26]"></div>
      </div>
    );
  }

  if (usuarioPermitido === false) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Acesso Restrito</h2>
          <p className="text-gray-600 mb-4">
            Este módulo é exclusivo para o departamento Jurídico e Diretoria.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-[#F25C26] text-white rounded-lg hover:bg-[#d94d1f]"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F25C26] mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando módulo jurídico...</p>
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
            <Shield className="h-7 w-7 text-[#F25C26]" />
            Jurídico WG
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestão de Modelos de Contrato | Versionamento | Auditoria
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/juridico/variaveis")}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm flex items-center gap-2 transition-colors"
          >
            <FileText className="h-4 w-4" />
            Variáveis
          </button>
          <button
            onClick={() => navigate("/juridico/auditoria")}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm flex items-center gap-2 transition-colors"
          >
            <History className="h-4 w-4" />
            Auditoria
          </button>
          {permissoes.podeCriar && (
            <button
              onClick={() => navigate("/juridico/novo")}
              className="px-4 py-2 bg-[#F25C26] hover:bg-[#d94d1f] text-white rounded-lg text-sm flex items-center gap-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Novo Modelo
            </button>
          )}
        </div>
      </div>

      {/* CARDS DE ESTATÍSTICAS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">Total de Modelos</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-500">{stats.rascunho}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">Rascunhos</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-yellow-500">{stats.em_revisao}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">Em Revisão</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-500">{stats.aprovado}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">Aprovados</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-500">{stats.publicado}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">Publicados</div>
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
              placeholder="Buscar por código ou nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F25C26] focus:border-transparent"
            />
          </div>

          {/* Filtro Status */}
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F25C26]"
          >
            <option value="todos">Todos os Status</option>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
          </select>

          {/* Filtro Núcleo */}
          <select
            value={filtroNucleo}
            onChange={(e) => setFiltroNucleo(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F25C26]"
          >
            <option value="todos">Todos os Núcleos</option>
            {Object.entries(NUCLEO_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>
                {config.icone} {config.label}
              </option>
            ))}
          </select>

          {/* Filtro Empresa */}
          <select
            value={filtroEmpresa}
            onChange={(e) => setFiltroEmpresa(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F25C26]"
          >
            <option value="todos">Todas as Empresas</option>
            {empresas.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.nome_fantasia || emp.razao_social}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* LISTA DE MODELOS */}
      {modelosFiltrados.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Nenhum modelo encontrado
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || filtroStatus !== "todos" || filtroNucleo !== "todos"
              ? "Tente ajustar os filtros de busca"
              : "Crie seu primeiro modelo de contrato"}
          </p>
          <button
            onClick={() => navigate("/juridico/novo")}
            className="px-6 py-2 bg-[#F25C26] hover:bg-[#d94d1f] text-white rounded-lg"
          >
            Criar Modelo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modelosFiltrados.map((modelo) => {
            const statusConfig = STATUS_CONFIG[modelo.status];
            const nucleoConfig = NUCLEO_CONFIG[modelo.nucleo];
            const StatusIcon = statusConfig.icone;

            return (
              <motion.div
                key={modelo.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Header do Card */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{nucleoConfig.icone}</span>
                      <div>
                        <span className="text-xs font-mono text-gray-500">{modelo.codigo}</span>
                        <h3 className="font-semibold text-gray-900 text-sm">{modelo.nome}</h3>
                      </div>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setMenuAberto(menuAberto === modelo.id ? null : modelo.id)}
                        className="p-1 hover:bg-gray-100 rounded-lg"
                      >
                        <MoreVertical className="h-5 w-5 text-gray-400" />
                      </button>

                      {/* Menu Dropdown */}
                      <AnimatePresence>
                        {menuAberto === modelo.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-10"
                          >
                            {permissoes.podeEditar && (
                              <button
                                onClick={() => {
                                  navigate(`/juridico/editar/${modelo.id}`);
                                  setMenuAberto(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Edit className="h-4 w-4" /> Editar
                              </button>
                            )}
                            <button
                              onClick={() => {
                                navigate(`/juridico/visualizar/${modelo.id}`);
                                setMenuAberto(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Eye className="h-4 w-4" /> Visualizar
                            </button>
                            {permissoes.podeCriar && (
                              <button
                                onClick={() => duplicarModelo(modelo)}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Copy className="h-4 w-4" /> Duplicar
                              </button>
                            )}
                            {permissoes.podeEditar && (
                              <>
                                <hr className="my-1" />
                                {modelo.status === "rascunho" && (
                                  <button
                                    onClick={() => alterarStatus(modelo.id, "em_revisao")}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-yellow-50 text-yellow-700 flex items-center gap-2"
                                  >
                                    <Clock className="h-4 w-4" /> Enviar p/ Revisão
                                  </button>
                                )}
                                {modelo.status === "em_revisao" && (
                                  <>
                                    <button
                                      onClick={() => alterarStatus(modelo.id, "aprovado")}
                                      className="w-full px-4 py-2 text-left text-sm hover:bg-green-50 text-green-700 flex items-center gap-2"
                                    >
                                      <CheckCircle className="h-4 w-4" /> Aprovar
                                    </button>
                                    <button
                                      onClick={() => alterarStatus(modelo.id, "rascunho")}
                                      className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-700 flex items-center gap-2"
                                    >
                                      <XCircle className="h-4 w-4" /> Rejeitar
                                    </button>
                                  </>
                                )}
                                {modelo.status === "aprovado" && (
                                  <button
                                    onClick={() => alterarStatus(modelo.id, "publicado")}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 text-blue-700 flex items-center gap-2"
                                  >
                                    <Send className="h-4 w-4" /> Publicar
                                  </button>
                                )}
                              </>
                            )}
                            {permissoes.podeExcluir && (
                              <>
                                <hr className="my-1" />
                                <button
                                  onClick={() => excluirModelo(modelo.id)}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                                >
                                  <Trash2 className="h-4 w-4" /> Excluir
                                </button>
                              </>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* Body do Card */}
                <div className="p-4 space-y-3">
                  {modelo.descricao && (
                    <p className="text-xs text-gray-600 line-clamp-2">{modelo.descricao}</p>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    <span
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${statusConfig.cor}15`,
                        color: statusConfig.cor,
                      }}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {statusConfig.label}
                    </span>
                    <span
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${nucleoConfig.cor}15`,
                        color: nucleoConfig.cor,
                      }}
                    >
                      {nucleoConfig.label}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                      v{modelo.versao_texto}
                    </span>
                  </div>

                  {/* Empresa */}
                  {modelo.empresa && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Building2 className="h-3 w-3" />
                      {modelo.empresa.nome_fantasia || modelo.empresa.razao_social}
                    </div>
                  )}
                </div>

                {/* Footer do Card */}
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span>
                    Atualizado em {new Date(modelo.updated_at).toLocaleDateString("pt-BR")}
                  </span>
                  {modelo.aprovador && (
                    <span className="text-green-600">
                      Aprovado por {modelo.aprovador.nome?.split(" ")[0]}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* AVISO DE WORKFLOW */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-amber-800">Workflow Obrigatório</h4>
            <p className="text-sm text-amber-700 mt-1">
              Somente modelos com status <strong>"Publicado"</strong> podem ser utilizados para gerar contratos.
              Todos os contratos gerados ficam vinculados à versão do modelo no momento da geração (snapshot imutável).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
