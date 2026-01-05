// src/components/DashboardFinanceiro.tsx

import { useEffect, useState } from "react";
import { supabaseRaw as supabase } from "@/lib/supabaseClient";
import { obterEstatisticasFinanceiras } from "@/lib/financeiroApi";
import { Card, CardContent } from "@/components/ui/card";

interface ResumoFinanceiro {
  totalReceitas: number;
  totalDespesas: number;
  previstos: number;
  atrasados: number;
}

export default function DashboardFinanceiro() {
  const [resumo, setResumo] = useState<ResumoFinanceiro>({
    totalReceitas: 0,
    totalDespesas: 0,
    previstos: 0,
    atrasados: 0
  });

  useEffect(() => {
    async function carregarResumo() {
      try {
        // Buscar estatísticas usando a nova API
        const stats = await obterEstatisticasFinanceiras();

        // Buscar contadores de status
        const { data, error } = await supabase
          .from("financeiro_lancamentos")
          .select("status");

        if (error) {
          console.error("Erro ao carregar resumo:", error.message);
          return;
        }

        const previstos = data?.filter((item: any) => item.status === "previsto").length || 0;
        const atrasados = data?.filter((item: any) => item.status === "atrasado").length || 0;

        setResumo({
          totalReceitas: stats.entradas,
          totalDespesas: stats.saidas,
          previstos,
          atrasados,
        });
      } catch (error: any) {
        console.error("Erro ao carregar resumo:", error.message);
      }
    }

    carregarResumo();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent>
          <h2 className="text-lg font-medium">Total Receitas</h2>
          <p className="text-3xl">R$ {resumo.totalReceitas.toFixed(2)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <h2 className="text-lg font-medium">Total Despesas</h2>
          <p className="text-3xl">R$ {resumo.totalDespesas.toFixed(2)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <h2 className="text-lg font-medium">Previstos</h2>
          <p className="text-3xl">{resumo.previstos}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <h2 className="text-lg font-medium">Atrasados</h2>
          <p className="text-3xl">{resumo.atrasados}</p>
        </CardContent>
      </Card>
    </div>
  );
}
