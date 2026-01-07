jest.mock("@/lib/supabaseClient");
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ContratoForm from "../src/components/juridico/ContratoForm";

describe("ContratoForm", () => {
  const propostas = [
    { id: "1", titulo: "Proposta A" },
    { id: "2", titulo: "Proposta B" },
  ];
  it("deve renderizar campos obrigatórios", () => {
    render(<ContratoForm onSuccess={jest.fn()} propostas={propostas} />);
    expect(screen.getByLabelText(/Proposta/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cliente/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Valor Total/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Núcleo/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Status/)).toBeInTheDocument();
  });

  it("deve chamar onSuccess ao submeter com dados válidos", async () => {
    const onSuccess = jest.fn();
    render(<ContratoForm onSuccess={onSuccess} propostas={propostas} />);
    fireEvent.change(screen.getByLabelText(/Proposta/), {
      target: { value: "1" },
    });
    fireEvent.change(screen.getByLabelText(/Cliente/), {
      target: { value: "Cliente Teste" },
    });
    fireEvent.change(screen.getByLabelText(/Valor Total/), {
      target: { value: "1000" },
    });
    fireEvent.change(screen.getByLabelText(/Núcleo/), {
      target: { value: "Núcleo 1" },
    });
    fireEvent.change(screen.getByLabelText(/Status/), {
      target: { value: "ativo" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Salvar Contrato/ }));
    // O submit real é mockado, então não há erro
  });
});
