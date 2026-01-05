// src/components/obras/ObrasTimeline.tsx
import { PessoaObra } from "@/lib/pessoasApi";
import ObraCardPremium from "./ObraCardPremium";

interface Props {
  obras: PessoaObra[];
}

const ObrasTimeline: React.FC<Props> = ({ obras }) => {
  const grupos = obras.reduce((map: any, obra) => {
    const ano = obra.data_inicio
      ? new Date(obra.data_inicio).getFullYear()
      : "Sem data";

    if (!map[ano]) map[ano] = [];
    map[ano].push(obra);

    return map;
  }, {});

  return (
    <div className="space-y-8">
      {Object.entries(grupos).map(([ano, lista]) => (
        <div key={ano}>
          <h2 className="text-lg font-bold text-[#2E2E2E] mb-4">{ano}</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 pl-4 border-l-2 border-[#F25C26]">
            {(lista as PessoaObra[]).map((obra) => (
              <ObraCardPremium key={obra.id} obra={obra} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ObrasTimeline;
