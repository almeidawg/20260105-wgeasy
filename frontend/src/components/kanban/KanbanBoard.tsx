// src/components/kanban/KanbanBoard.tsx
import React from "react";
import KanbanCard, { KanbanCardData } from "./KanbanCard";

// Re-exportar para compatibilidade com código existente
export type { KanbanCardData as KanbanCard };

export interface KanbanColuna {
  id: string;
  titulo: string;
  cards: KanbanCardData[];
}

interface KanbanBoardProps {
  colunas: KanbanColuna[];
  onCardClick?: (card: KanbanCardData) => void;
  onMoveCard?: (cardId: string, colunaDestinoId: string) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  colunas,
  onCardClick,
  onMoveCard,
}) => {
  function handleDrop(e: React.DragEvent<HTMLDivElement>, colunaId: string) {
    e.preventDefault();
    const cardId = e.dataTransfer.getData("cardId");
    if (cardId && onMoveCard) {
      onMoveCard(cardId, colunaId);
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-5">
      {colunas.map((col) => (
        <div
          key={col.id}
          className="flex flex-col rounded-2xl bg-[#F5F5F5] p-3 border border-[#E3E3E3]"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, col.id)}
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4C4C4C]">
              {col.titulo}
            </div>
            <div className="rounded-full bg-white px-2 py-[2px] text-[10px] text-[#7A7A7A]">
              {col.cards.length}
            </div>
          </div>

          <div className="flex-1 space-y-3">
            {col.cards.map((card) => (
              <KanbanCard
                key={card.id}
                card={card}
                onClick={() => onCardClick && onCardClick(card)}
                onDragStart={(e) => e.dataTransfer.setData("cardId", card.id)}
                draggable
              />
            ))}

            {col.cards.length === 0 && (
              <div className="rounded-xl border border-dashed border-[#D6D6D6] bg-white/40 p-3 text-[11px] text-[#9A9A9A]">
                Arraste cards para cá.
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard;