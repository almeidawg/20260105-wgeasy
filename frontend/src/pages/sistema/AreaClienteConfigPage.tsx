import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Edit2,
  ExternalLink,
  Mail,
  MessageCircle,
  PlusCircle,
  ShieldCheck,
  Trash2,
  UserPlus,
  X,
  Search,
  Loader2,
  FolderOpen,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { defaultDriveLink } from "./area-cliente/data";
import { useClientesArea, type ClienteAreaInfo } from "@/hooks/useClientesArea";
import { supabaseRaw as supabase } from "@/lib/supabaseClient";

const formatPhoneDigits = (telefone?: string | null) => (telefone || "").replace(/\D/g, "");

interface ClienteDisponivel {
  id: string;
  nome: string;
  email?: string | null;
  telefone?: string | null;
}

export default function AreaClienteConfigPage() {
  const navigate = useNavigate();
  const { clientes, loading, setClientes, reload } = useClientesArea();
  const [lista, setLista] = useState<ClienteAreaInfo[]>([]);

  // Modal adicionar cliente
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [clientesDisponiveis, setClientesDisponiveis] = useState<ClienteDisponivel[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<ClienteDisponivel | null>(null);
  const [driveLink, setDriveLink] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingDriveLink, setLoadingDriveLink] = useState(false);
  const [driveLinkExistente, setDriveLinkExistente] = useState(false);

  useEffect(() => {
    setLista(clientes);
  }, [clientes]);

  const ativos = useMemo(() => lista.filter((c) => c.acessoLiberado).length, [lista]);

  // Buscar clientes disponíveis (que ainda não estão na lista)
  const buscarClientesDisponiveis = async (termo: string) => {
    if (termo.length < 2) {
      setClientesDisponiveis([]);
      return;
    }

    setLoadingClientes(true);
    try {
      const idsJaNaLista = lista.map((c) => c.id);

      const { data, error } = await supabase
        .from("pessoas")
        .select("id, nome, email, telefone")
        .eq("tipo_pessoa", "cliente")
        .ilike("nome", `%${termo}%`)
        .limit(10);

      if (error) throw error;

      // Filtrar os que já estão na lista
      const disponiveis = (data || []).filter((p) => !idsJaNaLista.includes(p.id));
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

  // Buscar drive_link do cliente selecionado
  const buscarDriveLinkCliente = async (clienteId: string) => {
    setLoadingDriveLink(true);
    setDriveLinkExistente(false);
    try {
      const { data, error } = await supabase
        .from("pessoas")
        .select("drive_link")
        .eq("id", clienteId)
        .single();

      if (error) throw error;

      if (data?.drive_link) {
        setDriveLink(data.drive_link);
        setDriveLinkExistente(true);
      } else {
        setDriveLink("");
        setDriveLinkExistente(false);
      }
    } catch (err) {
      console.error("Erro ao buscar drive_link:", err);
      setDriveLink("");
      setDriveLinkExistente(false);
    } finally {
      setLoadingDriveLink(false);
    }
  };

  // Selecionar cliente e buscar drive_link
  const handleSelecionarCliente = async (cliente: ClienteDisponivel) => {
    setSelectedCliente(cliente);
    await buscarDriveLinkCliente(cliente.id);
  };

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
      setDriveLinkExistente(false);

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
      alert("Cliente sem telefone para WhatsApp.");
      return;
    }
    const mensagem = encodeURIComponent(
      `Olá ${cliente.nome}, segue o link da sua área WG: ${window.location.origin}/area-cliente?cliente_id=${cliente.id}`
    );
    window.open(`https://wa.me/55${numero}?text=${mensagem}`, "_blank");
  };

  const handleShareEmail = (cliente: ClienteAreaInfo) => {
    if (!cliente.email) {
      alert("Cliente sem e-mail cadastrado.");
      return;
    }
    const assunto = encodeURIComponent("Bem-vindo ao WG Easy");
    const corpo = encodeURIComponent(
      `Olá ${cliente.nome},\n\nConfira sua área exclusiva: ${window.location.origin}/area-cliente?cliente_id=${cliente.id}`
    );
    window.open(`mailto:${cliente.email}?subject=${assunto}&body=${corpo}`, "_blank");
  };

  const handleEditar = (id: string) => navigate(`/pessoas/clientes/${id}`);

  const handleExcluir = (id: string) => {
    if (!confirm("Remover acesso deste cliente?")) return;
    setLista((prev) => prev.filter((c) => c.id !== id));
    setClientes((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-10">
      <header className="rounded-3xl bg-gradient-to-r from-[#0f172a] via-[#1f2937] to-[#111827] text-white p-8 shadow-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Configurações · Área do Cliente</p>
            <h1 className="text-3xl font-semibold">
              Centralizamos o link do Drive e os logins do cliente dentro do layout WG.
            </h1>
            <p className="text-sm text-white/80 max-w-3xl">
              Assim que um contrato é emitido, cadastramos o cliente automaticamente aqui. Configure os acessos e
              comunicações abaixo.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-black hover:opacity-90"
              >
                Adicionar cliente
                <UserPlus className="w-4 h-4" />
              </button>
              <button className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-2 text-sm text-white hover:bg-white/10">
                Ver experiência publicada
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-md min-w-[260px]">
            <p className="text-xs uppercase tracking-[0.3em] text-white/70">Acessos ativos</p>
            <p className="text-5xl font-semibold">{ativos}</p>
            <p className="text-sm text-white/80">Clientes com login liberado para o hub WG.</p>
          </div>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Clientes com área habilitada</h2>
              <p className="text-sm text-gray-500">
                Os links do Drive são hospedados dentro do layout WG, não abrimos a UI do Google.
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
            <p className="text-sm text-gray-500">Carregando clientes...</p>
          ) : lista.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhum cliente habilitado no momento.</p>
          ) : (
            <div className="space-y-4">
              {lista.map((cliente) => (
                <div
                  key={cliente.id}
                  className="rounded-2xl border border-gray-100 p-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{cliente.nome}</p>
                    <p className="text-xs text-gray-500">
                      Contratos: {cliente.contratos.length} {cliente.contratos.length > 0 && `• Status: ${cliente.contratos.map((c) => c.status).join(", ")}`}
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
                      <p className="text-xs text-gray-400">Sem pasta vinculada.</p>
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
                        <MessageCircle className="w-3 h-3" /> WhatsApp
                      </button>
                      <button
                        onClick={() => handleShareEmail(cliente)}
                        className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-blue-700 hover:bg-blue-100"
                      >
                        <Mail className="w-3 h-3" /> E-mail
                      </button>
                      <button
                        onClick={() => handleEditar(cliente.id)}
                        className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-gray-700 hover:bg-gray-200"
                      >
                        <Edit2 className="w-3 h-3" /> Editar
                      </button>
                      <button
                        onClick={() => handleExcluir(cliente.id)}
                        className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-red-600 hover:bg-red-100"
                      >
                        <Trash2 className="w-3 h-3" /> Excluir
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-700">{cliente.email || "Sem e-mail"}</p>
                    <p className={`text-xs font-semibold ${cliente.acessoLiberado ? "text-emerald-600" : "text-gray-400"}`}>
                      {cliente.acessoLiberado ? "Acesso liberado" : "Aguardando ativação"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Hospedagem do Drive</h3>
            <p className="text-sm text-gray-500">
              Informe o link que será carregado em nosso layout (iframe seguro com autenticação WG).
            </p>
            <div className="mt-3 space-y-2">
              <label className="text-xs uppercase tracking-[0.3em] text-gray-400">Pasta mestre</label>
              <input
                type="text"
                defaultValue={defaultDriveLink}
                className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F25C26]"
              />
            </div>
            <button className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#F25C26] hover:bg-[#d94d1a] px-4 py-2 text-sm font-semibold text-white transition">
              Atualizar link
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="rounded-2xl border border-gray-100 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <p className="text-sm font-semibold text-gray-900">Mensagem automática</p>
            </div>
            <p className="text-xs text-gray-500">
              Enviaremos um e-mail elegante com saudação WG, link e guia de onboarding assim que o acesso for liberado.
            </p>
            <button className="inline-flex items-center gap-2 text-xs font-semibold text-[#F25C26]">
              Ver template
              <Mail className="w-3 h-3" />
            </button>
          </div>
        </div>
      </section>

      {/* Modal Adicionar Cliente */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Adicionar Cliente à Área</h3>
                <p className="text-sm text-gray-500">Busque um cliente cadastrado e vincule sua pasta do Drive</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedCliente(null);
                  setDriveLink("");
                  setSearchTerm("");
                  setDriveLinkExistente(false);
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
                          onClick={() => handleSelecionarCliente(cliente)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl border hover:border-[#F25C26] hover:bg-orange-50 transition text-left"
                        >
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600">
                            {cliente.nome.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{cliente.nome}</p>
                            <p className="text-xs text-gray-500 truncate">{cliente.email || "Sem e-mail"}</p>
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
                      <p className="text-sm font-semibold text-gray-900">{selectedCliente.nome}</p>
                      <p className="text-xs text-gray-500">{selectedCliente.email || "Sem e-mail"}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCliente(null);
                        setDriveLink("");
                        setDriveLinkExistente(false);
                      }}
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
                      {loadingDriveLink && (
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      )}
                    </label>

                    {loadingDriveLink ? (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border">
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                        <span className="text-sm text-gray-500">Verificando pasta existente...</span>
                      </div>
                    ) : driveLinkExistente ? (
                      <>
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200">
                          <ShieldCheck className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-700">Pasta do Drive já configurada!</span>
                        </div>
                        <input
                          type="text"
                          placeholder="https://drive.google.com/drive/folders/..."
                          value={driveLink}
                          onChange={(e) => setDriveLink(e.target.value)}
                          className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F25C26] bg-green-50 border-green-200"
                        />
                        <p className="text-xs text-gray-500">
                          O link foi carregado automaticamente. Você pode alterá-lo se necessário.
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-yellow-50 border border-yellow-200">
                          <FolderOpen className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm text-yellow-700">Cliente ainda não possui pasta do Drive</span>
                        </div>
                        <input
                          type="text"
                          placeholder="https://drive.google.com/drive/folders/..."
                          value={driveLink}
                          onChange={(e) => setDriveLink(e.target.value)}
                          className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F25C26]"
                        />
                        <div className="rounded-xl bg-gray-50 p-3 space-y-2">
                          <p className="text-xs text-gray-600 font-medium">Para criar uma nova pasta:</p>
                          <ol className="text-xs text-gray-500 space-y-1 list-decimal pl-4">
                            <li>Acesse o <a href="https://drive.google.com" target="_blank" rel="noopener noreferrer" className="text-[#F25C26] underline">Google Drive</a></li>
                            <li>Crie uma pasta com o nome do cliente</li>
                            <li>Dentro dela, crie as subpastas: Plantas, Fotos, Documentos, Diário de Obra</li>
                            <li className="font-medium text-orange-700">
                              ⚠️ IMPORTANTE: Clique direito na pasta → "Compartilhar" → "Qualquer pessoa com o link pode visualizar"
                            </li>
                            <li>Copie o link e cole acima</li>
                          </ol>
                          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-xs text-yellow-800">
                              <strong>Sem compartilhamento público, o cliente não conseguirá ver os arquivos!</strong>
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50">
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedCliente(null);
                  setDriveLink("");
                  setSearchTerm("");
                  setDriveLinkExistente(false);
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="button"
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
