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

      // Buscar registros da obra com suas fotos
      // A estrutura é: contratos -> obra_registros (via projeto_id) -> obra_registros_fotos (via registro_id)
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
        .eq("projeto_id", contratoId)
        .order("data_registro", { ascending: false });

      if (error) {
        console.error("Erro ao buscar registros:", error);
        setGrupos([]);
        return;
      }

      if (!registros || registros.length === 0) {
        setGrupos([]);
        return;
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
          });
        });
      });

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
