// src/components/cliente/DashboardProgressoNucleo.tsx
// Dashboard de progresso por núcleo contratado
// Usa contratos_nucleos para progresso real por núcleo (Arquitetura, Engenharia, Marcenaria)

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Building2,
  Hammer,
  Paintbrush,
  FileCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Play,
  Target,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface DashboardProgressoNucleoProps {
  clienteId: string;
  contratoId?: string;
}

interface ProgressoNucleo {
  id: string;
  nucleo: string;
  status: string;
  progresso: number;
  dataInicio?: string;
  dataPrevisao?: string;
  valorPrevisto?: number;
}

// Configuração visual por núcleo
const NUCLEO_CONFIG: Record<string, { icon: any; color: string; bgColor: string; label: string }> = {
  arquitetura: {
    icon: Building2,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    label: '🏛️ Arquitetura',
  },
  engenharia: {
    icon: Hammer,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    label: '🔧 Engenharia',
  },
  marcenaria: {
    icon: Paintbrush,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    label: '🪵 Marcenaria',
  },
  interiores: {
    icon: Paintbrush,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    label: '🎨 Interiores',
  },
  execucao: {
    icon: Hammer,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    label: '👷 Execução',
  },
  default: {
    icon: FileCheck,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    label: '📋 Geral',
  },
};

export default function DashboardProgressoNucleo({ clienteId, contratoId }: DashboardProgressoNucleoProps) {
  const [loading, setLoading] = useState(true);
  const [progressos, setProgressos] = useState<ProgressoNucleo[]>([]);
  const [progressoGeral, setProgressoGeral] = useState(0);

  useEffect(() => {
    carregarProgresso();
  }, [clienteId, contratoId]);

  async function carregarProgresso() {
    try {
      setLoading(true);

      // Buscar contratos do cliente
      let contratoIds: string[] = [];
      if (contratoId) {
        contratoIds = [contratoId];
      } else {
        const { data: contratos } = await supabase
          .from('contratos')
          .select('id')
          .eq('cliente_id', clienteId)
          .in('status', ['ativo', 'em_execucao']);

        contratoIds = (contratos || []).map((c) => c.id);
      }

      if (contratoIds.length === 0) {
        setProgressos([]);
        setLoading(false);
        return;
      }

      // Buscar progresso por núcleo da tabela contratos_nucleos
      const { data: nucleosData, error } = await supabase
        .from('contratos_nucleos')
        .select(`
          id,
          nucleo,
          status_kanban,
          progresso,
          data_inicio,
          data_previsao,
          valor_previsto
        `)
        .in('contrato_id', contratoIds);

      if (error) {
        console.log('Tabela contratos_nucleos não existe, usando fallback');
        // Fallback: buscar progresso da tabela oportunidades
        await carregarProgressoFallback(contratoIds);
        return;
      }

      // Transformar dados
      const progressosArray: ProgressoNucleo[] = (nucleosData || []).map((n: any) => ({
        id: n.id,
        nucleo: n.nucleo,
        status: n.status_kanban || 'backlog',
        progresso: n.progresso || 0,
        dataInicio: n.data_inicio,
        dataPrevisao: n.data_previsao,
        valorPrevisto: n.valor_previsto,
      }));

      // Ordenar por progresso (menos concluídos primeiro para priorizar atenção)
      progressosArray.sort((a, b) => a.progresso - b.progresso);

      // Calcular progresso geral
      const total = progressosArray.length;
      const somaProgresso = progressosArray.reduce((acc, p) => acc + p.progresso, 0);
      const media = total > 0 ? Math.round(somaProgresso / total) : 0;

      setProgressos(progressosArray);
      setProgressoGeral(media);
    } catch (error) {
      console.error('Erro ao carregar progresso:', error);
    } finally {
      setLoading(false);
    }
  }

  // Fallback: buscar progresso da oportunidade quando contratos_nucleos não existir
  async function carregarProgressoFallback(contratoIds: string[]) {
    try {
      // Buscar oportunidades vinculadas aos contratos
      const { data: oportunidades } = await supabase
        .from('oportunidades')
        .select('progresso_arquitetura, progresso_engenharia, progresso_marcenaria')
        .in('contrato_id', contratoIds);

      if (!oportunidades || oportunidades.length === 0) {
        setProgressos([]);
        return;
      }

      const opp = oportunidades[0];
      const progressosArray: ProgressoNucleo[] = [];

      if (opp.progresso_arquitetura !== null && opp.progresso_arquitetura !== undefined) {
        progressosArray.push({
          id: 'arq',
          nucleo: 'arquitetura',
          status: opp.progresso_arquitetura === 100 ? 'concluido' : 'em_andamento',
          progresso: opp.progresso_arquitetura,
        });
      }

      if (opp.progresso_engenharia !== null && opp.progresso_engenharia !== undefined) {
        progressosArray.push({
          id: 'eng',
          nucleo: 'engenharia',
          status: opp.progresso_engenharia === 100 ? 'concluido' : 'em_andamento',
          progresso: opp.progresso_engenharia,
        });
      }

      if (opp.progresso_marcenaria !== null && opp.progresso_marcenaria !== undefined) {
        progressosArray.push({
          id: 'marc',
          nucleo: 'marcenaria',
          status: opp.progresso_marcenaria === 100 ? 'concluido' : 'em_andamento',
          progresso: opp.progresso_marcenaria,
        });
      }

      progressosArray.sort((a, b) => a.progresso - b.progresso);

      const total = progressosArray.length;
      const somaProgresso = progressosArray.reduce((acc, p) => acc + p.progresso, 0);
      const media = total > 0 ? Math.round(somaProgresso / total) : 0;

      setProgressos(progressosArray);
      setProgressoGeral(media);
    } catch (error) {
      console.error('Erro no fallback de progresso:', error);
    }
  }

  function getConfig(nucleo: string) {
    return NUCLEO_CONFIG[nucleo] || NUCLEO_CONFIG.default;
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Carregando progresso...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mapear status para label amigável
  function getStatusLabel(status: string) {
    const statusMap: Record<string, { label: string; color: string }> = {
      backlog: { label: 'Aguardando', color: 'bg-gray-100 text-gray-600' },
      briefing: { label: 'Briefing', color: 'bg-purple-100 text-purple-700' },
      levantamento: { label: 'Levantamento', color: 'bg-blue-100 text-blue-700' },
      projeto: { label: 'Em Projeto', color: 'bg-indigo-100 text-indigo-700' },
      revisao: { label: 'Revisão', color: 'bg-amber-100 text-amber-700' },
      aprovacao: { label: 'Aprovação', color: 'bg-orange-100 text-orange-700' },
      execucao: { label: 'Execução', color: 'bg-blue-100 text-blue-700' },
      producao: { label: 'Produção', color: 'bg-teal-100 text-teal-700' },
      montagem: { label: 'Montagem', color: 'bg-cyan-100 text-cyan-700' },
      acabamento: { label: 'Acabamento', color: 'bg-pink-100 text-pink-700' },
      concluido: { label: 'Concluído', color: 'bg-green-100 text-green-700' },
    };
    return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-600' };
  }

  if (progressos.length === 0) {
    return (
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-6 text-center">
          <BarChart3 className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <p className="text-amber-800 font-medium">Projeto em preparação</p>
          <p className="text-sm text-amber-600 mt-1">
            O progresso por núcleo será exibido quando seu projeto estiver em andamento.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Contar núcleos concluídos
  const nucleosConcluidos = progressos.filter(p => p.progresso === 100).length;

  return (
    <div className="space-y-6">
      {/* Resumo Geral */}
      <Card className="bg-gradient-to-r from-blue-600 to-blue-800 text-white overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-white">
            <TrendingUp className="w-5 h-5" />
            📊 Progresso Geral do Projeto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Progresso Geral */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-100">Evolução Total</span>
                <span className="text-2xl font-bold">{progressoGeral}%</span>
              </div>
              <Progress value={progressoGeral} className="h-4 bg-blue-400" />
            </div>

            {/* Núcleos */}
            <div className="flex gap-2">
              <div className="flex-1 text-center p-3 bg-white/10 rounded-lg">
                <div className="text-2xl font-bold">{progressos.length}</div>
                <div className="text-xs text-blue-100">Núcleos</div>
              </div>
              <div className="flex-1 text-center p-3 bg-green-500/20 rounded-lg">
                <div className="flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-xl font-bold">{nucleosConcluidos}</span>
                </div>
                <div className="text-xs text-blue-100">Concluídos</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progresso por Núcleo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            📈 Evolução por Área
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {progressos.map((progresso) => {
              const config = getConfig(progresso.nucleo);
              const Icon = config.icon;
              const statusInfo = getStatusLabel(progresso.status);

              return (
                <div
                  key={progresso.id}
                  className={`p-4 rounded-xl border-2 ${config.bgColor} border-opacity-50`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${config.bgColor} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${config.color}`} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{config.label}</h4>
                        <Badge className={`text-xs ${statusInfo.color}`}>
                          {progresso.progresso === 100 ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Concluído
                            </>
                          ) : progresso.progresso > 0 ? (
                            <>
                              <Play className="w-3 h-3 mr-1" />
                              {statusInfo.label}
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 mr-1" />
                              Aguardando
                            </>
                          )}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{progresso.progresso}%</div>
                      {progresso.dataPrevisao && (
                        <p className="text-xs text-gray-500">
                          Previsão: {new Date(progresso.dataPrevisao).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Barra de Progresso */}
                  <Progress value={progresso.progresso} className="h-3 mb-3" />

                  {/* Detalhes */}
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {progresso.dataInicio && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>Início: {new Date(progresso.dataInicio).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                    {progresso.dataPrevisao && (
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        <span>Meta: {new Date(progresso.dataPrevisao).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
