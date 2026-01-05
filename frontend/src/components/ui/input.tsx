// src/components/ui/Input.tsx
import React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="wg-input-wrapper">
        {label && (
          <label className="wg-input-label" htmlFor={props.id}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`wg-input ${error ? "wg-input-error" : ""} ${className}`}
          {...props}
        />
        {error && <p className="wg-input-error-text">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
