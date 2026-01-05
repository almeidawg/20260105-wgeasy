// src/pages/sistema/CadastrosPendentesPage.tsx
// Página para gerenciar cadastros pendentes de aprovação

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Mail,
  Phone,
  Building2,
  MapPin,
  Calendar,
  Filter,
  RefreshCw,
  AlertTriangle,
  Copy,
  ExternalLink,
  Send,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  listarCadastrosPendentes,
  aprovarCadastro,
  rejeitarCadastro,
  listarEspecificadoresMaster,
  CadastroPendente,
  StatusCadastro,
  TipoCadastro,
  EspecificadorMaster,
  getLabelTipoCadastro,
  getLabelStatusCadastro,
  getCorStatusCadastro,
} from "@/lib/cadastroLinkApi";
import { criarOportunidade } from "@/lib/oportunidadesApi";
import { Switch } from "@/components/ui/switch";

// Cores
const WG_COLORS = {
  laranja: "#F25C26",
  verde: "#22c55e",
  amarelo: "#f59e0b",
  vermelho: "#ef4444",
  azul: "#2B4580",
};

// Tipos de usuário para aprovação
const TIPOS_USUARIO = [
  { value: "ADMIN", label: "Administrador", cor: "red" },
  { value: "COLABORADOR", label: "Colaborador", cor: "blue" },
  { value: "CLIENTE", label: "Cliente", cor: "green" },
  { value: "ESPECIFICADOR", label: "Especificador", cor: "purple" },
  { value: "FORNECEDOR", label: "Fornecedor", cor: "orange" },
];

export default function CadastrosPendentesPage() {
  const { toast } = useToast();
  const [cadastros, setCadastros] = useState<CadastroPendente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatusCadastro | "todos">("pendente_aprovacao");
  const [filtroTipo, setFiltroTipo] = useState<TipoCadastro | "todos">("todos");

  // Modal de detalhes
  const [selectedCadastro, setSelectedCadastro] = useState<CadastroPendente | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Modal de aprovação
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [tipoUsuarioAprovacao, setTipoUsuarioAprovacao] = useState<string>("");
  const [isApproving, setIsApproving] = useState(false);

  // Modal de rejeição
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [motivoRejeicao, setMotivoRejeicao] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  // Credenciais geradas
  const [credenciaisModal, setCredenciaisModal] = useState(false);
  const [credenciaisGeradas, setCredenciaisGeradas] = useState<{
    email: string;
    senha: string;
  } | null>(null);

  // Master/Indicado (para Especificadores e Colaboradores)
  const [isMaster, setIsMaster] = useState(true);
  const [indicadoPorId, setIndicadoPorId] = useState<string>("");
  const [masters, setMasters] = useState<EspecificadorMaster[]>([]);
  const [loadingMasters, setLoadingMasters] = useState(false);

  // Carregar cadastros
  useEffect(() => {
    loadCadastros();
  }, [activeTab, filtroTipo]);

  async function loadCadastros() {
    setIsLoading(true);
    try {
      const data = await listarCadastrosPendentes({
        status: activeTab === "todos" ? undefined : activeTab,
        tipo: filtroTipo === "todos" ? undefined : filtroTipo,
      });
      setCadastros(data);
    } catch (error) {
      toast({
        title: "Erro ao carregar cadastros",
        description: "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Abrir modal de detalhes
  function handleViewDetails(cadastro: CadastroPendente) {
    setSelectedCadastro(cadastro);
    setModalOpen(true);
  }

  // Iniciar aprovação
  async function handleStartApprove(cadastro: CadastroPendente) {
    setSelectedCadastro(cadastro);
    setTipoUsuarioAprovacao(cadastro.tipo_solicitado);
    setIsMaster(true);
    setIndicadoPorId("");

    // Se for ESPECIFICADOR ou COLABORADOR, carregar lista de Masters
    if (cadastro.tipo_solicitado === "ESPECIFICADOR" || cadastro.tipo_solicitado === "COLABORADOR") {
      setLoadingMasters(true);
      try {
        const mastersList = await listarEspecificadoresMaster(cadastro.nucleo_id || undefined);
        setMasters(mastersList);
      } catch (error) {
        console.error("Erro ao carregar masters:", error);
        setMasters([]);
      } finally {
        setLoadingMasters(false);
      }
    }

    setApproveModalOpen(true);
  }

  // Confirmar aprovação
  async function handleConfirmApprove() {
    console.log("=== INICIANDO APROVACAO ===");
    console.log("selectedCadastro:", selectedCadastro);
    console.log("tipoUsuarioAprovacao:", tipoUsuarioAprovacao);
    console.log("isMaster:", isMaster);
    console.log("indicadoPorId:", indicadoPorId);

    if (!selectedCadastro || !tipoUsuarioAprovacao) {
      console.log("ERRO: Dados faltando - selectedCadastro:", !!selectedCadastro, "tipo:", !!tipoUsuarioAprovacao);
      alert("Por favor, selecione o tipo de usuário!");
      return;
    }

    // Validar se é indicado mas não selecionou o master
    if (!isMaster && !indicadoPorId && (selectedCadastro.tipo_solicitado === "ESPECIFICADOR" || selectedCadastro.tipo_solicitado === "COLABORADOR")) {
      alert("Selecione quem indicou este profissional!");
      return;
    }

    setIsApproving(true);
    try {
      // Preparar opções de aprovação
      const options = (selectedCadastro.tipo_solicitado === "ESPECIFICADOR" || selectedCadastro.tipo_solicitado === "COLABORADOR")
        ? {
            isMaster,
            indicadoPorId: !isMaster && indicadoPorId ? indicadoPorId : undefined,
          }
        : undefined;

      console.log("Chamando aprovarCadastro com ID:", selectedCadastro.id, "Tipo:", tipoUsuarioAprovacao, "Options:", options);
      const result = await aprovarCadastro(selectedCadastro.id, tipoUsuarioAprovacao, options);
      console.log("Resultado:", result);

      if (result.success) {
        const masterLabel = isMaster ? " (Master)" : indicadoPorId ? " (Indicado)" : "";
        toast({
          title: "Cadastro aprovado!",
          description: `${selectedCadastro.nome} foi aprovado como ${tipoUsuarioAprovacao}${masterLabel}.`,
        });

        // Se for CLIENTE, criar oportunidade automaticamente na coluna Lead
        if (selectedCadastro.tipo_solicitado === "CLIENTE" && result.pessoaId) {
          try {
            await criarOportunidade({
              titulo: `Oportunidade - ${selectedCadastro.nome}`,
              cliente_id: result.pessoaId,
              descricao: `Cliente cadastrado via link público.\n${selectedCadastro.observacoes || ""}`.trim(),
              estagio: "qualificacao", // Coluna Lead
              status: "novo",
              origem: "cadastro_link",
            });
            toast({
              title: "Oportunidade criada!",
              description: `Card criado automaticamente no Kanban de Oportunidades (coluna Lead).`,
            });
          } catch (err) {
            console.error("Erro ao criar oportunidade:", err);
            // Não bloqueia o fluxo principal
          }
        }

        // Mostrar credenciais
        if (result.email && result.senhaTemporaria) {
          setCredenciaisGeradas({
            email: result.email,
            senha: result.senhaTemporaria,
          });
          setCredenciaisModal(true);
        }

        setApproveModalOpen(false);
        loadCadastros();
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        title: "Erro ao aprovar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsApproving(false);
    }
  }

  // Iniciar rejeição
  function handleStartReject(cadastro: CadastroPendente) {
    setSelectedCadastro(cadastro);
    setMotivoRejeicao("");
    setRejectModalOpen(true);
  }

  // Confirmar rejeição
  async function handleConfirmReject() {
    if (!selectedCadastro) return;

    setIsRejecting(true);
    try {
      const result = await rejeitarCadastro(selectedCadastro.id, motivoRejeicao);

      if (result.success) {
        toast({
          title: "Cadastro rejeitado",
          description: "O solicitante não será notificado automaticamente.",
        });
        setRejectModalOpen(false);
        loadCadastros();
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        title: "Erro ao rejeitar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsRejecting(false);
    }
  }

  // Copiar credenciais
  async function copyCredentials() {
    if (!credenciaisGeradas || !selectedCadastro) return;
    const texto = `
========================================
CREDENCIAIS DE ACESSO - WG Easy
========================================

Nome: ${selectedCadastro.nome}
E-mail (login): ${credenciaisGeradas.email}
${selectedCadastro.email ? `Contato: ${selectedCadastro.email}` : ""}

SENHA TEMPORARIA: ${credenciaisGeradas.senha}

IMPORTANTE: Altere sua senha no primeiro acesso!

Acesse o sistema em:
https://easy.wgalmeida.com.br

Atenciosamente,
Equipe WG Easy
    `.trim();

    await navigator.clipboard.writeText(texto);
    toast({ title: "Credenciais copiadas!" });
  }

  // Compartilhar por WhatsApp
  function handleCompartilharWhatsApp() {
    if (!credenciaisGeradas || !selectedCadastro) return;

    const texto = `
*CREDENCIAIS DE ACESSO - WG Easy*
========================================

*Nome:* ${selectedCadastro.nome}
*E-mail (login):* ${credenciaisGeradas.email}
${selectedCadastro.email ? `*Contato:* ${selectedCadastro.email}` : ""}

*SENHA TEMPORARIA:* ${credenciaisGeradas.senha}

*IMPORTANTE:* Altere sua senha no primeiro acesso!

*Acesse o sistema em:*
https://easy.wgalmeida.com.br

Atenciosamente,
Equipe WG Easy
    `.trim();

    // Se tiver telefone, abrir direto para o número
    const telefone = selectedCadastro.telefone?.replace(/\D/g, "");
    const urlWhatsApp = telefone
      ? `https://wa.me/55${telefone}?text=${encodeURIComponent(texto)}`
      : `https://wa.me/?text=${encodeURIComponent(texto)}`;

    window.open(urlWhatsApp, "_blank");

    toast({
      title: "WhatsApp aberto!",
      description: "Compartilhe as credenciais com o usuário",
    });
  }

  // Compartilhar por Email
  function handleCompartilharEmail() {
    if (!credenciaisGeradas || !selectedCadastro) return;

    const assunto = "Credenciais de Acesso - WG Easy";
    const corpo = `
Olá ${selectedCadastro.nome},

Suas credenciais de acesso ao sistema WG Easy foram geradas com sucesso:

========================================
CREDENCIAIS DE ACESSO
========================================

Nome: ${selectedCadastro.nome}
E-mail (login): ${credenciaisGeradas.email}
${selectedCadastro.email ? `Email de contato: ${selectedCadastro.email}` : ""}

SENHA TEMPORARIA: ${credenciaisGeradas.senha}

IMPORTANTE: Por favor, altere sua senha no primeiro acesso.

Acesse o sistema em:
https://easy.wgalmeida.com.br

========================================

Atenciosamente,
Equipe WG Easy
    `.trim();

    const mailtoUrl = `mailto:${credenciaisGeradas.email || ""}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
    window.location.href = mailtoUrl;

    toast({
      title: "Cliente de e-mail aberto!",
      description: "Envie as credenciais para o usuário",
    });
  }

  // Contadores por status
  const contadores = {
    pendente_aprovacao: cadastros.filter((c) => c.status === "pendente_aprovacao").length,
    aguardando_preenchimento: cadastros.filter((c) => c.status === "aguardando_preenchimento").length,
    aprovado: cadastros.filter((c) => c.status === "aprovado").length,
    rejeitado: cadastros.filter((c) => c.status === "rejeitado").length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6" style={{ color: WG_COLORS.laranja }} />
            Cadastros Pendentes
          </h1>
          <p className="text-gray-500 mt-1">
            Gerencie solicitações de cadastro enviadas por link
          </p>
        </div>
        <Button variant="outline" onClick={loadCadastros}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setActiveTab("pendente_aprovacao")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ background: `${WG_COLORS.amarelo}20` }}>
                <Clock className="w-5 h-5" style={{ color: WG_COLORS.amarelo }} />
              </div>
              <div>
                <p className="text-2xl font-bold">{contadores.pendente_aprovacao}</p>
                <p className="text-xs text-gray-500">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setActiveTab("aguardando_preenchimento")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-100">
                <AlertTriangle className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{contadores.aguardando_preenchimento}</p>
                <p className="text-xs text-gray-500">Aguardando</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setActiveTab("aprovado")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ background: `${WG_COLORS.verde}20` }}>
                <CheckCircle2 className="w-5 h-5" style={{ color: WG_COLORS.verde }} />
              </div>
              <div>
                <p className="text-2xl font-bold">{contadores.aprovado}</p>
                <p className="text-xs text-gray-500">Aprovados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setActiveTab("rejeitado")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ background: `${WG_COLORS.vermelho}20` }}>
                <XCircle className="w-5 h-5" style={{ color: WG_COLORS.vermelho }} />
              </div>
              <div>
                <p className="text-2xl font-bold">{contadores.rejeitado}</p>
                <p className="text-xs text-gray-500">Rejeitados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1">
          <TabsList>
            <TabsTrigger value="pendente_aprovacao">
              Pendentes ({contadores.pendente_aprovacao})
            </TabsTrigger>
            <TabsTrigger value="aguardando_preenchimento">
              Aguardando
            </TabsTrigger>
            <TabsTrigger value="aprovado">Aprovados</TabsTrigger>
            <TabsTrigger value="rejeitado">Rejeitados</TabsTrigger>
            <TabsTrigger value="todos">Todos</TabsTrigger>
          </TabsList>
        </Tabs>

        <Select value={filtroTipo} onValueChange={(v) => setFiltroTipo(v as any)}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filtrar tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            <SelectItem value="CLIENTE">Cliente</SelectItem>
            <SelectItem value="COLABORADOR">Colaborador</SelectItem>
            <SelectItem value="FORNECEDOR">Fornecedor</SelectItem>
            <SelectItem value="ESPECIFICADOR">Especificador</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de cadastros */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-gray-300" />
            <p className="text-gray-400">Carregando...</p>
          </div>
        ) : cadastros.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">Nenhum cadastro encontrado</p>
            </CardContent>
          </Card>
        ) : (
          <AnimatePresence>
            {cadastros.map((cadastro, index) => (
              <motion.div
                key={cadastro.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Info principal */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">
                            {cadastro.nome || "Não preenchido"}
                          </h3>
                          <Badge variant="outline">
                            {getLabelTipoCadastro(cadastro.tipo_solicitado)}
                          </Badge>
                          <Badge
                            variant={
                              cadastro.status === "pendente_aprovacao"
                                ? "default"
                                : cadastro.status === "aprovado"
                                ? "default"
                                : "secondary"
                            }
                            className={
                              cadastro.status === "pendente_aprovacao"
                                ? "bg-yellow-100 text-yellow-800"
                                : cadastro.status === "aprovado"
                                ? "bg-green-100 text-green-800"
                                : cadastro.status === "rejeitado"
                                ? "bg-red-100 text-red-800"
                                : ""
                            }
                          >
                            {getLabelStatusCadastro(cadastro.status)}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                          {cadastro.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {cadastro.email}
                            </span>
                          )}
                          {cadastro.telefone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {cadastro.telefone}
                            </span>
                          )}
                          {cadastro.empresa && (
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {cadastro.empresa}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(cadastro.criado_em).toLocaleDateString("pt-BR")}
                          </span>
                          {cadastro.enviado_por_nome && (
                            <span className="flex items-center gap-1 text-orange-600 font-medium">
                              <ExternalLink className="w-3 h-3" />
                              via {cadastro.enviado_por_nome}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(cadastro)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                        {cadastro.status === "pendente_aprovacao" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleStartApprove(cadastro)}
                              style={{ background: WG_COLORS.verde }}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Aprovar
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleStartReject(cadastro)}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Rejeitar
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Modal de Detalhes */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes do Cadastro</DialogTitle>
            <DialogDescription>
              Informações completas do solicitante
            </DialogDescription>
          </DialogHeader>
          {selectedCadastro && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Nome</Label>
                  <p className="font-medium">{selectedCadastro.nome || "-"}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Email</Label>
                  <p className="font-medium">{selectedCadastro.email || "-"}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Telefone</Label>
                  <p className="font-medium">{selectedCadastro.telefone || "-"}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">CPF/CNPJ</Label>
                  <p className="font-medium">{selectedCadastro.cpf_cnpj || "-"}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Empresa</Label>
                  <p className="font-medium">{selectedCadastro.empresa || "-"}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Cargo</Label>
                  <p className="font-medium">{selectedCadastro.cargo || "-"}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-xs text-gray-500">Endereço</Label>
                  <p className="font-medium">
                    {selectedCadastro.endereco
                      ? `${selectedCadastro.endereco}, ${selectedCadastro.cidade} - ${selectedCadastro.estado}`
                      : "-"}
                  </p>
                </div>
                {selectedCadastro.observacoes && (
                  <div className="col-span-2">
                    <Label className="text-xs text-gray-500">Observações</Label>
                    <p className="font-medium">{selectedCadastro.observacoes}</p>
                  </div>
                )}
              </div>

              {/* Informações de Rastreamento */}
              {(selectedCadastro.enviado_por_nome || selectedCadastro.reutilizavel || selectedCadastro.total_usos) && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <Label className="text-xs font-semibold text-orange-700 uppercase">
                    Rastreamento do Link
                  </Label>
                  <div className="mt-2 space-y-1 text-sm">
                    {selectedCadastro.enviado_por_nome && (
                      <p>
                        <span className="text-gray-600">Enviado por:</span>{" "}
                        <span className="font-medium text-gray-900">
                          {selectedCadastro.enviado_por_nome}
                        </span>
                        {selectedCadastro.enviado_por_tipo && (
                          <span className="text-xs text-gray-500 ml-1">
                            ({selectedCadastro.enviado_por_tipo})
                          </span>
                        )}
                      </p>
                    )}
                    {selectedCadastro.reutilizavel && (
                      <p>
                        <span className="text-gray-600">Link reutilizável:</span>{" "}
                        <span className="font-medium">
                          {selectedCadastro.total_usos || 0} uso(s)
                          {selectedCadastro.uso_maximo && ` de ${selectedCadastro.uso_maximo}`}
                        </span>
                      </p>
                    )}
                    {selectedCadastro.link_pai_id && (
                      <p className="text-xs text-orange-600">
                        Cadastro criado a partir de link reutilizável
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Aprovação */}
      <Dialog open={approveModalOpen} onOpenChange={setApproveModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Aprovar Cadastro</DialogTitle>
            <DialogDescription>
              Escolha o tipo de usuário para {selectedCadastro?.nome}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Informação de rastreamento do link */}
            {selectedCadastro?.enviado_por_nome && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <span className="font-medium">Link rastreável confirmado!</span>
                  <br />
                  Enviado por: <strong>{selectedCadastro.enviado_por_nome}</strong>
                  {selectedCadastro.enviado_por_tipo && (
                    <span className="text-xs ml-1">({selectedCadastro.enviado_por_tipo})</span>
                  )}
                </p>
              </div>
            )}

            <div>
              <Label>Tipo de Usuário</Label>
              <Select value={tipoUsuarioAprovacao} onValueChange={setTipoUsuarioAprovacao}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_USUARIO.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Seção Master/Indicado - Apenas para ESPECIFICADOR e COLABORADOR */}
            {(selectedCadastro?.tipo_solicitado === "ESPECIFICADOR" || selectedCadastro?.tipo_solicitado === "COLABORADOR") && (
              <div className="space-y-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-semibold" style={{ color: WG_COLORS.laranja }}>
                      Classificação para Comissão
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                      Define se é um Master ou foi indicado por alguém
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {isMaster ? "Master (cadastrado pela WG)" : "Indicado por um Master"}
                    </span>
                  </div>
                  <Switch
                    checked={isMaster}
                    onCheckedChange={(checked) => {
                      setIsMaster(checked);
                      if (checked) setIndicadoPorId("");
                    }}
                  />
                </div>

                {!isMaster && (
                  <div>
                    <Label>Quem indicou este profissional?</Label>
                    {loadingMasters ? (
                      <div className="text-sm text-gray-400 py-2">Carregando masters...</div>
                    ) : masters.length === 0 ? (
                      <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded mt-1">
                        Nenhum Master cadastrado ainda. Cadastre primeiro um Master para depois vincular indicados.
                      </div>
                    ) : (
                      <Select value={indicadoPorId} onValueChange={setIndicadoPorId}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Selecione o Master que indicou" />
                        </SelectTrigger>
                        <SelectContent>
                          {masters.map((master) => (
                            <SelectItem key={master.id} value={master.id}>
                              {master.nome} ({master.tipo})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                )}

                <div className="text-xs text-gray-500 border-t pt-2 mt-2">
                  {isMaster ? (
                    <span>
                      <strong>Master:</strong> Recebe comissão integral + bônus sobre indicados
                    </span>
                  ) : (
                    <span>
                      <strong>Indicado:</strong> Recebe comissão padrão, Master ganha bônus sobre vendas
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Ao aprovar:</strong>
                <br />
                • Uma pessoa será criada no sistema
                <br />
                • Um usuário com login será criado
                <br />
                • Credenciais de acesso serão geradas
                {(selectedCadastro?.tipo_solicitado === "ESPECIFICADOR" || selectedCadastro?.tipo_solicitado === "COLABORADOR") && (
                  <>
                    <br />
                    • Categoria de comissão será definida automaticamente
                  </>
                )}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmApprove}
              disabled={!tipoUsuarioAprovacao || isApproving || (!isMaster && !indicadoPorId && (selectedCadastro?.tipo_solicitado === "ESPECIFICADOR" || selectedCadastro?.tipo_solicitado === "COLABORADOR"))}
              style={{ background: WG_COLORS.verde }}
            >
              {isApproving ? "Aprovando..." : "Confirmar Aprovação"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Rejeição */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Cadastro</DialogTitle>
            <DialogDescription>
              Informe o motivo da rejeição (opcional)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Motivo da rejeição</Label>
              <Textarea
                value={motivoRejeicao}
                onChange={(e) => setMotivoRejeicao(e.target.value)}
                placeholder="Ex: Dados incompletos, não atende aos requisitos..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmReject}
              disabled={isRejecting}
            >
              {isRejecting ? "Rejeitando..." : "Confirmar Rejeição"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Credenciais */}
      <Dialog open={credenciaisModal} onOpenChange={setCredenciaisModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Credenciais de Acesso Geradas
            </DialogTitle>
            <DialogDescription>
              Senha temporária gerada com sucesso. Compartilhe as instruções abaixo com o usuário.
            </DialogDescription>
          </DialogHeader>
          {credenciaisGeradas && selectedCadastro && (
            <div className="space-y-4 py-4">
              {/* Dados do Usuário */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">
                    Usuário
                  </label>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedCadastro.nome}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">
                    E-mail (login)
                  </label>
                  <p className="text-sm font-mono text-gray-900">
                    {credenciaisGeradas.email}
                  </p>
                </div>

                {selectedCadastro.email && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">
                      Email
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedCadastro.email}
                    </p>
                  </div>
                )}

                <div className="pt-2 border-t border-gray-200">
                  <label className="text-xs font-medium text-blue-600 uppercase flex items-center gap-1">
                    🔑 Senha Temporária
                  </label>
                  <p className="text-2xl font-mono font-bold text-blue-600 tracking-wider mt-1">
                    {credenciaisGeradas.senha}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    IMPORTANTE: O usuário deve alterar no primeiro acesso
                  </p>
                </div>
              </div>

              {/* Instruções de Login */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  Instruções de Acesso
                </h4>
                <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Acesse o sistema WG Easy</li>
                  <li>
                    Use o e-mail{" "}
                    <span className="font-mono font-semibold">{credenciaisGeradas.email}</span> como login
                  </li>
                  <li>
                    Use a senha temporária{" "}
                    <span className="font-mono font-semibold">{credenciaisGeradas.senha}</span>
                  </li>
                  <li>Altere sua senha no primeiro acesso</li>
                </ol>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:gap-2">
            <Button
              variant="ghost"
              onClick={copyCredentials}
              className="flex-1 gap-2 border border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              <Copy className="w-4 h-4" />
              Copiar
            </Button>
            {credenciaisGeradas?.email && (
              <Button
                variant="ghost"
                onClick={handleCompartilharEmail}
                className="flex-1 gap-2 border border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <Mail className="w-4 h-4" />
                E-mail
              </Button>
            )}
            <Button
              variant="default"
              onClick={handleCompartilharWhatsApp}
              className="flex-1 gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
