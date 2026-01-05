// ==========================================
// EMPRESAS DO GRUPO WG
// Sistema WG Easy - Grupo WG Almeida
// ==========================================

import { useState, useEffect } from "react";
import { buscarEmpresaPorCNPJ, formatarCNPJ, validarCNPJ, type DadosEmpresaCNPJ } from "@/lib/cnpjApi";
import { supabaseRaw as supabase } from "@/lib/supabaseClient";
import { Edit2, Plus, DollarSign, Share2, ChevronDown, ChevronUp, Trash2, FileText } from "lucide-react";
import EmpresaEditModal from "@/components/empresas/EmpresaEditModal";
import ContaBancariaForm from "@/components/ContaBancariaForm";
import {
  listarEmpresas,
  buscarEmpresaCompleta,
  criarEmpresa,
  atualizarEmpresa,
  listarContasPorEmpresa,
  criarConta,
  atualizarConta,
  excluirConta,
  definirContaPadrao,
  excluirEmpresa
} from "@/lib/empresasApi";
import { gerarEmpresaPDFCompleto } from "@/lib/empresaPdfUtils";
import type { EmpresaGrupo, ContaBancaria, EmpresaFormData, ContaBancariaFormData } from "@/types/empresas";
import { formatarCNPJ as formatarCNPJType, formatarAgencia, formatarConta, formatarBanco } from "@/types/empresas";

interface Empresa {
  id: string;
  cnpj: string;
  razao_social: string;
  nome_fantasia?: string;
  email?: string;
  telefone?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  ativo: boolean;
  criado_em: string;
}

export default function EmpresasPage() {
  const [cnpj, setCnpj] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [dadosEncontrados, setDadosEncontrados] = useState<DadosEmpresaCNPJ | null>(null);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  // Estados para modais e gerenciamento
  const [empresaEditando, setEmpresaEditando] = useState<EmpresaGrupo | undefined>(undefined);
  const [mostrarModalEmpresa, setMostrarModalEmpresa] = useState(false);
  const [empresaExpandida, setEmpresaExpandida] = useState<string | null>(null);
  const [contasPorEmpresa, setContasPorEmpresa] = useState<{ [key: string]: ContaBancaria[] }>({});
  const [mostrarFormConta, setMostrarFormConta] = useState<string | null>(null);
  const [contaEditando, setContaEditando] = useState<ContaBancaria | undefined>(undefined);

  useEffect(() => {
    carregarEmpresas();
  }, []);

  async function carregarEmpresas() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("empresas_grupo")
        .select("*")
        .order("criado_em", { ascending: false });

      if (error) throw error;

      setEmpresas((data || []) as Empresa[]);
    } catch (error) {
      console.error("Erro ao carregar empresas:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleBuscarCNPJ() {
    setErro("");
    setSucesso("");
    setDadosEncontrados(null);

    if (!cnpj.trim()) {
      setErro("Digite um CNPJ");
      return;
    }

    if (!validarCNPJ(cnpj)) {
      setErro("CNPJ inválido");
      return;
    }

    try {
      setBuscando(true);
      const dados = await buscarEmpresaPorCNPJ(cnpj);
      setDadosEncontrados(dados);
      setErro("");
    } catch (error: any) {
      setErro(error.message || "Erro ao buscar CNPJ");
      setDadosEncontrados(null);
    } finally {
      setBuscando(false);
    }
  }

  async function handleSalvarEmpresa() {
    if (!dadosEncontrados) return;

    try {
      setSalvando(true);

      // Verificar se já existe
      const { data: empresaExistente } = await supabase
        .from("empresas_grupo")
        .select("*")
        .eq("cnpj", dadosEncontrados.cnpj)
        .single();

      if (empresaExistente) {
        setErro("Esta empresa já está cadastrada");
        return;
      }

      // Inserir empresa
      const { data, error } = await supabase
        .from("empresas_grupo")
        .insert({
          cnpj: dadosEncontrados.cnpj,
          razao_social: dadosEncontrados.razao_social,
          nome_fantasia: dadosEncontrados.nome_fantasia,
          email: dadosEncontrados.email,
          telefone: dadosEncontrados.telefone,
          logradouro: dadosEncontrados.logradouro,
          numero: dadosEncontrados.numero,
          bairro: dadosEncontrados.bairro,
          cidade: dadosEncontrados.municipio,
          estado: dadosEncontrados.uf,
          cep: dadosEncontrados.cep,
          tipo: 'matriz',
          ativo: true,
        })
        .select()
        .single();

      if (error) throw error;

      setSucesso("Empresa cadastrada com sucesso!");
      setCnpj("");
      setDadosEncontrados(null);
      await carregarEmpresas();

      // Limpar mensagem após 3 segundos
      setTimeout(() => setSucesso(""), 3000);
    } catch (error: any) {
      console.error("Erro ao salvar empresa:", error);
      setErro(error.message || "Erro ao salvar empresa");
    } finally {
      setSalvando(false);
    }
  }

  async function handleToggleAtivo(id: string, ativo: boolean) {
    try {
      const { error } = await supabase
        .from("empresas_grupo")
        .update({ ativo: !ativo })
        .eq("id", id);

      if (error) throw error;

      await carregarEmpresas();
    } catch (error) {
      console.error("Erro ao atualizar empresa:", error);
      alert("Erro ao atualizar empresa");
    }
  }

  // ========================================
  // FUNÇÕES PARA GERENCIAMENTO DE EMPRESAS
  // ========================================

  async function handleEditarEmpresa(empresa: Empresa) {
    try {
      const empresaCompleta = await buscarEmpresaCompleta(empresa.id);
      setEmpresaEditando(empresaCompleta as EmpresaGrupo);
      setMostrarModalEmpresa(true);
    } catch (error) {
      console.error("Erro ao carregar empresa:", error);
      alert("Erro ao carregar dados da empresa");
    }
  }

  async function handleSalvarEmpresaModal(dados: EmpresaFormData) {
    try {
      if (empresaEditando) {
        await atualizarEmpresa(empresaEditando.id, dados);
        setSucesso("Empresa atualizada com sucesso!");
      }
      setMostrarModalEmpresa(false);
      setEmpresaEditando(undefined);
      await carregarEmpresas();

      setTimeout(() => setSucesso(""), 3000);
    } catch (error: any) {
      console.error("Erro ao salvar empresa:", error);
      alert(error.message || "Erro ao salvar empresa");
      throw error;
    }
  }

  // ========================================
  // FUNÇÕES PARA CONTAS BANCÁRIAS
  // ========================================

  async function handleExpandirEmpresa(empresaId: string) {
    if (empresaExpandida === empresaId) {
      setEmpresaExpandida(null);
      return;
    }

    setEmpresaExpandida(empresaId);

    // Carregar contas se ainda não foram carregadas
    if (!contasPorEmpresa[empresaId]) {
      try {
        const contas = await listarContasPorEmpresa(empresaId);
        setContasPorEmpresa({
          ...contasPorEmpresa,
          [empresaId]: contas,
        });
      } catch (error) {
        console.error("Erro ao carregar contas:", error);
      }
    }
  }

  async function handleAdicionarConta(empresaId: string) {
    setContaEditando(undefined);
    setMostrarFormConta(empresaId);
  }

  async function handleEditarConta(conta: ContaBancaria) {
    setContaEditando(conta);
    setMostrarFormConta(conta.empresa_id);
  }

  async function handleSalvarConta(empresaId: string, dados: ContaBancariaFormData) {
    try {
      if (contaEditando) {
        await atualizarConta(contaEditando.id, dados);
        setSucesso("Conta atualizada com sucesso!");
      } else {
        await criarConta(empresaId, dados);
        setSucesso("Conta adicionada com sucesso!");
      }

      // Recarregar contas
      const contas = await listarContasPorEmpresa(empresaId);
      setContasPorEmpresa({
        ...contasPorEmpresa,
        [empresaId]: contas,
      });

      setMostrarFormConta(null);
      setContaEditando(undefined);

      setTimeout(() => setSucesso(""), 3000);
    } catch (error: any) {
      console.error("Erro ao salvar conta:", error);
      alert(error.message || "Erro ao salvar conta");
    }
  }

  async function handleExcluirConta(empresaId: string, contaId: string) {
    if (!confirm("Deseja realmente excluir esta conta bancária?")) return;

    try {
      await excluirConta(contaId);

      // Recarregar contas
      const contas = await listarContasPorEmpresa(empresaId);
      setContasPorEmpresa({
        ...contasPorEmpresa,
        [empresaId]: contas,
      });

      setSucesso("Conta excluída com sucesso!");
      setTimeout(() => setSucesso(""), 3000);
    } catch (error: any) {
      console.error("Erro ao excluir conta:", error);
      alert(error.message || "Erro ao excluir conta");
    }
  }

  async function handleDefinirPadrao(empresaId: string, contaId: string) {
    try {
      await definirContaPadrao(contaId);

      // Recarregar contas
      const contas = await listarContasPorEmpresa(empresaId);
      setContasPorEmpresa({
        ...contasPorEmpresa,
        [empresaId]: contas,
      });

      setSucesso("Conta definida como padrão!");
      setTimeout(() => setSucesso(""), 3000);
    } catch (error: any) {
      console.error("Erro ao definir conta padrão:", error);
      alert(error.message || "Erro ao definir conta padrão");
    }
  }

  async function handleGerarPDF(empresaId: string) {
    try {
      const empresaCompleta = await buscarEmpresaCompleta(empresaId);
      if (!empresaCompleta || !empresaCompleta.conta_padrao) {
        alert("Empresa não possui conta bancária padrão");
        return;
      }

      await gerarEmpresaPDFCompleto(empresaCompleta as EmpresaGrupo, empresaCompleta.conta_padrao);
      setSucesso("PDF gerado com sucesso!");
      setTimeout(() => setSucesso(""), 3000);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar PDF");
    }
  }

  async function handleExcluirEmpresa(empresaId: string, razaoSocial: string) {
    if (!confirm(`Deseja realmente EXCLUIR PERMANENTEMENTE a empresa "${razaoSocial}"?\n\nEsta ação NÃO pode ser desfeita e irá remover todos os dados associados.`)) {
      return;
    }

    // Segunda confirmação para segurança
    if (!confirm("Tem CERTEZA ABSOLUTA? Esta ação é IRREVERSÍVEL!")) {
      return;
    }

    try {
      await excluirEmpresa(empresaId);
      setSucesso("Empresa excluída permanentemente!");
      await carregarEmpresas();
      setTimeout(() => setSucesso(""), 3000);
    } catch (error: any) {
      console.error("Erro ao excluir empresa:", error);
      alert(error.message || "Erro ao excluir empresa");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#F25C26] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando empresas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Empresas do Grupo WG
          </h1>
          <p className="text-gray-600">
            Cadastro de empresas do grupo - coloque o CNPJ e busca automaticamente e cadastra a empresa. Serve para emissão de contratos.
          </p>
        </div>

        {/* Busca por CNPJ */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Adicionar Nova Empresa
          </h2>

          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={cnpj}
              onChange={(e) => {
                const valor = e.target.value.replace(/[^\d]/g, '');
                setCnpj(formatarCNPJ(valor));
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleBuscarCNPJ()}
              placeholder="Digite o CNPJ (ex: 00.000.000/0000-00)"
              maxLength={18}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F25C26] focus:border-transparent"
            />
            <button
              type="button"
              onClick={handleBuscarCNPJ}
              disabled={buscando}
              className="px-6 py-3 bg-[#F25C26] text-white rounded-lg hover:bg-[#e04a1a] font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-colors"
            >
              {buscando ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Buscar CNPJ
                </>
              )}
            </button>
          </div>

          {/* Mensagens */}
          {erro && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-800">{erro}</p>
            </div>
          )}

          {sucesso && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-green-800">{sucesso}</p>
            </div>
          )}

          {/* Dados da Empresa Encontrada */}
          {dadosEncontrados && (
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Dados da Empresa
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  dadosEncontrados.situacao === 'ATIVA' || dadosEncontrados.situacao === 'Ativa'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {dadosEncontrados.situacao}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">CNPJ</p>
                  <p className="font-semibold text-gray-900">{dadosEncontrados.cnpj}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Razão Social</p>
                  <p className="font-semibold text-gray-900">{dadosEncontrados.razao_social}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Nome Fantasia</p>
                  <p className="font-semibold text-gray-900">{dadosEncontrados.nome_fantasia || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Porte</p>
                  <p className="font-semibold text-gray-900">{dadosEncontrados.porte}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">Endereço</p>
                  <p className="font-semibold text-gray-900">
                    {dadosEncontrados.logradouro}, {dadosEncontrados.numero}
                    {dadosEncontrados.complemento && ` - ${dadosEncontrados.complemento}`}
                    {` - ${dadosEncontrados.bairro}, ${dadosEncontrados.municipio}/${dadosEncontrados.uf}`}
                    {` - CEP: ${dadosEncontrados.cep}`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSalvarEmpresa}
                disabled={salvando}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {salvando ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Cadastrar Empresa
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Lista de Empresas Cadastradas */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Empresas Cadastradas ({empresas.length})
            </h2>
          </div>

          {empresas.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">🏢</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Nenhuma empresa cadastrada
              </h3>
              <p className="text-gray-500">
                Use o formulário acima para adicionar empresas do grupo
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {empresas.map((empresa) => (
                <div key={empresa.id} className="hover:bg-gray-50 transition-colors">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {empresa.razao_social}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            empresa.ativo
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {empresa.ativo ? 'Ativa' : 'Inativa'}
                          </span>
                        </div>

                        {empresa.nome_fantasia && (
                          <p className="text-sm text-gray-600 mb-1">
                            Nome Fantasia: {empresa.nome_fantasia}
                          </p>
                        )}

                        <p className="text-sm text-gray-600 mb-1">
                          CNPJ: {empresa.cnpj}
                        </p>

                        {(empresa.logradouro || empresa.cidade) && (
                          <p className="text-sm text-gray-600">
                            📍 {empresa.logradouro && `${empresa.logradouro}, ${empresa.numero || 'S/N'}`}
                            {empresa.cidade && ` - ${empresa.cidade}/${empresa.estado}`}
                          </p>
                        )}

                        {(empresa.email || empresa.telefone) && (
                          <div className="flex items-center gap-4 mt-2">
                            {empresa.email && (
                              <p className="text-sm text-gray-600">
                                ✉️ {empresa.email}
                              </p>
                            )}
                            {empresa.telefone && (
                              <p className="text-sm text-gray-600">
                                📞 {empresa.telefone}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Botões de Ação */}
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          type="button"
                          onClick={() => handleEditarEmpresa(empresa)}
                          className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                          title="Editar empresa"
                        >
                          <Edit2 size={18} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleExpandirEmpresa(empresa.id)}
                          className="p-2 text-[#F25C26] hover:bg-orange-50 rounded-lg transition-colors"
                          title="Contas bancárias"
                        >
                          <DollarSign size={18} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleGerarPDF(empresa.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Gerar PDF"
                        >
                          <FileText size={18} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleAtivo(empresa.id, empresa.ativo)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            empresa.ativo
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {empresa.ativo ? 'Desativar' : 'Ativar'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleExcluirEmpresa(empresa.id, empresa.razao_social)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                          title="Excluir empresa permanentemente"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Seção Expansível de Contas Bancárias */}
                    {empresaExpandida === empresa.id && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-md font-semibold text-gray-900">
                            Contas Bancárias
                          </h4>
                          <button
                            type="button"
                            onClick={() => handleAdicionarConta(empresa.id)}
                            className="px-3 py-2 bg-[#F25C26] text-white rounded-lg hover:bg-[#e04a1a] text-sm font-medium flex items-center gap-2"
                          >
                            <Plus size={16} />
                            Adicionar Conta
                          </button>
                        </div>

                        {/* Formulário de Conta */}
                        {mostrarFormConta === empresa.id && (
                          <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <h5 className="text-sm font-semibold text-gray-900 mb-3">
                              {contaEditando ? 'Editar Conta' : 'Nova Conta Bancária'}
                            </h5>
                            <ContaBancariaForm
                              conta={contaEditando}
                              onSave={(dados) => handleSalvarConta(empresa.id, dados)}
                              onCancel={() => {
                                setMostrarFormConta(null);
                                setContaEditando(undefined);
                              }}
                            />
                          </div>
                        )}

                        {/* Lista de Contas */}
                        <div className="space-y-3">
                          {contasPorEmpresa[empresa.id]?.length === 0 && (
                            <p className="text-sm text-gray-500 text-center py-4">
                              Nenhuma conta bancária cadastrada
                            </p>
                          )}

                          {contasPorEmpresa[empresa.id]?.map((conta) => (
                            <div
                              key={conta.id}
                              className="p-4 bg-white border border-gray-200 rounded-lg"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <p className="font-semibold text-gray-900">
                                      {formatarBanco(conta.banco_codigo, conta.banco_nome)}
                                    </p>
                                    {conta.padrao && (
                                      <span className="px-2 py-1 bg-[#F25C26] text-white text-xs font-medium rounded">
                                        PADRÃO
                                      </span>
                                    )}
                                    {conta.apelido && (
                                      <span className="text-sm text-gray-500">
                                        ({conta.apelido})
                                      </span>
                                    )}
                                  </div>

                                  <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div>
                                      <p className="text-gray-600">Agência</p>
                                      <p className="font-medium text-gray-900">
                                        {formatarAgencia(conta.agencia, conta.agencia_digito)}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-gray-600">Conta</p>
                                      <p className="font-medium text-gray-900">
                                        {formatarConta(conta.conta, conta.conta_digito)}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-gray-600">Tipo</p>
                                      <p className="font-medium text-gray-900">
                                        {conta.tipo_conta === 'corrente' ? 'Corrente' : conta.tipo_conta === 'poupanca' ? 'Poupança' : 'Pagamento'}
                                      </p>
                                    </div>
                                  </div>

                                  {conta.pix_chave && (
                                    <div className="mt-2 text-sm">
                                      <p className="text-gray-600">
                                        PIX ({conta.pix_tipo}): <span className="font-medium text-gray-900">{conta.pix_chave}</span>
                                      </p>
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center gap-2 ml-4">
                                  {!conta.padrao && (
                                    <button
                                      type="button"
                                      onClick={() => handleDefinirPadrao(empresa.id, conta.id)}
                                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-xs"
                                      title="Definir como padrão"
                                    >
                                      ⭐
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => handleEditarConta(conta)}
                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                    title="Editar"
                                  >
                                    <Edit2 size={16} />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleExcluirConta(empresa.id, conta.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Excluir"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal de Edição de Empresa */}
        {mostrarModalEmpresa && (
          <EmpresaEditModal
            empresa={empresaEditando}
            onSave={handleSalvarEmpresaModal}
            onClose={() => {
              setMostrarModalEmpresa(false);
              setEmpresaEditando(undefined);
            }}
          />
        )}
      </div>
    </div>
  );
}
