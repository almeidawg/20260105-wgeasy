// ============================================================
// PÁGINA: Gerenciamento de Categorias de Pricelist
// Sistema WG Easy - Grupo WG Almeida
// ============================================================

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  listarCategorias,
  criarCategoria,
  atualizarCategoria,
  deletarCategoria,
  type PricelistCategoria,
  type PricelistCategoriaFormData,
} from "@/lib/pricelistApi";
import { getTipoItemLabel, getTipoItemColor } from "@/types/pricelist";

export default function PricelistCategoriasPage() {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState<PricelistCategoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState<PricelistCategoria | null>(null);

  const [formData, setFormData] = useState<PricelistCategoriaFormData>({
    nome: "",
    codigo: "",
    tipo: "material",
    descricao: "",
    ativo: true,
  });

  useEffect(() => {
    carregarCategorias();
  }, []);

  async function carregarCategorias() {
    try {
      setLoading(true);
      const data = await listarCategorias();
      setCategorias(data);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
      alert("Erro ao carregar categorias");
    } finally {
      setLoading(false);
    }
  }

  function abrirModal(categoria?: PricelistCategoria) {
    if (categoria) {
      setEditando(categoria);
      setFormData({
        nome: categoria.nome,
        codigo: categoria.codigo || "",
        tipo: categoria.tipo,
        descricao: categoria.descricao || "",
        ativo: categoria.ativo,
      });
    } else {
      setEditando(null);
      setFormData({
        nome: "",
        codigo: "",
        tipo: "material",
        descricao: "",
        ativo: true,
      });
    }
    setShowModal(true);
  }

  function fecharModal() {
    setShowModal(false);
    setEditando(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      if (editando) {
        await atualizarCategoria(editando.id, formData);
        alert("Categoria atualizada com sucesso!");
      } else {
        await criarCategoria(formData);
        alert("Categoria criada com sucesso!");
      }
      fecharModal();
      carregarCategorias();
    } catch (error: any) {
      console.error("Erro ao salvar categoria:", error);
      alert(`Erro ao salvar categoria: ${error.message}`);
    }
  }

  async function handleDeletar(id: string) {
    if (!confirm("Tem certeza que deseja deletar esta categoria?")) return;

    try {
      await deletarCategoria(id);
      alert("Categoria deletada com sucesso!");
      carregarCategorias();
    } catch (error: any) {
      console.error("Erro ao deletar categoria:", error);
      alert(`Erro ao deletar categoria: ${error.message}`);
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#F25C26]" />
          <p className="text-sm text-gray-600 mt-4">Carregando categorias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate("/pricelist")}
            className="text-gray-600 hover:text-gray-900 mb-2 flex items-center gap-1 text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </button>
          <h1 className="text-2xl font-bold text-[#2E2E2E]">Categorias de Pricelist</h1>
          <p className="text-sm text-gray-600 mt-1">
            Gerencie as categorias de mão de obra e materiais
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/pricelist/subcategorias")}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            Subcategorias
          </button>
          <button
            onClick={() => abrirModal()}
            className="px-4 py-2 bg-[#F25C26] text-white rounded-lg hover:bg-[#e04a1a] flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nova Categoria
          </button>
        </div>
      </div>

      {/* Lista de Categorias */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {categorias.map((categoria) => (
          <div
            key={categoria.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    {categoria.codigo
                      ? categoria.codigo
                      : String(categoria.ordem || 0).padStart(3, "0")}
                  </span>
                  <span
                    className="px-2 py-0.5 text-xs font-medium rounded"
                    style={{
                      backgroundColor: getTipoItemColor(categoria.tipo) + "20",
                      color: getTipoItemColor(categoria.tipo),
                    }}
                  >
                    {getTipoItemLabel(categoria.tipo)}
                  </span>
                </div>
                <h3 className="font-semibold text-base text-[#2E2E2E]">{categoria.nome}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {categoria.descricao || "Sem descrição"}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t">
              <span
                className={`text-xs font-medium ${
                  categoria.ativo ? "text-green-600" : "text-gray-400"
                }`}
              >
                {categoria.ativo ? "Ativa" : "Inativa"}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => abrirModal(categoria)}
                  className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDeletar(categoria.id)}
                  className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                >
                  Deletar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {categorias.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhuma categoria encontrada</p>
          <button
            onClick={() => abrirModal()}
            className="mt-4 text-[#F25C26] hover:underline"
          >
            Criar primeira categoria
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editando ? "Editar Categoria" : "Nova Categoria"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F25C26]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Código
                </label>
                <input
                  type="text"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                  placeholder="Ex: ARQ, ENG, EST"
                  maxLength={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F25C26]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Código abreviado da categoria (será exibido como 001-ARQ)
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo *
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) =>
                    setFormData({ ...formData, tipo: e.target.value as any })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F25C26]"
                  required
                >
                  <option value="material">Material</option>
                  <option value="mao_obra">Mao de Obra</option>
                  <option value="servico">Servico</option>
                  <option value="produto">Produto</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F25C26]"
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="ativo" className="text-sm text-gray-700">
                  Categoria ativa
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={fecharModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#F25C26] text-white rounded-lg hover:bg-[#e04a1a]"
                >
                  {editando ? "Atualizar" : "Criar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
