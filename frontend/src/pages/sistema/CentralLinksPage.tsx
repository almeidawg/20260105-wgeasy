// src/pages/sistema/CentralLinksPage.tsx
// Central de Links - Gerenciar links de cadastro

import { useState, useEffect } from "react";

// URL base do sistema em produção
const PRODUCTION_URL = "https://easy.wgalmeida.com.br";

// Função para obter a URL base correta
function getBaseUrl(): string {
  if (import.meta.env.PROD) {
    return PRODUCTION_URL;
  }
  return window.location.origin;
}
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Link2,
  Plus,
  Search,
  MoreVertical,
  Copy,
  Send,
  Mail,
  RefreshCw,
  ExternalLink,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Zap,
  FileText,
  UserPlus,
  Briefcase,
  ListFilter,
  Globe,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useUsuarioLogado } from "@/hooks/useUsuarioLogado";
import {
  criarLinkCadastro,
  listarCadastrosPendentes,
  gerarMensagemWhatsApp,
  gerarUrlWhatsApp,
  gerarLinkEmail,
  getLabelTipoCadastro,
  getCorStatusCadastro,
  getLabelStatusCadastro,
  type CadastroPendente,
  type TipoCadastro,
} from "@/lib/cadastroLinkApi";
import { supabase } from "@/lib/supabaseClient";
import { format, formatDistanceToNow, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function CentralLinksPage() {
  const { toast } = useToast();
  const { usuario } = useUsuarioLogado();

  // Tab ativa
  const [activeTab, setActiveTab] = useState("links-rapidos");

  const [links, setLinks] = useState<CadastroPendente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<TipoCadastro | "TODOS">("TODOS");
  const [filtroStatus, setFiltroStatus] = useState<string>("TODOS");

  // Criar link
  const [criando, setCriando] = useState(false);
  const [tipoLink, setTipoLink] = useState<"cadastro" | "campanha">("campanha"); // Padrão: campanha
  const [novoLinkTipo, setNovoLinkTipo] = useState<TipoCadastro>("CLIENTE");
  const [novoLinkReutilizavel, setNovoLinkReutilizavel] = useState(false);
  const [novoLinkUsoMaximo, setNovoLinkUsoMaximo] = useState<number | null>(null);
  const [novoLinkExpiraDias, setNovoLinkExpiraDias] = useState(7);
  const [novoLinkPessoaVinculada, setNovoLinkPessoaVinculada] = useState<string>("");
  const [propostaVinculadoId, setPropostaVinculadoId] = useState<string>("");

  // Dialog para link de campanha gerado
  const [dialogLinkCampanha, setDialogLinkCampanha] = useState(false);
  const [linkCampanhaGerado, setLinkCampanhaGerado] = useState<string>("");

  // Campanha - Estados
  const [nomeCampanha, setNomeCampanha] = useState<string>("");
  const [paginaDestino, setPaginaDestino] = useState<string>("site-principal");
  const [responsavelCampanha, setResponsavelCampanha] = useState<string>("");
  const [filtroTipoResponsavel, setFiltroTipoResponsavel] = useState<string>("todos");

  // Páginas de destino disponíveis para campanhas
  const paginasDestino = [
    {
      id: "site-principal",
      nome: "Solicite Proposta (Site)",
      descricao: "Página principal do site",
      baseUrl: "https://wgalmeida.com.br/solicite-sua-proposta",
      parametro: "c",
      cor: "orange",
    },
    {
      id: "wgeasy",
      nome: "WG Easy (Sistema)",
      descricao: "Formulário do sistema interno",
      baseUrl: getBaseUrl() + "/solicite-sua-proposta",
      parametro: "c",
      cor: "blue",
    },
    {
      id: "reforma",
      nome: "Landing Reforma",
      descricao: "Página especial de reforma",
      baseUrl: "https://wgalmeida.com.br/reforma",
      parametro: "c",
      cor: "green",
    },
    {
      id: "construcao",
      nome: "Landing Construção",
      descricao: "Página para construção nova",
      baseUrl: "https://wgalmeida.com.br/construcao",
      parametro: "c",
      cor: "purple",
    },
    {
      id: "marcenaria",
      nome: "Landing Marcenaria",
      descricao: "Página de marcenaria planejada",
      baseUrl: "https://wgalmeida.com.br/marcenaria",
      parametro: "c",
      cor: "amber",
    },
  ];

  // Pessoas disponíveis para vincular ao link
  const [pessoasDisponiveis, setPessoasDisponiveis] = useState<any[]>([]);
  const [loadingPessoas, setLoadingPessoas] = useState(false);

  // Dialog compartilhar
  const [dialogCompartilhar, setDialogCompartilhar] = useState(false);
  const [linkSelecionado, setLinkSelecionado] = useState<CadastroPendente | null>(null);

  // Especificadores para links rápidos
  const [especificadores, setEspecificadores] = useState<any[]>([]);
  const [loadingEspecificadores, setLoadingEspecificadores] = useState(true);

  // Vendedores para links de proposta
  const [vendedores, setVendedores] = useState<any[]>([]);
  const [loadingVendedores, setLoadingVendedores] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    carregarLinks();
    carregarEspecificadores();
    carregarVendedores();
  }, []);

  // Recarregar links quando filtros mudarem
  useEffect(() => {
    carregarLinks();
  }, [filtroTipo, filtroStatus]);

  async function carregarEspecificadores() {
    try {
      setLoadingEspecificadores(true);
      const { data, error } = await supabase
        .from("pessoas")
        .select("id, nome, email, codigo_referencia")
        .eq("tipo", "especificador")
        .eq("ativo", true)
        .order("nome");

      if (error) throw error;
      setEspecificadores(data || []);
    } catch (error) {
      console.error("Erro ao carregar especificadores:", error);
    } finally {
      setLoadingEspecificadores(false);
    }
  }

  async function carregarVendedores() {
    try {
      setLoadingVendedores(true);
      // Buscar todas as pessoas para vincular às campanhas
      const { data, error } = await supabase
        .from("pessoas")
        .select("id, nome, email, codigo_referencia, tipo")
        .order("nome");

      if (error) {
        console.error("Erro na query vendedores:", error);
        throw error;
      }
      // Log dos tipos únicos para debug
      const tiposUnicos = [...new Set((data || []).map(p => p.tipo))];
      console.log("Tipos de pessoa no banco:", tiposUnicos);
      setVendedores(data || []);
    } catch (error) {
      console.error("Erro ao carregar vendedores:", error);
    } finally {
      setLoadingVendedores(false);
    }
  }

  // Carregar pessoas disponíveis baseado no tipo selecionado
  async function carregarPessoasParaVincular(tipo: TipoCadastro) {
    try {
      setLoadingPessoas(true);
      setPessoasDisponiveis([]);
      setNovoLinkPessoaVinculada("");

      const tiposMap: Record<TipoCadastro, string[]> = {
        CLIENTE: ["colaborador", "vendedor", "especificador"],
        COLABORADOR: ["colaborador", "vendedor"],
        FORNECEDOR: ["colaborador", "vendedor"],
        ESPECIFICADOR: ["colaborador", "vendedor", "especificador"],
      };

      const tiposPessoa = tiposMap[tipo];

      const { data, error } = await supabase
        .from("pessoas")
        .select("id, nome, email, tipo, codigo_referencia")
        .in("tipo", tiposPessoa)
        .eq("ativo", true)
        .order("nome");

      if (error) throw error;
      setPessoasDisponiveis(data || []);
    } catch (error) {
      console.error("Erro ao carregar pessoas:", error);
    } finally {
      setLoadingPessoas(false);
    }
  }

  // Carregar pessoas quando o tipo de link mudar
  useEffect(() => {
    if (activeTab === "criar-link") {
      carregarPessoasParaVincular(novoLinkTipo);
    }
  }, [novoLinkTipo, activeTab]);

  // URL base do site institucional
  const SITE_URL = "https://wgalmeida.com.br";

  function getLinkPropostaUrl(codigoRef?: string): string {
    const baseUrl = window.location.origin;
    return codigoRef
      ? `${baseUrl}/solicite-sua-proposta?ref=${codigoRef}`
      : `${baseUrl}/solicite-sua-proposta`;
  }

  function getLinkVendedorUrl(codigoVendedor?: string): string {
    return codigoVendedor
      ? `${SITE_URL}/solicite-sua-proposta?v=${codigoVendedor}`
      : `${SITE_URL}/solicite-sua-proposta`;
  }

  function handleCopiarLinkVendedor(codigoVendedor?: string) {
    const url = getLinkVendedorUrl(codigoVendedor);
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copiado!",
      description: "O link do vendedor foi copiado para a área de transferência",
    });
  }

  function handleCompartilharVendedorWhatsApp(nome: string, codigoVendedor?: string) {
    const url = getLinkVendedorUrl(codigoVendedor);
    const mensagem = `Olá! Solicite sua proposta personalizada com a WG Almeida:\n\n${url}\n\n` +
      `Transformamos histórias em espaços para viver. Arquitetura, Engenharia e Marcenaria em um só lugar.`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
    window.open(whatsappUrl, "_blank");
  }

  function handleCopiarLinkProposta(codigoRef?: string) {
    const url = getLinkPropostaUrl(codigoRef);
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copiado!",
      description: "O link da proposta foi copiado para a área de transferência",
    });
  }

  function handleCompartilharPropostaWhatsApp(nome: string, codigoRef?: string) {
    const url = getLinkPropostaUrl(codigoRef);
    const mensagem = `Olá! Solicite sua proposta personalizada com a WG Almeida:\n\n${url}\n\n` +
      `Nós cuidamos do planejamento, da documentação e da execução — do jeito certo.`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
    window.open(whatsappUrl, "_blank");
  }

  async function carregarLinks() {
    try {
      setLoading(true);
      const params: any = {};

      if (filtroTipo !== "TODOS") {
        params.tipo = filtroTipo;
      }

      if (filtroStatus !== "TODOS") {
        params.status = filtroStatus;
      }

      const data = await listarCadastrosPendentes(params);
      setLinks(data);
    } catch (error) {
      console.error("Erro ao carregar links:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar links",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleCriarLink() {
    if (!usuario) return;

    try {
      setCriando(true);

      const pessoaVinculada = pessoasDisponiveis.find(p => p.id === novoLinkPessoaVinculada);

      const resultado = await criarLinkCadastro({
        tipo: novoLinkTipo,
        nucleoId: usuario.nucleo_id || undefined,
        reutilizavel: novoLinkReutilizavel,
        usoMaximo: novoLinkReutilizavel ? novoLinkUsoMaximo : null,
        expiraDias: novoLinkExpiraDias,
        pessoaVinculadaId: novoLinkPessoaVinculada || undefined,
      });

      const mensagemVinculo = pessoaVinculada
        ? ` Vinculado a: ${pessoaVinculada.nome}`
        : "";

      toast({
        title: "Link criado com sucesso!",
        description: `O link foi gerado e está pronto para ser compartilhado.${mensagemVinculo}`,
      });

      // Abrir dialog de compartilhamento
      setLinkSelecionado({
        ...resultado,
        id: resultado.id,
        token: resultado.token,
        tipo_solicitado: novoLinkTipo,
        status: "aguardando_preenchimento",
        expira_em: resultado.expira_em,
      } as CadastroPendente);

      setDialogCompartilhar(true);

      // Resetar campos
      setNovoLinkPessoaVinculada("");
      setNovoLinkReutilizavel(false);
      setNovoLinkUsoMaximo(null);

      // Recarregar lista
      carregarLinks();
    } catch (error: any) {
      console.error("Erro ao criar link:", error);
      toast({
        title: "Erro ao criar link",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setCriando(false);
    }
  }

  function getLinkUrl(token: string): string {
    const baseUrl = getBaseUrl();
    return `${baseUrl}/cadastro/${token}`;
  }

  function handleCopiarLink(token: string) {
    const url = getLinkUrl(token);
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copiado!",
      description: "O link foi copiado para a área de transferência",
    });
  }

  function handleCompartilharWhatsApp(link: CadastroPendente) {
    const url = getLinkUrl(link.token);
    const mensagem = gerarMensagemWhatsApp(url, link.tipo_solicitado);
    const whatsappUrl = gerarUrlWhatsApp(mensagem);
    window.open(whatsappUrl, "_blank");
  }

  function handleCompartilharEmail(link: CadastroPendente) {
    const url = getLinkUrl(link.token);
    const mailtoUrl = gerarLinkEmail(url, link.tipo_solicitado);
    window.location.href = mailtoUrl;
  }

  function handleAbrirCompartilhar(link: CadastroPendente) {
    setLinkSelecionado(link);
    setDialogCompartilhar(true);
  }

  async function handleDesativarLink(id: string) {
    if (!confirm("Deseja realmente desativar este link?")) return;

    try {
      const { error } = await supabase
        .from("cadastros_pendentes")
        .update({
          status: "rejeitado",
          motivo_rejeicao: "Link desativado pelo administrador"
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Link desativado",
        description: "O link foi desativado com sucesso",
      });

      carregarLinks();
    } catch (error) {
      console.error("Erro ao desativar link:", error);
      toast({
        title: "Erro",
        description: "Erro ao desativar link",
        variant: "destructive",
      });
    }
  }

  function isLinkExpirado(expiraEm: string): boolean {
    return isAfter(new Date(), new Date(expiraEm));
  }

  const linksFiltrados = links.filter((link) => {
    if (!search) return true;
    const termo = search.toLowerCase();
    return (
      link.nome?.toLowerCase().includes(termo) ||
      link.email?.toLowerCase().includes(termo) ||
      link.token.toLowerCase().includes(termo)
    );
  });

  // Estatísticas
  const stats = {
    total: links.length,
    aguardando: links.filter((l) => l.status === "aguardando_preenchimento").length,
    pendentes: links.filter((l) => l.status === "pendente_aprovacao").length,
    aprovados: links.filter((l) => l.status === "aprovado").length,
    expirados: links.filter((l) => isLinkExpirado(l.expira_em) && l.status === "aguardando_preenchimento").length,
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-oswald font-bold text-gray-900 flex items-center gap-3">
            <Link2 className="w-8 h-8 text-orange-600" />
            Central de Links
          </h1>
          <p className="text-gray-600 font-poppins mt-1">
            Gerencie links de cadastro para clientes, colaboradores e parceiros
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[500px]">
          <TabsTrigger value="links-rapidos" className="gap-2">
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">Links Rápidos</span>
            <span className="sm:hidden">Rápidos</span>
          </TabsTrigger>
          <TabsTrigger value="gerenciar" className="gap-2">
            <ListFilter className="w-4 h-4" />
            <span className="hidden sm:inline">Gerenciar</span>
            <span className="sm:hidden">Lista</span>
          </TabsTrigger>
          <TabsTrigger value="criar-link" className="gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Criar Link</span>
            <span className="sm:hidden">Criar</span>
          </TabsTrigger>
        </TabsList>

        {/* ======================= ABA: LINKS RÁPIDOS ======================= */}
        <TabsContent value="links-rapidos" className="space-y-6 mt-6">
          {/* Links Rápidos - Sistema WG Easy */}
          <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-100">
                    <Zap className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Especificadores - WG Easy</CardTitle>
                    <CardDescription>
                      Links com rastreamento de comissão para especificadores
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open("/solicite-sua-proposta", "_blank")}
                  className="gap-2 border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                  <ExternalLink className="w-4 h-4" />
                  Abrir Página
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Link Geral */}
              <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900">Link Geral (sem rastreamento)</p>
                      <p className="text-sm text-gray-500 font-mono break-all">{getLinkPropostaUrl()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleCopiarLinkProposta()}>
                      <Copy className="w-4 h-4 mr-1" /> Copiar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCompartilharPropostaWhatsApp("", undefined)}
                      className="text-green-700 border-green-300 hover:bg-green-50"
                    >
                      <Send className="w-4 h-4 mr-1" /> WhatsApp
                    </Button>
                  </div>
                </div>
              </div>

              {/* Links por Especificador */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Links por Especificador ({especificadores.length})
                </h4>
                {loadingEspecificadores ? (
                  <div className="text-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-orange-600 mx-auto" />
                  </div>
                ) : especificadores.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    Nenhum especificador cadastrado
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2">
                    {especificadores.map((esp) => (
                      <div
                        key={esp.id}
                        className="p-3 bg-white rounded-lg border border-gray-200 hover:border-orange-300 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 truncate">{esp.nome}</p>
                            <p className="text-xs text-gray-500">
                              <span className="font-mono text-orange-600">{esp.codigo_referencia || "Sem código"}</span>
                            </p>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleCopiarLinkProposta(esp.codigo_referencia)}
                              title="Copiar link"
                              disabled={!esp.codigo_referencia}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => handleCompartilharPropostaWhatsApp(esp.nome, esp.codigo_referencia)}
                              title="Compartilhar WhatsApp"
                              disabled={!esp.codigo_referencia}
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => window.open(getLinkPropostaUrl(esp.codigo_referencia), "_blank")}
                              title="Abrir link"
                              disabled={!esp.codigo_referencia}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Links de Vendedores - Site Institucional */}
          <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Globe className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Vendedores - Site Institucional</CardTitle>
                    <CardDescription>
                      Links para vendedores compartilharem (wgalmeida.com.br)
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`${SITE_URL}/solicite-sua-proposta`, "_blank")}
                  className="gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  <ExternalLink className="w-4 h-4" />
                  Abrir Página
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Link Geral */}
              <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900">Link Geral (sem rastreamento)</p>
                      <p className="text-sm text-gray-500 font-mono">{getLinkVendedorUrl()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleCopiarLinkVendedor()}>
                      <Copy className="w-4 h-4 mr-1" /> Copiar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCompartilharVendedorWhatsApp("", undefined)}
                      className="text-green-700 border-green-300 hover:bg-green-50"
                    >
                      <Send className="w-4 h-4 mr-1" /> WhatsApp
                    </Button>
                  </div>
                </div>
              </div>

              {/* Links por Vendedor */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Links por Vendedor/Colaborador ({vendedores.length})
                </h4>
                {loadingVendedores ? (
                  <div className="text-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600 mx-auto" />
                  </div>
                ) : vendedores.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    Nenhum vendedor/colaborador cadastrado
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2">
                    {vendedores.map((vend) => (
                      <div
                        key={vend.id}
                        className="p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 truncate">{vend.nome}</p>
                            <p className="text-xs text-gray-500">
                              <span className="font-mono text-blue-600">{vend.codigo_referencia || "Sem código"}</span>
                            </p>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleCopiarLinkVendedor(vend.codigo_referencia)}
                              title="Copiar link"
                              disabled={!vend.codigo_referencia}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => handleCompartilharVendedorWhatsApp(vend.nome, vend.codigo_referencia)}
                              title="Compartilhar WhatsApp"
                              disabled={!vend.codigo_referencia}
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => window.open(getLinkVendedorUrl(vend.codigo_referencia), "_blank")}
                              title="Abrir link"
                              disabled={!vend.codigo_referencia}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ======================= ABA: GERENCIAR LINKS ======================= */}
        <TabsContent value="gerenciar" className="space-y-6 mt-6">
          {/* Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Link2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-xs text-gray-500">Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-yellow-100">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">{stats.aguardando}</p>
                    <p className="text-xs text-gray-500">Aguardando</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-100">
                    <Users className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-600">{stats.pendentes}</p>
                    <p className="text-xs text-gray-500">Pendentes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{stats.aprovados}</p>
                    <p className="text-xs text-gray-500">Aprovados</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-100">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">{stats.expirados}</p>
                    <p className="text-xs text-gray-500">Expirados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nome, email ou token..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={filtroTipo} onValueChange={(v) => setFiltroTipo(v as TipoCadastro | "TODOS")}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODOS">Todos os tipos</SelectItem>
                    <SelectItem value="CLIENTE">Cliente</SelectItem>
                    <SelectItem value="COLABORADOR">Colaborador</SelectItem>
                    <SelectItem value="ESPECIFICADOR">Especificador</SelectItem>
                    <SelectItem value="FORNECEDOR">Fornecedor</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODOS">Todos os status</SelectItem>
                    <SelectItem value="aguardando_preenchimento">Aguardando</SelectItem>
                    <SelectItem value="pendente_aprovacao">Pendente Aprovação</SelectItem>
                    <SelectItem value="aprovado">Aprovado</SelectItem>
                    <SelectItem value="rejeitado">Rejeitado</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" onClick={carregarLinks} className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Atualizar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tabela */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-600 mx-auto" />
                  <p className="text-gray-600 mt-4">Carregando links...</p>
                </div>
              ) : linksFiltrados.length === 0 ? (
                <div className="text-center py-12">
                  <Link2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhum link encontrado</p>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("criar-link")}
                    className="mt-4"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Criar primeiro link
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Link / Pessoa</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Criado em</TableHead>
                        <TableHead>Expira em</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {linksFiltrados.map((link) => {
                        const expirado = isLinkExpirado(link.expira_em);

                        return (
                          <TableRow key={link.id}>
                            <TableCell>
                              <div>
                                {link.nome ? (
                                  <>
                                    <div className="font-medium">{link.nome}</div>
                                    <div className="text-sm text-gray-500">{link.email}</div>
                                  </>
                                ) : (
                                  <>
                                    <div className="font-mono text-sm text-gray-600">
                                      {link.token.substring(0, 8)}...
                                    </div>
                                    <div className="text-xs text-gray-400">
                                      Aguardando preenchimento
                                    </div>
                                  </>
                                )}
                                {link.reutilizavel && (
                                  <Badge variant="outline" className="mt-1 text-xs">
                                    Reutilizável ({link.total_usos || 0}
                                    {link.uso_maximo ? `/${link.uso_maximo}` : ""} usos)
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={`bg-${
                                  link.tipo_solicitado === "CLIENTE"
                                    ? "blue"
                                    : link.tipo_solicitado === "COLABORADOR"
                                    ? "green"
                                    : link.tipo_solicitado === "ESPECIFICADOR"
                                    ? "purple"
                                    : "amber"
                                }-50 text-${
                                  link.tipo_solicitado === "CLIENTE"
                                    ? "blue"
                                    : link.tipo_solicitado === "COLABORADOR"
                                    ? "green"
                                    : link.tipo_solicitado === "ESPECIFICADOR"
                                    ? "purple"
                                    : "amber"
                                }-700`}
                              >
                                {getLabelTipoCadastro(link.tipo_solicitado)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={`bg-${getCorStatusCadastro(link.status)}-50 text-${getCorStatusCadastro(link.status)}-700`}
                              >
                                {getLabelStatusCadastro(link.status)}
                              </Badge>
                              {expirado && link.status === "aguardando_preenchimento" && (
                                <Badge className="ml-2 bg-red-50 text-red-700">
                                  Expirado
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {format(new Date(link.criado_em), "dd/MM/yyyy HH:mm")}
                            </TableCell>
                            <TableCell className="text-sm">
                              {expirado ? (
                                <span className="text-red-600">
                                  {formatDistanceToNow(new Date(link.expira_em), {
                                    addSuffix: true,
                                    locale: ptBR,
                                  })}
                                </span>
                              ) : (
                                <span className="text-gray-600">
                                  {formatDistanceToNow(new Date(link.expira_em), {
                                    addSuffix: true,
                                    locale: ptBR,
                                  })}
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleCopiarLink(link.token)}>
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copiar Link
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleAbrirCompartilhar(link)}>
                                    <Send className="w-4 h-4 mr-2" />
                                    Compartilhar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => window.open(getLinkUrl(link.token), "_blank")}
                                  >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Abrir Link
                                  </DropdownMenuItem>

                                  {link.status === "aguardando_preenchimento" && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => handleDesativarLink(link.id)}
                                        className="text-red-600"
                                      >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Desativar Link
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ======================= ABA: CRIAR LINK ======================= */}
        <TabsContent value="criar-link" className="mt-6">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-100">
                  <Plus className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <CardTitle>Criar Novo Link</CardTitle>
                  <CardDescription>
                    Gere um link de campanha rastreável ou cadastro personalizado
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tipo de Link */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">Tipo de Link</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={tipoLink === "campanha" ? "default" : "outline"}
                    onClick={() => setTipoLink("campanha")}
                    className={`h-auto py-4 flex flex-col gap-2 ${
                      tipoLink === "campanha"
                        ? "bg-orange-600 hover:bg-orange-700"
                        : ""
                    }`}
                  >
                    <Zap className="w-6 h-6" />
                    <span className="font-semibold">Link de Campanha</span>
                    <span className="text-xs opacity-80">Rastreável para marketing</span>
                  </Button>
                  <Button
                    type="button"
                    variant={tipoLink === "cadastro" ? "default" : "outline"}
                    onClick={() => setTipoLink("cadastro")}
                    className={`h-auto py-4 flex flex-col gap-2 ${
                      tipoLink === "cadastro"
                        ? "bg-blue-600 hover:bg-blue-700"
                        : ""
                    }`}
                  >
                    <UserPlus className="w-6 h-6" />
                    <span className="font-semibold">Link de Cadastro</span>
                    <span className="text-xs opacity-80">Para cadastrar pessoas no sistema</span>
                  </Button>
                </div>
              </div>

              {/* ===== FORMULÁRIO LINK DE CAMPANHA ===== */}
              {tipoLink === "campanha" && (
                <>
                  {/* Nome da Campanha */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-base font-semibold">
                      <Zap className="w-4 h-4 text-orange-600" />
                      Nome da Campanha *
                    </Label>
                    <Input
                      placeholder="Ex: morumbihomeresort, blackfriday2025, reforma-janeiro"
                      value={nomeCampanha}
                      onChange={(e) => setNomeCampanha(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                      className="font-mono text-lg"
                    />
                    <p className="text-xs text-gray-500">
                      Apenas letras minúsculas, números e hífen. Este código será usado para rastrear os cadastros vindos desta campanha.
                    </p>
                  </div>

                  {/* Página de Destino */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-base font-semibold">
                      <Globe className="w-4 h-4 text-orange-600" />
                      Página de Destino
                    </Label>
                    <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto pr-1">
                      {paginasDestino.map((pagina) => {
                        const isSelected = paginaDestino === pagina.id;
                        const colorClasses: Record<string, { border: string; bg: string; text: string; icon: string }> = {
                          orange: { border: "border-orange-500", bg: "bg-orange-50", text: "text-orange-700", icon: "text-orange-600" },
                          blue: { border: "border-blue-500", bg: "bg-blue-50", text: "text-blue-700", icon: "text-blue-600" },
                          green: { border: "border-green-500", bg: "bg-green-50", text: "text-green-700", icon: "text-green-600" },
                          purple: { border: "border-purple-500", bg: "bg-purple-50", text: "text-purple-700", icon: "text-purple-600" },
                          amber: { border: "border-amber-500", bg: "bg-amber-50", text: "text-amber-700", icon: "text-amber-600" },
                        };
                        const colors = colorClasses[pagina.cor] || colorClasses.orange;
                        return (
                          <div
                            key={pagina.id}
                            onClick={() => setPaginaDestino(pagina.id)}
                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              isSelected
                                ? `${colors.border} ${colors.bg}`
                                : "border-gray-200 hover:border-gray-300 bg-white"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className={`font-medium ${isSelected ? colors.text : "text-gray-900"}`}>
                                  {pagina.nome}
                                </p>
                                <p className="text-xs text-gray-500">{pagina.descricao}</p>
                              </div>
                              {isSelected && (
                                <CheckCircle className={`w-5 h-5 ${colors.icon}`} />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Responsável pela Campanha */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-base font-semibold">
                      <Users className="w-4 h-4 text-orange-600" />
                      Responsável pela Campanha (opcional)
                    </Label>
                    <p className="text-xs text-gray-500">
                      Selecione a pessoa responsável por esta campanha para facilitar o acompanhamento
                    </p>

                    {/* Filtro por tipo - Dinâmico baseado nos tipos existentes */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant={filtroTipoResponsavel === "todos" ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setFiltroTipoResponsavel("todos");
                          setResponsavelCampanha("");
                        }}
                        className={`text-xs ${
                          filtroTipoResponsavel === "todos"
                            ? "bg-orange-600 hover:bg-orange-700"
                            : ""
                        }`}
                      >
                        Todos ({vendedores.length})
                      </Button>
                      {/* Gerar botões dinamicamente dos tipos existentes */}
                      {[...new Set(vendedores.map(v => v.tipo).filter(Boolean))].map((tipo) => {
                        const count = vendedores.filter(v => v.tipo === tipo).length;
                        return (
                          <Button
                            key={tipo}
                            type="button"
                            variant={filtroTipoResponsavel === tipo ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              setFiltroTipoResponsavel(tipo);
                              setResponsavelCampanha("");
                            }}
                            className={`text-xs capitalize ${
                              filtroTipoResponsavel === tipo
                                ? "bg-orange-600 hover:bg-orange-700"
                                : ""
                            }`}
                          >
                            {tipo} ({count})
                          </Button>
                        );
                      })}
                    </div>

                    {loadingVendedores ? (
                      <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Carregando...
                      </div>
                    ) : (() => {
                      const pessoasFiltradas = filtroTipoResponsavel === "todos"
                        ? vendedores
                        : vendedores.filter(v => v.tipo === filtroTipoResponsavel);

                      return pessoasFiltradas.length === 0 ? (
                        <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                          Nenhuma pessoa encontrada com o tipo "{filtroTipoResponsavel}".
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Select
                            value={responsavelCampanha}
                            onValueChange={(value) => setResponsavelCampanha(value)}
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Selecione o responsável (opcional)..." />
                            </SelectTrigger>
                            <SelectContent>
                              {pessoasFiltradas.map((vend) => (
                                <SelectItem key={vend.id} value={vend.id}>
                                  {vend.nome} {vend.email ? `- ${vend.email}` : ""}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {responsavelCampanha && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => setResponsavelCampanha("")}
                              title="Remover responsável"
                            >
                              <XCircle className="w-4 h-4 text-gray-500" />
                            </Button>
                          )}
                        </div>
                      );
                    })()}

                    {/* Contador */}
                    <p className="text-xs text-gray-400">
                      {filtroTipoResponsavel === "todos"
                        ? `${vendedores.length} pessoas disponíveis`
                        : `${vendedores.filter(v => v.tipo === filtroTipoResponsavel).length} ${filtroTipoResponsavel}(s) encontrado(s)`
                      }
                    </p>
                  </div>

                  {/* Preview do Link */}
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-3">
                    <Label className="text-sm font-medium text-orange-700">Preview do Link da Campanha</Label>
                    {(() => {
                      const paginaConfig = paginasDestino.find(p => p.id === paginaDestino);
                      const responsavel = responsavelCampanha
                        ? vendedores.find(v => v.id === responsavelCampanha)
                        : null;
                      const codigoCampanha = nomeCampanha.trim();

                      // Construir URL com parâmetros
                      let url = paginaConfig?.baseUrl || "";
                      const params = new URLSearchParams();
                      if (codigoCampanha) {
                        params.set("c", codigoCampanha); // c = campanha
                      }
                      if (responsavel?.id) {
                        params.set("v", responsavel.id.substring(0, 12)); // v = 12 primeiros chars do ID
                      }
                      if (params.toString()) {
                        url = `${paginaConfig?.baseUrl}?${params.toString()}`;
                      }

                      return (
                        <>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600">
                              <strong>Campanha:</strong>{" "}
                              {codigoCampanha ? (
                                <span className="font-mono text-orange-600 bg-orange-100 px-2 py-0.5 rounded">{codigoCampanha}</span>
                              ) : (
                                <span className="text-gray-400 italic">digite o nome da campanha</span>
                              )}
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Página:</strong> {paginaConfig?.nome}
                            </p>
                            {responsavel && (
                              <p className="text-sm text-gray-600">
                                <strong>Responsável:</strong> {responsavel.nome}
                                <span className="font-mono text-blue-600 bg-blue-100 px-2 py-0.5 rounded ml-2">
                                  {responsavel.id.substring(0, 12)}
                                </span>
                              </p>
                            )}
                          </div>
                          <div className="bg-white p-2 rounded border">
                            <p className="text-xs text-gray-500 font-mono break-all">{url}</p>
                          </div>
                          {!codigoCampanha && (
                            <p className="text-xs text-amber-600">
                              ⚠️ Digite o nome da campanha para gerar o link rastreável
                            </p>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  {/* Botão Gerar Link de Campanha */}
                  <Button
                    onClick={() => {
                      if (!nomeCampanha.trim()) {
                        toast({
                          variant: "destructive",
                          title: "Nome obrigatório",
                          description: "Digite o nome da campanha para gerar o link",
                        });
                        return;
                      }
                      const paginaConfig = paginasDestino.find(p => p.id === paginaDestino);
                      const responsavel = responsavelCampanha
                        ? vendedores.find(v => v.id === responsavelCampanha)
                        : null;

                      // Construir URL com parâmetros
                      const params = new URLSearchParams();
                      params.set("c", nomeCampanha.trim());
                      if (responsavel?.id) {
                        params.set("v", responsavel.id.substring(0, 12));
                      }
                      const url = `${paginaConfig?.baseUrl}?${params.toString()}`;

                      setLinkCampanhaGerado(url);
                      setDialogLinkCampanha(true);
                    }}
                    disabled={!nomeCampanha.trim()}
                    className="w-full bg-orange-600 hover:bg-orange-700 h-12 text-lg disabled:opacity-50"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Gerar Link de Campanha
                  </Button>
                </>
              )}

              {/* ===== FORMULÁRIO LINK DE CADASTRO ===== */}
              {tipoLink === "cadastro" && (
                <>
                  {/* Tipo de Cadastro */}
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Tipo de Cadastro</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { value: "CLIENTE", label: "Cliente", color: "blue" },
                        { value: "COLABORADOR", label: "Colaborador", color: "green" },
                        { value: "ESPECIFICADOR", label: "Especificador", color: "purple" },
                        { value: "FORNECEDOR", label: "Fornecedor", color: "amber" },
                      ].map((tipo) => (
                        <Button
                          key={tipo.value}
                          type="button"
                          variant={novoLinkTipo === tipo.value ? "default" : "outline"}
                          onClick={() => setNovoLinkTipo(tipo.value as TipoCadastro)}
                          className={`h-auto py-3 flex flex-col gap-1 ${
                            novoLinkTipo === tipo.value
                              ? "bg-blue-600 hover:bg-blue-700"
                              : ""
                          }`}
                        >
                          <span>{tipo.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Validade */}
                  <div className="space-y-2">
                    <Label>Validade do Link</Label>
                    <Select
                      value={String(novoLinkExpiraDias)}
                      onValueChange={(v) => setNovoLinkExpiraDias(Number(v))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a validade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 dia</SelectItem>
                        <SelectItem value="3">3 dias</SelectItem>
                        <SelectItem value="7">7 dias</SelectItem>
                        <SelectItem value="15">15 dias</SelectItem>
                        <SelectItem value="30">30 dias</SelectItem>
                        <SelectItem value="90">90 dias</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Pessoa Vinculada */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-blue-600" />
                      Vincular a Pessoa (opcional)
                    </Label>
                    <p className="text-xs text-gray-500">
                      Selecione um vendedor, colaborador ou especificador para rastrear a origem deste link
                    </p>
                    {loadingPessoas ? (
                      <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Carregando pessoas...
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Select
                          value={novoLinkPessoaVinculada || undefined}
                          onValueChange={setNovoLinkPessoaVinculada}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Sem vínculo (opcional)" />
                          </SelectTrigger>
                          <SelectContent>
                            {pessoasDisponiveis.map((pessoa) => (
                              <SelectItem key={pessoa.id} value={pessoa.id}>
                                {pessoa.nome} ({pessoa.tipo})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {novoLinkPessoaVinculada && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setNovoLinkPessoaVinculada("")}
                            title="Remover vínculo"
                          >
                            <XCircle className="w-4 h-4 text-gray-500" />
                          </Button>
                        )}
                      </div>
                    )}
                    {novoLinkPessoaVinculada && (
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-700">
                        O cadastro realizado por este link será vinculado a esta pessoa
                      </div>
                    )}
                  </div>

                  {/* Link Reutilizável */}
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Link Reutilizável</Label>
                        <p className="text-xs text-gray-500">
                          Permite múltiplos cadastros com o mesmo link
                        </p>
                      </div>
                      <Switch
                        checked={novoLinkReutilizavel}
                        onCheckedChange={setNovoLinkReutilizavel}
                      />
                    </div>

                    {novoLinkReutilizavel && (
                      <div className="space-y-2">
                        <Label>Limite de Usos (opcional)</Label>
                        <Input
                          type="number"
                          min="1"
                          placeholder="Sem limite"
                          value={novoLinkUsoMaximo || ""}
                          onChange={(e) =>
                            setNovoLinkUsoMaximo(e.target.value ? Number(e.target.value) : null)
                          }
                        />
                      </div>
                    )}
                  </div>

                  {/* Botão Criar */}
                  <Button
                    onClick={handleCriarLink}
                    disabled={criando}
                    className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg"
                  >
                    {criando ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Criando Link...
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5 mr-2" />
                        Criar Link de Cadastro
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog Compartilhar */}
      <Dialog open={dialogCompartilhar} onOpenChange={setDialogCompartilhar}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-orange-600" />
              Compartilhar Link de Cadastro
            </DialogTitle>
            <DialogDescription>
              {linkSelecionado && (
                <span>
                  Cadastro de <strong>{getLabelTipoCadastro(linkSelecionado.tipo_solicitado)}</strong>
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {linkSelecionado && (
            <div className="space-y-4 py-4">
              {/* Link para copiar */}
              <div className="bg-gray-50 rounded-lg p-3">
                <Label className="text-xs text-gray-500 uppercase mb-2 block">Link (URL de Producao)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={getLinkUrl(linkSelecionado.token).replace(/http:\/\/localhost:\d+/, PRODUCTION_URL)}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const urlProd = getLinkUrl(linkSelecionado.token).replace(/http:\/\/localhost:\d+/, PRODUCTION_URL);
                      navigator.clipboard.writeText(urlProd);
                      toast({ title: "Link copiado!", description: "URL de producao copiada" });
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Preview da mensagem WhatsApp */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <Label className="text-xs text-green-700 uppercase mb-2 block flex items-center gap-1">
                  <Send className="w-3 h-3" />
                  Preview Mensagem WhatsApp
                </Label>
                <div className="bg-white rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap border border-green-100">
                  {gerarMensagemWhatsApp(getLinkUrl(linkSelecionado.token), linkSelecionado.tipo_solicitado)}
                </div>
              </div>

              {/* Botões de compartilhamento */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => handleCompartilharWhatsApp(linkSelecionado)}
                  className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                >
                  <Send className="w-4 h-4" />
                  Enviar WhatsApp
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleCompartilharEmail(linkSelecionado)}
                  className="gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  <Mail className="w-4 h-4" />
                  Enviar E-mail
                </Button>
              </div>

              {/* Copiar mensagem */}
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-gray-500"
                onClick={() => {
                  const msg = gerarMensagemWhatsApp(getLinkUrl(linkSelecionado.token), linkSelecionado.tipo_solicitado);
                  navigator.clipboard.writeText(msg);
                  toast({ title: "Mensagem copiada!", description: "Cole no WhatsApp ou onde preferir" });
                }}
              >
                <Copy className="w-3 h-3 mr-2" />
                Copiar mensagem completa
              </Button>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogCompartilhar(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Link de Campanha Gerado */}
      <Dialog open={dialogLinkCampanha} onOpenChange={setDialogLinkCampanha}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-600" />
              Link de Campanha Gerado
            </DialogTitle>
            <DialogDescription>
              Compartilhe este link para rastrear os cadastros vindos desta campanha
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Info da Campanha */}
            <div className="bg-orange-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-orange-600">
                  {nomeCampanha}
                </Badge>
                {responsavelCampanha && (() => {
                  const resp = vendedores.find(v => v.id === responsavelCampanha);
                  return resp ? (
                    <span className="text-sm text-gray-600">• Responsável: {resp.nome}</span>
                  ) : null;
                })()}
              </div>
              <p className="text-xs text-gray-500">
                Os cadastros vindos deste link terão o código <strong className="font-mono">{nomeCampanha}</strong> para rastreamento
              </p>
            </div>

            {/* Link */}
            <div className="bg-gray-50 rounded-lg p-4">
              <Label className="text-xs text-gray-500 uppercase">Link da Campanha</Label>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  value={linkCampanhaGerado}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(linkCampanhaGerado);
                    toast({
                      title: "Link copiado!",
                      description: "O link da campanha foi copiado para a área de transferência",
                    });
                  }}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  const resp = responsavelCampanha ? vendedores.find(v => v.id === responsavelCampanha) : null;
                  const codigoResp = resp ? resp.id.substring(0, 12) : "";
                  const tipoFormatado = resp?.tipo ? resp.tipo.toUpperCase() : "PARCEIRO";

                  let mensagem = "Ola! Solicite sua proposta personalizada com a WG Almeida:\n\n" + linkCampanhaGerado + "\n\n*Nao encaminhe esta mensagem, copie o link acima e envie para seus contatos.*\n\n";

                  if (resp) {
                    mensagem += "Este link foi personalizado para sua conta como " + tipoFormatado + " no Grupo WG Almeida.\n\n";
                    mensagem += ">> *?c=" + nomeCampanha + "* - Identifica a campanha que criamos\n";
                    mensagem += ">> *&v=" + codigoResp + "* - Seu codigo personalizado\n\n";
                    mensagem += "Quando alguem preencher por este link, saberemos que e resultado do seu tempo e trabalho - e valorizamos muito isso!\n\n";
                    mensagem += "O cadastro e realizado automaticamente e criada uma oportunidade ja vinculada a voce.\n\n";
                    mensagem += "Bons negocios e Sucesso!\n\n";
                  }

                  mensagem += "_Transformamos historias em espacos para viver._";

                  const whatsappUrl = "https://wa.me/?text=" + encodeURIComponent(mensagem);
                  window.open(whatsappUrl, "_blank");
                }}
                className="gap-2 border-green-300 text-green-700 hover:bg-green-50"
              >
                <Send className="w-4 h-4" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(linkCampanhaGerado, "_blank")}
                className="gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Abrir Link
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setDialogLinkCampanha(false);
              // Limpar campos após fechar
              setNomeCampanha("");
              setResponsavelCampanha("");
            }}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
