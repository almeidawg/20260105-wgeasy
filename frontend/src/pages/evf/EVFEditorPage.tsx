// ============================================================================
// EVF EDITOR PAGE - Editor de Estudo de Viabilidade Financeira
// Sistema WG Easy - Grupo WG Almeida
// ============================================================================

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Calculator,
  FileSpreadsheet,
  FileText,
  Home,
  Ruler,
  TrendingUp,
  DollarSign,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from "recharts";

import {
  buscarEstudo,
  criarEstudo,
  atualizarEstudo,
  buscarAnalisesAprovadas,
  buscarCategoriasConfig,
  atualizarItemEstudoReal,
  recalcularTotais,
} from "@/lib/evfApi";
import type {
  EVFEstudoCompleto,
  EVFItem,
  PadraoAcabamento,
  EVFCategoriaConfig,
} from "@/types/evf";
import {
  PADRAO_LABELS,
  PADRAO_MULTIPLICADORES,
  calcularItensEVF,
  calcularTotaisEVF,
  calcularPercentuais,
  formatarMoeda,
  formatarNumero,
  getCorCategoria,
  CATEGORIAS_EVF_CONFIG,
} from "@/types/evf";
import { exportarEVFParaPDF, exportarEVFParaExcel } from "@/lib/exportarEVF";
import { listarPessoas, Pessoa } from "@/lib/pessoasApi";
import { SUBCATEGORIAS_PADRAO, getCodigoCategoria } from "@/config/categoriasConfig";

// Subcategorias principais para distribuição de valores por categoria
const SUBCATEGORIAS_EVF = [
  { prefixo: "MDO", nome: "Mão de Obra", percentual: 0.35 },  // 35% do valor
  { prefixo: "MAT", nome: "Material", percentual: 0.45 },     // 45% do valor
  { prefixo: "PRO", nome: "Produto", percentual: 0.20 },      // 20% do valor
];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function EVFEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEdicao = !!id;

  // Estados principais
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [estudo, setEstudo] = useState<EVFEstudoCompleto | null>(null);

  // Estados do formulário
  const [titulo, setTitulo] = useState("");
  const [analiseProjetoId, setAnaliseProjetoId] = useState("");
  const [metragem, setMetragem] = useState(0);
  const [padrao, setPadrao] = useState<PadraoAcabamento>("medio_alto");
  const [observacoes, setObservacoes] = useState("");
  const [itens, setItens] = useState<EVFItem[]>([]);

  // Estados auxiliares
  const [analisesDisponiveis, setAnalisesDisponiveis] = useState<
    Array<{ id: string; titulo: string; area_total: number; cliente_nome: string | null }>
  >([]);
  const [categoriasConfig, setCategoriasConfig] = useState<EVFCategoriaConfig[]>([]);
  const [clientes, setClientes] = useState<Pessoa[]>([]);
  const [clienteId, setClienteId] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Carregar dados iniciais
  useEffect(() => {
    carregarDadosIniciais();
  }, [id]);

  async function carregarDadosIniciais() {
    try {
      setLoading(true);

      // Carregar análises disponíveis, configuração de categorias e clientes
      const [analises, categorias, clientesList] = await Promise.all([
        buscarAnalisesAprovadas(),
        buscarCategoriasConfig(),
        listarPessoas({ tipo: "CLIENTE", ativo: true }),
      ]);
      setAnalisesDisponiveis(analises);
      setCategoriasConfig(categorias);
      setClientes(clientesList);

      // Se for edição, carregar estudo existente
      if (id) {
        const estudoExistente = await buscarEstudo(id);
        setEstudo(estudoExistente);
        setTitulo(estudoExistente.titulo);
        setAnaliseProjetoId(estudoExistente.analise_projeto_id || "");
        setClienteId(estudoExistente.cliente_id || "");
        setMetragem(estudoExistente.metragem_total);
        setPadrao(estudoExistente.padrao_acabamento);
        setObservacoes(estudoExistente.observacoes || "");
        setItens(estudoExistente.itens);
      } else {
        // Novo estudo - calcular itens com valores padrão
        const novosItens = calcularItensEVF(0, "medio_alto", categorias);
        setItens(novosItens);
      }
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  // Recalcular itens quando metragem ou padrão mudam
  useEffect(() => {
    if (!loading && metragem > 0) {
      const novosItens = calcularItensEVF(metragem, padrao, categoriasConfig);

      // Preservar valores editados manualmente (se existirem)
      const itensAtualizados = novosItens.map((novoItem) => {
        const itemExistente = itens.find((i) => i.categoria === novoItem.categoria);
        if (itemExistente && itemExistente.valorEstudoReal !== itemExistente.valorPrevisao) {
          return {
            ...novoItem,
            valorEstudoReal: itemExistente.valorEstudoReal,
          };
        }
        return novoItem;
      });

      setItens(calcularPercentuais(itensAtualizados));
    }
  }, [metragem, padrao]);

  // Quando selecionar uma análise, preencher metragem automaticamente
  function handleAnaliseChange(analiseId: string) {
    setAnaliseProjetoId(analiseId);
    // Se selecionou uma análise, preenche metragem e título automaticamente
    if (analiseId) {
      const analise = analisesDisponiveis.find((a) => a.id === analiseId);
      if (analise) {
        setMetragem(analise.area_total);
        if (!titulo) {
          setTitulo(`EVF - ${analise.titulo}`);
        }
      }
    }
  }

  // Atualizar valor de estudo real de um item
  function handleValorEstudoRealChange(categoria: string, valor: number) {
    const novosItens = itens.map((item) =>
      item.categoria === categoria ? { ...item, valorEstudoReal: valor } : item
    );
    setItens(calcularPercentuais(novosItens));
  }

  // Resetar valor para previsão
  function handleResetarValor(categoria: string) {
    const novosItens = itens.map((item) =>
      item.categoria === categoria ? { ...item, valorEstudoReal: item.valorPrevisao } : item
    );
    setItens(calcularPercentuais(novosItens));
  }

  // Salvar estudo
  async function handleSalvar() {
    if (!titulo) {
      toast({ title: "Erro", description: "Informe o título do estudo", variant: "destructive" });
      return;
    }
    if (!clienteId) {
      toast({ title: "Erro", description: "Selecione um cliente", variant: "destructive" });
      return;
    }
    if (metragem <= 0) {
      toast({ title: "Erro", description: "A metragem deve ser maior que zero", variant: "destructive" });
      return;
    }

    try {
      setSalvando(true);

      const analise = analisesDisponiveis.find((a) => a.id === analiseProjetoId);

      if (isEdicao && id) {
        await atualizarEstudo(id, {
          titulo,
          cliente_id: clienteId || null,
          metragem_total: metragem,
          padrao_acabamento: padrao,
          observacoes,
        });

        // Atualizar valores editados
        for (const item of itens) {
          if (item.valorEstudoReal !== item.valorPrevisao) {
            await atualizarItemEstudoReal(id, item.categoria, item.valorEstudoReal);
          }
        }
        await recalcularTotais(id);

        toast({ title: "Estudo atualizado", description: "As alterações foram salvas." });
      } else {
        const novoEstudo = await criarEstudo({
          analise_projeto_id: analiseProjetoId || undefined,
          cliente_id: clienteId,
          titulo,
          metragem_total: metragem,
          padrao_acabamento: padrao,
          observacoes,
        });

        toast({ title: "Estudo criado", description: "O estudo foi criado com sucesso." });
        navigate(`/evf/${novoEstudo.id}`);
      }
    } catch (error: any) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } finally {
      setSalvando(false);
    }
  }

  // Calcular totais
  const totais = useMemo(() => {
    return calcularTotaisEVF(itens, metragem);
  }, [itens, metragem]);

  // Obter nome do cliente selecionado
  const clienteSelecionado = useMemo(() => {
    if (clienteId) {
      return clientes.find(c => c.id === clienteId)?.nome;
    }
    const analise = analisesDisponiveis.find(a => a.id === analiseProjetoId);
    return analise?.cliente_nome || undefined;
  }, [clienteId, clientes, analiseProjetoId, analisesDisponiveis]);

  // Exportar para Excel
  function handleExportarExcel() {
    exportarEVFParaExcel({
      titulo,
      cliente: clienteSelecionado,
      metragem,
      padrao,
      valorTotal: totais.valorTotal,
      valorM2Medio: totais.valorM2Medio,
      itens,
      observacoes,
    });
    toast({ title: "Exportado", description: "Arquivo Excel gerado com sucesso." });
  }

  // Exportar para PDF
  function handleExportarPDF() {
    exportarEVFParaPDF({
      titulo,
      cliente: clienteSelecionado,
      metragem,
      padrao,
      valorTotal: totais.valorTotal,
      valorM2Medio: totais.valorM2Medio,
      itens,
      observacoes,
    });
    toast({ title: "Exportado", description: "Arquivo PDF gerado com sucesso." });
  }

  // Dados para o gráfico pizza
  const dadosGrafico = useMemo(() => {
    return itens
      .filter((item) => item.valorEstudoReal > 0)
      .map((item) => ({
        name: item.nome,
        value: item.valorEstudoReal,
        percentual: item.percentualTotal,
        cor: getCorCategoria(item.categoria),
      }))
      .sort((a, b) => b.value - a.value);
  }, [itens]);

  // Loading
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-wg-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando estudo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/evf")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-wg-primary/10 rounded-lg">
                <Calculator className="w-6 h-6 text-wg-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isEdicao ? "Editar Estudo" : "Novo Estudo de Viabilidade"}
                </h1>
                <p className="text-sm text-gray-600">
                  Estimativa de investimento baseada em metragem e padrão
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleExportarExcel}
              disabled={!titulo || metragem <= 0}
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Excel
            </Button>
            <Button
              variant="outline"
              onClick={handleExportarPDF}
              disabled={!titulo || metragem <= 0}
            >
              <FileText className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button
              onClick={handleSalvar}
              disabled={salvando}
              className="bg-wg-primary hover:bg-wg-primary/90"
            >
              {salvando ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar
            </Button>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
            <div className="flex items-center gap-3">
              <Ruler className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Metragem Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatarNumero(metragem)} m²
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
            <div className="flex items-center gap-3">
              <Home className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">Padrão de Acabamento</p>
                <p className="text-xl font-bold text-gray-900">
                  {PADRAO_LABELS[padrao]?.label}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Valor Total Estimado</p>
                <p className="text-2xl font-bold text-wg-primary">
                  {formatarMoeda(totais.valorTotal)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-orange-500">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-500">Valor por m²</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatarMoeda(totais.valorM2Medio)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulário Completo - Todos os campos em uma linha */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {/* Cliente - Campo obrigatório principal */}
            <div>
              <Label>Cliente *</Label>
              <Select
                value={clienteId || "none"}
                onValueChange={(val) => setClienteId(val === "none" ? "" : val)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Selecione...</SelectItem>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{cliente.nome}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Título */}
            <div>
              <Label htmlFor="titulo">Título do Estudo *</Label>
              <Input
                id="titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: EVF - Apartamento"
                className="mt-1"
              />
            </div>

            {/* Metragem */}
            <div>
              <Label htmlFor="metragem">Metragem (m²) *</Label>
              <Input
                id="metragem"
                type="number"
                value={metragem}
                onChange={(e) => setMetragem(parseFloat(e.target.value) || 0)}
                className="mt-1"
                step="0.01"
              />
            </div>

            {/* Análise de Projeto - Opcional (vincula depois) */}
            <div>
              <Label>Análise de Projeto</Label>
              <Select
                value={analiseProjetoId || "none"}
                onValueChange={(val) => handleAnaliseChange(val === "none" ? "" : val)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Vincular análise (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma (vincular depois)</SelectItem>
                  {analisesDisponiveis.map((analise) => (
                    <SelectItem key={analise.id} value={analise.id}>
                      <div className="flex flex-col">
                        <span>{analise.titulo}</span>
                        <span className="text-xs text-gray-500">
                          {formatarNumero(analise.area_total)} m²
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Padrão de Acabamento */}
            <div>
              <Label>Padrão de Acabamento</Label>
              <div className="flex gap-1 mt-1">
                {(["economico", "medio_alto", "alto_luxo"] as PadraoAcabamento[]).map((p) => (
                  <TooltipProvider key={p}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          size="sm"
                          variant={padrao === p ? "default" : "outline"}
                          className={`flex-1 text-xs px-2 ${padrao === p ? "bg-wg-primary" : ""}`}
                          onClick={() => setPadrao(p)}
                        >
                          {PADRAO_LABELS[p].label.split("/")[0]}
                          <span className="ml-1 opacity-70">{PADRAO_MULTIPLICADORES[p]}x</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{PADRAO_LABELS[p].descricao}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabela de Categorias + Gráfico */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          {/* Tabela */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="font-semibold text-gray-900">Categorias de Investimento</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-2 py-2 text-left font-medium text-gray-600">Itens</th>
                    <th className="px-2 py-2 text-right font-medium text-gray-600 whitespace-nowrap">R$/m²</th>
                    <th className="px-2 py-2 text-right font-medium text-gray-600 whitespace-nowrap">Previsão</th>
                    <th className="px-2 py-2 text-right font-medium text-gray-600 whitespace-nowrap">Variação ±15%</th>
                    <th className="px-2 py-2 text-right font-medium text-gray-600 whitespace-nowrap">Estudo Real</th>
                    <th className="px-2 py-2 text-center font-medium text-gray-600">%</th>
                    <th className="px-1 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {itens.map((item) => {
                    const dentroVariacao =
                      item.valorEstudoReal >= item.valorMinimo &&
                      item.valorEstudoReal <= item.valorMaximo;
                    const editado = item.valorEstudoReal !== item.valorPrevisao;
                    const isExpanded = expandedCategories.has(item.categoria);
                    const multiplicador = PADRAO_MULTIPLICADORES[padrao];

                    return (
                      <React.Fragment key={item.categoria}>
                        <tr
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            const newExpanded = new Set(expandedCategories);
                            if (isExpanded) {
                              newExpanded.delete(item.categoria);
                            } else {
                              newExpanded.add(item.categoria);
                            }
                            setExpandedCategories(newExpanded);
                          }}
                        >
                          <td className="px-2 py-2">
                            <div className="flex items-center gap-1">
                              {isExpanded ? (
                                <ChevronDown className="w-3 h-3 text-gray-400 flex-shrink-0" />
                              ) : (
                                <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                              )}
                              <div
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: getCorCategoria(item.categoria) }}
                              />
                              <span className="font-medium text-gray-900 truncate">{item.nome}</span>
                            </div>
                          </td>
                          <td className="px-2 py-2 text-right text-gray-600 whitespace-nowrap">
                            {formatarMoeda(item.valorM2Ajustado)}
                          </td>
                          <td className="px-2 py-2 text-right text-gray-600 whitespace-nowrap">
                            {formatarMoeda(item.valorPrevisao)}
                          </td>
                          <td className="px-2 py-2 text-right text-gray-500 whitespace-nowrap">
                            {formatarMoeda(item.valorMinimo)} - {formatarMoeda(item.valorMaximo)}
                          </td>
                          <td className="px-2 py-2 text-right" onClick={(e) => e.stopPropagation()}>
                            <Input
                              type="number"
                              value={item.valorEstudoReal}
                              onChange={(e) =>
                                handleValorEstudoRealChange(
                                  item.categoria,
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className={`w-28 text-right text-xs ${
                                !dentroVariacao
                                  ? "border-red-300 bg-red-50"
                                  : editado
                                  ? "border-blue-300 bg-blue-50"
                                  : ""
                              }`}
                              step="0.01"
                            />
                          </td>
                          <td className="px-2 py-2 text-center text-gray-600 whitespace-nowrap">
                            {formatarNumero(item.percentualTotal, 1)}%
                          </td>
                          <td className="px-1 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                            {editado && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleResetarValor(item.categoria)}
                                title="Resetar para previsão"
                              >
                                <RefreshCw className="w-3 h-3" />
                              </Button>
                            )}
                          </td>
                        </tr>
                        {/* Linha expandida com subcategorias do pricelist */}
                        {isExpanded && (
                          <tr key={`${item.categoria}-detail`} className="bg-gray-50/70">
                            <td colSpan={7} className="p-2">
                              {/* Tabela de subcategorias - largura total */}
                              <table className="w-full text-[11px] border rounded overflow-hidden">
                                <thead className="bg-gray-100">
                                  <tr>
                                    <th className="px-2 py-1 text-left font-medium text-gray-600 whitespace-nowrap">Subcategoria</th>
                                    <th className="px-2 py-1 text-right font-medium text-gray-600 whitespace-nowrap">Valor Base (m²)</th>
                                    <th className="px-2 py-1 text-right font-medium text-blue-600 whitespace-nowrap">Mão de Obra</th>
                                    <th className="px-2 py-1 text-right font-medium text-amber-600 whitespace-nowrap">Material</th>
                                    <th className="px-2 py-1 text-right font-medium text-purple-600 whitespace-nowrap">Produtos</th>
                                    <th className="px-2 py-1 text-right font-medium text-green-600 whitespace-nowrap">Variação -10%</th>
                                    <th className="px-2 py-1 text-right font-medium text-orange-600 whitespace-nowrap">Variação +15%</th>
                                    <th className="px-2 py-1 text-right font-medium text-gray-600 whitespace-nowrap">Estudo Real</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y bg-white">
                                  {SUBCATEGORIAS_EVF.map((sub) => {
                                    const valorBase = item.valorM2Base * sub.percentual;
                                    const valorSubTotal = item.valorPrevisao * sub.percentual;
                                    const variacaoMenos = valorSubTotal * 0.90;
                                    const variacaoMais = valorSubTotal * 1.15;
                                    const estudoRealSub = item.valorEstudoReal * sub.percentual;

                                    return (
                                      <tr key={sub.prefixo} className="hover:bg-gray-50">
                                        <td className="px-2 py-1 whitespace-nowrap">
                                          <div className="flex items-center gap-1.5">
                                            <span
                                              className="font-mono text-[10px] font-bold px-1 py-0.5 rounded"
                                              style={{
                                                backgroundColor: getCorCategoria(item.categoria) + "20",
                                                color: getCorCategoria(item.categoria),
                                              }}
                                            >
                                              {sub.prefixo}/{getCodigoCategoria(item.categoria)}
                                            </span>
                                            <span className="text-gray-700">{sub.nome}</span>
                                          </div>
                                        </td>
                                        <td className="px-2 py-1 text-right text-gray-600 font-mono whitespace-nowrap">
                                          {formatarMoeda(valorBase)}
                                        </td>
                                        <td className="px-2 py-1 text-right text-blue-600 font-mono whitespace-nowrap">
                                          {sub.prefixo === "MDO" ? formatarMoeda(valorSubTotal) : "-"}
                                        </td>
                                        <td className="px-2 py-1 text-right text-amber-600 font-mono whitespace-nowrap">
                                          {sub.prefixo === "MAT" ? formatarMoeda(valorSubTotal) : "-"}
                                        </td>
                                        <td className="px-2 py-1 text-right text-purple-600 font-mono whitespace-nowrap">
                                          {sub.prefixo === "PRO" ? formatarMoeda(valorSubTotal) : "-"}
                                        </td>
                                        <td className="px-2 py-1 text-right text-green-600 font-mono whitespace-nowrap">
                                          {formatarMoeda(variacaoMenos)}
                                        </td>
                                        <td className="px-2 py-1 text-right text-orange-600 font-mono whitespace-nowrap">
                                          {formatarMoeda(variacaoMais)}
                                        </td>
                                        <td className="px-2 py-1 text-right font-mono font-semibold whitespace-nowrap">
                                          {formatarMoeda(estudoRealSub)}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                                <tfoot className="bg-gray-100 font-semibold">
                                  <tr>
                                    <td className="px-2 py-1 text-gray-700 whitespace-nowrap">TOTAL {item.nome}</td>
                                    <td className="px-2 py-1 text-right text-gray-700 font-mono whitespace-nowrap">
                                      {formatarMoeda(item.valorM2Base)}
                                    </td>
                                    <td className="px-2 py-1 text-right text-blue-700 font-mono whitespace-nowrap">
                                      {formatarMoeda(item.valorPrevisao * 0.35)}
                                    </td>
                                    <td className="px-2 py-1 text-right text-amber-700 font-mono whitespace-nowrap">
                                      {formatarMoeda(item.valorPrevisao * 0.45)}
                                    </td>
                                    <td className="px-2 py-1 text-right text-purple-700 font-mono whitespace-nowrap">
                                      {formatarMoeda(item.valorPrevisao * 0.20)}
                                    </td>
                                    <td className="px-2 py-1 text-right text-green-700 font-mono whitespace-nowrap">
                                      {formatarMoeda(item.valorMinimo)}
                                    </td>
                                    <td className="px-2 py-1 text-right text-orange-700 font-mono whitespace-nowrap">
                                      {formatarMoeda(item.valorMaximo)}
                                    </td>
                                    <td
                                      className={`px-2 py-1 text-right font-mono font-bold whitespace-nowrap ${
                                        dentroVariacao ? "text-green-700" : "text-red-700"
                                      }`}
                                    >
                                      {formatarMoeda(item.valorEstudoReal)}
                                    </td>
                                  </tr>
                                </tfoot>
                              </table>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-100 font-bold text-xs">
                  <tr>
                    <td className="px-2 py-2 text-gray-900">TOTAL</td>
                    <td className="px-2 py-2 text-right text-gray-600 whitespace-nowrap">
                      {formatarMoeda(totais.valorM2Medio)}
                    </td>
                    <td className="px-2 py-2 text-right text-gray-600 whitespace-nowrap">
                      {formatarMoeda(totais.valorPrevisaoTotal)}
                    </td>
                    <td className="px-2 py-2 text-right text-gray-500 whitespace-nowrap">
                      {formatarMoeda(totais.valorMinimoTotal)} - {formatarMoeda(totais.valorMaximoTotal)}
                    </td>
                    <td className="px-2 py-2 text-right text-wg-primary text-sm font-bold whitespace-nowrap">
                      {formatarMoeda(totais.valorTotal)}
                    </td>
                    <td className="px-2 py-2 text-center">100%</td>
                    <td className="px-1"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Gráfico Pizza */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="font-semibold text-gray-900 mb-4">Distribuição por Categoria</h2>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dadosGrafico}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percentual }) =>
                      percentual > 5 ? `${percentual.toFixed(1)}%` : ""
                    }
                    labelLine={false}
                  >
                    {dadosGrafico.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.cor} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value: number, name: string) => [
                      formatarMoeda(value),
                      name,
                    ]}
                  />
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    wrapperStyle={{ fontSize: "12px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Observações */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea
            id="observacoes"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Notas adicionais sobre o estudo..."
            className="mt-1"
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}
