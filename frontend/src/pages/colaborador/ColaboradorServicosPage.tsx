/**
 * Página de Serviços do Colaborador
 * Integração com módulo /servicos para solicitações de fretes, coletas e serviços
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { useUsuarioLogado } from "@/hooks/useUsuarioLogado";
import {
  Truck,
  Plus,
  Search,
  Filter,
  LayoutList,
  LayoutGrid,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Package,
  MapPin,
  Calendar,
  Eye,
  Phone,
  Building2,
  Wallet,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ui/use-toast";

interface Servico {
  id: string;
  tipo: string;
  descricao: string;
  status: string;
  prioridade: string;
  cliente_id?: string;
  cliente_nome?: string;
  projeto_id?: string;
  projeto_nome?: string;
  endereco_origem?: string;
  endereco_destino?: string;
  data_solicitacao: string;
  data_previsao?: string;
  data_conclusao?: string;
  observacoes?: string;
  criado_por?: string;
  created_at: string;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: any }
> = {
  solicitado: {
    label: "Solicitado",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  em_andamento: {
    label: "Em Andamento",
    color: "bg-blue-100 text-blue-800",
    icon: Truck,
  },
  concluido: {
    label: "Concluído",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle2,
  },
  cancelado: {
    label: "Cancelado",
    color: "bg-red-100 text-red-800",
    icon: AlertTriangle,
  },
};

const TIPO_CONFIG: Record<string, { label: string; icon: any }> = {
  frete: { label: "Frete", icon: Truck },
  coleta: { label: "Coleta", icon: Package },
  entrega: { label: "Entrega", icon: MapPin },
  outro: { label: "Outro", icon: Truck },
};

export default function ColaboradorServicosPage() {
  const { usuarioCompleto } = useAuth();
  const { usuario } = useUsuarioLogado();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<string>("todos");
  const [viewMode, setViewMode] = useState<"list" | "cards">("cards");
  const [showNovoModal, setShowNovoModal] = useState(false);
  const [projetos, setProjetos] = useState<any[]>([]);

  // Form novo serviço
  const [novoServico, setNovoServico] = useState({
    tipo: "frete",
    descricao: "",
    projeto_id: "",
    endereco_origem: "",
    endereco_destino: "",
    data_previsao: "",
    observacoes: "",
    prioridade: "normal",
  });

  const carregarServicos = useCallback(async () => {
    if (!usuarioCompleto?.pessoa_id) return;

    try {
      setLoading(true);

      // Buscar serviços vinculados ao colaborador ou seus projetos
      const { data, error } = await supabase
        .from("solicitacoes_servico")
        .select(
          `
          *,
          cliente:pessoas!solicitacoes_servico_cliente_id_fkey(nome),
          projeto:contratos(id, numero)
        `
        )
        .or(
          `criado_por.eq.${usuarioCompleto.id},colaborador_id.eq.${usuarioCompleto.pessoa_id}`
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao carregar serviços:", error);
        // Se tabela não existe, mostrar lista vazia
        setServicos([]);
        return;
      }

      const servicosFormatados = (data || []).map((s: any) => ({
        ...s,
        cliente_nome: s.cliente?.nome,
        projeto_nome: s.projeto?.numero,
      }));

      setServicos(servicosFormatados);
    } catch (error) {
      console.error("Erro ao carregar serviços:", error);
      setServicos([]);
    } finally {
      setLoading(false);
    }
  }, [usuarioCompleto?.pessoa_id, usuarioCompleto?.id]);

  const carregarProjetos = useCallback(async () => {
    if (!usuarioCompleto?.pessoa_id) return;

    try {
      const { data } = await supabase
        .from("contratos")
        .select("id, numero, cliente:pessoas!contratos_cliente_id_fkey(nome)")
        .or(
          `arquiteto_id.eq.${usuarioCompleto.pessoa_id},engenheiro_id.eq.${usuarioCompleto.pessoa_id}`
        )
        .eq("status", "ativo")
        .order("numero", { ascending: false });

      setProjetos(data || []);
    } catch (error) {
      console.error("Erro ao carregar projetos:", error);
    }
  }, [usuarioCompleto?.pessoa_id]);

  useEffect(() => {
    carregarServicos();
    carregarProjetos();
  }, [carregarServicos, carregarProjetos]);

  const handleCriarServico = async () => {
    if (!novoServico.descricao) {
      toast({
        title: "Erro",
        description: "Preencha a descrição do serviço",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("solicitacoes_servico").insert({
        tipo: novoServico.tipo,
        descricao: novoServico.descricao,
        projeto_id: novoServico.projeto_id || null,
        endereco_origem: novoServico.endereco_origem || null,
        endereco_destino: novoServico.endereco_destino || null,
        data_previsao: novoServico.data_previsao || null,
        observacoes: novoServico.observacoes || null,
        prioridade: novoServico.prioridade,
        status: "solicitado",
        colaborador_id: usuarioCompleto?.pessoa_id,
        criado_por: usuarioCompleto?.id,
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Serviço solicitado com sucesso!",
      });

      setShowNovoModal(false);
      setNovoServico({
        tipo: "frete",
        descricao: "",
        projeto_id: "",
        endereco_origem: "",
        endereco_destino: "",
        data_previsao: "",
        observacoes: "",
        prioridade: "normal",
      });
      carregarServicos();
    } catch (error) {
      console.error("Erro ao criar serviço:", error);
      toast({
        title: "Erro",
        description: "Não foi possível solicitar o serviço",
        variant: "destructive",
      });
    }
  };

  const servicosFiltrados = servicos.filter((s) => {
    const matchBusca =
      !busca ||
      s.descricao?.toLowerCase().includes(busca.toLowerCase()) ||
      s.cliente_nome?.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = statusFiltro === "todos" || s.status === statusFiltro;
    return matchBusca && matchStatus;
  });

  const formatarData = (data?: string) => {
    if (!data) return "-";
    return new Date(data).toLocaleDateString("pt-BR");
  };

  // Contadores
  const totalSolicitados = servicos.filter(
    (s) => s.status === "solicitado"
  ).length;
  const totalEmAndamento = servicos.filter(
    (s) => s.status === "em_andamento"
  ).length;
  const totalConcluidos = servicos.filter(
    (s) => s.status === "concluido"
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F25C26]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Serviços</h1>
          <p className="text-gray-500 mt-1">
            Solicite fretes, coletas e serviços para suas obras
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate("/colaborador/financeiro")}
            className="border-slate-300 hover:bg-slate-100"
          >
            <Wallet className="h-4 w-4 mr-2" />
            Meu Financeiro
          </Button>
          <Dialog open={showNovoModal} onOpenChange={setShowNovoModal}>
            <DialogTrigger asChild>
              <Button className="bg-[#F25C26] hover:bg-[#D94E1F]">
                <Plus className="h-4 w-4 mr-2" />
                Solicitar Serviço
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nova Solicitação de Serviço</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo de Serviço</Label>
                  <Select
                    value={novoServico.tipo}
                    onValueChange={(v) =>
                      setNovoServico({ ...novoServico, tipo: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="frete">Frete</SelectItem>
                      <SelectItem value="coleta">Coleta</SelectItem>
                      <SelectItem value="entrega">Entrega</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Prioridade</Label>
                  <Select
                    value={novoServico.prioridade}
                    onValueChange={(v) =>
                      setNovoServico({ ...novoServico, prioridade: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Projeto (opcional)</Label>
                <Select
                  value={novoServico.projeto_id}
                  onValueChange={(v) =>
                    setNovoServico({ ...novoServico, projeto_id: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um projeto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum</SelectItem>
                    {projetos.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.numero} - {p.cliente?.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Descrição *</Label>
                <Textarea
                  value={novoServico.descricao}
                  onChange={(e) =>
                    setNovoServico({
                      ...novoServico,
                      descricao: e.target.value,
                    })
                  }
                  placeholder="Descreva o serviço solicitado..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Endereço de Origem</Label>
                  <Input
                    value={novoServico.endereco_origem}
                    onChange={(e) =>
                      setNovoServico({
                        ...novoServico,
                        endereco_origem: e.target.value,
                      })
                    }
                    placeholder="Origem"
                  />
                </div>
                <div>
                  <Label>Endereço de Destino</Label>
                  <Input
                    value={novoServico.endereco_destino}
                    onChange={(e) =>
                      setNovoServico({
                        ...novoServico,
                        endereco_destino: e.target.value,
                      })
                    }
                    placeholder="Destino"
                  />
                </div>
              </div>

              <div>
                <Label>Data Desejada</Label>
                <Input
                  type="date"
                  value={novoServico.data_previsao}
                  onChange={(e) =>
                    setNovoServico({
                      ...novoServico,
                      data_previsao: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label>Observações</Label>
                <Textarea
                  value={novoServico.observacoes}
                  onChange={(e) =>
                    setNovoServico({
                      ...novoServico,
                      observacoes: e.target.value,
                    })
                  }
                  placeholder="Informações adicionais..."
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowNovoModal(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCriarServico}
                  className="bg-[#F25C26] hover:bg-[#D94E1F]"
                >
                  Solicitar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-lg px-3 py-2 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-yellow-100 rounded-md">
              <Clock className="w-4 h-4 text-yellow-600" />
            </div>
            <span className="text-xl font-bold text-gray-900">{totalSolicitados}</span>
            <span className="text-xs text-gray-500">Solicitados</span>
          </div>
        </div>

        <div className="bg-white rounded-lg px-3 py-2 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 rounded-md">
              <Truck className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-xl font-bold text-gray-900">{totalEmAndamento}</span>
            <span className="text-xs text-gray-500">Em Andamento</span>
          </div>
        </div>

        <div className="bg-white rounded-lg px-3 py-2 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-green-100 rounded-md">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-xl font-bold text-gray-900">{totalConcluidos}</span>
            <span className="text-xs text-gray-500">Concluídos</span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar serviços..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFiltro} onValueChange={setStatusFiltro}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="solicitado">Solicitados</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="concluido">Concluídos</SelectItem>
                <SelectItem value="cancelado">Cancelados</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-1">
              <Button
                variant={viewMode === "cards" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("cards")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <LayoutList className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Serviços */}
      {servicosFiltrados.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <Truck className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Nenhum serviço encontrado</p>
            <p className="text-sm mt-1">
              {busca || statusFiltro !== "todos"
                ? "Tente ajustar os filtros"
                : "Solicite seu primeiro serviço!"}
            </p>
          </CardContent>
        </Card>
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {servicosFiltrados.map((servico) => {
            const statusConfig =
              STATUS_CONFIG[servico.status] || STATUS_CONFIG.solicitado;
            const tipoConfig = TIPO_CONFIG[servico.tipo] || TIPO_CONFIG.outro;
            const StatusIcon = statusConfig.icon;
            const TipoIcon = tipoConfig.icon;

            return (
              <Card
                key={servico.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <TipoIcon className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        {tipoConfig.label}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}
                    >
                      {statusConfig.label}
                    </span>
                  </div>

                  <p className="text-sm text-gray-900 font-medium line-clamp-2 mb-3">
                    {servico.descricao}
                  </p>

                  {servico.projeto_nome && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <Building2 className="h-3 w-3" />
                      <span>Projeto: {servico.projeto_nome}</span>
                    </div>
                  )}

                  {(servico.endereco_origem || servico.endereco_destino) && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">
                        {servico.endereco_origem} → {servico.endereco_destino}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4 pt-3 border-t">
                    <span className="text-xs text-gray-400">
                      {formatarData(servico.created_at)}
                    </span>
                    {servico.data_previsao && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Prev: {formatarData(servico.data_previsao)}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {servicosFiltrados.map((servico) => {
                const statusConfig =
                  STATUS_CONFIG[servico.status] || STATUS_CONFIG.solicitado;
                const tipoConfig =
                  TIPO_CONFIG[servico.tipo] || TIPO_CONFIG.outro;

                return (
                  <div
                    key={servico.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <tipoConfig.icon className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {servico.descricao}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                            <span>{tipoConfig.label}</span>
                            {servico.projeto_nome && (
                              <span>• {servico.projeto_nome}</span>
                            )}
                            <span>• {formatarData(servico.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}
                      >
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
