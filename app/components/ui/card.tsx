// components/ui/card.tsx
import React from "react";

type CardProps = React.HTMLAttributes<HTMLDivElement>;
type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>;
type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      {...props}
      className={`rounded-xl border bg-white shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "", ...props }: CardHeaderProps) {
  return (
    <div {...props} className={`border-b p-6 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "", ...props }: CardTitleProps) {
  return (
    <h3 {...props} className={`text-xl font-semibold ${className}`}>
      {children}
    </h3>
  );
}

export function CardContent({
  children,
  className = "",
  ...props
}: CardProps) {
  return (
    <div {...props} className={`p-6 ${className}`}>
      {children}
    </div>
  );
}