/**
 * Página Financeira do Colaborador
 * Valores a receber, histórico de pagamentos, solicitações de reembolso
 */

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/auth/AuthContext";
import {
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle2,
  DollarSign,
  Calendar,
  Building2,
  Filter,
  Receipt,
  CreditCard,
  Plus,
  Eye,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  listarValoresReceber,
  obterResumoFinanceiroColaborador,
  ColaboradorValorReceber,
  ResumoFinanceiroColaborador,
} from "@/lib/colaboradorApi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SolicitacaoReembolsoModal } from "@/components/reembolso/SolicitacaoReembolsoModal";
import { supabase } from "@/lib/supabaseClient";

interface SolicitacaoReembolso {
  id: string;
  tipo: "reembolso" | "pagamento";
  descricao: string;
  valor: number;
  data_despesa: string;
  categoria: string;
  status: string;
  cliente_nome?: string;
  contrato_numero?: string;
  created_at: string;
}

export default function ColaboradorFinanceiroPage() {
  const { usuarioCompleto } = useAuth();
  const [loading, setLoading] = useState(true);
  const [valores, setValores] = useState<ColaboradorValorReceber[]>([]);
  const [resumo, setResumo] = useState<ResumoFinanceiroColaborador | null>(
    null
  );
  const [statusFiltro, setStatusFiltro] = useState<string>("todos");
  const [tipoFiltro, setTipoFiltro] = useState<string>("todos");

  // Estados para solicitações
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoReembolso[]>([]);
  const [loadingSolicitacoes, setLoadingSolicitacoes] = useState(false);
  const [showModalReembolso, setShowModalReembolso] = useState(false);
  const [tipoSolicitacao, setTipoSolicitacao] = useState<"reembolso" | "pagamento">("reembolso");
  const [activeTab, setActiveTab] = useState("valores");

  // Carregar solicitações
  const carregarSolicitacoes = useCallback(async () => {
    if (!usuarioCompleto?.pessoa_id) return;

    setLoadingSolicitacoes(true);
    try {
      const { data, error } = await supabase
        .from("solicitacoes_reembolso")
        .select(`
          *,
          cliente:pessoas!solicitacoes_reembolso_cliente_id_fkey(nome),
          contrato:contratos(numero)
        `)
        .eq("solicitante_id", usuarioCompleto.pessoa_id)
        .order("created_at", { ascending: false });

      if (!error) {
        setSolicitacoes(
          (data || []).map((s: any) => ({
            ...s,
            cliente_nome: s.cliente?.nome,
            contrato_numero: s.contrato?.numero,
          }))
        );
      }
    } catch (error) {
      console.error("Erro ao carregar solicitações:", error);
    } finally {
      setLoadingSolicitacoes(false);
    }
  }, [usuarioCompleto?.pessoa_id]);

  useEffect(() => {
    const carregarDados = async () => {
      if (!usuarioCompleto?.pessoa_id) return;

      try {
        setLoading(true);
        const [valoresData, resumoData] = await Promise.all([
          listarValoresReceber(usuarioCompleto.pessoa_id),
          obterResumoFinanceiroColaborador(usuarioCompleto.pessoa_id),
        ]);
        setValores(valoresData);
        setResumo(resumoData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
    carregarSolicitacoes();
  }, [usuarioCompleto?.pessoa_id, carregarSolicitacoes]);

  // Abrir modal de solicitação
  const abrirModalSolicitacao = (tipo: "reembolso" | "pagamento") => {
    setTipoSolicitacao(tipo);
    setShowModalReembolso(true);
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  const formatarData = (data?: string) => {
    if (!data) return "-";
    return new Date(data).toLocaleDateString("pt-BR");
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string }> = {
      previsto: { label: "Previsto", color: "bg-yellow-100 text-yellow-800" },
      aprovado: { label: "Aprovado", color: "bg-blue-100 text-blue-800" },
      liberado: { label: "Liberado", color: "bg-emerald-100 text-emerald-800" },
      pago: { label: "Pago", color: "bg-green-100 text-green-800" },
      cancelado: { label: "Cancelado", color: "bg-red-100 text-red-800" },
    };

    const config = statusConfig[status] || {
      label: status,
      color: "bg-gray-100 text-gray-600",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const getTipoBadge = (tipo: string) => {
    const tipoConfig: Record<string, { label: string; color: string }> = {
      comissao: { label: "Comissão", color: "bg-purple-100 text-purple-800" },
      honorario: { label: "Honorário", color: "bg-indigo-100 text-indigo-800" },
      fee_projeto: { label: "Fee Projeto", color: "bg-cyan-100 text-cyan-800" },
      bonus: { label: "Bônus", color: "bg-pink-100 text-pink-800" },
      repasse: { label: "Repasse", color: "bg-orange-100 text-orange-800" },
      outros: { label: "Outros", color: "bg-gray-100 text-gray-600" },
    };

    const config = tipoConfig[tipo] || {
      label: tipo,
      color: "bg-gray-100 text-gray-600",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const valoresFiltrados = valores.filter((v) => {
    const matchStatus = statusFiltro === "todos" || v.status === statusFiltro;
    const matchTipo = tipoFiltro === "todos" || v.tipo === tipoFiltro;
    return matchStatus && matchTipo;
  });

  const totalFiltrado = valoresFiltrados.reduce((acc, v) => acc + v.valor, 0);

  // Status badge para solicitações
  const getStatusSolicitacaoBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string }> = {
      pendente: { label: "Pendente", color: "bg-yellow-100 text-yellow-800" },
      aprovado: { label: "Aprovado", color: "bg-blue-100 text-blue-800" },
      rejeitado: { label: "Rejeitado", color: "bg-red-100 text-red-800" },
      pago: { label: "Pago", color: "bg-green-100 text-green-800" },
      faturado: { label: "Faturado", color: "bg-purple-100 text-purple-800" },
      cancelado: { label: "Cancelado", color: "bg-gray-100 text-gray-600" },
    };

    const config = statusConfig[status] || {
      label: status,
      color: "bg-gray-100 text-gray-600",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  // Contadores de solicitações
  const solicitacoesPendentes = solicitacoes.filter(
    (s) => s.status === "pendente"
  ).length;
  const totalSolicitacoes = solicitacoes.reduce((acc, s) => acc + s.valor, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F25C26]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meu Financeiro</h1>
          <p className="text-gray-500 mt-1">Acompanhe seus valores e solicitações</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-[#F25C26] hover:bg-[#D94E1F]">
              <Plus className="h-4 w-4 mr-2" />
              Solicitações
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => abrirModalSolicitacao("pagamento")}>
              <CreditCard className="h-4 w-4 mr-2 text-blue-500" />
              Solicitar Pagamento
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => abrirModalSolicitacao("reembolso")}>
              <Receipt className="h-4 w-4 mr-2 text-green-500" />
              Solicitar Reembolso
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Cards de Resumo - Design Atualizado */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* A Receber */}
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  A Receber
                </p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {formatarMoeda(
                    (resumo?.valor_previsto || 0) +
                      (resumo?.valor_aprovado || 0) +
                      (resumo?.valor_liberado || 0)
                  )}
                </p>
              </div>
              <div className="h-12 w-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Wallet className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pagamentos Pendentes */}
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Pagamentos Pendentes
                </p>
                <p className="text-2xl font-bold text-amber-600 mt-1">
                  {
                    valores.filter(
                      (v) => v.status === "liberado" || v.status === "aprovado"
                    ).length
                  }
                </p>
              </div>
              <div className="h-12 w-12 bg-amber-50 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Já Recebido */}
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Já Recebido
                </p>
                <p className="text-2xl font-bold text-violet-600 mt-1">
                  {formatarMoeda(resumo?.valor_pago || 0)}
                </p>
              </div>
              <div className="h-12 w-12 bg-violet-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-violet-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Solicitações Pendentes */}
        <Card
          className="bg-white border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setActiveTab("solicitacoes")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Solicitações Pendentes
                </p>
                <p className="text-2xl font-bold text-orange-600 mt-1">
                  {solicitacoesPendentes}
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-50 rounded-xl flex items-center justify-center">
                <Receipt className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para Valores e Solicitações */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="valores" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Valores a Receber
          </TabsTrigger>
          <TabsTrigger value="solicitacoes" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Minhas Solicitações
            {solicitacoesPendentes > 0 && (
              <span className="ml-1 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {solicitacoesPendentes}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Tab: Valores a Receber */}
        <TabsContent value="valores" className="space-y-4 mt-4">
          {/* Barra de Progresso Global */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">
                  Progresso de Recebimentos
                </h3>
                <span className="text-sm text-gray-500">
                  {resumo &&
                    Math.round(
                      (resumo.valor_pago /
                        (resumo.valor_previsto +
                          resumo.valor_aprovado +
                          resumo.valor_liberado +
                          resumo.valor_pago || 1)) *
                        100
                    )}
                  % concluído
                </span>
              </div>
              <Progress
                value={
                  resumo
                    ? (resumo.valor_pago /
                        (resumo.valor_previsto +
                          resumo.valor_aprovado +
                          resumo.valor_liberado +
                          resumo.valor_pago || 1)) *
                      100
                    : 0
                }
                className="h-3"
              />
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>
                  Total:{" "}
                  {formatarMoeda(
                    (resumo?.valor_previsto || 0) +
                      (resumo?.valor_aprovado || 0) +
                      (resumo?.valor_liberado || 0) +
                      (resumo?.valor_pago || 0)
                  )}
                </span>
                <span>Recebido: {formatarMoeda(resumo?.valor_pago || 0)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Valores */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle>Valores a Receber</CardTitle>
                <div className="flex gap-2">
                  <Select value={statusFiltro} onValueChange={setStatusFiltro}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="previsto">Previstos</SelectItem>
                      <SelectItem value="aprovado">Aprovados</SelectItem>
                      <SelectItem value="liberado">Liberados</SelectItem>
                      <SelectItem value="pago">Pagos</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="comissao">Comissão</SelectItem>
                      <SelectItem value="honorario">Honorário</SelectItem>
                      <SelectItem value="fee_projeto">Fee Projeto</SelectItem>
                      <SelectItem value="bonus">Bônus</SelectItem>
                      <SelectItem value="repasse">Repasse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {valoresFiltrados.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Nenhum valor encontrado</p>
                  <p className="text-sm mt-1">
                    {statusFiltro !== "todos" || tipoFiltro !== "todos"
                      ? "Tente ajustar os filtros"
                      : "Você ainda não possui valores a receber registrados"}
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Projeto</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead>Data Prevista</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {valoresFiltrados.map((valor) => (
                          <TableRow key={valor.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-gray-400" />
                                <span className="font-medium">
                                  {valor.projeto?.cliente_nome || "Geral"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>{getTipoBadge(valor.tipo)}</TableCell>
                            <TableCell className="max-w-[200px] truncate">
                              {valor.descricao || "-"}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Calendar className="h-3 w-3" />
                                {formatarData(valor.data_prevista)}
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(valor.status)}</TableCell>
                            <TableCell className="text-right font-semibold text-[#F25C26]">
                              {formatarMoeda(valor.valor)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Total Filtrado */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <span className="text-sm text-gray-500">
                      {valoresFiltrados.length} registro
                      {valoresFiltrados.length !== 1 ? "s" : ""}
                    </span>
                    <div className="text-right">
                      <span className="text-sm text-gray-500">Total:</span>
                      <span className="ml-2 text-lg font-bold text-[#F25C26]">
                        {formatarMoeda(totalFiltrado)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Minhas Solicitações */}
        <TabsContent value="solicitacoes" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle>Minhas Solicitações</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => abrirModalSolicitacao("pagamento")}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pagamento
                  </Button>
                  <Button
                    size="sm"
                    className="bg-[#F25C26] hover:bg-[#D94E1F]"
                    onClick={() => abrirModalSolicitacao("reembolso")}
                  >
                    <Receipt className="h-4 w-4 mr-2" />
                    Reembolso
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingSolicitacoes ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F25C26]" />
                </div>
              ) : solicitacoes.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Receipt className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Nenhuma solicitação</p>
                  <p className="text-sm mt-1">
                    Você ainda não fez nenhuma solicitação de reembolso ou pagamento
                  </p>
                  <div className="flex gap-2 justify-center mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => abrirModalSolicitacao("pagamento")}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Solicitar Pagamento
                    </Button>
                    <Button
                      size="sm"
                      className="bg-[#F25C26] hover:bg-[#D94E1F]"
                      onClick={() => abrirModalSolicitacao("reembolso")}
                    >
                      <Receipt className="h-4 w-4 mr-2" />
                      Solicitar Reembolso
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {solicitacoes.map((sol) => (
                          <TableRow key={sol.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {sol.tipo === "reembolso" ? (
                                  <Receipt className="h-4 w-4 text-green-500" />
                                ) : (
                                  <CreditCard className="h-4 w-4 text-blue-500" />
                                )}
                                <span className="text-sm capitalize">
                                  {sol.tipo}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-gray-400" />
                                <span className="font-medium">
                                  {sol.cliente_nome || "-"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">
                              {sol.descricao}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Calendar className="h-3 w-3" />
                                {formatarData(sol.data_despesa)}
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusSolicitacaoBadge(sol.status)}
                            </TableCell>
                            <TableCell className="text-right font-semibold text-[#F25C26]">
                              {formatarMoeda(sol.valor)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Total */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <span className="text-sm text-gray-500">
                      {solicitacoes.length} solicitação
                      {solicitacoes.length !== 1 ? "ões" : ""}
                    </span>
                    <div className="text-right">
                      <span className="text-sm text-gray-500">Total:</span>
                      <span className="ml-2 text-lg font-bold text-[#F25C26]">
                        {formatarMoeda(totalSolicitacoes)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Solicitação */}
      <SolicitacaoReembolsoModal
        open={showModalReembolso}
        onClose={() => setShowModalReembolso(false)}
        onSuccess={carregarSolicitacoes}
        tipo={tipoSolicitacao}
        solicitanteId={usuarioCompleto?.pessoa_id || ""}
      />
    </div>
  );
}
