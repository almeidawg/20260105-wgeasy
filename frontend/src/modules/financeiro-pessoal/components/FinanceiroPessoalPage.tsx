import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  CreditCard,
  Tags,
  GitCompare,
  Bell,
} from 'lucide-react';
import { DashboardPessoal } from './DashboardPessoal';
import { LancamentosTable } from './LancamentosTable';
import { ContasPessoais } from './ContasPessoais';
import { CartoesCredito } from './CartoesCredito';

type TabId = 'dashboard' | 'lancamentos' | 'contas' | 'cartoes' | 'categorias' | 'cruzamento';

interface Tab {
  id: TabId;
  label: string;
  icon: typeof LayoutDashboard;
}

const tabs: Tab[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'lancamentos', label: 'Lançamentos', icon: Receipt },
  { id: 'contas', label: 'Contas', icon: Wallet },
  { id: 'cartoes', label: 'Cartões', icon: CreditCard },
  // { id: 'categorias', label: 'Categorias', icon: Tags },
  // { id: 'cruzamento', label: 'Cruzamento', icon: GitCompare },
];

export default function FinanceiroPessoalPage() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Meu Financeiro
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Controle suas finanças pessoais de forma simples e organizada
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 -mb-px overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                  ${activeTab === tab.id
                    ? 'border-[#F25C26] text-[#F25C26]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'dashboard' && <DashboardPessoal />}
          {activeTab === 'lancamentos' && <LancamentosTable />}
          {activeTab === 'contas' && <ContasPessoais />}
          {activeTab === 'cartoes' && <CartoesCredito />}
          {activeTab === 'categorias' && (
            <div className="text-center py-12 text-gray-500">
              Gerenciamento de categorias em desenvolvimento
            </div>
          )}
          {activeTab === 'cruzamento' && (
            <div className="text-center py-12 text-gray-500">
              Cruzamento de dados em desenvolvimento
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
