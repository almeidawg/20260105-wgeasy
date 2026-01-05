// src/pages/sistema/PlantaSistemaPage.tsx
// Página para configurar permissões por tipo de usuário

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Settings,
  Shield,
  Eye,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Save,
  Crown,
  User,
  Users,
  Briefcase,
  Headphones,
  UserCog,
  Building2,
  Truck,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useUsuarioLogado } from "@/hooks/useUsuarioLogado";
import {
  listarModulos,
  listarPermissoesTipoUsuario,
  atualizarPermissao,
  getLabelTipoUsuario,
  getCorTipoUsuario,
  TIPOS_USUARIO,
  type ModuloSistema,
  type PermissaoTipoUsuario,
} from "@/lib/permissoesModuloApi";

const ICONES_TIPO: Record<string, any> = {
  MASTER: Crown,
  ADMIN: Shield,
  COMERCIAL: Briefcase,
  ATENDIMENTO: Headphones,
  COLABORADOR: Users,
  CLIENTE: User,
  ESPECIFICADOR: UserCog,
  FORNECEDOR: Truck,
};

export default function PlantaSistemaPage() {
  const { toast } = useToast();
  const { isMaster, isAdmin, loading: loadingUser } = useUsuarioLogado();

  const [modulos, setModulos] = useState<ModuloSistema[]>([]);
  const [permissoes, setPermissoes] = useState<Record<string, PermissaoTipoUsuario[]>>({});
  const [tipoSelecionado, setTipoSelecionado] = useState("MASTER");
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    if (tipoSelecionado && !permissoes[tipoSelecionado]) {
      carregarPermissoesTipo(tipoSelecionado);
    }
  }, [tipoSelecionado]);

  async function carregarDados() {
    try {
      setLoading(true);
      const modulosData = await listarModulos();
      setModulos(modulosData);

      // Carregar permissões do tipo selecionado
      await carregarPermissoesTipo(tipoSelecionado);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar módulos do sistema",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function carregarPermissoesTipo(tipo: string) {
    try {
      const perms = await listarPermissoesTipoUsuario(tipo);
      setPermissoes((prev) => ({
        ...prev,
        [tipo]: perms,
      }));
    } catch (error) {
      console.error("Erro ao carregar permissões:", error);
    }
  }

  function getPermissaoModulo(moduloId: string): PermissaoTipoUsuario | undefined {
    return permissoes[tipoSelecionado]?.find((p) => p.modulo_id === moduloId);
  }

  async function handleTogglePermissao(
    moduloId: string,
    campo: "pode_visualizar" | "pode_criar" | "pode_editar" | "pode_excluir" | "pode_exportar" | "pode_importar",
    valor: boolean
  ) {
    // Não permitir alterar permissões do MASTER (sempre tem tudo)
    if (tipoSelecionado === "MASTER") {
      toast({
        title: "Ação não permitida",
        description: "O Founder & CEO sempre tem acesso total ao sistema",
        variant: "destructive",
      });
      return;
    }

    try {
      setSalvando(true);
      await atualizarPermissao(tipoSelecionado, moduloId, { [campo]: valor });

      // Atualizar estado local
      setPermissoes((prev) => {
        const permsAtuais = prev[tipoSelecionado] || [];
        const idx = permsAtuais.findIndex((p) => p.modulo_id === moduloId);

        if (idx >= 0) {
          const novasPerms = [...permsAtuais];
          novasPerms[idx] = { ...novasPerms[idx], [campo]: valor };
          return { ...prev, [tipoSelecionado]: novasPerms };
        } else {
          return {
            ...prev,
            [tipoSelecionado]: [
              ...permsAtuais,
              {
                id: "",
                tipo_usuario: tipoSelecionado,
                modulo_id: moduloId,
                pode_visualizar: campo === "pode_visualizar" ? valor : false,
                pode_criar: campo === "pode_criar" ? valor : false,
                pode_editar: campo === "pode_editar" ? valor : false,
                pode_excluir: campo === "pode_excluir" ? valor : false,
                pode_exportar: campo === "pode_exportar" ? valor : false,
                pode_importar: campo === "pode_importar" ? valor : false,
              },
            ],
          };
        }
      });

      toast({
        title: "Permissão atualizada",
        description: `Permissão alterada com sucesso`,
      });
    } catch (error) {
      console.error("Erro ao atualizar permissão:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar permissão",
        variant: "destructive",
      });
    } finally {
      setSalvando(false);
    }
  }

  // Agrupar módulos por seção
  const modulosPorSecao = modulos.reduce((acc, modulo) => {
    if (!acc[modulo.secao]) {
      acc[modulo.secao] = [];
    }
    acc[modulo.secao].push(modulo);
    return acc;
  }, {} as Record<string, ModuloSistema[]>);

  if (loadingUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  // Apenas MASTER pode acessar esta página
  if (!isMaster) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Shield className="w-12 h-12 text-red-500" />
              <div>
                <h2 className="text-xl font-bold text-red-700">Acesso Restrito</h2>
                <p className="text-red-600">
                  Apenas o Founder & CEO pode acessar a configuração de permissões do sistema.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-oswald font-bold text-gray-900 flex items-center gap-3">
            <Settings className="w-8 h-8 text-orange-600" />
            Planta do Sistema
          </h1>
          <p className="text-gray-600 font-poppins mt-1">
            Configure as permissões de acesso para cada tipo de usuário
          </p>
        </div>
      </div>

      {/* Seleção de Tipo de Usuário */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Selecione o Tipo de Usuário</CardTitle>
          <CardDescription>
            Escolha o tipo de usuário para visualizar e editar suas permissões
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {TIPOS_USUARIO.map((tipo) => {
              const Icone = ICONES_TIPO[tipo.value] || User;
              const isSelected = tipoSelecionado === tipo.value;
              const cor = getCorTipoUsuario(tipo.value);

              return (
                <button
                  key={tipo.value}
                  onClick={() => setTipoSelecionado(tipo.value)}
                  className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                    isSelected
                      ? `border-${cor}-500 bg-${cor}-50 ring-2 ring-${cor}-200`
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <Icone
                    className={`w-6 h-6 ${isSelected ? `text-${cor}-600` : "text-gray-500"}`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      isSelected ? `text-${cor}-700` : "text-gray-600"
                    }`}
                  >
                    {tipo.label}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Informações do Tipo Selecionado */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {(() => {
                const Icone = ICONES_TIPO[tipoSelecionado] || User;
                return <Icone className="w-6 h-6 text-orange-600" />;
              })()}
              <div>
                <CardTitle>{getLabelTipoUsuario(tipoSelecionado)}</CardTitle>
                <CardDescription>
                  {TIPOS_USUARIO.find((t) => t.value === tipoSelecionado)?.descricao}
                </CardDescription>
              </div>
            </div>
            {tipoSelecionado === "MASTER" && (
              <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                <Crown className="w-3 h-3 mr-1" />
                Acesso Total
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Tabela de Permissões */}
      {loading ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              <p className="text-gray-600">Carregando módulos...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(modulosPorSecao).map(([secao, modulosSecao]) => (
            <Card key={secao}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                  {secao}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-[250px]">Módulo</TableHead>
                      <TableHead className="text-center w-[100px]">
                        <div className="flex items-center justify-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>Ver</span>
                        </div>
                      </TableHead>
                      <TableHead className="text-center w-[100px]">
                        <div className="flex items-center justify-center gap-1">
                          <Plus className="w-4 h-4" />
                          <span>Criar</span>
                        </div>
                      </TableHead>
                      <TableHead className="text-center w-[100px]">
                        <div className="flex items-center justify-center gap-1">
                          <Edit className="w-4 h-4" />
                          <span>Editar</span>
                        </div>
                      </TableHead>
                      <TableHead className="text-center w-[100px]">
                        <div className="flex items-center justify-center gap-1">
                          <Trash2 className="w-4 h-4" />
                          <span>Excluir</span>
                        </div>
                      </TableHead>
                      <TableHead className="text-center w-[100px]">
                        <div className="flex items-center justify-center gap-1">
                          <Download className="w-4 h-4" />
                          <span>Export</span>
                        </div>
                      </TableHead>
                      <TableHead className="text-center w-[100px]">
                        <div className="flex items-center justify-center gap-1">
                          <Upload className="w-4 h-4" />
                          <span>Import</span>
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {modulosSecao.map((modulo) => {
                      const perm = getPermissaoModulo(modulo.id);
                      const isMasterTipo = tipoSelecionado === "MASTER";

                      return (
                        <TableRow key={modulo.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{modulo.nome}</div>
                              <div className="text-xs text-gray-500">{modulo.path}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={isMasterTipo || perm?.pode_visualizar || false}
                              onCheckedChange={(v) =>
                                handleTogglePermissao(modulo.id, "pode_visualizar", v)
                              }
                              disabled={isMasterTipo || salvando}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={isMasterTipo || perm?.pode_criar || false}
                              onCheckedChange={(v) =>
                                handleTogglePermissao(modulo.id, "pode_criar", v)
                              }
                              disabled={isMasterTipo || salvando}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={isMasterTipo || perm?.pode_editar || false}
                              onCheckedChange={(v) =>
                                handleTogglePermissao(modulo.id, "pode_editar", v)
                              }
                              disabled={isMasterTipo || salvando}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={isMasterTipo || perm?.pode_excluir || false}
                              onCheckedChange={(v) =>
                                handleTogglePermissao(modulo.id, "pode_excluir", v)
                              }
                              disabled={isMasterTipo || salvando}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={isMasterTipo || perm?.pode_exportar || false}
                              onCheckedChange={(v) =>
                                handleTogglePermissao(modulo.id, "pode_exportar", v)
                              }
                              disabled={isMasterTipo || salvando}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={isMasterTipo || perm?.pode_importar || false}
                              onCheckedChange={(v) =>
                                handleTogglePermissao(modulo.id, "pode_importar", v)
                              }
                              disabled={isMasterTipo || salvando}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
