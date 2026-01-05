import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2 } from "lucide-react";
import { supabaseRaw as supabase } from "@/lib/supabaseClient";

type Categoria = {
  id: string;
  name: string;
  kind: "income" | "expense";
  nucleo?: string | null;
  created_at?: string;
};

const NUCLEOS = [
  { value: "", label: "Todos os Núcleos" },
  { value: "arquitetura", label: "🏛️ Arquitetura" },
  { value: "engenharia", label: "⚙️ Engenharia" },
  { value: "marcenaria", label: "🪵 Marcenaria" },
  { value: "geral", label: "🏢 Geral" },
];

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);
  const [filterNucleo, setFilterNucleo] = useState("");

  async function carregarCategorias() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("fin_categories")
        .select("*")
        .order("kind, name");

      if (error) throw error;
      setCategorias(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar categorias:", error);
      alert("Erro ao carregar categorias: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarCategorias();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Deseja excluir esta categoria?")) return;

    try {
      const { error } = await supabase.from("fin_categories").delete().eq("id", id);

      if (error) throw error;
      alert("Categoria excluída com sucesso!");
      carregarCategorias();
    } catch (error: any) {
      console.error("Erro ao excluir:", error);
      alert("Erro ao excluir: " + error.message);
    }
  }

  const categoriasFiltradas = filterNucleo
    ? categorias.filter((c) => c.nucleo === filterNucleo || c.nucleo === "geral" || !c.nucleo)
    : categorias;
  const receitas = categoriasFiltradas.filter((c) => c.kind === "income");
  const despesas = categoriasFiltradas.filter((c) => c.kind === "expense");

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-[#1A1A1A]">Categorias Financeiras</h1>
        <div className="flex items-center gap-3">
          <select
            value={filterNucleo}
            onChange={(e) => setFilterNucleo(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F25C26] focus:outline-none"
          >
            {NUCLEOS.map((n) => (
              <option key={n.value} value={n.value}>{n.label}</option>
            ))}
          </select>
          <button
            onClick={() => {
              setEditingCategoria(null);
              setIsFormOpen(true);
            }}
            className="px-4 py-2 bg-[#F25C26] hover:bg-[#d94d1f] text-white rounded-md text-sm flex items-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" /> Nova Categoria
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F25C26]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* RECEITAS */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-green-600 mb-4 flex items-center gap-2">
              📈 Receitas ({receitas.length})
            </h2>
            <div className="space-y-2">
              {receitas.map((cat, i) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800">{cat.name}</span>
                    {cat.nucleo && (
                      <span className="text-xs px-2 py-0.5 bg-white/50 rounded-full text-gray-600">
                        {cat.nucleo}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditingCategoria(cat);
                        setIsFormOpen(true);
                      }}
                      className="p-2 hover:bg-white rounded-md transition-colors"
                    >
                      <Edit className="h-4 w-4 text-blue-500" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-2 hover:bg-white rounded-md transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </motion.div>
              ))}
              {receitas.length === 0 && (
                <p className="text-center text-gray-500 py-8">Nenhuma categoria de receita.</p>
              )}
            </div>
          </div>

          {/* DESPESAS */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
              📉 Despesas ({despesas.length})
            </h2>
            <div className="space-y-2">
              {despesas.map((cat, i) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800">{cat.name}</span>
                    {cat.nucleo && (
                      <span className="text-xs px-2 py-0.5 bg-white/50 rounded-full text-gray-600">
                        {cat.nucleo}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditingCategoria(cat);
                        setIsFormOpen(true);
                      }}
                      className="p-2 hover:bg-white rounded-md transition-colors"
                    >
                      <Edit className="h-4 w-4 text-blue-500" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-2 hover:bg-white rounded-md transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </motion.div>
              ))}
              {despesas.length === 0 && (
                <p className="text-center text-gray-500 py-8">Nenhuma categoria de despesa.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {isFormOpen && (
        <CategoriaForm
          categoria={editingCategoria}
          onClose={() => setIsFormOpen(false)}
          onSuccess={() => {
            setIsFormOpen(false);
            carregarCategorias();
          }}
        />
      )}
    </div>
  );
}

type CategoriaFormProps = {
  categoria: Categoria | null;
  onClose: () => void;
  onSuccess: () => void;
};

function CategoriaForm({ categoria, onClose, onSuccess }: CategoriaFormProps) {
  const [formData, setFormData] = useState({
    name: categoria?.name || "",
    kind: (categoria?.kind || "expense") as "income" | "expense",
    nucleo: categoria?.nucleo || "geral",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.name) {
      alert("Preencha o nome da categoria.");
      return;
    }

    try {
      if (categoria) {
        // Editar
        const { error } = await supabase
          .from("fin_categories")
          .update(formData)
          .eq("id", categoria.id);

        if (error) throw error;
      } else {
        // Criar
        const { error } = await supabase.from("fin_categories").insert([formData]);

        if (error) throw error;
      }

      alert(`Categoria ${categoria ? "atualizada" : "criada"} com sucesso!`);
      onSuccess();
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar: " + error.message);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4 text-[#1A1A1A]">
          {categoria ? "Editar Categoria" : "Nova Categoria"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Nome da Categoria *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F25C26]"
              placeholder="Ex: Salários, Vendas, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Tipo *</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, kind: "expense" })}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                  formData.kind === "expense"
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                📉 Despesa
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, kind: "income" })}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                  formData.kind === "income"
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                📈 Receita
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Núcleo *</label>
            <select
              value={formData.nucleo}
              onChange={(e) => setFormData({ ...formData, nucleo: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F25C26]"
            >
              <option value="geral">🏢 Geral (Todos)</option>
              <option value="arquitetura">🏛️ Arquitetura</option>
              <option value="engenharia">⚙️ Engenharia</option>
              <option value="marcenaria">🪵 Marcenaria</option>
            </select>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#F25C26] hover:bg-[#d94d1f] text-white rounded-md text-sm transition-colors"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
