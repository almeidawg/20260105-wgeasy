// src/components/ui/Card.tsx
import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card: React.FC<CardProps> = ({
  className = "",
  children,
  ...rest
}) => (
  <div className={`wg-card ${className}`} {...rest}>
    {children}
  </div>
);

export const CardHeader: React.FC<CardProps> = ({
  className = "",
  children,
  ...rest
}) => (
  <div className={`wg-card-header ${className}`} {...rest}>
    {children}
  </div>
);

export const CardTitle: React.FC<CardProps> = ({
  className = "",
  children,
  ...rest
}) => (
  <h2 className={`wg-card-title ${className}`} {...rest}>
    {children}
  </h2>
);

export const CardContent: React.FC<CardProps> = ({
  className = "",
  children,
  ...rest
}) => (
  <div className={`wg-card-content ${className}`} {...rest}>
    {children}
  </div>
);

export const CardDescription: React.FC<CardProps> = ({
  className = "",
  children,
  ...rest
}) => (
  <p className={`text-sm text-muted-foreground ${className}`} {...rest}>
    {children}
  </p>
);

export const CardFooter: React.FC<CardProps> = ({
  className = "",
  children,
  ...rest
}) => (
  <div className={`flex items-center p-6 pt-0 ${className}`} {...rest}>
    {children}
  </div>
);
