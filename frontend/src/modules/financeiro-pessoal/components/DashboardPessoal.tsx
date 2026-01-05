import { motion } from 'framer-motion';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Clock,
  ArrowUpCircle,
  ArrowDownCircle,
  PiggyBank,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useDashboardPessoal } from '../hooks';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function DashboardPessoal() {
  const { data, loading } = useDashboardPessoal();

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-gray-500">
        Erro ao carregar dados do dashboard
      </div>
    );
  }

  const kpis = [
    {
      label: 'Saldo Total',
      valor: formatCurrency(data.saldo_total),
      icon: Wallet,
      cor: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Receitas do Mês',
      valor: formatCurrency(data.receitas_mes),
      icon: ArrowUpCircle,
      cor: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Despesas do Mês',
      valor: formatCurrency(data.despesas_mes),
      icon: ArrowDownCircle,
      cor: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      label: 'Balanço do Mês',
      valor: formatCurrency(data.balanco_mes),
      icon: data.balanco_mes >= 0 ? TrendingUp : TrendingDown,
      cor: data.balanco_mes >= 0 ? 'text-green-600' : 'text-red-600',
      bg: data.balanco_mes >= 0 ? 'bg-green-50' : 'bg-red-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{kpi.label}</p>
                <p className="text-2xl font-bold mt-1">{kpi.valor}</p>
              </div>
              <div className={`p-3 rounded-full ${kpi.bg}`}>
                <kpi.icon className={`w-6 h-6 ${kpi.cor}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Alertas e Gráfico */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertas */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-6 bg-white border border-gray-200 rounded-xl"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            Alertas
          </h3>

          <div className="space-y-3">
            {data.lancamentos_pendentes > 0 && (
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
                <span className="text-sm">
                  <strong>{data.lancamentos_pendentes}</strong> lançamento(s) pendente(s)
                </span>
              </div>
            )}

            {data.lancamentos_vencidos > 0 && (
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-sm">
                  <strong>{data.lancamentos_vencidos}</strong> lançamento(s) vencido(s)
                </span>
              </div>
            )}

            {data.lancamentos_pendentes === 0 && data.lancamentos_vencidos === 0 && (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-sm">Tudo em dia! Sem pendências.</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Gráfico de Categorias */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-6 bg-white border border-gray-200 rounded-xl"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-purple-500" />
            Despesas por Categoria
          </h3>

          {data.grafico_categorias.length > 0 ? (
            <div className="flex items-center gap-4">
              <div className="w-1/2 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.grafico_categorias}
                      dataKey="valor"
                      nameKey="categoria"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      innerRadius={40}
                    >
                      {data.grafico_categorias.map((entry, index) => (
                        <Cell key={index} fill={entry.cor} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 space-y-2">
                {data.grafico_categorias.slice(0, 5).map((cat, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: cat.cor }}
                    />
                    <span className="flex-1 truncate">{cat.categoria}</span>
                    <span className="font-medium">{cat.percentual.toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400">
              Sem despesas no mês
            </div>
          )}
        </motion.div>
      </div>

      {/* Contas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-white border border-gray-200 rounded-xl"
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-blue-500" />
          Minhas Contas
        </h3>

        {data.contas.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.contas.map(conta => (
              <div
                key={conta.id}
                className="p-4 rounded-lg border border-gray-100"
                style={{ borderLeftColor: conta.cor, borderLeftWidth: 4 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-4 h-4" style={{ color: conta.cor }} />
                  <span className="font-medium">{conta.nome}</span>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">
                    {conta.tipo}
                  </span>
                </div>
                <p className="text-xl font-bold">
                  {formatCurrency(conta.saldo_atual)}
                </p>
                {conta.banco && (
                  <p className="text-xs text-gray-400 mt-1">{conta.banco}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            Nenhuma conta cadastrada
          </div>
        )}
      </motion.div>
    </div>
  );
}
