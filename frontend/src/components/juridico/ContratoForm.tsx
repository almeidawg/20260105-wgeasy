import { useState } from "react";
import { criarContrato } from "@/lib/juridicoApi";

interface ContratoFormProps {
  onSuccess: () => void;
  propostas: Array<{ id: string; titulo: string }>;
}

export default function ContratoForm({
  onSuccess,
  propostas,
}: ContratoFormProps) {
  const [form, setForm] = useState({
    proposta_id: "",
    cliente_nome: "",
    valor_total: 0,
    nucleo: "",
    status: "ativo",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await criarContrato({ ...form, valor_total: Number(form.valor_total) });
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Erro ao criar contrato");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 border rounded-lg bg-white max-w-md mx-auto"
    >
      <h2 className="text-lg font-bold mb-2">Novo Contrato</h2>
      <div>
        <label className="block text-sm font-medium mb-1">Proposta</label>
        <select
          name="proposta_id"
          value={form.proposta_id}
          onChange={handleChange}
          className="w-full border rounded px-2 py-1"
          required
        >
          <option value="">Selecione uma proposta</option>
          {propostas.map((p) => (
            <option key={p.id} value={p.id}>
              {p.titulo}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Cliente</label>
        <input
          name="cliente_nome"
          value={form.cliente_nome}
          onChange={handleChange}
          className="w-full border rounded px-2 py-1"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Valor Total</label>
        <input
          name="valor_total"
          type="number"
          value={form.valor_total}
          onChange={handleChange}
          className="w-full border rounded px-2 py-1"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Núcleo</label>
        <input
          name="nucleo"
          value={form.nucleo}
          onChange={handleChange}
          className="w-full border rounded px-2 py-1"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Status</label>
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="w-full border rounded px-2 py-1"
        >
          <option value="ativo">Ativo</option>
          <option value="em_andamento">Em Andamento</option>
          <option value="concluido">Concluído</option>
        </select>
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <button
        type="submit"
        className="w-full py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Salvando..." : "Salvar Contrato"}
      </button>
    </form>
  );
}
