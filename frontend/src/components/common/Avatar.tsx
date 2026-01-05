import React from "react";
import {
  gerarAvatarUrl,
  gerarCorPorNome,
  gerarIniciais,
  obterAvatarUrl,
} from "@/utils/avatarUtils";

interface AvatarProps {
  nome: string;
  avatar_url?: string | null;
  foto_url?: string | null;
  avatar?: string | null;
  size?: number; // px
  tamanho?: number; // alias para compatibilidade
  className?: string;
  onClick?: () => void;
}

const Avatar: React.FC<AvatarProps> = ({
  nome,
  avatar_url,
  foto_url,
  avatar,
  size,
  tamanho,
  className = "",
  onClick,
}) => {
  const finalSize = size ?? tamanho ?? 40;
  const hasImage = !!(avatar_url || foto_url || avatar);

  if (!nome) nome = "Sem Nome";

  // Se não houver imagem, geramos iniciais com cor WG
  if (!hasImage) {
    const bg = "#" + gerarCorPorNome(nome);
    const iniciais = gerarIniciais(nome);

    return (
      <div
        onClick={onClick}
        style={{ width: finalSize, height: finalSize, backgroundColor: bg }}
        className={`inline-flex items-center justify-center rounded-full text-xs font-semibold text-white select-none cursor-pointer ${className}`}
      >
        {iniciais}
      </div>
    );
  }

  const url = obterAvatarUrl(nome, avatar_url, foto_url, avatar);

  return (
    <img
      src={url || gerarAvatarUrl(nome)}
      alt={nome}
      onClick={onClick}
      style={{ width: finalSize, height: finalSize }}
      className={`rounded-full object-cover cursor-pointer ${className}`}
    />
  );
};

export default Avatar;
