jest.mock("@/lib/supabaseClient");
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import JuridicoPage from "../src/pages/JuridicoPage";

// Mock das dependências externas
jest.mock("@/lib/juridicoApi", () => ({
  listarContratos: jest.fn().mockResolvedValue({
    data: [
      {
        id: "1",
        cliente_nome: "Cliente Teste",
        nucleo: "Núcleo 1",
        valor_total: 1000,
        status: "ativo",
      },
    ],
  }),
  listarContratosAlertas: jest.fn().mockResolvedValue([
    {
      id: "1",
      contrato_numero: "C-001",
      cliente_nome: "Cliente Teste",
      data_vencimento: "2026-01-10",
      dias_restantes: 3,
      status: "ativo",
    },
  ]),
}));
jest.mock("@/components/juridico/ContratoForm", () => (props: any) => (
  <div data-testid="contrato-form-mock">ContratoFormMock</div>
));
jest.mock("@/components/juridico/ContratoAlerts", () => (props: any) => (
  <div data-testid="contrato-alerts-mock">ContratoAlertsMock</div>
));

describe("JuridicoPage", () => {
  it("deve renderizar lista de contratos e filtro", async () => {
    render(<JuridicoPage />);
    expect(screen.getByText(/Jurídico - Contratos/)).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText("Cliente Teste")).toBeInTheDocument()
    );
    expect(screen.getByText("Núcleo 1")).toBeInTheDocument();
    expect(screen.getByText("R$ 1.000")).toBeInTheDocument();
    expect(screen.getByText("ativo")).toBeInTheDocument();
    expect(screen.getByLabelText(/Filtrar por Núcleo/)).toBeInTheDocument();
  });

  it("deve abrir o formulário ao clicar em Novo Contrato", async () => {
    render(<JuridicoPage />);
    const btn = screen.getByText(/Novo Contrato/);
    fireEvent.click(btn);
    expect(screen.getByTestId("contrato-form-mock")).toBeInTheDocument();
  });
});
