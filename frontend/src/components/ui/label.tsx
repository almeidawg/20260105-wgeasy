// src/components/ui/Label.tsx
import React from "react";

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label: React.FC<LabelProps> = ({ className = "", ...props }) => {
  return <label className={`wg-label ${className}`} {...props} />;
};
