/**
 * Componente de preview/visualização de fotos do Diário de Obra
 * Com opção de legenda, exclusão e visualização em tela cheia
 */

import { useState, memo, useCallback } from "react";
import {
  X,
  Trash2,
  Edit2,
  Check,
  Maximize2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DiarioObraFoto } from "@/types/diarioObra";

interface DiarioFotoPreviewProps {
  fotos: DiarioObraFoto[];
  onExcluir?: (fotoId: string) => void;
  onAtualizarLegenda?: (fotoId: string, legenda: string) => void;
  readOnly?: boolean;
  className?: string;
}

// Componente de imagem individual memoizado para evitar re-renders
const FotoItem = memo(function FotoItem({
  foto,
  index,
  isEditing,
  editingLegenda,
  onOpenFullscreen,
  onStartEdit,
  onSaveLegenda,
  onCancelEdit,
  onEditingLegendaChange,
  onExcluir,
  readOnly,
}: {
  foto: DiarioObraFoto;
  index: number;
  isEditing: boolean;
  editingLegenda: string;
  onOpenFullscreen: (index: number) => void;
  onStartEdit: (foto: DiarioObraFoto) => void;
  onSaveLegenda: () => void;
  onCancelEdit: () => void;
  onEditingLegendaChange: (value: string) => void;
  onExcluir?: (fotoId: string) => void;
  readOnly: boolean;
}) {
  return (
    <div className="relative group rounded-lg overflow-hidden border bg-gray-50">
      {/* Imagem */}
      <div
        className="aspect-square cursor-pointer"
        onClick={() => onOpenFullscreen(index)}
      >
        <img
          src={foto.arquivo_url}
          alt={foto.legenda || `Foto ${index + 1}`}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* Overlay com ações */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors pointer-events-none" />

      {/* Botões de ação */}
      {!readOnly && (
        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onStartEdit(foto);
            }}
            className="bg-white rounded-full p-1.5 shadow hover:bg-gray-100"
            title="Editar legenda"
          >
            <Edit2 className="h-3.5 w-3.5 text-gray-700" />
          </button>
          {onExcluir && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm("Excluir esta foto?")) {
                  onExcluir(foto.id);
                }
              }}
              className="bg-red-500 rounded-full p-1.5 shadow hover:bg-red-600"
              title="Excluir foto"
            >
              <Trash2 className="h-3.5 w-3.5 text-white" />
            </button>
          )}
        </div>
      )}

      {/* Botão expandir */}
      <button
        type="button"
        onClick={() => onOpenFullscreen(index)}
        className="absolute bottom-1 right-1 bg-white/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Ver em tela cheia"
      >
        <Maximize2 className="h-4 w-4 text-gray-700" />
      </button>

      {/* Legenda */}
      {isEditing ? (
        <div className="p-2 flex gap-1">
          <input
            type="text"
            value={editingLegenda}
            onChange={(e) => onEditingLegendaChange(e.target.value)}
            className="flex-1 text-xs border rounded px-2 py-1"
            placeholder="Digite a legenda"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") onSaveLegenda();
              if (e.key === "Escape") onCancelEdit();
            }}
          />
          <button
            type="button"
            onClick={onSaveLegenda}
            className="text-green-600 hover:text-green-700"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : foto.legenda ? (
        <div className="p-2">
          <p className="text-xs text-gray-600 line-clamp-2">{foto.legenda}</p>
        </div>
      ) : null}
    </div>
  );
});

function DiarioFotoPreview({
  fotos,
  onExcluir,
  onAtualizarLegenda,
  readOnly = false,
  className,
}: DiarioFotoPreviewProps) {
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingLegenda, setEditingLegenda] = useState<string>("");

  // Handlers para fullscreen
  const abrirFullscreen = (index: number) => setFullscreenIndex(index);
  const fecharFullscreen = () => setFullscreenIndex(null);

  const irParaAnterior = () => {
    if (fullscreenIndex !== null && fullscreenIndex > 0) {
      setFullscreenIndex(fullscreenIndex - 1);
    }
  };

  const irParaProxima = () => {
    if (fullscreenIndex !== null && fullscreenIndex < fotos.length - 1) {
      setFullscreenIndex(fullscreenIndex + 1);
    }
  };

  // Handler para editar legenda - memoizado
  const iniciarEdicao = useCallback((foto: DiarioObraFoto) => {
    setEditingId(foto.id);
    setEditingLegenda(foto.legenda || "");
  }, []);

  const salvarLegenda = useCallback(() => {
    if (editingId && onAtualizarLegenda) {
      onAtualizarLegenda(editingId, editingLegenda);
    }
    setEditingId(null);
    setEditingLegenda("");
  }, [editingId, editingLegenda, onAtualizarLegenda]);

  const cancelarEdicao = useCallback(() => {
    setEditingId(null);
    setEditingLegenda("");
  }, []);

  const handleEditingLegendaChange = useCallback((value: string) => {
    setEditingLegenda(value);
  }, []);

  // Keyboard navigation para fullscreen
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (fullscreenIndex === null) return;

    if (e.key === "ArrowLeft") irParaAnterior();
    else if (e.key === "ArrowRight") irParaProxima();
    else if (e.key === "Escape") fecharFullscreen();
  };

  if (fotos.length === 0) {
    return (
      <div className={cn("text-center py-8 text-gray-500", className)}>
        <p>Nenhuma foto neste registro</p>
      </div>
    );
  }

  return (
    <>
      {/* Grid de fotos */}
      <div
        className={cn(
          "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3",
          className
        )}
      >
        {fotos.map((foto, index) => (
          <FotoItem
            key={foto.id}
            foto={foto}
            index={index}
            isEditing={editingId === foto.id}
            editingLegenda={editingLegenda}
            onOpenFullscreen={abrirFullscreen}
            onStartEdit={iniciarEdicao}
            onSaveLegenda={salvarLegenda}
            onCancelEdit={cancelarEdicao}
            onEditingLegendaChange={handleEditingLegendaChange}
            onExcluir={onExcluir}
            readOnly={readOnly}
          />
        ))}
      </div>

      {/* Modal Fullscreen */}
      {fullscreenIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={fecharFullscreen}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Botão fechar */}
          <button
            type="button"
            onClick={fecharFullscreen}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 rounded-full p-2 z-10"
          >
            <X className="h-6 w-6 text-white" />
          </button>

          {/* Navegação anterior */}
          {fullscreenIndex > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                irParaAnterior();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2"
            >
              <ChevronLeft className="h-8 w-8 text-white" />
            </button>
          )}

          {/* Imagem */}
          <div
            className="max-w-[90vw] max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={fotos[fullscreenIndex].arquivo_url}
              alt={fotos[fullscreenIndex].legenda || "Foto"}
              className="max-w-full max-h-[80vh] object-contain rounded"
            />
            {fotos[fullscreenIndex].legenda && (
              <p className="mt-4 text-white text-center max-w-lg">
                {fotos[fullscreenIndex].legenda}
              </p>
            )}
            <p className="mt-2 text-white/60 text-sm">
              {fullscreenIndex + 1} / {fotos.length}
            </p>
          </div>

          {/* Navegação próxima */}
          {fullscreenIndex < fotos.length - 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                irParaProxima();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2"
            >
              <ChevronRight className="h-8 w-8 text-white" />
            </button>
          )}
        </div>
      )}
    </>
  );
}

// Exportar componente memoizado para evitar re-renders desnecessários
export default memo(DiarioFotoPreview);
