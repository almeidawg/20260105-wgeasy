// ============================================================
// PAGINA: Fornecedores da Obra - Area do Cliente
// Sistema WG Easy - Grupo WG Almeida
// Lista fornecedores para assistencia e garantia
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Wrench,
  Phone,
  Mail,
  MessageCircle,
  Building2,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Loader2,
  AlertCircle,
  Package,
  HelpCircle,
  ChevronRight,
  Calendar,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  listarFornecedoresDoContrato,
  agruparPorCategoria,
  obterContratoDoCliente,
  calcularGarantia,
  formatarWhatsAppLink,
  formatarEmailLink,
  FornecedorServico,
  FornecedorAgrupado,
} from "@/lib/clienteFornecedoresApi";
import SolicitarAssistenciaModal from "@/components/cliente/SolicitarAssistenciaModal";

// Cores WG
const WG_ORANGE = "#F25C26";

// Icones por categoria (fallback se nao tiver icone no banco)
const CATEGORIA_ICONS: Record<string, string> = {
  box: "shower",
  espelhos: "square",
  envidracamento: "panel-top",
  aquecedor: "flame",
  marmoraria: "gem",
  eletrica: "zap",
  hidraulica: "droplets",
  marcenaria: "sofa",
  pintura: "paint-bucket",
  gesso: "layers",
  default: "package",
};

export default function FornecedoresObraPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contratoId, setContratoId] = useState<string | null>(null);
  const [grupos, setGrupos] = useState<FornecedorAgrupado[]>([]);

  // Modal de assistencia
  const [modalAberto, setModalAberto] = useState(false);
  const [fornecedorSelecionado, setFornecedorSelecionado] =
    useState<FornecedorServico | null>(null);

  // Carregar dados
  const carregarDados = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Obter contrato do cliente
      const contrato = await obterContratoDoCliente();
      if (!contrato) {
        setError("Nenhum projeto encontrado para sua conta.");
        setLoading(false);
        return;
      }
      setContratoId(contrato);

      // Listar fornecedores
      const fornecedores = await listarFornecedoresDoContrato(contrato);
      const agrupados = agruparPorCategoria(fornecedores);
      setGrupos(agrupados);
    } catch (err: any) {
      console.error("[FornecedoresObraPage] Erro:", err);
      setError(err.message || "Erro ao carregar fornecedores");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // Abrir modal de assistencia
  const abrirModalAssistencia = (fornecedor: FornecedorServico) => {
    setFornecedorSelecionado(fornecedor);
    setModalAberto(true);
  };

  // Renderizar status da garantia
  const renderGarantia = (fornecedor: FornecedorServico) => {
    const garantia = calcularGarantia(
      fornecedor.data_conclusao,
      fornecedor.garantia_meses
    );

    if (!fornecedor.garantia_meses || fornecedor.garantia_meses <= 0) {
      return (
        <div className="flex items-center gap-1.5 text-gray-400 text-sm">
          <ShieldX className="w-4 h-4" />
          <span>Sem garantia registrada</span>
        </div>
      );
    }

    if (garantia.vigente) {
      return (
        <div className="flex items-center gap-1.5 text-green-600 text-sm">
          <ShieldCheck className="w-4 h-4" />
          <span>
            Garantia: {garantia.mesesGarantia} meses
            {garantia.dataFim && (
              <span className="text-gray-500 ml-1">
                (ate {format(garantia.dataFim, "dd/MM/yyyy")})
              </span>
            )}
          </span>
          <Badge variant="outline" className="ml-2 text-green-600 border-green-300">
            {garantia.diasRestantes} dias restantes
          </Badge>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1.5 text-amber-600 text-sm">
        <ShieldAlert className="w-4 h-4" />
        <span>
          Garantia expirada
          {garantia.dataFim && (
            <span className="text-gray-500 ml-1">
              (em {format(garantia.dataFim, "dd/MM/yyyy")})
            </span>
          )}
        </span>
      </div>
    );
  };

  // Estado de loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4" style={{ color: WG_ORANGE }} />
          <p className="text-gray-500">Carregando fornecedores...</p>
        </div>
      </div>
    );
  }

  // Estado de erro
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-amber-500" />
            <h2 className="text-lg font-semibold mb-2">Ops!</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={carregarDados} style={{ backgroundColor: WG_ORANGE }}>
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Estado vazio
  if (grupos.length === 0) {
    return (
      <div className="min-h-screen p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Wrench className="w-6 h-6" style={{ color: WG_ORANGE }} />
              Fornecedores da Sua Obra
            </h1>
            <p className="text-gray-500 mt-1">
              Contate os fornecedores para assistencia ou garantia
            </p>
          </header>

          <Card>
            <CardContent className="py-12 text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                Nenhum fornecedor cadastrado
              </h3>
              <p className="text-gray-400 max-w-sm mx-auto">
                Os fornecedores que participarem da sua obra aparecerão aqui
                para que você possa contatá-los quando precisar.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Wrench className="w-6 h-6" style={{ color: WG_ORANGE }} />
            Fornecedores da Sua Obra
          </h1>
          <p className="text-gray-500 mt-1">
            Contate os fornecedores para assistencia tecnica ou garantia
          </p>
        </header>

        {/* Lista de grupos */}
        <div className="space-y-6">
          {grupos.map((grupo) => (
            <Card key={grupo.categoria_id || "outros"} className="overflow-hidden">
              <CardHeader className="pb-3 bg-gray-50 border-b">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <span className="text-lg">{grupo.categoria_icone || "📦"}</span>
                  {grupo.categoria_nome.toUpperCase()}
                  <Badge variant="secondary" className="ml-auto">
                    {grupo.fornecedores.length}
                  </Badge>
                </CardTitle>
              </CardHeader>

              <CardContent className="p-0 divide-y">
                {grupo.fornecedores.map((fornecedor) => (
                  <div
                    key={fornecedor.servico_id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    {/* Nome e empresa */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {fornecedor.fornecedor_empresa || fornecedor.fornecedor_nome}
                        </h3>
                        {fornecedor.fornecedor_empresa && (
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {fornecedor.fornecedor_nome}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant={
                          fornecedor.status === "concluido" ? "default" : "secondary"
                        }
                        className={
                          fornecedor.status === "concluido"
                            ? "bg-green-100 text-green-700"
                            : ""
                        }
                      >
                        {fornecedor.status === "concluido"
                          ? "Concluido"
                          : fornecedor.status === "em_execucao"
                          ? "Em Execucao"
                          : "Contratado"}
                      </Badge>
                    </div>

                    {/* Servico prestado */}
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Servico:</span>{" "}
                      {fornecedor.servico_descricao}
                    </p>

                    {/* Data de conclusao */}
                    {fornecedor.data_conclusao && (
                      <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Concluido em:{" "}
                        {format(new Date(fornecedor.data_conclusao), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </p>
                    )}

                    {/* Garantia */}
                    <div className="mb-3">{renderGarantia(fornecedor)}</div>

                    {/* Contatos */}
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                      {fornecedor.fornecedor_telefone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          {fornecedor.fornecedor_telefone}
                        </span>
                      )}
                      {fornecedor.fornecedor_email && (
                        <span className="flex items-center gap-1 ml-3">
                          <Mail className="w-3.5 h-3.5" />
                          {fornecedor.fornecedor_email}
                        </span>
                      )}
                    </div>

                    {/* Botoes de acao */}
                    <div className="flex flex-wrap gap-2">
                      {/* WhatsApp */}
                      {fornecedor.fornecedor_telefone && (
                        <a
                          href={
                            formatarWhatsAppLink(
                              fornecedor.fornecedor_telefone,
                              `Ola! Sou cliente da WG Almeida e preciso de assistencia referente ao servico: ${fornecedor.servico_descricao}`
                            ) || "#"
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          WhatsApp
                        </a>
                      )}

                      {/* Email */}
                      {fornecedor.fornecedor_email && (
                        <a
                          href={
                            formatarEmailLink(
                              fornecedor.fornecedor_email,
                              `Solicitacao de Assistencia - ${fornecedor.servico_descricao}`,
                              `Ola!\n\nSou cliente da WG Almeida e preciso de assistencia referente ao servico: ${fornecedor.servico_descricao}.\n\nAguardo retorno.\n\nObrigado!`
                            ) || "#"
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          <Mail className="w-4 h-4" />
                          Email
                        </a>
                      )}

                      {/* Solicitar Assistencia */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => abrirModalAssistencia(fornecedor)}
                        className="gap-1.5"
                        style={{ borderColor: WG_ORANGE, color: WG_ORANGE }}
                      >
                        <HelpCircle className="w-4 h-4" />
                        Solicitar Assistencia
                        <ChevronRight className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Dica */}
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>Dica:</strong> Ao solicitar assistencia, a equipe WG Almeida sera
            notificada para acompanhar e intermediar se necessario.
          </p>
        </div>
      </div>

      {/* Modal de Assistencia */}
      {contratoId && fornecedorSelecionado && (
        <SolicitarAssistenciaModal
          open={modalAberto}
          onClose={() => {
            setModalAberto(false);
            setFornecedorSelecionado(null);
          }}
          contratoId={contratoId}
          fornecedor={fornecedorSelecionado}
        />
      )}
    </div>
  );
}
