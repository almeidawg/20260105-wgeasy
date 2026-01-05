// ============================================================
// MODAL: Novo/Editar Evento do Google Calendar
// Sistema WG Easy - Grupo WG Almeida
// ============================================================

import { useState, useEffect } from 'react';
import { format, addHours, parseISO } from 'date-fns';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  FileText,
  Bell,
  Loader2,
  Trash2,
  Save,
} from 'lucide-react';
import googleCalendarService, { type GoogleCalendarEvent, type EventInput } from '@/services/googleCalendarService';

interface NovoEventoModalProps {
  evento?: GoogleCalendarEvent | null;
  dataPadrao?: Date | null;
  onClose: () => void;
  onSave: () => void;
}

const REMINDER_OPTIONS = [
  { value: 0, label: 'No momento do evento' },
  { value: 5, label: '5 minutos antes' },
  { value: 10, label: '10 minutos antes' },
  { value: 15, label: '15 minutos antes' },
  { value: 30, label: '30 minutos antes' },
  { value: 60, label: '1 hora antes' },
  { value: 120, label: '2 horas antes' },
  { value: 1440, label: '1 dia antes' },
];

export default function NovoEventoModal({
  evento,
  dataPadrao,
  onClose,
  onSave,
}: NovoEventoModalProps) {
  const isEdicao = !!evento;

  // Estado do formulario
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [local, setLocal] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [horaFim, setHoraFim] = useState('');
  const [lembrete, setLembrete] = useState<number>(30);

  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Preencher formulario ao abrir
  useEffect(() => {
    if (evento) {
      // Edicao
      setTitulo(evento.summary || '');
      setDescricao(evento.description || '');
      setLocal(evento.location || '');

      const inicio = evento.start.dateTime ? parseISO(evento.start.dateTime) : new Date();
      const fim = evento.end.dateTime ? parseISO(evento.end.dateTime) : addHours(inicio, 1);

      setDataInicio(format(inicio, 'yyyy-MM-dd'));
      setHoraInicio(format(inicio, 'HH:mm'));
      setDataFim(format(fim, 'yyyy-MM-dd'));
      setHoraFim(format(fim, 'HH:mm'));

      // Lembrete
      const reminder = evento.reminders?.overrides?.[0]?.minutes;
      if (reminder !== undefined) {
        setLembrete(reminder);
      }
    } else {
      // Novo evento
      const dataBase = dataPadrao || new Date();
      const agora = new Date();
      const horaAtual = format(agora, 'HH:00');
      const proximaHora = format(addHours(agora, 1), 'HH:00');

      setDataInicio(format(dataBase, 'yyyy-MM-dd'));
      setHoraInicio(horaAtual);
      setDataFim(format(dataBase, 'yyyy-MM-dd'));
      setHoraFim(proximaHora);
    }
  }, [evento, dataPadrao]);

  // Ajustar data/hora fim quando inicio mudar
  useEffect(() => {
    if (!isEdicao && dataInicio && horaInicio) {
      const inicio = new Date(`${dataInicio}T${horaInicio}`);
      const fim = addHours(inicio, 1);
      setDataFim(format(fim, 'yyyy-MM-dd'));
      setHoraFim(format(fim, 'HH:mm'));
    }
  }, [dataInicio, horaInicio, isEdicao]);

  // Salvar evento
  const handleSalvar = async () => {
    if (!titulo.trim()) {
      setErro('O titulo e obrigatorio');
      return;
    }

    if (!dataInicio || !horaInicio || !dataFim || !horaFim) {
      setErro('Preencha as datas e horarios');
      return;
    }

    try {
      setSalvando(true);
      setErro(null);

      const startDateTime = new Date(`${dataInicio}T${horaInicio}`).toISOString();
      const endDateTime = new Date(`${dataFim}T${horaFim}`).toISOString();

      const input: EventInput = {
        summary: titulo.trim(),
        description: descricao.trim() || undefined,
        location: local.trim() || undefined,
        startDateTime,
        endDateTime,
        reminderMinutes: lembrete,
      };

      if (isEdicao && evento?.id) {
        await googleCalendarService.updateEvent(evento.id, input);
      } else {
        await googleCalendarService.createEvent(input);
      }

      onSave();
    } catch (error: any) {
      console.error('[NovoEventoModal] Erro ao salvar:', error);
      setErro(error.message || 'Erro ao salvar evento');
    } finally {
      setSalvando(false);
    }
  };

  // Excluir evento
  const handleExcluir = async () => {
    if (!evento?.id) return;

    if (!confirm('Tem certeza que deseja excluir este evento?')) {
      return;
    }

    try {
      setExcluindo(true);
      setErro(null);

      await googleCalendarService.deleteEvent(evento.id);
      onSave();
    } catch (error: any) {
      console.error('[NovoEventoModal] Erro ao excluir:', error);
      setErro(error.message || 'Erro ao excluir evento');
    } finally {
      setExcluindo(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#F25C26] to-[#FF7A45] text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/20">
                <Calendar className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold">
                {isEdicao ? 'Editar Evento' : 'Novo Evento'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Conteudo */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Erro */}
          {erro && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {erro}
            </div>
          )}

          {/* Titulo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titulo *
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Reuniao com cliente"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F25C26] focus:border-[#F25C26] outline-none transition-all"
              autoFocus
            />
          </div>

          {/* Data/Hora Inicio */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                Data Inicio
              </label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F25C26] focus:border-[#F25C26] outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Clock className="w-4 h-4 inline mr-1" />
                Hora Inicio
              </label>
              <input
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F25C26] focus:border-[#F25C26] outline-none transition-all"
              />
            </div>
          </div>

          {/* Data/Hora Fim */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                Data Fim
              </label>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F25C26] focus:border-[#F25C26] outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Clock className="w-4 h-4 inline mr-1" />
                Hora Fim
              </label>
              <input
                type="time"
                value={horaFim}
                onChange={(e) => setHoraFim(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F25C26] focus:border-[#F25C26] outline-none transition-all"
              />
            </div>
          </div>

          {/* Local */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MapPin className="w-4 h-4 inline mr-1" />
              Local (opcional)
            </label>
            <input
              type="text"
              value={local}
              onChange={(e) => setLocal(e.target.value)}
              placeholder="Ex: Escritorio, Zoom, etc."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F25C26] focus:border-[#F25C26] outline-none transition-all"
            />
          </div>

          {/* Descricao */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FileText className="w-4 h-4 inline mr-1" />
              Descricao (opcional)
            </label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Detalhes do evento..."
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F25C26] focus:border-[#F25C26] outline-none transition-all resize-none"
            />
          </div>

          {/* Lembrete */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Bell className="w-4 h-4 inline mr-1" />
              Lembrete
            </label>
            <select
              value={lembrete}
              onChange={(e) => setLembrete(Number(e.target.value))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F25C26] focus:border-[#F25C26] outline-none transition-all"
            >
              {REMINDER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div>
            {isEdicao && (
              <button
                onClick={handleExcluir}
                disabled={excluindo || salvando}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {excluindo ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Excluir
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={salvando || excluindo}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSalvar}
              disabled={salvando || excluindo}
              className="px-6 py-2 bg-[#F25C26] text-white rounded-xl font-medium hover:bg-[#e04a1a] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {salvando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
