// src/components/kanban/ClientesKanban.tsx
interface KanbanCard {
  id: string;
  titulo: string;
  cliente: string;
  status: string;
  ambientes?: number;
  metros_totais?: number;
}

interface KanbanColuna {
  id: string;
  titulo: string;
  cards: KanbanCard[];
}

interface Props {
  colunas: KanbanColuna[];
}

const ClientesKanban: React.FC<Props> = ({ colunas }) => {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {colunas.map((col) => (
        <div key={col.id} className="rounded-2xl bg-[#F5F5F5] p-3">
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#4C4C4C]">
            {col.titulo}
          </div>

          <div className="space-y-3">
            {col.cards.map((card) => (
              <div
                key={card.id}
                className="rounded-xl bg-white p-3 shadow-sm border border-[#E5E5E5] cursor-pointer hover:shadow-md transition"
              >
                <div className="text-sm font-semibold text-[#2E2E2E]">
                  {card.titulo}
                </div>
                <div className="text-xs text-[#7A7A7A]">{card.cliente}</div>

                <div className="mt-2 flex justify-between text-[11px] text-[#7A7A7A]">
                  <span>
                    {card.ambientes != null
                      ? `${card.ambientes} amb.`
                      : ""}
                  </span>
                  <span>
                    {card.metros_totais != null
                      ? `${card.metros_totais.toFixed(1)} m²`
                      : ""}
                  </span>
                </div>
              </div>
            ))}

            {col.cards.length === 0 && (
              <div className="rounded-xl border border-dashed border-[#DDDDDD] bg-white/60 p-3 text-[11px] text-[#7A7A7A]">
                Nenhum cliente nesta coluna.
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ClientesKanban;

