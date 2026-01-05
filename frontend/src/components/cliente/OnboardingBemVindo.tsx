// ============================================================
// COMPONENTE: OnboardingBemVindo
// Sistema WG Easy - Grupo WG Almeida
// ============================================================
// Tela de boas-vindas e orientações iniciais para o cliente
// Apresenta o Grupo WG e orienta sobre a jornada do projeto
// ============================================================

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Circle,
  ChevronRight,
  Building2,
  Hammer,
  Paintbrush,
  Users,
  Phone,
  Mail,
  MapPin,
  Clock,
  FileText,
  MessageSquare,
  Calendar,
  Star,
  Heart,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

interface OnboardingBemVindoProps {
  clienteId: string;
  clienteNome?: string;
  contratoId?: string;
  nucleosContratados?: string[];
  onIniciar?: () => void;
}

// Informações dos núcleos
const NUCLEOS_INFO = {
  arquitetura: {
    icon: Building2,
    titulo: "Arquitetura",
    cor: "bg-blue-500",
    descricao: "Projetos arquitetônicos, layouts e design de interiores",
  },
  engenharia: {
    icon: Hammer,
    titulo: "Engenharia",
    cor: "bg-orange-500",
    descricao: "Execução de obras, reformas e construções",
  },
  marcenaria: {
    icon: Paintbrush,
    titulo: "Marcenaria",
    cor: "bg-amber-500",
    descricao: "Móveis planejados sob medida e instalação",
  },
};

// Etapas do onboarding de boas-vindas
const ETAPAS_BOAS_VINDAS = [
  {
    id: 1,
    titulo: "Conheça seu Portal",
    descricao: "Nesta área você acompanha todo o andamento do seu projeto em tempo real.",
    icone: Sparkles,
  },
  {
    id: 2,
    titulo: "Documentos e Arquivos",
    descricao: "Acesse plantas, propostas, contratos e fotos do seu projeto.",
    icone: FileText,
  },
  {
    id: 3,
    titulo: "Cronograma",
    descricao: "Veja as datas previstas para cada etapa do seu projeto.",
    icone: Calendar,
  },
  {
    id: 4,
    titulo: "Comunicação",
    descricao: "Entre em contato conosco diretamente pelo portal quando precisar.",
    icone: MessageSquare,
  },
];

export default function OnboardingBemVindo({
  clienteId,
  clienteNome,
  contratoId,
  nucleosContratados = [],
  onIniciar,
}: OnboardingBemVindoProps) {
  const [etapaAtual, setEtapaAtual] = useState(0);
  const [mostrarBemVindo, setMostrarBemVindo] = useState(true);
  const [nomeCliente, setNomeCliente] = useState(clienteNome || "");

  useEffect(() => {
    if (!clienteNome && clienteId) {
      carregarNomeCliente();
    }
  }, [clienteId, clienteNome]);

  async function carregarNomeCliente() {
    try {
      const { data } = await supabase
        .from("pessoas")
        .select("nome")
        .eq("id", clienteId)
        .single();

      if (data?.nome) {
        setNomeCliente(data.nome.split(" ")[0]); // Primeiro nome
      }
    } catch (error) {
      console.error("Erro ao carregar nome:", error);
    }
  }

  function avancarEtapa() {
    if (etapaAtual < ETAPAS_BOAS_VINDAS.length - 1) {
      setEtapaAtual(etapaAtual + 1);
    } else {
      setMostrarBemVindo(false);
      onIniciar?.();
    }
  }

  // Tela de boas-vindas inicial
  if (mostrarBemVindo && etapaAtual === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full overflow-hidden shadow-2xl">
          {/* Header com gradiente */}
          <div className="bg-gradient-to-br from-[#5E9B94] via-[#4A8B84] to-[#3A7B74] p-8 text-white text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-oswald font-bold mb-2">
              Bem-vindo{nomeCliente ? `, ${nomeCliente}` : ""}!
            </h1>
            <p className="text-white/80 text-lg">
              É um prazer ter você conosco
            </p>
          </div>

          <CardContent className="p-8">
            {/* Mensagem de boas-vindas */}
            <div className="text-center mb-8">
              <p className="text-gray-600 text-lg leading-relaxed">
                O <strong className="text-[#5E9B94]">Grupo WG Almeida</strong> agradece
                a sua confiança. Estamos animados para transformar seu sonho em realidade!
              </p>
            </div>

            {/* Núcleos Contratados */}
            {nucleosContratados.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4 text-center">
                  Serviços contratados
                </h3>
                <div className="flex justify-center gap-4">
                  {nucleosContratados.map((nucleo) => {
                    const info = NUCLEOS_INFO[nucleo as keyof typeof NUCLEOS_INFO];
                    if (!info) return null;
                    const Icon = info.icon;

                    return (
                      <div
                        key={nucleo}
                        className="flex flex-col items-center p-4 bg-gray-50 rounded-xl"
                      >
                        <div className={`w-12 h-12 ${info.cor} rounded-full flex items-center justify-center mb-2`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-semibold text-gray-700">{info.titulo}</span>
                        <span className="text-xs text-gray-500 text-center mt-1">
                          {info.descricao}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* O que você encontrará */}
            <div className="bg-[#5E9B94]/5 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#5E9B94]" />
                Neste portal você pode:
              </h3>
              <ul className="space-y-3">
                {ETAPAS_BOAS_VINDAS.map((etapa) => {
                  const Icon = etapa.icone;
                  return (
                    <li key={etapa.id} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-[#5E9B94]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-[#5E9B94]" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">{etapa.titulo}</span>
                        <p className="text-sm text-gray-500">{etapa.descricao}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Botão de ação */}
            <Button
              onClick={() => setEtapaAtual(1)}
              className="w-full bg-[#5E9B94] hover:bg-[#4A8B84] text-white py-6 text-lg font-semibold"
            >
              Conhecer meu Portal
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>

            {/* Contato */}
            <div className="mt-8 pt-6 border-t text-center">
              <p className="text-sm text-gray-500 mb-3">Precisa de ajuda?</p>
              <div className="flex justify-center gap-6">
                <a
                  href="tel:+5511999999999"
                  className="flex items-center gap-2 text-[#5E9B94] hover:underline text-sm"
                >
                  <Phone className="w-4 h-4" />
                  (11) 99999-9999
                </a>
                <a
                  href="mailto:contato@wgalmeida.com.br"
                  className="flex items-center gap-2 text-[#5E9B94] hover:underline text-sm"
                >
                  <Mail className="w-4 h-4" />
                  contato@wgalmeida.com.br
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Tour pelas funcionalidades
  if (mostrarBemVindo && etapaAtual > 0) {
    const etapa = ETAPAS_BOAS_VINDAS[etapaAtual - 1];
    const Icon = etapa.icone;

    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <Card className="max-w-lg w-full overflow-hidden shadow-xl">
          {/* Indicador de progresso */}
          <div className="bg-gray-100 p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">
                Etapa {etapaAtual} de {ETAPAS_BOAS_VINDAS.length}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setMostrarBemVindo(false);
                  onIniciar?.();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                Pular tour
              </Button>
            </div>
            <div className="flex gap-1">
              {ETAPAS_BOAS_VINDAS.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    idx < etapaAtual ? "bg-[#5E9B94]" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>

          <CardContent className="p-8 text-center">
            {/* Ícone da etapa */}
            <div className="w-20 h-20 bg-[#5E9B94]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon className="w-10 h-10 text-[#5E9B94]" />
            </div>

            {/* Conteúdo */}
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {etapa.titulo}
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              {etapa.descricao}
            </p>

            {/* Botões de navegação */}
            <div className="flex gap-4">
              {etapaAtual > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setEtapaAtual(etapaAtual - 1)}
                  className="flex-1"
                >
                  Voltar
                </Button>
              )}
              <Button
                onClick={avancarEtapa}
                className="flex-1 bg-[#5E9B94] hover:bg-[#4A8B84] text-white"
              >
                {etapaAtual === ETAPAS_BOAS_VINDAS.length ? (
                  <>
                    Começar
                    <Sparkles className="ml-2 w-4 h-4" />
                  </>
                ) : (
                  <>
                    Próximo
                    <ChevronRight className="ml-1 w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Card resumido após completar onboarding
  return (
    <Card className="bg-gradient-to-r from-[#5E9B94] to-[#4A8B84] text-white">
      <CardContent className="py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">
                Olá{nomeCliente ? `, ${nomeCliente}` : ""}!
              </h3>
              <p className="text-white/80 text-sm">
                Acompanhe seu projeto aqui no portal
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {nucleosContratados.map((nucleo) => {
              const info = NUCLEOS_INFO[nucleo as keyof typeof NUCLEOS_INFO];
              if (!info) return null;
              const Icon = info.icon;
              return (
                <div
                  key={nucleo}
                  className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
                  title={info.titulo}
                >
                  <Icon className="w-5 h-5" />
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
