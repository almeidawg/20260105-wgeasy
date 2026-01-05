// src/components/cliente/ComentariosCliente.tsx
// Quadro de comentarios do cliente que viram itens de checklist
// Os comentarios aparecem nos cards da equipe interna

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Send,
  CheckCircle,
  Circle,
  Clock,
  AlertCircle,
  User,
  Reply,
  Trash2,
  Edit2,
  X,
  Check,
  Building2,
  Hammer,
  Palette
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ui/use-toast";

// Tipos
interface ComentarioCliente {
  id: string;
  cliente_id: string;
  contrato_id?: string;
  projeto_id?: string;
  texto: string;
  status: "pendente" | "em_andamento" | "concluido" | "arquivado";
  nucleo?: "arquitetura" | "engenharia" | "marcenaria" | "geral";
  prioridade?: "baixa" | "normal" | "alta" | "urgente";
  resposta_equipe?: string;
  respondido_por?: string;
  respondido_em?: string;
  criado_em: string;
  atualizado_em?: string;
}

interface Props {
  clienteId: string;
  contratoId?: string;
  projetoId?: string;
  podeComentarem?: boolean;
}

// Cores por nucleo
const NUCLEO_CORES = {
  arquitetura: { bg: "bg-[#5E9B94]/10", text: "text-[#5E9B94]", border: "border-[#5E9B94]" },
  engenharia: { bg: "bg-[#2B4580]/10", text: "text-[#2B4580]", border: "border-[#2B4580]" },
  marcenaria: { bg: "bg-[#8B5E3C]/10", text: "text-[#8B5E3C]", border: "border-[#8B5E3C]" },
  geral: { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-300" },
};

const NUCLEO_ICONS = {
  arquitetura: Palette,
  engenharia: Hammer,
  marcenaria: Building2,
  geral: MessageSquare,
};

const STATUS_CONFIG = {
  pendente: { icon: Circle, color: "text-gray-400", bg: "bg-gray-100", label: "Pendente" },
  em_andamento: { icon: Clock, color: "text-amber-500", bg: "bg-amber-50", label: "Em andamento" },
  concluido: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-50", label: "Concluido" },
  arquivado: { icon: AlertCircle, color: "text-gray-400", bg: "bg-gray-50", label: "Arquivado" },
};

export default function ComentariosCliente({
  clienteId,
  contratoId,
  projetoId,
  podeComentarem = true
}: Props) {
  const { toast } = useToast();
  const [comentarios, setComentarios] = useState<ComentarioCliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [novoComentario, setNovoComentario] = useState("");
  const [nucleoSelecionado, setNucleoSelecionado] = useState<string>("geral");
  const [enviando, setEnviando] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");

  // Carregar comentarios
  useEffect(() => {
    carregarComentarios();

    // Subscrever a mudancas em tempo real
    const channel = supabase
      .channel('comentarios_notificacoes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comentarios_notificacoes',
          filter: `pessoa_id=eq.${clienteId}`
        },
        () => {
          carregarComentarios();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clienteId, contratoId, projetoId]);

  const carregarComentarios = async () => {
    try {
      // Tentar buscar da tabela comentarios_notificacoes ou criar estrutura vazia
      let query = supabase
        .from("comentarios_notificacoes")
        .select("*")
        .eq("pessoa_id", clienteId)
        .order("created_at", { ascending: false });

      if (contratoId) {
        query = query.eq("referencia_id", contratoId);
      }

      const { data, error } = await query;

      if (error) {
        // Se a tabela não existe, mostrar lista vazia sem erro
        if (error.code === 'PGRST205' || error.code === '42P01') {
          console.log("Tabela de comentários não configurada - mostrando vazio");
          setComentarios([]);
          return;
        }
        throw error;
      }

      // Mapear campos da tabela para o formato esperado
      const comentariosMapeados = (data || []).map((item: any) => ({
        id: item.id,
        cliente_id: item.pessoa_id,
        contrato_id: item.referencia_id,
        texto: item.mensagem || item.texto || '',
        status: item.status || 'pendente',
        nucleo: item.nucleo || 'geral',
        prioridade: item.prioridade || 'normal',
        resposta_equipe: item.resposta,
        respondido_por: item.respondido_por,
        respondido_em: item.respondido_em,
        criado_em: item.created_at || item.criado_em,
        atualizado_em: item.updated_at,
      }));

      setComentarios(comentariosMapeados);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error("Erro ao carregar comentarios:", errorMessage);
      setComentarios([]);
    } finally {
      setLoading(false);
    }
  };

  const enviarComentario = async () => {
    if (!novoComentario.trim()) return;

    setEnviando(true);
    try {
      // Inserir comentário na tabela comentarios_notificacoes
      const { data: comentarioData, error } = await supabase
        .from("comentarios_notificacoes")
        .insert({
          pessoa_id: clienteId,
          referencia_id: contratoId || null,
          referencia_tipo: contratoId ? 'contrato' : 'cliente',
          mensagem: novoComentario.trim(),
          nucleo: nucleoSelecionado,
          status: "pendente",
          prioridade: "normal"
        })
        .select()
        .single();

      if (error) {
        // Se a tabela não existe, informar ao usuário
        if (error.code === 'PGRST205' || error.code === '42P01') {
          toast({
            title: "Funcionalidade em configuração",
            description: "O sistema de comentários está sendo configurado. Tente novamente mais tarde.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      // Buscar nome do cliente para a notificação
      const { data: clienteData } = await supabase
        .from("pessoas")
        .select("nome")
        .eq("id", clienteId)
        .single();

      const nomeCliente = clienteData?.nome || "Cliente";
      const nucleoLabel = nucleoSelecionado.charAt(0).toUpperCase() + nucleoSelecionado.slice(1);

      // Criar notificação para admins sobre nova postagem do cliente
      await supabase.from("notificacoes_sistema").insert({
        tipo: "comentario_cliente",
        titulo: `Nova mensagem de ${nomeCliente}`,
        mensagem: `[${nucleoLabel}] ${novoComentario.trim().substring(0, 100)}${novoComentario.trim().length > 100 ? "..." : ""}`,
        referencia_tipo: "comentario_cliente",
        referencia_id: comentarioData?.id || null,
        para_todos_admins: true,
        url_acao: contratoId ? `/sistema/contratos/${contratoId}` : `/sistema/clientes/${clienteId}`,
        texto_acao: "Ver mensagem"
      });

      setNovoComentario("");
      toast({
        title: "Comentario enviado!",
        description: "A equipe WG Almeida recebeu sua mensagem.",
      });
      carregarComentarios();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error("Erro ao enviar comentario:", errorMessage);
      toast({
        title: "Erro ao enviar",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setEnviando(false);
    }
  };

  // Filtrar comentarios
  const comentariosFiltrados = comentarios.filter(c => {
    if (filtroStatus === "todos") return c.status !== "arquivado";
    return c.status === filtroStatus;
  });

  // Agrupar por status
  const pendentes = comentarios.filter(c => c.status === "pendente").length;
  const emAndamento = comentarios.filter(c => c.status === "em_andamento").length;
  const concluidos = comentarios.filter(c => c.status === "concluido").length;

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-20 bg-gray-100 rounded"></div>
          <div className="h-16 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#F25C26] to-[#5E9B94] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Seus Comentarios</h2>
              <p className="text-white/80 text-xs">Envie solicitacoes e acompanhe o status</p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="px-2.5 py-1 bg-white/20 rounded-full text-xs text-white flex items-center gap-1">
              <Circle className="w-3 h-3" />
              {pendentes}
            </div>
            <div className="px-2.5 py-1 bg-amber-400/30 rounded-full text-xs text-white flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {emAndamento}
            </div>
            <div className="px-2.5 py-1 bg-green-400/30 rounded-full text-xs text-white flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              {concluidos}
            </div>
          </div>
        </div>
      </div>

      {/* Formulario de novo comentario */}
      {podeComentarem && (
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-500 mb-2">Selecione o nucleo:</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(NUCLEO_CORES).map(([nucleo, cores]) => {
                const Icon = NUCLEO_ICONS[nucleo as keyof typeof NUCLEO_ICONS];
                return (
                  <button
                    key={nucleo}
                    onClick={() => setNucleoSelecionado(nucleo)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      nucleoSelecionado === nucleo
                        ? `${cores.bg} ${cores.text} border-2 ${cores.border}`
                        : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {nucleo.charAt(0).toUpperCase() + nucleo.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2">
            <textarea
              value={novoComentario}
              onChange={(e) => setNovoComentario(e.target.value)}
              placeholder="Digite sua solicitacao, duvida ou sugestao..."
              rows={2}
              className="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F25C26] focus:border-transparent resize-none text-sm"
            />
            <button
              onClick={enviarComentario}
              disabled={!novoComentario.trim() || enviando}
              className="px-4 bg-[#F25C26] text-white rounded-lg font-medium hover:bg-[#D94E1F] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {enviando ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="p-3 border-b border-gray-100 flex gap-2">
        {[
          { value: "todos", label: "Todos" },
          { value: "pendente", label: "Pendentes" },
          { value: "em_andamento", label: "Em andamento" },
          { value: "concluido", label: "Concluidos" },
        ].map(filtro => (
          <button
            key={filtro.value}
            onClick={() => setFiltroStatus(filtro.value)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              filtroStatus === filtro.value
                ? "bg-[#F25C26] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {filtro.label}
          </button>
        ))}
      </div>

      {/* Lista de comentarios */}
      <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
        <AnimatePresence>
          {comentariosFiltrados.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">Nenhum comentario encontrado</p>
              <p className="text-xs mt-1">Envie sua primeira solicitacao acima</p>
            </div>
          ) : (
            comentariosFiltrados.map((comentario) => {
              const statusConfig = STATUS_CONFIG[comentario.status];
              const StatusIcon = statusConfig.icon;
              const nucleoCores = NUCLEO_CORES[comentario.nucleo || "geral"];
              const NucleoIcon = NUCLEO_ICONS[comentario.nucleo || "geral"];

              return (
                <motion.div
                  key={comentario.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-4 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex gap-3">
                    {/* Icone de Status */}
                    <div className={`w-8 h-8 rounded-full ${statusConfig.bg} flex items-center justify-center flex-shrink-0`}>
                      <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Header do comentario */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${nucleoCores.bg} ${nucleoCores.text} flex items-center gap-1`}>
                          <NucleoIcon className="w-3 h-3" />
                          {comentario.nucleo ? comentario.nucleo.charAt(0).toUpperCase() + comentario.nucleo.slice(1) : "Geral"}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(comentario.criado_em).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </div>

                      {/* Texto do comentario */}
                      <p className="text-sm text-gray-700 mb-2">{comentario.texto}</p>

                      {/* Resposta da equipe */}
                      {comentario.resposta_equipe && (
                        <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <div className="flex items-center gap-2 mb-1">
                            <Reply className="w-3.5 h-3.5 text-blue-600" />
                            <span className="text-xs font-medium text-blue-700">
                              Resposta da Equipe WG
                            </span>
                            {comentario.respondido_em && (
                              <span className="text-[10px] text-blue-500">
                                {new Date(comentario.respondido_em).toLocaleDateString("pt-BR")}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-blue-800">{comentario.resposta_equipe}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
