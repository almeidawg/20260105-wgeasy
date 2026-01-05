// ============================================================
// COMPONENTE: CardsStatusProjeto
// Sistema WG Easy - Grupo WG Almeida
// ============================================================
// Cards compactos mostrando Total, Em andamento, Atrasadas, Concluídas
// ============================================================

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Loader2
} from "lucide-react";

interface CardsStatusProjetoProps {
  clienteId: string;
  contratoId?: string;
}

interface StatusCounts {
  total: number;
  emAndamento: number;
  atrasadas: number;
  concluidas: number;
}

export default function CardsStatusProjeto({ clienteId, contratoId }: CardsStatusProjetoProps) {
  const [counts, setCounts] = useState<StatusCounts>({
    total: 0,
    emAndamento: 0,
    atrasadas: 0,
    concluidas: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarStatus();
  }, [clienteId, contratoId]);

  async function carregarStatus() {
    try {
      setLoading(true);

      // Buscar tarefas/etapas do projeto
      let query = supabase
        .from("cronograma_etapas")
        .select("id, status, data_fim")
        .order("created_at", { ascending: false });

      if (contratoId) {
        query = query.eq("contrato_id", contratoId);
      }

      const { data, error } = await query;

      if (error || !data || data.length === 0) {
        setCounts({ total: 0, emAndamento: 0, atrasadas: 0, concluidas: 0 });
        return;
      }

      const hoje = new Date();
      const total = data.length;
      const concluidas = data.filter((t: any) => t.status === "concluido").length;
      const atrasadas = data.filter((t: any) => {
        if (t.status === "concluido") return false;
        if (!t.data_fim) return false;
        return new Date(t.data_fim) < hoje;
      }).length;
      const emAndamento = data.filter((t: any) =>
        t.status === "em_andamento" || t.status === "em_progresso"
      ).length;

      setCounts({ total, emAndamento, atrasadas, concluidas });
    } catch (error) {
      console.error("Erro ao carregar status:", error);
      setCounts({ total: 0, emAndamento: 0, atrasadas: 0, concluidas: 0 });
    } finally {
      setLoading(false);
    }
  }

  const cards = [
    {
      label: "Total",
      value: counts.total,
      icon: FileText,
      bgColor: "bg-white",
      iconBg: "bg-gray-100",
      iconColor: "text-gray-600",
      textColor: "text-gray-900",
    },
    {
      label: "em andamento",
      value: counts.emAndamento,
      icon: Clock,
      bgColor: "bg-white",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      textColor: "text-gray-900",
    },
    {
      label: "Atrasadas",
      value: counts.atrasadas,
      icon: AlertTriangle,
      bgColor: "bg-white",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      textColor: "text-gray-900",
    },
    {
      label: "Concluídas",
      value: counts.concluidas,
      icon: CheckCircle2,
      bgColor: "bg-white",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      textColor: "text-gray-900",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
              <div className="space-y-2">
                <div className="h-6 w-8 bg-gray-200 rounded"></div>
                <div className="h-3 w-16 bg-gray-100 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`${card.bgColor} rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${card.iconBg} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
              <div>
                <div className={`text-2xl font-bold ${card.textColor}`}>
                  {card.value}
                </div>
                <div className="text-xs text-gray-500">{card.label}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
