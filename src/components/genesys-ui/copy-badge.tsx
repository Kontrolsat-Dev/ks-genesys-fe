"use client";

import { Badge } from "@/components/ui/badge";
import { copyToClipboard } from "@/helpers/clipboard";
import { toast } from "sonner";

type CopyBadgeProps = {
  label: string;
  value: string;
  variant?: "outline" | "secondary" | "default" | "destructive";
};

/**
 * Badge that copies its value to clipboard when clicked
 */
export function CopyBadge({
  label,
  value,
  variant = "outline",
}: CopyBadgeProps) {
  if (!value) return null;

  const handleClick = async () => {
    const success = await copyToClipboard(value);
    if (success) {
      toast.success(`${label} copiado para a área de transferência`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <Badge
      variant={variant}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      title={`Copiar ${label}`}
      className="cursor-pointer select-none hover:opacity-80 transition-opacity"
    >
      {label} {value}
    </Badge>
  );
}
