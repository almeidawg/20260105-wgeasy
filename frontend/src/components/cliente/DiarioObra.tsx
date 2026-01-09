// ============================================================
// COMPONENTE: DiarioObra
// Sistema WG Easy - Grupo WG Almeida
// ============================================================
// Galeria de fotos da obra organizada por semana
// Combina fotos do banco de dados + Google Drive
// ============================================================

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Camera,
  Calendar,
  ChevronDown,
  ChevronUp,
  Loader2,
  X,
  ZoomIn
} from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

interface Foto {
  id: string;
  url: string;
  nome: string;
  data: string;
  semana?: string;
  source?: "database" | "drive";
}

interface GrupoSemana {
  semana: string;
  fotos: Foto[];
}

interface DiarioObraProps {
  clienteId: string;
  contratoId?: string;
  oportunidadeId?: string;
}

// Extrai o folder ID do link do Google Drive
function extrairDriveFolderId(driveLink: string): string | null {
  if (!driveLink) return null;
  // Se já é apenas o ID (sem URL)
  if (!driveLink.includes("/")) {
    return driveLink;
  }
  // Extrair ID do formato URL
  const regex = /folders\/([a-zA-Z0-9_-]+)/;
  const match = driveLink.match(regex);
  return match ? match[1] : null;
}

export default function DiarioObra({ clienteId, contratoId, oportunidadeId }: DiarioObraProps) {
  const [grupos, setGrupos] = useState<GrupoSemana[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSemana, setExpandedSemana] = useState<string | null>(null);
  const [fotoAmpliada, setFotoAmpliada] = useState<string | null>(null);

  useEffect(() => {
    carregarFotos();
  }, [clienteId, contratoId, oportunidadeId]);

  // Buscar fotos do Google Drive via backend
  async function carregarFotosDoDrive(driveLink: string): Promise<GrupoSemana[]> {
    const folderId = extrairDriveFolderId(driveLink);
    if (!folderId) return [];

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/drive/diario-obra-images?folderId=${folderId}`
      );

      if (!response.ok) {
        console.error("Erro ao buscar fotos do Drive:", response.statusText);
        return [];
      }

      const data = await response.json();

      if (!data.success || !data.groups || data.groups.length === 0) {
        return [];
      }

      // Converter para formato GrupoSemana
      return data.groups.map((group: any) => ({
        semana: group.folder.toUpperCase(),
        fotos: group.files.map((file: any) => ({
          id: file.id,
          // Priorizar directImageUrl (URL pública) > thumbnailLink > webContentLink
          url: file.directImageUrl || file.thumbnailLink || file.webContentLink || file.webViewLink,
          nome: file.name,
          data: file.createdTime || new Date().toISOString(),
          semana: group.folder.toUpperCase(),
          source: "drive" as const,
        })),
      }));
    } catch (error) {
      console.error("Erro ao carregar fotos do Drive:", error);
      return [];
    }
  }

  async function carregarFotos() {
    // Validar se temos um clienteId antes de fazer a query
    if (!clienteId) {
      console.log("[DiarioObra] Sem clienteId");
      setGrupos([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("[DiarioObra] Carregando fotos para clienteId:", clienteId);

      // Buscar drive_link do cliente
      const { data: pessoa, error: pessoaError } = await supabase
        .from("pessoas")
        .select("drive_link, nome")
        .eq("id", clienteId)
        .single();

      console.log("[DiarioObra] Pessoa encontrada:", pessoa, "Erro:", pessoaError);
      console.log("[DiarioObra] drive_link:", pessoa?.drive_link);

      // Promise.all para buscar do banco E do Drive em paralelo
      const [gruposDb, gruposDrive] = await Promise.all([
        carregarFotosDoDatabase(),
        pessoa?.drive_link ? carregarFotosDoDrive(pessoa.drive_link) : Promise.resolve([]),
      ]);

      console.log("[DiarioObra] Fotos do DB:", gruposDb.length, "grupos | Fotos do Drive:", gruposDrive.length, "grupos");

      // Combinar resultados
      const gruposMap = new Map<string, Foto[]>();

      // Adicionar fotos do banco de dados
      gruposDb.forEach((grupo) => {
        if (!gruposMap.has(grupo.semana)) {
          gruposMap.set(grupo.semana, []);
        }
        gruposMap.get(grupo.semana)!.push(...grupo.fotos);
      });

      // Adicionar fotos do Drive
      gruposDrive.forEach((grupo) => {
        if (!gruposMap.has(grupo.semana)) {
          gruposMap.set(grupo.semana, []);
        }
        gruposMap.get(grupo.semana)!.push(...grupo.fotos);
      });

      // Converter para array
      const gruposArray: GrupoSemana[] = [];
      gruposMap.forEach((fotos, semana) => {
        gruposArray.push({ semana, fotos });
      });

      // Ordenar por data mais recente primeiro
      gruposArray.sort((a, b) => {
        const dataA = new Date(a.fotos[0]?.data || 0);
        const dataB = new Date(b.fotos[0]?.data || 0);
        return dataB.getTime() - dataA.getTime();
      });

      setGrupos(gruposArray);

      // Expandir primeiro grupo automaticamente
      if (gruposArray.length > 0 && !expandedSemana) {
        setExpandedSemana(gruposArray[0].semana);
      }
    } catch (error) {
      console.error("Erro ao carregar fotos:", error);
      setGrupos([]);
    } finally {
      setLoading(false);
    }
  }

  // Buscar fotos do banco de dados (Supabase)
  async function carregarFotosDoDatabase(): Promise<GrupoSemana[]> {
    try {
      console.log("[DiarioObra] Buscando registros de obra para cliente_id:", clienteId);
      const { data: registros, error } = await supabase
        .from("obra_registros")
        .select(`
          id,
          titulo,
          descricao,
          data_registro,
          criado_em,
          obra_registros_fotos (
            id,
            arquivo_url,
            descricao,
            ordem,
            criado_em
          )
        `)
        .eq("cliente_id", clienteId)
        .order("data_registro", { ascending: false });

      console.log("[DiarioObra] Registros encontrados:", registros?.length || 0, "Erro:", error);

      if (error) {
        console.error("Erro ao buscar registros:", error);
        return [];
      }

      if (!registros || registros.length === 0) {
        console.log("[DiarioObra] Nenhum registro de obra encontrado para este cliente");
        return [];
      }

      // Agrupar fotos por semana baseado na data do registro
      const gruposMap = new Map<string, Foto[]>();

      registros.forEach((registro: any) => {
        const fotos = registro.obra_registros_fotos || [];
        if (fotos.length === 0) return;

        const dataRegistro = new Date(registro.data_registro || registro.criado_em);
        const hoje = new Date();
        const diffDias = Math.floor((hoje.getTime() - dataRegistro.getTime()) / (1000 * 60 * 60 * 24));
        const numSemana = Math.floor(diffDias / 7) + 1;

        // Usar título do registro ou semana calculada
        const semanaLabel = registro.titulo || `SEMANA ${numSemana}`;

        if (!gruposMap.has(semanaLabel)) {
          gruposMap.set(semanaLabel, []);
        }

        fotos.forEach((foto: any) => {
          gruposMap.get(semanaLabel)!.push({
            id: foto.id,
            url: foto.arquivo_url,
            nome: foto.descricao || registro.descricao || "Foto da obra",
            data: foto.criado_em || registro.data_registro,
            semana: semanaLabel,
            source: "database" as const,
          });
        });
      });

      const gruposArray: GrupoSemana[] = [];
      gruposMap.forEach((fotos, semana) => {
        gruposArray.push({ semana, fotos });
      });

      return gruposArray;
    } catch (error) {
      console.error("Erro ao carregar fotos do database:", error);
      return [];
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Carregando fotos...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (grupos.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <Camera className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600">Diário de Obra</h3>
          <p className="text-sm text-gray-400 mt-2">
            As fotos da sua obra aparecerão aqui conforme forem registradas
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="bg-white border-b">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Camera className="w-5 h-5 text-gray-600" />
            DIARIO DE OBRA
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            {grupos.map((grupo) => (
              <div key={grupo.semana}>
                <button
                  type="button"
                  onClick={() => setExpandedSemana(
                    expandedSemana === grupo.semana ? null : grupo.semana
                  )}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-700">{grupo.semana}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{grupo.fotos.length} fotos</span>
                    {expandedSemana === grupo.semana ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </button>

                {expandedSemana === grupo.semana && (
                  <div className="px-4 pb-4">
                    <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                      {grupo.fotos.map((foto) => (
                        <button
                          type="button"
                          key={foto.id}
                          title={foto.nome}
                          onClick={() => setFotoAmpliada(foto.url)}
                          className="aspect-square bg-gray-100 rounded-lg overflow-hidden hover:opacity-90 transition-opacity group relative"
                        >
                          <img
                            src={foto.url || "/placeholder-image.jpg"}
                            alt={foto.nome}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://via.placeholder.com/200x200?text=Foto";
                            }}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal de foto ampliada */}
      {fotoAmpliada && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Foto ampliada"
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setFotoAmpliada(null)}
          onKeyDown={(e) => e.key === "Escape" && setFotoAmpliada(null)}
        >
          <button
            type="button"
            title="Fechar"
            aria-label="Fechar foto"
            onClick={() => setFotoAmpliada(null)}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={fotoAmpliada}
            alt="Foto ampliada"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
