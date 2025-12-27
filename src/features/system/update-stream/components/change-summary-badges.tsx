import type { CatalogUpdateStreamItem } from "@/api/catalog-update-stream";
import { fmtPrice } from "@/helpers/fmtPrices";
import { fmtMargin } from "@/helpers/fmtNumbers";
import { Euro, Package, Percent } from "lucide-react";

export default function ChangeSummaryBadges({
  item,
}: {
  item: CatalogUpdateStreamItem;
}) {
  const p = item.payload?.product;
  const ao = item.payload?.active_offer;

  const hasMargin = typeof p?.margin === "number";
  const hasPrice = typeof ao?.unit_price_sent === "number";
  const hasStock = typeof ao?.stock_sent === "number";

  if (!hasMargin && !hasPrice && !hasStock) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {hasPrice && (
        <div className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
          <Euro className="h-3 w-3" />
          <span>{fmtPrice(ao!.unit_price_sent!)}</span>
        </div>
      )}
      {hasStock && (
        <div className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-1 text-[11px] font-medium text-blue-700 dark:text-blue-400">
          <Package className="h-3 w-3" />
          <span>{ao!.stock_sent} un.</span>
        </div>
      )}
      {hasMargin && (
        <div className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-1 text-[11px] font-medium text-amber-700 dark:text-amber-400">
          <Percent className="h-3 w-3" />
          <span>{fmtMargin(p!.margin!)}</span>
        </div>
      )}
    </div>
  );
}
