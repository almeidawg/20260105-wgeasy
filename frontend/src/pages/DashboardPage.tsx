// ============================================================
// DASHBOARD EXECUTIVO - CEO & FOUNDER
// Sistema WG Easy - Grupo WG Almeida
// Visão completa e em tempo real da empresa
// ============================================================

import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useUsuarioLogado } from "@/hooks/useUsuarioLogado";
import {
  obterChecklistDiario,
  adicionarItem,
  toggleItemConcluido,
  removerItem,
  calcularProgresso,
  buscarMencoesUsuario,
  importarMencaoParaChecklist,
  type CEOChecklist,
} from "@/lib/ceoChecklistApi";
import {
  obterFraseDoDiaComFallback,
  type FraseMotivacional,
} from "@/lib/frasesMotivacionaisApi";
import { useDashboardPessoal } from "@/modules/financeiro-pessoal/hooks";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Briefcase,
  Calendar,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  ChevronRight,
  Plus,
  Activity,
  Copy,
  Sparkles,
  Sun,
  Moon,
  Sunset,
  Check,
  Loader2,
  Trash2,
  Quote,
  X,
  AtSign,
  MessageSquare,
  ArrowRight,
  Wallet,
  CreditCard,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";

// Redirecionamento por tipo de usuário
const REDIRECT_POR_TIPO: Record<string, string> = {
  JURIDICO: "/juridico",
  FINANCEIRO: "/financeiro",
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
  valorContratos: number;
  // Por núcleo
  nucleoArquitetura: number;
  nucleoEngenharia: number;
  nucleoMarcenaria: number;
}

interface Evento {
  id: string;
  titulo: string;
  data: string;
  hora?: string;
  tipo: "reuniao" | "entrega" | "visita" | "deadline";
  cliente?: string;
}

interface ContratoAtivo {
  id: string;
  codigo?: string;
  status: string;
  valor_total?: number;
  nucleo?: string;
  obra?: {
    nome?: string;
    endereco?: string;
  };
  cliente?: {
    nome?: string;
  };
}

interface Alerta {
  id: string;
  tipo: "urgente" | "atencao" | "info";
  mensagem: string;
  acao?: string;
  link?: string;
}

interface Mencao {
  id: string;
  comentario: string;
  created_at: string;
  task?: {
    id: string;
    titulo: string;
    project?: {
      id: string;
      nome: string;
    };
  };
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { usuario, loading: loadingUsuario } = useUsuarioLogado();
  const [loading, setLoading] = useState(true);

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
    valorContratos: 0,
    nucleoArquitetura: 0,
    nucleoEngenharia: 0,
    nucleoMarcenaria: 0,
  });

  const [eventos, setEventos] = useState<Evento[]>([]);

  // Checklist persistente do banco de dados
  const [ceoChecklist, setCeoChecklist] = useState<CEOChecklist | null>(null);
  const [novoItemTexto, setNovoItemTexto] = useState("");
  const [adicionandoItem, setAdicionandoItem] = useState(false);
  const [salvandoItem, setSalvandoItem] = useState(false);

  // Frase motivacional do dia
  const [fraseDoDia, setFraseDoDia] = useState<FraseMotivacional | null>(null);

  // Menções do CEO em tarefas
  const [mencoes, setMencoes] = useState<Mencao[]>([]);
  const [importandoMencao, setImportandoMencao] = useState<string | null>(null);

  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [dadosMensais, setDadosMensais] = useState<any[]>([]);

  // Lista de contratos ativos para exibição nos cards
  const [contratosAtivosList, setContratosAtivosList] = useState<ContratoAtivo[]>([]);

  // Estado para expand/collapse dos cards de contratos ativos
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  // Função para toggle expand/collapse dos cards
  const handleToggleExpand = useCallback((id: string) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

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
          // Contratos
          supabase.from("contratos").select("id, codigo, status, valor_total, nucleo"),
          // Projetos
          supabase.from("projetos").select("id, status, nucleo, criado_em"),
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
        const contratosAtivos = contratos.filter(
          (c) => c.status === "ativo" || c.status === "em_andamento"
        ).length;
        const valorContratos = contratos
          .filter((c) => c.status === "ativo" || c.status === "em_andamento")
          .reduce((acc, c) => acc + (c.valor_total || 0), 0);

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
          (p) => p.criado_em && new Date(p.criado_em) >= new Date(inicioMes)
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
          contratosAtivos,
          valorContratos,
          nucleoArquitetura: nucleoArq || Math.floor(contratosAtivos * 0.35),
          nucleoEngenharia: nucleoEng || Math.floor(contratosAtivos * 0.4),
          nucleoMarcenaria: nucleoMarc || Math.floor(contratosAtivos * 0.25),
        });

        // Salvar lista de contratos ativos para os cards
        const listaContratosAtivos = contratos
          .filter((c) => c.status === "ativo" || c.status === "em_andamento")
          .map((c) => ({
            id: c.id,
            codigo: c.codigo,
            status: c.status,
            valor_total: c.valor_total,
            nucleo: c.nucleo,
          }));
        setContratosAtivosList(listaContratosAtivos);

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
                  .gte("criado_em", inicio)
                  .lt("criado_em", fim),
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

        // Carregar checklist do CEO
        if (usuario?.id) {
          try {
            const checklistDiario = await obterChecklistDiario(usuario.id);
            setCeoChecklist(checklistDiario);
          } catch (err) {
            console.error("Erro ao carregar checklist:", err);
          }

          // Carregar menções do CEO
          try {
            const mencoesRecentes = await buscarMencoesUsuario(usuario.id, 7);
            setMencoes(mencoesRecentes);
          } catch (err) {
            console.error("Erro ao carregar menções:", err);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar Dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, [usuario, loadingUsuario]);

  // Toggle checklist item (persistente)
  const toggleChecklist = useCallback(
    async (itemId: string) => {
      if (!ceoChecklist?.itens) return;

      const item = ceoChecklist.itens.find((i) => i.id === itemId);
      if (!item) return;

      try {
        const itemAtualizado = await toggleItemConcluido(
          itemId,
          !item.concluido
        );
        setCeoChecklist((prev) =>
          prev
            ? {
                ...prev,
                itens: prev.itens?.map((i) =>
                  i.id === itemId ? itemAtualizado : i
                ),
              }
            : null
        );
      } catch (err) {
        console.error("Erro ao atualizar item:", err);
      }
    },
    [ceoChecklist]
  );

  // Adicionar novo item ao checklist
  const handleAdicionarItem = useCallback(async () => {
    if (!ceoChecklist?.id || !novoItemTexto.trim()) return;

    setSalvandoItem(true);
    try {
      const novoItem = await adicionarItem(ceoChecklist.id, {
        texto: novoItemTexto.trim(),
        prioridade: "media",
      });
      setCeoChecklist((prev) =>
        prev
          ? {
              ...prev,
              itens: [...(prev.itens || []), novoItem],
            }
          : null
      );
      setNovoItemTexto("");
      setAdicionandoItem(false);
    } catch (err) {
      console.error("Erro ao adicionar item:", err);
    } finally {
      setSalvandoItem(false);
    }
  }, [ceoChecklist?.id, novoItemTexto]);

  // Remover item do checklist
  const handleRemoverItem = useCallback(
    async (itemId: string) => {
      if (!ceoChecklist?.itens) return;

      try {
        await removerItem(itemId);
        setCeoChecklist((prev) =>
          prev
            ? {
                ...prev,
                itens: prev.itens?.filter((i) => i.id !== itemId),
              }
            : null
        );
      } catch (err) {
        console.error("Erro ao remover item:", err);
      }
    },
    [ceoChecklist]
  );

  // Importar menção para o checklist
  const handleImportarMencao = useCallback(
    async (mencao: Mencao) => {
      if (!ceoChecklist?.id) return;

      setImportandoMencao(mencao.id);
      try {
        const textoTarefa = mencao.task?.titulo
          ? `[Menção] ${mencao.task.titulo}`
          : `[Menção] ${mencao.comentario.substring(0, 50)}...`;

        const novoItem = await importarMencaoParaChecklist(
          ceoChecklist.id,
          mencao.id,
          textoTarefa
        );
        setCeoChecklist((prev) =>
          prev
            ? {
                ...prev,
                itens: [...(prev.itens || []), novoItem],
              }
            : null
        );

        // Remover da lista de menções exibidas
        setMencoes((prev) => prev.filter((m) => m.id !== mencao.id));
      } catch (err) {
        console.error("Erro ao importar menção:", err);
      } finally {
        setImportandoMencao(null);
      }
    },
    [ceoChecklist?.id]
  );

  // Calcular progresso do checklist
  const checklistProgress = useMemo(() => {
    if (!ceoChecklist?.itens || ceoChecklist.itens.length === 0) return 0;
    return calcularProgresso(ceoChecklist.itens);
  }, [ceoChecklist?.itens]);

  // Variação percentual (reservado para uso futuro)
  const _variacaoReceita = useMemo(() => {
    if (metrics.receitaAnoAnterior === 0) return 0;
    return (
      ((metrics.receitaMes - metrics.receitaAnoAnterior) /
        metrics.receitaAnoAnterior) *
      100
    );
  }, [metrics]);

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
        {/* ====== BANNER HEADER ====== */}
        <header className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 rounded-2xl p-6 lg:p-8 shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              {/* Avatar do usuário */}
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                  {usuario?.foto_url ? (
                    <img
                      src={usuario.foto_url ?? undefined}
                      alt={usuario.nome ?? undefined}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-white">
                      {usuario?.nome?.charAt(0) || "W"}
                    </span>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center ring-2 ring-white">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                  WG Easy · Dashboard Executivo
                </p>
                <div className="flex items-center gap-2">
                  <saudacao.icon className={`w-5 h-5 ${saudacao.cor}`} />
                  <h1 className="text-2xl lg:text-3xl font-light text-white">
                    {saudacao.texto},{" "}
                    <span className="font-semibold text-orange-400">
                      {usuario?.nome?.split(" ")[0] || "CEO"}
                    </span>
                  </h1>
                </div>
                <p className="text-gray-400 text-sm capitalize">{dataHoje}</p>
              </div>
            </div>

            {/* Frase motivacional e botões */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
              {fraseDoDia && (
                <div className="flex items-start gap-2 max-w-md bg-slate-700/50 rounded-xl p-4 border border-slate-600/50">
                  <Quote className="w-4 h-4 text-orange-400/80 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-200 italic leading-relaxed">
                      "{fraseDoDia.frase}"
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      — {fraseDoDia.autor}
                    </p>
                  </div>
                </div>
              )}

              {/* Status Geral */}
              <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50 min-w-[180px]">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                  Status Geral
                </p>
                <p className="text-3xl font-bold text-white">72%</p>
                <p className="text-xs text-gray-400">
                  Sprint global WG concluída nesta semana.
                </p>
                <div className="mt-2 h-2 bg-slate-600 rounded-full overflow-hidden">
                  <div className="h-full w-[72%] bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Botões de ação no banner */}
          <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-slate-700/50">
            <button
              type="button"
              onClick={() => navigate("/area-cliente")}
              className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-100 text-gray-900 font-medium rounded-xl transition-all"
            >
              Abrir experiência do cliente
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate("/sistema/acessos")}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-700/50 hover:bg-slate-600/50 text-white font-medium rounded-xl border border-slate-600/50 transition-all"
            >
              <FileText className="w-4 h-4" />
              Configurar acessos
            </button>
          </div>
        </header>

        {/* ====== SEGUNDA LINHA: 3 COLUNAS ====== */}
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

            {/* Cards dinâmicos de contratos ativos do dia */}
            <div className="flex flex-wrap gap-3 mt-4">
              {(contratosAtivosList || []).map((contrato) => {
                const expanded = expandedCards[contrato.id] || false;
                const obra = contrato.obra;
                const cliente = contrato.cliente;
                const obraInfo = obra
                  ? `${obra.nome || ""} - ${obra.endereco || ""}`
                  : "Sem dados da obra";
                const clienteNome = cliente?.nome || "Cliente";
                const shareText = `Cliente: ${clienteNome}\nObra: ${obraInfo}`;
                return (
                  <div
                    key={contrato.id}
                    className="relative flex flex-col items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-xl min-w-[180px] transition-colors shadow group"
                  >
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-2 overflow-hidden">
                      <Users className="w-6 h-6 text-orange-500" />
                    </div>
                    <p className="text-xs font-medium text-gray-700 text-center truncate w-full">
                      {clienteNome}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {contrato.codigo || contrato.id}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {/* Expand/Collapse */}
                      <button
                        type="button"
                        onClick={() => handleToggleExpand(contrato.id)}
                        className="p-1.5 text-gray-400 hover:text-gray-600"
                        title={
                          expanded
                            ? "Ocultar dados da obra"
                            : "Mostrar dados da obra"
                        }
                      >
                        {expanded ? (
                          <ChevronRight className="w-4 h-4 rotate-90" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                      {/* Copy */}
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(shareText)}
                        className="p-1.5 text-gray-400 hover:text-gray-600"
                        title="Copiar dados da obra"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      {/* WhatsApp */}
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(
                          shareText
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-green-500 hover:text-green-700"
                        title="Compartilhar via WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>
                    </div>
                    {expanded && (
                      <div className="mt-2 w-full text-xs text-left bg-white rounded p-2 border border-gray-200">
                        <div>
                          <span className="font-semibold">Obra:</span>{" "}
                          {obraInfo}
                        </div>
                        {contrato.status && (
                          <div>
                            <span className="font-semibold">Status:</span>{" "}
                            {contrato.status}
                          </div>
                        )}
                        {contrato.nucleo && (
                          <div>
                            <span className="font-semibold">Núcleo:</span>{" "}
                            {contrato.nucleo}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* COLUNA 2: Calendário / Agenda (CENTRO) */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Calendário</h3>
                  <p className="text-xs text-gray-500">Próximos eventos</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 max-h-[280px] overflow-y-auto">
              {eventos.map((evento) => (
                <div
                  key={evento.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div
                    className={`w-2 h-2 mt-2 rounded-full ${
                      evento.tipo === "reuniao"
                        ? "bg-blue-500"
                        : evento.tipo === "entrega"
                        ? "bg-emerald-500"
                        : evento.tipo === "visita"
                        ? "bg-violet-500"
                        : "bg-amber-500"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {evento.titulo}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <span>{evento.data}</span>
                      {evento.hora && (
                        <>
                          <span>•</span>
                          <span>{evento.hora}</span>
                        </>
                      )}
                    </div>
                    {evento.cliente && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {evento.cliente}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => navigate("/cronograma")}
              className="w-full mt-4 py-2.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors"
            >
              Ver calendário completo →
            </button>
          </div>

          {/* COLUNA 3: Checklist do Dia (DIREITA) */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Checklist do Dia
                  </h3>
                  <p className="text-xs text-gray-500">
                    {checklistProgress}% concluído •{" "}
                    {ceoChecklist?.itens?.filter((i) => i.concluido).length ||
                      0}
                    /{ceoChecklist?.itens?.length || 0} tarefas
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAdicionandoItem(true)}
                className="p-1.5 hover:bg-emerald-100 rounded-lg transition-colors"
                title="Adicionar tarefa"
              >
                <Plus className="w-4 h-4 text-emerald-600" />
              </button>
            </div>

            {/* Input para novo item */}
            {adicionandoItem && (
              <div className="mb-4 flex gap-2">
                <input
                  type="text"
                  value={novoItemTexto}
                  onChange={(e) => setNovoItemTexto(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdicionarItem()}
                  placeholder="@eliana fazer entrega... (use @nome)"
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleAdicionarItem}
                  disabled={salvandoItem || !novoItemTexto.trim()}
                  className="px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 disabled:opacity-50 transition-colors"
                  title="Salvar tarefa"
                >
                  {salvandoItem ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAdicionandoItem(false);
                    setNovoItemTexto("");
                  }}
                  className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                  title="Cancelar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Items */}
            <div className="space-y-2 max-h-[250px] overflow-y-auto">
              {!ceoChecklist?.itens || ceoChecklist.itens.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    Nenhuma tarefa para hoje
                  </p>
                  <button
                    type="button"
                    onClick={() => setAdicionandoItem(true)}
                    className="mt-2 text-xs text-emerald-600 hover:text-emerald-700"
                  >
                    Adicionar primeira tarefa
                  </button>
                </div>
              ) : (
                ceoChecklist.itens.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className={`group flex items-center gap-3 p-3 rounded-xl transition-all ${
                      item.concluido
                        ? "bg-emerald-50 border border-emerald-100"
                        : "bg-gray-50 hover:bg-gray-100 border border-transparent"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleChecklist(item.id)}
                      className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        item.concluido
                          ? "bg-emerald-500"
                          : "border-2 border-gray-300 hover:border-emerald-400"
                      }`}
                      title={
                        item.concluido
                          ? "Marcar como pendente"
                          : "Marcar como concluído"
                      }
                    >
                      {item.concluido && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </button>
                    <span
                      onClick={() => toggleChecklist(item.id)}
                      className={`flex-1 text-sm cursor-pointer ${
                        item.concluido
                          ? "text-gray-400 line-through"
                          : "text-gray-700"
                      }`}
                    >
                      {item.texto}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoverItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
                      title="Remover tarefa"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ====== TERCEIRA LINHA: DASHBOARD FINANCEIRO ====== */}
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
              <p className="text-lg font-bold text-gray-900">285</p>
              <p className="text-[10px] text-gray-500 mt-1">
                Histórico + Sistema
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

        {/* ====== QUARTA LINHA: GRID PRINCIPAL (Gráficos e Detalhes) ====== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* COLUNA ESQUERDA - Gráficos e Núcleos */}
          <div className="lg:col-span-8 space-y-6">
            {/* Gráfico Financeiro */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Curva S (Acumulado)
                  </h3>
                  <p className="text-sm text-gray-500">
                    Receitas vs Despesas - Últimos 6 meses
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                    <span className="text-gray-500">Receitas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-400 rounded-full" />
                    <span className="text-gray-500">Despesas</span>
                  </div>
                </div>
              </div>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dadosMensais}>
                    <defs>
                      <linearGradient
                        id="colorReceitasCEO"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#10b981"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10b981"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorDespesasCEO"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#9ca3af"
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="95%"
                          stopColor="#9ca3af"
                          stopOpacity={0}
                        />
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
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#9ca3af"
                      fontSize={12}
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
                      labelStyle={{ color: "#374151" }}
                      formatter={(value: number) => [
                        new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(value),
                        "",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="receitas"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorReceitasCEO)"
                      name="Receitas"
                    />
                    <Area
                      type="monotone"
                      dataKey="despesas"
                      stroke="#9ca3af"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorDespesasCEO)"
                      name="Despesas"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Despesas por Núcleo */}
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
                      className="h-full bg-orange-500 rounded-full"
                      style={{ width: "85%" }}
                    />
                  </div>
                </div>
                {/* Arquitetura */}
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 w-24">
                    arquitetura
                  </span>
                  <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-400 rounded-full"
                      style={{ width: "65%" }}
                    />
                  </div>
                </div>
                {/* Engenharia */}
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 w-24">engenharia</span>
                  <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-300 rounded-full"
                      style={{ width: "45%" }}
                    />
                  </div>
                </div>
                {/* Marcenaria */}
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 w-24">marcenaria</span>
                  <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-200 rounded-full"
                      style={{ width: "30%" }}
                    />
                  </div>
                </div>
              </div>
            </div>

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

            {/* ====== MINHAS FINANÇAS PESSOAIS ====== */}
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
          </div>

          {/* COLUNA DIREITA - Menções e Alertas */}
          <div className="lg:col-span-4 space-y-6">
            {/* Menções do CEO */}
            {mencoes.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <AtSign className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Você foi Mencionado
                      </h3>
                      <p className="text-xs text-gray-500">
                        {mencoes.length}{" "}
                        {mencoes.length === 1
                          ? "menção recente"
                          : "menções recentes"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {mencoes.map((mencao) => (
                    <div
                      key={mencao.id}
                      className="group flex items-start gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all"
                    >
                      <MessageSquare className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        {mencao.task?.titulo && (
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {mencao.task.titulo}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                          {mencao.comentario.substring(0, 100)}...
                        </p>
                        {mencao.task?.project?.nome && (
                          <p className="text-xs text-purple-600 mt-1">
                            {mencao.task.project.nome}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleImportarMencao(mencao)}
                        disabled={importandoMencao === mencao.id}
                        className="opacity-0 group-hover:opacity-100 p-1.5 bg-purple-100 hover:bg-purple-200 rounded-lg transition-all"
                        title="Adicionar ao checklist"
                      >
                        {importandoMencao === mencao.id ? (
                          <Loader2 className="w-3.5 h-3.5 text-purple-600 animate-spin" />
                        ) : (
                          <ArrowRight className="w-3.5 h-3.5 text-purple-600" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

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

            {/* Acesso Rápido */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">
                Acesso Rápido
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/propostas")}
                  className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-orange-50 border border-transparent hover:border-orange-100 rounded-xl transition-all"
                >
                  <FileText className="w-5 h-5 text-orange-500" />
                  <span className="text-xs text-gray-600">Propostas</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/contratos")}
                  className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-xl transition-all"
                >
                  <Briefcase className="w-5 h-5 text-blue-500" />
                  <span className="text-xs text-gray-600">Contratos</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/financeiro")}
                  className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 rounded-xl transition-all"
                >
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                  <span className="text-xs text-gray-600">Financeiro</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/meu-financeiro")}
                  className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-amber-50 border border-transparent hover:border-amber-100 rounded-xl transition-all"
                >
                  <Wallet className="w-5 h-5 text-amber-500" />
                  <span className="text-xs text-gray-600">Meu Financeiro</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/pessoas/clientes")}
                  className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-violet-50 border border-transparent hover:border-violet-100 rounded-xl transition-all"
                >
                  <Users className="w-5 h-5 text-violet-500" />
                  <span className="text-xs text-gray-600">Clientes</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/cronograma")}
                  className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-cyan-50 border border-transparent hover:border-cyan-100 rounded-xl transition-all"
                >
                  <Calendar className="w-5 h-5 text-cyan-500" />
                  <span className="text-xs text-gray-600">Cronograma</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ====== FOOTER ====== */}
        <footer className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
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
