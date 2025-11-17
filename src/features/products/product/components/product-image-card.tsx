import { Card } from "@/components/ui/card";
import type { ProductOut } from "@/api/products/types";
import { fmtDate } from "@/helpers/fmtDate";
import { fmtMargin } from "@/helpers/fmtNumbers";

type Props = { product?: ProductOut };

function StatItem({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1 p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors text-center justify-center">
      <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground text-center">
        {label}
      </div>
      <div
        className={cx(
          mono ? "font-mono" : "",
          "text-sm font-semibold text-foreground"
        )}
      >
        {value || "—"}
      </div>
    </div>
  );
}

import { cx } from "@/lib/utils";

export default function ProductImageCard({ product: p }: Props) {
  const marginStr = fmtMargin(p?.margin ?? null) ?? "—";

  return (
    <Card className="h-full flex flex-col p-6 space-y-4 border border-border">
      <div className="flex-1 flex items-center justify-center rounded-xl bg-gradient-to-br from-muted/50 to-muted/20 border border-border overflow-hidden">
        {p?.image_url ? (
          <img
            src={p.image_url || "/placeholder.svg"}
            alt={p?.name ?? "product"}
            className="h-full max-h-96 w-auto object-contain p-4"
          />
        ) : (
          <div className="text-sm text-muted-foreground flex items-center justify-center h-64">
            Sem imagem disponível
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <StatItem label="Criado" value={fmtDate(p?.created_at)} />
        <StatItem label="Atualizado" value={fmtDate(p?.updated_at)} />
        <StatItem label="Margem" value={marginStr} />
        <StatItem label="Categoria" value={p?.category_name || "—"} />
      </div>
    </Card>
  );
}
