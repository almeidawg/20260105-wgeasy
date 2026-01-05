import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Eye, Copy, Share2, Calendar, Clock,
  LayoutGrid, List, Building2, HardHat, CheckCircle2, Search, Filter
} from "lucide-react";
import { getStatusProjetoLabel, getStatusProjetoColor, formatarData as formatarDataCronograma } from "@/types/cronograma";
import { useAuth } from "@/auth/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { listarProjetosCronograma } from "@/lib/cronogramaApi";
import type { ProjetoCompleto } from "@/types/cronograma";

// Componente visual do card de projeto (padrão cronograma)
const ProjetoCardVisual = ({
  projeto,
  onCopy,
  onShare,
  onClick,
}) => {
  const nucleoCor = projeto.nucleo ? "#F25C26" : "#ccc";
  const statusCor = getStatusProjetoColor(projeto.status);
  const diasRestantes = projeto.data_termino
    ? Math.ceil((new Date(projeto.data_termino).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group"
    >
      <div className="h-1.5" style={{ backgroundColor: nucleoCor }} />
      <div className="p-3">
        <div className="flex items-start gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${nucleoCor}, ${nucleoCor}99)` }}
          >
            {projeto.cliente_avatar_url ? (
              <img src={projeto.cliente_avatar_url} alt={projeto.cliente_nome || "Cliente"} className="w-full h-full object-cover" />
            ) : projeto.cliente_nome ? (
              projeto.cliente_nome.charAt(0).toUpperCase()
            ) : (
              "P"
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-[#F25C26] transition-colors">{projeto.nome}</h3>
            <p className="text-xs text-gray-500 truncate">{projeto.cliente_nome || "Cliente não definido"}</p>
            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium mt-1" style={{ backgroundColor: `${statusCor}15`, color: statusCor }}>{getStatusProjetoLabel(projeto.status)}</span>
          </div>
        </div>
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-500">Progresso</span>
            <span className="font-semibold text-gray-900">{projeto.progresso || 0}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${projeto.progresso || 0}%` }} transition={{ duration: 0.8 }} className="h-full rounded-full" style={{ backgroundColor: nucleoCor }} />
          </div>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-gray-500 mb-2">
          {projeto.data_inicio && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formatarDataCronograma(projeto.data_inicio)}</span>
            </div>
          )}
          {projeto.data_termino && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatarDataCronograma(projeto.data_termino)}</span>
            </div>
          )}
        </div>
        {diasRestantes !== null && (
          <div className={`text-[10px] font-medium mb-2 ${diasRestantes < 0 ? "text-red-600" : diasRestantes <= 7 ? "text-orange-600" : "text-green-600"}`}>
            {diasRestantes < 0 ? `Atrasado ${Math.abs(diasRestantes)}d` : diasRestantes === 0 ? "Vence hoje!" : `${diasRestantes}d restantes`}
          </div>
        )}
        <div className="flex gap-1.5 pt-2 border-t border-gray-100">
          <Button onClick={onClick} size="sm" className="flex-1 bg-[#F25C26] hover:bg-[#d94d1a] text-white text-xs h-7"><Eye className="w-3 h-3 mr-1" />Ver</Button>
          <Button type="button" variant="outline" size="sm" title="Copiar" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); onCopy(); }}><Copy className="w-3 h-3" /></Button>
          <Button type="button" variant="outline" size="sm" title="Compartilhar" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); onShare(); }}><Share2 className="w-3 h-3" /></Button>
        </div>
      </div>
    </motion.div>
  );
};


// ============================================================
// Componente Principal
// ============================================================
export default function ColaboradorProjetosPage() {
  const { usuarioCompleto } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [projetos, setProjetos] = useState<ProjetoCompleto[]>([]);
  const [filtro, setFiltro] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<string>("todos");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const carregarProjetos = async () => {
      try {
        setLoading(true);
        // Buscar projetos completos do cronograma com dados de cliente
        const data = await listarProjetosCronograma({
          mostrar_concluidos: true,
        });
        setProjetos(data);
      } catch (error) {
        console.error("Erro ao carregar projetos:", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar projetos",
          description: "Não foi possível obter a lista de projetos.",
        });
      } finally {
        setLoading(false);
      }
    };

    carregarProjetos();
  }, []);

  const formatarData = (data?: string) => {
    if (!data) return "-";
    return new Date(data).toLocaleDateString("pt-BR");
  };

  const formatarMoeda = (valor?: number) => {
    if (!valor) return "-";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  // Copiar informações do projeto
  const handleCopyProjeto = (projeto: ProjetoCompleto) => {
    const info = `
🏗️ PROJETO: ${projeto.nome}
👤 Cliente: ${projeto.cliente_nome || "N/A"}
📋 Contrato: ${projeto.contrato_numero || "N/A"}
📅 Início: ${formatarData(projeto.data_inicio)}
📅 Término: ${formatarData(projeto.data_termino)}
📊 Progresso: ${projeto.progresso || 0}%
📍 Status: ${getStatusProjetoLabel(projeto.status)}
`.trim();

    navigator.clipboard.writeText(info);
    toast({
      title: "✅ Copiado!",
      description:
        "Informações do projeto copiadas para a área de transferência.",
    });
  };

  // Compartilhar projeto via WhatsApp
  const handleShareProjeto = (projeto: ProjetoCompleto) => {
    const info = `
🏗️ *PROJETO: ${projeto.nome}*
👤 Cliente: ${projeto.cliente_nome || "N/A"}
📋 Contrato: ${projeto.contrato_numero || "N/A"}
📅 Início: ${formatarData(projeto.data_inicio)}
📅 Término: ${formatarData(projeto.data_termino)}
📊 Progresso: ${projeto.progresso || 0}%
📍 Status: ${getStatusProjetoLabel(projeto.status)}
`.trim();

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(info)}`;
    window.open(whatsappUrl, "_blank");
  };

  // Ver detalhes da obra
  const handleVerObra = (projeto: ProjetoCompleto) => {
    navigate(`/colaborador/obra/${projeto.id}`);
  };

  const projetosFiltrados = projetos.filter((p) => {
    const matchNome =
      p.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
      p.cliente_nome?.toLowerCase().includes(filtro.toLowerCase()) ||
      p.descricao?.toLowerCase().includes(filtro.toLowerCase());

    const matchStatus = statusFiltro === "todos" || p.status === statusFiltro;

    return matchNome && matchStatus;
  });

  // Estatísticas
  const stats = {
    total: projetos.length,
    emAndamento: projetos.filter((p) => p.status === "em_andamento").length,
    atrasados: projetos.filter((p) => p.status === "atrasado").length,
    concluidos: projetos.filter((p) => p.status === "concluido").length,
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Projetos</h1>
          <p className="text-gray-500 mt-1">Obras e projetos ativos</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className={
              viewMode === "grid" ? "bg-[#F25C26] hover:bg-[#d94d1a]" : ""
            }
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
            className={
              viewMode === "list" ? "bg-[#F25C26] hover:bg-[#d94d1a]" : ""
            }
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg px-3 py-2 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 rounded-md">
              <Building2 className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-xl font-bold text-gray-900">{stats.total}</span>
            <span className="text-xs text-gray-500">Total</span>
          </div>
        </div>
        <div className="bg-white rounded-lg px-3 py-2 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-orange-100 rounded-md">
              <HardHat className="w-4 h-4 text-orange-600" />
            </div>
            <span className="text-xl font-bold text-gray-900">{stats.emAndamento}</span>
            <span className="text-xs text-gray-500">Em Andamento</span>
          </div>
        </div>
        <div className="bg-white rounded-lg px-3 py-2 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-red-100 rounded-md">
              <Clock className="w-4 h-4 text-red-600" />
            </div>
            <span className="text-xl font-bold text-gray-900">{stats.atrasados}</span>
            <span className="text-xs text-gray-500">Atrasados</span>
          </div>
        </div>
        <div className="bg-white rounded-lg px-3 py-2 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-green-100 rounded-md">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-xl font-bold text-gray-900">{stats.concluidos}</span>
            <span className="text-xs text-gray-500">Concluídos</span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por cliente, projeto ou descrição..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFiltro} onValueChange={setStatusFiltro}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="planejado">Planejado</SelectItem>
                <SelectItem value="pausado">Pausado</SelectItem>
                <SelectItem value="atrasado">Atrasado</SelectItem>
                <SelectItem value="concluido">Concluídos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Projetos */}
      {projetosFiltrados.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">Nenhum projeto encontrado</p>
              <p className="text-sm mt-1">
                {filtro || statusFiltro !== "todos"
                  ? "Tente ajustar os filtros"
                  : "Você ainda não está vinculado a nenhum projeto"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" : "grid gap-3"}>
          {projetosFiltrados.map((projeto) => (
            <ProjetoCardVisual
              key={projeto.id}
              projeto={projeto}
              onCopy={() => handleCopyProjeto(projeto)}
              onShare={() => handleShareProjeto(projeto)}
              onClick={() => handleVerObra(projeto)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
