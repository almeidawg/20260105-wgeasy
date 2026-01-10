// ============================================================
// COMPONENTE: Assistência Técnica - Área do Cliente
// Sistema WG Easy - Grupo WG Almeida
// Card para solicitar assistência técnica
// ============================================================

import { useState } from "react";
import {
  Wrench,
  HelpCircle,
  Phone,
  MessageSquare,
  Send,
  CheckCircle,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

// Cores WG
const WG_ORANGE = "#F25C26";

// Tipos de problema
const TIPOS_PROBLEMA = [
  { value: "defeito", label: "Defeito no produto/serviço", icon: "🔧" },
  { value: "instalacao", label: "Problema de instalação", icon: "🏗️" },
  { value: "manutencao", label: "Manutenção preventiva", icon: "🛠️" },
  { value: "reparo", label: "Reparo urgente", icon: "⚠️" },
  { value: "duvida", label: "Dúvida técnica", icon: "❓" },
  { value: "garantia", label: "Acionamento de garantia", icon: "📋" },
  { value: "outro", label: "Outro", icon: "📝" },
];

interface Props {
  clienteId: string;
  contratoId?: string;
  clienteNome?: string;
}

export default function AssistenciaTecnicaCliente({ clienteId, contratoId, clienteNome }: Props) {
  const [modalAberto, setModalAberto] = useState(false);
  const [tipoProblema, setTipoProblema] = useState("");
  const [descricao, setDescricao] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const resetForm = () => {
    setTipoProblema("");
    setDescricao("");
    setSucesso(false);
  };

  const handleClose = () => {
    resetForm();
    setModalAberto(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tipoProblema) {
      toast.error("Selecione o tipo de problema");
      return;
    }

    if (!descricao.trim()) {
      toast.error("Descreva o problema");
      return;
    }

    setEnviando(true);

    try {
      // Criar solicitação de assistência
      const { error } = await supabase.from("assistencia_solicitacoes").insert({
        cliente_id: clienteId,
        contrato_id: contratoId || null,
        tipo_problema: tipoProblema,
        descricao: descricao.trim(),
        status: "aberto",
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      setSucesso(true);
      toast.success("Solicitação enviada com sucesso!");

      setTimeout(() => {
        handleClose();
      }, 2500);
    } catch (error: any) {
      console.error("[AssistenciaTecnica] Erro:", error);
      toast.error(error.message || "Erro ao enviar solicitação");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      {/* Card de Assistência */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">Assistência Técnica</h3>
              <p className="text-sm text-gray-500 mb-4">
                Precisa de ajuda? Solicite assistência técnica para sua obra ou projeto.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setModalAberto(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
                >
                  <HelpCircle className="w-4 h-4" />
                  Solicitar Assistência
                </button>
                <a
                  href="https://wa.me/5511999999999?text=Olá! Preciso de assistência técnica."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition"
                >
                  <MessageSquare className="w-4 h-4" />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Solicitação */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {sucesso ? (
              // Tela de Sucesso
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Solicitação Enviada!
                </h3>
                <p className="text-gray-500">
                  Sua solicitação foi registrada. A equipe WG Almeida entrará em contato em breve.
                </p>
              </div>
            ) : (
              // Formulário
              <>
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${WG_ORANGE}20` }}
                    >
                      <Wrench className="w-5 h-5" style={{ color: WG_ORANGE }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Solicitar Assistência</h3>
                      <p className="text-sm text-gray-500">Descreva o problema que está enfrentando</p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  {/* Tipo de Problema */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Problema *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {TIPOS_PROBLEMA.map((tipo) => (
                        <button
                          key={tipo.value}
                          type="button"
                          onClick={() => setTipoProblema(tipo.value)}
                          className={`p-3 text-left rounded-lg border-2 transition ${
                            tipoProblema === tipo.value
                              ? "border-orange-500 bg-orange-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <span className="text-lg mr-2">{tipo.icon}</span>
                          <span className="text-sm font-medium text-gray-700">{tipo.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Descrição */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição do Problema *
                    </label>
                    <textarea
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                      placeholder="Descreva detalhadamente o problema que está enfrentando..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                      rows={4}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Seja o mais detalhado possível para agilizar o atendimento.
                    </p>
                  </div>

                  {/* Aviso */}
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-700">
                      Ao enviar esta solicitação, a equipe WG Almeida será notificada e entrará em
                      contato o mais breve possível.
                    </p>
                  </div>

                  {/* Botões */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-5 py-2.5 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={enviando}
                      className="px-6 py-2.5 text-white rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
                      style={{ backgroundColor: WG_ORANGE }}
                    >
                      {enviando ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Enviar Solicitação
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
