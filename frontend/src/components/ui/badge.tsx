// ============================================================
// COMPONENTE UI: Badge
// Badge reutilizável com variantes de cor
// Sistema WG Easy - Grupo WG Almeida
// ============================================================

import React from "react";

export type BadgeVariant =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "outline"
  | "destructive";

export type BadgeSize = "sm" | "md" | "lg";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  size = "md",
  className = "",
  ...rest
}) => {
  const variants: Record<BadgeVariant, string> = {
    default: "bg-gray-100 text-gray-700",
    primary: "bg-[#F25C26] text-white",
    secondary: "bg-blue-100 text-blue-800",
    success: "bg-green-100 text-green-700",
    warning: "bg-orange-100 text-orange-700",
    error: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-700",
    outline: "border border-gray-200 text-gray-600 bg-transparent",
    destructive: "bg-red-100 text-red-700",
  };

  const sizes: Record<BadgeSize, string> = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {children}
    </span>
  );
};

export { Badge };
export default Badge;
