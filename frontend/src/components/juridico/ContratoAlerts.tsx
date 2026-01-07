import React from "react";

interface ContratoAlert {
  id: string;
  contrato_numero: string;
  cliente_nome: string;
  data_vencimento: string;
  dias_restantes: number;
  status: string;
}

interface ContratoAlertsProps {
  alertas: ContratoAlert[];
}

export default function ContratoAlerts({ alertas }: ContratoAlertsProps) {
  if (!alertas.length) return null;
  return (
    <div className="mb-4">
      <h2 className="text-lg font-bold mb-2 text-orange-700">
        Alertas de Vencimento de Contratos
      </h2>
      <ul className="space-y-2">
        {alertas.map((alerta) => (
          <li
            key={alerta.id}
            className={`p-3 rounded border-l-4 ${
              alerta.dias_restantes <= 0
                ? "bg-red-50 border-red-500"
                : alerta.dias_restantes <= 7
                ? "bg-amber-50 border-amber-500"
                : "bg-yellow-50 border-yellow-400"
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <span className="font-semibold">Contrato:</span>{" "}
                {alerta.contrato_numero}{" "}
                <span className="ml-2 font-semibold">Cliente:</span>{" "}
                {alerta.cliente_nome}
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-semibold">Vencimento:</span>{" "}
                {new Date(alerta.data_vencimento).toLocaleDateString("pt-BR")}
                {" | "}
                <span className="font-semibold">
                  {alerta.dias_restantes <= 0
                    ? "VENCIDO"
                    : `Faltam ${alerta.dias_restantes} dias`}
                </span>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Status: {alerta.status}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
