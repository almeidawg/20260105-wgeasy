// ============================================================
// COMPONENTE: CardsMetricas
// Sistema WG Easy - Grupo WG Almeida
// ============================================================
// Cards horizontais: Total Pendentes, Orçamentos, Compras, Solicitações, Valor Total
// ============================================================

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Clock,
  FileText,
  ShoppingCart,
  MessageSquare,
  DollarSign,
  Loader2
} from "lucide-react";

interface CardsMetricasProps {
  clienteId: string;
  contratoId?: string;
}

interface Metricas {
  totalPendentes: number;
  orcamentos: number;
  compras: number;
  solicitacoes: number;
  valorPendente: number;
}

export default function CardsMetricas({ clienteId, contratoId }: CardsMetricasProps) {
  const [metricas, setMetricas] = useState<Metricas>({
    totalPendentes: 0,
    orcamentos: 0,
    compras: 0,
    solicitacoes: 0,
    valorPendente: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarMetricas();
  }, [clienteId, contratoId]);

  async function carregarMetricas() {
    try {
      setLoading(true);

      // Buscar orçamentos pendentes
      const { data: orcamentosData } = await supabase
        .from("orcamentos_cliente")
        .select("id, valor_total, status")
        .eq("cliente_id", clienteId)
        .eq("status", "pendente");

      // Buscar compras pendentes (projetos_compras)
      const { data: comprasData } = await supabase
        .from("projetos_compras")
        .select("id")
        .eq("status", "PENDENTE");

      // Buscar solicitações pendentes
      const { data: solicitacoesData } = await supabase
        .from("comentarios_notificacoes")
        .select("id")
        .eq("pessoa_id", clienteId)
        .eq("status", "pendente");

      const orcamentos = orcamentosData?.length || 0;
      const compras = comprasData?.length || 0;
      const solicitacoes = solicitacoesData?.length || 0;
      const valorPendente = orcamentosData?.reduce((acc, o) => acc + (o.valor_total || 0), 0) || 0;

      setMetricas({
        totalPendentes: orcamentos + compras + solicitacoes,
        orcamentos,
        compras,
        solicitacoes,
        valorPendente,
      });
    } catch (error) {
      console.error("Erro ao carregar métricas:", error);
      // Dados zerados em caso de erro
      setMetricas({
        totalPendentes: 0,
        orcamentos: 0,
        compras: 0,
        solicitacoes: 0,
        valorPendente: 0,
      });
    } finally {
      setLoading(false);
    }
  }

  const cards = [
    {
      label: "Total Pendentes",
      value: metricas.totalPendentes.toString(),
      icon: Clock,
      bgColor: "bg-white",
      iconBg: "bg-red-100",
      iconColor: "text-red-500",
    },
    {
      label: "Orçamentos",
      value: metricas.orcamentos.toString(),
      icon: FileText,
      bgColor: "bg-white",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-500",
    },
    {
      label: "Compras",
      value: metricas.compras.toString(),
      icon: ShoppingCart,
      bgColor: "bg-white",
      iconBg: "bg-green-100",
      iconColor: "text-green-500",
    },
    {
      label: "Solicitações",
      value: metricas.solicitacoes.toString(),
      icon: MessageSquare,
      bgColor: "bg-white",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-500",
    },
    {
      label: "Valor Total Pendente",
      value: `R$ ${metricas.valorPendente.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      bgColor: "bg-gradient-to-r from-[#F25C26] to-[#ff7b4a]",
      iconBg: "bg-white/20",
      iconColor: "text-white",
      textColor: "text-white",
      isHighlight: true,
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 w-16 bg-gray-100 rounded"></div>
                <div className="h-6 w-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`${card.bgColor} rounded-xl p-4 shadow-sm border ${card.isHighlight ? 'border-transparent' : 'border-gray-100'} hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${card.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
              <div className="min-w-0">
                <div className={`text-xs ${card.isHighlight ? 'text-white/80' : 'text-gray-500'}`}>
                  {card.label}
                </div>
                <div className={`text-lg font-bold truncate ${card.textColor || 'text-gray-900'}`}>
                  {card.value}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
