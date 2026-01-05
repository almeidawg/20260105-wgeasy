// ========================================
// PAGINA DE IMPORTACAO EM LOTE - PRICELIST
// Cole multiplos produtos (um por linha) para importar
// ========================================

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  ArrowLeft,
  Upload,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Play,
  Pause,
  Package,
  Image,
  Trash2,
  Edit2,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { buscarProdutoNaInternet, type ProdutoImportado } from "@/lib/importadorProdutos";
import { Input } from "@/components/ui/input";

interface ProdutoLote {
  id: string;
  linhaOriginal: string;
  nome: string;
  status: "pendente" | "buscando" | "encontrado" | "erro" | "salvo";
  dadosEncontrados?: ProdutoImportado;
  erro?: string;
  selecionado: boolean;
  // Campos editaveis
  nomeEditado?: string;
  precoEditado?: number;
  imagemEditada?: string;
  editando?: boolean;
}

type TipoPricelist = "mao_obra" | "material" | "servico" | "produto";

export default function ImportarLotePage() {
  const navigate = useNavigate();
  const [textoLote, setTextoLote] = useState("");
  const [produtos, setProdutos] = useState<ProdutoLote[]>([]);
  const [processando, setProcessando] = useState(false);
  const [pausado, setPausado] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [tipoSelecionado, setTipoSelecionado] = useState<TipoPricelist>("material");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>("");
  const [categorias, setCategorias] = useState<{ id: string; nome: string }[]>([]);
  const [etapa, setEtapa] = useState<"entrada" | "processando" | "revisao" | "salvando">("entrada");

  // Estatisticas
  const estatisticas = {
    total: produtos.length,
    pendentes: produtos.filter((p) => p.status === "pendente").length,
    encontrados: produtos.filter((p) => p.status === "encontrado").length,
    erros: produtos.filter((p) => p.status === "erro").length,
    salvos: produtos.filter((p) => p.status === "salvo").length,
    selecionados: produtos.filter((p) => p.selecionado && p.status === "encontrado").length,
  };

  // Carregar categorias
  useState(() => {
    async function carregarCategorias() {
      const { data } = await supabase
        .from("pricelist_categorias")
        .select("id, nome")
        .eq("ativo", true)
        .order("nome");
      if (data) setCategorias(data);
    }
    carregarCategorias();
  });

  // Processar texto colado e criar lista de produtos
  function processarTexto() {
    if (!textoLote.trim()) {
      toast.warning("Cole a lista de produtos primeiro");
      return;
    }

    const linhas = textoLote
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 3); // Ignorar linhas muito curtas

    if (linhas.length === 0) {
      toast.warning("Nenhum produto encontrado no texto");
      return;
    }

    const novosProdutos: ProdutoLote[] = linhas.map((linha, index) => ({
      id: `produto-${index}-${Date.now()}`,
      linhaOriginal: linha,
      nome: linha,
      status: "pendente",
      selecionado: true,
    }));

    setProdutos(novosProdutos);
    setEtapa("processando");
    toast.success(`${novosProdutos.length} produtos carregados`);
  }

  // Buscar dados de um produto
  async function buscarDadosProduto(produto: ProdutoLote): Promise<ProdutoLote> {
    try {
      // Buscar na internet
      const resultados = await buscarProdutoNaInternet(produto.nome);

      if (resultados && resultados.length > 0) {
        const melhorResultado = resultados[0];
        return {
          ...produto,
          status: "encontrado",
          dadosEncontrados: melhorResultado,
          nomeEditado: melhorResultado.titulo,
          precoEditado: melhorResultado.preco,
          imagemEditada: melhorResultado.imagem_url,
        };
      } else {
        return {
          ...produto,
          status: "erro",
          erro: "Produto nao encontrado",
        };
      }
    } catch (error: any) {
      return {
        ...produto,
        status: "erro",
        erro: error.message || "Erro na busca",
      };
    }
  }

  // Iniciar busca em lote
  async function iniciarBuscaEmLote() {
    const produtosPendentes = produtos.filter((p) => p.status === "pendente");

    if (produtosPendentes.length === 0) {
      toast.warning("Nenhum produto pendente para buscar");
      return;
    }

    setProcessando(true);
    setPausado(false);
    setProgresso(0);

    for (let i = 0; i < produtosPendentes.length; i++) {
      if (pausado) {
        setIndiceAtual(i);
        break;
      }

      const produto = produtosPendentes[i];

      // Atualizar status para buscando
      setProdutos((prev) =>
        prev.map((p) => (p.id === produto.id ? { ...p, status: "buscando" } : p))
      );

      // Buscar dados
      const produtoAtualizado = await buscarDadosProduto(produto);

      // Atualizar na lista
      setProdutos((prev) =>
        prev.map((p) => (p.id === produto.id ? produtoAtualizado : p))
      );

      // Atualizar progresso
      setProgresso(Math.round(((i + 1) / produtosPendentes.length) * 100));
      setIndiceAtual(i + 1);

      // Delay entre requisicoes
      if (i < produtosPendentes.length - 1 && !pausado) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    setProcessando(false);
    if (!pausado) {
      setEtapa("revisao");
      toast.success("Busca concluida! Revise os produtos antes de salvar.");
    }
  }

  // Continuar busca
  async function continuarBusca() {
    setPausado(false);
    const produtosPendentes = produtos.filter((p) => p.status === "pendente");

    setProcessando(true);

    for (let i = 0; i < produtosPendentes.length; i++) {
      if (pausado) {
        setIndiceAtual(i);
        break;
      }

      const produto = produtosPendentes[i];

      setProdutos((prev) =>
        prev.map((p) => (p.id === produto.id ? { ...p, status: "buscando" } : p))
      );

      const produtoAtualizado = await buscarDadosProduto(produto);

      setProdutos((prev) =>
        prev.map((p) => (p.id === produto.id ? produtoAtualizado : p))
      );

      setProgresso(Math.round(((i + 1) / produtosPendentes.length) * 100));

      if (i < produtosPendentes.length - 1 && !pausado) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    setProcessando(false);
    if (!pausado) {
      setEtapa("revisao");
    }
  }

  // Pausar busca
  function pausarBusca() {
    setPausado(true);
    toast.info("Busca pausada");
  }

  // Salvar produtos selecionados
  async function salvarProdutos() {
    const produtosParaSalvar = produtos.filter(
      (p) => p.selecionado && p.status === "encontrado"
    );

    if (produtosParaSalvar.length === 0) {
      toast.warning("Nenhum produto selecionado para salvar");
      return;
    }

    if (!categoriaSelecionada) {
      toast.warning("Selecione uma categoria");
      return;
    }

    setEtapa("salvando");
    let salvos = 0;
    let erros = 0;

    for (const produto of produtosParaSalvar) {
      try {
        const { error } = await supabase.from("pricelist_itens").insert({
          nome: produto.nomeEditado || produto.dadosEncontrados?.titulo || produto.nome,
          tipo: tipoSelecionado,
          categoria_id: categoriaSelecionada,
          preco: produto.precoEditado || produto.dadosEncontrados?.preco || 0,
          imagem_url: produto.imagemEditada || produto.dadosEncontrados?.imagem_url,
          link_produto: produto.dadosEncontrados?.url_origem,
          descricao: produto.dadosEncontrados?.descricao,
          fabricante: produto.dadosEncontrados?.marca,
          unidade: "un",
          ativo: true,
        });

        if (error) throw error;

        setProdutos((prev) =>
          prev.map((p) => (p.id === produto.id ? { ...p, status: "salvo" } : p))
        );
        salvos++;
      } catch (error) {
        erros++;
        console.error("Erro ao salvar produto:", error);
      }
    }

    toast.success(`${salvos} produtos salvos${erros > 0 ? `, ${erros} erros` : ""}`);
  }

  // Remover produto da lista
  function removerProduto(id: string) {
    setProdutos((prev) => prev.filter((p) => p.id !== id));
  }

  // Toggle edicao
  function toggleEdicao(id: string) {
    setProdutos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, editando: !p.editando } : p))
    );
  }

  // Atualizar campo editado
  function atualizarCampo(id: string, campo: string, valor: any) {
    setProdutos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [campo]: valor } : p))
    );
  }

  // Renderizar badge de status
  function renderStatus(status: ProdutoLote["status"]) {
    switch (status) {
      case "pendente":
        return <Badge variant="outline">Pendente</Badge>;
      case "buscando":
        return (
          <Badge className="bg-blue-100 text-blue-700">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Buscando
          </Badge>
        );
      case "encontrado":
        return (
          <Badge className="bg-green-100 text-green-700">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Encontrado
          </Badge>
        );
      case "erro":
        return (
          <Badge className="bg-red-100 text-red-700">
            <XCircle className="h-3 w-3 mr-1" />
            Erro
          </Badge>
        );
      case "salvo":
        return (
          <Badge className="bg-purple-100 text-purple-700">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Salvo
          </Badge>
        );
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/pricelist")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Importar em Lote</h1>
            <p className="text-gray-500">
              Cole uma lista de produtos (um por linha) para buscar e importar
            </p>
          </div>
        </div>
      </div>

      {/* Etapa 1: Entrada de texto */}
      {etapa === "entrada" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Lista de Produtos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Como usar:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-700">
                    <li>Cole a lista de produtos abaixo (um produto por linha)</li>
                    <li>Pode ser nome do produto, codigo ou descricao</li>
                    <li>O sistema buscara informacoes na internet (Leroy, Amazon, etc)</li>
                    <li>Voce podera revisar e editar antes de salvar</li>
                  </ul>
                </div>
              </div>
            </div>

            <Textarea
              placeholder={`Exemplo:
Torneira monocomando cozinha
Piso porcelanato 60x60 cinza
Tinta acrilica branca 18L
Rejunte cinza platina 1kg
Porta de correr vidro temperado`}
              value={textoLote}
              onChange={(e) => setTextoLote(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
            />

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {textoLote.split("\n").filter((l) => l.trim().length > 3).length} produtos
                detectados
              </span>
              <Button
                onClick={processarTexto}
                className="bg-[#F25C26] hover:bg-[#D94E1F]"
              >
                <Upload className="h-4 w-4 mr-2" />
                Processar Lista
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Etapa 2: Processamento */}
      {(etapa === "processando" || etapa === "revisao" || etapa === "salvando") && (
        <>
          {/* Cards de estatisticas */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-gray-800">{estatisticas.total}</div>
                <p className="text-sm text-gray-500">Total</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-blue-600">{estatisticas.pendentes}</div>
                <p className="text-sm text-gray-500">Pendentes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-green-600">{estatisticas.encontrados}</div>
                <p className="text-sm text-gray-500">Encontrados</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-red-600">{estatisticas.erros}</div>
                <p className="text-sm text-gray-500">Erros</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-purple-600">{estatisticas.salvos}</div>
                <p className="text-sm text-gray-500">Salvos</p>
              </CardContent>
            </Card>
          </div>

          {/* Progresso */}
          {processando && (
            <Card>
              <CardContent className="pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Buscando produtos...</h3>
                    <p className="text-sm text-gray-500">
                      {indiceAtual} de {estatisticas.pendentes + indiceAtual} processados
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!pausado ? (
                      <Button variant="outline" onClick={pausarBusca}>
                        <Pause className="h-4 w-4 mr-2" />
                        Pausar
                      </Button>
                    ) : (
                      <Button onClick={continuarBusca}>
                        <Play className="h-4 w-4 mr-2" />
                        Continuar
                      </Button>
                    )}
                  </div>
                </div>
                <Progress value={progresso} className="h-3" />
              </CardContent>
            </Card>
          )}

          {/* Controles de categoria e tipo */}
          {etapa === "revisao" && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-sm font-medium mb-1 block">
                      Tipo de Item
                    </label>
                    <Select
                      value={tipoSelecionado}
                      onValueChange={(v) => setTipoSelecionado(v as TipoPricelist)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="material">Material</SelectItem>
                        <SelectItem value="mao_obra">Mao de Obra</SelectItem>
                        <SelectItem value="servico">Servico</SelectItem>
                        <SelectItem value="produto">Produto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1 min-w-[200px]">
                    <label className="text-sm font-medium mb-1 block">
                      Categoria *
                    </label>
                    <Select
                      value={categoriaSelecionada}
                      onValueChange={setCategoriaSelecionada}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end gap-2">
                    {estatisticas.pendentes > 0 && (
                      <Button
                        variant="outline"
                        onClick={iniciarBuscaEmLote}
                        disabled={processando}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Buscar Pendentes ({estatisticas.pendentes})
                      </Button>
                    )}
                    <Button
                      onClick={salvarProdutos}
                      disabled={estatisticas.selecionados === 0 || !categoriaSelecionada}
                      className="bg-[#F25C26] hover:bg-[#D94E1F]"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Selecionados ({estatisticas.selecionados})
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabela de produtos */}
          <Card>
            <CardHeader>
              <CardTitle>Produtos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={
                            produtos.filter((p) => p.status === "encontrado").length > 0 &&
                            produtos
                              .filter((p) => p.status === "encontrado")
                              .every((p) => p.selecionado)
                          }
                          onChange={(e) => {
                            setProdutos((prev) =>
                              prev.map((p) =>
                                p.status === "encontrado"
                                  ? { ...p, selecionado: e.target.checked }
                                  : p
                              )
                            );
                          }}
                        />
                      </TableHead>
                      <TableHead className="w-16">Img</TableHead>
                      <TableHead>Busca Original</TableHead>
                      <TableHead>Nome Encontrado</TableHead>
                      <TableHead className="w-24">Preco</TableHead>
                      <TableHead className="w-24">Status</TableHead>
                      <TableHead className="w-20">Acoes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {produtos.map((produto) => (
                      <TableRow key={produto.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={produto.selecionado}
                            disabled={produto.status !== "encontrado"}
                            onChange={(e) =>
                              atualizarCampo(produto.id, "selecionado", e.target.checked)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          {produto.imagemEditada || produto.dadosEncontrados?.imagem_url ? (
                            <img
                              src={produto.imagemEditada || produto.dadosEncontrados?.imagem_url}
                              alt=""
                              className="w-12 h-12 object-cover rounded border"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center">
                              <Image className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">{produto.linhaOriginal}</span>
                        </TableCell>
                        <TableCell>
                          {produto.editando ? (
                            <Input
                              value={produto.nomeEditado || ""}
                              onChange={(e) =>
                                atualizarCampo(produto.id, "nomeEditado", e.target.value)
                              }
                              className="text-sm"
                            />
                          ) : (
                            <span className="font-medium">
                              {produto.nomeEditado ||
                                produto.dadosEncontrados?.titulo ||
                                "-"}
                            </span>
                          )}
                          {produto.erro && (
                            <p className="text-xs text-red-500">{produto.erro}</p>
                          )}
                        </TableCell>
                        <TableCell>
                          {produto.editando ? (
                            <Input
                              type="number"
                              step="0.01"
                              value={produto.precoEditado || ""}
                              onChange={(e) =>
                                atualizarCampo(
                                  produto.id,
                                  "precoEditado",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-24 text-sm"
                            />
                          ) : (
                            <span>
                              {(produto.precoEditado || produto.dadosEncontrados?.preco || 0) > 0
                                ? `R$ ${(produto.precoEditado || produto.dadosEncontrados?.preco || 0).toFixed(2)}`
                                : "-"}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{renderStatus(produto.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {produto.status === "encontrado" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleEdicao(produto.id)}
                                title={produto.editando ? "Salvar" : "Editar"}
                              >
                                {produto.editando ? (
                                  <Save className="h-4 w-4" />
                                ) : (
                                  <Edit2 className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removerProduto(produto.id)}
                              title="Remover"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
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

          {/* Botao de voltar */}
          <div className="flex justify-start">
            <Button
              variant="outline"
              onClick={() => {
                setEtapa("entrada");
                setProdutos([]);
                setProgresso(0);
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar e Recomecar
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
