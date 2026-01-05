// src/components/ui/PessoasListView.tsx
import React, { useEffect, useState } from "react";
import { listarPessoas, Pessoa, PessoaTipo } from "../../lib/pessoasApi";
import { Input } from "./input";
import { PessoaCard } from "./PessoaCard";
import { useNavigate } from "react-router-dom";

interface PessoasListViewProps {
  titulo: string;
  tipo: PessoaTipo;
  rotaNovo: string;
}

export const PessoasListView: React.FC<PessoasListViewProps> = ({
  titulo,
  tipo,
  rotaNovo,
}) => {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    async function carregar() {
      setLoading(true);
      try {
        const data = await listarPessoas({ tipo, search, ativo: true });
        if (isMounted) {
          setPessoas(data);
        }
      } catch (err) {
        console.error("[PessoasListView] erro ao listar:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    carregar();

    return () => {
      isMounted = false;
    };
  }, [tipo, search]);

  return (
    <div className="wg-page">
      <div className="wg-page-header">
        <h1>{titulo}</h1>
        <button
          className="wg-btn-primary"
          onClick={() => navigate(rotaNovo)}
        >
          + Novo {tipo.toLowerCase()}
        </button>
      </div>

      <div className="wg-page-filters">
        <Input
          placeholder="Buscar por nome, e-mail ou telefone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading && <p>Carregando...</p>}

      {!loading && pessoas.length === 0 && (
        <p>Nenhum registro encontrado para este tipo.</p>
      )}

      <div className="wg-pessoas-grid">
        {pessoas.map((p) => (
          <PessoaCard
            key={p.id}
            pessoa={p}
            onClick={() => navigate(`${rotaNovo}?id=${p.id}`)}
          />
        ))}
      </div>
    </div>
  );
};
