// src/features/products/product/components/ProductImageCard.tsx
import { Card } from "@/components/ui/card";
import type { ProductOut, OfferOut } from "@/api/products/types";
import { fmtDate } from "@/helpers/fmtDate";
import { fmtMargin } from "@/helpers/fmtNumbers";
import { StatItem } from "./fields";
import MarginUpdate from "./margin-update";

type Props = {
  product?: ProductOut;
  offers?: OfferOut[];
};

export default function ProductImageCard({ product: p, offers = [] }: Props) {
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
        <StatItem mono label="Criado" value={fmtDate(p?.created_at)} />
        <StatItem mono label="Atualizado" value={fmtDate(p?.updated_at)} />

        {p ? (
          <MarginUpdate product={p} offers={offers}>
            <StatItem
              label="Margem"
              value={marginStr}
              className="cursor-pointer h-full"
            />
          </MarginUpdate>
        ) : (
          <StatItem label="Margem" value={marginStr} />
        )}

        <StatItem
          link
          label="Categoria"
          value={p?.category_name || "—"}
          target={`/products?id_category=${p?.id_category}`}
        />
      </div>
    </Card>
  );
}
