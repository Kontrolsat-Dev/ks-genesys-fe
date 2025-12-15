import type { ProductStatsOut, OfferOut } from "@/api/products/types";
import { fmtDateShort } from "@/helpers/fmtDate";
import { fmtMoney } from "@/helpers/fmtPrices";
import { getPriceNumber, formatSupplier, formatStock } from "@/helpers/fmtOffers";
import { Zap, Radio, Package, TrendingUp, Clock, Users } from "lucide-react";
import Stat from "./stat";

type ProductStatsProps = {
  stats?: ProductStatsOut;
  bestOffer?: OfferOut | null;
  activeOffer?: OfferOut | null;
};

function formatPrice(offer?: OfferOut | null): string {
  const num = getPriceNumber(offer);
  if (num == null) return "—";
  return fmtMoney(String(num));
}

export default function ProductStats({
  stats,
  bestOffer,
  activeOffer,
}: ProductStatsProps) {
  const lastChangeLabel =
    stats?.last_change_at != null
      ? fmtDateShort(stats.last_change_at)
      : "Sem alterações";

  const hasBest = !!bestOffer;
  const hasActive = !!activeOffer;

  return (
    <div className="space-y-6">
      {/* Offer Cards - Vercel Style */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Best Offer Card */}
        <div className="group relative overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-foreground/20 hover:shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/10">
                <Zap className="h-3.5 w-3.5 text-blue-500" />
              </div>
              <span className="text-xs font-medium text-foreground">
                Melhor Oferta
              </span>
            </div>
            {hasBest && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-600 dark:text-blue-400">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                Em stock
              </span>
            )}
          </div>

          {/* Content */}
          {hasBest ? (
            <div className="p-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-2xl font-semibold tabular-nums text-foreground">
                    {formatPrice(bestOffer)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Custo do fornecedor
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium tabular-nums text-foreground">
                    {formatStock(bestOffer)} un.
                  </p>
                  <p className="text-[10px] text-muted-foreground">disponíveis</p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2">
                <Package className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {formatSupplier(bestOffer)}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Zap className="h-5 w-5 text-muted-foreground/60" />
              </div>
              <p className="mt-3 text-sm font-medium text-muted-foreground">
                Sem melhor oferta
              </p>
              <p className="mt-1 text-xs text-muted-foreground/70">
                Nenhum fornecedor com stock disponível
              </p>
            </div>
          )}
        </div>

        {/* Active Offer Card */}
        <div className="group relative overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-foreground/20 hover:shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10">
                <Radio className="h-3.5 w-3.5 text-emerald-500" />
              </div>
              <span className="text-xs font-medium text-foreground">
                Oferta Ativa
              </span>
            </div>
            {hasActive && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Sincronizado
              </span>
            )}
          </div>

          {/* Content */}
          {hasActive ? (
            <div className="p-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-2xl font-semibold tabular-nums text-foreground">
                    {formatPrice(activeOffer)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Preço no PrestaShop
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium tabular-nums text-foreground">
                    {formatStock(activeOffer)} un.
                  </p>
                  <p className="text-[10px] text-muted-foreground">enviados</p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2">
                <Package className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {formatSupplier(activeOffer)}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Radio className="h-5 w-5 text-muted-foreground/60" />
              </div>
              <p className="mt-3 text-sm font-medium text-muted-foreground">
                Sem oferta ativa
              </p>
              <p className="mt-1 text-xs text-muted-foreground/70">
                Produto não sincronizado com PrestaShop
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat
          icon={<Users className="h-4 w-4" />}
          title="Fornecedores"
          value={String(stats?.suppliers_count ?? 0)}
        />
        <Stat
          icon={<TrendingUp className="h-4 w-4" />}
          title="Ofertas c/ stock"
          value={String(stats?.offers_in_stock ?? 0)}
        />
        <Stat
          icon={<Clock className="h-4 w-4" />}
          title="1ª vez visto"
          value={stats?.first_seen ? fmtDateShort(stats.first_seen) : "—"}
        />
        <Stat
          icon={<Clock className="h-4 w-4" />}
          title="Última alteração"
          value={lastChangeLabel}
        />
      </div>
    </div>
  );
}

