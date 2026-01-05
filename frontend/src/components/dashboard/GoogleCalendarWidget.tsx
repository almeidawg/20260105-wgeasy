// ============================================================
// WIDGET: Google Calendar para Dashboard
// Sistema WG Easy - Grupo WG Almeida
// Calendario mensal com sincronizacao Google Calendar
// ============================================================

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  parseISO,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  RefreshCw,
  Loader2,
  LogIn,
  LogOut,
  Clock,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import googleCalendarService, { type GoogleCalendarEvent } from '@/services/googleCalendarService';
import NovoEventoModal from './NovoEventoModal';

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

// Cores para eventos baseado no colorId do Google
const EVENT_COLORS: Record<string, string> = {
  '1': '#7986CB', // Lavanda
  '2': '#33B679', // Verde
  '3': '#8E24AA', // Roxo
  '4': '#E67C73', // Vermelho
  '5': '#F6BF26', // Amarelo
  '6': '#F4511E', // Laranja
  '7': '#039BE5', // Turquesa
  '8': '#616161', // Cinza
  '9': '#3F51B5', // Azul
  '10': '#0B8043', // Verde escuro
  '11': '#D50000', // Vermelho escuro
  default: '#F25C26', // WG Orange
};

export default function GoogleCalendarWidget() {
  const [mesAtual, setMesAtual] = useState(new Date());
  const [diaSelecionado, setDiaSelecionado] = useState<Date | null>(null);
  const [eventos, setEventos] = useState<GoogleCalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [conectado, setConectado] = useState(false);
  const [conectando, setConectando] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [eventoEditando, setEventoEditando] = useState<GoogleCalendarEvent | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  // Verificar conexao ao montar
  useEffect(() => {
    setConectado(googleCalendarService.isConnected());
  }, []);

  // Carregar eventos quando conectado ou mes mudar
  useEffect(() => {
    if (conectado) {
      carregarEventos();
    }
  }, [conectado, mesAtual]);

  // Auto-refresh a cada 5 minutos
  useEffect(() => {
    if (!conectado) return;

    const interval = setInterval(() => {
      carregarEventos();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [conectado]);

  // Carregar eventos do mes
  const carregarEventos = useCallback(async () => {
    try {
      setLoading(true);
      setErro(null);

      const year = mesAtual.getFullYear();
      const month = mesAtual.getMonth();
      const eventosDoMes = await googleCalendarService.getEventsForMonth(year, month);

      setEventos(eventosDoMes);
    } catch (error: any) {
      console.error('[GoogleCalendarWidget] Erro ao carregar eventos:', error);
      setErro(error.message || 'Erro ao carregar eventos');

      if (error.message?.includes('expirada')) {
        setConectado(false);
      }
    } finally {
      setLoading(false);
    }
  }, [mesAtual]);

  // Conectar com Google
  const handleConectar = async () => {
    try {
      setConectando(true);
      setErro(null);
      await googleCalendarService.authenticate();
      setConectado(true);
    } catch (error: any) {
      console.error('[GoogleCalendarWidget] Erro ao conectar:', error);
      setErro(error.message || 'Erro ao conectar com Google');
    } finally {
      setConectando(false);
    }
  };

  // Desconectar
  const handleDesconectar = () => {
    googleCalendarService.disconnect();
    setConectado(false);
    setEventos([]);
  };

  // Abrir modal para novo evento
  const handleNovoEvento = (data?: Date) => {
    setEventoEditando(null);
    if (data) {
      setDiaSelecionado(data);
    }
    setModalAberto(true);
  };

  // Abrir modal para editar evento
  const handleEditarEvento = (evento: GoogleCalendarEvent) => {
    setEventoEditando(evento);
    setModalAberto(true);
  };

  // Fechar modal
  const handleFecharModal = () => {
    setModalAberto(false);
    setEventoEditando(null);
  };

  // Evento salvo - recarregar lista
  const handleEventoSalvo = () => {
    handleFecharModal();
    carregarEventos();
  };

  // Gerar dias do calendario
  const diasCalendario = useMemo(() => {
    const inicioMes = startOfMonth(mesAtual);
    const fimMes = endOfMonth(mesAtual);
    const inicioCalendario = startOfWeek(inicioMes, { locale: ptBR });
    const fimCalendario = endOfWeek(fimMes, { locale: ptBR });

    return eachDayOfInterval({ start: inicioCalendario, end: fimCalendario });
  }, [mesAtual]);

  // Mapear eventos por data
  const eventosPorDia = useMemo(() => {
    const mapa: Record<string, GoogleCalendarEvent[]> = {};

    eventos.forEach((evento) => {
      const dataEvento = evento.start.dateTime || evento.start.date;
      if (!dataEvento) return;

      const dataKey = format(parseISO(dataEvento), 'yyyy-MM-dd');
      if (!mapa[dataKey]) mapa[dataKey] = [];
      mapa[dataKey].push(evento);
    });

    return mapa;
  }, [eventos]);

  // Eventos do dia selecionado
  const eventosDodiaSelecionado = useMemo(() => {
    if (!diaSelecionado) return [];
    const dataKey = format(diaSelecionado, 'yyyy-MM-dd');
    return eventosPorDia[dataKey] || [];
  }, [diaSelecionado, eventosPorDia]);

  // Formatar hora do evento
  const formatarHora = (evento: GoogleCalendarEvent) => {
    const dataHora = evento.start.dateTime;
    if (!dataHora) return 'Dia inteiro';
    return format(parseISO(dataHora), 'HH:mm', { locale: ptBR });
  };

  // Obter cor do evento
  const getEventColor = (evento: GoogleCalendarEvent) => {
    return EVENT_COLORS[evento.colorId || 'default'] || EVENT_COLORS.default;
  };

  // Tela de conexao
  if (!conectado) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-[#F25C26] to-[#FF7A45] text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/20">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Google Calendar</h3>
              <p className="text-sm text-white/80">Sincronize seus compromissos</p>
            </div>
          </div>
        </div>

        <div className="p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <CalendarIcon className="w-10 h-10 text-gray-400" />
          </div>

          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            Conecte sua Agenda Google
          </h4>
          <p className="text-sm text-gray-600 mb-6 max-w-sm mx-auto">
            Visualize e gerencie seus compromissos diretamente no dashboard do WG Easy.
          </p>

          {erro && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {erro}
            </div>
          )}

          <button
            onClick={handleConectar}
            disabled={conectando}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#F25C26] text-white rounded-xl font-medium hover:bg-[#e04a1a] transition-colors disabled:opacity-50"
          >
            {conectando ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Conectando...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Conectar Google Calendar
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#F25C26] to-[#FF7A45] text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/20">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {format(mesAtual, 'MMMM yyyy', { locale: ptBR })}
                </h3>
                <p className="text-sm text-white/80">Google Calendar</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => carregarEventos()}
                disabled={loading}
                className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                title="Atualizar"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setMesAtual(subMonths(mesAtual, 1))}
                className="p-2 rounded-lg hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setMesAtual(new Date())}
                className="px-3 py-1.5 text-sm rounded-lg hover:bg-white/20 transition-colors"
              >
                Hoje
              </button>
              <button
                onClick={() => setMesAtual(addMonths(mesAtual, 1))}
                className="p-2 rounded-lg hover:bg-white/20 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleNovoEvento()}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                title="Novo Evento"
              >
                <Plus className="w-5 h-5" />
              </button>
              <button
                onClick={handleDesconectar}
                className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                title="Desconectar"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Erro */}
        {erro && (
          <div className="px-4 py-2 bg-red-50 border-b border-red-200 text-sm text-red-700">
            {erro}
          </div>
        )}

        {/* Dias da Semana */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {DIAS_SEMANA.map((dia) => (
            <div
              key={dia}
              className="px-2 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider"
            >
              {dia}
            </div>
          ))}
        </div>

        {/* Grid de Dias */}
        <div className="grid grid-cols-7">
          {diasCalendario.map((dia, index) => {
            const dataKey = format(dia, 'yyyy-MM-dd');
            const eventosNoDia = eventosPorDia[dataKey] || [];
            const isMesAtual = isSameMonth(dia, mesAtual);
            const isHoje = isToday(dia);
            const isSelecionado = diaSelecionado && isSameDay(dia, diaSelecionado);

            return (
              <button
                key={index}
                type="button"
                onClick={() => setDiaSelecionado(dia)}
                onDoubleClick={() => handleNovoEvento(dia)}
                className={`
                  min-h-[90px] p-2 border-b border-r border-gray-100 text-left transition-all
                  hover:bg-gray-50
                  ${!isMesAtual ? 'bg-gray-50/50 text-gray-400' : ''}
                  ${isSelecionado ? 'bg-orange-50 ring-2 ring-[#F25C26] ring-inset' : ''}
                `}
              >
                {/* Numero do dia */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`
                      w-7 h-7 flex items-center justify-center text-sm font-medium rounded-full
                      ${isHoje ? 'bg-[#F25C26] text-white' : ''}
                      ${!isHoje && isMesAtual ? 'text-gray-900' : ''}
                    `}
                  >
                    {format(dia, 'd')}
                  </span>
                </div>

                {/* Eventos */}
                <div className="space-y-1">
                  {eventosNoDia.slice(0, 3).map((evento) => (
                    <div
                      key={evento.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditarEvento(evento);
                      }}
                      className="text-xs px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80 transition-opacity"
                      style={{
                        backgroundColor: `${getEventColor(evento)}20`,
                        color: getEventColor(evento),
                        borderLeft: `3px solid ${getEventColor(evento)}`,
                      }}
                      title={evento.summary}
                    >
                      {formatarHora(evento)} {evento.summary}
                    </div>
                  ))}
                  {eventosNoDia.length > 3 && (
                    <div className="text-xs text-gray-500 pl-1.5">
                      +{eventosNoDia.length - 3} mais
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Detalhes do Dia Selecionado */}
        {diaSelecionado && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">
                {format(diaSelecionado, "EEEE, d 'de' MMMM", { locale: ptBR })}
              </h4>
              <button
                onClick={() => handleNovoEvento(diaSelecionado)}
                className="text-sm text-[#F25C26] hover:text-[#e04a1a] font-medium flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </button>
            </div>

            {eventosDodiaSelecionado.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Nenhum evento neste dia
              </p>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {eventosDodiaSelecionado.map((evento) => (
                  <div
                    key={evento.id}
                    onClick={() => handleEditarEvento(evento)}
                    className="p-3 bg-white rounded-xl border border-gray-200 hover:border-[#F25C26] cursor-pointer transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
                        style={{ backgroundColor: getEventColor(evento) }}
                      />
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-gray-900 truncate">
                          {evento.summary}
                        </h5>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatarHora(evento)}
                          </span>
                          {evento.location && (
                            <span className="flex items-center gap-1 truncate">
                              <MapPin className="w-3 h-3" />
                              {evento.location}
                            </span>
                          )}
                        </div>
                        {evento.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {evento.description}
                          </p>
                        )}
                      </div>
                      {evento.htmlLink && (
                        <a
                          href={evento.htmlLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 text-gray-400 hover:text-[#F25C26] rounded transition-colors"
                          title="Abrir no Google Calendar"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Evento */}
      {modalAberto && (
        <NovoEventoModal
          evento={eventoEditando}
          dataPadrao={diaSelecionado}
          onClose={handleFecharModal}
          onSave={handleEventoSalvo}
        />
      )}
    </>
  );
}
