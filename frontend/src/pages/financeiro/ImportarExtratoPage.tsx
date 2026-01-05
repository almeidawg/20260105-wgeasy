// ========================================
// PAGINA DE IMPORTACAO INTELIGENTE DE EXTRATOS
// Com preview editavel e classificacao por IA
// ========================================

import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Loader2,
  Brain,
  Download,
  RefreshCw,
  ArrowRight,
  Check,
  X,
  Copy,
  ChevronDown,
  ChevronUp,
  Settings,
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { parseExtrato, type LinhaExtrato, type ResultadoParsing } from '@/services/extratoParserService';
import { classificarLinhas, verificarDuplicatas, salvarPadraoAprendido, type ClassificacaoIA } from '@/services/extratoIAService';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

interface ItemImportacao extends LinhaExtrato {
  index: number;
  classificacao: ClassificacaoIA | null;
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'duplicado' | 'a_definir';
  duplicata_de: string | null;
  selecionado: boolean;
}

type Etapa = 'upload' | 'processando' | 'preview' | 'importando' | 'concluido';

interface Estatisticas {
  total: number;
  aprovados: number;
  rejeitados: number;
  duplicados: number;
  aDefinir: number;
  valorEntradas: number;
  valorSaidas: number;
}

export default function ImportarExtratoPage() {
  const [etapa, setEtapa] = useState<Etapa>('upload');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [resultadoParsing, setResultadoParsing] = useState<ResultadoParsing | null>(null);
  const [itens, setItens] = useState<ItemImportacao[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [projetos, setProjetos] = useState<any[]>([]);
  const [progresso, setProgresso] = useState(0);
  const [mensagemProgresso, setMensagemProgresso] = useState('');

  // Configurações avançadas de IA
  const [promptPersonalizado, setPromptPersonalizado] = useState<string>("");
  const [mostrarConfigIA, setMostrarConfigIA] = useState(false);
  const [errosImportacao, setErrosImportacao] = useState<string[]>([]);

  // Carregar dados de referencia
  useEffect(() => {
    carregarDadosReferencia();
  }, []);

  const carregarDadosReferencia = async () => {
    try {
      const [catRes, projRes] = await Promise.all([
        supabase.from('financeiro_categorias').select('id, nome, tipo').order('nome'),
        supabase.from('projetos').select('id, nome, numero').order('nome').limit(100),
      ]);

      setCategorias(catRes.data || []);
      setProjetos(projRes.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados de referencia:', error);
    }
  };

  // Estatisticas
  const estatisticas: Estatisticas = {
    total: itens.length,
    aprovados: itens.filter(i => i.status === 'aprovado').length,
    rejeitados: itens.filter(i => i.status === 'rejeitado').length,
    duplicados: itens.filter(i => i.status === 'duplicado').length,
    aDefinir: itens.filter(i => i.status === 'a_definir' || i.status === 'pendente').length,
    valorEntradas: itens.filter(i => i.tipo === 'entrada' && i.status !== 'rejeitado').reduce((s, i) => s + i.valor, 0),
    valorSaidas: itens.filter(i => i.tipo === 'saida' && i.status !== 'rejeitado').reduce((s, i) => s + i.valor, 0),
  };

  // Upload de arquivo
  const handleFileSelect = useCallback(async (file: File) => {
    setArquivo(file);
    setEtapa('processando');
    setProgresso(0);
    setMensagemProgresso('Lendo arquivo...');

    try {
      // 1. Parse do arquivo
      setProgresso(20);
      const resultado = await parseExtrato(file);
      setResultadoParsing(resultado);

      if (!resultado.sucesso || resultado.linhas.length === 0) {
        setErrosImportacao(resultado.erros);
        toast.error('Não foi possível processar o arquivo', {
          description: 'Verifique os erros abaixo e tente novamente.',
        });
        setEtapa('upload');
        return;
      }

      // Limpar erros anteriores se sucesso
      setErrosImportacao([]);

      // 2. Classificacao por IA
      setProgresso(40);
      setMensagemProgresso(`Classificando ${resultado.linhas.length} transacoes com IA...`);
      const classificacoes = await classificarLinhas(resultado.linhas, promptPersonalizado || undefined);

      // 3. Verificar duplicatas
      setProgresso(70);
      setMensagemProgresso('Verificando duplicatas...');
      const duplicatas = await verificarDuplicatas(resultado.linhas);

      // 4. Criar itens para preview
      setProgresso(90);
      setMensagemProgresso('Preparando preview...');
      const itensProcessados: ItemImportacao[] = resultado.linhas.map((linha, index) => {
        const classificacao = classificacoes.get(index) || null;
        const duplicadaDe = duplicatas.get(index) || null;
        const confianca = classificacao?.confianca || 0;

        let status: ItemImportacao['status'] = 'pendente';
        if (duplicadaDe) {
          status = 'duplicado';
        } else if (confianca >= 80) {
          status = 'aprovado';
        } else if (confianca < 50) {
          status = 'a_definir';
        }

        return {
          ...linha,
          index,
          classificacao,
          status,
          duplicata_de: duplicadaDe,
          selecionado: status === 'aprovado',
        };
      });

      setItens(itensProcessados);
      setProgresso(100);
      setEtapa('preview');
      toast.success(`${resultado.linhas.length} transacoes processadas!`);

    } catch (error: any) {
      console.error('Erro ao processar arquivo:', error);
      toast.error('Erro ao processar arquivo', { description: error.message });
      setEtapa('upload');
    }
  }, []);

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  // Atualizar item
  const atualizarItem = (index: number, changes: Partial<ItemImportacao>) => {
    setItens(prev => prev.map((item, i) =>
      i === index ? { ...item, ...changes } : item
    ));
  };

  // Acoes em lote
  const aprovarTodos = () => {
    setItens(prev => prev.map(item =>
      item.status !== 'duplicado' ? { ...item, status: 'aprovado', selecionado: true } : item
    ));
  };

  const rejeitarDuplicados = () => {
    setItens(prev => prev.map(item =>
      item.status === 'duplicado' ? { ...item, status: 'rejeitado', selecionado: false } : item
    ));
  };

  const inverterSelecao = () => {
    setItens(prev => prev.map(item => ({
      ...item,
      selecionado: !item.selecionado,
    })));
  };

  // Importar para lancamentos
  const importarLancamentos = async () => {
    const itensAprovados = itens.filter(i => i.status === 'aprovado' || i.selecionado);

    if (itensAprovados.length === 0) {
      toast.warning('Nenhum item selecionado para importacao');
      return;
    }

    setEtapa('importando');
    setProgresso(0);
    setMensagemProgresso('Criando registro de importacao...');

    try {
      // 1. Criar registro de importacao
      const { data: importacao, error: errImportacao } = await supabase
        .from('financeiro_importacoes')
        .insert({
          nome_arquivo: arquivo?.name || 'extrato.xlsx',
          tipo_arquivo: arquivo?.name.split('.').pop() || 'xlsx',
          tamanho_bytes: arquivo?.size || 0,
          status: 'processando',
          total_linhas: itens.length,
          data_inicio: resultadoParsing?.dataInicio,
          data_fim: resultadoParsing?.dataFim,
        })
        .select()
        .single();

      if (errImportacao) throw errImportacao;

      // 2. Importar cada lancamento
      let importados = 0;
      let erros = 0;

      for (let i = 0; i < itensAprovados.length; i++) {
        const item = itensAprovados[i];
        setProgresso(Math.round((i / itensAprovados.length) * 100));
        setMensagemProgresso(`Importando ${i + 1} de ${itensAprovados.length}...`);

        try {
          // Criar lancamento
          const { error: errLanc } = await supabase
            .from('financeiro_lancamentos')
            .insert({
              data_competencia: item.data,
              vencimento: item.data,
              data_pagamento: item.data,
              descricao: item.classificacao?.descricao_formatada || item.descricao,
              valor_total: item.valor,
              tipo: item.tipo, // 'entrada' ou 'saida'
              status: 'pago',
              categoria_id: item.classificacao?.categoria_id,
              projeto_id: item.classificacao?.projeto_id,
              contrato_id: item.classificacao?.contrato_id,
              pessoa_id: item.classificacao?.pessoa_id,
              origem: 'importacao',
              classificado_auto: true,
              confianca_classificacao: item.classificacao?.confianca || 0,
            });

          if (errLanc) {
            console.error('Erro ao importar lancamento:', errLanc);
            erros++;
          } else {
            importados++;

            // Salvar padrao aprendido se tiver alta confianca
            if (item.classificacao && item.classificacao.confianca >= 80) {
              await salvarPadraoAprendido(item.descricao, {
                categoria_id: item.classificacao.categoria_id || undefined,
                projeto_id: item.classificacao.projeto_id || undefined,
                contrato_id: item.classificacao.contrato_id || undefined,
                pessoa_id: item.classificacao.pessoa_id || undefined,
              });
            }
          }
        } catch (e) {
          erros++;
        }
      }

      // 3. Atualizar registro de importacao
      await supabase
        .from('financeiro_importacoes')
        .update({
          status: 'concluido',
          linhas_importadas: importados,
          linhas_erro: erros,
          linhas_duplicadas: itens.filter(i => i.status === 'duplicado').length,
          processado_em: new Date().toISOString(),
        })
        .eq('id', importacao.id);

      setProgresso(100);
      setEtapa('concluido');
      toast.success(`Importacao concluida! ${importados} lancamentos criados.`);

    } catch (error: any) {
      console.error('Erro na importacao:', error);
      toast.error('Erro na importacao', { description: error.message });
      setEtapa('preview');
    }
  };

  // Reiniciar
  const reiniciar = () => {
    setEtapa('upload');
    setArquivo(null);
    setResultadoParsing(null);
    setItens([]);
    setProgresso(0);
    setMensagemProgresso('');
    setErrosImportacao([]);
  };

  // Formatar valor
  const formatarValor = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Cor do status
  const corStatus = (status: string) => {
    switch (status) {
      case 'aprovado': return 'bg-green-100 text-green-800';
      case 'rejeitado': return 'bg-red-100 text-red-800';
      case 'duplicado': return 'bg-orange-100 text-orange-800';
      case 'a_definir': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Importar Extrato Bancario</h1>
          <p className="text-gray-500">Importacao inteligente com classificacao automatica por IA</p>
        </div>
        {etapa !== 'upload' && (
          <Button variant="outline" onClick={reiniciar}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Nova Importacao
          </Button>
        )}
      </div>

      {/* ETAPA 1: UPLOAD */}
      {etapa === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload do Extrato
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <FileSpreadsheet className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Arraste o arquivo do extrato aqui
              </h3>
              <p className="text-gray-500 mb-4">
                ou clique para selecionar um arquivo
              </p>
              <p className="text-sm text-gray-400">
                Formatos aceitos: Excel (.xlsx, .xls), CSV, OFX, PDF
              </p>
              <input
                id="file-input"
                type="file"
                accept=".xlsx,.xls,.csv,.ofx,.pdf"
                onChange={handleInputChange}
                className="hidden"
              />
            </div>

            {/* Configurações avançadas de IA */}
            <div className="mt-6 border rounded-lg">
              <button
                type="button"
                onClick={() => setMostrarConfigIA(!mostrarConfigIA)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-gray-500" />
                  <span className="font-medium text-gray-700">Configurações Avançadas de IA</span>
                </div>
                {mostrarConfigIA ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {mostrarConfigIA && (
                <div className="p-4 pt-0 space-y-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="promptPersonalizado" className="text-sm font-medium">
                      Prompt Personalizado para Classificação
                    </Label>
                    <Textarea
                      id="promptPersonalizado"
                      value={promptPersonalizado}
                      onChange={(e) => setPromptPersonalizado(e.target.value)}
                      placeholder="Ex: Classifique as transações considerando que pagamentos para 'CONSTRUTORA XYZ' são relacionados ao projeto 'Obra Residencial'. Despesas com 'LEROY' são materiais de construção..."
                      className="min-h-[100px] text-sm"
                    />
                    <p className="text-xs text-gray-500">
                      Use este campo para dar instruções específicas à IA sobre como classificar suas transações.
                      Mencione nomes de fornecedores, projetos específicos ou regras de categorização.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Painel de Erros */}
            {errosImportacao.length > 0 && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-medium text-red-800 mb-2">Erro ao processar arquivo</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                      {errosImportacao.map((erro, i) => (
                        <li key={i}>{erro}</li>
                      ))}
                    </ul>
                    <div className="mt-3 pt-3 border-t border-red-200">
                      <p className="text-sm text-red-600 font-medium">Dicas para resolver:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-red-600 mt-1">
                        <li>Verifique se o arquivo tem colunas de <strong>Data</strong>, <strong>Descrição</strong> e <strong>Valor</strong></li>
                        <li>O formato de data deve ser DD/MM/AAAA ou DD/MM/AA</li>
                        <li>O valor deve usar vírgula como decimal (ex: 1.234,56)</li>
                        <li>Certifique-se que os dados começam na primeira planilha</li>
                        <li>Tente exportar do banco em formato OFX (mais confiável)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 grid grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <FileSpreadsheet className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                <p className="text-sm font-medium text-blue-900">Excel</p>
                <p className="text-xs text-blue-600">.xlsx, .xls</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <FileSpreadsheet className="w-8 h-8 mx-auto text-green-600 mb-2" />
                <p className="text-sm font-medium text-green-900">CSV</p>
                <p className="text-xs text-green-600">.csv</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <FileSpreadsheet className="w-8 h-8 mx-auto text-purple-600 mb-2" />
                <p className="text-sm font-medium text-purple-900">OFX</p>
                <p className="text-xs text-purple-600">.ofx</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <FileSpreadsheet className="w-8 h-8 mx-auto text-red-600 mb-2" />
                <p className="text-sm font-medium text-red-900">PDF</p>
                <p className="text-xs text-red-600">IA Vision</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ETAPA 2: PROCESSANDO */}
      {etapa === 'processando' && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Brain className="w-16 h-16 mx-auto text-primary animate-pulse mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Processando com Inteligencia Artificial
              </h3>
              <p className="text-gray-500 mb-6">{mensagemProgresso}</p>
              <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progresso}%` }}
                />
              </div>
              <p className="text-sm text-gray-400 mt-2">{progresso}%</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ETAPA 3: PREVIEW */}
      {etapa === 'preview' && (
        <>
          {/* Estatisticas */}
          <div className="grid grid-cols-6 gap-4">
            <Card className="bg-blue-50">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-blue-700">{estatisticas.total}</p>
                <p className="text-sm text-blue-600">Total</p>
              </CardContent>
            </Card>
            <Card className="bg-green-50">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-700">{estatisticas.aprovados}</p>
                <p className="text-sm text-green-600">Aprovados</p>
              </CardContent>
            </Card>
            <Card className="bg-orange-50">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-orange-700">{estatisticas.duplicados}</p>
                <p className="text-sm text-orange-600">Duplicados</p>
              </CardContent>
            </Card>
            <Card className="bg-yellow-50">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-yellow-700">{estatisticas.aDefinir}</p>
                <p className="text-sm text-yellow-600">A Definir</p>
              </CardContent>
            </Card>
            <Card className="bg-emerald-50">
              <CardContent className="p-4 text-center">
                <p className="text-lg font-bold text-emerald-700">{formatarValor(estatisticas.valorEntradas)}</p>
                <p className="text-sm text-emerald-600">Entradas</p>
              </CardContent>
            </Card>
            <Card className="bg-red-50">
              <CardContent className="p-4 text-center">
                <p className="text-lg font-bold text-red-700">{formatarValor(estatisticas.valorSaidas)}</p>
                <p className="text-sm text-red-600">Saidas</p>
              </CardContent>
            </Card>
          </div>

          {/* Acoes em lote */}
          <Card>
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={aprovarTodos}>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Aprovar Todos
                  </Button>
                  <Button variant="outline" size="sm" onClick={rejeitarDuplicados}>
                    <XCircle className="w-4 h-4 mr-2" />
                    Rejeitar Duplicados
                  </Button>
                  <Button variant="outline" size="sm" onClick={inverterSelecao}>
                    <Copy className="w-4 h-4 mr-2" />
                    Inverter Selecao
                  </Button>
                </div>
                <Button onClick={importarLancamentos}>
                  <Download className="w-4 h-4 mr-2" />
                  Importar {itens.filter(i => i.selecionado).length} Lancamentos
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tabela de itens */}
          <Card>
            <CardContent className="p-0">
              <div className="max-h-[500px] overflow-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-white z-10">
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox
                          checked={itens.every(i => i.selecionado)}
                          onCheckedChange={(checked) => {
                            setItens(prev => prev.map(item => ({ ...item, selecionado: !!checked })));
                          }}
                        />
                      </TableHead>
                      <TableHead className="w-24">Data</TableHead>
                      <TableHead>Descricao</TableHead>
                      <TableHead className="w-32 text-right">Valor</TableHead>
                      <TableHead className="w-32">Categoria</TableHead>
                      <TableHead className="w-40">Projeto</TableHead>
                      <TableHead className="w-20 text-center">Confianca</TableHead>
                      <TableHead className="w-24">Status</TableHead>
                      <TableHead className="w-20">Acoes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itens.map((item, index) => (
                      <TableRow
                        key={index}
                        className={item.status === 'rejeitado' ? 'opacity-50' : ''}
                      >
                        <TableCell>
                          <Checkbox
                            checked={item.selecionado}
                            onCheckedChange={(checked) => atualizarItem(index, { selecionado: !!checked })}
                          />
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {new Date(item.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="truncate font-medium">{item.classificacao?.descricao_formatada || item.descricao}</p>
                            {item.classificacao?.motivo && (
                              <p className="text-xs text-gray-400 truncate">{item.classificacao.motivo}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className={`text-right font-mono ${item.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                          {item.tipo === 'entrada' ? '+' : '-'}{formatarValor(item.valor)}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={item.classificacao?.categoria_id || ''}
                            onValueChange={(value) => {
                              atualizarItem(index, {
                                classificacao: {
                                  ...item.classificacao!,
                                  categoria_id: value,
                                },
                              });
                            }}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                              {categorias.map(cat => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  {cat.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={item.classificacao?.projeto_id || ''}
                            onValueChange={(value) => {
                              atualizarItem(index, {
                                classificacao: {
                                  ...item.classificacao!,
                                  projeto_id: value,
                                },
                              });
                            }}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                              {projetos.map(proj => (
                                <SelectItem key={proj.id} value={proj.id}>
                                  {proj.nome || proj.numero}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={item.classificacao?.confianca && item.classificacao.confianca >= 80 ? 'default' : 'secondary'}>
                            {item.classificacao?.confianca || 0}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={corStatus(item.status)}>
                            {item.status === 'aprovado' && 'Aprovado'}
                            {item.status === 'rejeitado' && 'Rejeitado'}
                            {item.status === 'duplicado' && 'Duplicado'}
                            {item.status === 'a_definir' && 'A Definir'}
                            {item.status === 'pendente' && 'Pendente'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => atualizarItem(index, { status: 'aprovado', selecionado: true })}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => atualizarItem(index, { status: 'rejeitado', selecionado: false })}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* ETAPA 4: IMPORTANDO */}
      {etapa === 'importando' && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Loader2 className="w-16 h-16 mx-auto text-primary animate-spin mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Importando Lancamentos
              </h3>
              <p className="text-gray-500 mb-6">{mensagemProgresso}</p>
              <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progresso}%` }}
                />
              </div>
              <p className="text-sm text-gray-400 mt-2">{progresso}%</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ETAPA 5: CONCLUIDO */}
      {etapa === 'concluido' && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Importacao Concluida!
              </h3>
              <p className="text-gray-500 mb-6">
                {estatisticas.aprovados} lancamentos foram importados com sucesso.
              </p>
              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={reiniciar}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Nova Importacao
                </Button>
                <Button onClick={() => window.location.href = '/financeiro/lancamentos'}>
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Ver Lancamentos
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
