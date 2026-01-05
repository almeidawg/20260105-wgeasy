// ============================================================================
// EVF PAGE - Listagem de Estudos de Viabilidade Financeira
// Sistema WG Easy - Grupo WG Almeida
// ============================================================================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Calculator,
  TrendingUp,
  FileText,
  Trash2,
  Copy,
  Eye,
  MoreVertical,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  listarEstudos,
  deletarEstudo,
  duplicarEstudo,
  buscarEstatisticasEVF,
} from "@/lib/evfApi";
import type { EVFEstudoCompleto } from "@/types/evf";
import { formatarMoeda, formatarNumero, PADRAO_LABELS } from "@/types/evf";

export default function EVFPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Estados
  const [estudos, setEstudos] = useState<EVFEstudoCompleto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [estudoParaDeletar, setEstudoParaDeletar] = useState<string | null>(null);
  const [estatisticas, setEstatisticas] = useState<{
    totalEstudos: number;
    valorMedioTotal: number;
    valorMedioM2: number;
  } | null>(null);

  // Carregar dados
  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      setLoading(true);
      const [listaEstudos, stats] = await Promise.all([
        listarEstudos(),
        buscarEstatisticasEVF(),
      ]);
      setEstudos(listaEstudos);
      setEstatisticas(stats);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  // Filtrar estudos
  const estudosFiltrados = estudos.filter((estudo) => {
    if (!busca) return true;
    const termo = busca.toLowerCase();
    return (
      estudo.titulo.toLowerCase().includes(termo) ||
      estudo.cliente?.nome?.toLowerCase().includes(termo) ||
      estudo.analise_projeto?.titulo?.toLowerCase().includes(termo)
    );
  });

  // Handlers
  async function handleDeletar() {
    if (!estudoParaDeletar) return;

    try {
      await deletarEstudo(estudoParaDeletar);
      toast({
        title: "Estudo excluído",
        description: "O estudo foi excluído com sucesso.",
      });
      carregarDados();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setEstudoParaDeletar(null);
    }
  }

  async function handleDuplicar(id: string) {
    try {
      const novoEstudo = await duplicarEstudo(id);
      toast({
        title: "Estudo duplicado",
        description: "O estudo foi duplicado com sucesso.",
      });
      navigate(`/evf/${novoEstudo.id}`);
    } catch (error: any) {
      toast({
        title: "Erro ao duplicar",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  // Cores do padrão
  function getCorPadrao(padrao: string): string {
    switch (padrao) {
      case "economico":
        return "bg-green-100 text-green-800";
      case "medio_alto":
        return "bg-blue-100 text-blue-800";
      case "alto_luxo":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  // Loading
  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-200 rounded w-48" />
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg" />
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-wg-primary/10 rounded-lg">
              <Calculator className="w-6 h-6 text-wg-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Estudo de Viabilidade Financeira
              </h1>
              <p className="text-sm text-gray-600">
                Estimativas de investimento por metragem e padrão de acabamento
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate("/evf/novo")}
            className="bg-wg-primary hover:bg-wg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Estudo
          </Button>
        </div>

        {/* Cards de Estatísticas */}
        {estatisticas && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-wg-primary">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-wg-primary" />
                <div>
                  <p className="text-sm text-gray-500">Total de Estudos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {estatisticas.totalEstudos}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm text-gray-500">Valor Médio Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatarMoeda(estatisticas.valorMedioTotal)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
              <div className="flex items-center gap-3">
                <Calculator className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Valor Médio por m²</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatarMoeda(estatisticas.valorMedioM2)}/m²
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Barra de Busca */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Buscar por título, cliente ou análise..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={carregarDados}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Lista de Estudos */}
        {estudosFiltrados.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              {busca ? "Nenhum estudo encontrado" : "Nenhum estudo cadastrado"}
            </h2>
            <p className="text-gray-500 mb-4">
              {busca
                ? "Tente buscar por outro termo"
                : "Crie seu primeiro estudo de viabilidade financeira"}
            </p>
            {!busca && (
              <Button onClick={() => navigate("/evf/novo")}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Estudo
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Título
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Cliente
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                    Metragem
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                    Padrão
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">
                    Valor Total
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">
                    R$/m²
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                    Data
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {estudosFiltrados.map((estudo) => (
                  <tr
                    key={estudo.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/evf/${estudo.id}`)}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{estudo.titulo}</p>
                        {estudo.analise_projeto && (
                          <p className="text-xs text-gray-500">
                            {estudo.analise_projeto.titulo}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {estudo.cliente?.nome || "-"}
                    </td>
                    <td className="px-4 py-3 text-center font-medium">
                      {formatarNumero(estudo.metragem_total)} m²
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge className={getCorPadrao(estudo.padrao_acabamento)}>
                        {PADRAO_LABELS[estudo.padrao_acabamento]?.label || estudo.padrao_acabamento}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-wg-primary">
                      {formatarMoeda(estudo.valor_total)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {formatarMoeda(estudo.valor_m2_medio)}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-500">
                      {new Date(estudo.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/evf/${estudo.id}`);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicar(estudo.id);
                            }}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEstudoParaDeletar(estudo.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Dialog de Confirmação de Exclusão */}
        <AlertDialog open={!!estudoParaDeletar} onOpenChange={() => setEstudoParaDeletar(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este estudo? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeletar}
                className="bg-red-600 hover:bg-red-700"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
