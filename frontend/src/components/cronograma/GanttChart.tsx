// ============================================================
// COMPONENTE: GanttChart - Layout Profissional
// Cabeçalho com Ano/Mês e dias da semana (S T Q Q S S D)
// Barras finas, hierarquia visual, exportação PDF A4/A3
// ============================================================

import { useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Play,
  ChevronDown,
  ChevronRight,
  GripVertical,
  MessageSquare,
  Edit2,
  AlertTriangle,
  CheckCircle2,
  Download,
  Maximize2,
  Minimize2,
  Layers,
  Tag,
  Printer,
  FileText,
  Check,
  X,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DateInputBR } from "@/components/ui/DateInputBR";

// ============================================================
// Interfaces
// ============================================================
interface TarefaGantt {
  id: string;
  nome: string;
  descricao?: string;
  nucleo?: string;
  categoria?: string;
  data_inicio?: string;
  data_fim?: string;
  progresso: number;
  status: 'pendente' | 'em_andamento' | 'concluida' | 'atrasada';
  ordem: number;
  parent_id?: string; // Para hierarquia
  nivel?: number; // Nível de indentação
}

interface ComentarioTimeline {
  id: string;
  data: string;
  tarefa_id: string;
  texto: string;
  tipo: 'observacao' | 'problema' | 'alteracao' | 'solicitacao';
  created_by: string;
  created_at: string;
}

interface GanttChartProps {
  tarefas: TarefaGantt[];
  dataInicio?: string | null;
  dataFim?: string | null;
  onEdit?: (tarefa: TarefaGantt) => void;
  onComment?: (tarefa: TarefaGantt) => void;
  onProgressoChange?: (tarefaId: string, progresso: number) => void;
  onReorder?: (tarefas: TarefaGantt[]) => void;
  onDateChange?: (dataInicio: string | null, dataFim: string | null) => void;
  onTimelineComment?: (tarefaId: string, data: string) => void;
  onDependencyCreate?: (tarefaId: string, dependeDe: string) => void;
  projetoNome?: string;
}

// ============================================================
// Cores por categoria
// ============================================================
const CATEGORIA_CORES: Record<string, string> = {
  "Estrutura": "#3B82F6",      // Azul
  "Piso": "#14B8A6",           // Teal
  "Gesso": "#64748B",          // Cinza
  "Elétrica": "#CA8A04",       // Amarelo escuro
  "Hidráulica": "#0891B2",     // Ciano
  "Pintura": "#9333EA",        // Roxo
  "Marcenaria": "#A16207",     // Marrom
  "Vidraçaria": "#0EA5E9",     // Azul claro
  "Paisagismo": "#22C55E",     // Verde
  "Climatização": "#4F46E5",   // Índigo
  "Automação": "#DB2777",      // Rosa
  "Alvenaria": "#EA580C",      // Laranja
  "Fundação": "#78716C",       // Stone
  "Cobertura": "#DC2626",      // Vermelho
  "Acabamento": "#8B5CF6",     // Violeta
  "default": "#F25C26",        // Laranja WG
};

const getCategoriaCor = (categoria?: string): string => {
  return CATEGORIA_CORES[categoria || ""] || CATEGORIA_CORES.default;
};

// ============================================================
// Helpers de data
// ============================================================
const DIAS_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function gerarDiasDoGantt(dataInicio: Date, dataFim: Date) {
  const dias: { data: Date; diaSemana: string; dia: number; mes: string; ano: number }[] = [];
  const atual = new Date(dataInicio);

  while (atual <= dataFim) {
    dias.push({
      data: new Date(atual),
      diaSemana: DIAS_SEMANA[atual.getDay()],
      dia: atual.getDate(),
      mes: MESES[atual.getMonth()],
      ano: atual.getFullYear(),
    });
    atual.setDate(atual.getDate() + 1);
  }

  return dias;
}

function agruparPorMes(dias: ReturnType<typeof gerarDiasDoGantt>) {
  const meses: { label: string; dias: typeof dias }[] = [];
  let mesAtual = '';

  dias.forEach(dia => {
    const label = `${dia.mes} ${dia.ano}`;
    if (label !== mesAtual) {
      meses.push({ label, dias: [] });
      mesAtual = label;
    }
    meses[meses.length - 1].dias.push(dia);
  });

  return meses;
}

function formatarData(data?: string): string {
  if (!data) return '-';
  return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// ============================================================
// Componente Principal
// ============================================================
export default function GanttChart({
  tarefas,
  dataInicio,
  dataFim,
  onEdit,
  onComment,
  onProgressoChange,
  onReorder,
  onDateChange,
  onTimelineComment,
  onDependencyCreate,
  projetoNome = 'Projeto',
}: GanttChartProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [showProgressSlider, setShowProgressSlider] = useState<string | null>(null);
  const [localProgresso, setLocalProgresso] = useState(0);
  const ganttRef = useRef<HTMLDivElement>(null);

  // Estados para edição de datas do projeto
  const [editingDates, setEditingDates] = useState(false);
  const [localDataInicio, setLocalDataInicio] = useState(dataInicio || '');
  const [localDataFim, setLocalDataFim] = useState(dataFim || '');

  // Estados para Drag and Drop (dependências)
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  // Calcular datas mín/máx
  const { minDate, maxDate, diasGantt, mesesAgrupados } = useMemo(() => {
    let min: Date, max: Date;

    if (dataInicio && dataFim) {
      min = new Date(dataInicio);
      max = new Date(dataFim);
    } else {
      const datas = tarefas.flatMap(t => [
        t.data_inicio ? new Date(t.data_inicio) : null,
        t.data_fim ? new Date(t.data_fim) : null,
      ]).filter(Boolean) as Date[];

      if (datas.length === 0) {
        min = new Date();
        max = new Date();
        max.setMonth(max.getMonth() + 3);
      } else {
        min = new Date(Math.min(...datas.map(d => d.getTime())));
        max = new Date(Math.max(...datas.map(d => d.getTime())));
      }
    }

    // Adicionar margem de 7 dias
    min.setDate(min.getDate() - 7);
    max.setDate(max.getDate() + 7);

    const dias = gerarDiasDoGantt(min, max);
    const meses = agruparPorMes(dias);

    return { minDate: min, maxDate: max, diasGantt: dias, mesesAgrupados: meses };
  }, [tarefas, dataInicio, dataFim]);

  // Largura de cada dia em pixels
  const diaWidth = 28;
  const totalWidth = diasGantt.length * diaWidth;

  // Toggle item expandido (para hierarquia)
  const toggleExpanded = (id: string) => {
    const newSet = new Set(expandedItems);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedItems(newSet);
  };

  // Calcular posição e largura da barra
  const calcularBarra = (tarefa: TarefaGantt) => {
    if (!tarefa.data_inicio || !tarefa.data_fim) {
      return { left: 0, width: diaWidth };
    }

    const inicio = new Date(tarefa.data_inicio);
    const fim = new Date(tarefa.data_fim);

    const diasDesdeInicio = Math.floor((inicio.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
    const duracao = Math.max(1, Math.floor((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    return {
      left: diasDesdeInicio * diaWidth,
      width: duracao * diaWidth - 4, // -4 para margem
    };
  };

  // Exportar PDF
  const exportarPDF = (formato: 'A4' | 'A3') => {
    const win = window.open('', '_blank');
    if (!win) return;

    const pageWidth = formato === 'A4' ? '297mm' : '420mm';
    const pageHeight = formato === 'A4' ? '210mm' : '297mm';

    const tarefasHTML = tarefas.map(t => {
      const cor = getCategoriaCor(t.categoria);
      const indent = (t.nivel || 0) * 20;
      return `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee; padding-left: ${indent + 8}px;">
            ${t.nivel && t.nivel > 0 ? '└─ ' : ''}${t.nome}
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">
            <span style="background: ${cor}20; color: ${cor}; padding: 2px 8px; border-radius: 4px; font-size: 11px;">
              ${t.categoria || '-'}
            </span>
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${formatarData(t.data_inicio)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${formatarData(t.data_fim)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">
            <div style="background: #eee; border-radius: 4px; height: 8px; width: 100px;">
              <div style="background: ${cor}; height: 100%; width: ${t.progresso}%; border-radius: 4px;"></div>
            </div>
            <span style="font-size: 11px;">${t.progresso}%</span>
          </td>
        </tr>
      `;
    }).join('');

    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cronograma - ${projetoNome}</title>
        <style>
          @page { size: ${pageWidth} ${pageHeight} landscape; margin: 10mm; }
          body { font-family: Arial, sans-serif; font-size: 12px; margin: 0; padding: 20px; }
          h1 { color: #F25C26; margin-bottom: 5px; }
          h2 { color: #666; font-weight: normal; margin-top: 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #F25C26; color: white; padding: 10px; text-align: left; font-size: 11px; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #F25C26; padding-bottom: 10px; margin-bottom: 20px; }
          .info { color: #666; font-size: 11px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>Cronograma da Obra</h1>
            <h2>${projetoNome}</h2>
          </div>
          <div class="info">
            <p>Data de impressão: ${new Date().toLocaleDateString('pt-BR')}</p>
            <p>Formato: ${formato} Paisagem</p>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 35%;">Descrição do Item</th>
              <th style="width: 15%;">Categoria</th>
              <th style="width: 12%; text-align: center;">Início</th>
              <th style="width: 12%; text-align: center;">Término</th>
              <th style="width: 20%; text-align: center;">Progresso</th>
            </tr>
          </thead>
          <tbody>
            ${tarefasHTML}
          </tbody>
        </table>
      </body>
      </html>
    `);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  // Status icons
  const statusIcons: Record<string, React.ReactNode> = {
    pendente: <Clock className="w-3 h-3" />,
    em_andamento: <Play className="w-3 h-3" />,
    concluida: <CheckCircle2 className="w-3 h-3" />,
    atrasada: <AlertTriangle className="w-3 h-3" />,
  };

  const statusColors: Record<string, string> = {
    pendente: 'bg-gray-400',
    em_andamento: 'bg-blue-500',
    concluida: 'bg-green-500',
    atrasada: 'bg-red-500',
  };

  return (
    <div
      ref={ganttRef}
      className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all ${
        fullscreen ? 'fixed inset-4 z-50 m-0 rounded-xl' : ''
      }`}
    >
      {/* Overlay para tela cheia */}
      {fullscreen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setFullscreen(false)} />
      )}

      {/* Header */}
      <div className={`p-4 border-b border-gray-100 flex items-center justify-between ${fullscreen ? 'relative z-50 bg-white' : ''}`}>
        <div>
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#F25C26]" />
            Cronograma da Obra
          </h3>
          {editingDates ? (
            <div className="flex items-center gap-2 mt-1">
              <DateInputBR
                value={localDataInicio}
                onChange={(val) => setLocalDataInicio(val)}
                title="Data de início do projeto"
                className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F25C26] focus:border-transparent"
              />
              <span className="text-gray-400">→</span>
              <DateInputBR
                value={localDataFim}
                onChange={(val) => setLocalDataFim(val)}
                title="Data de término do projeto"
                className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F25C26] focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => {
                  if (onDateChange && localDataInicio && localDataFim) {
                    onDateChange(localDataInicio, localDataFim);
                  }
                  setEditingDates(false);
                }}
                className="p-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                title="Salvar"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setLocalDataInicio(dataInicio || '');
                  setLocalDataFim(dataFim || '');
                  setEditingDates(false);
                }}
                className="p-1.5 bg-gray-300 text-gray-600 rounded-md hover:bg-gray-400 transition-colors"
                title="Cancelar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-500">
                {formatarData(dataInicio)} → {formatarData(dataFim)}
              </p>
              {onDateChange && (
                <button
                  type="button"
                  onClick={() => {
                    setLocalDataInicio(dataInicio || '');
                    setLocalDataFim(dataFim || '');
                    setEditingDates(true);
                  }}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  title="Editar datas"
                >
                  <Edit2 className="w-3.5 h-3.5 text-gray-400 hover:text-[#F25C26]" />
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Legenda */}
          <div className="hidden lg:flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-400" /> Pendente
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Em Andamento
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Concluída
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Atrasada
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex items-center gap-2">
            {/* Dropdown de exportação */}
            <div className="relative group">
              <Button variant="outline" size="sm" className="border-gray-300">
                <Download className="w-4 h-4 mr-1" />
                Salvar
              </Button>
              <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <button
                  type="button"
                  onClick={() => exportarPDF('A4')}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-gray-500" />
                  PDF A4 Paisagem
                </button>
                <button
                  type="button"
                  onClick={() => exportarPDF('A3')}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-gray-500" />
                  PDF A3 Paisagem
                </button>
              </div>
            </div>

            {/* Botão tela cheia */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFullscreen(!fullscreen)}
              className="border-gray-300"
              title={fullscreen ? "Minimizar" : "Tela Cheia"}
            >
              {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Container do Gantt com scroll horizontal */}
      <div className={`overflow-auto ${fullscreen ? 'max-h-[calc(100vh-140px)]' : 'max-h-[calc(100vh-300px)] min-h-[500px]'}`}>
        <div style={{ minWidth: `${totalWidth + 350}px` }}>
          {/* Cabeçalho do Timeline */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
            {/* Linha 1: Mês/Ano */}
            <div className="flex">
              <div className="w-[350px] flex-shrink-0 bg-gray-50 px-4 py-2 border-r border-gray-200">
                <span className="text-xs font-semibold text-gray-700">Descrição do Item</span>
              </div>
              <div className="flex">
                {mesesAgrupados.map((mes, idx) => (
                  <div
                    key={idx}
                    className="bg-[#2B4580] text-white text-center py-1.5 text-xs font-semibold border-r border-[#1e3460]"
                    style={{ width: `${mes.dias.length * diaWidth}px` }}
                  >
                    {mes.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Linha 2: Número do dia */}
            <div className="flex">
              <div className="w-[350px] flex-shrink-0 bg-gray-50 px-4 py-0.5 border-r border-gray-200">
                <span className="text-[9px] text-gray-400">Dia</span>
              </div>
              <div className="flex">
                {diasGantt.map((dia, idx) => {
                  const isWeekend = dia.diaSemana === 'D' || dia.diaSemana === 'S';
                  const isToday = dia.data.toDateString() === new Date().toDateString();
                  return (
                    <div
                      key={idx}
                      className={`text-center py-0.5 text-[10px] font-bold border-r border-gray-100 ${
                        isWeekend ? 'bg-gray-100 text-gray-400' : 'bg-gray-50 text-gray-700'
                      } ${isToday ? 'bg-[#F25C26] text-white' : ''}`}
                      style={{ width: `${diaWidth}px` }}
                      title={`${dia.dia}/${dia.mes}/${dia.ano}`}
                    >
                      {dia.dia}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Linha 3: Dias da semana (S T Q Q S S D) */}
            <div className="flex">
              <div className="w-[350px] flex-shrink-0 bg-gray-50 px-4 py-0.5 border-r border-gray-200 flex items-center justify-between">
                <span className="text-[9px] text-gray-400">Data Início → Data Fim</span>
              </div>
              <div className="flex">
                {diasGantt.map((dia, idx) => {
                  const isWeekend = dia.diaSemana === 'D' || dia.diaSemana === 'S';
                  const isToday = dia.data.toDateString() === new Date().toDateString();
                  return (
                    <div
                      key={idx}
                      className={`text-center py-0.5 text-[9px] font-medium border-r border-gray-100 ${
                        isWeekend ? 'bg-gray-100 text-gray-400' : 'bg-gray-50 text-gray-500'
                      } ${isToday ? 'bg-orange-100 text-[#F25C26] font-bold' : ''}`}
                      style={{ width: `${diaWidth}px` }}
                      title={`${dia.dia}/${dia.mes}/${dia.ano}`}
                    >
                      {dia.diaSemana}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Linhas das tarefas */}
          <div className="divide-y divide-gray-100">
            {tarefas.map((tarefa, index) => {
              const barra = calcularBarra(tarefa);
              const cor = getCategoriaCor(tarefa.categoria);
              const nivel = tarefa.nivel || 0;
              const hasChildren = tarefas.some(t => t.parent_id === tarefa.id);
              const isExpanded = expandedItems.has(tarefa.id);
              const isChild = nivel > 0;

              const isDragging = draggedTask === tarefa.id;
              const isDropTarget = dropTarget === tarefa.id && draggedTask !== tarefa.id;

              return (
                <div
                  key={tarefa.id}
                  draggable={!!onDependencyCreate}
                  onDragStart={(e) => {
                    if (!onDependencyCreate) return;
                    e.dataTransfer.setData('text/plain', tarefa.id);
                    setDraggedTask(tarefa.id);
                  }}
                  onDragEnd={() => {
                    setDraggedTask(null);
                    setDropTarget(null);
                  }}
                  onDragOver={(e) => {
                    if (!onDependencyCreate || !draggedTask || draggedTask === tarefa.id) return;
                    e.preventDefault();
                    setDropTarget(tarefa.id);
                  }}
                  onDragLeave={() => {
                    setDropTarget(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (!onDependencyCreate || !draggedTask || draggedTask === tarefa.id) return;
                    // Criar dependência: a tarefa arrastada depende da tarefa onde foi solta
                    onDependencyCreate(draggedTask, tarefa.id);
                    setDraggedTask(null);
                    setDropTarget(null);
                  }}
                  className={`flex hover:bg-gray-50 transition-colors group ${
                    selectedTask === tarefa.id ? 'bg-orange-50' : ''
                  } ${isDragging ? 'opacity-50 bg-blue-50' : ''} ${
                    isDropTarget ? 'bg-green-100 ring-2 ring-green-500 ring-inset' : ''
                  } ${onDependencyCreate ? 'cursor-grab active:cursor-grabbing' : ''}`}
                  onClick={() => setSelectedTask(tarefa.id)}
                >
                  {/* Coluna de informações */}
                  <div
                    className="w-[350px] flex-shrink-0 px-3 py-2 border-r border-gray-100 flex items-center gap-2"
                    style={{ paddingLeft: `${12 + nivel * 20}px` }}
                  >
                    {/* Indicador de arraste (drag handle) */}
                    {onDependencyCreate && (
                      <span title="Arraste para criar dependência">
                        <GripVertical
                          className={`w-4 h-4 flex-shrink-0 transition-colors ${
                            isDragging
                              ? 'text-blue-500'
                              : isDropTarget
                                ? 'text-green-500'
                                : 'text-gray-300 group-hover:text-gray-500'
                          }`}
                        />
                      </span>
                    )}

                    {/* Indicador de hierarquia */}
                    {isChild && (
                      <span className="text-gray-300 text-sm">└─</span>
                    )}

                    {/* Botão expandir (se tem filhos) */}
                    {hasChildren && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleExpanded(tarefa.id); }}
                        className="p-0.5 hover:bg-gray-200 rounded"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                        )}
                      </button>
                    )}

                    {/* Badge de Status */}
                    <div
                      className={`w-5 h-5 rounded-full ${statusColors[tarefa.status]} flex items-center justify-center text-white flex-shrink-0`}
                      title={tarefa.status}
                    >
                      {statusIcons[tarefa.status]}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {tarefa.nome}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {tarefa.categoria && (
                          <span
                            className="px-1.5 py-0.5 rounded text-[9px] font-medium"
                            style={{ backgroundColor: `${cor}20`, color: cor }}
                          >
                            {tarefa.categoria}
                          </span>
                        )}
                        <span className="text-[10px] text-gray-400">
                          {formatarData(tarefa.data_inicio)} → {formatarData(tarefa.data_fim)}
                        </span>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowProgressSlider(tarefa.id);
                          setLocalProgresso(tarefa.progresso);
                        }}
                        className="p-1 hover:bg-orange-100 rounded"
                        title="Progresso"
                      >
                        <BarChart3 className="w-3.5 h-3.5 text-orange-600" />
                      </button>
                      {onEdit && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onEdit(tarefa); }}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Coluna do Gantt */}
                  <div className="flex-1 relative py-1.5">
                    {/* Grid de fundo - Clicável para comentários */}
                    <div className="absolute inset-0 flex">
                      {diasGantt.map((dia, idx) => {
                        const isWeekend = dia.diaSemana === 'D' || dia.diaSemana === 'S';
                        const isToday = dia.data.toDateString() === new Date().toDateString();
                        const dataISO = dia.data.toISOString().split('T')[0];
                        return (
                          <div
                            key={idx}
                            className={`border-r border-gray-50 cursor-pointer hover:bg-[#F25C26]/10 transition-colors ${isWeekend ? 'bg-gray-50/50' : ''} ${isToday ? 'bg-orange-50/50' : ''}`}
                            style={{ width: `${diaWidth}px` }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onTimelineComment) {
                                onTimelineComment(tarefa.id, dataISO);
                              }
                            }}
                            title={`Clique para adicionar comentário em ${dia.dia}/${dia.mes}`}
                          />
                        );
                      })}
                    </div>

                    {/* Barra da tarefa */}
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: barra.width, opacity: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.02 }}
                      className="absolute top-1/2 -translate-y-1/2 h-5 rounded cursor-pointer overflow-hidden shadow-sm"
                      style={{
                        left: `${barra.left}px`,
                        backgroundColor: cor,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowProgressSlider(tarefa.id);
                        setLocalProgresso(tarefa.progresso);
                      }}
                    >
                      {/* Progresso interno */}
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${tarefa.progresso}%` }}
                        className="h-full bg-white/30"
                      />
                      {/* Label */}
                      <span className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-bold">
                        {tarefa.progresso}%
                      </span>
                    </motion.div>

                    {/* Slider de progresso inline */}
                    {showProgressSlider === tarefa.id && (
                      <div className="absolute top-full left-4 mt-1 z-20 bg-white rounded-lg shadow-xl border border-gray-200 p-3 flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={localProgresso}
                          onChange={(e) => setLocalProgresso(parseInt(e.target.value))}
                          className="w-24 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#F25C26]"
                        />
                        <span className="text-xs font-bold text-[#F25C26] w-8">{localProgresso}%</span>
                        <button
                          type="button"
                          onClick={() => {
                            onProgressoChange?.(tarefa.id, localProgresso);
                            setShowProgressSlider(null);
                          }}
                          className="p-1 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowProgressSlider(null)}
                          className="p-1 bg-gray-300 text-gray-600 rounded hover:bg-gray-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {tarefas.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              Nenhuma tarefa no cronograma
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
