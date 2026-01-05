import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Loader2,
  RefreshCw,
  Tag,
  FolderTree,
  Save,
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronRight,
  Package,
  GripVertical,
  X,
  Check,
  Palette,
  Move,
  ArrowDownToLine,
} from "lucide-react";
import {
  CATEGORIAS_CONFIG,
  SUBCATEGORIAS_PADRAO,
  getCorCategoria,
  getCorClaraCategoria,
  getCodigoCategoria,
  gerarCodigoItem,
} from "@/config/categoriasConfig";
import {
  listarCategorias,
  listarSubcategorias,
  criarCategoria,
  atualizarCategoria,
  deletarCategoria,
  criarSubcategoria,
  atualizarSubcategoria,
  deletarSubcategoria,
} from "@/lib/pricelistApi";

// ============================================================
// TIPOS
// ============================================================

interface CategoriaDB {
  id: string;
  nome: string;
  codigo?: string;
  tipo?: string;
  ativo?: boolean;
  ordem?: number;
  cor?: string;
}

interface SubcategoriaDB {
  id: string;
  nome: string;
  categoria_id: string;
  tipo?: string;
  ordem?: number;
  ativo?: boolean;
}

interface ContagemItens {
  categoria_id: string;
  subcategoria_id: string | null;
  total: number;
}

// Tipos para Drag & Drop
interface DragState {
  draggedId: string | null;
  draggedType: "categoria" | "subcategoria" | null;
  overId: string | null;
  overType: "categoria" | "subcategoria" | "between" | null;
  overPosition: "top" | "bottom" | "center" | null;
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function GerenciarCategoriasPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Estados principais
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  // Dados do banco
  const [categoriasDB, setCategoriasDB] = useState<CategoriaDB[]>([]);
  const [subcategoriasDB, setSubcategoriasDB] = useState<SubcategoriaDB[]>([]);
  const [contagemItens, setContagemItens] = useState<ContagemItens[]>([]);

  // UI States
  const [busca, setBusca] = useState("");
  const [expandidas, setExpandidas] = useState<Set<string>>(new Set());
  const [editandoCategoria, setEditandoCategoria] = useState<string | null>(null);
  const [novaCategoria, setNovaCategoria] = useState(false);

  // Form States
  const [formCategoria, setFormCategoria] = useState({
    nome: "",
    codigo: "",
    tipo: "material" as string,
    ordem: 0,
    cor: "#6B7280",
    ativo: true,
  });

  // Drag & Drop States
  const [dragState, setDragState] = useState<DragState>({
    draggedId: null,
    draggedType: null,
    overId: null,
    overType: null,
    overPosition: null,
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  // Relatório de mudanças em cascata
  const [relatorioMudancas, setRelatorioMudancas] = useState<{
    visivel: boolean;
    titulo: string;
    detalhes: string[];
  }>({ visivel: false, titulo: "", detalhes: [] });

  // Subcategorias expandidas e seus itens
  const [subcategoriasExpandidas, setSubcategoriasExpandidas] = useState<Set<string>>(new Set());
  const [itensSubcategoria, setItensSubcategoria] = useState<Record<string, any[]>>({});
  const [carregandoItens, setCarregandoItens] = useState<string | null>(null);

  // Sistema de abas por categoria (raiz + subcategorias)
  const [abaAtivaPorCategoria, setAbaAtivaPorCategoria] = useState<Record<string, string>>({});
  const [itensRaiz, setItensRaiz] = useState<Record<string, any[]>>({});
  const [carregandoRaiz, setCarregandoRaiz] = useState<string | null>(null);

  // Seleção múltipla para classificação em lote
  const [itensSelecionados, setItensSelecionados] = useState<Record<string, Set<string>>>({});

  // ============================================================
  // CARREGAMENTO DE DADOS
  // ============================================================

  const carregarDados = useCallback(async () => {
    setLoading(true);
    try {
      // Buscar categorias
      const categorias = await listarCategorias();
      const categoriasOrdenadas = [...categorias].sort((a, b) =>
        (a.ordem || 0) - (b.ordem || 0)
      );
      setCategoriasDB(categoriasOrdenadas);

      // Buscar subcategorias
      const subcategorias = await listarSubcategorias();
      setSubcategoriasDB(subcategorias);

      // Buscar contagem de itens por categoria/subcategoria
      const { data: itens } = await supabase
        .from("pricelist_itens")
        .select("categoria_id, subcategoria_id")
        .eq("ativo", true);

      // Criar set de subcategorias válidas para verificação
      const subcategoriasValidas = new Set(subcategorias.map(s => s.id));

      // Calcular contagem
      const contagem: ContagemItens[] = [];
      const contagemMap = new Map<string, number>();

      (itens || []).forEach((item: any) => {
        const catId = item.categoria_id || "sem";
        // Tratar como "sem" (raiz) se: null, vazio, ou ID inválido (não existe na tabela)
        const subId = item.subcategoria_id &&
                      item.subcategoria_id.trim() !== "" &&
                      subcategoriasValidas.has(item.subcategoria_id)
          ? item.subcategoria_id
          : "sem";
        const key = `${catId}_${subId}`;
        contagemMap.set(key, (contagemMap.get(key) || 0) + 1);
      });

      contagemMap.forEach((total, key) => {
        const [catId, subId] = key.split("_");
        contagem.push({
          categoria_id: catId === "sem" ? "" : catId,
          subcategoria_id: subId === "sem" ? null : subId,
          total,
        });
      });

      setContagemItens(contagem);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Função que recarrega dados mantendo a posição do scroll
  const carregarDadosMantendoScroll = useCallback(async () => {
    // Salvar posição do scroll do container principal
    const container = document.querySelector('.layout-content');
    const scrollTop = container?.scrollTop || 0;

    await carregarDados();

    // Restaurar posição do scroll após um pequeno delay para garantir que o DOM atualizou
    requestAnimationFrame(() => {
      if (container) {
        container.scrollTop = scrollTop;
      }
    });
  }, [carregarDados]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // ============================================================
  // FUNÇÕES AUXILIARES
  // ============================================================

  const getContagemCategoria = (categoriaId: string) => {
    return contagemItens
      .filter(c => c.categoria_id === categoriaId)
      .reduce((acc, c) => acc + c.total, 0);
  };

  const getContagemSubcategoria = (categoriaId: string, subcategoriaId: string | null) => {
    const item = contagemItens.find(
      c => c.categoria_id === categoriaId && c.subcategoria_id === subcategoriaId
    );
    return item?.total || 0;
  };

  const toggleExpansao = (categoriaId: string) => {
    setExpandidas(prev => {
      const novo = new Set(prev);
      if (novo.has(categoriaId)) {
        novo.delete(categoriaId);
      } else {
        novo.add(categoriaId);
        // Inicializar na aba "raiz" e carregar itens
        if (!abaAtivaPorCategoria[categoriaId]) {
          setAbaAtivaPorCategoria(p => ({ ...p, [categoriaId]: "raiz" }));
          if (!itensRaiz[categoriaId]) {
            carregarItensRaiz(categoriaId);
          }
        }
      }
      return novo;
    });
  };

  const getSubcategoriasDaCategoria = (categoriaId: string) => {
    return subcategoriasDB
      .filter(s => s.categoria_id === categoriaId)
      .sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
  };

  const gerarCodigoFormatado = (ordem: number, codigoCat: string, prefixoSub: string, numero: number) => {
    return `${String(ordem).padStart(3, "0")}/${codigoCat}/${prefixoSub}#${String(numero).padStart(3, "0")}`;
  };

  // ============================================================
  // CRUD CATEGORIAS
  // ============================================================

  const iniciarNovaCategoria = () => {
    const proximaOrdem = categoriasDB.length > 0
      ? Math.max(...categoriasDB.map(c => c.ordem || 0)) + 1
      : 1;

    setFormCategoria({
      nome: "",
      codigo: "",
      tipo: "material",
      ordem: proximaOrdem,
      cor: "#6B7280",
      ativo: true,
    });
    setNovaCategoria(true);
    setEditandoCategoria(null);
  };

  const iniciarEdicaoCategoria = (categoria: CategoriaDB) => {
    // Sempre usar o código do banco, não auto-gerar
    setFormCategoria({
      nome: categoria.nome,
      codigo: categoria.codigo || "",
      tipo: categoria.tipo || "material",
      ordem: categoria.ordem || 0,
      cor: categoria.cor || getCorCategoria(categoria.nome),
      ativo: categoria.ativo ?? true,
    });
    setEditandoCategoria(categoria.id);
    setNovaCategoria(false);
  };

  const cancelarEdicao = () => {
    setEditandoCategoria(null);
    setNovaCategoria(false);
    setFormCategoria({
      nome: "",
      codigo: "",
      tipo: "material",
      ordem: 0,
      cor: "#6B7280",
      ativo: true,
    });
  };

  // Função para gerar código único
  const gerarCodigoUnico = (codigoBase: string): string => {
    const codigoNormalizado = codigoBase.toUpperCase().trim();
    const codigosExistentes = categoriasDB.map(c => (c.codigo || "").toUpperCase());

    // Se o código base não existe, usar ele
    if (!codigosExistentes.includes(codigoNormalizado)) {
      return codigoNormalizado;
    }

    // Se existe, adicionar número sequencial
    let contador = 1;
    let codigoTentativa = `${codigoNormalizado}${contador}`;
    while (codigosExistentes.includes(codigoTentativa)) {
      contador++;
      codigoTentativa = `${codigoNormalizado}${contador}`;
    }
    return codigoTentativa;
  };

  const salvarCategoria = async () => {
    if (!formCategoria.nome.trim()) {
      toast({
        title: "Erro",
        description: "Nome da categoria é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    setSalvando(true);
    try {
      if (novaCategoria) {
        // Gerar código único antes de criar
        const codigoBase = formCategoria.codigo.trim() || formCategoria.nome.substring(0, 3).toUpperCase();
        const codigoFinal = gerarCodigoUnico(codigoBase);

        // Criar nova categoria
        const novaCat = await criarCategoria({
          nome: formCategoria.nome.trim(),
          codigo: codigoFinal,
          tipo: formCategoria.tipo as any,
          ordem: formCategoria.ordem,
          ativo: formCategoria.ativo,
        });

        // Criar subcategorias padrão automaticamente
        for (let i = 0; i < SUBCATEGORIAS_PADRAO.length; i++) {
          const sub = SUBCATEGORIAS_PADRAO[i];
          await criarSubcategoria({
            categoria_id: novaCat.id,
            nome: sub.nome,
            tipo: formCategoria.tipo as any,
            ordem: (i + 1) * 10,
            ativo: true,
          });
        }

        toast({
          title: "Categoria criada",
          description: `"${formCategoria.nome}" (${codigoFinal}) criada com ${SUBCATEGORIAS_PADRAO.length} subcategorias padrão.`,
        });
      } else if (editandoCategoria) {
        // Buscar código original da categoria sendo editada
        const categoriaOriginal = categoriasDB.find(c => c.id === editandoCategoria);
        const codigoOriginal = (categoriaOriginal?.codigo || "").toUpperCase();
        const codigoAtual = formCategoria.codigo.trim().toUpperCase();

        // Só verificar duplicados se o código foi ALTERADO
        if (codigoOriginal !== codigoAtual) {
          const codigoEmUso = categoriasDB.find(
            c => c.id !== editandoCategoria && (c.codigo || "").toUpperCase() === codigoAtual
          );

          if (codigoEmUso) {
            toast({
              title: "Código duplicado",
              description: `O código "${codigoAtual}" já está em uso pela categoria "${codigoEmUso.nome}".`,
              variant: "destructive",
            });
            setSalvando(false);
            return;
          }
        }

        // Atualizar categoria existente
        await atualizarCategoria(editandoCategoria, {
          nome: formCategoria.nome.trim(),
          codigo: formCategoria.codigo.trim(),
          tipo: formCategoria.tipo as any,
          ordem: formCategoria.ordem,
          ativo: formCategoria.ativo,
        });

        toast({
          title: "Categoria atualizada",
          description: `"${formCategoria.nome}" foi atualizada.`,
        });
      }

      cancelarEdicao();
      await carregarDadosMantendoScroll();
    } catch (error) {
      console.error("Erro ao salvar categoria:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a categoria.",
        variant: "destructive",
      });
    } finally {
      setSalvando(false);
    }
  };

  const excluirCategoria = async (categoria: CategoriaDB) => {
    const totalItens = getContagemCategoria(categoria.id);
    if (totalItens > 0) {
      toast({
        title: "Não é possível excluir",
        description: `Esta categoria possui ${totalItens} itens vinculados. Remova os itens primeiro.`,
        variant: "destructive",
      });
      return;
    }

    if (!confirm(`Deseja realmente excluir a categoria "${categoria.nome}"?`)) {
      return;
    }

    setSalvando(true);
    try {
      // Excluir subcategorias primeiro
      const subs = getSubcategoriasDaCategoria(categoria.id);
      for (const sub of subs) {
        await deletarSubcategoria(sub.id);
      }

      // Excluir categoria
      await deletarCategoria(categoria.id);

      toast({
        title: "Categoria excluída",
        description: `"${categoria.nome}" foi excluída.`,
      });

      await carregarDadosMantendoScroll();
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a categoria.",
        variant: "destructive",
      });
    } finally {
      setSalvando(false);
    }
  };

  // ============================================================
  // CRUD SUBCATEGORIAS
  // ============================================================

  const adicionarSubcategoriaPadrao = async (categoriaId: string, categoria: CategoriaDB) => {
    const existentes = getSubcategoriasDaCategoria(categoriaId);
    const existentesNomes = existentes.map(s => s.nome.toLowerCase());

    const faltantes = SUBCATEGORIAS_PADRAO.filter(
      sub => !existentesNomes.includes(sub.nome.toLowerCase())
    );

    if (faltantes.length === 0) {
      toast({
        title: "Subcategorias completas",
        description: "Todas as subcategorias padrão já existem.",
      });
      return;
    }

    setSalvando(true);
    try {
      const ordemBase = existentes.length > 0
        ? Math.max(...existentes.map(s => s.ordem || 0)) + 10
        : 10;

      for (let i = 0; i < faltantes.length; i++) {
        const sub = faltantes[i];
        await criarSubcategoria({
          categoria_id: categoriaId,
          nome: sub.nome,
          tipo: categoria.tipo as any || "material",
          ordem: ordemBase + (i * 10),
          ativo: true,
        });
      }

      toast({
        title: "Subcategorias adicionadas",
        description: `${faltantes.length} subcategorias foram adicionadas.`,
      });

      await carregarDadosMantendoScroll();
    } catch (error) {
      console.error("Erro ao adicionar subcategorias:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar as subcategorias.",
        variant: "destructive",
      });
    } finally {
      setSalvando(false);
    }
  };

  // ============================================================
  // SUBCATEGORIAS EXPANSÍVEIS
  // ============================================================

  const toggleSubcategoriaExpansao = async (subcategoriaId: string, categoriaId: string) => {
    setSubcategoriasExpandidas(prev => {
      const novo = new Set(prev);
      if (novo.has(subcategoriaId)) {
        novo.delete(subcategoriaId);
      } else {
        novo.add(subcategoriaId);
        // Carregar itens se ainda não carregados
        if (!itensSubcategoria[subcategoriaId]) {
          carregarItensSubcategoria(subcategoriaId, categoriaId);
        }
      }
      return novo;
    });
  };

  const carregarItensSubcategoria = async (subcategoriaId: string, categoriaId: string) => {
    setCarregandoItens(subcategoriaId);
    try {
      const { data, error } = await supabase
        .from("pricelist_itens")
        .select("id, nome, codigo, unidade, preco, ativo")
        .eq("categoria_id", categoriaId)
        .eq("subcategoria_id", subcategoriaId)
        .eq("ativo", true)
        .order("nome", { ascending: true })
        .limit(50);

      if (error) throw error;

      setItensSubcategoria(prev => ({
        ...prev,
        [subcategoriaId]: data || [],
      }));
    } catch (error) {
      console.error("Erro ao carregar itens:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os itens.",
        variant: "destructive",
      });
    } finally {
      setCarregandoItens(null);
    }
  };

  // Carregar itens da raiz (sem subcategoria válida)
  // Busca itens onde subcategoria_id é NULL, vazio, ou inválido (não existe na tabela)
  const carregarItensRaiz = async (categoriaId: string) => {
    setCarregandoRaiz(categoriaId);
    try {
      // Buscar TODOS os itens da categoria
      const { data: todosItens, error } = await supabase
        .from("pricelist_itens")
        .select("id, nome, codigo, unidade, preco, tipo, ativo, subcategoria_id")
        .eq("categoria_id", categoriaId)
        .eq("ativo", true)
        .order("nome", { ascending: true })
        .limit(500);

      if (error) throw error;

      // Obter subcategorias válidas desta categoria
      const subcategoriasValidas = new Set(
        subcategoriasDB
          .filter(s => s.categoria_id === categoriaId)
          .map(s => s.id)
      );

      // Filtrar itens que estão na "raiz" (sem subcategoria válida)
      // Considera raiz: null, vazio, whitespace, ou ID que não existe
      const itensRaizFiltrados = (todosItens || []).filter(item => {
        const subId = item.subcategoria_id;
        // É raiz se: null, undefined, string vazia/whitespace, ou ID inválido
        if (!subId || subId.trim() === "") return true;
        if (!subcategoriasValidas.has(subId)) return true;
        return false;
      });

      // Remover o campo subcategoria_id dos resultados (não precisamos mais)
      const itensLimpos = itensRaizFiltrados.map(({ subcategoria_id, ...rest }) => rest);

      setItensRaiz(prev => ({
        ...prev,
        [categoriaId]: itensLimpos,
      }));

      const nulos = itensRaizFiltrados.filter(i => !i.subcategoria_id).length;
      const invalidos = itensRaizFiltrados.filter(i => i.subcategoria_id && !subcategoriasValidas.has(i.subcategoria_id)).length;
      console.log(`[Categoria Raiz] ${categoriaId}: ${itensLimpos.length} itens (${nulos} sem subcategoria + ${invalidos} com subcategoria inválida)`);
    } catch (error) {
      console.error("Erro ao carregar itens da raiz:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os itens da categoria.",
        variant: "destructive",
      });
    } finally {
      setCarregandoRaiz(null);
    }
  };

  // Atualizar subcategoria de um item (mover para subcategoria)
  const atualizarSubcategoriaItem = async (itemId: string, subcategoriaId: string, categoriaId: string) => {
    try {
      const { error } = await supabase
        .from("pricelist_itens")
        .update({ subcategoria_id: subcategoriaId })
        .eq("id", itemId);

      if (error) throw error;

      // Remover item da lista da raiz
      setItensRaiz(prev => ({
        ...prev,
        [categoriaId]: (prev[categoriaId] || []).filter(item => item.id !== itemId),
      }));

      // Recarregar contagem mantendo scroll
      await carregarDadosMantendoScroll();

      toast({
        title: "Item classificado",
        description: "Item movido para a subcategoria com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao atualizar subcategoria:", error);
      toast({
        title: "Erro",
        description: "Não foi possível mover o item.",
        variant: "destructive",
      });
    }
  };

  // Reclassificar item de uma subcategoria para outra
  const reclassificarItem = async (itemId: string, novaSubcategoriaId: string, subcategoriaAtualId: string, categoriaId: string) => {
    try {
      const { error } = await supabase
        .from("pricelist_itens")
        .update({ subcategoria_id: novaSubcategoriaId })
        .eq("id", itemId);

      if (error) throw error;

      // Remover item da lista da subcategoria atual
      setItensSubcategoria(prev => ({
        ...prev,
        [subcategoriaAtualId]: (prev[subcategoriaAtualId] || []).filter(item => item.id !== itemId),
      }));

      // Recarregar contagem mantendo scroll
      await carregarDadosMantendoScroll();

      // Buscar nome da nova subcategoria
      const novaSub = subcategoriasDB.find(s => s.id === novaSubcategoriaId);

      toast({
        title: "Item reclassificado",
        description: `Item movido para "${novaSub?.nome || 'subcategoria'}".`,
      });
    } catch (error) {
      console.error("Erro ao reclassificar item:", error);
      toast({
        title: "Erro",
        description: "Não foi possível mover o item.",
        variant: "destructive",
      });
    }
  };

  // Mover item para outra categoria (mantém na raiz da nova categoria)
  const moverParaOutraCategoria = async (itemId: string, novaCategoriaId: string, categoriaAtualId: string) => {
    try {
      const { error } = await supabase
        .from("pricelist_itens")
        .update({
          categoria_id: novaCategoriaId,
          subcategoria_id: null // Vai para raiz da nova categoria
        })
        .eq("id", itemId);

      if (error) throw error;

      // Remover item da lista da categoria atual
      setItensRaiz(prev => ({
        ...prev,
        [categoriaAtualId]: (prev[categoriaAtualId] || []).filter(item => item.id !== itemId),
      }));

      // Recarregar dados mantendo scroll
      await carregarDadosMantendoScroll();

      // Buscar nome da nova categoria
      const novaCat = categoriasDB.find(c => c.id === novaCategoriaId);

      toast({
        title: "Item transferido",
        description: `Item movido para categoria "${novaCat?.nome || 'nova categoria'}".`,
      });
    } catch (error) {
      console.error("Erro ao mover item para outra categoria:", error);
      toast({
        title: "Erro",
        description: "Não foi possível mover o item.",
        variant: "destructive",
      });
    }
  };

  // Atualizar tipo de um item (material, mao_obra, servico, etc)
  const atualizarTipoItem = async (itemId: string, novoTipo: string, categoriaId: string) => {
    try {
      const { error } = await supabase
        .from("pricelist_itens")
        .update({ tipo: novoTipo })
        .eq("id", itemId);

      if (error) throw error;

      // Atualizar item na lista local
      setItensRaiz(prev => ({
        ...prev,
        [categoriaId]: (prev[categoriaId] || []).map(item =>
          item.id === itemId ? { ...item, tipo: novoTipo } : item
        ),
      }));

      const tipoLabels: Record<string, string> = {
        material: "Material",
        mao_obra: "Mão de Obra",
        servico: "Serviço",
        produto: "Produto",
        insumo: "Insumo",
      };

      toast({
        title: "Tipo atualizado",
        description: `Item alterado para "${tipoLabels[novoTipo] || novoTipo}".`,
      });
    } catch (error) {
      console.error("Erro ao atualizar tipo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o tipo do item.",
        variant: "destructive",
      });
    }
  };

  // Funções de seleção múltipla
  const toggleSelecaoItem = (categoriaId: string, itemId: string) => {
    setItensSelecionados(prev => {
      const selecionados = new Set(prev[categoriaId] || []);
      if (selecionados.has(itemId)) {
        selecionados.delete(itemId);
      } else {
        selecionados.add(itemId);
      }
      return { ...prev, [categoriaId]: selecionados };
    });
  };

  const selecionarTodos = (categoriaId: string) => {
    const itens = itensRaiz[categoriaId] || [];
    const todosSelecionados = itens.every(item =>
      (itensSelecionados[categoriaId] || new Set()).has(item.id)
    );

    if (todosSelecionados) {
      // Desselecionar todos
      setItensSelecionados(prev => ({ ...prev, [categoriaId]: new Set() }));
    } else {
      // Selecionar todos
      setItensSelecionados(prev => ({
        ...prev,
        [categoriaId]: new Set(itens.map(item => item.id)),
      }));
    }
  };

  const classificarSelecionados = async (categoriaId: string, subcategoriaId: string) => {
    const selecionados = Array.from(itensSelecionados[categoriaId] || []);
    if (selecionados.length === 0) return;

    setSalvando(true);
    try {
      // Atualizar todos os itens selecionados
      const { error } = await supabase
        .from("pricelist_itens")
        .update({ subcategoria_id: subcategoriaId })
        .in("id", selecionados);

      if (error) throw error;

      // Remover itens da lista da raiz
      setItensRaiz(prev => ({
        ...prev,
        [categoriaId]: (prev[categoriaId] || []).filter(item => !selecionados.includes(item.id)),
      }));

      // Limpar seleção
      setItensSelecionados(prev => ({ ...prev, [categoriaId]: new Set() }));

      // Recarregar contagem mantendo scroll
      await carregarDadosMantendoScroll();

      toast({
        title: "Itens classificados",
        description: `${selecionados.length} item(ns) movidos para a subcategoria.`,
      });
    } catch (error) {
      console.error("Erro ao classificar itens:", error);
      toast({
        title: "Erro",
        description: "Não foi possível mover os itens.",
        variant: "destructive",
      });
    } finally {
      setSalvando(false);
    }
  };

  const getQtdSelecionados = (categoriaId: string) => {
    return (itensSelecionados[categoriaId] || new Set()).size;
  };

  // Alternar aba ativa da categoria
  const alternarAbaCategoria = async (categoriaId: string, abaId: string) => {
    setAbaAtivaPorCategoria(prev => ({ ...prev, [categoriaId]: abaId }));

    if (abaId === "raiz") {
      // Carregar itens da raiz se ainda não carregados
      if (!itensRaiz[categoriaId]) {
        await carregarItensRaiz(categoriaId);
      }
    } else {
      // Carregar itens da subcategoria se ainda não carregados
      if (!itensSubcategoria[abaId]) {
        await carregarItensSubcategoria(abaId, categoriaId);
      }
    }
  };

  // Função para excluir subcategoria com confirmação
  const excluirSubcategoria = async (sub: SubcategoriaDB, categoriaId: string) => {
    const contagemSub = getContagemSubcategoria(categoriaId, sub.id);

    if (contagemSub > 0) {
      const confirmacao = window.confirm(
        `A subcategoria "${sub.nome}" possui ${contagemSub} item(ns) vinculados.\n\nSe continuar, os itens ficarão SEM subcategoria.\n\nDeseja excluir mesmo assim?`
      );
      if (!confirmacao) return;
    } else {
      const confirmacao = window.confirm(
        `Deseja excluir a subcategoria "${sub.nome}"?`
      );
      if (!confirmacao) return;
    }

    setSalvando(true);
    try {
      await deletarSubcategoria(sub.id);
      toast({
        title: "Subcategoria excluída",
        description: `"${sub.nome}" foi removida com sucesso.`,
      });
      await carregarDadosMantendoScroll();
    } catch (error) {
      console.error("Erro ao excluir subcategoria:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a subcategoria.",
        variant: "destructive",
      });
    } finally {
      setSalvando(false);
    }
  };

  // ============================================================
  // FILTROS
  // ============================================================

  const categoriasFiltradas = categoriasDB.filter(cat => {
    if (!busca) return true;
    const termo = busca.toLowerCase();
    return (
      cat.nome.toLowerCase().includes(termo) ||
      (cat.codigo || "").toLowerCase().includes(termo)
    );
  });

  // ============================================================
  // DRAG & DROP HANDLERS
  // ============================================================

  const handleDragStart = (e: React.DragEvent, id: string, type: "categoria" | "subcategoria") => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", JSON.stringify({ id, type }));
    setDragState(prev => ({ ...prev, draggedId: id, draggedType: type }));
    setIsDragging(true);

    // Add drag image
    const dragElement = e.currentTarget as HTMLElement;
    if (dragElement) {
      e.dataTransfer.setDragImage(dragElement, 20, 20);
    }
  };

  const handleDragEnd = () => {
    setDragState({
      draggedId: null,
      draggedType: null,
      overId: null,
      overType: null,
      overPosition: null,
    });
    setIsDragging(false);
    dragCounter.current = 0;
  };

  const handleDragOver = (e: React.DragEvent, id: string, type: "categoria" | "subcategoria") => {
    e.preventDefault();
    e.stopPropagation();

    if (dragState.draggedId === id) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;

    let position: "top" | "bottom" | "center";
    // Zonas: top (0-15%), center (15-85%), bottom (85-100%)
    // Centro maior para facilitar conversão em subcategoria
    if (y < height * 0.15) {
      position = "top";
    } else if (y > height * 0.85) {
      position = "bottom";
    } else {
      position = "center";
    }

    setDragState(prev => ({
      ...prev,
      overId: id,
      overType: type,
      overPosition: position,
    }));
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragState(prev => ({
        ...prev,
        overId: null,
        overType: null,
        overPosition: null,
      }));
    }
  };

  // ============================================================
  // FUNÇÕES DE RECÁLCULO EM CASCATA
  // ============================================================

  /**
   * Recalcula e atualiza a ordem e código de todas as categorias afetadas
   * Retorna um relatório das mudanças realizadas
   */
  const recalcularOrdensEmCascata = async (
    categoriasReordenadas: CategoriaDB[]
  ): Promise<{ alteradas: string[]; detalhes: string[] }> => {
    const alteradas: string[] = [];
    const detalhes: string[] = [];

    for (let i = 0; i < categoriasReordenadas.length; i++) {
      const cat = categoriasReordenadas[i];
      const novaOrdem = i + 1;
      const ordemAnterior = cat.ordem || 0;

      // Verificar se houve mudança
      if (ordemAnterior !== novaOrdem) {
        // Atualizar ordem da categoria
        await atualizarCategoria(cat.id, { ordem: novaOrdem });

        alteradas.push(cat.nome);
        detalhes.push(`${cat.nome}: ${String(ordemAnterior).padStart(2, "0")} → ${String(novaOrdem).padStart(2, "0")}`);
      }
    }

    return { alteradas, detalhes };
  };

  const handleDrop = async (e: React.DragEvent, targetId: string, targetType: "categoria" | "subcategoria") => {
    e.preventDefault();
    e.stopPropagation();

    if (!dragState.draggedId || dragState.draggedId === targetId) {
      handleDragEnd();
      return;
    }

    const draggedCategoria = categoriasDB.find(c => c.id === dragState.draggedId);
    if (!draggedCategoria) {
      handleDragEnd();
      return;
    }

    const targetCategoria = categoriasDB.find(c => c.id === targetId);
    if (!targetCategoria) {
      handleDragEnd();
      return;
    }

    setSalvando(true);
    try {
      if (dragState.overPosition === "center" && targetType === "categoria") {
        // DROP NO CENTRO = Tornar subcategoria

        // Verificar se não está tentando tornar uma categoria subcategoria de si mesma
        if (draggedCategoria.id === targetId) {
          toast({
            title: "Operação inválida",
            description: "Não é possível tornar uma categoria subcategoria de si mesma.",
            variant: "destructive",
          });
          handleDragEnd();
          setSalvando(false);
          return;
        }

        // Verificar se já existe subcategoria com mesmo nome na categoria alvo
        const existentesSubcats = getSubcategoriasDaCategoria(targetId);
        const subcatDuplicada = existentesSubcats.find(
          s => s.nome.toLowerCase().trim() === draggedCategoria.nome.toLowerCase().trim()
        );

        if (subcatDuplicada) {
          toast({
            title: "Subcategoria já existe",
            description: `A categoria "${targetCategoria.nome}" já possui uma subcategoria "${subcatDuplicada.nome}". Escolha outro nome ou mova para outra categoria.`,
            variant: "destructive",
          });
          handleDragEnd();
          setSalvando(false);
          return;
        }

        // Verificar se a categoria arrastada tem itens
        const totalItens = getContagemCategoria(draggedCategoria.id);

        const ordemNova = existentesSubcats.length > 0
          ? Math.max(...existentesSubcats.map(s => s.ordem || 0)) + 10
          : 10;

        // Criar subcategoria
        const novaSubcat = await criarSubcategoria({
          categoria_id: targetId,
          nome: draggedCategoria.nome,
          tipo: draggedCategoria.tipo as any || "material",
          ordem: ordemNova,
          ativo: true,
        });

        // Mover TODOS os itens para a nova subcategoria (incluindo itens de subcategorias)
        if (novaSubcat?.id) {
          // Buscar subcategorias DIRETAMENTE do banco (não do estado React)
          const { data: subsDoDb } = await supabase
            .from("pricelist_subcategorias")
            .select("id")
            .eq("categoria_id", draggedCategoria.id);

          const subsParaExcluir = subsDoDb || [];

          // Primeiro: mover TODOS os itens da categoria arrastada para a nova subcategoria
          // (independente de subcategoria)
          await supabase
            .from("pricelist_itens")
            .update({
              categoria_id: targetId,
              subcategoria_id: novaSubcat.id,
            })
            .eq("categoria_id", draggedCategoria.id);

          // Depois: excluir subcategorias antigas (já sem itens vinculados)
          for (const sub of subsParaExcluir) {
            try {
              await deletarSubcategoria(sub.id);
            } catch (err) {
              console.warn(`Não foi possível excluir subcategoria ${sub.id}:`, err);
            }
          }
        }

        // Excluir a categoria original
        await deletarCategoria(draggedCategoria.id);

        // RECÁLCULO EM CASCATA: Atualizar ordem das categorias restantes
        const categoriasRestantes = categoriasDB
          .filter(c => c.id !== draggedCategoria.id)
          .sort((a, b) => (a.ordem || 0) - (b.ordem || 0));

        const { alteradas, detalhes } = await recalcularOrdensEmCascata(categoriasRestantes);

        toast({
          title: "Categoria convertida",
          description: `"${draggedCategoria.nome}" agora é subcategoria de "${targetCategoria.nome}"${totalItens > 0 ? ` com ${totalItens} item(ns) transferido(s)` : ""}.${alteradas.length > 0 ? ` ${alteradas.length} categoria(s) reordenada(s).` : ""}`,
        });

        // Se houve muitas alterações, mostrar detalhes
        if (detalhes.length > 0) {
          console.log("Categorias reordenadas:", detalhes.join(", "));
        }
      } else {
        // DROP EM CIMA OU EMBAIXO = Reordenar
        const categoriasOrdenadas = [...categoriasDB].sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
        const draggedIndex = categoriasOrdenadas.findIndex(c => c.id === dragState.draggedId);
        const targetIndex = categoriasOrdenadas.findIndex(c => c.id === targetId);

        if (draggedIndex === -1 || targetIndex === -1) {
          handleDragEnd();
          setSalvando(false);
          return;
        }

        // Calcular nova posição
        let newIndex = targetIndex;
        if (dragState.overPosition === "bottom") {
          newIndex = targetIndex + 1;
        }
        if (draggedIndex < targetIndex && dragState.overPosition !== "bottom") {
          newIndex = targetIndex - 1;
        }

        // Reordenar array
        const reordered = [...categoriasOrdenadas];
        const [removed] = reordered.splice(draggedIndex, 1);
        reordered.splice(newIndex, 0, removed);

        // RECÁLCULO EM CASCATA: Atualizar ordens de TODAS as categorias afetadas
        const { alteradas, detalhes } = await recalcularOrdensEmCascata(reordered);

        // Gerar mensagem detalhada
        const ordemAnterior = draggedCategoria.ordem || 0;
        const ordemNova = newIndex + 1;

        toast({
          title: "Ordem atualizada em cascata",
          description: `"${draggedCategoria.nome}": ${String(ordemAnterior).padStart(2, "0")} → ${String(ordemNova).padStart(2, "0")}. ${alteradas.length} categoria(s) atualizadas.`,
        });

        // Mostrar relatório detalhado se houve múltiplas alterações
        if (detalhes.length > 1) {
          setRelatorioMudancas({
            visivel: true,
            titulo: `${detalhes.length} códigos atualizados em cascata`,
            detalhes: detalhes,
          });
        }
      }

      await carregarDadosMantendoScroll();
    } catch (error) {
      console.error("Erro ao mover categoria:", error);
      toast({
        title: "Erro",
        description: "Não foi possível mover a categoria.",
        variant: "destructive",
      });
    } finally {
      setSalvando(false);
      handleDragEnd();
    }
  };

  // Gera classe CSS para feedback visual durante drag
  const getDragFeedbackClass = (categoriaId: string) => {
    if (!isDragging) return "";
    if (dragState.draggedId === categoriaId) return "opacity-50 scale-95";
    if (dragState.overId === categoriaId) {
      if (dragState.overPosition === "center") {
        return "ring-2 ring-[#F25C26] ring-offset-2 bg-orange-50";
      }
      return "";
    }
    return "";
  };

  // Gera estilos para indicador de drop
  const getDropIndicatorStyle = (categoriaId: string) => {
    if (dragState.overId === categoriaId && dragState.overPosition === "top") {
      return { borderTop: "3px solid #F25C26" };
    }
    if (dragState.overId === categoriaId && dragState.overPosition === "bottom") {
      return { borderBottom: "3px solid #F25C26" };
    }
    return {};
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                title="Voltar"
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-[#F25C26]" />
                <h1 className="text-lg font-semibold text-gray-900">
                  Categorias e Subcategorias
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={carregarDados}
                disabled={loading}
                className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Atualizar
              </button>

              <button
                type="button"
                onClick={iniciarNovaCategoria}
                disabled={salvando || novaCategoria}
                className="px-4 py-2 bg-[#F25C26] text-white rounded-lg hover:bg-[#e04a1a] flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nova Categoria
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#F25C26] animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Barra de Busca */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar categoria..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div className="text-sm text-gray-600 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                {categoriasDB.length} categorias | {subcategoriasDB.length} subcategorias
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* Formato de Código */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Formato do Código:</strong>{" "}
                  <code className="bg-blue-100 px-2 py-0.5 rounded">ORDEM/CAT/SUBCAT#NNN</code>
                  {" "}→ Ex: <code className="bg-blue-100 px-2 py-0.5 rounded">004/PRO/MDO#001</code>
                </p>
              </div>

              {/* Instruções Drag & Drop */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800">
                  <strong>
                    <GripVertical className="w-3 h-3 inline mr-1" />
                    Arraste cards
                  </strong>{" "}
                  para reordenar • Solte <strong>no centro</strong> de outra categoria para transformá-la em subcategoria
                </p>
              </div>
            </div>

            {/* Relatório de Mudanças em Cascata */}
            {relatorioMudancas.visivel && (
              <div className="bg-green-50 border border-green-300 rounded-lg p-4 relative">
                <button
                  type="button"
                  onClick={() => setRelatorioMudancas({ visivel: false, titulo: "", detalhes: [] })}
                  className="absolute top-2 right-2 p-1 text-green-600 hover:bg-green-100 rounded"
                  title="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-800 mb-2">{relatorioMudancas.titulo}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
                      {relatorioMudancas.detalhes.map((detalhe, idx) => (
                        <div
                          key={idx}
                          className="text-xs bg-white px-2 py-1 rounded border border-green-200 text-green-700 font-mono"
                        >
                          {detalhe}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-green-600 mt-2">
                      Os códigos das subcategorias foram atualizados automaticamente.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Formulário Nova Categoria */}
            {novaCategoria && (
              <div className="bg-white rounded-lg shadow-sm border-2 border-[#F25C26] p-4">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-[#F25C26]" />
                  Nova Categoria
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Nome *</label>
                    <input
                      type="text"
                      value={formCategoria.nome}
                      onChange={(e) => {
                        const nome = e.target.value;
                        // Auto-gerar código e cor baseado no nome
                        const codigoAuto = getCodigoCategoria(nome);
                        const corAuto = getCorCategoria(nome);
                        setFormCategoria(f => ({
                          ...f,
                          nome,
                          codigo: codigoAuto,
                          cor: corAuto,
                        }));
                      }}
                      placeholder="Ex: Hidrossanitária"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Código (auto)</label>
                    <input
                      type="text"
                      value={formCategoria.codigo}
                      readOnly
                      placeholder="Gerado automaticamente"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono bg-gray-50 text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
                    <select
                      value={formCategoria.tipo}
                      onChange={(e) => setFormCategoria(f => ({ ...f, tipo: e.target.value }))}
                      title="Tipo da categoria"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="material">Material</option>
                      <option value="mao_obra">Mão de Obra</option>
                      <option value="servico">Serviço</option>
                      <option value="produto">Produto</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Ordem</label>
                    <input
                      type="number"
                      value={formCategoria.ordem}
                      onChange={(e) => setFormCategoria(f => ({ ...f, ordem: parseInt(e.target.value) || 0 }))}
                      min={0}
                      title="Ordem da categoria"
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Cor (auto/ajustável)</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formCategoria.cor}
                        onChange={(e) => setFormCategoria(f => ({ ...f, cor: e.target.value }))}
                        title="Selecionar cor"
                        className="w-10 h-9 rounded border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formCategoria.cor}
                        onChange={(e) => setFormCategoria(f => ({ ...f, cor: e.target.value }))}
                        title="Código da cor em hexadecimal"
                        placeholder="#6B7280"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">Cor aplicada do config ou ajuste manualmente</p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={cancelarEdicao}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={salvarCategoria}
                    disabled={salvando}
                    className="px-4 py-2 bg-[#F25C26] text-white rounded-lg hover:bg-[#e04a1a] flex items-center gap-2"
                  >
                    {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Criar com Subcategorias
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  * Ao criar a categoria, as {SUBCATEGORIAS_PADRAO.length} subcategorias padrão serão adicionadas automaticamente.
                </p>
              </div>
            )}

            {/* Instrução Drag & Drop */}
            {isDragging && (
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-3 flex items-center gap-3">
                <Move className="w-5 h-5 text-[#F25C26]" />
                <div className="text-sm">
                  <span className="font-medium text-gray-900">Arraste para reordenar</span>
                  <span className="text-gray-600 mx-2">•</span>
                  <span className="text-gray-600">Solte <strong>no centro</strong> de outra categoria para transformar em subcategoria</span>
                </div>
              </div>
            )}

            {/* Lista de Categorias */}
            <div className="space-y-3">
              {categoriasFiltradas.map((cat) => {
                const isExpanded = expandidas.has(cat.id);
                const isEditing = editandoCategoria === cat.id;
                const subcategorias = getSubcategoriasDaCategoria(cat.id);
                const totalItens = getContagemCategoria(cat.id);
                const corCategoria = cat.cor || getCorCategoria(cat.nome);
                const codigoCat = cat.codigo || getCodigoCategoria(cat.nome);
                const isDraggedItem = dragState.draggedId === cat.id;
                const isDropTarget = dragState.overId === cat.id && !isDraggedItem;

                return (
                  <div
                    key={cat.id}
                    draggable={!isEditing && !novaCategoria}
                    onDragStart={(e) => handleDragStart(e, cat.id, "categoria")}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, cat.id, "categoria")}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, cat.id, "categoria")}
                    className={`bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-200 ${getDragFeedbackClass(cat.id)} ${!isEditing && !novaCategoria ? "cursor-grab active:cursor-grabbing" : ""}`}
                    style={getDropIndicatorStyle(cat.id)}
                  >
                    {/* Header da Categoria */}
                    {isEditing ? (
                      // Modo Edição
                      <div className="p-4 border-l-4" style={{ borderColor: formCategoria.cor }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Nome</label>
                            <input
                              type="text"
                              value={formCategoria.nome}
                              onChange={(e) => {
                                const nome = e.target.value;
                                // Só auto-gerar código se for categoria NOVA
                                // Se editando existente, manter código original
                                setFormCategoria(f => ({
                                  ...f,
                                  nome,
                                }));
                              }}
                              title="Nome da categoria"
                              placeholder="Nome da categoria"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Código (auto)</label>
                            <input
                              type="text"
                              value={formCategoria.codigo}
                              readOnly
                              title="Código gerado automaticamente"
                              placeholder="Auto"
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono bg-gray-50 text-gray-600"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
                            <select
                              value={formCategoria.tipo}
                              onChange={(e) => setFormCategoria(f => ({ ...f, tipo: e.target.value }))}
                              title="Tipo da categoria"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            >
                              <option value="material">Material</option>
                              <option value="mao_obra">Mão de Obra</option>
                              <option value="servico">Serviço</option>
                              <option value="produto">Produto</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Ordem</label>
                            <input
                              type="number"
                              value={formCategoria.ordem}
                              onChange={(e) => setFormCategoria(f => ({ ...f, ordem: parseInt(e.target.value) || 0 }))}
                              min={0}
                              title="Ordem da categoria"
                              placeholder="0"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Cor</label>
                            <div className="flex gap-1">
                              <input
                                type="color"
                                value={formCategoria.cor}
                                onChange={(e) => setFormCategoria(f => ({ ...f, cor: e.target.value }))}
                                title="Selecionar cor"
                                className="w-10 h-9 rounded border border-gray-300 cursor-pointer"
                              />
                              <input
                                type="text"
                                value={formCategoria.cor}
                                onChange={(e) => setFormCategoria(f => ({ ...f, cor: e.target.value }))}
                                title="Código da cor em hexadecimal"
                                placeholder="#6B7280"
                                className="flex-1 px-2 py-2 border border-gray-300 rounded-lg text-xs font-mono w-20"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Aplicar Config</label>
                            <button
                              type="button"
                              onClick={() => {
                                const corConfig = getCorCategoria(formCategoria.nome);
                                setFormCategoria(f => ({ ...f, cor: corConfig }));
                                toast({
                                  title: "Cor aplicada",
                                  description: `Cor do config: ${corConfig}`,
                                });
                              }}
                              className="w-full px-3 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg text-xs hover:bg-blue-100 flex items-center justify-center gap-1"
                            >
                              <Palette className="w-3 h-3" />
                              Usar cor do config
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                          <button
                            type="button"
                            onClick={cancelarEdicao}
                            className="px-3 py-1.5 text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-1 text-sm"
                          >
                            <X className="w-4 h-4" />
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={salvarCategoria}
                            disabled={salvando}
                            className="px-3 py-1.5 bg-[#F25C26] text-white rounded-lg hover:bg-[#e04a1a] flex items-center gap-1 text-sm"
                          >
                            {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            Salvar
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Modo Visualização
                      <div
                        className={`flex items-center justify-between p-3 hover:bg-gray-50 border-l-4 transition-colors ${isDropTarget && dragState.overPosition === "center" ? "bg-orange-50" : ""}`}
                        style={{ borderColor: corCategoria }}
                      >
                        {/* Área clicável para expansão */}
                        <div
                          className="flex items-center gap-3 flex-1 cursor-pointer"
                          onClick={() => toggleExpansao(cat.id)}
                        >
                          {/* Grip para arrastar */}
                          <div
                            className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing p-1 -ml-1"
                            title="Arraste para reordenar"
                          >
                            <GripVertical className="w-4 h-4" />
                          </div>

                          <div className="text-gray-400">
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5" />
                            ) : (
                              <ChevronRight className="w-5 h-5" />
                            )}
                          </div>

                          {/* Quadrado com número e cor padronizada */}
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm"
                            style={{ backgroundColor: corCategoria }}
                          >
                            {String(cat.ordem || 0).padStart(2, "0")}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-gray-900">{cat.nome}</span>
                              <span
                                className="font-mono text-xs px-2 py-0.5 rounded font-semibold"
                                style={{ backgroundColor: corCategoria + "20", color: corCategoria }}
                              >
                                {codigoCat}
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                                {cat.tipo || "material"}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                              <span>{subcategorias.length} subcategorias</span>
                              <span>•</span>
                              <span>{totalItens} itens</span>
                              {!cat.ativo && (
                                <>
                                  <span>•</span>
                                  <span className="text-red-500">Inativo</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Indicador visual de drop no centro */}
                        {isDropTarget && dragState.overPosition === "center" && (
                          <div className="flex items-center gap-2 px-3 py-1 bg-[#F25C26] text-white rounded-full text-xs font-medium animate-pulse">
                            <ArrowDownToLine className="w-3 h-3" />
                            Solte para subcategoria
                          </div>
                        )}

                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => iniciarEdicaoCategoria(cat)}
                            className="p-2 text-gray-400 hover:text-[#F25C26] hover:bg-gray-100 rounded-lg transition-colors"
                            title="Editar categoria"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => excluirCategoria(cat)}
                            disabled={salvando}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir categoria"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Subcategorias Expandidas - Sistema de Abas */}
                    {isExpanded && !isEditing && (
                      <div className="border-t border-gray-200 bg-gray-50">
                        {/* Header com abas de navegação */}
                        <div className="flex items-center justify-between px-3 pt-2 pb-0 border-b border-gray-200 bg-white">
                          <div className="flex items-center gap-1 overflow-x-auto flex-1" style={{ scrollbarWidth: "none" }}>
                            {/* Aba Raiz */}
                            <button
                              type="button"
                              onClick={() => alternarAbaCategoria(cat.id, "raiz")}
                              className={`px-3 py-2 text-xs font-medium rounded-t-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                                abaAtivaPorCategoria[cat.id] === "raiz" || !abaAtivaPorCategoria[cat.id]
                                  ? "bg-gray-50 border border-b-0 border-gray-200 -mb-px"
                                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                              }`}
                              style={
                                abaAtivaPorCategoria[cat.id] === "raiz" || !abaAtivaPorCategoria[cat.id]
                                  ? { color: corCategoria }
                                  : {}
                              }
                            >
                              <Package className="w-3 h-3" />
                              <span>Categoria Raiz</span>
                              <span
                                className="text-[10px] px-1.5 py-0.5 rounded-full"
                                style={{ backgroundColor: corCategoria + "20", color: corCategoria }}
                              >
                                {getContagemSubcategoria(cat.id, null)}
                              </span>
                            </button>

                            {/* Abas de Subcategorias */}
                            {subcategorias.map((sub) => {
                              const prefixoSub = SUBCATEGORIAS_PADRAO.find(
                                s => s.nome.toLowerCase() === sub.nome.toLowerCase()
                              )?.prefixo || sub.nome.substring(0, 3).toUpperCase();
                              const contagemSub = getContagemSubcategoria(cat.id, sub.id);
                              const isActive = abaAtivaPorCategoria[cat.id] === sub.id;

                              return (
                                <button
                                  key={sub.id}
                                  type="button"
                                  onClick={() => alternarAbaCategoria(cat.id, sub.id)}
                                  className={`px-3 py-2 text-xs font-medium rounded-t-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                                    isActive
                                      ? "bg-gray-50 border border-b-0 border-gray-200 -mb-px"
                                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                                  }`}
                                  style={isActive ? { color: corCategoria } : {}}
                                >
                                  <span
                                    className="w-5 h-5 rounded flex items-center justify-center text-white text-[8px] font-bold"
                                    style={{ backgroundColor: corCategoria }}
                                  >
                                    {prefixoSub}
                                  </span>
                                  <span className="hidden sm:inline">{sub.nome}</span>
                                  <span
                                    className="text-[10px] px-1.5 py-0.5 rounded-full"
                                    style={{ backgroundColor: corCategoria + "20", color: corCategoria }}
                                  >
                                    {contagemSub}
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Botão adicionar subcategorias padrão */}
                          {subcategorias.length < SUBCATEGORIAS_PADRAO.length && (
                            <button
                              type="button"
                              onClick={() => adicionarSubcategoriaPadrao(cat.id, cat)}
                              disabled={salvando}
                              className="text-xs px-2 py-1 text-[#F25C26] hover:bg-[#F25C26]/10 rounded flex items-center gap-1 shrink-0 ml-2"
                            >
                              <Plus className="w-3 h-3" />
                              <span className="hidden md:inline">Adicionar Padrão</span>
                            </button>
                          )}
                        </div>

                        {/* Conteúdo da aba ativa */}
                        <div className="p-3">
                          {/* Aba Raiz - Itens sem subcategoria */}
                          {(abaAtivaPorCategoria[cat.id] === "raiz" || !abaAtivaPorCategoria[cat.id]) && (
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                              {/* Header com seleção múltipla */}
                              <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    {(itensRaiz[cat.id] || []).length > 0 && (
                                      <button
                                        type="button"
                                        onClick={() => selecionarTodos(cat.id)}
                                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                          (itensRaiz[cat.id] || []).length > 0 &&
                                          (itensRaiz[cat.id] || []).every(item =>
                                            (itensSelecionados[cat.id] || new Set()).has(item.id)
                                          )
                                            ? "bg-[#F25C26] border-[#F25C26] text-white"
                                            : "border-gray-300 hover:border-[#F25C26]"
                                        }`}
                                        title="Selecionar todos"
                                      >
                                        {(itensRaiz[cat.id] || []).length > 0 &&
                                          (itensRaiz[cat.id] || []).every(item =>
                                            (itensSelecionados[cat.id] || new Set()).has(item.id)
                                          ) && <Check className="w-3 h-3" />}
                                      </button>
                                    )}
                                    <span className="text-xs font-medium text-gray-700">
                                      Itens sem subcategoria
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {carregandoRaiz === cat.id && (
                                      <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
                                    )}
                                  </div>
                                </div>

                                {/* Barra de ações quando há itens selecionados */}
                                {getQtdSelecionados(cat.id) > 0 && (
                                  <div className="mt-2 flex items-center gap-2 p-2 bg-[#F25C26]/10 rounded-lg flex-wrap">
                                    <span className="text-xs font-semibold text-[#F25C26]">
                                      {getQtdSelecionados(cat.id)} selecionado(s)
                                    </span>
                                    <span className="text-gray-300">|</span>
                                    {subcategorias.length > 0 ? (
                                      <>
                                        <span className="text-xs text-gray-600">Mover para:</span>
                                        <select
                                          className="text-xs px-2 py-1 border border-[#F25C26] rounded bg-white text-gray-700 cursor-pointer focus:ring-1 focus:ring-[#F25C26] focus:outline-none"
                                          defaultValue=""
                                          disabled={salvando}
                                          title="Selecionar subcategoria para mover itens"
                                          onChange={(e) => {
                                            if (e.target.value) {
                                              classificarSelecionados(cat.id, e.target.value);
                                              e.target.value = "";
                                            }
                                          }}
                                        >
                                          <option value="">Escolher subcategoria...</option>
                                          {subcategorias.map((sub) => {
                                            const prefixo = SUBCATEGORIAS_PADRAO.find(
                                              s => s.nome.toLowerCase() === sub.nome.toLowerCase()
                                            )?.prefixo || sub.nome.substring(0, 3).toUpperCase();
                                            return (
                                              <option key={sub.id} value={sub.id}>
                                                [{prefixo}] {sub.nome}
                                              </option>
                                            );
                                          })}
                                        </select>
                                      </>
                                    ) : (
                                      <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                                        Adicione subcategorias primeiro (clique em "+Adicionar Padrão")
                                      </span>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => setItensSelecionados(prev => ({ ...prev, [cat.id]: new Set() }))}
                                      className="text-xs text-gray-500 hover:text-gray-700 px-2"
                                    >
                                      Limpar
                                    </button>
                                  </div>
                                )}

                                {/* Alerta quando não há subcategorias mas tem itens para classificar */}
                                {subcategorias.length === 0 && (itensRaiz[cat.id] || []).length > 0 && getQtdSelecionados(cat.id) === 0 && (
                                  <div className="mt-2 flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                                    <span className="text-xs text-amber-700">
                                      <strong>Dica:</strong> Para classificar os itens, primeiro adicione subcategorias clicando em{" "}
                                      <button
                                        type="button"
                                        onClick={() => adicionarSubcategoriaPadrao(cat.id, cat)}
                                        disabled={salvando}
                                        className="text-[#F25C26] font-semibold hover:underline"
                                      >
                                        +Adicionar Padrão
                                      </button>
                                    </span>
                                  </div>
                                )}
                              </div>

                              {carregandoRaiz === cat.id ? (
                                <div className="flex items-center justify-center py-8">
                                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                                  <span className="ml-2 text-sm text-gray-500">Carregando itens...</span>
                                </div>
                              ) : (itensRaiz[cat.id] || []).length === 0 ? (
                                <div className="text-center py-6 text-gray-400">
                                  <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                  <p className="text-sm">Nenhum item na categoria raiz</p>
                                  <p className="text-xs mt-1">Todos os itens estão organizados em subcategorias</p>
                                </div>
                              ) : (
                                <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
                                  {(itensRaiz[cat.id] || []).map((item, idx) => {
                                    // Badge de tipo
                                    const tipoLabel = {
                                      material: { label: "MAT", bg: "#3B82F6", desc: "Material" },
                                      mao_obra: { label: "MDO", bg: "#10B981", desc: "Mão de Obra" },
                                      servico: { label: "SRV", bg: "#8B5CF6", desc: "Serviço" },
                                      produto: { label: "PRO", bg: "#F59E0B", desc: "Produto" },
                                      insumo: { label: "INS", bg: "#EF4444", desc: "Insumo" },
                                    }[item.tipo] || { label: "OUT", bg: "#6B7280", desc: "Outro" };
                                    const isSelected = (itensSelecionados[cat.id] || new Set()).has(item.id);

                                    return (
                                      <div
                                        key={item.id}
                                        className={`flex items-center justify-between py-2 px-3 hover:bg-gray-50 gap-2 ${
                                          isSelected ? "bg-[#F25C26]/5" : ""
                                        }`}
                                      >
                                        {/* Checkbox + Número + Tipo */}
                                        <div className="flex items-center gap-1.5 shrink-0">
                                          <button
                                            type="button"
                                            onClick={() => toggleSelecaoItem(cat.id, item.id)}
                                            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                              isSelected
                                                ? "bg-[#F25C26] border-[#F25C26] text-white"
                                                : "border-gray-300 hover:border-[#F25C26]"
                                            }`}
                                          >
                                            {isSelected && <Check className="w-3 h-3" />}
                                          </button>
                                          <span
                                            className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded"
                                            style={{ backgroundColor: corCategoria + "15", color: corCategoria }}
                                          >
                                            #{String(idx + 1).padStart(3, "0")}
                                          </span>
                                          {/* Select de Tipo - Clicável */}
                                          <select
                                            value={item.tipo || "material"}
                                            onChange={(e) => atualizarTipoItem(item.id, e.target.value, cat.id)}
                                            className="text-[8px] font-bold px-1 py-0.5 rounded text-white border-0 cursor-pointer appearance-none pr-3 focus:ring-1 focus:ring-white/50 focus:outline-none"
                                            style={{
                                              backgroundColor: tipoLabel.bg,
                                              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                                              backgroundRepeat: "no-repeat",
                                              backgroundPosition: "right 2px center",
                                            }}
                                            title="Clique para alterar o tipo"
                                          >
                                            <option value="material" style={{ backgroundColor: "#3B82F6", color: "white" }}>MAT</option>
                                            <option value="mao_obra" style={{ backgroundColor: "#10B981", color: "white" }}>MDO</option>
                                            <option value="servico" style={{ backgroundColor: "#8B5CF6", color: "white" }}>SRV</option>
                                            <option value="produto" style={{ backgroundColor: "#F59E0B", color: "white" }}>PRO</option>
                                            <option value="insumo" style={{ backgroundColor: "#EF4444", color: "white" }}>INS</option>
                                          </select>
                                        </div>

                                        {/* Nome do item */}
                                        <div className="flex-1 min-w-0">
                                          <span className="text-xs text-gray-700 truncate block">{item.nome}</span>
                                        </div>

                                        {/* Preço */}
                                        <span className="text-xs font-semibold text-gray-600 shrink-0 hidden sm:block">
                                          {(item.preco || 0).toLocaleString("pt-BR", {
                                            style: "currency",
                                            currency: "BRL",
                                          })}
                                        </span>

                                        {/* Select de Subcategoria ou Categoria */}
                                        {subcategorias.length > 0 ? (
                                          <select
                                            className="text-[10px] px-2 py-1 border border-gray-300 rounded bg-white text-gray-700 cursor-pointer hover:border-[#F25C26] focus:border-[#F25C26] focus:ring-1 focus:ring-[#F25C26] focus:outline-none min-w-[100px]"
                                            defaultValue=""
                                            onChange={(e) => {
                                              if (e.target.value) {
                                                atualizarSubcategoriaItem(item.id, e.target.value, cat.id);
                                              }
                                            }}
                                            title="Mover para subcategoria"
                                          >
                                            <option value="">Classificar →</option>
                                            {subcategorias.map((sub) => {
                                              const prefixo = SUBCATEGORIAS_PADRAO.find(
                                                s => s.nome.toLowerCase() === sub.nome.toLowerCase()
                                              )?.prefixo || sub.nome.substring(0, 3).toUpperCase();
                                              return (
                                                <option key={sub.id} value={sub.id}>
                                                  [{prefixo}] {sub.nome}
                                                </option>
                                              );
                                            })}
                                          </select>
                                        ) : (
                                          <select
                                            className="text-[10px] px-2 py-1 border border-amber-300 rounded bg-amber-50 text-gray-700 cursor-pointer hover:border-[#F25C26] focus:border-[#F25C26] focus:ring-1 focus:ring-[#F25C26] focus:outline-none min-w-[110px]"
                                            defaultValue=""
                                            onChange={(e) => {
                                              if (e.target.value) {
                                                moverParaOutraCategoria(item.id, e.target.value, cat.id);
                                              }
                                            }}
                                            title="Mover para outra categoria (sem subcategorias nesta)"
                                          >
                                            <option value="">Mover p/ →</option>
                                            {categoriasDB
                                              .filter(c => c.id !== cat.id) // Excluir categoria atual
                                              .sort((a, b) => (a.ordem || 0) - (b.ordem || 0))
                                              .map((outraCat) => (
                                                <option key={outraCat.id} value={outraCat.id}>
                                                  {String(outraCat.ordem || 0).padStart(2, "0")} {outraCat.nome}
                                                </option>
                                              ))}
                                          </select>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Abas de Subcategorias - Conteúdo */}
                          {subcategorias.map((sub) => {
                            if (abaAtivaPorCategoria[cat.id] !== sub.id) return null;

                            const prefixoSub = SUBCATEGORIAS_PADRAO.find(
                              s => s.nome.toLowerCase() === sub.nome.toLowerCase()
                            )?.prefixo || sub.nome.substring(0, 3).toUpperCase();
                            const contagemSub = getContagemSubcategoria(cat.id, sub.id);
                            const codigoExemplo = gerarCodigoFormatado(cat.ordem || 0, codigoCat, prefixoSub, 1);
                            const itens = itensSubcategoria[sub.id] || [];
                            const isLoadingItems = carregandoItens === sub.id;

                            return (
                              <div key={sub.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                <div className="px-3 py-2 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-6 h-6 rounded flex items-center justify-center text-white text-[9px] font-bold"
                                      style={{ backgroundColor: corCategoria }}
                                    >
                                      {prefixoSub}
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">{sub.nome}</span>
                                    <span className="text-xs text-gray-400 font-mono">{codigoExemplo}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {isLoadingItems && (
                                      <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
                                    )}
                                    <span
                                      className="text-xs px-2 py-0.5 rounded-full font-semibold"
                                      style={{ backgroundColor: corCategoria + "20", color: corCategoria }}
                                    >
                                      {contagemSub} {contagemSub === 1 ? "item" : "itens"}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => excluirSubcategoria(sub, cat.id)}
                                      disabled={salvando}
                                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                      title={`Excluir subcategoria ${sub.nome}`}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                                {isLoadingItems ? (
                                  <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                                    <span className="ml-2 text-sm text-gray-500">Carregando itens...</span>
                                  </div>
                                ) : itens.length === 0 ? (
                                  <div className="text-center py-6 text-gray-400">
                                    <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">Nenhum item cadastrado</p>
                                  </div>
                                ) : (
                                  <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                                    {itens.map((item, idx) => (
                                      <div
                                        key={item.id}
                                        className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 gap-2"
                                      >
                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                          <span
                                            className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded shrink-0"
                                            style={{ backgroundColor: corCategoria + "15", color: corCategoria }}
                                          >
                                            #{String(idx + 1).padStart(3, "0")}
                                          </span>
                                          <span className="text-xs text-gray-700 truncate">{item.nome}</span>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                          <span className="text-xs text-gray-400 hidden sm:inline">{item.unidade}</span>
                                          <span className="text-xs font-semibold text-gray-600 hidden sm:inline">
                                            {(item.preco || 0).toLocaleString("pt-BR", {
                                              style: "currency",
                                              currency: "BRL",
                                            })}
                                          </span>
                                          {/* Select para mover para outra subcategoria */}
                                          <select
                                            className="text-[10px] px-2 py-1 border border-gray-300 rounded bg-white text-gray-700 cursor-pointer hover:border-[#F25C26] focus:border-[#F25C26] focus:ring-1 focus:ring-[#F25C26] focus:outline-none min-w-[90px]"
                                            defaultValue=""
                                            onChange={(e) => {
                                              if (e.target.value) {
                                                reclassificarItem(item.id, e.target.value, sub.id, cat.id);
                                                e.target.value = "";
                                              }
                                            }}
                                            title="Mover para outra subcategoria"
                                          >
                                            <option value="">Mover →</option>
                                            {subcategorias
                                              .filter(s => s.id !== sub.id) // Excluir subcategoria atual
                                              .map((outraSub) => {
                                                const prefixoOutra = SUBCATEGORIAS_PADRAO.find(
                                                  s => s.nome.toLowerCase() === outraSub.nome.toLowerCase()
                                                )?.prefixo || outraSub.nome.substring(0, 3).toUpperCase();
                                                return (
                                                  <option key={outraSub.id} value={outraSub.id}>
                                                    [{prefixoOutra}] {outraSub.nome}
                                                  </option>
                                                );
                                              })}
                                          </select>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {/* Mensagem quando não há subcategorias */}
                          {subcategorias.length === 0 && (
                            <div className="text-center py-6 text-gray-500 bg-white rounded-lg border border-gray-200">
                              <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
                              <p className="text-sm mb-2">Nenhuma subcategoria cadastrada</p>
                              <button
                                type="button"
                                onClick={() => adicionarSubcategoriaPadrao(cat.id, cat)}
                                disabled={salvando}
                                className="text-xs text-[#F25C26] hover:underline"
                              >
                                Adicionar subcategorias padrão
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {categoriasFiltradas.length === 0 && !loading && (
              <div className="text-center py-10 text-gray-500">
                <FolderTree className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma categoria encontrada</p>
              </div>
            )}

            {/* Legenda Subcategorias Padrão */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#F25C26]" />
                Subcategorias Padrão do Sistema
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                {SUBCATEGORIAS_PADRAO.map((sub) => (
                  <div key={sub.prefixo} className="p-2 bg-gray-50 rounded border border-gray-200 text-center">
                    <p className="font-mono text-lg font-bold text-[#F25C26]">{sub.prefixo}</p>
                    <p className="text-xs font-medium text-gray-900">{sub.nome}</p>
                    <p className="text-[10px] text-gray-500 truncate" title={sub.descricao}>{sub.descricao}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
