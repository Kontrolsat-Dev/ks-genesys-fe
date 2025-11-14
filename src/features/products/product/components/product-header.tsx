// src/features/products/product/components/product-header.tsx
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import type { ProductOut } from "@/api/products/types";
import { cx } from "@/lib/utils";
import { toast } from "sonner"; // <— feedback

type Props = {
  product?: ProductOut;
  onBack: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
};

async function copyText(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // fallback
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand("copy");
    } finally {
      document.body.removeChild(ta);
    }
  }
  toast.success(`${label} copiado para a área de transferência`);
}

function CopyBadge({
  label,
  value,
  variant = "outline",
}: {
  label: string;
  value: string;
  variant?: "outline" | "secondary" | "default" | "destructive";
}) {
  if (!value) return null;
  const onClick = () => copyText(value, label);
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };
  return (
    <Badge
      variant={variant}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={onKeyDown}
      title={`Copiar ${label}`}
      className="cursor-pointer select-none hover:opacity-90"
    >
      {label} {value}
    </Badge>
  );
}

export default function ProductHeader({
  product: p,
  onBack,
  onRefresh,
  isRefreshing,
}: Props) {
  return (
    <Card className="rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">
            {p?.name ?? (p ? `Produto #${p.id}` : "Produto")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {p?.brand_name ? (
              <span className="mr-2">
                Marca: <span className="font-medium">{p.brand_name}</span>
              </span>
            ) : null}
            {p?.category_name ? (
              <span>
                Categoria:{" "}
                <span className="font-medium">{p.category_name}</span>
              </span>
            ) : null}
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {p?.gtin && (
              <CopyBadge label="GTIN" value={p.gtin} variant="outline" />
            )}
            {p?.partnumber && (
              <CopyBadge
                label="MPN"
                value={String(p.partnumber)}
                variant="secondary"
              />
            )}
            {p?.id_ecommerce ? (
              <Badge variant="outline">E-commerce #{p.id_ecommerce}</Badge>
            ) : null}
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
          <Button onClick={onRefresh} className="gap-2">
            <RefreshCw
              className={cx("h-4 w-4", isRefreshing && "animate-spin")}
            />
            Refresh
          </Button>
        </div>
      </div>
    </Card>
  );
}
