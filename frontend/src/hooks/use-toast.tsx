// src/hooks/use-toast.tsx
// Hook para toasts usando sonner

import { useCallback } from "react";
import { toast as sonnerToast } from "sonner";

export interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success" | "warning" | "info";
}

export function useToast() {
  const toast = useCallback(({ title, description, variant = "default" }: ToastProps) => {
    const message = title || description || "";
    const descText = title && description ? description : undefined;

    switch (variant) {
      case "destructive":
        sonnerToast.error(message, { description: descText });
        break;
      case "success":
        sonnerToast.success(message, { description: descText });
        break;
      case "warning":
        sonnerToast.warning(message, { description: descText });
        break;
      case "info":
        sonnerToast.info(message, { description: descText });
        break;
      default:
        sonnerToast(message, { description: descText });
    }
  }, []);

  return { toast };
}

export { sonnerToast as toast };
