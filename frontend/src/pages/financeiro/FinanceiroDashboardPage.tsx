// src/pages/FinanceiroDashboardPage.tsx
import { useEffect, useState, useMemo } from "react";
import { listarFinanceiro, LancamentoFinanceiro } from "@/lib/financeiroApi";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

// === TEMA WG EASY 2026 (cores premium) =====================
const WG_COLORS = {
  verde: "#2E7D32",
  vermelho: "#C62828",
  azul: "#1565C0",
  laranja: "#F25C26",
  cinzaFino: "#4C4C4C",
  cinzaClaro: "#E5E5E5",
};

export default function FinanceiroDashboardPage() {
  const [dados, setDados] = useState<LancamentoFinanceiro[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      setLoading(true);
      const lista = await listarFinanceiro();
      setDados(lista);
      setLoading(false);
    }
    carregar();
  }, []);

  const kpis = useMemo(() => calcularKpis(dados), [dados]);
  const curvaS = useMemo(() => montarCurvaS(dados), [dados]);
  const porCentroCusto = useMemo(() => montarPorCentroCusto(dados), [dados]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh] text-[#4C4C4C]">
        Carregando dashboard financeiro...
      </div>
    );
  }

  return (
    <div className="space-y-8">

      <header>
        <h1 className="text-2xl font-semibold text-[#2E2E2E]">Dashboard Financeiro</h1>
        <p className="text-sm text-[#4C4C4C]">Visão executiva WG Almeida</p>
      </header>

      {/* === KPIs === */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Kpi titulo="Receita Total" valor={kpis.totalEntrada} cor={WG_COLORS.verde} />
        <Kpi titulo="Despesa Total" valor={kpis.totalSaida} cor={WG_COLORS.vermelho} />
        <Kpi titulo="Lucro / Resultado" valor={kpis.lucro} cor={WG_COLORS.azul} destaque />
        <Kpi titulo="Margem (%)" valorPercentual={kpis.margem} cor="#2E2E2E" />
      </section>

      {/* === Curva S === */}
      {curvaS.length > 0 && (
        <section className="bg-white p-6 rounded-xl shadow border border-[#E5E5E5]">
          <h2 className="text-lg font-semibold text-[#2E2E2E] mb-4">Curva S (Acumulado)</h2>

          <div className="h-72 min-h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={curvaS}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="mes" stroke="#4C4C4C" />
                <YAxis stroke="#4C4C4C" />
                <Tooltip />
                <Line type="monotone" dataKey="entradaAcum" stroke={WG_COLORS.verde} strokeWidth={3} />
                <Line type="monotone" dataKey="saidaAcum" stroke={WG_COLORS.vermelho} strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* === Centro de Custo === */}
      {porCentroCusto.length > 0 && (
        <section className="bg-white p-6 rounded-xl shadow border border-[#E5E5E5]">
          <h2 className="text-lg font-semibold text-[#2E2E2E] mb-4">Despesas por Centro de Custo</h2>

          <div className="h-72 min-h-[280px]">
            <ResponsiveContainer width="100%" height="100%" aspect={2}>
              <BarChart data={porCentroCusto}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="centro_custo" stroke="#4C4C4C" />
                <YAxis stroke="#4C4C4C" />
                <Tooltip />
                <Bar dataKey="total" fill={WG_COLORS.laranja} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

    </div>
  );
}

function calcularKpis(dados: LancamentoFinanceiro[]) {
  const totalEntrada = dados.filter(d => d.tipo === "entrada").reduce((acc, v) => acc + Number(v.valor_total || 0), 0);
  const totalSaida = dados.filter(d => d.tipo === "saida").reduce((acc, v) => acc + Number(v.valor_total || 0), 0);

  return {
    totalEntrada,
    totalSaida,
    lucro: totalEntrada - totalSaida,
    margem: totalEntrada ? ((totalEntrada - totalSaida) / totalEntrada) * 100 : 0,
  };
}

function montarCurvaS(dados: LancamentoFinanceiro[]) {
  const agrupado = Object.values(
    dados
      .filter(item => item.vencimento) // Filtrar itens sem vencimento
      .reduce((acc: any, item) => {
        const mes = item.vencimento!.substring(0, 7);
        if (!acc[mes]) acc[mes] = { mes, entrada: 0, saida: 0 };
        if (item.tipo === "entrada") acc[mes].entrada += Number(item.valor_total || 0);
        else acc[mes].saida += Number(item.valor_total || 0);
        return acc;
      }, {})
  ).sort((a: any, b: any) => (a.mes > b.mes ? 1 : -1));

  let entradaAcum = 0;
  let saidaAcum = 0;

  return agrupado.map((i: any) => {
    entradaAcum += i.entrada;
    saidaAcum += i.saida;
    return { ...i, entradaAcum, saidaAcum };
  });
}

function montarPorCentroCusto(dados: LancamentoFinanceiro[]) {
  const mapa: Record<string, number> = {};

  dados.filter(d => d.tipo === "saida").forEach((d) => {
    const nucleo = d.nucleo || "Não informado";
    mapa[nucleo] = (mapa[nucleo] || 0) + Number(d.valor_total || 0);
  });

  return Object.entries(mapa).map(([centro_custo, total]) => ({
    centro_custo,
    total,
  }));
}

function Kpi({ titulo, valor, valorPercentual, cor, destaque }: any) {
  let displayValue = valor != null ? `R$ ${valor.toFixed(2)}` : `${valorPercentual.toFixed(1)}%`;

  return (
    <div className="p-4 bg-white rounded-xl shadow border border-[#E5E5E5]">
      <p className="text-sm text-[#4C4C4C]">{titulo}</p>
      <p className="text-xl font-semibold mt-2" style={{ color: cor }}>
        {displayValue}
      </p>
    </div>
  );
}
