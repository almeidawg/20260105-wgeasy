// src/components/cadastro-link/GerarLinkCadastroModal.tsx
// Modal para gerar e compartilhar link de cadastro

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link2,
  Mail,
  MessageCircle,
  Copy,
  CheckCircle2,
  Loader2,
  X,
  ExternalLink,
  QrCode,
  Users,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  criarLinkCadastro,
  gerarMensagemWhatsApp,
  gerarLinkEmail,
  TipoCadastro,
  getLabelTipoCadastro,
} from "@/lib/cadastroLinkApi";
import { useToast } from "@/hooks/use-toast";

// Cores da marca
const WG_COLORS = {
  laranja: "#F25C26",
  preto: "#2E2E2E",
  cinza: "#4C4C4C",
  cinzaClaro: "#F3F3F3",
  branco: "#FFFFFF",
  whatsapp: "#25D366",
  email: "#EA4335",
};

interface GerarLinkCadastroModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipo: TipoCadastro;
  nucleoId?: string;
}

type Step = "generate" | "share";

export default function GerarLinkCadastroModal({
  open,
  onOpenChange,
  tipo,
  nucleoId,
}: GerarLinkCadastroModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("generate");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [emailDestino, setEmailDestino] = useState("");
  const [reutilizavel, setReutilizavel] = useState(false);
  const [isReutilizavel, setIsReutilizavel] = useState(false);
  const [tituloPagina, setTituloPagina] = useState("");

  // Gerar novo link
  async function handleGenerateLink() {
    setIsLoading(true);
    try {
      const result = await criarLinkCadastro({
        tipo,
        nucleoId,
        reutilizavel,
        tituloPagina: tituloPagina.trim() || undefined,
      });
      setGeneratedUrl(result.url);
      setIsReutilizavel(result.reutilizavel);
      setStep("share");
      toast({
        title: "Link gerado!",
        description: reutilizavel
          ? "Link para disparo em massa criado. Pode ser usado por várias pessoas."
          : "Agora escolha como enviar o link.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao gerar link",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Copiar link
  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      toast({
        title: "Link copiado!",
        description: "Cole onde preferir para compartilhar.",
      });
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    }
  }

  // Enviar por WhatsApp
  function handleSendWhatsApp() {
    const mensagem = gerarMensagemWhatsApp(generatedUrl, tipo);
    const mensagemEncoded = encodeURIComponent(mensagem);
    window.open(`https://wa.me/?text=${mensagemEncoded}`, "_blank");
    toast({
      title: "Abrindo WhatsApp",
      description: "Escolha o contato para enviar.",
    });
  }

  // Enviar por Email
  function handleSendEmail() {
    const link = gerarLinkEmail(generatedUrl, tipo, emailDestino);
    window.location.href = link;
    toast({
      title: "Abrindo Email",
      description: "Complete o envio no seu cliente de email.",
    });
  }

  // Reset ao fechar
  function handleClose() {
    setStep("generate");
    setGeneratedUrl("");
    setCopied(false);
    setEmailDestino("");
    setReutilizavel(false);
    setIsReutilizavel(false);
    setTituloPagina("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5" style={{ color: WG_COLORS.laranja }} />
            Gerar Link de Cadastro
          </DialogTitle>
          <DialogDescription>
            Envie um link para cadastro de{" "}
            <span className="font-medium" style={{ color: WG_COLORS.laranja }}>
              {getLabelTipoCadastro(tipo)}
            </span>
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === "generate" && (
            <motion.div
              key="generate"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div
                  className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center"
                  style={{ background: `${WG_COLORS.laranja}15` }}
                >
                  {reutilizavel ? (
                    <Users className="w-8 h-8" style={{ color: WG_COLORS.laranja }} />
                  ) : (
                    <Link2 className="w-8 h-8" style={{ color: WG_COLORS.laranja }} />
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {reutilizavel ? (
                    <>
                      Link para <strong>disparo em massa</strong> - pode ser usado por várias pessoas.
                      <br />
                      Expira em <strong>7 dias</strong>.
                    </>
                  ) : (
                    <>
                      Será gerado um link único que expira em <strong>7 dias</strong>.
                      <br />
                      Após o preenchimento, você será notificado para aprovar.
                    </>
                  )}
                </p>
              </div>

              {/* Campo para título personalizado */}
              <div className="space-y-2">
                <Label htmlFor="titulo-pagina" className="text-sm font-medium">
                  Título da Página (opcional)
                </Label>
                <Input
                  id="titulo-pagina"
                  value={tituloPagina}
                  onChange={(e) => setTituloPagina(e.target.value)}
                  placeholder={`Ex: Cadastro de ${getLabelTipoCadastro(tipo)}`}
                  className="text-sm"
                />
                <p className="text-xs text-gray-500">
                  Personaliza o título exibido na página de cadastro. Se vazio, usa o título padrão.
                </p>
              </div>

              {/* Switch para disparo em massa */}
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5" style={{ color: WG_COLORS.laranja }} />
                  <div>
                    <Label htmlFor="reutilizavel" className="font-medium cursor-pointer">
                      Disparo em massa
                    </Label>
                    <p className="text-xs text-gray-500">
                      Permite múltiplos cadastros com o mesmo link
                    </p>
                  </div>
                </div>
                <Switch
                  id="reutilizavel"
                  checked={reutilizavel}
                  onCheckedChange={setReutilizavel}
                />
              </div>

              <Button
                onClick={handleGenerateLink}
                disabled={isLoading}
                className="w-full h-12"
                style={{ background: WG_COLORS.laranja }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4 mr-2" />
                    Gerar Link
                  </>
                )}
              </Button>
            </motion.div>
          )}

          {step === "share" && (
            <motion.div
              key="share"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {/* Badge indicando tipo de link */}
              {isReutilizavel && (
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200">
                  <Users className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700 font-medium">
                    Link para disparo em massa - pode ser usado por várias pessoas
                  </span>
                </div>
              )}

              {/* Link gerado */}
              <div className="space-y-2">
                <Label>Link gerado:</Label>
                <div className="flex gap-2">
                  <Input
                    value={generatedUrl}
                    readOnly
                    className="text-sm font-mono"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyLink}
                    className="shrink-0"
                  >
                    {copied ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Opções de envio */}
              <div className="space-y-2">
                <Label>Enviar por:</Label>
                <div className="grid grid-cols-2 gap-3">
                  {/* WhatsApp */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSendWhatsApp}
                    className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-gray-200 hover:border-green-500 transition-colors"
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ background: `${WG_COLORS.whatsapp}15` }}
                    >
                      <MessageCircle className="w-6 h-6" style={{ color: WG_COLORS.whatsapp }} />
                    </div>
                    <span className="text-sm font-medium">WhatsApp</span>
                  </motion.button>

                  {/* Email */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSendEmail}
                    className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-gray-200 hover:border-red-400 transition-colors"
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ background: `${WG_COLORS.email}15` }}
                    >
                      <Mail className="w-6 h-6" style={{ color: WG_COLORS.email }} />
                    </div>
                    <span className="text-sm font-medium">Email</span>
                  </motion.button>
                </div>
              </div>

              {/* Input de email opcional */}
              <div className="space-y-2">
                <Label htmlFor="email-destino">Email do destinatário (opcional):</Label>
                <Input
                  id="email-destino"
                  type="email"
                  value={emailDestino}
                  onChange={(e) => setEmailDestino(e.target.value)}
                  placeholder="email@exemplo.com"
                />
              </div>

              {/* Ações */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setStep("generate")}
                  className="flex-1"
                >
                  Gerar Outro
                </Button>
                <Button
                  onClick={handleClose}
                  className="flex-1"
                  style={{ background: WG_COLORS.laranja }}
                >
                  Concluído
                </Button>
              </div>

              {/* Info */}
              <p className="text-xs text-gray-400 text-center">
                Você será notificado quando o cadastro for preenchido.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// BOTÃO PARA USAR NAS PÁGINAS
// ============================================================

interface BotaoGerarLinkProps {
  tipo: TipoCadastro;
  nucleoId?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function BotaoGerarLink({
  tipo,
  nucleoId,
  variant,
  size = "default",
  className,
}: BotaoGerarLinkProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className={className || "px-4 py-2 rounded-lg bg-[#F25C26] hover:bg-[#d94d1a] text-white text-sm font-medium flex items-center gap-2"}
      >
        <Link2 className="w-4 h-4" />
        Gerar Link
      </button>

      <GerarLinkCadastroModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        tipo={tipo}
        nucleoId={nucleoId}
      />
    </>
  );
}
