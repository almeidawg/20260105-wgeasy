import { ObraEtapa, STATUS_COLORS } from "@/types/etapas";

type Props = {
  etapa: ObraEtapa;
  showPercentage?: boolean;
  showStatus?: boolean;
  height?: number;
};

export default function EtapaProgress({
  etapa,
  showPercentage = true,
  showStatus = true,
  height = 8,
}: Props) {
  const percentual = etapa.percentual_concluido;
  const cor = STATUS_COLORS[etapa.status];

  return (
    <div className="etapa-progress-container">
      {showStatus && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            {etapa.titulo}
          </span>
          {showPercentage && (
            <span className="text-sm font-semibold" style={{ color: cor }}>
              {percentual}%
            </span>
          )}
        </div>
      )}

      <div
        className="etapa-progress-bar"
        style={{
          height: `${height}px`,
          backgroundColor: "#E5E7EB",
          borderRadius: "9999px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          className="etapa-progress-fill"
          style={{
            width: `${percentual}%`,
            height: "100%",
            backgroundColor: cor,
            transition: "width 0.3s ease-in-out",
            borderRadius: "9999px",
          }}
        />
      </div>
    </div>
  );
}
