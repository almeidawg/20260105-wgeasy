// ============================================================
// PÁGINA: Formulário de Item de Pricelist (Criar/Editar)
// Sistema WG Easy - Grupo WG Almeida
// ============================================================

import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  criarItem,
  buscarItem,
  atualizarItem,
  listarCategorias,
  listarSubcategoriasPorCategoria,
  gerarCodigoItem,
  type PricelistItemFormData,
  type PricelistCategoria,
  type PricelistSubcategoria,
} from "@/lib/pricelistApi";
import {
  UNIDADES_MAO_OBRA,
  UNIDADES_MATERIAIS,
  UNIDADES_SERVICO,
  UNIDADES_PRODUTO,
  getTipoItemLabel,
  type TipoPricelist,
} from "@/types/pricelist";
import { gerarDescricaoIA } from "@/lib/aiDescriptionGenerator";
import { supabaseRaw as supabase } from "@/lib/supabaseClient";
import {
  obterDetalhesCalculo,
  type CalculoPrecificacao,
  type RegrasPrecificacao,
} from "@/lib/precificacaoUtils";

// ============================================================
// SCHEMA DE VALIDAÇÃO
// ============================================================

const pricelistItemSchema = z.object({
  codigo: z.string().optional(),
  nome: z.string().min(1, "Nome é obrigatório"),
  descricao: z.string().optional(),
  nucleo_id: z.string().min(1, "Selecione um nucleo"),
  tipo: z.enum(["mao_obra", "material", "servico", "produto"], {
    required_error: "Selecione o tipo do item",
  }),
  categoria_id: z.string().optional(),
  subcategoria_id: z.string().optional(),
  preco: z.number().min(0, "Preço deve ser maior ou igual a 0"),
  producao_diaria: z.number().min(0, "Produção/dia deve ser maior ou igual a 0").optional(),
  unidade: z.string().min(1, "Unidade é obrigatória"),
  imagem_url: z.union([
    z.string().url("URL inválida"),
    z.literal(""),
  ]).optional(),
  // Campos de custo e margem
  custo_aquisicao: z.number().min(0, "Custo deve ser maior ou igual a 0").nullable().optional(),
  margem_lucro: z.number().min(0, "Margem deve ser maior ou igual a 0").nullable().optional(),
  markup: z.number().min(0, "Markup deve ser maior ou igual a 0").nullable().optional(),
  custo_operacional: z.number().min(0, "Custo operacional deve ser maior ou igual a 0").nullable().optional(),
  // Estoque
  controla_estoque: z.boolean().default(false),
  estoque_atual: z.number().min(0).nullable().optional(),
  estoque_minimo: z.number().min(0).nullable().optional(),
});

type PricelistItemFormFields = z.infer<typeof pricelistItemSchema>;

// ============================================================
// COMPONENTE
// ============================================================

export default function PricelistItemFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdicao = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [carregando, setCarregando] = useState(isEdicao);
  const [categorias, setCategorias] = useState<PricelistCategoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<PricelistSubcategoria[]>([]);
  const [gerandoIA, setGerandoIA] = useState(false);
  const [nucleos, setNucleos] = useState<any[]>([]);
  const [codigoManual, setCodigoManual] = useState(false);

  // Estado para cálculo automático de precificação
  const [calculoPreco, setCalculoPreco] = useState<{
    regras: RegrasPrecificacao;
    calculo: CalculoPrecificacao;
    breakdown: { nome: string; percentual: number; valor: number }[];
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PricelistItemFormFields>({
    resolver: zodResolver(pricelistItemSchema),
    defaultValues: {
      preco: 0,
      producao_diaria: 0,
      custo_aquisicao: null,
      margem_lucro: null,
      markup: null,
      custo_operacional: null,
      controla_estoque: false,
      estoque_atual: 0,
      estoque_minimo: 0,
    },
  });

  // Debug: Log de erros de validação
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.error("Erros de validação do formulário:", errors);
    }
  }, [errors]);

  const tipoSelecionado = watch("tipo");
  const nucleoSelecionado = watch("nucleo_id");
  const categoriaSelecionada = watch("categoria_id");
  const subcategoriaSelecionada = watch("subcategoria_id");
  const codigoAtual = watch("codigo");
  const controlaEstoque = watch("controla_estoque");
  const custoAquisicaoWatch = watch("custo_aquisicao");
  const nucleoInicialRef = useRef<string | null>(null);
  const categoriaAnteriorRef = useRef<string | null>(null);

  // =============================================================
  // CÁLCULO AUTOMÁTICO DE PREÇO baseado nas regras de precificação
  // =============================================================
  useEffect(() => {
    if (!custoAquisicaoWatch || custoAquisicaoWatch <= 0 || !nucleoSelecionado) {
      setCalculoPreco(null);
      return;
    }

    // Obter nome do núcleo selecionado
    const nucleoObj = nucleos.find((n) => n.id === nucleoSelecionado);
    const nucleoNome = nucleoObj?.nome || "";

    // Calcular preço usando as regras de precificação
    const detalhes = obterDetalhesCalculo(custoAquisicaoWatch, nucleoNome);
    setCalculoPreco(detalhes);

    // Atualizar o preço automaticamente
    if (detalhes.calculo.precoVenda > 0) {
      setValue("preco", Math.round(detalhes.calculo.precoVenda * 100) / 100);
      // Atualizar margem_lucro com a margem das regras
      setValue("margem_lucro", detalhes.regras.margemPerc);
    }
  }, [custoAquisicaoWatch, nucleoSelecionado, nucleos, setValue]);

  const buildPrefixoCategoria = (cat?: PricelistCategoria) => {
    if (!cat) return "";
    const codigo = cat.codigo ? cat.codigo.toUpperCase().trim() : "";
    if (codigo) return codigo;
    return String(cat.ordem || 0).padStart(3, "0");
  };

  // Definir tipos disponiveis baseado no nucleo selecionado
  const getTiposDisponiveis = () => {
    if (!nucleoSelecionado) return [];

    const nucleo = nucleos.find((n) => n.id === nucleoSelecionado);
    if (!nucleo) return [];

    const nome = nucleo.nome.toLowerCase();
    if (nome === "arquitetura") {
      return [{ value: "servico", label: "Servico" }];
    }
    if (nome === "engenharia") {
      return [
        { value: "mao_obra", label: "Mao de Obra" },
        { value: "material", label: "Material" },
      ];
    }
    if (nome === "marcenaria") {
      return [
        { value: "produto", label: "Produto" },
        { value: "servico", label: "Servico" },
      ];
    }
    if (nome === "materiais" || nome === "geral") {
      return [{ value: "material", label: "Material" }];
    }
    if (nome === "produtos" || nome === "compras") {
      return [{ value: "produto", label: "Produto" }];
    }
    return [];
  };

  // Definir unidades disponiveis baseado no tipo
  const getUnidadesDisponiveis = () => {
    if (!tipoSelecionado) return [];

    switch (tipoSelecionado) {
      case "mao_obra":
        return UNIDADES_MAO_OBRA;
      case "servico":
        return UNIDADES_SERVICO;
      case "produto":
        return UNIDADES_PRODUTO;
      case "material":
        return UNIDADES_MATERIAIS;
      default:
        return UNIDADES_MATERIAIS;
    }
  };

  const tiposDisponiveis = getTiposDisponiveis();
  const unidadesDisponiveis = getUnidadesDisponiveis();

  // Debug: verificar tipos disponíveis
  useEffect(() => {
    console.log("🔍 DEBUG - Núcleo selecionado:", nucleoSelecionado);
    console.log("🔍 DEBUG - Tipos disponíveis:", tiposDisponiveis);
  }, [nucleoSelecionado, tiposDisponiveis]);

  const carregarSubcategorias = async (
    categoriaId?: string | null,
    subcategoriaAtual?: string | null
  ) => {
    if (!categoriaId) {
      setSubcategorias([]);
      setValue("subcategoria_id", "");
      return;
    }

    try {
      const lista = await listarSubcategoriasPorCategoria(categoriaId);
      setSubcategorias(lista);
      if (subcategoriaAtual && !lista.some((s) => s.id === subcategoriaAtual)) {
        setValue("subcategoria_id", "");
      }
    } catch (error) {
      console.error("Erro ao carregar subcategorias:", error);
    }
  };

  // Resetar selecoes dependentes ao trocar de nucleo (apos a primeira carga)
  useEffect(() => {
    if (nucleoInicialRef.current === null) {
      nucleoInicialRef.current = nucleoSelecionado || "";
      return;
    }

    setValue("categoria_id", "");
    setValue("subcategoria_id", "");
    setValue("tipo", "");
    setValue("codigo", "");
  }, [nucleoSelecionado, setValue]);

  // Carregar núcleos
  useEffect(() => {
    async function carregarNucleos() {
      try {
        const { data } = await supabase
          .from("nucleos")
          .select("*")
          .eq("ativo", true)
          .order("nome");
        if (data) setNucleos(data);
      } catch (error) {
        console.error("Erro ao carregar núcleos:", error);
      }
    }
    carregarNucleos();
  }, []);


  // Carregar categorias
  useEffect(() => {
    async function carregarCategorias() {
      try {
        const data = await listarCategorias();
        setCategorias(data);
        if (!categoriaSelecionada && data.length > 0) {
          setValue("categoria_id", data[0].id);
        }
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
      }
    }
    carregarCategorias();
  }, []);

  // Carregar subcategorias conforme categoria escolhida
  useEffect(() => {
    carregarSubcategorias(categoriaSelecionada, subcategoriaSelecionada);
  }, [categoriaSelecionada, subcategoriaSelecionada]);

  // Sincronizar categoria -> tipo e gerar codigo automaticamente
  useEffect(() => {
    if (!categoriaSelecionada) {
      if (!isEdicao) {
        setValue("codigo", "");
      }
      return;
    }

    const categoria = categorias.find((c) => c.id === categoriaSelecionada);
    if (!categoria) return;

    // Alinhar o tipo ao da categoria apenas na criação de um novo item.
    // Em modo edição, respeitamos o tipo já salvo ou escolhido manualmente.
    if (!isEdicao && categoria.tipo && categoria.tipo !== tipoSelecionado) {
      setValue("tipo", categoria.tipo);
    }

    // Se trocou de categoria, liberar auto-geração mesmo se já digitou
    if (categoriaAnteriorRef.current !== categoriaSelecionada) {
      setCodigoManual(false);
      categoriaAnteriorRef.current = categoriaSelecionada;
    }

    // Gerar código se não estiver manual ou se estiver vazio
    const precisaGerar = !codigoManual || !codigoAtual;
    if (precisaGerar) {
      (async () => {
        try {
          const prefixo = buildPrefixoCategoria(categoria);
          const codigoGerado = await gerarCodigoItem(categoria.tipo, prefixo);
          setValue("codigo", codigoGerado);
        } catch (error) {
          console.error("Erro ao gerar codigo:", error);
        }
      })();
    }
  }, [
    categoriaSelecionada,
    categorias,
    tipoSelecionado,
    isEdicao,
    codigoAtual,
    setValue,
    codigoManual,
  ]);

  // Carregar item para edição
  useEffect(() => {
    if (id) {
      async function carregar() {
        try {
          setCarregando(true);
          const item = await buscarItem(id);
          setValue("codigo", item.codigo || "");
          setValue("nome", item.nome);
          setValue("descricao", item.descricao || "");
          setValue("nucleo_id", item.nucleo_id || "");
          setValue("tipo", item.tipo);
          setValue("categoria_id", item.categoria_id || "");
          await carregarSubcategorias(item.categoria_id, item.subcategoria_id || "");
          setValue("subcategoria_id", item.subcategoria_id || "");
          setValue("preco", item.preco);
          setValue("producao_diaria", item.producao_diaria ?? 0);
          setValue("unidade", item.unidade);
          setValue("imagem_url", item.imagem_url || "");
          // Campos de custo e margem
          setValue("custo_aquisicao", item.custo_aquisicao ?? null);
          setValue("margem_lucro", item.margem_lucro ?? null);
          setValue("markup", item.markup ?? null);
          setValue("custo_operacional", item.custo_operacional ?? null);
          // Estoque
          setValue("controla_estoque", item.controla_estoque);
          setValue("estoque_atual", item.estoque_atual);
          setValue("estoque_minimo", item.estoque_minimo);
        } catch (error) {
          console.error("Erro ao carregar item:", error);
          alert("Erro ao carregar item");
        } finally {
          setCarregando(false);
        }
      }
      carregar();
    }
  }, [id, setValue]);

  // Gerar descrição com IA
  async function handleGerarDescricaoIA() {
    const nome = watch("nome");
    const tipo = watch("tipo");
    const categoriaId = watch("categoria_id");

    if (!nome || !tipo) {
      alert("Por favor, preencha o nome e o tipo do item primeiro.");
      return;
    }

    try {
      setGerandoIA(true);
      const categoriaNome = categorias.find((c) => c.id === categoriaId)?.nome;
      const descricaoGerada = await gerarDescricaoIA(nome, tipo, categoriaNome);
      setValue("descricao", descricaoGerada);
    } catch (error) {
      console.error("Erro ao gerar descrição:", error);
      alert("Erro ao gerar descrição. Tente novamente.");
    } finally {
      setGerandoIA(false);
    }
  }

  async function onSubmit(data: PricelistItemFormFields) {
    setLoading(true);

    try {
      const payload: PricelistItemFormData = {
        codigo: data.codigo,
        nome: data.nome,
        descricao: data.descricao,
        nucleo_id: data.nucleo_id,
        tipo: data.tipo,
        categoria_id: data.categoria_id && data.categoria_id.trim() !== "" ? data.categoria_id : undefined,
        subcategoria_id: data.subcategoria_id && data.subcategoria_id.trim() !== "" ? data.subcategoria_id : undefined,
        preco: data.preco,
        producao_diaria: data.producao_diaria,
        unidade: data.unidade,
        imagem_url: data.imagem_url || undefined,
        // Campos de custo e margem
        custo_aquisicao: data.custo_aquisicao,
        margem_lucro: data.margem_lucro,
        markup: data.markup,
        custo_operacional: data.custo_operacional,
        // Estoque
        controla_estoque: data.controla_estoque,
        estoque_atual: data.controla_estoque ? data.estoque_atual : undefined,
        estoque_minimo: data.controla_estoque ? data.estoque_minimo : undefined,
      };

      if (isEdicao && id) {
        console.log("Atualizando item com payload:", payload);
        const resultado = await atualizarItem(id, payload);
        console.log("Item atualizado:", resultado);
        alert("Item atualizado com sucesso!");
      } else {
        console.log("Criando item com payload:", payload);
        const resultado = await criarItem(payload);
        console.log("Item criado:", resultado);
        alert("Item criado com sucesso!");
      }

      navigate("/pricelist");
    } catch (error: any) {
      console.error("Erro ao salvar item:", error);
      console.error("Detalhes do erro:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      alert(`Erro ao salvar item: ${error.message || "Erro desconhecido"}\n\nVerifique o console para mais detalhes.`);
    } finally {
      setLoading(false);
    }
  }

  if (carregando) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#F25C26]" />
          <p className="text-sm text-gray-600 mt-4">Carregando item...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/pricelist")}
          className="text-gray-600 hover:text-gray-900 mb-2 flex items-center gap-1 text-sm"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Voltar
        </button>
        <h1 className="text-2xl font-bold text-[#2E2E2E]">
          {isEdicao ? "Editar Item" : "Novo Item"}
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          {isEdicao
            ? "Atualize as informacoes do item"
            : "Adicione um novo item ao catálogo"}
        </p>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Card: Selecao de Nucleo */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-[#2E2E2E] mb-2">
            Nucleo de Negocio
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Selecione o nucleo para o qual deseja criar o item
          </p>

          <div className="flex flex-wrap gap-3 items-stretch">
            {nucleos
              .filter((n) => ["Arquitetura", "Engenharia", "Marcenaria", "Materiais", "Produtos"].includes(n.nome))
              .sort((a, b) => {
                const ordem = ["Arquitetura", "Engenharia", "Marcenaria", "Materiais", "Produtos"];
                return ordem.indexOf(a.nome) - ordem.indexOf(b.nome);
              })
              .map((nucleo) => {
                const isSelected = nucleoSelecionado === nucleo.id;
                const nucleoConfig = {
                  Arquitetura: { color: "#8B5CF6", icon: "ARQ" },
                  Engenharia: { color: "#3B82F6", icon: "ENG" },
                  Marcenaria: { color: "#F59E0B", icon: "MAR" },
                  Materiais: { color: "#EF4444", icon: "MAT" },
                  Produtos: { color: "#10B981", icon: "PRD" },
                }[nucleo.nome] || { color: "#9CA3AF", icon: "NCL" };

                return (
                  <label
                    key={nucleo.id}
                    className={`flex flex-col items-center justify-center gap-1 w-28 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected
                        ? "border-current text-white shadow-lg scale-105"
                        : "border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-md"
                    }`}
                    style={isSelected ? { backgroundColor: nucleoConfig.color } : {}}
                  >
                    <input
                      type="radio"
                      {...register("nucleo_id")}
                      value={nucleo.id}
                      checked={isSelected}
                      className="sr-only"
                    />
                    <span className="text-xs font-semibold mb-1">{nucleoConfig.icon}</span>
                    <span className="text-[10px] font-semibold text-center leading-tight">{nucleo.nome}</span>
                  </label>
                );
              })}
          </div>
          <p className="text-xs text-gray-500 mt-3">
            O nucleo selecionado determina os tipos de item disponiveis
          </p>
          {errors.nucleo_id && (
            <p className="text-sm text-red-600 mt-2">{errors.nucleo_id.message}</p>
          )}
        </div>

        {/* Card: Informacoes Básicas */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
          <h3 className="text-lg font-semibold text-[#2E2E2E]">
            Informacoes Básicas
          </h3>

          <div className="grid grid-cols-2 gap-6">
            {/* Código */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Código
              </label>
              <input
                type="text"
                {...register("codigo")}
                placeholder="Ex: ARQ-001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F25C26] focus:border-transparent"
                onChange={(e) => {
                  setCodigoManual(true);
                  setValue("codigo", e.target.value);
                }}
              />
              <p className="text-xs text-gray-500 mt-1">
                Selecione o nucleo e a categoria para gerar automaticamente
              </p>
              <button
                type="button"
                onClick={async () => {
                  const categoria = categorias.find((c) => c.id === categoriaSelecionada);
                  const tipoBase = categoria?.tipo || tipoSelecionado;
                  if (!tipoBase || (!categoria?.codigo && !categoriaSelecionada)) {
                    alert("Selecione uma categoria para gerar o código.");
                    return;
                  }
                  setCodigoManual(false);
                  try {
                    const prefixo = buildPrefixoCategoria(categoria);
                    const codigoGerado = await gerarCodigoItem(
                      categoria?.tipo || tipoSelecionado,
                      prefixo
                    );
                    setValue("codigo", codigoGerado);
                  } catch (error) {
                    console.error("Erro ao gerar codigo:", error);
                    alert("Não foi possível gerar o código.");
                  }
                }}
                className="mt-2 px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
              >
                Gerar código automático
              </button>
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tipo *
              </label>
              <select
                {...register("tipo")}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F25C26] focus:border-transparent ${
                  errors.tipo ? "border-red-500" : "border-gray-300"
                }`}
                disabled={!nucleoSelecionado || !!categoriaSelecionada}
              >
                <option value="">Selecione o tipo</option>
                {tiposDisponiveis.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
              {errors.tipo && (
                <p className="text-sm text-red-600 mt-1">{errors.tipo.message}</p>
              )}
              {!nucleoSelecionado ? (
                <p className="text-xs text-blue-600 mt-1">
                  Selecione primeiro um nucleo para liberar os tipos
                </p>
              ) : categoriaSelecionada ? (
                <p className="text-xs text-gray-500 mt-1">
                  Tipo definido pela categoria escolhida
                </p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">
                  Tipos filtrados pelo nucleo: {nucleos.find(n => n.id === nucleoSelecionado)?.nome}
                </p>
              )}
            </div>

          </div>

          {/* Nome */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nome *
            </label>
            <input
              type="text"
              {...register("nome")}
              placeholder="Ex: Projeto Arquitetônico Completo"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F25C26] focus:border-transparent ${
                errors.nome ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.nome && (
              <p className="text-sm text-red-600 mt-1">{errors.nome.message}</p>
            )}
          </div>

          {/* Descrição (Opcional) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-700">
                Descrição
              </label>
              <button
                type="button"
                onClick={handleGerarDescricaoIA}
                disabled={gerandoIA || !watch("nome") || !watch("tipo")}
                className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {gerandoIA ? (
                  <>
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Gerando...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Gerar com IA</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              {...register("descricao")}
              placeholder="Detalhes adicionais sobre o item (opcional)"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F25C26] focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Preencha o nome e tipo do item e clique em "Gerar com IA" para criar uma descrição didática automaticamente
            </p>
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Categoria
            </label>
            <select
              {...register("categoria_id")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F25C26] focus:border-transparent"
              disabled={!nucleoSelecionado}
            >
              <option value="">Sem categoria</option>
              {categorias.map((cat) => {
                const codigoDisplay = cat.codigo
                  ? `${cat.codigo} - `
                  : `${String(cat.ordem || 0).padStart(3, "0")} - `;
                return (
                  <option key={cat.id} value={cat.id}>
                    {codigoDisplay}{cat.nome}
                  </option>
                );
              })}
            </select>
            {!nucleoSelecionado && (
              <p className="text-xs text-blue-600 mt-1">
                Escolha um nucleo primeiro para habilitar as categorias e gerar o c¢digo
              </p>
            )}
          </div>

          {/* Subcategoria */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Subcategoria
            </label>
            <select
              {...register("subcategoria_id")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F25C26] focus:border-transparent"
              disabled={!categoriaSelecionada}
            >
              <option value="">Sem subcategoria</option>
              {subcategorias.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.nome}
                </option>
              ))}
            </select>
            {!categoriaSelecionada ? (
              <p className="text-xs text-blue-600 mt-1">
                Selecione uma categoria para listar subcategorias
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">
                Subcategorias filtradas pela categoria escolhida
              </p>
            )}
          </div>

          {/* URL da Imagem */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Imagem (URL)
            </label>
            <input
              type="url"
              {...register("imagem_url")}
              placeholder="https://exemplo.com/imagem.jpg"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F25C26] focus:border-transparent ${
                errors.imagem_url ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.imagem_url && (
              <p className="text-sm text-red-600 mt-1">{errors.imagem_url.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Cole o link direto da imagem do produto (opcional)
            </p>
            {watch("imagem_url") && (
              <div className="mt-3 border border-gray-200 rounded-lg p-3 bg-gray-50">
                <p className="text-xs font-semibold text-gray-700 mb-2">Preview:</p>
                <img
                  src={watch("imagem_url")}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Card: Preço e Unidade */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#2E2E2E]">Preço e Unidade</h3>
            {calculoPreco && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Calculado automaticamente
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Preço Unitário */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Preço Unitário * {calculoPreco && <span className="text-xs text-gray-400 font-normal">(automático)</span>}
              </label>
              <div className="relative">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${calculoPreco ? "text-green-600" : "text-gray-500"}`}>
                  R$
                </span>
                <input
                  type="number"
                  step="0.01"
                  {...register("preco", { valueAsNumber: true })}
                  placeholder="0,00"
                  readOnly={!!calculoPreco}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F25C26] focus:border-transparent ${
                    errors.preco ? "border-red-500" : calculoPreco ? "border-green-300 bg-green-50 cursor-not-allowed font-semibold text-green-700" : "border-gray-300"
                  }`}
                />
              </div>
              {errors.preco && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.preco.message}
                </p>
              )}
              {calculoPreco ? (
                <p className="text-xs text-green-600 mt-1">
                  Preço calculado baseado nas regras de precificação
                </p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">
                  Informe o custo de aquisição para calcular automaticamente
                </p>
              )}
            </div>

            {/* Unidade */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Unidade de Medida *
              </label>
              <select
                {...register("unidade")}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F25C26] focus:border-transparent ${
                  errors.unidade ? "border-red-500" : "border-gray-300"
                }`}
                disabled={!tipoSelecionado}
              >
                <option value="">Selecione uma unidade</option>
                {unidadesDisponiveis.map((unidade) => (
                  <option key={unidade.value} value={unidade.value}>
                    {unidade.label}
                  </option>
                ))}
              </select>
              {errors.unidade && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.unidade.message}
                </p>
              )}
              {!tipoSelecionado && (
                <p className="text-xs text-gray-500 mt-1">
                  Selecione o tipo primeiro
                </p>
              )}
            </div>

            {/* Produção diária */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Produção diária (opcional)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register("producao_diaria", { valueAsNumber: true })}
                placeholder="Ex: 25 m²/dia"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F25C26] focus:border-transparent ${
                  errors.producao_diaria ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.producao_diaria && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.producao_diaria.message}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Informe quantos m² / ml / unidades a equipe executa em 1 dia.
              </p>
            </div>
          </div>
        </div>

        {/* Card: Custos e Margem - CÁLCULO AUTOMÁTICO */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#2E2E2E]">Custos e Margem</h3>
              <p className="text-sm text-gray-500 mt-1">
                O preço é calculado automaticamente baseado nas regras de precificação
              </p>
            </div>
            {calculoPreco && (
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                  {nucleos.find((n) => n.id === nucleoSelecionado)?.nome || "Núcleo"}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  calculoPreco.calculo.margemRealPerc > 0
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}>
                  Margem: {calculoPreco.calculo.margemRealPerc.toFixed(1)}%
                </span>
              </div>
            )}
          </div>

          {/* Campo de entrada: Custo de Aquisição */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Custo de Aquisição *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  R$
                </span>
                <input
                  type="number"
                  step="0.01"
                  {...register("custo_aquisicao", { valueAsNumber: true })}
                  placeholder="0,00"
                  className="w-full pl-10 pr-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F25C26] focus:border-transparent bg-blue-50"
                />
              </div>
              <p className="text-xs text-blue-600 mt-1 font-medium">
                Este é o VALOR BASE - informe quanto você paga pelo item/serviço
              </p>
            </div>

            {/* Custo Operacional - Opcional */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Custo Operacional (opcional)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  R$
                </span>
                <input
                  type="number"
                  step="0.01"
                  {...register("custo_operacional", { valueAsNumber: true })}
                  placeholder="0,00"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F25C26] focus:border-transparent"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Custos indiretos (transporte, manuseio, etc)
              </p>
            </div>
          </div>

          {/* Breakdown do Cálculo Automático */}
          {calculoPreco && custoAquisicaoWatch && custoAquisicaoWatch > 0 ? (
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Cálculo Automático de Precificação
                </h4>
                <span className="text-xs text-purple-600 font-medium">
                  Regras: {nucleos.find((n) => n.id === nucleoSelecionado)?.nome || "Padrão"}
                </span>
              </div>

              {/* Tabela de Breakdown */}
              <div className="space-y-2">
                {/* Item 1: Custo de Aquisição */}
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</span>
                    <span className="text-sm text-gray-700">Custo de Aquisição</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">
                    R$ {calculoPreco.calculo.custoAquisicao.toFixed(2)}
                  </span>
                </div>

                {/* Item 2: Impostos */}
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-bold">2</span>
                    <span className="text-sm text-gray-700">+ Impostos</span>
                    <span className="text-xs text-orange-600 font-medium">({calculoPreco.regras.impostosPerc.toFixed(1)}%)</span>
                  </div>
                  <span className="text-sm font-semibold text-orange-600">
                    + R$ {calculoPreco.calculo.impostos.toFixed(2)}
                  </span>
                </div>

                {/* Item 3: Custo Hora William */}
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-yellow-500 text-white text-xs flex items-center justify-center font-bold">3</span>
                    <span className="text-sm text-gray-700">+ Custo Hora William</span>
                    <span className="text-xs text-yellow-600 font-medium">({calculoPreco.regras.custoHoraWilliamPerc.toFixed(1)}%)</span>
                  </div>
                  <span className="text-sm font-semibold text-yellow-600">
                    + R$ {calculoPreco.calculo.custoHoraWilliam.toFixed(2)}
                  </span>
                </div>

                {/* Item 4: Custos Variáveis */}
                {calculoPreco.regras.variaveisPerc > 0 && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-pink-500 text-white text-xs flex items-center justify-center font-bold">4</span>
                      <span className="text-sm text-gray-700">+ Custos Variáveis</span>
                      <span className="text-xs text-pink-600 font-medium">({calculoPreco.regras.variaveisPerc.toFixed(1)}%)</span>
                    </div>
                    <span className="text-sm font-semibold text-pink-600">
                      + R$ {calculoPreco.calculo.variaveis.toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Item 5: Custos Fixos */}
                {calculoPreco.regras.fixosPerc > 0 && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center font-bold">5</span>
                      <span className="text-sm text-gray-700">+ Custos Fixos</span>
                      <span className="text-xs text-purple-600 font-medium">({calculoPreco.regras.fixosPerc.toFixed(1)}%)</span>
                    </div>
                    <span className="text-sm font-semibold text-purple-600">
                      + R$ {calculoPreco.calculo.fixos.toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Subtotal: Custo Real */}
                <div className="flex items-center justify-between py-2 bg-gray-100 rounded px-2 border-b-2 border-gray-300">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-800">= CUSTO REAL</span>
                  </div>
                  <span className="text-sm font-bold text-gray-800">
                    R$ {calculoPreco.calculo.custoReal.toFixed(2)}
                  </span>
                </div>

                {/* Item 6: Margem de Lucro */}
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-bold">+</span>
                    <span className="text-sm text-gray-700">+ Margem de Lucro</span>
                    <span className="text-xs text-green-600 font-medium">({calculoPreco.regras.margemPerc.toFixed(1)}%)</span>
                  </div>
                  <span className="text-sm font-semibold text-green-600">
                    + R$ {calculoPreco.calculo.margem.toFixed(2)}
                  </span>
                </div>

                {/* Total Final: Preço de Venda */}
                <div className="flex items-center justify-between py-3 bg-green-100 rounded-lg px-3 mt-2">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-base font-bold text-green-800">= PREÇO DE VENDA</span>
                  </div>
                  <span className="text-xl font-bold text-green-700">
                    R$ {calculoPreco.calculo.precoVenda.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Aviso sobre cálculo automático */}
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-xs text-yellow-800 font-medium">Cálculo Automático Ativado</p>
                  <p className="text-xs text-yellow-700 mt-0.5">
                    O preço unitário é calculado automaticamente usando as regras de precificação do núcleo <strong>{nucleos.find((n) => n.id === nucleoSelecionado)?.nome}</strong>.
                    Para alterar as taxas, acesse Configurações &gt; Precificação.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-center py-6">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gray-500">
                  {!nucleoSelecionado
                    ? "Selecione um núcleo de negócio para ativar o cálculo automático"
                    : "Informe o custo de aquisição para ver o cálculo automático do preço"
                  }
                </p>
              </div>
            </div>
          )}

          {/* Campos travados (read-only) quando há cálculo */}
          {calculoPreco && (
            <div className="grid grid-cols-2 gap-6 mt-4 opacity-60">
              {/* Margem de Lucro - Read Only */}
              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-2">
                  Margem de Lucro (automático)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={calculoPreco.regras.margemPerc}
                    readOnly
                    className="w-full pr-10 pl-3 py-2 border border-gray-200 rounded-lg bg-gray-100 cursor-not-allowed"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    %
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Definido nas regras de precificação
                </p>
              </div>

              {/* Markup - Calculado */}
              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-2">
                  Markup (calculado)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={custoAquisicaoWatch && custoAquisicaoWatch > 0
                      ? (((calculoPreco.calculo.precoVenda - custoAquisicaoWatch) / custoAquisicaoWatch) * 100).toFixed(1)
                      : 0
                    }
                    readOnly
                    className="w-full pr-10 pl-3 py-2 border border-gray-200 rounded-lg bg-gray-100 cursor-not-allowed"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    %
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Fator multiplicador resultante
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Card: Controle de Estoque */}
        {tipoSelecionado === "material" && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#2E2E2E]">
                Controle de Estoque
              </h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("controla_estoque")}
                  className="w-4 h-4 text-[#F25C26] border-gray-300 rounded focus:ring-[#F25C26]"
                />
                <span className="text-sm font-medium text-gray-700">
                  Controlar estoque
                </span>
              </label>
            </div>

            {controlaEstoque && (
              <div className="grid grid-cols-2 gap-6">
                {/* Estoque Atual */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Estoque Atual
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("estoque_atual", { valueAsNumber: true })}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F25C26] focus:border-transparent"
                  />
                </div>

                {/* Estoque Mínimo */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Estoque Mínimo
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("estoque_minimo", { valueAsNumber: true })}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F25C26] focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Alerta quando estoque estiver abaixo deste valor
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/pricelist")}
            disabled={loading}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 text-sm font-medium text-white bg-[#F25C26] rounded-lg hover:bg-[#e04a1a] disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>{isEdicao ? "Atualizar" : "Criar"} Item</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
