// src/components/cliente/CronogramaCliente.tsx
// Visualização do cronograma do projeto para a área do cliente
// Mostra etapas, marcos e progresso de forma visual

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  Milestone,
  Flag,
  Building2,
  Hammer,
  Paintbrush,
  Package,
  BarChart3,
  List,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import GanttCronograma from './GanttCronograma';

interface CronogramaClienteProps {
  clienteId: string;
  contratoId?: string;
}

interface EtapaCronograma {
  id: string;
  titulo: string;
  descricao?: string;
  nucleo?: string;
  status: 'pendente' | 'em_andamento' | 'concluido' | 'atrasado';
  dataInicio?: string;
  dataFim?: string;
  dataConclusao?: string;
  progresso: number;
  subitens: {
    id: string;
    titulo: string;
    concluido: boolean;
    dataLimite?: string;
  }[];
}

const NUCLEO_ICONS: Record<string, any> = {
  arquitetura: Building2,
  engenharia: Hammer,
  marcenaria: Paintbrush,
  interiores: Paintbrush,
  default: Package,
};

const NUCLEO_COLORS: Record<string, string> = {
  arquitetura: 'bg-blue-500',
  engenharia: 'bg-orange-500',
  marcenaria: 'bg-amber-500',
  interiores: 'bg-pink-500',
  default: 'bg-gray-500',
};

type TabView = 'timeline' | 'gantt';

export default function CronogramaCliente({ clienteId, contratoId }: CronogramaClienteProps) {
  const [loading, setLoading] = useState(true);
  const [etapas, setEtapas] = useState<EtapaCronograma[]>([]);
  const [expandido, setExpandido] = useState<string | null>(null);
  const [totais, setTotais] = useState({ total: 0, concluidas: 0, emAndamento: 0 });
  const [activeTab, setActiveTab] = useState<TabView>('timeline');

  useEffect(() => {
    carregarCronograma();
  }, [clienteId, contratoId]);

  async function carregarCronograma() {
    try {
      setLoading(true);

      // Buscar contratos do cliente se não tiver contratoId específico
      let contratoIds: string[] = [];
      if (contratoId) {
        contratoIds = [contratoId];
      } else {
        const { data: contratos } = await supabase
          .from('contratos')
          .select('id')
          .eq('cliente_id', clienteId)
          .in('status', ['ativo', 'em_execucao']);

        contratoIds = (contratos || []).map(c => c.id);
      }

      if (contratoIds.length === 0) {
        setEtapas([]);
        setLoading(false);
        return;
      }

      // Buscar checklists (que funcionam como etapas do cronograma)
      const { data: checklists, error } = await supabase
        .from('checklists')
        .select(`
          id,
          titulo,
          nucleo_id,
          data_inicio,
          data_fim,
          created_at,
          nucleos (nome),
          checklist_itens (
            id,
            texto,
            concluido,
            data_limite,
            ordem
          )
        `)
        .in('vinculo_id', contratoIds)
        .eq('vinculo_tipo', 'contrato')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Transformar em etapas do cronograma
      const etapasTransformadas: EtapaCronograma[] = (checklists || []).map((cl: any) => {
        const itens = cl.checklist_itens || [];
        const totalItens = itens.length;
        const concluidos = itens.filter((i: any) => i.concluido).length;
        const progresso = totalItens > 0 ? Math.round((concluidos / totalItens) * 100) : 0;

        // Determinar status
        let status: EtapaCronograma['status'] = 'pendente';
        if (progresso === 100) {
          status = 'concluido';
        } else if (progresso > 0) {
          status = 'em_andamento';
        }

        // Verificar se está atrasado
        if (cl.data_fim && new Date(cl.data_fim) < new Date() && status !== 'concluido') {
          status = 'atrasado';
        }

        return {
          id: cl.id,
          titulo: cl.titulo,
          nucleo: cl.nucleos?.nome?.toLowerCase() || 'default',
          status,
          dataInicio: cl.data_inicio,
          dataFim: cl.data_fim,
          progresso,
          subitens: itens
            .sort((a: any, b: any) => (a.ordem || 0) - (b.ordem || 0))
            .map((item: any) => ({
              id: item.id,
              titulo: item.texto || 'Item pendente',
              concluido: item.concluido,
              dataLimite: item.data_limite,
            })),
        };
      });

      // Calcular totais
      const totaisCalc = {
        total: etapasTransformadas.length,
        concluidas: etapasTransformadas.filter(e => e.status === 'concluido').length,
        emAndamento: etapasTransformadas.filter(e => e.status === 'em_andamento').length,
      };

      setEtapas(etapasTransformadas);
      setTotais(totaisCalc);

    } catch (error) {
      console.error('Erro ao carregar cronograma:', error);
    } finally {
      setLoading(false);
    }
  }

  function formatarData(data?: string) {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
  }

  function getStatusConfig(status: EtapaCronograma['status']) {
    switch (status) {
      case 'concluido':
        return {
          label: 'Concluído',
          color: 'text-green-600 bg-green-50 border-green-200',
          icon: CheckCircle2,
        };
      case 'em_andamento':
        return {
          label: 'Em Andamento',
          color: 'text-blue-600 bg-blue-50 border-blue-200',
          icon: Clock,
        };
      case 'atrasado':
        return {
          label: 'Atrasado',
          color: 'text-red-600 bg-red-50 border-red-200',
          icon: AlertCircle,
        };
      default:
        return {
          label: 'Pendente',
          color: 'text-gray-600 bg-gray-50 border-gray-200',
          icon: Clock,
        };
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 bg-gray-200 rounded"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (etapas.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">Cronograma em elaboração</p>
        <p className="text-sm text-gray-500 mt-1">
          As etapas do seu projeto serão exibidas aqui em breve.
        </p>
      </div>
    );
  }

  const progressoGeral = totais.total > 0
    ? Math.round((totais.concluidas / totais.total) * 100)
    : 0;

  return (
    <div className="space-y-4">
      {/* Header com Progresso Geral */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/20 p-2">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Cronograma do Projeto</h3>
              <p className="text-sm text-white/80">Acompanhe cada etapa da sua obra</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{progressoGeral}%</div>
            <div className="text-xs text-white/80">Progresso Geral</div>
          </div>
        </div>

        <Progress value={progressoGeral} className="h-3 bg-white/20" />

        <div className="flex gap-4 mt-4">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <span>{totais.concluidas} concluídas</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-blue-400"></div>
            <span>{totais.emAndamento} em andamento</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <span>{totais.total - totais.concluidas - totais.emAndamento} pendentes</span>
          </div>
        </div>
      </div>

      {/* Tabs de Visualização */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
            activeTab === 'timeline'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <List className="w-4 h-4" />
          Timeline
        </button>
        <button
          onClick={() => setActiveTab('gantt')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
            activeTab === 'gantt'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Gantt
        </button>
      </div>

      {/* Conteúdo baseado na tab ativa */}
      {activeTab === 'gantt' ? (
        <GanttCronograma
          etapas={etapas.map((e) => ({
            id: e.id,
            titulo: e.titulo,
            nucleo: e.nucleo,
            status: e.status,
            dataInicio: e.dataInicio,
            dataFim: e.dataFim,
            progresso: e.progresso,
          }))}
        />
      ) : (
        /* Timeline de Etapas */
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-100">
          {etapas.map((etapa, index) => {
            const statusConfig = getStatusConfig(etapa.status);
            const StatusIcon = statusConfig.icon;
            const NucleoIcon = NUCLEO_ICONS[etapa.nucleo || 'default'] || NUCLEO_ICONS.default;
            const nucleoColor = NUCLEO_COLORS[etapa.nucleo || 'default'] || NUCLEO_COLORS.default;
            const isExpanded = expandido === etapa.id;

            return (
              <div key={etapa.id} className="relative">
                {/* Linha de conexão vertical */}
                {index < etapas.length - 1 && (
                  <div className="absolute left-8 top-16 bottom-0 w-0.5 bg-gray-200" />
                )}

                <button
                  type="button"
                  onClick={() => setExpandido(isExpanded ? null : etapa.id)}
                  className="w-full p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-start gap-4">
                    {/* Indicador de Status */}
                    <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${
                      etapa.status === 'concluido' ? 'bg-green-500' :
                      etapa.status === 'em_andamento' ? 'bg-blue-500' :
                      etapa.status === 'atrasado' ? 'bg-red-500' : 'bg-gray-300'
                    }`}>
                      {etapa.status === 'concluido' ? (
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      ) : (
                        <span className="text-white font-bold text-sm">{index + 1}</span>
                      )}
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 truncate">{etapa.titulo}</h4>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </span>
                      </div>

                      {etapa.descricao && (
                        <p className="text-sm text-gray-500 truncate mb-2">{etapa.descricao}</p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <div className={`w-5 h-5 rounded ${nucleoColor} flex items-center justify-center`}>
                            <NucleoIcon className="w-3 h-3 text-white" />
                          </div>
                          <span className="capitalize">{etapa.nucleo || 'Geral'}</span>
                        </div>
                        {etapa.dataInicio && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatarData(etapa.dataInicio)} - {formatarData(etapa.dataFim)}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Flag className="w-3 h-3" />
                          {etapa.subitens.filter(s => s.concluido).length}/{etapa.subitens.length} tarefas
                        </div>
                      </div>

                      {/* Mini barra de progresso */}
                      <div className="mt-2">
                        <Progress value={etapa.progresso} className="h-1.5" />
                      </div>
                    </div>

                    {/* Chevron */}
                    <div className="flex items-center">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Subitens expandidos */}
                {isExpanded && etapa.subitens.length > 0 && (
                  <div className="px-4 pb-4 ml-14 space-y-2">
                    {etapa.subitens.map((subitem) => (
                      <div
                        key={subitem.id}
                        className={`flex items-center gap-3 p-3 rounded-xl ${
                          subitem.concluido ? 'bg-green-50' : 'bg-gray-50'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          subitem.concluido ? 'bg-green-500' : 'bg-gray-300'
                        }`}>
                          {subitem.concluido ? (
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          ) : (
                            <Clock className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${subitem.concluido ? 'text-green-700 line-through' : 'text-gray-700'}`}>
                            {subitem.titulo}
                          </p>
                        </div>
                        {subitem.dataLimite && (
                          <span className="text-xs text-gray-500">
                            {formatarData(subitem.dataLimite)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      )}
    </div>
  );
}
