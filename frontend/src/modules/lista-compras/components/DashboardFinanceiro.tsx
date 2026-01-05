// ============================================================
// DashboardFinanceiro - Cards com totais financeiros
// Sistema WG Easy - Grupo WG Almeida
// ============================================================

import {
  Package,
  DollarSign,
  Building2,
  User,
  Percent,
  Landmark,
  Wallet,
} from 'lucide-react';
import type { TotalizacaoProjeto } from '../types';
import { formatCurrency } from '../utils/formatters';

interface DashboardFinanceiroProps {
  dados: TotalizacaoProjeto | null;
  loading?: boolean;
}

interface CardProps {
  titulo: string;
  valor: string | number;
  subtitulo?: string;
  icon: React.ReactNode;
  cor: 'green' | 'amber' | 'blue' | 'purple' | 'gray' | 'emerald';
  loading?: boolean;
}

function Card({ titulo, valor, subtitulo, icon, cor, loading }: CardProps) {
  const cores = {
    green: {
      bg: 'bg-green-50',
      iconBg: 'bg-green-100',
      iconText: 'text-green-600',
      text: 'text-green-700',
    },
    amber: {
      bg: 'bg-amber-50',
      iconBg: 'bg-amber-100',
      iconText: 'text-amber-600',
      text: 'text-amber-700',
    },
    blue: {
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconText: 'text-blue-600',
      text: 'text-blue-700',
    },
    purple: {
      bg: 'bg-purple-50',
      iconBg: 'bg-purple-100',
      iconText: 'text-purple-600',
      text: 'text-purple-700',
    },
    gray: {
      bg: 'bg-gray-50',
      iconBg: 'bg-gray-100',
      iconText: 'text-gray-600',
      text: 'text-gray-700',
    },
    emerald: {
      bg: 'bg-emerald-50',
      iconBg: 'bg-emerald-100',
      iconText: 'text-emerald-600',
      text: 'text-emerald-700',
    },
  };

  const c = cores[cor];

  return (
    <div className={`rounded-xl p-4 ${c.bg} border border-${cor}-100`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{titulo}</p>
          {loading ? (
            <div className="h-7 w-24 bg-gray-200 animate-pulse rounded mt-1" />
          ) : (
            <p className={`text-xl font-bold ${c.text} mt-1`}>{valor}</p>
          )}
          {subtitulo && <p className="text-xs text-gray-500 mt-1">{subtitulo}</p>}
        </div>
        <div className={`p-2 rounded-lg ${c.iconBg}`}>
          <span className={c.iconText}>{icon}</span>
        </div>
      </div>
    </div>
  );
}

export default function DashboardFinanceiro({ dados, loading }: DashboardFinanceiroProps) {
  const dadosExibicao = dados || {
    total_itens: 0,
    valor_total: 0,
    valor_wg_compra: 0,
    valor_cliente_direto: 0,
    valor_fee: 0,
    conta_real: 0,
    conta_virtual: 0,
  };

  return (
    <div className="mb-6">
      {/* Linha 1: Totais Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <Card
          titulo="Total Itens"
          valor={dadosExibicao.total_itens}
          icon={<Package size={20} />}
          cor="gray"
          loading={loading}
        />
        <Card
          titulo="Valor Total Lista"
          valor={formatCurrency(dadosExibicao.valor_total)}
          icon={<DollarSign size={20} />}
          cor="blue"
          loading={loading}
        />
        <Card
          titulo="Conta Real"
          valor={formatCurrency(dadosExibicao.conta_real)}
          subtitulo="Base fiscal (NF)"
          icon={<Landmark size={20} />}
          cor="green"
          loading={loading}
        />
        <Card
          titulo="Conta Virtual"
          valor={formatCurrency(dadosExibicao.conta_virtual)}
          subtitulo="Gerencial (FEE)"
          icon={<Wallet size={20} />}
          cor="amber"
          loading={loading}
        />
      </div>

      {/* Linha 2: Detalhamento */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card
          titulo="WG Compra"
          valor={formatCurrency(dadosExibicao.valor_wg_compra)}
          subtitulo="Faturado via WG"
          icon={<Building2 size={20} />}
          cor="emerald"
          loading={loading}
        />
        <Card
          titulo="Cliente Direto"
          valor={formatCurrency(dadosExibicao.valor_cliente_direto)}
          subtitulo="Compra na loja"
          icon={<User size={20} />}
          cor="amber"
          loading={loading}
        />
        <Card
          titulo="Total FEE"
          valor={formatCurrency(dadosExibicao.valor_fee)}
          subtitulo="Taxa sobre Cliente Direto"
          icon={<Percent size={20} />}
          cor="purple"
          loading={loading}
        />
      </div>
    </div>
  );
}
