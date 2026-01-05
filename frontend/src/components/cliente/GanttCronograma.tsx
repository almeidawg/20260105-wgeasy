// src/components/cliente/GanttCronograma.tsx
// Visualização do cronograma em formato Gantt
// Mostra as etapas do projeto em uma linha do tempo visual

import { useMemo } from 'react';
import { format, differenceInDays, addDays, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface EtapaGantt {
  id: string;
  titulo: string;
  nucleo?: string;
  status: 'pendente' | 'em_andamento' | 'concluido' | 'atrasado';
  dataInicio?: string;
  dataFim?: string;
  progresso: number;
}

interface GanttCronogramaProps {
  etapas: EtapaGantt[];
}

const NUCLEO_COLORS: Record<string, string> = {
  arquitetura: '#3B82F6', // blue
  engenharia: '#F97316', // orange
  marcenaria: '#F59E0B', // amber
  interiores: '#EC4899', // pink
  execucao: '#22C55E', // green
  default: '#6B7280', // gray
};

export default function GanttCronograma({ etapas }: GanttCronogramaProps) {
  // Calcular intervalo de datas do projeto
  const { minDate, maxDate, totalDays, months } = useMemo(() => {
    const datas: Date[] = [];

    etapas.forEach((etapa) => {
      if (etapa.dataInicio) datas.push(new Date(etapa.dataInicio));
      if (etapa.dataFim) datas.push(new Date(etapa.dataFim));
    });

    // Se não houver datas, usar período de 3 meses a partir de hoje
    if (datas.length === 0) {
      const hoje = new Date();
      const tresMesesDepois = addDays(hoje, 90);
      datas.push(hoje, tresMesesDepois);
    }

    const min = startOfMonth(new Date(Math.min(...datas.map(d => d.getTime()))));
    const max = endOfMonth(new Date(Math.max(...datas.map(d => d.getTime()))));
    const total = differenceInDays(max, min) + 1;
    const meses = eachMonthOfInterval({ start: min, end: max });

    return { minDate: min, maxDate: max, totalDays: total, months: meses };
  }, [etapas]);

  // Calcular posição e largura da barra no Gantt
  function calcularBarra(dataInicio?: string, dataFim?: string) {
    if (!dataInicio) {
      return { left: 0, width: 0 };
    }

    const inicio = new Date(dataInicio);
    const fim = dataFim ? new Date(dataFim) : addDays(inicio, 7); // Default 7 dias se não tiver fim

    const diasAteInicio = differenceInDays(inicio, minDate);
    const duracaoDias = differenceInDays(fim, inicio) + 1;

    const left = (diasAteInicio / totalDays) * 100;
    const width = (duracaoDias / totalDays) * 100;

    return { left: Math.max(0, left), width: Math.min(width, 100 - left) };
  }

  // Linha indicadora de "hoje"
  const hojeLeft = useMemo(() => {
    const hoje = new Date();
    if (hoje < minDate || hoje > maxDate) return null;
    return (differenceInDays(hoje, minDate) / totalDays) * 100;
  }, [minDate, maxDate, totalDays]);

  function getStatusIcon(status: string) {
    switch (status) {
      case 'concluido':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'em_andamento':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'atrasado':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  }

  function getBarColor(nucleo?: string, status?: string) {
    if (status === 'concluido') return '#22C55E';
    if (status === 'atrasado') return '#EF4444';
    return NUCLEO_COLORS[nucleo || 'default'] || NUCLEO_COLORS.default;
  }

  if (etapas.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhuma etapa cadastrada para exibir no Gantt.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header com meses */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        {/* Coluna de títulos */}
        <div className="w-64 flex-shrink-0 p-3 border-r border-gray-200 font-semibold text-gray-700">
          Etapas do Projeto
        </div>

        {/* Timeline header */}
        <div className="flex-1 relative h-12">
          <div className="absolute inset-0 flex">
            {months.map((mes, index) => {
              const mesInicio = mes;
              const mesFim = index < months.length - 1 ? months[index + 1] : maxDate;
              const diasMes = differenceInDays(mesFim, mesInicio);
              const widthPercent = (diasMes / totalDays) * 100;

              return (
                <div
                  key={mes.toISOString()}
                  className="border-r border-gray-200 flex items-center justify-center text-sm font-medium text-gray-600"
                  style={{ width: `${widthPercent}%` }}
                >
                  {format(mes, 'MMM yyyy', { locale: ptBR })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Corpo do Gantt */}
      <div className="divide-y divide-gray-100">
        {etapas.map((etapa) => {
          const { left, width } = calcularBarra(etapa.dataInicio, etapa.dataFim);
          const barColor = getBarColor(etapa.nucleo, etapa.status);

          return (
            <div key={etapa.id} className="flex hover:bg-gray-50 transition-colors">
              {/* Título da etapa */}
              <div className="w-64 flex-shrink-0 p-3 border-r border-gray-200">
                <div className="flex items-center gap-2">
                  {getStatusIcon(etapa.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {etapa.titulo}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {etapa.nucleo || 'Geral'} • {etapa.progresso}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Barra do Gantt */}
              <div className="flex-1 relative h-16 py-2">
                {/* Linhas de grade dos meses */}
                <div className="absolute inset-0 flex pointer-events-none">
                  {months.map((mes, index) => {
                    const mesInicio = mes;
                    const mesFim = index < months.length - 1 ? months[index + 1] : maxDate;
                    const diasMes = differenceInDays(mesFim, mesInicio);
                    const widthPercent = (diasMes / totalDays) * 100;

                    return (
                      <div
                        key={mes.toISOString()}
                        className="border-r border-gray-100 h-full"
                        style={{ width: `${widthPercent}%` }}
                      />
                    );
                  })}
                </div>

                {/* Indicador de hoje */}
                {hojeLeft !== null && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                    style={{ left: `${hojeLeft}%` }}
                  >
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs px-1 rounded">
                      Hoje
                    </div>
                  </div>
                )}

                {/* Barra de progresso */}
                {width > 0 && (
                  <div
                    className="absolute top-1/2 -translate-y-1/2 h-8 rounded-lg shadow-sm transition-all duration-300 flex items-center overflow-hidden"
                    style={{
                      left: `${left}%`,
                      width: `${width}%`,
                      minWidth: '40px',
                      backgroundColor: `${barColor}30`,
                      border: `2px solid ${barColor}`,
                    }}
                  >
                    {/* Progresso preenchido */}
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${etapa.progresso}%`,
                        backgroundColor: barColor,
                      }}
                    />

                    {/* Texto dentro da barra */}
                    <span
                      className="absolute inset-0 flex items-center justify-center text-xs font-bold"
                      style={{ color: etapa.progresso > 50 ? 'white' : barColor }}
                    >
                      {etapa.progresso}%
                    </span>
                  </div>
                )}

                {/* Sem data definida */}
                {width === 0 && (
                  <div className="absolute top-1/2 left-4 -translate-y-1/2 text-xs text-gray-400 italic">
                    Data não definida
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legenda */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-500"></div>
            <span>Concluído</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-blue-500"></div>
            <span>Arquitetura</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-orange-500"></div>
            <span>Engenharia</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-amber-500"></div>
            <span>Marcenaria</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-500"></div>
            <span>Atrasado</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-0.5 h-3 bg-red-500"></div>
            <span>Hoje</span>
          </div>
        </div>
      </div>
    </div>
  );
}
