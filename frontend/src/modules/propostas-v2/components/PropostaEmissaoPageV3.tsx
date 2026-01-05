// ============================================================
// PropostaEmissaoPageV3 - Nova estrutura simplificada
// Sistema WG Easy - Grupo WG Almeida
// Layout: Cliente compacto > Ambientes cards > Itens por nucleo
// ============================================================

import { useState, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Loader2,
  User,
  Search,
  Home,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  FileText,
  Package,
  DollarSign,
  Building2,
  Hammer,
  Paintbrush,
  ShoppingBag,
  Settings,
  Layers,
  CheckCircle,
  AlertCircle,
  Link2,
  LinkIcon,
  AlertTriangle,
  X,
} from "lucide-react";
import { supabaseRaw as supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";

// Hooks
import { useAmbientes } from "../hooks/useAmbientes";
import { usePricelistBusca } from "../hooks/usePricelistBusca";
import { useItensProposta } from "../hooks/useItensProposta";
import { useCondicoesComerciais } from "../hooks/useCondicoesComerciais";

// Componentes
import PricelistBusca from "./PricelistBusca";
import ImportarAnaliseModal from "./ImportarAnaliseModal";

// Types
import type { Cliente, Ambiente, ItemPricelist, ItemProposta, GrupoNucleo, UnidadeItem } from "../types";
import type { NucleoItem } from "@/types/propostas";

// APIs
import { criarProposta, buscarProposta } from "@/lib/propostasApi";
import { listarAnalisesAprovadas, buscarAnalise, listarServicosSelecionados } from "@/lib/analiseProjetoApi";
import { buscarItem } from "@/lib/pricelistApi";
import { formatarMoeda } from "@/lib/utils";

// Cores dos nucleos
const CORES_NUCLEO = {
  arquitetura: { cor: "#5E9B94", label: "Arquitetura", icon: Building2 },
  engenharia: { cor: "#2B4580", label: "Engenharia", icon: Hammer },
  marcenaria: { cor: "#8B5E3C", label: "Marcenaria", icon: Paintbrush },
  produtos: { cor: "#F25C26", label: "Produtos", icon: ShoppingBag },
  sem_nucleo: { cor: "#6B7280", label: "Outros", icon: Package },
};

interface AnaliseDisponivel {
  id: string;
  titulo: string;
  numero?: string;
  status: string;
  criado_em: string;
  tipo_projeto?: string;
  area_total?: number;
}

export default function PropostaEmissaoPageV3() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  // Parametros da URL
  const oportunidadeId = searchParams.get("oportunidade_id");
  const clienteIdParam = searchParams.get("cliente_id");

  // Estado do cliente
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [buscaCliente, setBuscaCliente] = useState("");
  const [clientesEncontrados, setClientesEncontrados] = useState<Cliente[]>([]);
  const [buscandoCliente, setBuscandoCliente] = useState(false);

  // Estado da analise
  const [analisesDisponiveis, setAnalisesDisponiveis] = useState<AnaliseDisponivel[]>([]);
  const [analiseSelecionada, setAnaliseSelecionada] = useState<string | null>(null);
  const [carregandoAnalises, setCarregandoAnalises] = useState(false);

  // Estado de salvamento
  const [salvando, setSalvando] = useState(false);
  const [propostaId, setPropostaId] = useState<string | null>(id || null);
  const [loading, setLoading] = useState(!!id);

  // Ambientes expandidos
  const [ambientesExpandidos, setAmbientesExpandidos] = useState<Set<string>>(new Set());

  // Modal importar analise (para escopo IA)
  const [modalImportarAnalise, setModalImportarAnalise] = useState(false);

  // Hooks customizados
  const {
    ambientes,
    totais: totaisAmbientes,
    adicionar: adicionarAmbiente,
    atualizar: atualizarAmbiente,
    remover: removerAmbiente,
    importar: importarAmbientes,
    setAmbientes,
  } = useAmbientes();

  const {
    itens: itensPricelist,
    itensFiltrados,
    loading: loadingPricelist,
    filtros,
    setFiltros,
    buscar,
  } = usePricelistBusca();

  const {
    itens: itensProposta,
    totais,
    gruposPorNucleo,
    adicionar: adicionarItem,
    adicionarMultiplos,
    remover: removerItem,
    atualizarQuantidade,
    setItens: setItensProposta,
  } = useItensProposta();

  const {
    condicoes,
    atualizarCampo,
    setCondicoes,
  } = useCondicoesComerciais(totais.total);

  // Buscar clientes
  const buscarClientes = useCallback(async (termo: string) => {
    if (!termo || termo.length < 2) {
      setClientesEncontrados([]);
      return;
    }

    try {
      setBuscandoCliente(true);
      const { data, error } = await supabase
        .from("pessoas")
        .select("id, nome, cpf, email, telefone")
        .eq("tipo", "CLIENTE")
        .ilike("nome", `%${termo}%`)
        .limit(10);

      if (!error) {
        setClientesEncontrados((data || []) as Cliente[]);
      }
    } finally {
      setBuscandoCliente(false);
    }
  }, []);

  // Debounce da busca
  useEffect(() => {
    const timer = setTimeout(() => buscarClientes(buscaCliente), 300);
    return () => clearTimeout(timer);
  }, [buscaCliente, buscarClientes]);

  // Carregar analises quando cliente muda
  useEffect(() => {
    if (clienteSelecionado) {
      carregarAnalisesDoCliente(clienteSelecionado.id);
    } else {
      setAnalisesDisponiveis([]);
      setAnaliseSelecionada(null);
    }
  }, [clienteSelecionado]);

  async function carregarAnalisesDoCliente(clienteId: string) {
    try {
      setCarregandoAnalises(true);
      const analises = await listarAnalisesAprovadas(clienteId);
      setAnalisesDisponiveis(analises.map(a => ({
        id: a.id,
        titulo: a.titulo,
        numero: a.numero ?? undefined,
        status: a.status,
        criado_em: a.criado_em,
        tipo_projeto: a.tipo_projeto,
        area_total: a.area_total ?? undefined,
      })));
    } catch (err) {
      console.error("Erro ao carregar analises:", err);
    } finally {
      setCarregandoAnalises(false);
    }
  }

  // Importar analise selecionada
  async function handleSelecionarAnalise(analiseId: string) {
    if (!analiseId) {
      setAnaliseSelecionada(null);
      return;
    }

    try {
      setAnaliseSelecionada(analiseId);
      const analise = await buscarAnalise(analiseId);

      // Importar ambientes da analise
      let ambientesFormatados: Ambiente[] = [];
      if (analise.ambientes && analise.ambientes.length > 0) {
        ambientesFormatados = analise.ambientes.map((amb: any) => ({
          id: amb.id || `amb-${Date.now()}-${Math.random()}`,
          nome: amb.nome,
          largura: amb.largura || 0,
          comprimento: amb.comprimento || 0,
          pe_direito: amb.pe_direito || 2.7,
          area_piso: amb.area_piso || (amb.largura * amb.comprimento) || 0,
          area_parede: amb.area_parede || 0,
          area_paredes_bruta: amb.area_paredes_bruta || amb.area_parede || 0,
          area_paredes_liquida: amb.area_paredes_liquida || amb.area_parede || 0,
          area_teto: amb.area_teto || 0,
          perimetro: amb.perimetro || 0,
          portas: amb.portas || [],
          janelas: amb.janelas || [],
          vaos: amb.vaos || [],
          area_vaos_total: amb.area_vaos_total || 0,
        }));
        setAmbientes(ambientesFormatados);
        // Iniciar com todos recolhidos (Set vazio)
        setAmbientesExpandidos(new Set());
      }

      // Importar servicos/itens da analise
      let itensImportados = 0;
      try {
        const servicos = await listarServicosSelecionados(analiseId);

        if (servicos && servicos.length > 0) {
          const itensParaAdicionar: ItemProposta[] = [];

          for (const srv of servicos) {
            // Se tem pricelist vinculado, buscar item
            if (srv.pricelist_item_id) {
              try {
                const itemPricelist = await buscarItem(srv.pricelist_item_id);
                if (itemPricelist) {
                  // Extract category name from PricelistCategoria object if present
                  const categoriaStr = typeof itemPricelist.categoria === 'object' && itemPricelist.categoria
                    ? itemPricelist.categoria.nome
                    : (itemPricelist.categoria as string | undefined);
                  // Extract nucleo name from PricelistNucleo object if present
                  const nucleoStr = typeof itemPricelist.nucleo === 'object' && itemPricelist.nucleo
                    ? itemPricelist.nucleo.nome
                    : itemPricelist.nucleo;
                  // Map nucleo string to NucleoItem type
                  const nucleoItem = nucleoStr && ['arquitetura', 'engenharia', 'marcenaria', 'produtos'].includes(nucleoStr.toLowerCase())
                    ? nucleoStr.toLowerCase() as NucleoItem
                    : undefined;
                  itensParaAdicionar.push({
                    id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
                    item: {
                      id: itemPricelist.id,
                      codigo: itemPricelist.codigo ?? undefined,
                      nome: itemPricelist.nome,
                      descricao: itemPricelist.descricao ?? undefined,
                      categoria: categoriaStr,
                      tipo: itemPricelist.tipo || "material",
                      unidade: (itemPricelist.unidade || "un") as UnidadeItem,
                      preco: itemPricelist.preco || 0,
                      nucleo: nucleoItem,
                    },
                    ambiente_id: srv.ambiente_id || undefined,
                    quantidade: srv.quantidade || 1,
                    valor_unitario: itemPricelist.preco || 0,
                    descricao_customizada: srv.descricao,
                  });
                }
              } catch (e) {
                console.warn("Item pricelist nao encontrado:", srv.pricelist_item_id);
              }
            } else {
              // Item sem vinculo - criar como item avulso
              // Inferir núcleo da categoria (ServicoAnalise doesn't have nucleo property)
              let nucleoFinal: NucleoItem = "engenharia";

              // Inferir núcleo da categoria
              const nucleoMap: Record<string, NucleoItem> = {
                // ARQUITETURA
                "arquitetura": "arquitetura",
                "projeto": "arquitetura",
                "design": "arquitetura",
                // MARCENARIA
                "marcenaria": "marcenaria",
                "moveis": "marcenaria",
                "armarios": "marcenaria",
                "mobiliario": "marcenaria",
                // PRODUTOS
                "loucas_metais": "produtos",
                "loucas": "produtos",
                "metais": "produtos",
                "pedras": "produtos",
                "marmoraria": "produtos",
                "vidracaria": "produtos",
                "serralheria": "produtos",
                // ENGENHARIA (default)
                "demolicao": "engenharia",
                "construcao": "engenharia",
                "instalacoes_eletricas": "engenharia",
                "instalacoes_hidraulicas": "engenharia",
                "revestimentos": "engenharia",
                "pintura": "engenharia",
                "forros": "engenharia",
                "esquadrias": "engenharia",
                "impermeabilizacao": "engenharia",
                "gerais": "engenharia",
                "outros": "engenharia",
              };
              const categoriaLower = (srv.categoria || "").toLowerCase();
              nucleoFinal = nucleoMap[categoriaLower] || "engenharia";

              itensParaAdicionar.push({
                id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
                item: {
                  id: `avulso-${srv.id}`,
                  nome: srv.descricao || "Item da análise",
                  descricao: srv.descricao,
                  categoria: srv.categoria || "geral",
                  tipo: srv.tipo === "material" ? "material" : "mao_obra",
                  unidade: (srv.unidade || "un") as UnidadeItem,
                  preco: 0,
                  nucleo: nucleoFinal,
                },
                ambiente_id: srv.ambiente_id || undefined,
                quantidade: srv.quantidade || 1,
                valor_unitario: 0,
                descricao_customizada: srv.descricao,
              });
            }
          }

          if (itensParaAdicionar.length > 0) {
            adicionarMultiplos(itensParaAdicionar);
            itensImportados = itensParaAdicionar.length;
          }
        }
      } catch (errServicos) {
        console.error("Erro ao importar servicos:", errServicos);
      }

      toast({
        title: "Analise importada",
        description: `${ambientesFormatados.length} ambientes e ${itensImportados} itens carregados`,
      });
    } catch (err) {
      console.error("Erro ao importar analise:", err);
      toast({
        title: "Erro",
        description: "Nao foi possivel carregar a analise",
        variant: "destructive",
      });
    }
  }

  // Handlers
  const handleSelecionarCliente = (cliente: Cliente) => {
    setClienteSelecionado(cliente);
    setBuscaCliente("");
    setClientesEncontrados([]);
    // Limpar dados anteriores
    setAmbientes([]);
    setItensProposta([]);
    setAnaliseSelecionada(null);
  };

  const handleAdicionarItem = useCallback((item: ItemPricelist, ambienteId?: string) => {
    adicionarItem(item, ambienteId || undefined, ambientes);
  }, [adicionarItem, ambientes]);

  // Vincular item avulso a item do pricelist
  const handleVincularItem = useCallback((itemPropostaId: string, itemPricelist: ItemPricelist) => {
    setItensProposta(prev => prev.map(itemProp => {
      if (itemProp.id !== itemPropostaId) return itemProp;

      return {
        ...itemProp,
        item: {
          id: itemPricelist.id,
          codigo: itemPricelist.codigo,
          nome: itemPricelist.nome,
          descricao: itemPricelist.descricao,
          categoria: itemPricelist.categoria,
          tipo: itemPricelist.tipo,
          unidade: itemPricelist.unidade,
          preco: itemPricelist.preco,
          nucleo: itemPricelist.nucleo,
        },
        valor_unitario: itemPricelist.preco,
      };
    }));

    toast({
      title: "Item vinculado",
      description: `Vinculado a "${itemPricelist.nome}"`,
    });
  }, [setItensProposta, toast]);

  const handleImportarAnalise = useCallback((dados: {
    ambientes: Ambiente[];
    itensSugeridos: any[];
    analiseId: string;
  }) => {
    if (dados.ambientes.length > 0) {
      importarAmbientes(dados.ambientes);
    }
    if (dados.itensSugeridos.length > 0) {
      adicionarMultiplos(dados.itensSugeridos);
    }
    setModalImportarAnalise(false);
  }, [importarAmbientes, adicionarMultiplos]);

  const handleSalvarProposta = useCallback(async () => {
    if (!clienteSelecionado) {
      toast({ title: "Atencao", description: "Selecione um cliente primeiro", variant: "destructive" });
      return;
    }

    if (itensProposta.length === 0) {
      toast({ title: "Atencao", description: "Adicione pelo menos um item a proposta", variant: "destructive" });
      return;
    }

    try {
      setSalvando(true);

      const dadosProposta = {
        cliente_id: clienteSelecionado.id,
        oportunidade_id: oportunidadeId || undefined,
        titulo: `Proposta - ${clienteSelecionado.nome}`,
        descricao: `Proposta comercial para ${clienteSelecionado.nome}`,
        forma_pagamento: condicoes.forma_pagamento || "parcelado",
        percentual_entrada: condicoes.percentual_entrada || 30,
        numero_parcelas: condicoes.numero_parcelas || 3,
        validade_dias: condicoes.validade_dias || 30,
        prazo_execucao_dias: 60,
        exibir_valores: true,
      };

      const itensParaSalvar = itensProposta.map((itemProposta, index) => ({
        pricelist_item_id: itemProposta.item.id,
        codigo: itemProposta.item.codigo || "",
        nome: itemProposta.item.nome,
        descricao: itemProposta.item.descricao || "",
        categoria: itemProposta.item.categoria || "",
        tipo: itemProposta.item.tipo || "material",
        unidade: itemProposta.item.unidade || "un",
        quantidade: itemProposta.quantidade,
        valor_unitario: itemProposta.valor_unitario,
        descricao_customizada: itemProposta.descricao_customizada,
        ambiente_id: itemProposta.ambiente_id,
        ordem: index,
        nucleo: itemProposta.item.nucleo || null,
      }));

      const propostaCriada = await criarProposta(dadosProposta, itensParaSalvar);

      toast({
        title: "Sucesso!",
        description: `Proposta ${propostaCriada.numero || propostaCriada.id} criada`,
      });

      navigate("/propostas");
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Nao foi possivel salvar",
        variant: "destructive",
      });
    } finally {
      setSalvando(false);
    }
  }, [clienteSelecionado, itensProposta, condicoes, oportunidadeId, navigate, toast]);

  // Toggle ambiente expandido
  const toggleAmbiente = (id: string) => {
    setAmbientesExpandidos(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Calcular totais por nucleo
  const totaisPorNucleo = gruposPorNucleo.reduce((acc, grupo) => {
    acc[grupo.nucleo] = grupo.total;
    return acc;
  }, {} as Record<string, number>);

  // Separar engenharia em mao de obra e materiais
  const itensEngenharia = itensProposta.filter(i => i.item.nucleo === "engenharia");
  const engenhariaMaoObra = itensEngenharia.filter(i => ["mao_obra", "servico"].includes(i.item.tipo));
  const engenhariaMateriais = itensEngenharia.filter(i => ["material", "produto"].includes(i.item.tipo));

  const totalEngenhariaMaoObra = engenhariaMaoObra.reduce((acc, i) => acc + (i.quantidade * i.valor_unitario), 0);
  const totalEngenhariaMateriais = engenhariaMateriais.reduce((acc, i) => acc + (i.quantidade * i.valor_unitario), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#F25C26] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header fixo */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-[1920px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/propostas")} className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="w-9 h-9 bg-gradient-to-br from-[#F25C26] to-[#e04a1a] rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">{id ? "Editar Proposta" : "Nova Proposta"}</h1>
                {clienteSelecionado && <p className="text-xs text-gray-500">{clienteSelecionado.nome}</p>}
              </div>
            </div>
            <button
              onClick={handleSalvarProposta}
              disabled={salvando}
              className="flex items-center gap-2 px-4 py-2 bg-[#F25C26] text-white rounded-lg font-medium hover:bg-[#e04a1a] disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {salvando ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      </div>

      {/* Conteudo */}
      <div className="max-w-[1920px] mx-auto px-4 py-4 space-y-4">

        {/* ========== LINHA 1: CLIENTE + ANALISE (COMPACTA) ========== */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-6">
            {/* Cliente */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-[#F25C26]" />
                <span className="text-sm font-medium text-gray-700">Cliente</span>
              </div>
              {clienteSelecionado ? (
                <div className="flex items-center justify-between p-2 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#F25C26] rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {clienteSelecionado.nome.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{clienteSelecionado.nome}</p>
                      <p className="text-xs text-gray-500">{clienteSelecionado.email || clienteSelecionado.telefone}</p>
                    </div>
                  </div>
                  <button onClick={() => setClienteSelecionado(null)} className="text-xs text-gray-500 hover:text-red-500">
                    Trocar
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar cliente..."
                    value={buscaCliente}
                    onChange={(e) => setBuscaCliente(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F25C26]/20 focus:border-[#F25C26] outline-none"
                  />
                  {clientesEncontrados.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                      {clientesEncontrados.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => handleSelecionarCliente(c)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-orange-50 border-b last:border-b-0"
                        >
                          <p className="font-medium">{c.nome}</p>
                          <p className="text-xs text-gray-500">{c.email || c.cpf}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Separador */}
            <div className="w-px h-16 bg-gray-200" />

            {/* Analise disponivel */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">Analise de Projeto</span>
                {analisesDisponiveis.length > 0 && (
                  <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                    {analisesDisponiveis.length}
                  </span>
                )}
              </div>
              {carregandoAnalises ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Carregando...
                </div>
              ) : analisesDisponiveis.length > 0 ? (
                <select
                  value={analiseSelecionada || ""}
                  onChange={(e) => handleSelecionarAnalise(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                >
                  <option value="">Selecione uma analise...</option>
                  {analisesDisponiveis.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.numero || a.titulo} - {a.tipo_projeto} ({a.area_total ? `${a.area_total}m2` : "s/area"})
                    </option>
                  ))}
                </select>
              ) : clienteSelecionado ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Nenhuma analise disponivel</span>
                  <button
                    onClick={() => setModalImportarAnalise(true)}
                    className="px-3 py-1.5 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Criar com IA
                  </button>
                </div>
              ) : (
                <span className="text-sm text-gray-400">Selecione um cliente primeiro</span>
              )}
            </div>
          </div>
        </div>

        {/* ========== LINHA 2: AMBIENTES CARDS RECOLHIDOS ========== */}
        {ambientes.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-gray-700">Ambientes</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                  {ambientes.length}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded">
                  Piso: <strong>{totaisAmbientes.area_piso.toFixed(1)}m²</strong>
                </span>
                <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded">
                  Parede: <strong>{(totaisAmbientes.area_paredes_liquida || totaisAmbientes.area_parede).toFixed(1)}m²</strong>
                </span>
                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">
                  Teto: <strong>{totaisAmbientes.area_teto.toFixed(1)}m²</strong>
                </span>
                <span className="px-2 py-1 bg-orange-50 text-orange-700 rounded">
                  Perímetro: <strong>{totaisAmbientes.perimetro.toFixed(1)}ml</strong>
                </span>
                {totaisAmbientes.total_portas > 0 && (
                  <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded">
                    Portas: <strong>{totaisAmbientes.total_portas}</strong>
                  </span>
                )}
                {totaisAmbientes.total_janelas > 0 && (
                  <span className="px-2 py-1 bg-cyan-50 text-cyan-700 rounded">
                    Janelas: <strong>{totaisAmbientes.total_janelas}</strong>
                  </span>
                )}
                {totaisAmbientes.area_vaos_total > 0 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded">
                    Vãos: <strong>{totaisAmbientes.area_vaos_total.toFixed(1)}m²</strong>
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1.5">
              {ambientes.map((ambiente) => {
                const expandido = ambientesExpandidos.has(ambiente.id);
                return (
                  <div
                    key={ambiente.id}
                    className={`border rounded transition-all ${expandido ? "border-emerald-300 bg-emerald-50 col-span-2 row-span-2" : "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50"}`}
                  >
                    <button
                      onClick={() => toggleAmbiente(ambiente.id)}
                      className="w-full px-1.5 py-1 flex items-center justify-between text-left gap-1"
                    >
                      <div className="flex items-center gap-1 min-w-0 flex-1">
                        {expandido ? <ChevronUp className="w-2.5 h-2.5 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-2.5 h-2.5 text-gray-400 flex-shrink-0" />}
                        <span className="text-[10px] font-medium text-gray-900 truncate">{ambiente.nome}</span>
                      </div>
                      <span className="text-[9px] text-emerald-600 bg-emerald-100 px-1 py-0.5 rounded flex-shrink-0">
                        {ambiente.area_piso.toFixed(0)}m²
                      </span>
                    </button>
                    {expandido && (
                      <div className="px-1.5 pb-1.5 pt-1 border-t border-emerald-200 space-y-1 text-[9px]">
                        <div className="grid grid-cols-2 gap-1">
                          <div className="bg-white rounded p-0.5 text-center">
                            <span className="text-gray-500 block text-[8px]">L</span>
                            <span className="font-bold">{ambiente.largura.toFixed(1)}m</span>
                          </div>
                          <div className="bg-white rounded p-0.5 text-center">
                            <span className="text-gray-500 block text-[8px]">C</span>
                            <span className="font-bold">{ambiente.comprimento.toFixed(1)}m</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          <div className="bg-emerald-100 rounded p-0.5 text-center">
                            <span className="text-emerald-600 block text-[8px]">Piso</span>
                            <span className="font-bold text-emerald-700">{ambiente.area_piso.toFixed(1)}m²</span>
                          </div>
                          <div className="bg-purple-100 rounded p-0.5 text-center">
                            <span className="text-purple-600 block text-[8px]">Parede</span>
                            <span className="font-bold text-purple-700">{(ambiente.area_paredes_liquida || ambiente.area_parede).toFixed(1)}m²</span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm("Remover ambiente?")) removerAmbiente(ambiente.id);
                          }}
                          className="w-full py-0.5 text-red-500 hover:bg-red-50 rounded flex items-center justify-center gap-0.5 text-[8px]"
                        >
                          <Trash2 className="w-2.5 h-2.5" /> Remover
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========== LINHA 3: CATALOGO (esq) + ITENS PROPOSTA (dir) ========== */}
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4">

          {/* Coluna Esquerda: Busca Pricelist (compacta) */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <PricelistBusca
              itens={itensFiltrados}
              loading={loadingPricelist}
              filtros={filtros}
              ambientes={ambientes}
              sugestoes={[]}
              onBuscar={buscar}
              onFiltrar={setFiltros}
              onAdicionar={handleAdicionarItem}
              onCriarNovo={() => {}}
            />
          </div>

          {/* Coluna Direita: Itens da Proposta por Nucleo */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-3 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#F25C26]" />
                <span className="text-sm font-semibold text-gray-900">Itens da Proposta</span>
                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">
                  {itensProposta.length}
                </span>
              </div>
              <span className="text-sm font-bold text-gray-900">
                Total: {formatarMoeda(totais.total)}
              </span>
            </div>

            <div className="max-h-[calc(100vh-480px)] overflow-y-auto">
              {itensProposta.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">Nenhum item na proposta</p>
                  <p className="text-xs mt-1">Busque e adicione itens do catalogo</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {/* ARQUITETURA */}
                  {gruposPorNucleo.filter(g => g.nucleo === "arquitetura" && g.itens.length > 0).map(grupo => (
                    <GrupoNucleoCard
                      key={grupo.nucleo}
                      grupo={grupo}
                      ambientes={ambientes}
                      itensPricelist={itensPricelist}
                      onAtualizarQuantidade={atualizarQuantidade}
                      onRemover={removerItem}
                      onVincular={handleVincularItem}
                    />
                  ))}

                  {/* ENGENHARIA - Mao de Obra/Servicos */}
                  {engenhariaMaoObra.length > 0 && (
                    <GrupoNucleoCard
                      grupo={{
                        nucleo: "engenharia",
                        label: "Engenharia - Mao de Obra",
                        cor: "#2B4580",
                        itens: engenhariaMaoObra,
                        total: totalEngenhariaMaoObra,
                      }}
                      ambientes={ambientes}
                      itensPricelist={itensPricelist}
                      onAtualizarQuantidade={atualizarQuantidade}
                      onRemover={removerItem}
                      onVincular={handleVincularItem}
                      sublabel="Servicos e mao de obra"
                    />
                  )}

                  {/* ENGENHARIA - Materiais */}
                  {engenhariaMateriais.length > 0 && (
                    <GrupoNucleoCard
                      grupo={{
                        nucleo: "engenharia",
                        label: "Engenharia - Materiais",
                        cor: "#3B5998",
                        itens: engenhariaMateriais,
                        total: totalEngenhariaMateriais,
                      }}
                      ambientes={ambientes}
                      itensPricelist={itensPricelist}
                      onAtualizarQuantidade={atualizarQuantidade}
                      onRemover={removerItem}
                      onVincular={handleVincularItem}
                      sublabel="Materiais e produtos"
                    />
                  )}

                  {/* MARCENARIA */}
                  {gruposPorNucleo.filter(g => g.nucleo === "marcenaria" && g.itens.length > 0).map(grupo => (
                    <GrupoNucleoCard
                      key={grupo.nucleo}
                      grupo={grupo}
                      ambientes={ambientes}
                      itensPricelist={itensPricelist}
                      onAtualizarQuantidade={atualizarQuantidade}
                      onRemover={removerItem}
                      onVincular={handleVincularItem}
                    />
                  ))}

                  {/* PRODUTOS e OUTROS */}
                  {gruposPorNucleo.filter(g => !["arquitetura", "engenharia", "marcenaria"].includes(g.nucleo) && g.itens.length > 0).map(grupo => (
                    <GrupoNucleoCard
                      key={grupo.nucleo}
                      grupo={grupo}
                      ambientes={ambientes}
                      itensPricelist={itensPricelist}
                      onAtualizarQuantidade={atualizarQuantidade}
                      onRemover={removerItem}
                      onVincular={handleVincularItem}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========== LINHA 4: SOMATORIAS POR NUCLEO + CONDICOES ========== */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4">
          {/* Somatorias por nucleo */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-semibold text-gray-900">Resumo por Nucleo</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Arquitetura */}
              <div className="p-3 rounded-lg border-l-4" style={{ borderLeftColor: "#5E9B94", background: "linear-gradient(to right, #5E9B9410, transparent)" }}>
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="w-4 h-4" style={{ color: "#5E9B94" }} />
                  <span className="text-xs font-medium text-gray-600">Arquitetura</span>
                </div>
                <p className="text-lg font-bold" style={{ color: "#5E9B94" }}>
                  {formatarMoeda(totaisPorNucleo.arquitetura || 0)}
                </p>
              </div>

              {/* Engenharia MO */}
              <div className="p-3 rounded-lg border-l-4" style={{ borderLeftColor: "#2B4580", background: "linear-gradient(to right, #2B458010, transparent)" }}>
                <div className="flex items-center gap-2 mb-1">
                  <Hammer className="w-4 h-4" style={{ color: "#2B4580" }} />
                  <span className="text-xs font-medium text-gray-600">Eng. Mao Obra</span>
                </div>
                <p className="text-lg font-bold" style={{ color: "#2B4580" }}>
                  {formatarMoeda(totalEngenhariaMaoObra)}
                </p>
              </div>

              {/* Engenharia Mat */}
              <div className="p-3 rounded-lg border-l-4" style={{ borderLeftColor: "#3B5998", background: "linear-gradient(to right, #3B599810, transparent)" }}>
                <div className="flex items-center gap-2 mb-1">
                  <Package className="w-4 h-4" style={{ color: "#3B5998" }} />
                  <span className="text-xs font-medium text-gray-600">Eng. Materiais</span>
                </div>
                <p className="text-lg font-bold" style={{ color: "#3B5998" }}>
                  {formatarMoeda(totalEngenhariaMateriais)}
                </p>
              </div>

              {/* Marcenaria */}
              <div className="p-3 rounded-lg border-l-4" style={{ borderLeftColor: "#8B5E3C", background: "linear-gradient(to right, #8B5E3C10, transparent)" }}>
                <div className="flex items-center gap-2 mb-1">
                  <Paintbrush className="w-4 h-4" style={{ color: "#8B5E3C" }} />
                  <span className="text-xs font-medium text-gray-600">Marcenaria</span>
                </div>
                <p className="text-lg font-bold" style={{ color: "#8B5E3C" }}>
                  {formatarMoeda(totaisPorNucleo.marcenaria || 0)}
                </p>
              </div>
            </div>

            {/* Total geral */}
            <div className="mt-4 p-4 bg-gradient-to-r from-[#F25C26] to-[#e04a1a] rounded-lg flex items-center justify-between text-white">
              <div>
                <span className="text-sm opacity-80">Total Geral da Proposta</span>
                <p className="text-2xl font-bold">{formatarMoeda(totais.total)}</p>
              </div>
              <div className="text-right text-xs opacity-80">
                <p>Materiais: {formatarMoeda(totais.materiais)}</p>
                <p>Mao de Obra: {formatarMoeda(totais.maoObra)}</p>
              </div>
            </div>
          </div>

          {/* Condicoes comerciais */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-gray-900">Condicoes Comerciais</span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Entrada (%)</label>
                <input
                  type="number"
                  value={condicoes.percentual_entrada}
                  onChange={(e) => atualizarCampo("percentual_entrada", parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg text-center font-medium focus:ring-2 focus:ring-green-200 outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Parcelas</label>
                <input
                  type="number"
                  value={condicoes.numero_parcelas}
                  onChange={(e) => atualizarCampo("numero_parcelas", parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg text-center font-medium focus:ring-2 focus:ring-green-200 outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Validade (dias)</label>
                <input
                  type="number"
                  value={condicoes.validade_dias}
                  onChange={(e) => atualizarCampo("validade_dias", parseInt(e.target.value) || 15)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg text-center font-medium focus:ring-2 focus:ring-green-200 outline-none"
                />
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="text-gray-600">Entrada ({condicoes.percentual_entrada}%)</span>
                <span className="font-medium">{formatarMoeda(totais.total * (condicoes.percentual_entrada / 100))}</span>
              </div>
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="text-gray-600">Restante ({condicoes.numero_parcelas}x)</span>
                <span className="font-medium">
                  {formatarMoeda((totais.total * (1 - condicoes.percentual_entrada / 100)) / condicoes.numero_parcelas)}/parcela
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Importar Analise */}
      {modalImportarAnalise && clienteSelecionado && (
        <ImportarAnaliseModal
          clienteId={clienteSelecionado.id}
          clienteNome={clienteSelecionado.nome}
          itensPricelist={itensPricelist}
          onImportar={handleImportarAnalise}
          onClose={() => setModalImportarAnalise(false)}
        />
      )}
    </div>
  );
}

// ============================================================
// Componente: Card de Grupo por Nucleo
// ============================================================

interface GrupoNucleoCardProps {
  grupo: GrupoNucleo;
  ambientes: Ambiente[];
  itensPricelist: ItemPricelist[];
  onAtualizarQuantidade: (id: string, qtd: number) => void;
  onRemover: (id: string) => void;
  onVincular: (itemPropostaId: string, itemPricelist: ItemPricelist) => void;
  sublabel?: string;
}

function GrupoNucleoCard({ grupo, ambientes, itensPricelist, onAtualizarQuantidade, onRemover, onVincular, sublabel }: GrupoNucleoCardProps) {
  const [aberto, setAberto] = useState(true);
  const [itemVinculando, setItemVinculando] = useState<string | null>(null);
  const [buscaVinculo, setBuscaVinculo] = useState("");

  const getAmbienteNome = (ambienteId?: string) => {
    if (!ambienteId) return null;
    return ambientes.find(a => a.id === ambienteId)?.nome;
  };

  // Verificar se é item avulso (sem vínculo com pricelist)
  const isItemAvulso = (item: ItemProposta) => {
    return !item.item.id || item.item.id.startsWith("avulso-");
  };

  // Filtrar itens do pricelist para vinculação
  const itensFiltradosVinculo = buscaVinculo.length >= 2
    ? itensPricelist.filter(p =>
        p.nome.toLowerCase().includes(buscaVinculo.toLowerCase()) ||
        (p.descricao || "").toLowerCase().includes(buscaVinculo.toLowerCase())
      ).slice(0, 8)
    : [];

  return (
    <div>
      <button
        onClick={() => setAberto(!aberto)}
        className="w-full p-3 flex items-center justify-between hover:bg-gray-50"
        style={{ borderLeftWidth: 4, borderLeftColor: grupo.cor }}
      >
        <div className="flex items-center gap-2">
          {aberto ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronUp className="w-4 h-4 text-gray-400" />}
          <span className="font-semibold text-sm" style={{ color: grupo.cor }}>{grupo.label}</span>
          {sublabel && <span className="text-[10px] text-gray-400">({sublabel})</span>}
          <span className="text-xs text-gray-500">({grupo.itens.length})</span>
        </div>
        <span className="font-bold text-sm text-gray-900">{formatarMoeda(grupo.total)}</span>
      </button>

      {aberto && (
        <div className="px-3 pb-3 space-y-2">
          {grupo.itens.map((item) => {
            const avulso = isItemAvulso(item);
            const vinculando = itemVinculando === item.id;

            return (
              <div key={item.id} className={`p-2 rounded-lg border flex flex-col gap-2 ${avulso ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-gray-200"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      {avulso && (
                        <span className="px-1 py-0.5 bg-amber-200 text-amber-800 text-[9px] font-medium rounded" title="Item sem vínculo com catálogo">
                          AVULSO
                        </span>
                      )}
                      <p className="text-xs font-medium text-gray-900 truncate">{item.item.nome}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-500">
                      {getAmbienteNome(item.ambiente_id) && (
                        <span className="px-1 py-0.5 bg-emerald-100 text-emerald-700 rounded">
                          {getAmbienteNome(item.ambiente_id)}
                        </span>
                      )}
                      <span>{formatarMoeda(item.valor_unitario)}/{item.item.unidade}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {avulso && (
                      <button
                        onClick={() => {
                          setItemVinculando(vinculando ? null : item.id);
                          setBuscaVinculo("");
                        }}
                        className={`p-1 rounded ${vinculando ? "bg-blue-500 text-white" : "text-blue-500 hover:bg-blue-100"}`}
                        title="Vincular ao catálogo"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <input
                      type="number"
                      value={item.quantidade}
                      onChange={(e) => onAtualizarQuantidade(item.id, Math.max(0.01, parseFloat(e.target.value) || 0))}
                      step="0.01"
                      className="w-14 px-1 py-0.5 text-center text-xs border border-gray-200 rounded bg-white"
                    />
                    <span className="text-xs font-bold text-gray-900 w-20 text-right">
                      {formatarMoeda(item.quantidade * item.valor_unitario)}
                    </span>
                    <button onClick={() => onRemover(item.id)} className="p-1 text-gray-400 hover:text-red-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Mini-buscador para vincular */}
                {vinculando && (
                  <div className="p-2 bg-white rounded border border-blue-200 space-y-2">
                    <div className="flex items-center gap-2">
                      <Search className="w-3.5 h-3.5 text-blue-500" />
                      <input
                        type="text"
                        placeholder="Buscar item no catálogo..."
                        value={buscaVinculo}
                        onChange={(e) => setBuscaVinculo(e.target.value)}
                        className="flex-1 text-xs border-0 outline-none bg-transparent"
                        autoFocus
                      />
                      <button onClick={() => setItemVinculando(null)} className="p-0.5 text-gray-400 hover:text-gray-600">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    {itensFiltradosVinculo.length > 0 && (
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {itensFiltradosVinculo.map((pItem) => (
                          <button
                            key={pItem.id}
                            onClick={() => {
                              onVincular(item.id, pItem);
                              setItemVinculando(null);
                              setBuscaVinculo("");
                            }}
                            className="w-full p-1.5 text-left text-xs bg-gray-50 hover:bg-blue-50 rounded flex items-center justify-between"
                          >
                            <span className="truncate">{pItem.nome}</span>
                            <span className="text-[10px] text-gray-500 flex-shrink-0 ml-2">
                              {formatarMoeda(pItem.preco)}/{pItem.unidade}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                    {buscaVinculo.length >= 2 && itensFiltradosVinculo.length === 0 && (
                      <p className="text-[10px] text-gray-500 text-center py-2">
                        Nenhum item encontrado
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
