// ============================================================
// COMPONENTE: DiarioObra
// Sistema WG Easy - Grupo WG Almeida
// ============================================================
// Galeria de fotos da obra organizada por semana
// ============================================================

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Camera,
  Calendar,
  ChevronDown,
  ChevronUp,
  Image,
  Loader2,
  ExternalLink,
  X,
  ZoomIn
} from "lucide-react";

interface Foto {
  id: string;
  url: string;
  nome: string;
  data: string;
  semana?: string;
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

export default function DiarioObra({ clienteId, contratoId, oportunidadeId }: DiarioObraProps) {
  const [grupos, setGrupos] = useState<GrupoSemana[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSemana, setExpandedSemana] = useState<string | null>("FOTOS DO IMOVEL");
  const [fotoAmpliada, setFotoAmpliada] = useState<string | null>(null);

  useEffect(() => {
    carregarFotos();
  }, [clienteId, contratoId, oportunidadeId]);

  async function carregarFotos() {
    try {
      setLoading(true);

      // Tentar buscar fotos do diário de obra
      const { data, error } = await supabase
        .from("diario_obra_fotos")
        .select("*")
        .eq("contrato_id", contratoId)
        .order("created_at", { ascending: false });

      if (error || !data || data.length === 0) {
        setGrupos([]);
        return;
      }

      // Agrupar fotos por semana
      const gruposMap = new Map<string, Foto[]>();
      data.forEach((foto: any) => {
        const dataFoto = new Date(foto.created_at);
        const semana = foto.semana || `SEMANA ${Math.ceil((Date.now() - dataFoto.getTime()) / (7 * 86400000))}`;

        if (!gruposMap.has(semana)) {
          gruposMap.set(semana, []);
        }
        gruposMap.get(semana)!.push({
          id: foto.id,
          url: foto.url || foto.arquivo_url,
          nome: foto.descricao || foto.nome,
          data: foto.created_at,
          semana,
        });
      });

      const gruposArray: GrupoSemana[] = [];
      gruposMap.forEach((fotos, semana) => {
        gruposArray.push({ semana, fotos });
      });

      setGrupos(gruposArray);
    } catch (error) {
      console.error("Erro ao carregar fotos:", error);
      setGrupos([]);
    } finally {
      setLoading(false);
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
                          key={foto.id}
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
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setFotoAmpliada(null)}
        >
          <button
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
