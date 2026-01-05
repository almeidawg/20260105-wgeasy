// ============================================================
// COMPONENTE: OnboardingArquitetura
// Sistema WG Easy - Grupo WG Almeida
// ============================================================
// Visualização do progresso das etapas do projeto de arquitetura
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
  MessageSquare,
  Map,
  Lightbulb,
  Layers,
  GitMerge,
  Calculator,
  FileCheck,
  Pencil,
  FileText,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Ícones para cada etapa
const ETAPA_ICONS: Record<number, React.ReactNode> = {
  1: <Ruler className="w-5 h-5" />,
  2: <MessageSquare className="w-5 h-5" />,
  3: <Map className="w-5 h-5" />,
  4: <Lightbulb className="w-5 h-5" />,
  5: <Layers className="w-5 h-5" />,
  6: <GitMerge className="w-5 h-5" />,
  7: <Calculator className="w-5 h-5" />,
  8: <FileCheck className="w-5 h-5" />,
  9: <Pencil className="w-5 h-5" />,
  10: <FileText className="w-5 h-5" />,
};

// Descrições resumidas das etapas
const ETAPA_RESUMOS: Record<number, string> = {
  1: "Medição do espaço, mapa de acessos, pontos elétricos e hidráulicos",
  2: "Entrevista profunda para entender suas necessidades e expectativas",
  3: "Apresentação da planta do imóvel como base para as soluções",
  4: "Conceito do projeto com plantas ilustradas, cores e texturas",
  5: "Projetos estrutural, elétrico, hidráulico, luminotécnico e outros",
  6: "Integração e compatibilização de todos os projetos",
  7: "Orçamento estimado alinhado com sua expectativa financeira",
  8: "Aprovação e regularização nos órgãos competentes",
  9: "Especificações de pisos, revestimentos, mobiliários e marcenaria",
  10: "Pranchas, detalhamentos e documentos completos para obra",
};

// Descrições detalhadas das etapas (para expansão)
const ETAPA_DETALHES: Record<number, string> = {
  1: "Ocorrerá a medição do espaço objeto do projeto, reunindo informações físicas e normativas: mapa de acessos, pontos elétricos e hidráulicos, níveis, tipos de materiais existentes, mapeamento de edificações ou elementos naturais existentes.",
  2: "Esta é uma das etapas mais importantes - uma investigação profunda das necessidades para entender o que você precisa, o que espera, o que gosta, o que não gosta e qual sua realidade para investimento.",
  3: "Para um melhor envolvimento com seu projeto, será apresentada a planta do imóvel conforme levantamento feito, mostrando onde poderão ser aplicadas as soluções solicitadas.",
  4: "Nesta etapa nosso profissional irá materializar as ideias com toda capacidade criativa e técnica. Usaremos planta layout ilustrada, com cores e texturas, imagens de referência, pesquisas e materiais físicos.",
  5: "Identificação e solicitação de projetos complementares: fundações, estrutural, elétrico, hidrossanitário, luminotécnico, ar condicionado, automação, reuso de águas pluviais, entre outros.",
  6: "Etapa que acontecerá várias vezes durante a elaboração, quantas forem necessárias, para garantir que todos os projetos estejam integrados e compatíveis entre si.",
  7: "Ferramenta desenvolvida para garantir que seu sonho esteja alinhado com a expectativa financeira. A partir do estudo preliminar aprovado, será montado um orçamento com estimativa de custos e cenários claros de execução.",
  8: "Serão requeridas as licenças necessárias de reforma, com envio do projeto legal para aprovação e regularização nos órgãos competentes, incluindo todos os procedimentos necessários.",
  9: "Consolidação das ideias e especificações finais: pisos, revestimentos, mobiliários, louças e metais, luminárias, eletrodomésticos e layout de marcenaria. É fundamental para minimizar mudanças e desperdícios na obra.",
  10: "Conjunto completo de informações para a obra: série de desenhos, pranchas e documentos com detalhamento do que e como será executado, direcionados aos contratados para execução.",
};

interface EtapaItem {
  id: string;
  texto: string;
  concluido: boolean;
  ordem: number;
  secao: string;
}

// Função para extrair título e descrição do texto
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

interface OnboardingArquiteturaProps {
  contratoId?: string;
  oportunidadeId?: string;
  clienteId?: string;
}

export default function OnboardingArquitetura({
  contratoId,
  oportunidadeId,
  clienteId,
}: OnboardingArquiteturaProps) {
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedEtapa, setExpandedEtapa] = useState<number | null>(null);

  useEffect(() => {
    carregarOnboarding();
  }, [contratoId, oportunidadeId, clienteId]);

  async function carregarOnboarding() {
    try {
      setLoading(true);

      // Buscar checklist de onboarding vinculado ao contrato ou oportunidade
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
        .ilike("titulo", "%onboarding%arquitetura%");

      if (contratoId) {
        query = query.eq("vinculo_tipo", "contrato").eq("vinculo_id", contratoId);
      } else if (oportunidadeId && !oportunidadeId.startsWith("CLIENTE-")) {
        // Só busca se for um UUID válido de oportunidade (não o fallback CLIENTE-)
        query = query.eq("vinculo_tipo", "oportunidade").eq("vinculo_id", oportunidadeId);
      } else if (clienteId) {
        // Fallback: buscar checklist vinculado ao cliente
        query = query.eq("vinculo_tipo", "cliente").eq("vinculo_id", clienteId);
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

        // Expandir automaticamente a primeira etapa não concluída
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
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="py-8 text-center">
          <Ruler className="w-12 h-12 mx-auto text-blue-400 mb-4" />
          <h3 className="font-semibold text-blue-800">
            Onboarding em Preparação
          </h3>
          <p className="text-sm text-blue-600 mt-2">
            As etapas do seu projeto serão disponibilizadas em breve.
          </p>
        </CardContent>
      </Card>
    );
  }

  const etapaAtual = checklist.itens.find((i) => !i.concluido)?.ordem || checklist.itens.length;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-oswald flex items-center gap-2">
              🏠 Acompanhamento do Projeto
            </CardTitle>
            <p className="text-blue-100 text-sm mt-1">
              {checklist.progresso}% concluído • Etapa {etapaAtual} de {checklist.itens.length}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{checklist.progresso}%</div>
          </div>
        </div>

        {/* Barra de Progresso */}
        <div className="mt-4 h-3 bg-blue-900/50 rounded-full overflow-hidden">
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
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                item.concluido
                  ? "bg-green-500 text-white"
                  : item.ordem === etapaAtual
                  ? "bg-white text-blue-600 ring-2 ring-white"
                  : "bg-blue-900/50 text-blue-200"
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
                    ? "bg-blue-50"
                    : "bg-white"
                }`}
              >
                {/* Header da Etapa */}
                <button
                  onClick={() =>
                    setExpandedEtapa(isExpanded ? null : item.ordem)
                  }
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                >
                  {/* Ícone de Status */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      item.concluido
                        ? "bg-green-500 text-white"
                        : isCurrent
                        ? "bg-blue-500 text-white"
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

                  {/* Informações */}
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
                            ? "text-blue-700"
                            : "text-gray-700"
                        }`}
                      >
                        {extrairTituloDescricao(item.texto).titulo}
                      </span>
                      {isCurrent && (
                        <Badge className="bg-blue-500 text-white text-xs">
                          Em andamento
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

                  {/* Chevron */}
                  <div className="flex-shrink-0 text-gray-400">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </button>

                {/* Conteúdo Expandido */}
                {isExpanded && (
                  <div className="px-4 pb-4 pl-16">
                    <div
                      className={`p-4 rounded-lg ${
                        item.concluido
                          ? "bg-green-100 border border-green-200"
                          : isCurrent
                          ? "bg-blue-100 border border-blue-200"
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

      {/* Footer informativo */}
      <div className="px-4 py-3 bg-amber-50 border-t border-amber-100">
        <p className="text-xs text-amber-700">
          💡 <strong>Dica:</strong> A cada etapa concluída, você receberá uma
          notificação. Clique nas etapas para ver mais detalhes sobre cada fase
          do seu projeto.
        </p>
      </div>
    </Card>
  );
}
