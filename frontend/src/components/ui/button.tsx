import React, { forwardRef, isValidElement, cloneElement } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "outline"
  | "default"
  | "destructive"
  | "success";

type ButtonSize = "sm" | "md" | "lg" | "icon" | "default";

export type { ButtonSize };

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, children, asChild = false, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-medium rounded-full transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-black/10 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants: Record<ButtonVariant, string> = {
      primary: "bg-[#F25C26] text-white hover:bg-[#D94E1F] shadow-sm hover:shadow-md",
      secondary:
        "bg-gray-100 text-gray-900 border border-gray-200 hover:bg-gray-200",
      ghost: "bg-transparent text-gray-700 hover:bg-black/5",
      outline:
        "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50",
      default:
        "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50",
      destructive:
        "bg-red-600 text-white hover:bg-red-700 focus:ring-red-300",
      success:
        "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-300",
    };

    const sizes: Record<ButtonSize, string> = {
      sm: "text-xs px-3 py-1.5",
      md: "text-sm px-4 py-2",
      lg: "text-base px-5 py-3",
      icon: "p-2 rounded-full",
      default: "text-sm px-4 py-2",
    };

    const classNames = clsx(base, variants[variant], sizes[size], className);

    if (asChild) {
      if (isValidElement(children)) {
        return cloneElement(children as React.ReactElement, {
          className: clsx((children as any).props?.className, classNames),
          ref,
        });
      }
      return <>{children}</>;
    }

    return (
      <button
        ref={ref}
        className={classNames}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
