import { TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { fmtPrice } from "@/helpers/fmtPrices";
import { Tooltip } from "@radix-ui/react-tooltip";
import type { OfferOut } from "@/api/products/types";
import { cn } from "@/lib/utils";

export default function OffersInline({
  offers,
  best,
}: {
  offers?: OfferOut[];
  best?: OfferOut | null;
}) {
  if (!offers || offers.length === 0)
    return <span className="text-xs text-muted-foreground">—</span>;
  const bestId = best?.id_supplier ?? null;

  return (
    <div className="inline-flex items-center gap-1.5 rounded-md bg-muted/40 px-1.5 py-1">
      {offers.map((o, i) => {
        const isBest = o.id_supplier === bestId;
        const priceNum = o.price != null ? Number.parseFloat(o.price) : NaN;
        const priceText = Number.isFinite(priceNum)
          ? fmtPrice(priceNum)
          : o.price ?? "—";
        const stockText = typeof o.stock === "number" ? `${o.stock} un.` : "—";

        const inner = o.supplier_image ? (
          <img
            src={o.supplier_image}
            alt={o.supplier_name ?? "fornecedor"}
            className="h-6 w-6 object-cover rounded"
            loading="lazy"
          />
        ) : (
          <div className="h-6 w-6 grid place-items-center rounded text-[9px] bg-muted">
            {(o.supplier_name || "??").slice(0, 2).toUpperCase()}
          </div>
        );

        return (
          <Tooltip key={`${o.id_supplier}-${i}`}>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "rounded overflow-hidden border transition",
                  isBest
                    ? "ring-2 ring-emerald-500 border-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.25)]"
                    : "border-border/40 hover:border-border"
                )}
                role="img"
                aria-label={`${
                  o.supplier_name ?? "Fornecedor"
                } • ${stockText} • ${priceText}`}
              >
                {inner}
              </div>
            </TooltipTrigger>
            <TooltipContent className="text-xs">
              <div className="font-medium">
                {o.supplier_name ?? "Fornecedor"}
              </div>
              <div>Stock: {stockText}</div>
              <div>Preço: {priceText}</div>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
