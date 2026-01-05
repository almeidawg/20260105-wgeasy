// ============================================================
// FORMULÁRIO DE MODELO DE CONTRATO
// Sistema WG Easy - Grupo WG Almeida
// Editor com variáveis dinâmicas e cláusulas
// ============================================================

import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Save,
  ArrowLeft,
  Building2,
  FileText,
  Variable,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Eye,
  Code,
  Info,
  AlertCircle,
  Check,
  Copy,
} from "lucide-react";
import { supabaseRaw as supabase } from "@/lib/supabaseClient";
import { listarEmpresas as listarEmpresasGrupo } from "@/lib/empresasApi";

/* ==================== TIPOS ==================== */

type NucleoContrato = "arquitetura" | "engenharia" | "marcenaria" | "produtos" | "materiais" | "empreitada" | "geral";

type Clausula = {
  numero: number;
  titulo: string;
  tipo: string;
  conteudo: string;
  obrigatoria: boolean;
};

type VariavelSistema = {
  id: string;
  codigo: string;
  nome: string;
  descricao: string;
  categoria: string;
  exemplo: string;
};

type Empresa = {
  id: string;
  razao_social: string;
  nome_fantasia?: string;
  nucleo_nome?: string;
};

/* ==================== CONSTANTES ==================== */

const NUCLEOS = [
  { value: "arquitetura", label: "🏛️ Arquitetura" },
  { value: "engenharia", label: "⚙️ Engenharia" },
  { value: "marcenaria", label: "🪵 Marcenaria" },
  { value: "produtos", label: "🛒 Produtos" },
  { value: "materiais", label: "🧰 Materiais" },
  { value: "empreitada", label: "🔨 Empreitada" },
  { value: "geral", label: "📄 Geral" },
];

const TIPOS_CLAUSULA = [
  { value: "objeto", label: "Objeto e Descrição" },
  { value: "prazo", label: "Prazo de Execução" },
  { value: "preco", label: "Preço e Honorários" },
  { value: "pagamento", label: "Forma de Pagamento" },
  { value: "obrigacoes_contratante", label: "Obrigações do Contratante" },
  { value: "obrigacoes_contratada", label: "Obrigações da Contratada" },
  { value: "garantia", label: "Garantia" },
  { value: "rescisao", label: "Rescisão" },
  { value: "penalidades", label: "Penalidades" },
  { value: "foro", label: "Foro" },
  { value: "disposicoes_gerais", label: "Disposições Gerais" },
  { value: "personalizada", label: "Cláusula Personalizada" },
];

/* ==================== COMPONENTE PRINCIPAL ==================== */

export default function ModeloContratoFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdicao = Boolean(id);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Estados do formulário
  const [formData, setFormData] = useState({
    codigo: "",
    nome: "",
    descricao: "",
    empresa_id: "",
    nucleo: "geral" as NucleoContrato,
    conteudo_html: "",
    prazo_execucao_padrao: 90,
    prorrogacao_padrao: 30,
  });

  const [clausulas, setClausulas] = useState<Clausula[]>([]);
  const [variaveisObrigatorias, setVariaveisObrigatorias] = useState<string[]>([]);

  // Estados auxiliares
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [variaveis, setVariaveis] = useState<VariavelSistema[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"editor" | "clausulas" | "variaveis" | "preview">("editor");
  const [categoriaVariavelAberta, setCategoriaVariavelAberta] = useState<string | null>("pessoa");
  const [previewHtml, setPreviewHtml] = useState("");

  // Carregar dados iniciais
  useEffect(() => {
    carregarDadosIniciais();
  }, [id]);

  async function carregarDadosIniciais() {
    setLoading(true);
    try {
      // Carregar empresas do grupo WG Almeida
      const empresasData = await listarEmpresasGrupo();
      setEmpresas(empresasData);

      // Carregar variáveis do sistema
      const { data: variaveisData } = await supabase
        .from("juridico_variaveis")
        .select("*")
        .eq("ativa", true)
        .order("categoria, nome");

      setVariaveis(variaveisData || []);

      // Se for edição, carregar modelo existente
      if (id) {
        const { data: modelo, error } = await supabase
          .from("juridico_modelos_contrato")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        if (modelo) {
          setFormData({
            codigo: modelo.codigo,
            nome: modelo.nome,
            descricao: modelo.descricao || "",
            empresa_id: modelo.empresa_id || "",
            nucleo: modelo.nucleo,
            conteudo_html: modelo.conteudo_html,
            prazo_execucao_padrao: modelo.prazo_execucao_padrao,
            prorrogacao_padrao: modelo.prorrogacao_padrao,
          });
          setClausulas(modelo.clausulas || []);
          setVariaveisObrigatorias(modelo.variaveis_obrigatorias || []);
        }
      } else {
        // Gerar código automático para novo modelo
        const timestamp = Date.now().toString(36).toUpperCase();
        setFormData((prev) => ({
          ...prev,
          codigo: `MOD-${timestamp}`,
        }));
      }
    } catch (error: any) {
      console.error("Erro ao carregar dados:", error);
      alert("Erro ao carregar dados: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  // Inserir variável no editor
  function inserirVariavel(codigo: string) {
    if (!editorRef.current) return;

    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.conteudo_html;
    const variavel = `{{${codigo}}}`;

    const newText = text.substring(0, start) + variavel + text.substring(end);
    setFormData({ ...formData, conteudo_html: newText });

    // Focar e posicionar cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + variavel.length, start + variavel.length);
    }, 0);

    // Adicionar às variáveis obrigatórias se não existir
    if (!variaveisObrigatorias.includes(codigo)) {
      setVariaveisObrigatorias([...variaveisObrigatorias, codigo]);
    }
  }

  // Adicionar cláusula
  function adicionarClausula() {
    const novaClausula: Clausula = {
      numero: clausulas.length + 1,
      titulo: "",
      tipo: "personalizada",
      conteudo: "",
      obrigatoria: false,
    };
    setClausulas([...clausulas, novaClausula]);
  }

  // Atualizar cláusula
  function atualizarClausula(index: number, campo: keyof Clausula, valor: any) {
    const novasClausulas = [...clausulas];
    novasClausulas[index] = { ...novasClausulas[index], [campo]: valor };
    setClausulas(novasClausulas);
  }

  // Remover cláusula
  function removerClausula(index: number) {
    if (!confirm("Deseja remover esta cláusula?")) return;
    const novasClausulas = clausulas.filter((_, i) => i !== index);
    // Renumerar
    novasClausulas.forEach((c, i) => (c.numero = i + 1));
    setClausulas(novasClausulas);
  }

  // Mover cláusula
  function moverClausula(index: number, direcao: "up" | "down") {
    if (
      (direcao === "up" && index === 0) ||
      (direcao === "down" && index === clausulas.length - 1)
    ) {
      return;
    }

    const novasClausulas = [...clausulas];
    const novoIndex = direcao === "up" ? index - 1 : index + 1;

    [novasClausulas[index], novasClausulas[novoIndex]] = [
      novasClausulas[novoIndex],
      novasClausulas[index],
    ];

    // Renumerar
    novasClausulas.forEach((c, i) => (c.numero = i + 1));
    setClausulas(novasClausulas);
  }

  // Gerar preview
  function gerarPreview() {
    let html = formData.conteudo_html;

    // Substituir variáveis por exemplos
    variaveis.forEach((v) => {
      const regex = new RegExp(`\\{\\{${v.codigo}\\}\\}`, "g");
      html = html.replace(regex, `<span class="variavel-preview">${v.exemplo || v.codigo}</span>`);
    });

    // Variáveis especiais
    html = html.replace(/\{\{memorial_executivo\}\}/g, '<span class="variavel-preview">[MEMORIAL EXECUTIVO SERÁ INSERIDO AUTOMATICAMENTE]</span>');
    html = html.replace(/\{\{tabela_parcelas\}\}/g, '<span class="variavel-preview">[TABELA DE PARCELAS SERÁ INSERIDA AUTOMATICAMENTE]</span>');

    setPreviewHtml(html);
    setActiveTab("preview");
  }

  // Salvar modelo
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.codigo || !formData.nome || !formData.conteudo_html) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const dadosModelo = {
        ...formData,
        empresa_id: formData.empresa_id || null,
        clausulas,
        variaveis_obrigatorias: variaveisObrigatorias,
        criado_por: user?.id,
      };

      if (isEdicao) {
        const { error } = await supabase
          .from("juridico_modelos_contrato")
          .update(dadosModelo)
          .eq("id", id);

        if (error) throw error;
        alert("Modelo atualizado com sucesso!");
      } else {
        const { error } = await supabase
          .from("juridico_modelos_contrato")
          .insert([dadosModelo]);

        if (error) throw error;
        alert("Modelo criado com sucesso!");
      }

      navigate("/juridico");
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar: " + error.message);
    } finally {
      setSaving(false);
    }
  }

  // Agrupar variáveis por categoria
  const variaveisPorCategoria = variaveis.reduce((acc, v) => {
    if (!acc[v.categoria]) acc[v.categoria] = [];
    acc[v.categoria].push(v);
    return acc;
  }, {} as Record<string, VariavelSistema[]>);

  const categoriasVariaveis = Object.keys(variaveisPorCategoria);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F25C26]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/juridico")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#1A1A1A]">
              {isEdicao ? "Editar Modelo de Contrato" : "Novo Modelo de Contrato"}
            </h1>
            <p className="text-sm text-gray-500">
              {formData.codigo && `Código: ${formData.codigo}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={gerarPreview}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Preview
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 bg-[#F25C26] hover:bg-[#d94d1f] text-white rounded-lg text-sm flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isEdicao ? "Salvar Alterações" : "Criar Modelo"}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* COLUNA PRINCIPAL */}
          <div className="lg:col-span-3 space-y-6">
            {/* INFORMAÇÕES BÁSICAS */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#F25C26]" />
                Informações do Modelo
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Código *</label>
                  <input
                    type="text"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#F25C26]"
                    placeholder="MOD-ARQ-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Núcleo *</label>
                  <select
                    value={formData.nucleo}
                    onChange={(e) => setFormData({ ...formData, nucleo: e.target.value as NucleoContrato })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#F25C26]"
                  >
                    {NUCLEOS.map((n) => (
                      <option key={n.value} value={n.value}>
                        {n.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Nome do Modelo *</label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#F25C26]"
                    placeholder="Contrato de Prestação de Serviços - Arquitetura"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Descrição</label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    rows={2}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#F25C26]"
                    placeholder="Descrição breve do modelo..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Empresa (Contratada)</label>
                  <select
                    value={formData.empresa_id}
                    onChange={(e) => setFormData({ ...formData, empresa_id: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#F25C26]"
                  >
                    <option value="">Selecione uma empresa...</option>
                    {empresas.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.nome_fantasia || emp.razao_social}
                        {emp.nucleo_nome ? ` (${emp.nucleo_nome})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Prazo Padrão (dias)</label>
                    <input
                      type="number"
                      value={formData.prazo_execucao_padrao}
                      onChange={(e) => setFormData({ ...formData, prazo_execucao_padrao: parseInt(e.target.value) || 0 })}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#F25C26]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Prorrogação (dias)</label>
                    <input
                      type="number"
                      value={formData.prorrogacao_padrao}
                      onChange={(e) => setFormData({ ...formData, prorrogacao_padrao: parseInt(e.target.value) || 0 })}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#F25C26]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* TABS DO EDITOR */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex border-b border-gray-200">
                {[
                  { id: "editor", label: "Editor", icon: Code },
                  { id: "clausulas", label: "Cláusulas", icon: FileText },
                  { id: "variaveis", label: "Variáveis", icon: Variable },
                  { id: "preview", label: "Preview", icon: Eye },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                      activeTab === tab.id
                        ? "bg-[#F25C26] text-white"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-4">
                {/* TAB: EDITOR */}
                {activeTab === "editor" && (
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-sm font-medium">Conteúdo do Contrato (HTML)</label>
                      <span className="text-xs text-gray-500">
                        Use {"{{variavel}}"} para inserir variáveis dinâmicas
                      </span>
                    </div>
                    <textarea
                      ref={editorRef}
                      value={formData.conteudo_html}
                      onChange={(e) => setFormData({ ...formData, conteudo_html: e.target.value })}
                      rows={20}
                      className="w-full border rounded-lg px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-[#F25C26] resize-none"
                      placeholder="<h1>CONTRATO DE PRESTAÇÃO DE SERVIÇOS</h1>&#10;&#10;<p><strong>CONTRATANTE:</strong> {{pessoa.nome}}...</p>"
                    />
                  </div>
                )}

                {/* TAB: CLÁUSULAS */}
                {activeTab === "clausulas" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        Organize as cláusulas do contrato. A ordem define a numeração.
                      </p>
                      <button
                        type="button"
                        onClick={adicionarClausula}
                        className="px-3 py-1.5 bg-[#F25C26] text-white rounded-lg text-sm flex items-center gap-1"
                      >
                        <Plus className="h-4 w-4" /> Adicionar Cláusula
                      </button>
                    </div>

                    {clausulas.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        Nenhuma cláusula adicionada
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {clausulas.map((clausula, index) => (
                          <div
                            key={index}
                            className="border border-gray-200 rounded-lg p-4"
                          >
                            <div className="flex items-start gap-3">
                              {/* Controles de ordem */}
                              <div className="flex flex-col gap-1">
                                <button
                                  type="button"
                                  onClick={() => moverClausula(index, "up")}
                                  disabled={index === 0}
                                  className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                                >
                                  <ChevronUp className="h-4 w-4" />
                                </button>
                                <span className="text-xs font-bold text-center text-gray-500">
                                  {clausula.numero}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => moverClausula(index, "down")}
                                  disabled={index === clausulas.length - 1}
                                  className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                                >
                                  <ChevronDown className="h-4 w-4" />
                                </button>
                              </div>

                              {/* Conteúdo */}
                              <div className="flex-1 space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                  <input
                                    type="text"
                                    value={clausula.titulo}
                                    onChange={(e) => atualizarClausula(index, "titulo", e.target.value)}
                                    placeholder="Título da Cláusula"
                                    className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#F25C26]"
                                  />
                                  <select
                                    value={clausula.tipo}
                                    onChange={(e) => atualizarClausula(index, "tipo", e.target.value)}
                                    className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#F25C26]"
                                  >
                                    {TIPOS_CLAUSULA.map((t) => (
                                      <option key={t.value} value={t.value}>
                                        {t.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <textarea
                                  value={clausula.conteudo}
                                  onChange={(e) => atualizarClausula(index, "conteudo", e.target.value)}
                                  rows={3}
                                  placeholder="Conteúdo da cláusula..."
                                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#F25C26]"
                                />
                                <label className="flex items-center gap-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={clausula.obrigatoria}
                                    onChange={(e) => atualizarClausula(index, "obrigatoria", e.target.checked)}
                                    className="rounded border-gray-300 text-[#F25C26] focus:ring-[#F25C26]"
                                  />
                                  Cláusula obrigatória
                                </label>
                              </div>

                              {/* Excluir */}
                              <button
                                type="button"
                                onClick={() => removerClausula(index)}
                                className="p-2 hover:bg-red-50 text-red-500 rounded-lg"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB: VARIÁVEIS */}
                {activeTab === "variaveis" && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-blue-800">
                            Clique em uma variável para inseri-la no editor.
                            As variáveis serão substituídas automaticamente ao gerar o contrato.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Variáveis Obrigatórias Selecionadas */}
                    {variaveisObrigatorias.length > 0 && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-xs font-semibold text-amber-800 mb-2">
                          Variáveis Obrigatórias ({variaveisObrigatorias.length}):
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {variaveisObrigatorias.map((v) => (
                            <span
                              key={v}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs"
                            >
                              {v}
                              <button
                                type="button"
                                onClick={() => setVariaveisObrigatorias(variaveisObrigatorias.filter((x) => x !== v))}
                                className="hover:text-red-600"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Lista de Variáveis por Categoria */}
                    <div className="space-y-2">
                      {categoriasVariaveis.map((categoria) => (
                        <div key={categoria} className="border border-gray-200 rounded-lg overflow-hidden">
                          <button
                            type="button"
                            onClick={() =>
                              setCategoriaVariavelAberta(
                                categoriaVariavelAberta === categoria ? null : categoria
                              )
                            }
                            className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                          >
                            <span className="font-medium text-sm capitalize">{categoria}</span>
                            <span className="text-xs text-gray-500">
                              {variaveisPorCategoria[categoria].length} variáveis
                            </span>
                          </button>

                          {categoriaVariavelAberta === categoria && (
                            <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                              {variaveisPorCategoria[categoria].map((v) => (
                                <button
                                  key={v.id}
                                  type="button"
                                  onClick={() => inserirVariavel(v.codigo)}
                                  className="flex items-start gap-2 p-2 text-left hover:bg-[#F25C26]/5 rounded-lg border border-transparent hover:border-[#F25C26]/30 transition-colors"
                                >
                                  <Code className="h-4 w-4 text-[#F25C26] mt-0.5" />
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs font-mono text-[#F25C26]">
                                      {`{{${v.codigo}}}`}
                                    </div>
                                    <div className="text-xs text-gray-600 truncate">
                                      {v.nome}
                                    </div>
                                    {v.exemplo && (
                                      <div className="text-xs text-gray-400 truncate">
                                        Ex: {v.exemplo}
                                      </div>
                                    )}
                                  </div>
                                  <Copy className="h-3 w-3 text-gray-400" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Variáveis Especiais */}
                    <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                      <h4 className="font-semibold text-purple-800 mb-3">Variáveis Especiais</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => inserirVariavel("memorial_executivo")}
                          className="flex items-center gap-2 p-2 text-left hover:bg-purple-100 rounded-lg"
                        >
                          <FileText className="h-4 w-4 text-purple-600" />
                          <div>
                            <div className="text-xs font-mono text-purple-600">
                              {`{{memorial_executivo}}`}
                            </div>
                            <div className="text-xs text-gray-600">Memorial Executivo Completo</div>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => inserirVariavel("tabela_parcelas")}
                          className="flex items-center gap-2 p-2 text-left hover:bg-purple-100 rounded-lg"
                        >
                          <FileText className="h-4 w-4 text-purple-600" />
                          <div>
                            <div className="text-xs font-mono text-purple-600">
                              {`{{tabela_parcelas}}`}
                            </div>
                            <div className="text-xs text-gray-600">Tabela de Parcelas do Contrato</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB: PREVIEW */}
                {activeTab === "preview" && (
                  <div>
                    {previewHtml ? (
                      <div
                        className="prose prose-sm max-w-none border border-gray-200 rounded-lg p-6 bg-white"
                        dangerouslySetInnerHTML={{ __html: previewHtml }}
                        style={{
                          fontFamily: "Georgia, serif",
                        }}
                      />
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <Eye className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Clique em "Preview" no topo para visualizar o contrato</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* COLUNA LATERAL */}
          <div className="lg:col-span-1 space-y-4">
            {/* DICA DE USO */}
            <div className="bg-gradient-to-br from-[#F25C26]/10 to-[#F25C26]/5 rounded-xl p-4 border border-[#F25C26]/20">
              <h4 className="font-semibold text-[#F25C26] mb-2 flex items-center gap-2">
                <Info className="h-4 w-4" />
                Dica
              </h4>
              <p className="text-xs text-gray-600">
                Use a aba <strong>Variáveis</strong> para inserir dados dinâmicos que serão preenchidos
                automaticamente ao gerar o contrato.
              </p>
            </div>

            {/* VARIÁVEIS RÁPIDAS */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h4 className="font-semibold text-gray-900 mb-3 text-sm">Variáveis Rápidas</h4>
              <div className="space-y-1">
                {[
                  "pessoa.nome",
                  "pessoa.cpf_cnpj",
                  "contrato.valor_total",
                  "empresa.razao_social",
                ].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => inserirVariavel(v)}
                    className="w-full text-left px-2 py-1.5 text-xs font-mono text-[#F25C26] hover:bg-[#F25C26]/10 rounded transition-colors"
                  >
                    {`{{${v}}}`}
                  </button>
                ))}
              </div>
            </div>

            {/* VALIDAÇÃO */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h4 className="font-semibold text-gray-900 mb-3 text-sm">Validação</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  {formData.codigo ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className={formData.codigo ? "text-green-700" : "text-red-700"}>
                    Código definido
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {formData.nome ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className={formData.nome ? "text-green-700" : "text-red-700"}>
                    Nome definido
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {formData.conteudo_html ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className={formData.conteudo_html ? "text-green-700" : "text-red-700"}>
                    Conteúdo preenchido
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {variaveisObrigatorias.length > 0 ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  )}
                  <span className={variaveisObrigatorias.length > 0 ? "text-green-700" : "text-yellow-700"}>
                    {variaveisObrigatorias.length} variáveis obrigatórias
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Estilos para Preview */}
      <style>{`
        .variavel-preview {
          background-color: #FEF3C7;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 500;
          color: #B45309;
        }
      `}</style>
    </div>
  );
}
