// ============================================================
// COMPONENTE: OnboardingMarcenaria
// Sistema WG Easy - Grupo WG Almeida
// ============================================================
// Visualização do progresso das etapas de marcenaria
// na área do cliente
// ============================================================

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  CheckCircle2,
  Circle,
  Clock,
  ChevronDown,
  ChevronUp,
  Ruler,
  Layers,
  Scissors,
  Package,
  Truck,
  Hammer,
  Sparkles,
  CheckSquare,
  ShieldCheck,
  Star,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Ícones para cada etapa de marcenaria
const ETAPA_ICONS: Record<number, React.ReactNode> = {
  1: <Ruler className="w-5 h-5" />,
  2: <Layers className="w-5 h-5" />,
  3: <CheckSquare className="w-5 h-5" />,
  4: <Scissors className="w-5 h-5" />,
  5: <Package className="w-5 h-5" />,
  6: <Truck className="w-5 h-5" />,
  7: <Hammer className="w-5 h-5" />,
  8: <Sparkles className="w-5 h-5" />,
  9: <ShieldCheck className="w-5 h-5" />,
  10: <Star className="w-5 h-5" />,
};

// Descrições resumidas das etapas de marcenaria
const ETAPA_RESUMOS: Record<number, string> = {
  1: "Medição precisa de todos os ambientes para produção",
  2: "Desenvolvimento do projeto detalhado de cada móvel",
  3: "Aprovação dos projetos, materiais e acabamentos",
  4: "Corte das chapas e início da produção fabril",
  5: "Montagem dos módulos e preparação para transporte",
  6: "Transporte dos móveis até o local de instalação",
  7: "Instalação profissional de todos os móveis",
  8: "Ajustes finais, regulagens e limpeza completa",
  9: "Vistoria de qualidade e correção de pendências",
  10: "Entrega oficial com termo de aceite",
};

// Descrições detalhadas das etapas
const ETAPA_DETALHES: Record<number, string> = {
  1: "Nossa equipe técnica realiza medição precisa de todos os ambientes que receberão marcenaria. São verificados níveis, esquadros, pontos de instalação elétrica e hidráulica, e todas as particularidades que afetam a produção.",
  2: "Com base nas medições e no projeto de arquitetura, desenvolvemos os projetos executivos de cada móvel: armários, cozinha, closet, home office, etc. Cada detalhe é pensado para maximizar espaço e funcionalidade.",
  3: "Apresentação dos projetos finais com detalhamento de materiais, ferragens, acabamentos e cores. Nesta etapa você aprova cada item antes de iniciarmos a produção, garantindo que tudo esteja conforme esperado.",
  4: "Início da produção na fábrica. As chapas são cortadas com precisão milimétrica em máquinas CNC. Bordas são coladas, furos de ferragem são feitos e cada peça é identificada para montagem.",
  5: "Os módulos são pré-montados na fábrica, testando encaixes e ajustes. Cada peça é embalada com proteção adequada para transporte seguro até a obra.",
  6: "Logística cuidadosa de transporte dos móveis. Os módulos são organizados por ambiente para otimizar a instalação. Cuidado especial para evitar danos durante o trajeto.",
  7: "Nossa equipe de montadores profissionais realiza a instalação de todos os móveis. São verificados níveis, prumos e todos os ajustes necessários para perfeito encaixe.",
  8: "Após a instalação, realizamos ajustes finos: regulagem de dobradiças, corrediças, portas e gavetas. Limpeza completa de todos os móveis instalados.",
  9: "Vistoria técnica para garantir que tudo está funcionando perfeitamente. Eventuais pendências são identificadas e corrigidas antes da entrega final.",
  10: "Momento especial de entrega da sua marcenaria completa. Você receberá orientações de uso, manutenção e garantia de todos os móveis instalados.",
};

interface EtapaItem {
  id: string;
  texto: string;
  concluido: boolean;
  ordem: number;
  secao: string;
}

function extrairTituloDescricao(texto: string): { titulo: string; descricao: string } {
  const partes = texto.split(': ');
  if (partes.length >= 2) {
    return {
      titulo: partes[0],
      descricao: partes.slice(1).join(': ')
    };
  }
  return { titulo: texto, descricao: '' };
}

interface Checklist {
  id: string;
  titulo: string;
  itens: EtapaItem[];
  progresso: number;
}

interface OnboardingMarcenariaProps {
  contratoId?: string;
  oportunidadeId?: string;
  clienteId?: string;
}

export default function OnboardingMarcenaria({
  contratoId,
  oportunidadeId,
  clienteId,
}: OnboardingMarcenariaProps) {
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedEtapa, setExpandedEtapa] = useState<number | null>(null);

  useEffect(() => {
    carregarOnboarding();
  }, [contratoId, oportunidadeId, clienteId]);

  async function carregarOnboarding() {
    try {
      setLoading(true);

      // Buscar checklist de onboarding de marcenaria
      let query = supabase
        .from("checklists")
        .select(`
          id,
          titulo,
          checklist_itens (
            id,
            texto,
            concluido,
            ordem,
            secao
          )
        `)
        .ilike("titulo", "%onboarding%marcenaria%");

      if (contratoId) {
        query = query.eq("vinculo_tipo", "contrato").eq("vinculo_id", contratoId);
      } else if (oportunidadeId) {
        query = query.eq("vinculo_tipo", "oportunidade").eq("vinculo_id", oportunidadeId);
      }

      const { data, error } = await query.single();

      if (error && error.code !== "PGRST116") {
        console.error("Erro ao carregar onboarding:", error);
      }

      if (data) {
        const itens = (data.checklist_itens || []).sort(
          (a: any, b: any) => a.ordem - b.ordem
        );
        const concluidos = itens.filter((i: any) => i.concluido).length;
        const progresso = itens.length > 0 ? Math.round((concluidos / itens.length) * 100) : 0;

        setChecklist({
          id: data.id,
          titulo: data.titulo,
          itens,
          progresso,
        });

        const primeiraIncompleta = itens.find((i: any) => !i.concluido);
        if (primeiraIncompleta) {
          setExpandedEtapa(primeiraIncompleta.ordem);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar onboarding:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!checklist) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="py-8 text-center">
          <Package className="w-12 h-12 mx-auto text-amber-400 mb-4" />
          <h3 className="font-semibold text-amber-800">
            Acompanhamento da Marcenaria em Preparação
          </h3>
          <p className="text-sm text-amber-600 mt-2">
            As etapas de produção serão disponibilizadas quando a marcenaria iniciar.
          </p>
        </CardContent>
      </Card>
    );
  }

  const etapaAtual = checklist.itens.find((i) => !i.concluido)?.ordem || checklist.itens.length;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-amber-500 to-amber-700 text-white">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-oswald flex items-center gap-2">
              🪵 Acompanhamento da Marcenaria
            </CardTitle>
            <p className="text-amber-100 text-sm mt-1">
              {checklist.progresso}% concluído • Etapa {etapaAtual} de {checklist.itens.length}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{checklist.progresso}%</div>
          </div>
        </div>

        {/* Barra de Progresso */}
        <div className="mt-4 h-3 bg-amber-900/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500 ease-out"
            style={{ width: `${checklist.progresso}%` }}
          />
        </div>

        {/* Mini indicadores de etapas */}
        <div className="flex justify-between mt-3">
          {checklist.itens.map((item) => (
            <div
              key={item.id}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                item.concluido
                  ? "bg-green-500 text-white"
                  : item.ordem === etapaAtual
                  ? "bg-white text-amber-600 ring-2 ring-white"
                  : "bg-amber-900/50 text-amber-200"
              }`}
            >
              {item.ordem}
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y">
          {checklist.itens.map((item) => {
            const isExpanded = expandedEtapa === item.ordem;
            const isCurrent = item.ordem === etapaAtual && !item.concluido;

            return (
              <div
                key={item.id}
                className={`transition-colors ${
                  item.concluido
                    ? "bg-green-50"
                    : isCurrent
                    ? "bg-amber-50"
                    : "bg-white"
                }`}
              >
                <button
                  onClick={() =>
                    setExpandedEtapa(isExpanded ? null : item.ordem)
                  }
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      item.concluido
                        ? "bg-green-500 text-white"
                        : isCurrent
                        ? "bg-amber-500 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {item.concluido ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : isCurrent ? (
                      <Clock className="w-5 h-5" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </div>

                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">
                        {ETAPA_ICONS[item.ordem]}
                      </span>
                      <span
                        className={`font-semibold ${
                          item.concluido
                            ? "text-green-700"
                            : isCurrent
                            ? "text-amber-700"
                            : "text-gray-700"
                        }`}
                      >
                        {extrairTituloDescricao(item.texto).titulo}
                      </span>
                      {isCurrent && (
                        <Badge className="bg-amber-500 text-white text-xs">
                          Em produção
                        </Badge>
                      )}
                      {item.concluido && (
                        <Badge className="bg-green-500 text-white text-xs">
                          Concluído
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {ETAPA_RESUMOS[item.ordem]}
                    </p>
                  </div>

                  <div className="flex-shrink-0 text-gray-400">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 pl-16">
                    <div
                      className={`p-4 rounded-lg ${
                        item.concluido
                          ? "bg-green-100 border border-green-200"
                          : isCurrent
                          ? "bg-amber-100 border border-amber-200"
                          : "bg-gray-100 border border-gray-200"
                      }`}
                    >
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {extrairTituloDescricao(item.texto).descricao || ETAPA_DETALHES[item.ordem] || "Detalhes desta etapa serão disponibilizados em breve."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>

      <div className="px-4 py-3 bg-amber-50 border-t border-amber-100">
        <p className="text-xs text-amber-700">
          🪵 <strong>Qualidade garantida:</strong> Cada peça passa por rigoroso
          controle de qualidade na fábrica antes do envio para instalação.
        </p>
      </div>
    </Card>
  );
}
