/**
 * Página de Diário de Obra do Colaborador
 * Permite criar registros com fotos e descrição
 * Fotos são enviadas para o Google Drive do cliente
 */

import { useState, useEffect, useCallback } from "react";
import { Plus, Camera, Loader2 } from "lucide-react";
import { useUsuarioLogado } from "@/hooks/useUsuarioLogado";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DiarioObraForm, DiarioObraList } from "@/components/diario-obra";
import {
  listarDiariosPorColaborador,
  excluirRegistroDiario,
  excluirFotoDiario,
  atualizarLegendaFoto,
} from "@/lib/diarioObraApi";
import type { DiarioObra } from "@/types/diarioObra";

export default function ColaboradorDiarioObraPage() {
  const { usuario } = useUsuarioLogado();
  const [registros, setRegistros] = useState<DiarioObra[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);

  // ID do colaborador logado
  const colaboradorId = usuario?.pessoa_id || "";

  // Carregar dados iniciais
  useEffect(() => {
    if (colaboradorId) {
      loadDados();
    }
  }, [colaboradorId]);

  async function loadDados() {
    try {
      setLoading(true);
      const diarios = await listarDiariosPorColaborador(colaboradorId);
      setRegistros(diarios);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  }

  // Handler para novo registro criado
  const handleNovoRegistro = useCallback(() => {
    setSheetOpen(false);
    loadDados();
  }, [colaboradorId]);

  // Handler para excluir registro
  const handleExcluirRegistro = useCallback(async (diarioId: string) => {
    try {
      await excluirRegistroDiario(diarioId);
      setRegistros((prev) => prev.filter((r) => r.id !== diarioId));
    } catch (error) {
      console.error("Erro ao excluir registro:", error);
      alert("Erro ao excluir registro. Tente novamente.");
    }
  }, []);

  // Handler para excluir foto
  const handleExcluirFoto = useCallback(async (fotoId: string) => {
    try {
      await excluirFotoDiario(fotoId);
      setRegistros((prev) =>
        prev.map((r) => ({
          ...r,
          fotos: r.fotos?.filter((f) => f.id !== fotoId),
        }))
      );
    } catch (error) {
      console.error("Erro ao excluir foto:", error);
      alert("Erro ao excluir foto. Tente novamente.");
    }
  }, []);

  // Handler para atualizar legenda
  const handleAtualizarLegenda = useCallback(
    async (fotoId: string, legenda: string) => {
      try {
        await atualizarLegendaFoto(fotoId, legenda);
        setRegistros((prev) =>
          prev.map((r) => ({
            ...r,
            fotos: r.fotos?.map((f) =>
              f.id === fotoId ? { ...f, legenda } : f
            ),
          }))
        );
      } catch (error) {
        console.error("Erro ao atualizar legenda:", error);
      }
    },
    []
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#F25C26] mx-auto mb-3" />
          <p className="text-gray-500">Carregando diário de obra...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Diário de Obra</h1>
          <p className="text-gray-500">
            Registre o dia a dia das obras com fotos e anotações
          </p>
        </div>

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button className="bg-[#F25C26] hover:bg-[#D94D1A] gap-2">
              <Camera className="h-4 w-4" />
              Novo Registro
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Novo Registro</SheetTitle>
              <SheetDescription>
                Adicione fotos e uma descrição do dia de trabalho
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <DiarioObraForm
                colaboradorId={colaboradorId}
                onSuccess={handleNovoRegistro}
                onCancel={() => setSheetOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Lista de registros */}
      <DiarioObraList
        registros={registros}
        colaboradorAtualId={colaboradorId}
        showCliente={true}
        onExcluir={handleExcluirRegistro}
        onExcluirFoto={handleExcluirFoto}
        onAtualizarLegendaFoto={handleAtualizarLegenda}
      />

      {/* Empty state */}
      {registros.length === 0 && !loading && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Camera className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              Nenhum registro ainda
            </h3>
            <p className="text-gray-500 text-center max-w-sm mb-4">
              Comece a documentar o progresso das obras. As fotos são enviadas
              automaticamente para o Google Drive do cliente.
            </p>
            <Button
              onClick={() => setSheetOpen(true)}
              className="bg-[#F25C26] hover:bg-[#D94D1A] gap-2"
            >
              <Plus className="h-4 w-4" />
              Criar Primeiro Registro
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
