// ============================================================
// COMPONENTE UI: Loading
// Indicador de carregamento reutilizável
// Sistema WG Easy - Grupo WG Almeida
// ============================================================

import React from "react";

export type LoadingSize = "sm" | "md" | "lg" | "xl";
export type LoadingVariant = "spinner" | "dots" | "pulse";

interface LoadingProps {
  size?: LoadingSize;
  variant?: LoadingVariant;
  text?: string;
  fullscreen?: boolean;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({
  size = "md",
  variant = "spinner",
  text,
  fullscreen = false,
  className = "",
}) => {
  const sizes: Record<LoadingSize, string> = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const renderLoading = () => {
    switch (variant) {
      case "spinner":
        return (
          <div
            className={`animate-spin rounded-full border-2 border-[#F25C26] border-t-transparent ${sizes[size]}`}
          />
        );

      case "dots":
        return (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#F25C26] rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-[#F25C26] rounded-full animate-bounce delay-75" />
            <div className="w-2 h-2 bg-[#F25C26] rounded-full animate-bounce delay-150" />
          </div>
        );

      case "pulse":
        return (
          <div className={`bg-[#F25C26] rounded-full animate-pulse ${sizes[size]}`} />
        );

      default:
        return null;
    }
  };

  const content = (
    <div className="flex flex-col items-center gap-3">
      {renderLoading()}
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/90 z-50">
        {content}
      </div>
    );
  }

  return <div className={`flex items-center justify-center ${className}`}>{content}</div>;
};

export default Loading;
