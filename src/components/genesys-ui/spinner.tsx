// src/components/genesys-ui/spinner.tsx
// Componente de loading spinner reutilizável

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type SpinnerSize = "xs" | "sm" | "md" | "lg" | "xl";

const sizeClasses: Record<SpinnerSize, string> = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-8 w-8",
};

type SpinnerProps = {
  /** Tamanho do spinner */
  size?: SpinnerSize;
  /** Classes CSS adicionais */
  className?: string;
  /** Texto a mostrar após o spinner */
  text?: string;
};

export function Spinner({ size = "sm", className, text }: SpinnerProps) {
  return (
    <>
      <Loader2 className={cn(sizeClasses[size], "animate-spin", className)} />
      {text && <span>{text}</span>}
    </>
  );
}

/**
 * Spinner centrado para loading pages/sections
 */
export function SpinnerCentered({
  size = "lg",
  className,
  text,
}: SpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <Spinner size={size} className={cn("text-muted-foreground", className)} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
}
