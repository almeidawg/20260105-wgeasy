// ============================================================
// PÁGINA: Ação do Cliente na Proposta (Aprovar/Recusar)
// Sistema WG Easy - Grupo WG Almeida
// Página pública acessível via link do PDF
// ============================================================

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Proposta {
  id: string;
  numero: string | null;
  valor_total: number;
  cliente_id: string;
  status: string;
  created_at: string;
  cliente?: {
    nome: string;
  };
}

export default function PropostaAcaoClientePage() {
  const { id, acao } = useParams<{ id: string; acao: string }>();
  const navigate = useNavigate();

  const [proposta, setProposta] = useState<Proposta | null>(null);
  const [loading, setLoading] = useState(true);
  const [processando, setProcessando] = useState(false);
  const [observacao, setObservacao] = useState("");
  const [concluido, setConcluido] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const isAprovacao = acao === "aprovar";

  useEffect(() => {
    carregarProposta();
  }, [id]);

  async function carregarProposta() {
    if (!id) {
      setErro("ID da proposta não informado");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("propostas")
        .select(`
          id,
          numero,
          valor_total,
          cliente_id,
          status,
          created_at,
          cliente:pessoas!propostas_cliente_id_fkey(nome)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;

      if (!data) {
        setErro("Proposta não encontrada");
        setLoading(false);
        return;
      }

      // Verificar se a proposta ainda pode ser alterada
      if (data.status !== "enviada" && data.status !== "pendente") {
        setErro(`Esta proposta já foi ${data.status === "aprovada" ? "aprovada" : data.status === "recusada" ? "recusada" : "processada"}.`);
        setLoading(false);
        return;
      }

      setProposta({
        ...data,
        cliente: data.cliente as { nome: string } | undefined
      });
    } catch (error: any) {
      console.error("Erro ao carregar proposta:", error);
      setErro("Erro ao carregar proposta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function processarAcao() {
    if (!proposta || !id) return;

    setProcessando(true);

    try {
      const novoStatus = isAprovacao ? "aprovada" : "recusada";

      // Atualizar status da proposta
      const { error: updateError } = await supabase
        .from("propostas")
        .update({
          status: novoStatus,
          observacoes_internas: observacao
            ? `${proposta.status === "enviada" ? "" : (proposta as any).observacoes_internas || ""}\n[${new Date().toLocaleDateString("pt-BR")}] Cliente ${isAprovacao ? "aprovou" : "recusou"}: ${observacao}`
            : undefined,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (updateError) throw updateError;

      // Criar notificação no sistema
      await supabase.from("notificacoes").insert({
        tipo: isAprovacao ? "proposta_aprovada" : "proposta_recusada",
        titulo: `Proposta ${proposta.numero || id} ${isAprovacao ? "aprovada" : "recusada"}`,
        mensagem: `O cliente ${proposta.cliente?.nome || "N/A"} ${isAprovacao ? "aprovou" : "recusou"} a proposta ${proposta.numero || id}. ${observacao ? `Observação: ${observacao}` : ""}`,
        lida: false,
        dados: {
          proposta_id: id,
          cliente_id: proposta.cliente_id,
          acao: novoStatus,
          valor: proposta.valor_total,
        },
      });

      // Se aprovada, iniciar workflow de contrato
      if (isAprovacao) {
        // Criar registro de contrato automaticamente
        const { data: contrato, error: contratoError } = await supabase
          .from("contratos")
          .insert({
            proposta_id: id,
            cliente_id: proposta.cliente_id,
            valor_total: proposta.valor_total,
            status: "pendente",
            data_inicio: new Date().toISOString(),
            observacoes: `Contrato gerado automaticamente a partir da proposta ${proposta.numero || id}`,
          })
          .select()
          .single();

        if (contratoError) {
          console.error("Erro ao criar contrato:", contratoError);
          // Não interrompe o fluxo, apenas loga o erro
        } else if (contrato) {
          // Notificar sobre novo contrato
          await supabase.from("notificacoes").insert({
            tipo: "contrato_criado",
            titulo: `Novo contrato gerado`,
            mensagem: `Contrato criado automaticamente a partir da proposta ${proposta.numero || id} aprovada pelo cliente.`,
            lida: false,
            dados: {
              contrato_id: contrato.id,
              proposta_id: id,
              cliente_id: proposta.cliente_id,
            },
          });
        }
      }

      setConcluido(true);
      toast.success(
        isAprovacao
          ? "Proposta aprovada com sucesso! Entraremos em contato em breve."
          : "Proposta recusada. Agradecemos seu feedback."
      );

    } catch (error: any) {
      console.error("Erro ao processar ação:", error);
      toast.error("Erro ao processar sua solicitação. Tente novamente.");
    } finally {
      setProcessando(false);
    }
  }

  // Estado de carregamento
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando proposta...</p>
        </div>
      </div>
    );
  }

  // Estado de erro
  if (erro) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Atenção</h2>
            <p className="text-gray-600 mb-6">{erro}</p>
            <Button variant="outline" onClick={() => window.close()}>
              Fechar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Estado de conclusão
  if (concluido) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            {isAprovacao ? (
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            ) : (
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            )}
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {isAprovacao ? "Proposta Aprovada!" : "Proposta Recusada"}
            </h2>
            <p className="text-gray-600 mb-6">
              {isAprovacao
                ? "Sua aprovação foi registrada com sucesso. Nossa equipe entrará em contato em breve para dar continuidade ao processo."
                : "Agradecemos seu feedback. Se desejar, entre em contato conosco para ajustarmos a proposta às suas necessidades."}
            </p>
            <div className="text-sm text-gray-500 mb-4">
              Proposta: {proposta?.numero || id}
            </div>
            <Button variant="outline" onClick={() => window.close()}>
              Fechar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Formulário de ação
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <img
              src="/logo-wg.png"
              alt="WG Almeida"
              className="h-16 mx-auto"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
          <CardTitle className="text-2xl">
            {isAprovacao ? "Aprovar Proposta" : "Recusar Proposta"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Detalhes da proposta */}
          <div className="bg-gray-100 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Proposta:</span>
              <span className="font-medium">{proposta?.numero || id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cliente:</span>
              <span className="font-medium">{proposta?.cliente?.nome || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Valor Total:</span>
              <span className="font-bold text-lg">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(proposta?.valor_total || 0)}
              </span>
            </div>
          </div>

          {/* Campo de observação */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isAprovacao
                ? "Observações (opcional)"
                : "Motivo da recusa (opcional)"}
            </label>
            <Textarea
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder={isAprovacao
                ? "Alguma observação sobre a aprovação..."
                : "Por favor, nos conte o motivo da recusa para podermos melhorar..."}
              rows={3}
            />
          </div>

          {/* Botões de ação */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => window.close()}
              disabled={processando}
            >
              Cancelar
            </Button>
            <Button
              className={`flex-1 ${
                isAprovacao
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
              onClick={processarAcao}
              disabled={processando}
            >
              {processando ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processando...
                </>
              ) : (
                <>
                  {isAprovacao ? (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  {isAprovacao ? "Confirmar Aprovação" : "Confirmar Recusa"}
                </>
              )}
            </Button>
          </div>

          {/* Aviso */}
          <p className="text-xs text-gray-500 text-center">
            Grupo WG Almeida - Arquitetura, Engenharia e Marcenaria
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
