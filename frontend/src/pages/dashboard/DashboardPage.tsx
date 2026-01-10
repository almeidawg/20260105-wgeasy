// ============================================================
// DASHBOARD EXECUTIVO - CEO & FOUNDER
// Sistema WG Easy - Grupo WG Almeida
// Visão completa e em tempo real da empresa
// ============================================================

// Backend URL para chamadas de API em produção
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";
const INTERNAL_API_KEY = import.meta.env.VITE_INTERNAL_API_KEY || "";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useUsuarioLogado } from "@/hooks/useUsuarioLogado";
// CEO Checklist API removida - agora usamos Google Keep
import {
  obterFraseDoDiaComFallback,
  type FraseMotivacional,
} from "@/lib/frasesMotivacionaisApi";
import GoogleCalendarWidget from "@/components/dashboard/GoogleCalendarWidget";
// MentionInput removido - não é mais usado após remoção do CEO Checklist
import { useDashboardPessoal } from "@/modules/financeiro-pessoal/hooks";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Briefcase,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  Hammer,
  Ruler,
  FileText,
  Target,
  Zap,
  Bell,
  ChevronRight,
  Plus,
  MoreHorizontal,
  Activity,
  Crown,
  Sparkles,
  Coffee,
  Sun,
  Moon,
  Sunset,
  CircleDot,
  Check,
  Circle,
  Loader2,
  Trash2,
  Quote,
  X,
  MessageSquare,
  ArrowRight,
  Wallet,
  CreditCard,
  PiggyBank,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
  Share2,
} from "lucide-react";
import WGStarIcon from "@/components/icons/WGStarIcon";
import KeepSharingModal from "@/components/keep/KeepSharingModal";

// Redirecionamento por tipo de usuário
const REDIRECT_POR_TIPO: Record<string, string> = {
  JURIDICO: "/juridico",
  FINANCEIRO: "/financeiro",
};

// Cores premium
const CORES = {
  arquitetura: {
    primary: "#F25C26",
    secondary: "#FF7A45",
    bg: "from-orange-500/20 to-amber-500/10",
  },
  engenharia: {
    primary: "#3B82F6",
    secondary: "#60A5FA",
    bg: "from-blue-500/20 to-cyan-500/10",
  },
  marcenaria: {
    primary: "#8B5A2B",
    secondary: "#A0522D",
    bg: "from-amber-700/20 to-yellow-600/10",
  },
};

interface DashboardMetrics {
  // Financeiro
  receitaMes: number;
  despesaMes: number;
  receitaAnoAnterior: number;
  // Projetos
  projetosAtivos: number;
  projetosNovos: number;
  projetosConcluidos: number;
  // Clientes
  clientesAtivos: number;
  clientesNovos: number;
  // Propostas
  propostasAbertas: number;
  propostasAprovadas: number;
  valorPropostas: number;
  // Contratos
  contratosAtivos: number;
  contratosConcluidos: number;
  valorContratos: number;
  // Por núcleo
  nucleoArquitetura: number;
  nucleoEngenharia: number;
  nucleoMarcenaria: number;
  // Despesas por núcleo (valores reais)
  despesaDesigner: number;
  despesaArquitetura: number;
  despesaEngenharia: number;
  despesaMarcenaria: number;
  // Status geral (tarefas)
  tarefasTotais: number;
  tarefasConcluidas: number;
}

interface Evento {
  id: string;
  titulo: string;
  data: string;
  hora?: string;
  tipo: "reuniao" | "entrega" | "visita" | "deadline";
  cliente?: string;
}

interface ChecklistItem {
  id: string;
  texto: string;
  concluido: boolean;
  prioridade: "alta" | "media" | "baixa";
}

interface Alerta {
  id: string;
  tipo: "urgente" | "atencao" | "info";
  mensagem: string;
  acao?: string;
  link?: string;
}

export default function DashboardPage() {
  // VERSÃO 2.0 - Layout com 3 colunas e Dashboard Financeiro
  useEffect(() => {
    console.log("[DashboardPage] VERSÃO 2.0 - NOVO LAYOUT CARREGADO");
  }, []);

  const navigate = useNavigate();
  const { usuario, loading: loadingUsuario, isAdminOuMaster, isMaster, isAdmin } = useUsuarioLogado();
  const [loading, setLoading] = useState(true);

  // Permissão para ver dados financeiros: Admin ou Master
  const podeVerFinanceiro = isAdminOuMaster || isAdmin || isMaster || usuario?.tipo_usuario === "ADMIN" || usuario?.tipo_usuario === "MASTER";

  // Dados do financeiro pessoal do CEO
  const { data: dadosPessoais, loading: loadingPessoal } =
    useDashboardPessoal();

  const [metrics, setMetrics] = useState<DashboardMetrics>({
    receitaMes: 0,
    despesaMes: 0,
    receitaAnoAnterior: 0,
    projetosAtivos: 0,
    projetosNovos: 0,
    projetosConcluidos: 0,
    clientesAtivos: 0,
    clientesNovos: 0,
    propostasAbertas: 0,
    propostasAprovadas: 0,
    valorPropostas: 0,
    contratosAtivos: 0,
    contratosConcluidos: 0,
    valorContratos: 0,
    nucleoArquitetura: 0,
    nucleoEngenharia: 0,
    nucleoMarcenaria: 0,
    despesaDesigner: 0,
    despesaArquitetura: 0,
    despesaEngenharia: 0,
    despesaMarcenaria: 0,
    tarefasTotais: 0,
    tarefasConcluidas: 0,
  });

  const [eventos, setEventos] = useState<Evento[]>([]);

  // Frase motivacional do dia
  const [fraseDoDia, setFraseDoDia] = useState<FraseMotivacional | null>(null);

  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [dadosMensais, setDadosMensais] = useState<any[]>([]);

  // Clientes com contratos ativos (para mostrar na seção de Contratos Ativos)
  interface ClienteAtivo {
    id: string;
    nome: string;
    foto_url: string | null;
    avatar_url: string | null;
    contrato_id: string;
    nucleo: string | null;
  }
  const [clientesAtivos, setClientesAtivos] = useState<ClienteAtivo[]>([]);

  // Google Keep status e notas
  interface KeepNote {
    id: string;
    title: string;
    text: string;
    items: Array<{ text: string; checked: boolean }> | null;
    createTime: string;
    updateTime: string;
  }
  const [keepStatus, setKeepStatus] = useState<{
    configured: boolean;
    testing: boolean;
    loading: boolean;
    message: string;
  }>({ configured: false, testing: false, loading: false, message: "" });
  const [keepNotes, setKeepNotes] = useState<KeepNote[]>([]);

  // Modal de nova nota Keep
  const [modalNotaAberto, setModalNotaAberto] = useState(false);
  const [novaNota, setNovaNota] = useState({
    titulo: "",
    texto: "",
    clienteId: "",
    clienteNome: "",
    tipo: "texto" as "texto" | "lista",
    itens: [] as string[],
  });
  const [criandoNota, setCriandoNota] = useState(false);
  const [clientesLista, setClientesLista] = useState<Array<{ id: string; nome: string }>>([]);

  // Modal de visualização/edição de nota
  const [notaSelecionada, setNotaSelecionada] = useState<KeepNote | null>(null);
  const [editandoNota, setEditandoNota] = useState(false);
  const [notaEditada, setNotaEditada] = useState({
    titulo: "",
    texto: "",
    itens: [] as Array<{ text: string; checked: boolean }>,
  });
  const [salvandoNota, setSalvandoNota] = useState(false);
  const [novoKeepItemTexto, setNovoKeepItemTexto] = useState("");

  // Modal de compartilhamento Keep
  const [modalCompartilharAberto, setModalCompartilharAberto] = useState(false);
  const [notaParaCompartilhar, setNotaParaCompartilhar] = useState<KeepNote | null>(null);

  // Saudação baseada na hora
  const saudacao = useMemo(() => {
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12)
      return { texto: "Bom dia", icon: Sun, cor: "text-amber-400" };
    if (hora >= 12 && hora < 18)
      return { texto: "Boa tarde", icon: Sunset, cor: "text-orange-400" };
    return { texto: "Boa noite", icon: Moon, cor: "text-indigo-400" };
  }, []);

  // Data formatada
  const dataHoje = useMemo(() => {
    return new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());
  }, []);

  // Redirecionar usuários restritos
  useEffect(() => {
    if (!loadingUsuario && usuario?.tipo_usuario) {
      const redirectPath = REDIRECT_POR_TIPO[usuario.tipo_usuario];
      if (redirectPath) {
        navigate(redirectPath, { replace: true });
      }
    }
  }, [usuario?.tipo_usuario, loadingUsuario, navigate]);

  // Carregar dados reais do Supabase
  useEffect(() => {
    async function carregarDados() {
      if (loadingUsuario) return;
      if (!usuario) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Datas para filtros
        const hoje = new Date();
        const getMonthRange = (dataBase: Date) => {
          const inicio = new Date(
            dataBase.getFullYear(),
            dataBase.getMonth(),
            1
          );
          const proximoMes = new Date(
            dataBase.getFullYear(),
            dataBase.getMonth() + 1,
            1
          );
          return {
            inicio: inicio.toISOString(),
            fim: proximoMes.toISOString(),
          };
        };
        const { inicio: inicioMes, fim: fimMes } = getMonthRange(hoje);
        const { inicio: inicioMesAnoAnterior, fim: fimMesAnoAnterior } =
          getMonthRange(new Date(hoje.getFullYear() - 1, hoje.getMonth(), 1));

        // Buscar todas as métricas em paralelo
        const [
          clientesResult,
          propostasResult,
          contratosResult,
          projetosResult,
          financeiroReceitaResult,
          financeiroReceitaAnoAnteriorResult,
          financeiroDespesaResult,
          obrasResult,
          despesasPorNucleoResult,
          tarefasResult,
        ] = await Promise.all([
          // Clientes ativos
          supabase
            .from("pessoas")
            .select("id, criado_em", { count: "exact" })
            .eq("tipo", "CLIENTE"),
          // Propostas
          supabase
            .from("propostas")
            .select("id, status, valor_total, criado_em"),
          // Contratos com dados do cliente
          supabase.from("contratos").select(`
            id, status, valor_total, nucleo,
            cliente:cliente_id (
              id, nome, foto_url, avatar_url
            )
          `),
          // Projetos
          supabase.from("projetos").select("id, status, nucleo, created_at"),
          // Receitas do mês
          supabase
            .from("financeiro_lancamentos")
            .select("valor")
            .eq("tipo", "receita")
            .gte("data_vencimento", inicioMes)
            .lt("data_vencimento", fimMes),
          supabase
            .from("financeiro_lancamentos")
            .select("valor")
            .eq("tipo", "receita")
            .gte("data_vencimento", inicioMesAnoAnterior)
            .lt("data_vencimento", fimMesAnoAnterior),
          // Despesas do mês
          supabase
            .from("financeiro_lancamentos")
            .select("valor")
            .eq("tipo", "despesa")
            .gte("data_vencimento", inicioMes)
            .lt("data_vencimento", fimMes),
          // Obras
          supabase.from("obras").select("id, status, nucleo_id"),
          // Despesas por núcleo (mês atual)
          supabase
            .from("financeiro_lancamentos")
            .select("valor, nucleo")
            .eq("tipo", "despesa")
            .gte("data_vencimento", inicioMes)
            .lt("data_vencimento", fimMes),
          // Tarefas do cronograma (para status geral)
          supabase
            .from("cronograma_tarefas")
            .select("id, status")
            .gte(
              "data_inicio",
              new Date(hoje.getFullYear(), hoje.getMonth(), 1)
                .toISOString()
                .split("T")[0]
            ),
        ]);

        // Calcular métricas
        const clientes = clientesResult.data || [];
        const propostas = propostasResult.data || [];
        const contratos = contratosResult.data || [];
        const projetos = projetosResult.data || [];
        const obras = obrasResult.data || [];

        // Clientes novos este mês
        const clientesNovosMes = clientes.filter(
          (c) => c.criado_em && new Date(c.criado_em) >= new Date(inicioMes)
        ).length;

        // Propostas
        const propostasAbertas = propostas.filter(
          (p) => p.status === "rascunho" || p.status === "enviada"
        ).length;
        const propostasAprovadas = propostas.filter(
          (p) => p.status === "aprovada"
        ).length;
        const valorPropostas = propostas
          .filter((p) => p.status === "aprovada")
          .reduce((acc, p) => acc + (p.valor_total || 0), 0);

        // Contratos
        const contratosAtivosFiltered = contratos.filter(
          (c) => c.status === "ativo" || c.status === "em_andamento"
        );
        const contratosAtivosCount = contratosAtivosFiltered.length;
        const valorContratos = contratosAtivosFiltered.reduce(
          (acc, c) => acc + (c.valor_total || 0),
          0
        );

        // Extrair clientes ativos com foto dos contratos
        const clientesComContrato: ClienteAtivo[] = contratosAtivosFiltered
          .filter((c) => c.cliente)
          .map((c) => ({
            id: (c.cliente as any)?.id || "",
            nome: (c.cliente as any)?.nome || "Cliente",
            foto_url: (c.cliente as any)?.foto_url || null,
            avatar_url: (c.cliente as any)?.avatar_url || null,
            contrato_id: c.id,
            nucleo: c.nucleo,
          }))
          .slice(0, 8); // Limitar a 8 clientes
        setClientesAtivos(clientesComContrato);

        // Por núcleo
        const nucleoArq = contratos.filter(
          (c) => c.nucleo?.toLowerCase() === "arquitetura"
        ).length;
        const nucleoEng = contratos.filter(
          (c) => c.nucleo?.toLowerCase() === "engenharia"
        ).length;
        const nucleoMarc = contratos.filter(
          (c) => c.nucleo?.toLowerCase() === "marcenaria"
        ).length;

        // Projetos
        const projetosAtivos = projetos.filter(
          (p) => p.status === "em_andamento" || p.status === "ativo"
        ).length;
        const projetosConcluidos = projetos.filter(
          (p) => p.status === "concluido"
        ).length;
        const projetosNovos = projetos.filter(
          (p) => p.created_at && new Date(p.created_at) >= new Date(inicioMes)
        ).length;

        // Financeiro
        const receitaMes = (financeiroReceitaResult.data || []).reduce(
          (acc, r) => acc + (r.valor || 0),
          0
        );
        const receitaAnoAnterior = (
          financeiroReceitaAnoAnteriorResult.data || []
        ).reduce((acc, r) => acc + (r.valor || 0), 0);
        const despesaMes = (financeiroDespesaResult.data || []).reduce(
          (acc, d) => acc + (d.valor || 0),
          0
        );

        // Contratos concluídos
        const contratosConcluidos = contratos.filter(
          (c) =>
            c.status === "concluido" ||
            c.status === "finalizado" ||
            c.status === "encerrado"
        ).length;

        // Despesas por núcleo (calcular do financeiro_lancamentos)
        const despesasPorNucleo = despesasPorNucleoResult.data || [];
        const despesaDesigner = despesasPorNucleo
          .filter((d: any) => d.nucleo?.toLowerCase() === "designer")
          .reduce((acc: number, d: any) => acc + (d.valor || 0), 0);
        const despesaArquitetura = despesasPorNucleo
          .filter((d: any) => d.nucleo?.toLowerCase() === "arquitetura")
          .reduce((acc: number, d: any) => acc + (d.valor || 0), 0);
        const despesaEngenharia = despesasPorNucleo
          .filter((d: any) => d.nucleo?.toLowerCase() === "engenharia")
          .reduce((acc: number, d: any) => acc + (d.valor || 0), 0);
        const despesaMarcenaria = despesasPorNucleo
          .filter((d: any) => d.nucleo?.toLowerCase() === "marcenaria")
          .reduce((acc: number, d: any) => acc + (d.valor || 0), 0);

        // Tarefas para status geral (sprint do mês)
        const tarefas = tarefasResult.data || [];
        const tarefasTotais = tarefas.length;
        const tarefasConcluidas = tarefas.filter(
          (t: any) =>
            t.status === "concluido" ||
            t.status === "concluída" ||
            t.status === "done"
        ).length;

        setMetrics({
          receitaMes,
          despesaMes,
          receitaAnoAnterior,
          projetosAtivos:
            projetosAtivos ||
            obras.filter((o) => o.status === "andamento").length,
          projetosNovos,
          projetosConcluidos,
          clientesAtivos: clientes.length,
          clientesNovos: clientesNovosMes,
          propostasAbertas,
          propostasAprovadas,
          valorPropostas,
          contratosAtivos: contratosAtivosCount,
          contratosConcluidos,
          valorContratos,
          nucleoArquitetura:
            nucleoArq || Math.floor(contratosAtivosCount * 0.35),
          nucleoEngenharia: nucleoEng || Math.floor(contratosAtivosCount * 0.4),
          nucleoMarcenaria:
            nucleoMarc || Math.floor(contratosAtivosCount * 0.25),
          despesaDesigner,
          despesaArquitetura,
          despesaEngenharia,
          despesaMarcenaria,
          tarefasTotais,
          tarefasConcluidas,
        });
        // Gerar dados mensais para grafico (ultimos 6 meses)
        const meses = [
          "Jan",
          "Fev",
          "Mar",
          "Abr",
          "Mai",
          "Jun",
          "Jul",
          "Ago",
          "Set",
          "Out",
          "Nov",
          "Dez",
        ];
        const dadosGrafico = await Promise.all(
          Array.from({ length: 6 }).map(async (_, idx) => {
            const offset = 5 - idx;
            const base = new Date(
              hoje.getFullYear(),
              hoje.getMonth() - offset,
              1
            );
            const { inicio, fim } = getMonthRange(base);
            const [receitasMesResult, despesasMesResult, projetosMesResult] =
              await Promise.all([
                supabase
                  .from("financeiro_lancamentos")
                  .select("valor")
                  .eq("tipo", "receita")
                  .gte("data_vencimento", inicio)
                  .lt("data_vencimento", fim),
                supabase
                  .from("financeiro_lancamentos")
                  .select("valor")
                  .eq("tipo", "despesa")
                  .gte("data_vencimento", inicio)
                  .lt("data_vencimento", fim),
                supabase
                  .from("projetos")
                  .select("id", { count: "exact" })
                  .gte("created_at", inicio)
                  .lt("created_at", fim),
              ]);
            const receitasMes = (receitasMesResult.data || []).reduce(
              (acc, r) => acc + (r.valor || 0),
              0
            );
            const despesasMes = (despesasMesResult.data || []).reduce(
              (acc, d) => acc + (d.valor || 0),
              0
            );
            return {
              mes: meses[base.getMonth()],
              receitas: Math.round(receitasMes),
              despesas: Math.round(despesasMes),
              projetos: projetosMesResult.count || 0,
            };
          })
        );
        setDadosMensais(dadosGrafico);

        // Alertas baseados em dados reais
        const novosAlertas: Alerta[] = [];
        if (propostasAbertas > 5) {
          novosAlertas.push({
            id: "1",
            tipo: "atencao",
            mensagem: `${propostasAbertas} propostas aguardando aprovação`,
            acao: "Revisar",
            link: "/propostas",
          });
        }
        if (despesaMes > receitaMes * 0.8) {
          novosAlertas.push({
            id: "2",
            tipo: "urgente",
            mensagem: "Despesas acima de 80% das receitas",
            acao: "Analisar",
            link: "/financeiro",
          });
        }
        if (clientesNovosMes > 0) {
          novosAlertas.push({
            id: "3",
            tipo: "info",
            mensagem: `${clientesNovosMes} novos clientes este mês`,
            acao: "Ver",
            link: "/pessoas/clientes",
          });
        }
        setAlertas(novosAlertas);

        // Carregar eventos reais do cronograma (próximos 14 dias)
        const dataLimite = new Date();
        dataLimite.setDate(dataLimite.getDate() + 14);

        const { data: tarefasCronograma } = await supabase
          .from("cronograma_tarefas")
          .select(
            `
            id,
            titulo,
            data_termino,
            prioridade,
            nucleo,
            projeto:projetos(nome)
          `
          )
          .gte("data_termino", hoje.toISOString().split("T")[0])
          .lte("data_termino", dataLimite.toISOString().split("T")[0])
          .not("status", "in", '("concluido","cancelado")')
          .order("data_termino", { ascending: true })
          .limit(7);

        const eventosReais: Evento[] = (tarefasCronograma || []).map(
          (tarefa: any) => {
            const dataTarefa = new Date(tarefa.data_termino);
            const hojeDate = new Date();
            hojeDate.setHours(0, 0, 0, 0);
            const amanha = new Date(hojeDate);
            amanha.setDate(amanha.getDate() + 1);

            let dataLabel = "";
            if (dataTarefa.toDateString() === hojeDate.toDateString()) {
              dataLabel = "Hoje";
            } else if (dataTarefa.toDateString() === amanha.toDateString()) {
              dataLabel = "Amanhã";
            } else {
              dataLabel = dataTarefa.toLocaleDateString("pt-BR", {
                weekday: "short",
                day: "numeric",
              });
            }

            return {
              id: tarefa.id,
              titulo: tarefa.titulo,
              data: dataLabel,
              tipo: "deadline" as const,
              cliente: tarefa.projeto?.nome || tarefa.nucleo || undefined,
            };
          }
        );

        // Se não houver eventos reais, mostrar mensagem
        if (eventosReais.length === 0) {
          setEventos([
            {
              id: "empty",
              titulo: "Nenhum deadline próximo",
              data: "Próximos 14 dias",
              tipo: "deadline",
            },
          ]);
        } else {
          setEventos(eventosReais);
        }

        // Carregar frase do dia
        const frase = await obterFraseDoDiaComFallback();
        setFraseDoDia(frase);
      } catch (error) {
        console.error("Erro ao carregar Dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario?.id, loadingUsuario]);

  // Auto-conectar Google Keep ao carregar a página
  useEffect(() => {
    // Carregar notas do Keep automaticamente (Service Account está sempre ativo)
    const autoConnectKeep = async () => {
      try {
        // Passar email do usuário logado para buscar as notas dele
        const userEmail = usuario?.google_workspace_email;
        const url = userEmail
          ? `${BACKEND_URL}/api/keep/notes?userEmail=${encodeURIComponent(userEmail)}`
          : `${BACKEND_URL}/api/keep/notes`;

        console.log("[Keep] Carregando notas para:", userEmail || "default");
        const res = await fetch(url, {
          headers: { "x-internal-key": INTERNAL_API_KEY },
        });
        if (res.ok) {
          const notes = await res.json();
          setKeepNotes(notes);
          setKeepStatus({
            configured: true,
            testing: false,
            loading: false,
            message: `${notes.length} notas carregadas`,
          });
        }
      } catch (error) {
        // Silenciosamente falha - usuário pode clicar em Conectar manualmente
        console.log("Keep não configurado ou erro de conexão");
      }
    };

    // Aguardar o usuário estar carregado antes de buscar as notas
    if (!loadingUsuario) {
      autoConnectKeep();
    }
  }, [usuario?.google_workspace_email, loadingUsuario]);

  // Carregar lista de clientes para o modal
  const carregarClientes = useCallback(async () => {
    try {
      const { data } = await supabase
        .from("pessoas")
        .select("id, nome")
        .eq("tipo", "CLIENTE")
        .eq("ativo", true)
        .order("nome");
      setClientesLista(data || []);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
    }
  }, []);

  // Carregar clientes quando o modal abrir
  useEffect(() => {
    if (modalNotaAberto && clientesLista.length === 0) {
      carregarClientes();
    }
  }, [modalNotaAberto, clientesLista.length, carregarClientes]);

  // Carregar notas do Google Keep
  const carregarNotasKeep = useCallback(async () => {
    setKeepStatus((prev) => ({ ...prev, loading: true }));
    try {
      // Passar email do usuário logado para buscar as notas dele
      const userEmail = usuario?.google_workspace_email;
      const url = userEmail
        ? `${BACKEND_URL}/api/keep/notes?userEmail=${encodeURIComponent(userEmail)}`
        : `${BACKEND_URL}/api/keep/notes`;

      const res = await fetch(url, {
        headers: { "x-internal-key": INTERNAL_API_KEY },
      });
      if (!res.ok) throw new Error("Erro ao carregar notas");
      const notes = await res.json();
      setKeepNotes(notes);
      setKeepStatus((prev) => ({
        ...prev,
        configured: true,
        loading: false,
        message: `${notes.length} notas carregadas`,
      }));
    } catch (error: any) {
      setKeepStatus((prev) => ({
        ...prev,
        loading: false,
        message: error.message || "Erro ao carregar notas",
      }));
    }
  }, [usuario?.google_workspace_email]);

  // Criar nova nota no Google Keep
  const handleCriarNota = useCallback(async () => {
    if (!novaNota.titulo.trim()) return;

    setCriandoNota(true);
    try {
      // Usar email do Google Workspace do usuário logado para criar a nota
      const userEmail = usuario?.google_workspace_email;
      const payload: any = {
        title: novaNota.titulo,
        clienteId: novaNota.clienteId || null,
        clienteNome: novaNota.clienteNome || null,
        userEmail, // Email para impersonação
      };

      if (novaNota.tipo === "lista" && novaNota.itens.length > 0) {
        payload.items = novaNota.itens
          .filter((item) => item.trim())
          .map((item) => ({ text: item, checked: false }));
      } else {
        payload.text = novaNota.texto;
      }

      console.log("[Keep Create] Criando nota para:", userEmail || "default");

      const res = await fetch(`${BACKEND_URL}/api/keep/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-key": INTERNAL_API_KEY,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (result.success) {
        setModalNotaAberto(false);
        setNovaNota({
          titulo: "",
          texto: "",
          clienteId: "",
          clienteNome: "",
          tipo: "texto",
          itens: [],
        });
        carregarNotasKeep();
      } else {
        alert(result.message || "Erro ao criar nota");
      }
    } catch (error: any) {
      console.error("Erro ao criar nota:", error);
      alert("Erro ao criar nota");
    } finally {
      setCriandoNota(false);
    }
  }, [novaNota, carregarNotasKeep, usuario?.google_workspace_email]);

  // Testar conexão com Google Keep
  const handleTestarGoogleKeep = useCallback(async () => {
    setKeepStatus((prev) => ({ ...prev, testing: true, message: "" }));
    try {
      const res = await fetch(`${BACKEND_URL}/api/keep/test`, {
        headers: { "x-internal-key": INTERNAL_API_KEY },
      });
      const data = await res.json();
      setKeepStatus({
        configured: data.success,
        testing: false,
        loading: false,
        message: data.message,
      });
      // Se conectou, carregar as notas
      if (data.success) {
        carregarNotasKeep();
      }
    } catch (error: any) {
      setKeepStatus({
        configured: false,
        testing: false,
        loading: false,
        message: error.message || "Erro ao testar conexão",
      });
    }
  }, [carregarNotasKeep]);

  // Abrir nota para visualização/edição
  const handleAbrirNota = useCallback((note: KeepNote) => {
    setNotaSelecionada(note);
    setNotaEditada({
      titulo: note.title,
      texto: note.text || "",
      itens: note.items || [],
    });
    setEditandoNota(false);
  }, []);

  // Fechar modal de nota
  const handleFecharNota = useCallback(() => {
    setNotaSelecionada(null);
    setEditandoNota(false);
    setNotaEditada({ titulo: "", texto: "", itens: [] });
    setNovoKeepItemTexto("");
  }, []);

  // Deletar nota
  const handleDeletarNota = useCallback(async () => {
    if (!notaSelecionada) return;

    if (!confirm("Tem certeza que deseja excluir esta nota?")) return;

    setSalvandoNota(true);
    try {
      const noteId = encodeURIComponent(notaSelecionada.id);
      const userEmail = usuario?.google_workspace_email;
      console.log("[Keep Delete] Deletando nota ID:", notaSelecionada.id, "-> encoded:", noteId);
      console.log("[Keep Delete] userEmail:", userEmail || "default");

      // Incluir userEmail como query param para impersonação correta
      const url = userEmail
        ? `${BACKEND_URL}/api/keep/notes/${noteId}?userEmail=${encodeURIComponent(userEmail)}`
        : `${BACKEND_URL}/api/keep/notes/${noteId}`;

      const res = await fetch(url, {
        method: "DELETE",
        headers: { "x-internal-key": INTERNAL_API_KEY },
      });

      if (res.ok) {
        handleFecharNota();
        carregarNotasKeep();
      } else {
        const data = await res.json();
        console.error("[Keep Delete] Erro resposta:", data);
        alert(data.message || "Erro ao excluir nota");
      }
    } catch (error) {
      console.error("[Keep Delete] Erro:", error);
      alert("Erro ao excluir nota");
    } finally {
      setSalvandoNota(false);
    }
  }, [notaSelecionada, handleFecharNota, carregarNotasKeep, usuario?.google_workspace_email]);

  // Toggle item do checklist Keep
  const handleToggleKeepItem = useCallback((index: number) => {
    setNotaEditada((prev) => {
      const novosItens = [...prev.itens];
      novosItens[index] = { ...novosItens[index], checked: !novosItens[index].checked };
      return { ...prev, itens: novosItens };
    });
    setEditandoNota(true);
  }, []);

  // Adicionar novo item ao checklist Keep
  const handleAdicionarKeepItem = useCallback(() => {
    if (!novoKeepItemTexto.trim()) return;
    setNotaEditada((prev) => ({
      ...prev,
      itens: [...prev.itens, { text: novoKeepItemTexto.trim(), checked: false }],
    }));
    setNovoKeepItemTexto("");
    setEditandoNota(true);
  }, [novoKeepItemTexto]);

  // Remover item do checklist Keep
  const handleRemoverKeepItem = useCallback((index: number) => {
    setNotaEditada((prev) => ({
      ...prev,
      itens: prev.itens.filter((_, i) => i !== index),
    }));
    setEditandoNota(true);
  }, []);

  // Salvar nota (delete + create pois API não suporta update)
  const handleSalvarNota = useCallback(async () => {
    if (!notaSelecionada) return;

    setSalvandoNota(true);
    try {
      // Usar email do Google Workspace do usuário logado
      const userEmail = usuario?.google_workspace_email;

      // 1. Deletar nota antiga
      const noteId = encodeURIComponent(notaSelecionada.id);
      console.log("[Keep Save] Deletando nota antiga ID:", notaSelecionada.id);
      console.log("[Keep Save] userEmail:", userEmail || "default");

      // Incluir userEmail como query param para impersonação correta
      const deleteUrl = userEmail
        ? `${BACKEND_URL}/api/keep/notes/${noteId}?userEmail=${encodeURIComponent(userEmail)}`
        : `${BACKEND_URL}/api/keep/notes/${noteId}`;

      const deleteRes = await fetch(deleteUrl, {
        method: "DELETE",
        headers: { "x-internal-key": INTERNAL_API_KEY },
      });

      if (!deleteRes.ok) {
        const deleteError = await deleteRes.json();
        console.error("[Keep Save] Erro ao deletar nota antiga:", deleteError);
        throw new Error(deleteError.message || "Erro ao atualizar nota");
      }

      // 2. Criar nova nota com os dados atualizados
      const payload: any = {
        title: notaEditada.titulo,
        userEmail, // Email para impersonação
      };

      if (notaEditada.itens.length > 0) {
        payload.items = notaEditada.itens;
      } else {
        payload.text = notaEditada.texto;
      }

      const res = await fetch(`${BACKEND_URL}/api/keep/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-key": INTERNAL_API_KEY,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (result.success) {
        handleFecharNota();
        carregarNotasKeep();
      } else {
        alert(result.message || "Erro ao salvar nota");
      }
    } catch (error) {
      console.error("Erro ao salvar nota:", error);
      alert("Erro ao salvar nota");
    } finally {
      setSalvandoNota(false);
    }
  }, [notaSelecionada, notaEditada, handleFecharNota, carregarNotasKeep, usuario?.google_workspace_email]);

  // Variação percentual
  const variacaoReceita = useMemo(() => {
    if (metrics.receitaAnoAnterior === 0) return 0;
    return (
      ((metrics.receitaMes - metrics.receitaAnoAnterior) /
        metrics.receitaAnoAnterior) *
      100
    );
  }, [metrics]);

  // Status Geral - percentual de tarefas concluídas no mês
  const statusGeral = useMemo(() => {
    if (metrics.tarefasTotais === 0) return 0;
    return Math.round(
      (metrics.tarefasConcluidas / metrics.tarefasTotais) * 100
    );
  }, [metrics.tarefasTotais, metrics.tarefasConcluidas]);

  // Despesas por núcleo - calcular percentual relativo ao total
  const despesasNucleoPercent = useMemo(() => {
    const total =
      metrics.despesaDesigner +
      metrics.despesaArquitetura +
      metrics.despesaEngenharia +
      metrics.despesaMarcenaria;
    if (total === 0)
      return { designer: 0, arquitetura: 0, engenharia: 0, marcenaria: 0 };
    return {
      designer: Math.round((metrics.despesaDesigner / total) * 100),
      arquitetura: Math.round((metrics.despesaArquitetura / total) * 100),
      engenharia: Math.round((metrics.despesaEngenharia / total) * 100),
      marcenaria: Math.round((metrics.despesaMarcenaria / total) * 100),
    };
  }, [
    metrics.despesaDesigner,
    metrics.despesaArquitetura,
    metrics.despesaEngenharia,
    metrics.despesaMarcenaria,
  ]);

  if (loading || loadingUsuario) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
            <Sparkles className="w-6 h-6 text-orange-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <span className="text-slate-400 text-sm font-medium">
            Preparando seu dashboard...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-[1800px] mx-auto p-6 lg:p-8 space-y-6">
        {/* ====== BANNER HEADER (Compacto -15%) ====== */}
        <header className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 rounded-2xl py-4 px-5 lg:py-5 lg:px-6 shadow-lg">
          {/* Linha principal: Avatar/Nome | Frase Central | Status Geral */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* ESQUERDA: Avatar + Nome */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Avatar do usuário */}
              <div className="relative">
                <div className="w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                  {usuario?.avatar_url || usuario?.foto_url ? (
                    <img
                      src={usuario.avatar_url || usuario.foto_url || ""}
                      alt={usuario?.nome || "Usuário"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-white">
                      {usuario?.nome?.charAt(0) || "W"}
                    </span>
                  )}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center ring-2 ring-slate-800">
                  <Check className="w-3 h-3 text-white" />
                </div>
              </div>

              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">
                  WG Easy · Dashboard Executivo
                </p>
                <div className="flex items-center gap-1.5">
                  <saudacao.icon className={`w-4 h-4 ${saudacao.cor}`} />
                  <h1 className="text-xl lg:text-2xl font-light text-white">
                    {saudacao.texto},{" "}
                    <span className="font-semibold text-orange-400">
                      {usuario?.nome?.split(" ")[0] || "CEO"}
                    </span>
                  </h1>
                </div>
                <p className="text-gray-400 text-xs capitalize">{dataHoje}</p>
              </div>
            </div>

            {/* CENTRO: Frase motivacional */}
            {fraseDoDia && (
              <div className="flex-1 flex justify-center">
                <div className="flex items-center gap-2 max-w-lg bg-slate-700/30 rounded-lg px-4 py-2 border border-slate-600/30">
                  <Quote className="w-3.5 h-3.5 text-orange-400/80 flex-shrink-0" />
                  <p className="text-xs text-gray-200 italic text-center">
                    "{fraseDoDia.frase}"{" "}
                    <span className="text-gray-400 not-italic">
                      — {fraseDoDia.autor}
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* DIREITA: Status Geral */}
            <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600/50 min-w-[160px] flex-shrink-0">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">
                Status Geral
              </p>
              <p className="text-2xl font-bold text-white">{statusGeral}%</p>
              <p className="text-[10px] text-gray-400">
                {metrics.tarefasConcluidas}/{metrics.tarefasTotais} tarefas do
                mês
              </p>
              <div className="mt-1.5 h-1.5 bg-slate-600 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${statusGeral}%` }}
                />
              </div>
            </div>
          </div>

          {/* Botões de ação no banner */}
          <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-700/50">
            <button
              type="button"
              onClick={() => navigate("/area-cliente")}
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-100 text-gray-900 text-xs font-medium rounded-lg transition-all"
            >
              Experiência do cliente
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => navigate("/sistema/acessos")}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-white text-xs font-medium rounded-lg border border-slate-600/50 transition-all"
            >
              <FileText className="w-3.5 h-3.5" />
              Configurar acessos
            </button>
          </div>
        </header>

        {/* ====== ACESSO RÁPIDO (Logo abaixo do banner) ====== */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-gray-100">
          <div className="grid grid-cols-4 gap-2 sm:flex sm:flex-wrap sm:gap-2 sm:justify-center lg:justify-start">
            <button
              type="button"
              onClick={() => navigate("/propostas")}
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 bg-gray-50 hover:bg-orange-50 border border-gray-200 hover:border-orange-200 rounded-lg transition-all"
            >
              <FileText className="w-5 h-5 sm:w-4 sm:h-4 text-orange-500" />
              <span className="text-[10px] sm:text-sm text-gray-700 whitespace-nowrap">Propostas</span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/contratos")}
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-lg transition-all"
            >
              <Briefcase className="w-5 h-5 sm:w-4 sm:h-4 text-blue-500" />
              <span className="text-[10px] sm:text-sm text-gray-700 whitespace-nowrap">Contratos</span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/pessoas/clientes")}
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 bg-gray-50 hover:bg-violet-50 border border-gray-200 hover:border-violet-200 rounded-lg transition-all"
            >
              <Users className="w-5 h-5 sm:w-4 sm:h-4 text-violet-500" />
              <span className="text-[10px] sm:text-sm text-gray-700 whitespace-nowrap">Clientes</span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/cronograma")}
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 bg-gray-50 hover:bg-cyan-50 border border-gray-200 hover:border-cyan-200 rounded-lg transition-all"
            >
              <Calendar className="w-5 h-5 sm:w-4 sm:h-4 text-cyan-500" />
              <span className="text-[10px] sm:text-sm text-gray-700 whitespace-nowrap">Cron.</span>
            </button>
          </div>
        </div>

        {/* ====== SEGUNDA LINHA: CONTRATOS | CALENDÁRIO | CHECKLIST ====== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* COLUNA 1: Contratos Ativos do Dia */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Contratos ativos do dia
                </h3>
                <p className="text-sm text-gray-500">
                  Mini cards com avatar, acesso rápido ao contato do cliente e
                  endereço da obra
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 uppercase tracking-wider">
                  Clientes Ativos
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics.contratosAtivos}
                </p>
              </div>
            </div>

            {/* Cards de clientes ativos */}
            <div className="flex flex-wrap gap-3 mt-4">
              {clientesAtivos.length > 0 ? (
                clientesAtivos.map((cliente) => {
                  const nucleo = cliente.nucleo?.toLowerCase();
                  const bgClass =
                    nucleo === "arquitetura"
                      ? "bg-orange-100 ring-orange-200"
                      : nucleo === "engenharia"
                      ? "bg-blue-100 ring-blue-200"
                      : "bg-amber-100 ring-amber-200";
                  const textClass =
                    nucleo === "arquitetura"
                      ? "text-orange-500"
                      : nucleo === "engenharia"
                      ? "text-blue-500"
                      : "text-amber-500";
                  return (
                    <div
                      key={cliente.contrato_id}
                      onClick={() =>
                        navigate(`/contratos/${cliente.contrato_id}`)
                      }
                      className="flex flex-col items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-xl cursor-pointer transition-colors min-w-[90px] max-w-[100px]"
                    >
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 overflow-hidden ring-2 ${bgClass}`}
                      >
                        {cliente.avatar_url || cliente.foto_url ? (
                          <img
                            src={cliente.avatar_url || cliente.foto_url || ""}
                            alt={cliente.nome}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className={`text-lg font-bold ${textClass}`}>
                            {cliente.nome?.charAt(0)?.toUpperCase() || "C"}
                          </span>
                        )}
                      </div>
                      <p
                        className="text-xs font-medium text-gray-700 text-center truncate w-full"
                        title={cliente.nome}
                      >
                        {cliente.nome?.split(" ")[0] || "Cliente"}
                      </p>
                      <p className="text-[10px] text-gray-400 uppercase">
                        {cliente.nucleo?.substring(0, 3) || "WG"}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center w-full py-6 text-center">
                  <Users className="w-8 h-8 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-400">Nenhum contrato ativo</p>
                </div>
              )}
            </div>

            {clientesAtivos.length > 0 && (
              <button
                type="button"
                onClick={() => navigate("/contratos")}
                className="w-full mt-4 py-2 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
              >
                Ver todos os contratos →
              </button>
            )}
          </div>

          {/* COLUNA 2: Google Calendar (CENTRO) */}
          <GoogleCalendarWidget userEmail={usuario?.google_workspace_email || undefined} />

          {/* COLUNA 3: Google Keep (Substituiu CEO Checklist) */}
          <div className={`rounded-2xl p-6 shadow-sm border transition-all h-full flex flex-col ${
            keepStatus.configured
              ? "bg-white border-yellow-200"
              : "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 border-dashed"
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-yellow-100">
                  <Sparkles className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">Checklists</h3>
                    {keepStatus.configured ? (
                      <span className="px-2 py-0.5 text-[10px] font-medium bg-emerald-100 text-emerald-700 rounded-full">
                        {keepNotes.length}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 rounded-full">
                        Não conectado
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">Google Keep sincronizado</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {keepStatus.configured && (
                  <button
                    type="button"
                    onClick={() => setModalNotaAberto(true)}
                    className="p-2 text-xs font-medium bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
                    title="Nova Nota"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={keepStatus.configured ? carregarNotasKeep : handleTestarGoogleKeep}
                  disabled={keepStatus.testing || keepStatus.loading}
                  className={`p-2 text-xs font-medium rounded-lg transition-colors ${
                    keepStatus.testing || keepStatus.loading
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : keepStatus.configured
                        ? "bg-yellow-100 hover:bg-yellow-200 text-yellow-700"
                        : "bg-yellow-500 hover:bg-yellow-600 text-white"
                  }`}
                  title={keepStatus.configured ? "Atualizar" : "Conectar"}
                >
                  {keepStatus.testing || keepStatus.loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : keepStatus.configured ? (
                    <RefreshCw className="w-4 h-4" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Lista de notas do Keep */}
            {keepStatus.configured && keepNotes.length > 0 ? (
              <div className="flex-1 overflow-y-auto space-y-2 max-h-[300px]">
                {keepNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 bg-yellow-50 rounded-xl border border-yellow-100 hover:shadow-md hover:border-yellow-300 transition-all group relative"
                  >
                    {/* Botão compartilhar (aparece no hover) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setNotaParaCompartilhar(note);
                        setModalCompartilharAberto(true);
                      }}
                      className="absolute top-2 right-2 p-1 bg-white/80 hover:bg-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      title="Compartilhar"
                    >
                      <Share2 className="w-3 h-3 text-yellow-600" />
                    </button>

                    {/* Área clicável para abrir nota */}
                    <button
                      type="button"
                      onClick={() => handleAbrirNota(note)}
                      className="w-full text-left cursor-pointer"
                    >
                      <h4 className="font-medium text-gray-900 text-sm mb-1.5 line-clamp-1 pr-6">
                        {note.title || "Sem título"}
                      </h4>
                      {note.items ? (
                        <ul className="space-y-0.5">
                          {note.items.slice(0, 4).map((item, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 text-xs">
                              <span className={`mt-0.5 ${item.checked ? "text-emerald-500" : "text-gray-400"}`}>
                                {item.checked ? "☑" : "☐"}
                              </span>
                              <span className={`line-clamp-1 ${item.checked ? "text-gray-400 line-through" : "text-gray-600"}`}>
                                {item.text}
                              </span>
                            </li>
                          ))}
                          {note.items.length > 4 && (
                            <li className="text-[10px] text-gray-400 pl-4">
                              +{note.items.length - 4} itens
                            </li>
                          )}
                        </ul>
                      ) : (
                        <p className="text-xs text-gray-600 line-clamp-2">{note.text}</p>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            ) : keepStatus.configured && keepNotes.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
                <Sparkles className="w-10 h-10 text-gray-200 mb-2" />
                <p className="text-sm text-gray-400">Nenhuma nota</p>
                <button
                  type="button"
                  onClick={() => setModalNotaAberto(true)}
                  className="mt-2 text-xs text-yellow-600 hover:text-yellow-700"
                >
                  + Criar primeira nota
                </button>
              </div>
            ) : !keepStatus.configured && keepStatus.message ? (
              <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                <div className="flex items-center gap-2 text-sm text-red-700">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs">{keepStatus.message}</span>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-4 bg-white/50 rounded-xl border border-gray-200">
                <Sparkles className="w-8 h-8 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500 text-center">
                  Clique para conectar
                </p>
                <p className="text-xs text-gray-400 text-center mt-1">
                  Google Keep
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ====== MODAL NOVA NOTA KEEP ====== */}
        {modalNotaAberto && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Nova Nota</h2>
                      <p className="text-xs text-gray-500">Criar nota no Google Keep</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalNotaAberto(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Seletor de Cliente */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vincular a Cliente (opcional)
                  </label>
                  <select
                    value={novaNota.clienteId}
                    onChange={(e) => {
                      const cliente = clientesLista.find((c) => c.id === e.target.value);
                      setNovaNota({
                        ...novaNota,
                        clienteId: e.target.value,
                        clienteNome: cliente?.nome || "",
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    <option value="">Sem vínculo (nota geral)</option>
                    {clientesLista.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                      </option>
                    ))}
                  </select>
                  {novaNota.clienteNome && (
                    <p className="mt-1 text-xs text-yellow-600">
                      Título terá prefixo: [{novaNota.clienteNome}]
                    </p>
                  )}
                </div>

                {/* Título */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={novaNota.titulo}
                    onChange={(e) => setNovaNota({ ...novaNota, titulo: e.target.value })}
                    placeholder="Digite o título da nota"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>

                {/* Tipo de nota */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Nota
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setNovaNota({ ...novaNota, tipo: "texto" })}
                      className={`flex-1 px-4 py-2 text-sm rounded-lg border transition-colors ${
                        novaNota.tipo === "texto"
                          ? "bg-yellow-100 border-yellow-300 text-yellow-700"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      Texto
                    </button>
                    <button
                      type="button"
                      onClick={() => setNovaNota({ ...novaNota, tipo: "lista", itens: [""] })}
                      className={`flex-1 px-4 py-2 text-sm rounded-lg border transition-colors ${
                        novaNota.tipo === "lista"
                          ? "bg-yellow-100 border-yellow-300 text-yellow-700"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      Lista / Checklist
                    </button>
                  </div>
                </div>

                {/* Conteúdo */}
                {novaNota.tipo === "texto" ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Conteúdo
                    </label>
                    <textarea
                      value={novaNota.texto}
                      onChange={(e) => setNovaNota({ ...novaNota, texto: e.target.value })}
                      placeholder="Digite o conteúdo da nota..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Itens da Lista
                    </label>
                    <div className="space-y-2">
                      {novaNota.itens.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-gray-400">☐</span>
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => {
                              const novosItens = [...novaNota.itens];
                              novosItens[idx] = e.target.value;
                              setNovaNota({ ...novaNota, itens: novosItens });
                            }}
                            placeholder={`Item ${idx + 1}`}
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          />
                          {novaNota.itens.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const novosItens = novaNota.itens.filter((_, i) => i !== idx);
                                setNovaNota({ ...novaNota, itens: novosItens });
                              }}
                              className="p-1 text-red-500 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setNovaNota({ ...novaNota, itens: [...novaNota.itens, ""] })}
                        className="w-full py-2 text-sm text-yellow-600 hover:bg-yellow-50 rounded-lg border border-dashed border-yellow-300 transition-colors"
                      >
                        + Adicionar item
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalNotaAberto(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCriarNota}
                  disabled={criandoNota || !novaNota.titulo.trim()}
                  className="px-4 py-2 text-sm bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {criandoNota ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Criar Nota
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ====== MODAL VISUALIZAR/EDITAR NOTA KEEP ====== */}
        {notaSelecionada && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100 bg-yellow-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {notaEditada.titulo || "Sem título"}
                      </h2>
                      <p className="text-xs text-gray-500">
                        {notaSelecionada.createTime
                          ? new Date(notaSelecionada.createTime).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleFecharNota}
                    className="p-2 hover:bg-yellow-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Conteúdo - Checklist */}
                {notaEditada.itens && notaEditada.itens.length > 0 ? (
                  <div className="space-y-2">
                    {notaEditada.itens.map((item, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                          item.checked
                            ? "bg-emerald-50 border-emerald-200"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleKeepItem(idx)}
                          className={`mt-0.5 text-lg ${
                            item.checked ? "text-emerald-500" : "text-gray-400"
                          }`}
                        >
                          {item.checked ? "☑" : "☐"}
                        </button>
                        <span
                          className={`flex-1 ${
                            item.checked
                              ? "text-gray-400 line-through"
                              : "text-gray-700"
                          }`}
                        >
                          {item.text}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoverKeepItem(idx)}
                          className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Remover item"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    {/* Campo para adicionar novo item */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
                      <input
                        type="text"
                        value={novoKeepItemTexto}
                        onChange={(e) => setNovoKeepItemTexto(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAdicionarKeepItem()}
                        placeholder="Adicionar novo item..."
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={handleAdicionarKeepItem}
                        disabled={!novoKeepItemTexto.trim()}
                        className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Progresso */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Progresso</span>
                        <span className="font-medium text-gray-900">
                          {notaEditada.itens.filter((i) => i.checked).length} de{" "}
                          {notaEditada.itens.length}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{
                            width: `${
                              (notaEditada.itens.filter((i) => i.checked).length /
                                notaEditada.itens.length) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Conteúdo - Texto ou vazio (adicionar primeiro item) */
                  <div className="space-y-4">
                    {notaEditada.texto ? (
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {notaEditada.texto}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 text-center py-4">
                        Nenhum item ainda
                      </p>
                    )}

                    {/* Campo para adicionar primeiro item */}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                      <input
                        type="text"
                        value={novoKeepItemTexto}
                        onChange={(e) => setNovoKeepItemTexto(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAdicionarKeepItem()}
                        placeholder="Adicionar item ao checklist..."
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={handleAdicionarKeepItem}
                        disabled={!novoKeepItemTexto.trim()}
                        className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-100 flex justify-between">
                <button
                  type="button"
                  onClick={handleDeletarNota}
                  disabled={salvandoNota}
                  className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleFecharNota}
                    className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  {editandoNota && (
                    <button
                      type="button"
                      onClick={handleSalvarNota}
                      disabled={salvandoNota}
                      className="px-4 py-2 text-sm bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {salvandoNota ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Salvar
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ====== MODAL COMPARTILHAMENTO KEEP ====== */}
        {notaParaCompartilhar && (
          <KeepSharingModal
            noteId={notaParaCompartilhar.id}
            noteTitle={notaParaCompartilhar.title || "Sem título"}
            isOpen={modalCompartilharAberto}
            onClose={() => {
              setModalCompartilharAberto(false);
              setNotaParaCompartilhar(null);
            }}
            onShareUpdated={carregarNotasKeep}
            criadoPorUsuarioId={usuario?.id}
          />
        )}

        {/* ====== TERCEIRA LINHA: DASHBOARD FINANCEIRO (apenas Admin/Master) ====== */}
        {podeVerFinanceiro && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          {/* Header com título e filtros de período */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Dashboard Financeiro
                </h3>
                <p className="text-sm text-gray-500">
                  Visão executiva consolidada
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  type="button"
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 rounded-md transition-colors"
                >
                  3 Meses
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 rounded-md transition-colors"
                >
                  6 Meses
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 rounded-md transition-colors"
                >
                  Este Ano
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 rounded-md transition-colors"
                >
                  12 Meses
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 text-xs font-medium bg-slate-800 text-white rounded-md transition-colors"
                >
                  Todos
                </button>
              </div>
              <button
                type="button"
                onClick={() => navigate("/financeiro")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Ver detalhes"
              >
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* 5 KPI Cards - Estilo Laranja Gradiente */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {/* Saldo Atual */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white relative overflow-hidden">
              <div className="absolute top-2 right-2 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              <p className="text-[10px] uppercase tracking-wider text-white/80 mb-1">
                Saldo Atual
              </p>
              <p className="text-lg font-bold">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(metrics.receitaMes - metrics.despesaMes)}
              </p>
              <p className="text-[10px] text-white/70 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +12.5% mês
              </p>
            </div>

            {/* Receitas */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 text-white relative overflow-hidden">
              <div className="absolute top-2 right-2 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <p className="text-[10px] uppercase tracking-wider text-white/80 mb-1">
                Receitas
              </p>
              <p className="text-lg font-bold">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(metrics.receitaMes)}
              </p>
              <p className="text-[10px] text-white/70 mt-1">
                ↗ {metrics.contratosAtivos} contratos
              </p>
            </div>

            {/* Custos Totais */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-white relative overflow-hidden">
              <div className="absolute top-2 right-2 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-white" />
              </div>
              <p className="text-[10px] uppercase tracking-wider text-white/80 mb-1">
                Custos Totais
              </p>
              <p className="text-lg font-bold">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(metrics.despesaMes)}
              </p>
              <p className="text-[10px] text-white/70 mt-1">↘ 4 categorias</p>
            </div>

            {/* Contratos Ativos */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 relative overflow-hidden">
              <div className="absolute top-2 right-2 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-gray-500" />
              </div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                Contratos Ativos
              </p>
              <p className="text-lg font-bold text-gray-900">
                {metrics.contratosAtivos}
              </p>
              <p className="text-[10px] text-gray-500 mt-1">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                  notation: "compact",
                }).format(metrics.receitaMes / (metrics.contratosAtivos || 1))}
              </p>
            </div>

            {/* Concluídos */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 relative overflow-hidden">
              <div className="absolute top-2 right-2 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-gray-500" />
              </div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                Concluídos
              </p>
              <p className="text-lg font-bold text-gray-900">
                {metrics.contratosConcluidos}
              </p>
              <p className="text-[10px] text-gray-500 mt-1">
                Contratos finalizados
              </p>
            </div>
          </div>

          {/* Gráfico de Área - Entradas vs Saídas */}
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dadosMensais}>
                <defs>
                  <linearGradient
                    id="colorEntradasFin"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient
                    id="colorSaidasFin"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  vertical={false}
                />
                <XAxis
                  dataKey="mes"
                  stroke="#9ca3af"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  labelStyle={{ color: "#374151", fontWeight: 600 }}
                  formatter={(value: number, name: string) => [
                    new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(value),
                    name === "receitas" ? "Entradas" : "Saídas",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="receitas"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorEntradasFin)"
                  name="receitas"
                />
                <Area
                  type="monotone"
                  dataKey="despesas"
                  stroke="#f97316"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSaidasFin)"
                  name="despesas"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Legenda */}
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full" />
              <span className="text-sm text-gray-500">Entradas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full" />
              <span className="text-sm text-gray-500">Saídas</span>
            </div>
          </div>
        </div>
        )}

        {/* ====== GRID PRINCIPAL (Gráficos e Detalhes) ====== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* COLUNA ESQUERDA - Gráficos e Núcleos */}
          <div className="lg:col-span-8 space-y-6">
            {/* Despesas por Núcleo (apenas Admin/Master) */}
            {podeVerFinanceiro && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Despesas por Núcleo
              </h3>
              <div className="space-y-4">
                {/* Designer */}
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 w-24">designer</span>
                  <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${despesasNucleoPercent.designer || 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-16 text-right">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                      notation: "compact",
                    }).format(metrics.despesaDesigner)}
                  </span>
                </div>
                {/* Arquitetura */}
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 w-24">
                    arquitetura
                  </span>
                  <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-400 rounded-full transition-all duration-500"
                      style={{
                        width: `${despesasNucleoPercent.arquitetura || 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-16 text-right">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                      notation: "compact",
                    }).format(metrics.despesaArquitetura)}
                  </span>
                </div>
                {/* Engenharia */}
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 w-24">engenharia</span>
                  <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-300 rounded-full transition-all duration-500"
                      style={{
                        width: `${despesasNucleoPercent.engenharia || 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-16 text-right">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                      notation: "compact",
                    }).format(metrics.despesaEngenharia)}
                  </span>
                </div>
                {/* Marcenaria */}
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 w-24">marcenaria</span>
                  <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-200 rounded-full transition-all duration-500"
                      style={{
                        width: `${despesasNucleoPercent.marcenaria || 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-16 text-right">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                      notation: "compact",
                    }).format(metrics.despesaMarcenaria)}
                  </span>
                </div>
              </div>
            </div>
            )}

            {/* Propostas */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Propostas Comerciais
                    </h3>
                    <p className="text-xs text-gray-500">
                      Conversão e pipeline
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/propostas")}
                  className="text-sm text-violet-600 hover:text-violet-700 transition-colors"
                >
                  Ver todas →
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-3xl font-bold text-amber-600">
                    {metrics.propostasAbertas}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Aguardando</p>
                </div>
                <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <p className="text-3xl font-bold text-emerald-600">
                    {metrics.propostasAprovadas}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Aprovadas</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xl font-bold text-gray-900">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                      notation: "compact",
                    }).format(metrics.valorPropostas)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Valor Total</p>
                </div>
              </div>
            </div>

            {/* ====== MINHAS FINANÇAS PESSOAIS (apenas CEO/Master) ====== */}
            {isMaster && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Minhas Finanças
                    </h3>
                    <p className="text-xs text-gray-500">
                      Controle pessoal do CEO
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/meu-financeiro")}
                  className="text-sm text-orange-600 hover:text-orange-700 transition-colors flex items-center gap-1"
                >
                  Ver completo <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {loadingPessoal ? (
                <div className="grid grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-20 bg-gray-100 animate-pulse rounded-xl"
                    />
                  ))}
                </div>
              ) : dadosPessoais ? (
                <>
                  {/* KPIs Pessoais - 4 cards em degradê laranja WG */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    {/* Saldo Total */}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-orange-600 to-orange-500">
                      <div className="flex items-center gap-2 mb-2">
                        <Wallet className="w-4 h-4 text-white/80" />
                        <span className="text-xs text-white/80">
                          Saldo Total
                        </span>
                      </div>
                      <p className="text-xl font-bold text-white">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                          notation: "compact",
                        }).format(dadosPessoais.saldo_total)}
                      </p>
                    </div>

                    {/* Receitas do Mês */}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500 to-orange-400">
                      <div className="flex items-center gap-2 mb-2">
                        <ArrowUpCircle className="w-4 h-4 text-white/80" />
                        <span className="text-xs text-white/80">Receitas</span>
                      </div>
                      <p className="text-xl font-bold text-white">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                          notation: "compact",
                        }).format(dadosPessoais.receitas_mes)}
                      </p>
                    </div>

                    {/* Despesas do Mês */}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-orange-400 to-amber-400">
                      <div className="flex items-center gap-2 mb-2">
                        <ArrowDownCircle className="w-4 h-4 text-white/80" />
                        <span className="text-xs text-white/80">Despesas</span>
                      </div>
                      <p className="text-xl font-bold text-white">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                          notation: "compact",
                        }).format(dadosPessoais.despesas_mes)}
                      </p>
                    </div>

                    {/* Balanço do Mês */}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-amber-400 to-amber-300">
                      <div className="flex items-center gap-2 mb-2">
                        {dadosPessoais.balanco_mes >= 0 ? (
                          <TrendingUp className="w-4 h-4 text-white/80" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-white/80" />
                        )}
                        <span className="text-xs text-white/80">Balanço</span>
                      </div>
                      <p
                        className={`text-xl font-bold ${
                          dadosPessoais.balanco_mes >= 0
                            ? "text-white"
                            : "text-red-600"
                        }`}
                      >
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                          notation: "compact",
                        }).format(dadosPessoais.balanco_mes)}
                      </p>
                    </div>
                  </div>

                  {/* Alertas e Contas */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Alertas */}
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        Alertas Pessoais
                      </h4>
                      <div className="space-y-2">
                        {dadosPessoais.lancamentos_vencidos > 0 && (
                          <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-100 rounded-lg">
                            <Clock className="w-4 h-4 text-red-500" />
                            <span className="text-xs text-red-700">
                              <strong>
                                {dadosPessoais.lancamentos_vencidos}
                              </strong>{" "}
                              vencido(s)
                            </span>
                          </div>
                        )}
                        {dadosPessoais.lancamentos_pendentes > 0 && (
                          <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-100 rounded-lg">
                            <Clock className="w-4 h-4 text-amber-500" />
                            <span className="text-xs text-amber-700">
                              <strong>
                                {dadosPessoais.lancamentos_pendentes}
                              </strong>{" "}
                              pendente(s)
                            </span>
                          </div>
                        )}
                        {dadosPessoais.lancamentos_vencidos === 0 &&
                          dadosPessoais.lancamentos_pendentes === 0 && (
                            <div className="flex items-center gap-2 p-2 bg-emerald-50 border border-emerald-100 rounded-lg">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              <span className="text-xs text-emerald-700">
                                Tudo em dia!
                              </span>
                            </div>
                          )}
                      </div>
                    </div>

                    {/* Minhas Contas */}
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-blue-500" />
                        Minhas Contas
                      </h4>
                      {dadosPessoais.contas.length > 0 ? (
                        <div className="space-y-2">
                          {dadosPessoais.contas.slice(0, 3).map((conta) => (
                            <div
                              key={conta.id}
                              className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-100"
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: conta.cor }}
                                />
                                <span className="text-xs text-gray-600">
                                  {conta.nome}
                                </span>
                              </div>
                              <span className="text-xs font-medium text-gray-900">
                                {new Intl.NumberFormat("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                  notation: "compact",
                                }).format(conta.saldo_atual)}
                              </span>
                            </div>
                          ))}
                          {dadosPessoais.contas.length > 3 && (
                            <p className="text-xs text-gray-400 text-center">
                              +{dadosPessoais.contas.length - 3} contas
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 text-center py-4">
                          Nenhuma conta cadastrada
                        </p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Wallet className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Dados não disponíveis</p>
                  <button
                    type="button"
                    onClick={() => navigate("/meu-financeiro")}
                    className="mt-2 text-xs text-orange-600 hover:text-orange-700"
                  >
                    Configurar finanças pessoais
                  </button>
                </div>
              )}
            </div>
            )}
          </div>

          {/* COLUNA DIREITA - Alertas */}
          <div className="lg:col-span-4 space-y-6">
            {/* Alertas */}
            {alertas.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Atenção</h3>
                    <p className="text-xs text-gray-500">
                      {alertas.length} itens requerem ação
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {alertas.map((alerta) => (
                    <div
                      key={alerta.id}
                      onClick={() => alerta.link && navigate(alerta.link)}
                      className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                        alerta.tipo === "urgente"
                          ? "bg-red-50 border border-red-100 hover:bg-red-100"
                          : alerta.tipo === "atencao"
                          ? "bg-amber-50 border border-amber-100 hover:bg-amber-100"
                          : "bg-blue-50 border border-blue-100 hover:bg-blue-100"
                      }`}
                    >
                      <p className="text-sm text-gray-700">{alerta.mensagem}</p>
                      {alerta.acao && (
                        <span
                          className={`text-xs font-medium ${
                            alerta.tipo === "urgente"
                              ? "text-red-600"
                              : alerta.tipo === "atencao"
                              ? "text-amber-600"
                              : "text-blue-600"
                          }`}
                        >
                          {alerta.acao} →
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ====== FOOTER ====== */}
        <footer className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-100 overflow-hidden p-1">
              <img
                src="/imagens/logoscomfundotransparente/simbolo%20marcadores.png"
                alt="WG"
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-sm text-gray-500">
              WG Easy · Dashboard Executivo
            </p>
          </div>
          <p className="text-xs text-gray-400">
            Grupo WG Almeida · v2.0 CEO Edition
          </p>
        </footer>
      </div>
    </div>
  );
}
