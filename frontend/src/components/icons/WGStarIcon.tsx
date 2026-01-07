import type { CSSProperties } from "react";

type WGStarIconProps = {
  className?: string;
  alt?: string;
  style?: CSSProperties;
};

const WG_STAR_SRC =
  "/imagens/logoscomfundotransparente/simbolo%20marcadores.png";

export default function WGStarIcon({
  className,
  alt = "WG",
  style,
}: WGStarIconProps) {
  return (
    <img
      src={WG_STAR_SRC}
      alt={alt}
      className={className ? `${className} w-2.5 h-2.5` : "w-2.5 h-2.5"}
      style={style}
    />
  );
}
