// src/components/obras/ObraClienteCard.tsx
interface ObraClienteCardProps {
  titulo: string;
  cliente: string;
  status: string;
  ambientes?: number;
  metros_totais?: number;
  onClick?: () => void;
}

const ObraClienteCard: React.FC<ObraClienteCardProps> = ({
  titulo,
  cliente,
  status,
  ambientes,
  metros_totais,
  onClick,
}) => {
  return (
    <div
      className="rounded-2xl bg-white p-4 shadow-sm border border-[#E5E5E5] cursor-pointer hover:shadow-md transition"
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="text-sm font-semibold text-[#2E2E2E]">
            {titulo}
          </div>
          <div className="text-xs text-[#7A7A7A]">{cliente}</div>
        </div>
        <span className="rounded-full bg-[#F3F3F3] px-3 py-1 text-[11px] text-[#4C4C4C]">
          {status}
        </span>
      </div>

      <div className="mt-3 flex justify-between text-[11px] text-[#7A7A7A]">
        <span>{ambientes != null ? `${ambientes} ambientes` : ""}</span>
        <span>
          {metros_totais != null ? `${metros_totais.toFixed(1)} m² totais` : ""}
        </span>
      </div>
    </div>
  );
};

export default ObraClienteCard;
