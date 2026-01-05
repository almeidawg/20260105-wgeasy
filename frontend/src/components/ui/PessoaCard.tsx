// src/components/ui/PessoaCard.tsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import type { Pessoa } from "../../lib/pessoasApi";

interface PessoaCardProps {
  pessoa: Pessoa;
  onClick?: () => void;
}

export const PessoaCard: React.FC<PessoaCardProps> = ({ pessoa, onClick }) => {
  return (
    <Card className="wg-pessoa-card" onClick={onClick}>
      <CardHeader className="wg-pessoa-card-header">
        <div className="wg-avatar">
          {pessoa.avatar_url || pessoa.foto_url ? (
            <img
              src={pessoa.avatar_url ?? pessoa.foto_url ?? ""}
              alt={pessoa.nome}
            />
          ) : (
            <span>{pessoa.nome.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div>
          <CardTitle>{pessoa.nome}</CardTitle>
          <p className="wg-pessoa-card-subtitle">
            {pessoa.cargo} {pessoa.unidade ? `• ${pessoa.unidade}` : ""}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <p>{pessoa.email}</p>
        {pessoa.telefone && <p>{pessoa.telefone}</p>}
        <span className={`wg-badge ${pessoa.ativo ? "ativo" : "inativo"}`}>
          {pessoa.ativo ? "Ativo" : "Inativo"}
        </span>
      </CardContent>
    </Card>
  );
};
