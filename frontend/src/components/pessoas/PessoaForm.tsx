import { useState } from "react";
import type { PessoaInput, PessoaTipo } from "@/types/pessoas";
import PessoaAvatarUploader from "@/components/pessoas/PessoaAvatarUploader";

type PessoaFormProps = {
  tipo: PessoaTipo;
  onSubmit: (data: PessoaInput) => Promise<void>;
  onCancel?: () => void;
};

export function PessoaForm({ tipo, onSubmit, onCancel }: PessoaFormProps) {
  const [form, setForm] = useState<PessoaInput>({
    nome: "",
    email: "",
    telefone: "",
    cargo: "",
    unidade: "",
    tipo,
    avatar_url: null,
    foto_url: null,
    avatar: null,
    ativo: true,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAvatarChange = (data: any) => {
    setForm((prev) => ({ ...prev, ...data }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.nome || !form.email) {
      alert("Nome e E-mail são obrigatórios.");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(form);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-4 mt-6 font-poppins">
      {/* Avatar */}
      <PessoaAvatarUploader
        nome={form.nome || "Sem nome"}
        avatar_url={form.avatar_url}
        foto_url={form.foto_url}
        avatar={form.avatar}
        onChange={handleAvatarChange}
      />

      {/* Nome */}
      <div>
        <label className="block text-sm font-medium mb-1">Nome *</label>
        <input
          name="nome"
          value={form.nome}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#F25C26]"
          required
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium mb-1">E-mail *</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#F25C26]"
          required
        />
      </div>

      {/* Telefone */}
      <div>
        <label className="block text-sm font-medium mb-1">Telefone</label>
        <input
          name="telefone"
          value={form.telefone ?? ""}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#F25C26]"
        />
      </div>

      {/* Cargo */}
      <div>
        <label className="block text-sm font-medium mb-1">Cargo / Função</label>
        <input
          name="cargo"
          value={form.cargo ?? ""}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#F25C26]"
        />
      </div>

      {/* Unidade */}
      <div>
        <label className="block text-sm font-medium mb-1">Unidade / Região</label>
        <input
          name="unidade"
          value={form.unidade ?? ""}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#F25C26]"
        />
      </div>

      {/* Ativo */}
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="ativo"
          checked={form.ativo ?? true}
          onChange={handleChange}
        />
        Cadastro ativo
      </label>

      {/* Botões */}
      <div className="flex gap-2 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-md border text-sm hover:bg-gray-50"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 rounded-md text-sm font-semibold bg-[#F25C26] text-white hover:bg-[#d94d1a] disabled:opacity-60"
        >
          {loading ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}
