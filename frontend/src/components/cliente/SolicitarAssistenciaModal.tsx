// ============================================================
// MODAL: Solicitar Assistencia - Area do Cliente
// Sistema WG Easy - Grupo WG Almeida
// Formulario para solicitar assistencia tecnica
// ============================================================

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, CheckCircle, AlertCircle, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import {
  criarSolicitacaoAssistencia,
  FornecedorServico,
} from "@/lib/clienteFornecedoresApi";

// Cores WG
const WG_ORANGE = "#F25C26";

// Tipos de problema
const TIPOS_PROBLEMA = [
  { value: "defeito", label: "Defeito no produto/servico" },
  { value: "instalacao", label: "Problema de instalacao" },
  { value: "manutencao", label: "Manutencao preventiva" },
  { value: "reparo", label: "Reparo urgente" },
  { value: "duvida", label: "Duvida tecnica" },
  { value: "garantia", label: "Acionamento de garantia" },
  { value: "outro", label: "Outro" },
];

interface SolicitarAssistenciaModalProps {
  open: boolean;
  onClose: () => void;
  contratoId: string;
  fornecedor: FornecedorServico;
}

export default function SolicitarAssistenciaModal({
  open,
  onClose,
  contratoId,
  fornecedor,
}: SolicitarAssistenciaModalProps) {
  const [tipoProblema, setTipoProblema] = useState("");
  const [descricao, setDescricao] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  // Reset form
  const resetForm = () => {
    setTipoProblema("");
    setDescricao("");
    setSucesso(false);
  };

  // Fechar modal
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Enviar solicitacao
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
      await criarSolicitacaoAssistencia({
        contrato_id: contratoId,
        fornecedor_id: fornecedor.fornecedor_id,
        servico_id: fornecedor.servico_id,
        tipo_problema: tipoProblema,
        descricao: descricao.trim(),
      });

      setSucesso(true);
      toast.success("Solicitacao enviada com sucesso!");

      // Fechar apos 2 segundos
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error: any) {
      console.error("[SolicitarAssistenciaModal] Erro:", error);
      toast.error(error.message || "Erro ao enviar solicitacao");
    } finally {
      setEnviando(false);
    }
  };

  // Tela de sucesso
  if (sucesso) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="py-8 text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Solicitacao Enviada!
            </h3>
            <p className="text-gray-500">
              Sua solicitacao foi registrada. A equipe WG Almeida entrara em contato
              em breve.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" style={{ color: WG_ORANGE }} />
            Solicitar Assistencia
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Info do fornecedor */}
          <div className="p-3 bg-gray-50 rounded-lg text-sm">
            <p className="font-medium text-gray-700">
              {fornecedor.fornecedor_empresa || fornecedor.fornecedor_nome}
            </p>
            <p className="text-gray-500">{fornecedor.servico_descricao}</p>
          </div>

          {/* Tipo de problema */}
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Problema *</Label>
            <Select value={tipoProblema} onValueChange={setTipoProblema}>
              <SelectTrigger id="tipo">
                <SelectValue placeholder="Selecione o tipo de problema" />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_PROBLEMA.map((tipo) => (
                  <SelectItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Descricao */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descricao do Problema *</Label>
            <Textarea
              id="descricao"
              placeholder="Descreva detalhadamente o problema que esta enfrentando..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-gray-400">
              Seja o mais detalhado possivel para agilizar o atendimento.
            </p>
          </div>

          {/* Aviso */}
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex gap-2">
            <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">
              Ao enviar esta solicitacao, a equipe WG Almeida sera notificada e podera
              intermediar o contato com o fornecedor se necessario.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={enviando}
              style={{ backgroundColor: WG_ORANGE }}
            >
              {enviando ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar Solicitacao"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
