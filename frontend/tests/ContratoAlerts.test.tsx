jest.mock("@/lib/supabaseClient");
import React from "react";
import { render, screen } from "@testing-library/react";
import ContratoAlerts from "../src/components/juridico/ContratoAlerts";

describe("ContratoAlerts", () => {
  it("não renderiza nada se não houver alertas", () => {
    const { container } = render(<ContratoAlerts alertas={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renderiza alerta de vencimento", () => {
    render(
      <ContratoAlerts
        alertas={[
          {
            id: "1",
            contrato_numero: "C-001",
            cliente_nome: "Cliente Teste",
            data_vencimento: "2026-01-10",
            dias_restantes: 3,
            status: "ativo",
          },
        ]}
      />
    );
    expect(screen.getByText(/Contrato:/)).toBeInTheDocument();
    expect(screen.getByText(/Cliente:/)).toBeInTheDocument();
    expect(screen.getByText(/Vencimento:/)).toBeInTheDocument();
    expect(screen.getByText(/Faltam 3 dias/)).toBeInTheDocument();
  });
});
