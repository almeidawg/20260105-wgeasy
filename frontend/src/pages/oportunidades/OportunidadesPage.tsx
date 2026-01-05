import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { ESTAGIOS } from "@/constants/oportunidades";
import { DateInputBR } from "@/components/ui/DateInputBR";

export default function CriarOportunidadePage() {
  const navigate = useNavigate();

  const [clientes, setClientes] = useState<any[]>([]);
  const [titulo, setTitulo] = useState("");
  const [cliente, setCliente] = useState("");
  const [valor, setValor] = useState("");
  const [estagio, setEstagio] = useState("Prospecção");
  const [origem, setOrigem] = useState("");
  const [descricao, setDescricao] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [previsao, setPrevisao] = useState("");

  async function carregarClientes() {
    const { data } = await supabase
      .from("pessoas")
      .select("id, nome")
      .eq("tipo", "CLIENTE")
      .eq("ativo", true)
      .order("nome");
    setClientes(data || []);
  }

  useEffect(() => {
    carregarClientes();
  }, []);

  async function salvar() {
    if (!titulo.trim() || !cliente) {
      alert("Título e cliente são obrigatórios!");
      return;
    }

    const { error } = await supabase.from("oportunidades").insert({
      titulo,
      cliente_id: cliente,
      valor_estimado: valor ? Number(valor) : null,
      estagio,
      origem,
      descricao,
      observacoes,
      previsao_fechamento: previsao || null,
    });

    if (error) {
      alert("Erro ao criar oportunidade: " + error.message);
      return;
    }

    alert("Oportunidade criada com sucesso!");
    navigate("/oportunidades");
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Criar Nova Oportunidade</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Título *</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Cliente *</label>
          <select
            className="w-full p-2 border rounded"
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
          >
            <option value="">Selecione</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Valor Estimado</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Estágio</label>
          <select
            className="w-full p-2 border rounded"
            value={estagio}
            onChange={(e) => setEstagio(e.target.value)}
          >
            {ESTAGIOS.map((e) => (
              <option key={e}>{e}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Origem</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={origem}
            onChange={(e) => setOrigem(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Previsão de Fechamento</label>
          <DateInputBR
            value={previsao}
            onChange={(val) => setPrevisao(val)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Descrição</label>
          <textarea
            className="w-full p-2 border rounded"
            rows={3}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          ></textarea>
        </div>

        <div>
          <label className="block text-sm mb-1">Observações</label>
          <textarea
            className="w-full p-2 border rounded"
            rows={3}
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
          ></textarea>
        </div>

        <button
          onClick={salvar}
          className="px-4 py-2 bg-[#F25C26] text-white rounded hover:bg-[#D94E1F] transition-colors"
        >
          Salvar Oportunidade
        </button>
      </div>
    </div>
  );
}
