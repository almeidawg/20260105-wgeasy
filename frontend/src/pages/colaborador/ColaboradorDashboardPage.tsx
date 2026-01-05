/**
 * Dashboard do Colaborador
 * Visão geral de projetos, checklist diário, agenda e pendências
 */

import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import {
  FolderKanban,
  AlertTriangle,
  FileText,
  CheckCircle2,
  ArrowRight,
  CalendarDays,
  Building2,
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  Circle,
  CheckCircle,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  listarProjetosColaborador,
  obterResumoFinanceiroColaborador,
  ColaboradorProjeto,
  ResumoFinanceiroColaborador,
  listarLancamentosFavorecido,
  ColaboradorLancamento,
} from "@/lib/colaboradorApi";
import { supabase } from "@/lib/supabaseClient";

// Interface para eventos da agenda
interface EventoAgenda {
  id: string;
  titulo: string;
  data: string;
  tipo: "reuniao" | "entrega" | "visita" | "outro";
  descricao?: string;
}

// Interface para itens do checklist
interface ChecklistItem {
  id: string;
  texto: string;
  concluido: boolean;
  ordem: number;
}

export default function ColaboradorDashboardPage() {
  const { usuarioCompleto } = useAuth();
  const [loading, setLoading] = useState(true);
  const [projetos, setProjetos] = useState<ColaboradorProjeto[]>([]);
  const [resumoFinanceiro, setResumoFinanceiro] =
    useState<ResumoFinanceiroColaborador | null>(null);
  const [lancamentosPendentes, setLancamentosPendentes] = useState<
    ColaboradorLancamento[]
  >([]);
  const [eventos, setEventos] = useState<EventoAgenda[]>([]);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [mesAtual, setMesAtual] = useState(new Date());
  const [novoItemTexto, setNovoItemTexto] = useState("");
  const [adicionandoItem, setAdicionandoItem] = useState(false);

  // Carregar dados
  useEffect(() => {
    const carregarDados = async () => {
      if (!usuarioCompleto?.pessoa_id) return;

      try {
        setLoading(true);

        const [projetosData, resumoData, solicitacoesData] = await Promise.all([
          listarProjetosColaborador(usuarioCompleto.pessoa_id),
          obterResumoFinanceiroColaborador(usuarioCompleto.pessoa_id),
          listarLancamentosFavorecido(usuarioCompleto.pessoa_id),
        ]);

        setProjetos(projetosData);
        setResumoFinanceiro(resumoData);
        setLancamentosPendentes(
          solicitacoesData.filter((l) =>
            ["pendente", "previsto", "parcialmente_pago"].includes(
              l.status || ""
            )
          )
        );

        // Carregar eventos da agenda
        await carregarEventos();

        // Carregar checklist diário
        await carregarChecklist();
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [usuarioCompleto?.pessoa_id]);

  // Carregar eventos da agenda
  const carregarEventos = async () => {
    try {
      const { data } = await supabase
        .from("agenda_colaborador")
        .select("*")
        .eq("colaborador_id", usuarioCompleto?.pessoa_id)
        .gte("data", new Date().toISOString().split("T")[0])
        .order("data", { ascending: true })
        .limit(10);

      if (data) {
        setEventos(data);
      }
    } catch (error) {
      console.error("Erro ao carregar eventos:", error);
    }
  };

  // Carregar checklist diário
  const carregarChecklist = async () => {
    try {
      const hoje = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("checklist_colaborador")
        .select("*")
        .eq("colaborador_id", usuarioCompleto?.pessoa_id)
        .eq("data", hoje)
        .order("ordem", { ascending: true });

      if (data && data.length > 0) {
        setChecklistItems(data);
      } else {
        setChecklistItems([]);
      }
    } catch (error) {
      console.error("Erro ao carregar checklist:", error);
      setChecklistItems([]);
    }
  };

  // Adicionar novo item ao checklist
  const adicionarItemChecklist = async () => {
    if (!novoItemTexto.trim() || !usuarioCompleto?.pessoa_id) return;

    setAdicionandoItem(true);
    try {
      const hoje = new Date().toISOString().split("T")[0];
      const novaOrdem = checklistItems.length + 1;

      const { data, error } = await supabase
        .from("checklist_colaborador")
        .insert({
          colaborador_id: usuarioCompleto.pessoa_id,
          data: hoje,
          texto: novoItemTexto.trim(),
          concluido: false,
          ordem: novaOrdem,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setChecklistItems((prev) => [...prev, data]);
        setNovoItemTexto("");
      }
    } catch (error) {
      console.error("Erro ao adicionar item:", error);
    } finally {
      setAdicionandoItem(false);
    }
  };

  // Toggle item do checklist
  const toggleChecklistItem = async (itemId: string) => {
    const item = checklistItems.find((i) => i.id === itemId);
    if (!item) return;

    const novoConcluido = !item.concluido;

    // Atualizar UI imediatamente
    setChecklistItems((prev) =>
      prev.map((i) =>
        i.id === itemId ? { ...i, concluido: novoConcluido } : i
      )
    );

    // Salvar no banco
    try {
      await supabase
        .from("checklist_colaborador")
        .update({
          concluido: novoConcluido,
          concluido_em: novoConcluido ? new Date().toISOString() : null,
        })
        .eq("id", itemId);
    } catch (error) {
      console.error("Erro ao atualizar item:", error);
      // Reverter em caso de erro
      setChecklistItems((prev) =>
        prev.map((i) =>
          i.id === itemId ? { ...i, concluido: !novoConcluido } : i
        )
      );
    }
  };

  // Calcular progresso do checklist
  const progressoChecklist = useMemo(() => {
    const total = checklistItems.length;
    const concluidos = checklistItems.filter((item) => item.concluido).length;
    return { total, concluidos, percentual: total > 0 ? Math.round((concluidos / total) * 100) : 0 };
  }, [checklistItems]);

  // Gerar dias do calendário
  const diasCalendario = useMemo(() => {
    const ano = mesAtual.getFullYear();
    const mes = mesAtual.getMonth();
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const diasNoMes = ultimoDia.getDate();
    const diaSemanaInicio = primeiroDia.getDay();

    const dias: { dia: number; tipo: "anterior" | "atual" | "proximo"; data: Date; temEvento?: boolean }[] = [];

    // Dias do mês anterior
    const diasMesAnterior = new Date(ano, mes, 0).getDate();
    for (let i = diaSemanaInicio - 1; i >= 0; i--) {
      dias.push({
        dia: diasMesAnterior - i,
        tipo: "anterior",
        data: new Date(ano, mes - 1, diasMesAnterior - i),
      });
    }

    // Dias do mês atual
    for (let i = 1; i <= diasNoMes; i++) {
      const dataAtual = new Date(ano, mes, i);
      const dataStr = dataAtual.toISOString().split("T")[0];
      const temEvento = eventos.some((e) => e.data.split("T")[0] === dataStr);
      dias.push({ dia: i, tipo: "atual", data: dataAtual, temEvento });
    }

    // Dias do próximo mês (completar 42 dias = 6 semanas)
    const diasRestantes = 42 - dias.length;
    for (let i = 1; i <= diasRestantes; i++) {
      dias.push({ dia: i, tipo: "proximo", data: new Date(ano, mes + 1, i) });
    }

    return dias;
  }, [mesAtual, eventos]);

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
    > = {
      ativo: { label: "Ativo", variant: "default" },
      em_execucao: { label: "Em Execução", variant: "default" },
      concluido: { label: "Concluído", variant: "secondary" },
      aguardando_assinatura: { label: "Aguardando", variant: "outline" },
    };

    const config = statusConfig[status] || { label: status, variant: "outline" as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const nomeMes = mesAtual.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const hoje = new Date();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F25C26]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Linha 1: Projetos | Checklist Diário | Agenda */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Projetos */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-blue-600" />
                Projetos
              </CardTitle>
              <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                <Link to="/colaborador/projetos">
                  Ver todos
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {projetos.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <FolderKanban className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">Nenhum projeto vinculado</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {projetos.slice(0, 4).map((projeto) => (
                  <div
                    key={projeto.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-7 w-7 bg-[#F25C26]/10 rounded flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-3.5 w-3.5 text-[#F25C26]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">
                          {projeto.projeto?.cliente_nome || "Projeto"}
                        </p>
                        <p className="text-[10px] text-gray-500 truncate">
                          {projeto.funcao || "Equipe"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-[10px] font-bold text-[#F25C26]">
                        {projeto.projeto?.progresso || 0}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Checklist Diário */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-green-600" />
                Checklist Diário
              </CardTitle>
              <span className="text-xs font-bold text-green-600">
                {progressoChecklist.concluidos}/{progressoChecklist.total}
              </span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-300"
                style={{ width: `${progressoChecklist.percentual}%` }}
              />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Input para adicionar novo item */}
            <div className="flex gap-1.5 mb-2">
              <Input
                placeholder="Nova tarefa..."
                value={novoItemTexto}
                onChange={(e) => setNovoItemTexto(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && adicionarItemChecklist()}
                className="h-8 text-xs"
                disabled={adicionandoItem}
              />
              <Button
                size="sm"
                className="h-8 px-2 bg-green-600 hover:bg-green-700"
                onClick={adicionarItemChecklist}
                disabled={adicionandoItem || !novoItemTexto.trim()}
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* Lista de itens */}
            <div className="space-y-1.5 max-h-[150px] overflow-y-auto">
              {checklistItems.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-3">
                  Adicione tarefas para o dia
                </p>
              ) : (
                checklistItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleChecklistItem(item.id)}
                    className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-all ${
                      item.concluido
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    {item.concluido ? (
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )}
                    <span className={`text-xs ${item.concluido ? "line-through" : ""}`}>
                      {item.texto}
                    </span>
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Agenda / Calendário */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-[#F25C26]" />
                Agenda
              </CardTitle>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  title="Mês anterior"
                  aria-label="Mês anterior"
                  onClick={() => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1))}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <span className="text-[10px] font-medium capitalize min-w-[80px] text-center">
                  {nomeMes}
                </span>
                <button
                  type="button"
                  title="Próximo mês"
                  aria-label="Próximo mês"
                  onClick={() => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1))}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Dias da semana */}
            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {["D", "S", "T", "Q", "Q", "S", "S"].map((dia, i) => (
                <div key={i} className="text-[9px] font-medium text-gray-400 text-center py-1">
                  {dia}
                </div>
              ))}
            </div>
            {/* Dias do mês */}
            <div className="grid grid-cols-7 gap-0.5">
              {diasCalendario.map((item, i) => {
                const isHoje =
                  item.tipo === "atual" &&
                  item.dia === hoje.getDate() &&
                  mesAtual.getMonth() === hoje.getMonth() &&
                  mesAtual.getFullYear() === hoje.getFullYear();
                return (
                  <div
                    key={i}
                    className={`relative text-[10px] text-center py-1 rounded ${
                      item.tipo !== "atual"
                        ? "text-gray-300"
                        : isHoje
                        ? "bg-[#F25C26] text-white font-bold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {item.dia}
                    {item.temEvento && (
                      <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full" />
                    )}
                  </div>
                );
              })}
            </div>
            {/* Próximos eventos */}
            {eventos.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <p className="text-[10px] font-medium text-gray-500 mb-1">Próximos:</p>
                {eventos.slice(0, 2).map((evento) => (
                  <div key={evento.id} className="flex items-center gap-2 text-[10px] py-0.5">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    <span className="truncate text-gray-700">{evento.titulo}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Linha 2: Lançamentos e Alertas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Lançamentos Pendentes */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                Lançamentos
              </CardTitle>
              <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                <Link to="/colaborador/solicitacoes">
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {lancamentosPendentes.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">Nenhum lançamento pendente</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[180px] overflow-y-auto">
                {lancamentosPendentes.slice(0, 4).map((lancamento) => (
                  <div
                    key={lancamento.id}
                    className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">
                          {lancamento.contrato?.numero_contrato ||
                            lancamento.contrato?.numero ||
                            "Lançamento"}
                        </p>
                        <p className="text-[10px] text-gray-500 truncate">
                          {lancamento.descricao}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {lancamento.status || "pendente"}
                      </Badge>
                    </div>
                    <p className="text-xs font-bold text-[#F25C26] mt-1">
                      {formatarMoeda(lancamento.valor_total)}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <Button className="w-full mt-3 h-8 text-xs" variant="outline" asChild>
              <Link to="/colaborador/solicitacoes/nova">
                <Plus className="w-3 h-3 mr-1" />
                Nova Solicitação
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Alertas */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Alertas
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {projetos.some((p) => p.projeto?.status === "aguardando_assinatura") && (
                <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs font-medium text-amber-800">
                    Contratos aguardando assinatura
                  </p>
                  <p className="text-[10px] text-amber-600 mt-0.5">
                    Verifique os projetos pendentes
                  </p>
                </div>
              )}

              {lancamentosPendentes.length > 3 && (
                <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs font-medium text-blue-800">
                    {lancamentosPendentes.length} lançamentos pendentes
                  </p>
                  <p className="text-[10px] text-blue-600 mt-0.5">
                    Acompanhe o andamento
                  </p>
                </div>
              )}

              {resumoFinanceiro && resumoFinanceiro.valor_liberado > 0 && (
                <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs font-medium text-green-800">
                    Valores liberados para pagamento
                  </p>
                  <p className="text-[10px] text-green-600 mt-0.5">
                    {formatarMoeda(resumoFinanceiro.valor_liberado)} disponível
                  </p>
                </div>
              )}

              {progressoChecklist.percentual < 100 && progressoChecklist.total > 0 && (
                <div className="p-2 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-xs font-medium text-orange-800">
                    Checklist diário incompleto
                  </p>
                  <p className="text-[10px] text-orange-600 mt-0.5">
                    {progressoChecklist.total - progressoChecklist.concluidos} tarefa(s) pendente(s)
                  </p>
                </div>
              )}

              {projetos.length === 0 &&
                lancamentosPendentes.length === 0 &&
                progressoChecklist.percentual === 100 && (
                  <div className="text-center py-6 text-gray-500">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p className="text-xs">Tudo em dia!</p>
                  </div>
                )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
