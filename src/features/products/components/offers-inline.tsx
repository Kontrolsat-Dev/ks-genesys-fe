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
        const stockNum = typeof o.stock === "number" ? o.stock : 0;
        const stockText = typeof o.stock === "number" ? `${o.stock} un.` : "—";
        const isOutOfStock = stockNum <= 0;

        const inner = o.supplier_image ? (
          <img
            src={o.supplier_image}
            alt={o.supplier_name ?? "fornecedor"}
            className={cn(
              "h-6 w-6 object-cover rounded",
              isOutOfStock && "opacity-50 grayscale"
            )}
            loading="lazy"
          />
        ) : (
          <div className={cn(
            "h-6 w-6 grid place-items-center rounded text-[9px] bg-muted",
            isOutOfStock && "opacity-50"
          )}>
            {(o.supplier_name || "??").slice(0, 2).toUpperCase()}
          </div>
        );

        return (
          <Tooltip key={`${o.id_supplier}-${i}`}>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "relative rounded overflow-hidden border transition",
                  isBest
                    ? "ring-2 ring-emerald-500 border-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.25)]"
                    : "border-border/40 hover:border-border",
                  isOutOfStock && !isBest && "border-destructive/50"
                )}
                role="img"
                aria-label={`${
                  o.supplier_name ?? "Fornecedor"
                } • ${stockText} • ${priceText}`}
              >
                {inner}
                {/* Out of stock indicator */}
                {isOutOfStock && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="absolute w-[140%] h-[2px] bg-destructive rotate-45" />
                  </div>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent className="text-xs">
              <div className="font-medium">
                {o.supplier_name ?? "Fornecedor"}
              </div>
              <div className={cn(isOutOfStock && "text-destructive font-medium")}>
                Stock: {stockText} {isOutOfStock && "(sem stock)"}
              </div>
              <div>Preço: {priceText}</div>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}

