// src/pages/OrcamentoFormPage.tsx
import { useEffect, useState, ChangeEvent } from "react";
import {
  criarOrcamento,
  atualizarOrcamento,
  buscarOrcamento,
  Orcamento,
} from "@/lib/orcamentoApi";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate, useParams } from "react-router-dom";

interface ObraResumo {
  id: string;
  nome: string;
}

export default function OrcamentoFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState<Orcamento>({
    cliente: "",
    descricao: "",
    obra_id: null,
    valor_total: 0,
    margem: 0,
    imposto: 0,
    status: "rascunho",
  });

  const [obras, setObras] = useState<ObraResumo[]>([]);
  const [loading, setLoading] = useState(true);

  async function carregarObras() {
    try {
      const { data, error } = await supabase
        .from("obras")
        .select("id, nome")
        .order("nome", { ascending: true });
      if (error) throw error;
      setObras((data || []) as ObraResumo[]);
    } catch (error) {
      console.error("Erro ao carregar obras:", error);
    }
  }

  async function carregarOrcamento() {
    if (!id) return;

    try {
      const dados = await buscarOrcamento(id);
      if (dados) setForm(dados);
    } catch (error) {
      console.error("Erro ao carregar orçamento:", error);
      alert("Erro ao carregar orçamento.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarObras();
    carregarOrcamento();
    setLoading(false);
  }, [id]);

  function handle(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function salvar() {
    if (!form.cliente || !form.descricao) {
      return alert("Preencha cliente e descrição.");
    }

    try {
      if (id) {
        await atualizarOrcamento(id, form);
      } else {
        const novo = await criarOrcamento(form);
        if (novo?.id) {
          navigate(`/orcamentos/itens/${novo.id}`);
          return;
        }
      }

      navigate("/orcamentos");
    } catch (error) {
      console.error("Erro ao salvar orçamento:", error);
      alert("Erro ao salvar orçamento. Tente novamente.");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">Carregando...</div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-white shadow-md rounded-xl border border-[#E5E5E5] p-6 space-y-5">
      <h1 className="text-2xl font-semibold text-[#2E2E2E]">
        {id ? "Editar Orçamento" : "Novo Orçamento"}
      </h1>

      <input
        name="cliente"
        value={form.cliente}
        onChange={handle}
        placeholder="Cliente"
        className="border p-2 rounded w-full"
      />

      <textarea
        name="descricao"
        value={form.descricao}
        onChange={handle}
        placeholder="Descrição geral"
        className="border p-2 rounded w-full h-24"
      />

      <select
        name="obra_id"
        value={form.obra_id ?? ""}
        onChange={handle}
        className="border p-2 rounded w-full"
      >
        <option value="">Sem vinculação de obra</option>
        {obras.map((o) => (
          <option key={o.id} value={o.id}>
            {o.nome}
          </option>
        ))}
      </select>

      <button
        onClick={salvar}
        className="w-full px-4 py-2 bg-[#F25C26] text-white rounded hover:bg-[#d54b1c]"
      >
        Salvar Orçamento
      </button>
    </div>
  );
}
