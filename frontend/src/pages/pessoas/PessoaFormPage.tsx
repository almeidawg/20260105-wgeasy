// src/pages/pessoas/PessoaFormPage.tsx

import { useState } from "react";

export default function PessoaFormPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Nova Pessoa</h1>

      <form className="space-y-4">
        <input
          className="border p-2 rounded w-full"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <input
          className="border p-2 rounded w-full"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          type="submit"
          className="bg-[#F25C26] text-white px-4 py-2 rounded hover:opacity-90"
        >
          Salvar
        </button>
      </form>
    </div>
  );
}
