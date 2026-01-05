// ============================================================
// COMPONENTE: OnboardingEngenharia
// Sistema WG Easy - Grupo WG Almeida
// ============================================================
// Visualização do progresso das etapas de engenharia/obra
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
  ClipboardList,
  ShoppingCart,
  Hammer,
  HardHat,
  Wrench,
  Droplets,
  Zap,
  Wind,
  Paintbrush,
  Shield,
  Key,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Ícones para cada etapa de engenharia
const ETAPA_ICONS: Record<number, React.ReactNode> = {
  1: <ClipboardList className="w-5 h-5" />,
  2: <ShoppingCart className="w-5 h-5" />,
  3: <Hammer className="w-5 h-5" />,
  4: <HardHat className="w-5 h-5" />,
  5: <Wrench className="w-5 h-5" />,
  6: <Droplets className="w-5 h-5" />,
  7: <Zap className="w-5 h-5" />,
  8: <Wind className="w-5 h-5" />,
  9: <Paintbrush className="w-5 h-5" />,
  10: <Shield className="w-5 h-5" />,
  11: <Key className="w-5 h-5" />,
};

// Descrições resumidas das etapas de engenharia
const ETAPA_RESUMOS: Record<number, string> = {
  1: "Planejamento completo da obra com cronograma e equipes",
  2: "Aquisição de materiais e contratação de mão de obra",
  3: "Demolições, remoções e preparação do canteiro de obras",
  4: "Fundações, estruturas e reformas estruturais necessárias",
  5: "Alvenaria, divisórias, contramarcos e infraestrutura",
  6: "Instalações hidráulicas, esgoto e água quente/fria",
  7: "Instalações elétricas, automação e cabeamento",
  8: "Ar condicionado, ventilação e exaustão",
  9: "Pisos, revestimentos, pintura e acabamentos",
  10: "Vistoria final, testes e correções de pendências",
  11: "Entrega das chaves e documentação completa",
};

// Descrições detalhadas das etapas
const ETAPA_DETALHES: Record<number, string> = {
  1: "Início do canteiro de obras com toda a preparação necessária: definição de cronograma detalhado, mobilização das equipes, organização do espaço de trabalho e definição das etapas de execução conforme os projetos aprovados.",
  2: "Processo de compras de todos os materiais necessários conforme especificações do projeto. Inclui cotações, negociação com fornecedores, logística de entrega e contratação de prestadores de serviço especializados.",
  3: "Demolição e remoção de elementos existentes conforme projeto. Esta etapa prepara o espaço para as novas instalações, incluindo descarte correto de entulho e materiais.",
  4: "Execução de fundações, estruturas metálicas ou de concreto, reforços estruturais e adequações necessárias. Todo trabalho é acompanhado pelo engenheiro responsável.",
  5: "Construção de paredes, divisórias, instalação de contramarcos de portas e janelas, e preparação da infraestrutura para as instalações complementares.",
  6: "Instalação completa do sistema hidrossanitário: água fria e quente, esgoto, ralos, registros e conexões. Inclui testes de pressão e estanqueidade.",
  7: "Instalação de toda a rede elétrica, quadros de distribuição, pontos de luz, tomadas e infraestrutura para automação residencial. Inclui testes e certificação.",
  8: "Instalação dos sistemas de climatização: ar condicionado, ventilação mecânica, exaustão e renovação de ar conforme projeto de conforto térmico.",
  9: "Aplicação de pisos, revestimentos cerâmicos, porcelanatos, pinturas, texturizações e todos os acabamentos finais que dão identidade ao ambiente.",
  10: "Vistoria técnica completa para identificar e corrigir eventuais pendências. Teste de todos os sistemas instalados e garantia de funcionamento correto.",
  11: "Momento especial de entrega do projeto concluído. Inclui manual do proprietário, garantias de equipamentos e orientações de uso e manutenção.",
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

interface OnboardingEngenhariaProps {
  contratoId?: string;
  oportunidadeId?: string;
  clienteId?: string;
}

export default function OnboardingEngenharia({
  contratoId,
  oportunidadeId,
  clienteId,
}: OnboardingEngenhariaProps) {
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedEtapa, setExpandedEtapa] = useState<number | null>(null);

  useEffect(() => {
    carregarOnboarding();
  }, [contratoId, oportunidadeId, clienteId]);

  async function carregarOnboarding() {
    try {
      setLoading(true);

      // Buscar checklist de onboarding de engenharia
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
        .ilike("titulo", "%onboarding%engenharia%");

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
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="py-8 text-center">
          <HardHat className="w-12 h-12 mx-auto text-orange-400 mb-4" />
          <h3 className="font-semibold text-orange-800">
            Acompanhamento da Obra em Preparação
          </h3>
          <p className="text-sm text-orange-600 mt-2">
            As etapas de execução serão disponibilizadas quando a obra iniciar.
          </p>
        </CardContent>
      </Card>
    );
  }

  const etapaAtual = checklist.itens.find((i) => !i.concluido)?.ordem || checklist.itens.length;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-700 text-white">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-oswald flex items-center gap-2">
              🔧 Acompanhamento da Obra
            </CardTitle>
            <p className="text-orange-100 text-sm mt-1">
              {checklist.progresso}% concluído • Etapa {etapaAtual} de {checklist.itens.length}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{checklist.progresso}%</div>
          </div>
        </div>

        {/* Barra de Progresso */}
        <div className="mt-4 h-3 bg-orange-900/50 rounded-full overflow-hidden">
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
                  ? "bg-white text-orange-600 ring-2 ring-white"
                  : "bg-orange-900/50 text-orange-200"
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
                    ? "bg-orange-50"
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
                        ? "bg-orange-500 text-white"
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
                            ? "text-orange-700"
                            : "text-gray-700"
                        }`}
                      >
                        {extrairTituloDescricao(item.texto).titulo}
                      </span>
                      {isCurrent && (
                        <Badge className="bg-orange-500 text-white text-xs">
                          Em execução
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
                          ? "bg-orange-100 border border-orange-200"
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

      <div className="px-4 py-3 bg-orange-50 border-t border-orange-100">
        <p className="text-xs text-orange-700">
          👷 <strong>Importante:</strong> Cada etapa concluída passa por vistoria
          de qualidade. Você será notificado sobre o progresso da sua obra.
        </p>
      </div>
    </Card>
  );
}
