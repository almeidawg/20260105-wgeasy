import { useEffect, useMemo, useState } from "react";
import {
  Edit2,
  ExternalLink,
  FolderOpen,
  Loader2,
  Mail,
  MessageCircle,
  PlusCircle,
  Search,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useClientesArea, type ClienteAreaInfo } from "@/hooks/useClientesArea";
import { BotaoGerarLink } from "@/components/cadastro-link/GerarLinkCadastroModal";
import { supabaseRaw as supabase } from "@/lib/supabaseClient";

interface ClienteDisponivel {
  id: string;
  nome: string;
  email?: string | null;
  telefone?: string | null;
}

const formatPhoneDigits = (telefone?: string | null) =>
  (telefone || "").replace(/\D/g, "");

// Gera senha dinâmica baseada no cliente: primeiras 3 letras do nome + últimos 4 dígitos do telefone
const gerarSenhaCliente = (nome: string, telefone?: string | null): string => {
  const nomeClean = nome.replace(/[^a-zA-Z]/g, "").toLowerCase();
  const prefixo = nomeClean.substring(0, 3) || "wg";
  const telefoneDigitos = (telefone || "").replace(/\D/g, "");
  const sufixo = telefoneDigitos.slice(-4) || "2025";
  return `${prefixo}${sufixo}`;
};

export default function AreaClienteCadastroPage() {
  const navigate = useNavigate();
  const { clientes, loading, setClientes, reload } = useClientesArea();
  const [lista, setLista] = useState<ClienteAreaInfo[]>([]);

  // Modal adicionar cliente
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [clientesDisponiveis, setClientesDisponiveis] = useState<
    ClienteDisponivel[]
  >([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [selectedCliente, setSelectedCliente] =
    useState<ClienteDisponivel | null>(null);
  const [driveLink, setDriveLink] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLista(clientes);
  }, [clientes]);

  const ativos = useMemo(
    () => lista.filter((item) => item.acessoLiberado).length,
    [lista]
  );

  // Buscar clientes cadastrados na tabela pessoas
  const buscarClientesDisponiveis = async (termo: string) => {
    if (termo.length < 2) {
      setClientesDisponiveis([]);
      return;
    }

    setLoadingClientes(true);
    try {
      const idsJaNaLista = lista.map((c) => c.id);

      // Buscar pessoas pelo nome
      const { data, error } = await supabase
        .from("pessoas")
        .select("id, nome, email, telefone")
        .ilike("nome", `%${termo}%`)
        .order("nome")
        .limit(30);

      if (error) {
        console.error("Erro na query:", error);
        throw error;
      }

      // Filtrar os que ainda não estão na lista
      const disponiveis = (data || []).filter(
        (p) => !idsJaNaLista.includes(p.id)
      );

      setClientesDisponiveis(disponiveis);
    } catch (err) {
      console.error("Erro ao buscar clientes:", err);
      setClientesDisponiveis([]);
    } finally {
      setLoadingClientes(false);
    }
  };

  // Debounce da busca
  useEffect(() => {
    const timer = setTimeout(() => {
      if (showAddModal) {
        buscarClientesDisponiveis(searchTerm);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, showAddModal]);

  const handleAdicionarCliente = async () => {
    if (!selectedCliente) return;

    setSaving(true);
    try {
      // Atualizar o drive_link na tabela pessoas
      if (driveLink.trim()) {
        const { error } = await supabase
          .from("pessoas")
          .update({ drive_link: driveLink.trim() })
          .eq("id", selectedCliente.id);

        if (error) {
          console.error("Erro ao salvar drive_link:", error);
        }
      }

      // Adicionar à lista local
      const novoCliente: ClienteAreaInfo = {
        id: selectedCliente.id,
        nome: selectedCliente.nome,
        email: selectedCliente.email,
        telefone: selectedCliente.telefone,
        drive_link: driveLink.trim() || null,
        contratos: [],
        acessoLiberado: true,
      };

      setLista((prev) => [...prev, novoCliente]);
      setClientes((prev) => [...prev, novoCliente]);

      // Fechar modal e limpar
      setShowAddModal(false);
      setSelectedCliente(null);
      setDriveLink("");
      setSearchTerm("");
      setClientesDisponiveis([]);

      // Recarregar lista
      reload();
    } catch (err) {
      console.error("Erro ao adicionar cliente:", err);
      alert("Erro ao adicionar cliente. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleShareWhatsapp = (cliente: ClienteAreaInfo) => {
    const numero = formatPhoneDigits(cliente.telefone);
    if (!numero) {
      alert("Cliente sem telefone cadastrado para envio pelo WhatsApp.");
      return;
    }

    // SEGURANÇA: Não enviar senha na URL - cliente deve usar login normal
    const linkAcesso = `${window.location.origin}/login?tipo=cliente`;
    const primeiroNome = cliente.nome.split(" ")[0];

    const mensagem = `Ola ${primeiroNome}!

Bem-vindo(a) a sua *Area do Cliente WG Almeida*!

Aqui voce tera acesso exclusivo a:
- Acompanhamento da sua obra em tempo real
- Galeria de fotos do progresso
- Documentos e contratos
- Cronograma de execucao
- Resumo financeiro
- Etapas do projeto

*Link de Acesso:*
${linkAcesso}

*Login:* ${cliente.email || "(cadastrar e-mail)"}
*Senha:* A senha cadastrada no sistema

_Para primeiro acesso, use "Esqueci minha senha" no login._

Qualquer duvida, estamos a disposicao!
*Equipe WG Almeida*`;

    window.open(
      `https://wa.me/55${numero}?text=${encodeURIComponent(mensagem)}`,
      "_blank"
    );
  };

  const handleShareEmail = (cliente: ClienteAreaInfo) => {
    if (!cliente.email) {
      alert("Cliente sem e-mail cadastrado.");
      return;
    }

    // SEGURANÇA: Não enviar senha na URL - cliente deve usar login normal
    const linkAcesso = `${window.location.origin}/login?tipo=cliente`;
    const primeiroNome = cliente.nome.split(" ")[0];

    const assunto = encodeURIComponent(
      "Seu Acesso Exclusivo a Area do Cliente WG Almeida"
    );
    const corpo = encodeURIComponent(
      `Ola ${primeiroNome}!

Bem-vindo(a) a sua Area do Cliente WG Almeida!

Aqui voce tera acesso exclusivo a:
- Acompanhamento da sua obra em tempo real
- Galeria de fotos do progresso
- Documentos e contratos
- Cronograma de execucao
- Resumo financeiro
- Etapas do projeto

========================================
SEUS DADOS DE ACESSO
========================================

Link: ${linkAcesso}

Login: ${cliente.email}
Senha: A senha cadastrada no sistema

Para primeiro acesso, use "Esqueci minha senha" no login.
========================================

Qualquer duvida, estamos a disposicao!

Atenciosamente,
Equipe WG Almeida`
    );
    window.open(
      `mailto:${cliente.email}?subject=${assunto}&body=${corpo}`,
      "_blank"
    );
  };

  const handleEditar = (clienteId: string) => {
    navigate(`/pessoas/clientes/${clienteId}`);
  };

  const handleExcluir = async (cliente: ClienteAreaInfo) => {
    // Se cliente tem contratos ativos, não pode remover
    if (cliente.contratos.length > 0) {
      alert(
        "Este cliente possui contratos vinculados e não pode ser removido da área do cliente.\n\n" +
          "Para remover, cancele ou conclua os contratos primeiro."
      );
      return;
    }

    if (
      !confirm(
        `Deseja remover "${cliente.nome}" da área do cliente?\n\nIsso irá limpar o link do Drive vinculado.`
      )
    ) {
      return;
    }

    try {
      // Limpar drive_link no banco para remover da área do cliente
      const { error } = await supabase
        .from("pessoas")
        .update({ drive_link: null })
        .eq("id", cliente.id);

      if (error) {
        console.error("Erro ao remover cliente:", error);
        alert("Erro ao remover cliente. Tente novamente.");
        return;
      }

      // Atualizar lista local
      setLista((prev) => prev.filter((c) => c.id !== cliente.id));
      setClientes((prev) => prev.filter((c) => c.id !== cliente.id));
    } catch (err) {
      console.error("Erro ao excluir cliente:", err);
      alert("Erro ao remover cliente. Tente novamente.");
    }
  };

  return (
    <div className="space-y-10">
      <header className="rounded-3xl bg-gradient-to-r from-[#0f172a] via-[#1f2937] to-[#111827] text-white p-8 shadow-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">
              Área do Cliente · Cadastros
            </p>
            <h1 className="text-3xl font-semibold">
              Controle quem tem acesso.
            </h1>
            <p className="text-sm text-white/80 max-w-3xl">
              Clientes com contratos emitidos aparecem automaticamente aqui.
              Compartilhe o link do drive e libere o acesso em um clique.
            </p>
            <div className="flex flex-wrap gap-3">
              <BotaoGerarLink
                tipo="CLIENTE"
                variant="default"
                className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black hover:opacity-90"
              />
              <button
                onClick={() => navigate("/pessoas/clientes/novo")}
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-2 text-sm text-white hover:bg-white/10"
              >
                <UserPlus className="w-4 h-4" />
                Criar cadastro manual
              </button>
              <button className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-2 text-sm text-white hover:bg-white/10">
                Ver área publicada
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-md min-w-[260px]">
            <p className="text-xs uppercase tracking-[0.3em] text-white/70">
              Acessos ativos
            </p>
            <p className="text-5xl font-semibold">{ativos}</p>
            <p className="text-sm text-white/80">
              Clientes liberados para entrar no hub.
            </p>
          </div>
        </div>
      </header>

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Clientes com área habilitada
            </h2>
            <p className="text-sm text-gray-500">
              Inclua novos contatos, atualize e-mails e garanta que cada cliente
              receba o Drive compartilhado.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Adicionar cliente
            <PlusCircle className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">
            Carregando clientes com contratos...
          </p>
        ) : lista.length === 0 ? (
          <p className="text-sm text-gray-500">
            Nenhum cliente com contrato emitido ainda. Assim que um contrato for
            gerado, o acesso aparece automaticamente.
          </p>
        ) : (
          <div className="space-y-4">
            {lista.map((cliente) => (
              <div
                key={cliente.id}
                className="rounded-2xl border border-gray-100 p-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {cliente.nome}
                  </p>
                  <p className="text-xs text-gray-500">
                    Contratos: {cliente.contratos.length} • Status:{" "}
                    {cliente.contratos.map((c) => c.status).join(", ")}
                  </p>
                  {cliente.drive_link ? (
                    <a
                      href={cliente.drive_link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#F25C26] font-semibold inline-flex items-center gap-1"
                    >
                      Pasta hospedada <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <p className="text-xs text-gray-400">
                      Sem pasta vinculada.
                    </p>
                  )}
                  <div className="mt-2">
                    <a
                      href={`/area-cliente?cliente_id=${cliente.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900"
                    >
                      Acessar área do cliente
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-3 text-xs text-gray-600">
                    <button
                      onClick={() => handleShareWhatsapp(cliente)}
                      className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 hover:bg-emerald-100"
                    >
                      <MessageCircle className="w-3 h-3" />
                      WhatsApp
                    </button>
                    <button
                      onClick={() => handleShareEmail(cliente)}
                      className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-blue-700 hover:bg-blue-100"
                    >
                      <Mail className="w-3 h-3" />
                      E-mail
                    </button>
                    <button
                      onClick={() => handleEditar(cliente.id)}
                      className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-gray-700 hover:bg-gray-200"
                    >
                      <Edit2 className="w-3 h-3" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleExcluir(cliente)}
                      className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-red-600 hover:bg-red-100"
                    >
                      <Trash2 className="w-3 h-3" />
                      Excluir
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-700">
                    {cliente.email || "Sem e-mail"}
                  </p>
                  <p
                    className={`text-xs font-semibold ${
                      cliente.acessoLiberado
                        ? "text-emerald-600"
                        : "text-gray-400"
                    }`}
                  >
                    {cliente.acessoLiberado
                      ? "Acesso liberado"
                      : "Aguardando ativação"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal Adicionar Cliente */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Adicionar Cliente à Área
                </h3>
                <p className="text-sm text-gray-500">
                  Busque um cliente cadastrado e vincule sua pasta do Drive
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedCliente(null);
                  setDriveLink("");
                  setSearchTerm("");
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
              {!selectedCliente ? (
                <>
                  {/* Busca */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar cliente pelo nome..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F25C26]"
                      autoFocus
                    />
                  </div>

                  {/* Resultados */}
                  {loadingClientes ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                  ) : clientesDisponiveis.length > 0 ? (
                    <div className="space-y-2">
                      {clientesDisponiveis.map((cliente) => (
                        <button
                          key={cliente.id}
                          onClick={() => setSelectedCliente(cliente)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl border hover:border-[#F25C26] hover:bg-orange-50 transition text-left"
                        >
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600">
                            {cliente.nome.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {cliente.nome}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {cliente.email || "Sem e-mail"}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : searchTerm.length >= 2 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Nenhum cliente encontrado com esse nome.
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-4">
                      Digite pelo menos 2 caracteres para buscar...
                    </p>
                  )}
                </>
              ) : (
                <>
                  {/* Cliente selecionado */}
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-lg font-semibold text-green-700">
                      {selectedCliente.nome.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {selectedCliente.nome}
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedCliente.email || "Sem e-mail"}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedCliente(null)}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Trocar
                    </button>
                  </div>

                  {/* Link do Drive */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <FolderOpen className="w-4 h-4" />
                      Link da pasta do Google Drive
                    </label>
                    <input
                      type="text"
                      placeholder="https://drive.google.com/drive/folders/..."
                      value={driveLink}
                      onChange={(e) => setDriveLink(e.target.value)}
                      className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F25C26]"
                    />
                    <p className="text-xs text-gray-400">
                      Cole o link da pasta do Drive do cliente. Deixe em branco
                      se ainda não tiver.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedCliente(null);
                  setDriveLink("");
                  setSearchTerm("");
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleAdicionarCliente}
                disabled={!selectedCliente || saving}
                className="px-4 py-2 text-sm font-semibold text-white bg-[#F25C26] rounded-lg hover:bg-[#d94d1a] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Adicionar à Área do Cliente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
