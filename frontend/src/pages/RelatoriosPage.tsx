import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { supabase } from "@/lib/supabaseClient";
import "@/styles/relatorios.css";

interface Obra {
  status: string;
}

interface ReceitaMensal {
  mes: string;
  valor: number;
}

export default function RelatoriosPage() {
  const [dadosFaturamento, setDadosFaturamento] = useState<ReceitaMensal[]>([]);
  const [dadosObras, setDadosObras] = useState<{ status: string; quantidade: number }[]>([]);

  useEffect(() => {
    carregarFaturamento();
    carregarObras();
  }, []);

  async function carregarFaturamento() {
    const { data, error } = await supabase
      .from("financeiro_lancamentos")
      .select("valor_total, data_competencia")
      .eq("tipo", "entrada");

    if (error) {
      console.error("Erro ao buscar financeiro:", error.message);
      return;
    }

    // Agrupar por mês
    const agrupado: Record<string, number> = {};

    data?.forEach((item) => {
      const mes = new Date(item.data_competencia).toLocaleString("pt-BR", { month: "short" });
      agrupado[mes] = (agrupado[mes] || 0) + parseFloat(item.valor_total);
    });

    const resultado = Object.entries(agrupado).map(([mes, valor]) => ({
      mes,
      valor,
    }));

    setDadosFaturamento(resultado);
  }

  async function carregarObras() {
    const { data, error } = await supabase.from("obras").select("status");

    if (error) {
      console.error("Erro ao buscar obras:", error.message);
      return;
    }

    const contagem: Record<string, number> = {};

    data?.forEach((obra) => {
      const status = obra.status || "Desconhecido";
      contagem[status] = (contagem[status] || 0) + 1;
    });

    const resultado = Object.entries(contagem).map(([status, quantidade]) => ({
      status,
      quantidade,
    }));

    setDadosObras(resultado);
  }

  const cores = ["#00c49f", "#ffbb28", "#ff5c5c", "#8884d8"];

  return (
    <div className="relatorios-container">
      <h1>Relatórios e Indicadores</h1>

      <div className="grafico-box">
        <h2>Faturamento por Mês</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dadosFaturamento}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="valor"
              stroke="#004aad"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grafico-box">
        <h2>Status das Obras</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={dadosObras}
              dataKey="quantidade"
              nameKey="status"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label
            >
              {dadosObras.map((entry, index) => (
                <Cell key={index} fill={cores[index % cores.length]} />
              ))}
            </Pie>
            <Legend />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
