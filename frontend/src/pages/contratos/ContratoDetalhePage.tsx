// ============================================================
// PÁGINA: Detalhes do Contrato
// Sistema WG Easy - Grupo WG Almeida
// ============================================================

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  buscarContrato,
  listarItensContrato,
  type ContratoCompleto,
  type ContratoItem,
} from "@/lib/contratosApi";
import {
  getStatusContratoColor,
  getStatusContratoLabel,
  getUnidadeNegocioColor,
  getUnidadeNegocioLabel,
  formatarValor,
} from "@/types/contratos";
import ContratoAtivacaoModal from "@/components/contratos/ContratoAtivacaoModal";
import type { AtivarContratoResult } from "@/lib/workflows/contratoWorkflow";
import { gerarContratoPDF } from "@/lib/contratoPdfUtils";
import {
  buscarModelosPorNucleo,
  gerarContratoFinal,
} from "@/lib/juridico/contratoUtils";

export default function ContratoDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [contrato, setContrato] = useState<ContratoCompleto | null>(null);
  const [itens, setItens] = useState<ContratoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [mostrarModalAtivacao, setMostrarModalAtivacao] = useState(false);

  // Estados para geração de contrato jurídico
  const [gerandoContrato, setGerandoContrato] = useState(false);

  useEffect(() => {
    if (id) {
      carregarContrato();
    }
  }, [id]);

  async function carregarContrato() {
    if (!id) return;

    try {
      setLoading(true);
      setErro(null);

      console.log("🔍 Carregando contrato com ID:", id);

      const [contratoData, itensData] = await Promise.all([
        buscarContrato(id),
        listarItensContrato(id),
      ]);

      console.log("✅ Contrato carregado:", contratoData);

      setContrato(contratoData as any);
      setItens(itensData);
    } catch (error: any) {
      console.error("❌ Erro ao carregar contrato:", error);
      const mensagemErro = error?.message || error?.toString() || "Erro desconhecido ao carregar contrato";
      setErro(mensagemErro);
      setContrato(null);
    } finally {
      setLoading(false);
    }
  }

  function handleAtivacaoSucesso(resultado: AtivarContratoResult) {
    setMostrarModalAtivacao(false);
    alert(resultado.mensagem);
    carregarContrato();
  }

  // Emitir contrato automaticamente - identifica núcleo e gera direto
  async function emitirContratoAutomatico() {
    if (!contrato) return;

    setGerandoContrato(true);

    try {
      // 1. Buscar modelo para o núcleo do contrato
      const modelos = await buscarModelosPorNucleo(contrato.unidade_negocio);

      if (modelos.length === 0) {
        alert(
          `Nenhum modelo de contrato publicado para o núcleo "${getUnidadeNegocioLabel(contrato.unidade_negocio)}".\n\n` +
          `Acesse o Módulo Jurídico para criar e publicar um modelo.`
        );
        setGerandoContrato(false);
        return;
      }

      // 2. Usar o primeiro modelo (mais recente)
      const modelo = modelos[0];

      // 3. Gerar contrato
      const resultado = await gerarContratoFinal(modelo.id, contrato.id);

      if (resultado.sucesso && resultado.html) {
        // 4. Abrir em nova janela para impressão
        const janela = window.open("", "_blank");
        if (janela) {
          janela.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Contrato ${contrato.numero} - ${getUnidadeNegocioLabel(contrato.unidade_negocio)}</title>
              <style>
                body {
                  font-family: 'Times New Roman', serif;
                  margin: 40px 60px;
                  line-height: 1.8;
                  font-size: 12pt;
                }
                h1, h2, h3 { font-family: Arial, sans-serif; }
                table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                th, td { border: 1px solid #333; padding: 8px; text-align: left; }
                th { background: #f5f5f5; }
                .assinaturas { margin-top: 60px; display: flex; justify-content: space-between; }
                .assinatura { text-align: center; width: 45%; }
                .assinatura-linha { border-top: 1px solid #333; margin-top: 60px; padding-top: 5px; }
                @media print {
                  body { margin: 20px 40px; }
                  @page { margin: 2cm; }
                }
              </style>
            </head>
            <body>
              ${resultado.html}

              <div class="assinaturas">
                <div class="assinatura">
                  <div class="assinatura-linha">
                    <strong>CONTRATANTE</strong><br>
                    ${contrato.cliente_nome || ""}
                  </div>
                </div>
                <div class="assinatura">
                  <div class="assinatura-linha">
                    <strong>CONTRATADA</strong><br>
                    Grupo WG Almeida
                  </div>
                </div>
              </div>
            </body>
            </html>
          `);
          janela.document.close();

          // Auto-print após carregar
          setTimeout(() => {
            janela.print();
          }, 500);
        }
      } else {
        const erros = resultado.erros?.join("\n") || "Erro ao gerar contrato";
        alert(`Erro ao gerar contrato:\n\n${erros}`);
      }
    } catch (error: any) {
      alert(`Erro ao gerar contrato:\n\n${error.message || "Erro desconhecido"}`);
    } finally {
      setGerandoContrato(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#F25C26]" />
          <p className="text-sm text-gray-600 mt-4">Carregando contrato...</p>
        </div>
      </div>
    );
  }

  if (!contrato) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="mb-6">
            <svg
              className="w-16 h-16 mx-auto text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Contrato não encontrado
            </h2>
            {erro && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
                <p className="text-sm font-semibold text-red-800 mb-1">
                  Erro ao carregar:
                </p>
                <p className="text-sm text-red-700 font-mono">{erro}</p>
                <p className="text-xs text-red-600 mt-2">
                  ID do contrato: {id}
                </p>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => navigate("/contratos")}
            className="mt-4 px-6 py-2 text-[#F25C26] hover:text-[#e04a1a] font-medium border border-[#F25C26] rounded-lg hover:bg-orange-50 transition-colors"
          >
            Voltar para contratos
          </button>
        </div>
      </div>
    );
  }

  const podeAtivar =
    contrato.assinatura_cliente_base64 &&
    contrato.assinatura_responsavel_base64 &&
    contrato.status === "aguardando_assinatura";

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => navigate("/contratos")}
            className="text-gray-600 hover:text-gray-900 mb-2 flex items-center gap-1 text-sm"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Voltar
          </button>
          <h1 className="text-2xl font-bold text-[#2E2E2E]">
            {contrato.numero}
          </h1>
          <p className="text-sm text-gray-600 mt-1">{contrato.descricao}</p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="px-3 py-1 rounded-full text-sm font-medium"
            style={{
              backgroundColor: `${getStatusContratoColor(contrato.status)}20`,
              color: getStatusContratoColor(contrato.status),
            }}
          >
            {getStatusContratoLabel(contrato.status)}
          </span>

          {/* Botão Emitir Contrato - Automático por Núcleo */}
          <button
            type="button"
            onClick={emitirContratoAutomatico}
            disabled={gerandoContrato}
            className="px-4 py-2 bg-[#2B4580] text-white rounded-lg hover:bg-[#1e3260] font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-wait"
            title={`Emitir contrato do núcleo ${getUnidadeNegocioLabel(contrato.unidade_negocio)}`}
          >
            {gerandoContrato ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Gerando...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Emitir Contrato
              </>
            )}
          </button>

          {/* Ações Rápidas */}
          <div className="flex items-center gap-2 border-l pl-3">
            <button
              type="button"
              onClick={() => gerarContratoPDF(contrato, itens)}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Gerar PDF"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={async () => {
                try {
                  await gerarContratoPDF(contrato, itens);
                } catch (err) {
                  console.error("Erro ao gerar PDF para WhatsApp:", err);
                }

                const valorTexto = formatarValor(contrato.valor_total || 0);
                const texto = `Ola! Segue o contrato ${contrato.numero} no valor de ${valorTexto}. O PDF foi gerado para envio.`;
                const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
                window.open(url, "_blank");
              }}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Compartilhar no WhatsApp"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </button>
            <button
              type="button"
              onClick={() => {
                const assunto = `Contrato ${contrato.numero}`;
                const corpo = `Prezado(a),\n\nSegue em anexo o contrato ${contrato.numero} no valor de R$ ${contrato.valor_total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}.\n\nAtenciosamente,\nGrupo WG Almeida`;
                window.location.href = `mailto:?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
              }}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Enviar por Email"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => {
                const url = window.location.href;
                if (navigator.share) {
                  navigator.share({
                    title: `Contrato ${contrato.numero}`,
                    text: `Contrato ${contrato.numero} - R$ ${contrato.valor_total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`,
                    url: url
                  });
                } else {
                  navigator.clipboard.writeText(url);
                  alert('Link copiado para a área de transferência!');
                }
              }}
              className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              title="Compartilhar"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>

          {podeAtivar && (
            <button
              type="button"
              onClick={() => setMostrarModalAtivacao(true)}
              className="px-4 py-2 bg-[#F25C26] text-white rounded-lg hover:bg-[#e04a1a] font-medium"
            >
              Ativar Contrato
            </button>
          )}
          {contrato.status === "ativo" && (
            <>
              <button
                type="button"
                onClick={() => navigate(`/financeiro?contrato_id=${id}`)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Financeiro
              </button>
              <button
                type="button"
                onClick={() => navigate(`/cronograma/projetos?contrato_id=${id}`)}
                className="px-4 py-2 bg-[#F25C26] text-white rounded-lg hover:bg-[#d94d1f] font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Cronograma
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => navigate(`/contratos/${id}/editar`)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            Editar
          </button>
        </div>
      </div>

      {/* Informações Principais */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Informações Gerais
            </h3>
            <span
              className="px-3 py-1 rounded text-xs font-semibold text-white"
              style={{
                backgroundColor: getUnidadeNegocioColor(contrato.unidade_negocio),
              }}
            >
              {getUnidadeNegocioLabel(contrato.unidade_negocio)}
            </span>
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-gray-600">Cliente:</span>
              <p className="font-semibold text-gray-900">{contrato.cliente_nome}</p>
            </div>
            <div>
              <span className="text-gray-600">Data de Criação:</span>
              <p className="font-semibold text-gray-900">
                {new Date(contrato.data_criacao).toLocaleDateString("pt-BR")}
              </p>
            </div>
            {contrato.prazo_entrega_dias && (
              <div>
                <span className="text-gray-600">Prazo de Entrega:</span>
                <p className="font-semibold text-gray-900">
                  {contrato.prazo_entrega_dias} dias
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
            Valores
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Mão de Obra:</span>
              <span className="font-semibold text-gray-900">
                R${" "}
                {contrato.valor_mao_obra.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Materiais:</span>
              <span className="font-semibold text-gray-900">
                R${" "}
                {contrato.valor_materiais.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <span className="text-gray-700 font-semibold">Total:</span>
              <span className="font-bold text-xl text-[#F25C26]">
                R${" "}
                {contrato.valor_total.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
            Assinaturas
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {contrato.assinatura_cliente_base64 ? (
                <>
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-green-700">
                    Cliente Assinou
                  </span>
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm text-gray-600">Aguardando Cliente</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              {contrato.assinatura_responsavel_base64 ? (
                <>
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-green-700">
                    Responsável Assinou
                  </span>
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm text-gray-600">
                    Aguardando Responsável
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Itens do Contrato */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-[#2E2E2E] mb-4">
          Itens do Contrato
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F5F5F5] border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Descrição
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Tipo
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                  Quantidade
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                  Produção/dia
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                  Dias Est.
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                  Preço Unit.
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {itens.map((item) => {
                const valorUnitario = item.valor_unitario ?? item.preco_unitario ?? 0;
                const valorTotal = item.valor_total ?? item.preco_total ?? valorUnitario * (item.quantidade || 0);
                const producao = item.producao_diaria ?? null;
                const diasEstimados = item.dias_estimados ?? (producao && producao > 0 ? item.quantidade / producao : null);

                return (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-gray-900">{item.descricao}</td>
                    <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.tipo === "mao_obra"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {item.tipo === "mao_obra" ? "Mão de Obra" : "Material"}
                    </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900">
                      {item.quantidade} {item.unidade}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900">
                      {producao
                        ? `${producao.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })} ${item.unidade}/dia`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900">
                      {diasEstimados
                        ? `${diasEstimados.toLocaleString("pt-BR", {
                            minimumFractionDigits: 1,
                            maximumFractionDigits: 1,
                          })} dia(s)`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900">
                      R${" "}
                      {valorUnitario.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      R${" "}
                      {valorTotal.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                );
              })}
              {itens.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-600">
                    Nenhum item adicionado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Observações */}
      {contrato.observacoes && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-[#2E2E2E] mb-3">
            Observações
          </h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {contrato.observacoes}
          </p>
        </div>
      )}

      {/* Modal de Ativação */}
      {mostrarModalAtivacao && (
        <ContratoAtivacaoModal
          contrato_id={contrato.id}
          contrato_numero={contrato.numero}
          valor_total={contrato.valor_total}
          onClose={() => setMostrarModalAtivacao(false)}
          onSuccess={handleAtivacaoSucesso}
        />
      )}

    </div>
  );
}
