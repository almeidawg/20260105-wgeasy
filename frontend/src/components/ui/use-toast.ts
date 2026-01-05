// ============================================================
// HOOK: useToast
// Sistema WG Easy — inspirado no shadcn/ui
// ============================================================

import { createContext, useContext } from "react";

export type ToastType = "success" | "error" | "warning" | "info" | "destructive";

export interface Toast {
  id?: string;
  title?: string;
  description?: string;
  type?: ToastType;
  variant?: ToastType;
  duration?: number;
}

type ToastInput = string | Partial<Omit<Toast, "type">>;

export type ToastFn = ((props: Toast) => void) & {
  success(message: ToastInput): void;
  error(message: ToastInput): void;
  warning(message: ToastInput): void;
  info(message: ToastInput): void;
};

export interface ToastContextType {
  toast: ToastFn;
}

export const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);

  if (!ctx) {
    throw new Error("useToast deve ser usado dentro de <ToastProvider>");
  }

  return ctx;
}
