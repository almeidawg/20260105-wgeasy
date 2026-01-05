// ============================================================
// PÁGINA: Listagem de Propostas
// Sistema WG Easy - Grupo WG Almeida
// ============================================================

import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { listarPropostas, buscarProposta, duplicarProposta } from "@/lib/propostasApi";
import type { PropostaCompleta, PropostaStatus } from "@/types/propostas";
import { getStatusPropostaLabel, getStatusPropostaColor } from "@/types/propostas";
import { supabaseRaw as supabase } from "@/lib/supabaseClient";
import { gerarPropostaPDF } from "@/lib/propostaPdfUtils";
import { CORES_NUCLEOS, type Nucleo } from "@/constants/oportunidades";

export default function PropostasPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [propostas, setPropostas] = useState<PropostaCompleta[]>([]);
  const [propostasFiltradas, setPropostasFiltradas] = useState<PropostaCompleta[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<PropostaStatus | "todas">("todas");

  // Helper para obter cor do núcleo
  const getCorNucleo = (nucleo: string | null | undefined): { primary: string; secondary: string; text: string; border: string; hover: string } => {
    const defaultCor = CORES_NUCLEOS.Arquitetura;

    if (!nucleo) return defaultCor;

    // Mapear string do banco para tipo Nucleo (capitalizar primeira letra)
    const nucleoKey = nucleo.charAt(0).toUpperCase() + nucleo.slice(1).toLowerCase();

    if (nucleoKey === "Arquitetura" || nucleoKey === "Engenharia" || nucleoKey === "Marcenaria") {
      return CORES_NUCLEOS[nucleoKey as Nucleo];
    }

    return defaultCor;
  };

  // Função para carregar propostas
  const carregarPropostas = async () => {
    try {
      setLoading(true);
      const data = await listarPropostas();
      setPropostas(data);
      setPropostasFiltradas(data);
    } catch (error) {
      console.error("Erro ao carregar propostas:", error);
      alert("Erro ao carregar propostas");
    } finally {
      setLoading(false);
    }
  };

  // Carregar propostas no mount e sempre que voltar para esta página
  useEffect(() => {
    carregarPropostas();
  }, [location.key]); // Recarrega toda vez que a navegação muda

  // Aplicar filtros
  useEffect(() => {
    let resultado = [...propostas];

    // Filtro por busca
    if (busca.trim()) {
      const buscaLower = busca.toLowerCase();
      resultado = resultado.filter(
        (p) =>
          p.titulo?.toLowerCase().includes(buscaLower) ||
          p.numero?.toLowerCase().includes(buscaLower) ||
          p.cliente_nome?.toLowerCase().includes(buscaLower)
      );
    }

    // Filtro por status
    if (filtroStatus !== "todas") {
      resultado = resultado.filter((p) => p.status === filtroStatus);
    }

    setPropostasFiltradas(resultado);
  }, [busca, filtroStatus, propostas]);

  // Estatísticas
  const stats = {
    total: propostas.length,
    rascunho: propostas.filter((p) => p.status === "rascunho").length,
    enviada: propostas.filter((p) => p.status === "enviada").length,
    aprovada: propostas.filter((p) => p.status === "aprovada").length,
    rejeitada: propostas.filter((p) => p.status === "rejeitada").length,
  };

  // Marcar proposta como enviada
  async function marcarComoEnviada(propostaId: string) {
    if (!confirm("Deseja marcar esta proposta como enviada?")) return;

    try {
      const { error } = await supabase
        .from("propostas")
        .update({ status: "enviada" })
        .eq("id", propostaId);

      if (error) throw error;

      alert("Proposta marcada como enviada!");

      // Recarregar propostas
      const data = await listarPropostas();
      setPropostas(data);
      setPropostasFiltradas(data);
    } catch (error) {
      console.error("Erro ao marcar proposta como enviada:", error);
      alert("Erro ao atualizar status da proposta");
    }
  }

  // Aprovar proposta
  async function aprovarProposta(propostaId: string) {
    if (!confirm("Deseja aprovar esta proposta e criar o contrato?")) return;

    try {
      const { error } = await supabase
        .from("propostas")
        .update({ status: "aprovada" })
        .eq("id", propostaId);

      if (error) throw error;

      alert("Proposta aprovada com sucesso!");

      // Recarregar propostas
      const data = await listarPropostas();
      setPropostas(data);
      setPropostasFiltradas(data);

      // Navegar para criação de contrato
      navigate(`/contratos/novo?proposta_id=${propostaId}`);
    } catch (error) {
      console.error("Erro ao aprovar proposta:", error);
      alert("Erro ao aprovar proposta");
    }
  }

  // Gerar PDF da proposta
  async function handleGerarPDF(propostaId: string) {
    try {
      setLoading(true);

      // Buscar proposta completa com itens
      const propostaCompleta = await buscarProposta(propostaId);

      // Gerar PDF
      await gerarPropostaPDF(propostaCompleta);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar PDF da proposta");
    } finally {
      setLoading(false);
    }
  }

  // Excluir proposta
  async function excluirProposta(propostaId: string, titulo: string) {
    if (!confirm(`Tem certeza que deseja excluir a proposta "${titulo}"?\n\nEsta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      setLoading(true);

      // Deletar itens da proposta primeiro (por causa da FK)
      const { error: erroItens } = await supabase
        .from("propostas_itens")
        .delete()
        .eq("proposta_id", propostaId);

      if (erroItens) throw erroItens;

      // Deletar proposta
      const { error: erroProposta } = await supabase
        .from("propostas")
        .delete()
        .eq("id", propostaId);

      if (erroProposta) throw erroProposta;

      alert("Proposta excluída com sucesso!");

      // Recarregar propostas
      const data = await listarPropostas();
      setPropostas(data);
      setPropostasFiltradas(data);
    } catch (error) {
      console.error("Erro ao excluir proposta:", error);
      alert("Erro ao excluir proposta");
    } finally {
      setLoading(false);
    }
  }

  // Enviar por email
  async function enviarPorEmail(propostaId: string) {
    try {
      const proposta = propostas.find((p) => p.id === propostaId);
      if (!proposta || !proposta.cliente_nome) {
        alert("Cliente não encontrado");
        return;
      }

      // Gerar PDF primeiro
      const propostaCompleta = await buscarProposta(propostaId);
      await gerarPropostaPDF(propostaCompleta);

      // Abrir cliente de email
      const assunto = `Proposta Comercial ${proposta.numero || ""} - Grupo WG Almeida`;
      const corpo = `Prezado(a) ${proposta.cliente_nome},\n\nSegue em anexo nossa proposta comercial.\n\nAtenciosamente,\nGrupo WG Almeida`;

      window.location.href = `mailto:?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
    } catch (error) {
      console.error("Erro ao enviar por email:", error);
      alert("Erro ao preparar envio por email");
    }
  }

  // Enviar por WhatsApp
  function enviarPorWhatsApp(propostaId: string) {
    try {
      const proposta = propostas.find((p) => p.id === propostaId);
      if (!proposta || !proposta.cliente_nome) {
        alert("Cliente não encontrado");
        return;
      }

      const mensagem = `Olá ${proposta.cliente_nome}! 👋\n\nSua proposta comercial está pronta!\n\n📋 Proposta: ${proposta.numero || proposta.titulo}\n💰 Valor: ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(proposta.valor_total)}\n\nAcesse o link para visualizar: ${window.location.origin}/propostas/${propostaId}/visualizar\n\nGrupo WG Almeida 🏗️`;

      window.open(`https://wa.me/?text=${encodeURIComponent(mensagem)}`, "_blank");
    } catch (error) {
      console.error("Erro ao enviar por WhatsApp:", error);
      alert("Erro ao preparar envio por WhatsApp");
    }
  }

  // Duplicar proposta
  async function handleDuplicarProposta(propostaId: string) {
    if (!confirm("Deseja duplicar esta proposta? Uma cópia será criada como rascunho.")) return;

    try {
      setLoading(true);
      const novaPropostaId = await duplicarProposta(propostaId);

      alert("Proposta duplicada com sucesso!");

      // Redirecionar para editar a nova proposta
      navigate(`/propostas/${novaPropostaId}/editar`);
    } catch (error) {
      console.error("Erro ao duplicar proposta:", error);
      alert("Erro ao duplicar proposta");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#F25C26]" />
          <p className="text-sm text-gray-600 mt-4">Carregando propostas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#2E2E2E]">Propostas Comerciais</h1>
            <p className="text-sm text-gray-600 mt-1 hidden sm:block">
              Gerencie suas propostas comerciais e crie contratos
            </p>
          </div>
          <button
            onClick={() => navigate("/propostas/nova")}
            className="px-4 py-2.5 bg-[#F25C26] text-white rounded-lg hover:bg-[#e04a1a] flex items-center justify-center gap-2 text-sm font-medium whitespace-nowrap shrink-0"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Nova Proposta</span>
          </button>
        </div>

        {/* Estatísticas - Responsivo */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs text-gray-600 mb-1">Total</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs text-gray-600 mb-1">Rascunhos</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-500">{stats.rascunho}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs text-gray-600 mb-1">Enviadas</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-600">{stats.enviada}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hidden sm:block">
            <p className="text-[10px] sm:text-xs text-gray-600 mb-1">Aprovadas</p>
            <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.aprovada}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hidden sm:block">
            <p className="text-[10px] sm:text-xs text-gray-600 mb-1">Rejeitadas</p>
            <p className="text-xl sm:text-2xl font-bold text-red-600">{stats.rejeitada}</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Busca */}
          <div className="flex-1">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F25C26] text-sm"
              />
            </div>
          </div>

          {/* Filtro Status */}
          <div className="w-full sm:w-48">
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value as PropostaStatus | "todas")}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F25C26] text-sm"
            >
              <option value="todas">Todos os status</option>
              <option value="rascunho">Rascunho</option>
              <option value="enviada">Enviada</option>
              <option value="aprovada">Aprovada</option>
              <option value="rejeitada">Rejeitada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
        </div>
      </div>

      {/* Listagem */}
      {propostasFiltradas.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-gray-600 font-medium mb-2">Nenhuma proposta encontrada</p>
          <p className="text-sm text-gray-500 mb-4">
            {busca || filtroStatus !== "todas"
              ? "Tente ajustar os filtros de busca"
              : "Comece criando sua primeira proposta comercial"}
          </p>
          {!busca && filtroStatus === "todas" && (
            <button
              onClick={() => navigate("/propostas/nova")}
              className="px-4 py-2 bg-[#F25C26] text-white rounded-lg hover:bg-[#e04a1a] text-sm font-medium"
            >
              Criar primeira proposta
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {propostasFiltradas.map((proposta) => (
            <div
              key={proposta.id}
              className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Header do Card */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: getStatusPropostaColor(proposta.status) }}
                    >
                      {getStatusPropostaLabel(proposta.status)}
                    </span>
                    {proposta.numero && (
                      <span className="text-xs sm:text-sm text-gray-500">#{proposta.numero}</span>
                    )}
                  </div>

                  {/* Título */}
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 line-clamp-2">{proposta.titulo}</h3>

                  {/* Cliente */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span className="truncate">{proposta.cliente_nome}</span>
                  </div>

                  {/* Valores e Info */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm">
                    <div>
                      <span className="text-gray-600">Valor: </span>
                      <span className="font-bold text-gray-900">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(proposta.valor_total)}
                      </span>
                    </div>
                    {proposta.prazo_execucao_dias && (
                      <div className="hidden sm:block">
                        <span className="text-gray-600">Prazo: </span>
                        <span className="font-medium text-gray-900">
                          {proposta.prazo_execucao_dias} dias
                        </span>
                      </div>
                    )}
                    <div className="hidden sm:block">
                      <span className="text-gray-600">Criado: </span>
                      <span className="font-medium text-gray-900">
                        {new Date(proposta.criado_em).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap sm:ml-4">
                  {/* Visualizar */}
                  <button
                    type="button"
                    onClick={() => navigate(`/propostas/${proposta.id}/visualizar`)}
                    className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Visualizar proposta"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </button>

                  {/* Editar */}
                  {proposta.status === "rascunho" && (
                    <button
                      type="button"
                      onClick={() => navigate(`/propostas/${proposta.id}/editar`)}
                      className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Editar proposta"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                  )}

                  {/* Marcar como Enviada */}
                  {proposta.status === "rascunho" && (
                    <button
                      type="button"
                      onClick={() => marcarComoEnviada(proposta.id)}
                      className="px-3 py-2 bg-[#F25C26] text-white rounded-lg hover:bg-[#d94d1f] text-xs font-medium flex items-center gap-1.5"
                      title="Marcar como enviada"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      Enviar
                    </button>
                  )}

                  {/* Aprovar Proposta */}
                  {proposta.status === "enviada" && (
                    <button
                      type="button"
                      onClick={() => aprovarProposta(proposta.id)}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-medium flex items-center gap-1.5"
                      title="Aprovar proposta e criar contrato"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Aprovar
                    </button>
                  )}

                  {/* Status Aprovada - Botão Visual com Cor do Núcleo */}
                  {proposta.status === "aprovada" && (
                    <button
                      type="button"
                      disabled
                      style={{
                        backgroundColor: getCorNucleo(proposta.nucleo).primary,
                        opacity: 0.8,
                        cursor: "not-allowed",
                      }}
                      className="px-3 py-2 text-white rounded-lg text-xs font-medium flex items-center gap-1.5"
                      title={`Proposta aprovada - Núcleo: ${proposta.nucleo || "N/A"}`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      ✓ Aprovada
                    </button>
                  )}

                  {/* Gerar PDF */}
                  <button
                    type="button"
                    onClick={() => handleGerarPDF(proposta.id)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    title="Gerar PDF da proposta"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </button>

                  {/* Enviar por Email */}
                  <button
                    type="button"
                    onClick={() => enviarPorEmail(proposta.id)}
                    className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                    title="Enviar por email"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </button>

                  {/* Enviar por WhatsApp */}
                  <button
                    type="button"
                    onClick={() => enviarPorWhatsApp(proposta.id)}
                    className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                    title="Enviar por WhatsApp"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </button>

                  {/* Duplicar Proposta */}
                  <button
                    type="button"
                    onClick={() => handleDuplicarProposta(proposta.id)}
                    className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Duplicar proposta"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>

                  {/* Excluir */}
                  <button
                    type="button"
                    onClick={() => excluirProposta(proposta.id, proposta.titulo)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir proposta"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
