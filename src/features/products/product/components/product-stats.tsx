import type { ProductStatsOut, OfferOut } from "@/api/products/types";
import { fmtDateShort } from "@/helpers/fmtDate";
import { fmtMoney } from "@/helpers/fmtPrices";
import { CheckCircle, Package } from "lucide-react";
import Stat from "./stat";

type ProductStatsProps = {
  stats?: ProductStatsOut;
  bestOffer?: OfferOut | null;
  activeOffer?: OfferOut | null;
  margin: number; // ex: 0.4 = 40%
};

function getPriceNumber(offer?: OfferOut | null): number | null {
  if (!offer?.price) return null;
  const num = Number.parseFloat(offer.price);
  if (!Number.isFinite(num)) return null;
  return num;
}

function formatPrice(offer?: OfferOut | null): string {
  const num = getPriceNumber(offer);
  if (num == null) return "—";
  return fmtMoney(String(num));
}

/**
 * Preço comunicado = preço base * (1 + margin)
 * Se margin = 0, mostramos o preço base.
 * Se num ou margin forem inválidos, devolve "—".
 */
function formatPriceWithMargin(
  offer: OfferOut | null | undefined,
  margin: number
): string {
  const base = getPriceNumber(offer);
  if (base == null) return "—";

  // se margin = 0.4 → fator 1.4 (40% em cima)
  const factor = Number.isFinite(margin) ? 1 + margin : 1;
  const finalPrice = base * factor;

  return fmtMoney(String(finalPrice));
}

function formatSupplier(offer?: OfferOut | null): string {
  if (!offer) return "—";
  return (
    offer.supplier_name ??
    (offer.id_supplier ? `Fornecedor #${offer.id_supplier}` : "—")
  );
}

function formatStock(offer?: OfferOut | null): string {
  if (typeof offer?.stock === "number") return String(offer.stock);
  return "—";
}

export default function ProductStats({
  stats,
  bestOffer,
  activeOffer,
  margin,
}: ProductStatsProps) {
  const lastChangeLabel =
    stats?.last_change_at != null
      ? fmtDateShort(stats.last_change_at)
      : "Sem alterações";

  const hasBest = !!bestOffer;
  const hasActive = !!activeOffer;

  return (
    <div className="space-y-4">
      {/* Header + cards de oferta */}
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        {/* Título + última alteração */}
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Estatísticas
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Última alteração registada: {lastChangeLabel}
          </p>
        </div>

        <div className="flex flex-col gap-3 md:flex-row">
          {/* Melhor oferta em stock */}
          {hasBest ? (
            <div
              title="Melhor oferta disponível em stock"
              className="group relative flex min-w-[220px] flex-col gap-2 rounded-xl border border-sky-400/70 bg-sky-50/80 px-4 py-3 shadow-sm ring-1 ring-sky-500/10 transition-all duration-200 dark:border-sky-500/60 dark:bg-sky-900/40"
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-800 dark:text-sky-200">
                  <CheckCircle className="h-4 w-4" />
                  Melhor oferta em stock
                </div>

                <div className="inline-flex items-baseline gap-1 rounded-full bg-white/80 px-3 py-1 text-sm font-semibold text-sky-900 shadow-sm dark:bg-sky-900/80 dark:text-sky-100">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-sky-500 dark:text-sky-300">
                    Preço
                  </span>
                  <span className="text-md leading-none">
                    {formatPrice(bestOffer)}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="flex items-center justify-between gap-3 text-xs text-sky-900/90 dark:text-sky-50/90">
                <div className="flex items-center gap-2">
                  <Package className="h-3.5 w-3.5 opacity-70" />
                  <span className="font-medium">
                    {formatSupplier(bestOffer)}
                  </span>
                </div>

                <div className="inline-flex items-center gap-1 rounded-full bg-sky-900/5 px-2.5 py-1 text-[11px] font-medium text-sky-900 dark:bg-sky-800/70 dark:text-sky-100">
                  <span className="opacity-80">Stock</span>
                  <span className="font-semibold">
                    {formatStock(bestOffer)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="
                flex min-w-[220px] flex-col items-center justify-center gap-1.5
                rounded-xl border border-dashed border-border/70
                bg-muted/40
                px-4 py-3
                text-center
              "
            >
              <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                <Package className="h-3.5 w-3.5 opacity-60" />
                Sem melhor oferta
              </div>
              <p className="text-[11px] text-muted-foreground/80">
                Nenhum fornecedor com stock elegível para melhor oferta.
              </p>
            </div>
          )}

          {/* Oferta comunicada (activeOffer) */}
          {hasActive ? (
            <div
              title="Oferta comunicada para o PrestaShop"
              className="group relative flex min-w-[220px] flex-col gap-2 rounded-xl border border-emerald-400/70 bg-emerald-50/80 px-4 py-3 shadow-sm ring-1 ring-emerald-500/10 transition-all duration-200 dark:border-emerald-500/60 dark:bg-emerald-900/40"
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-800 dark:text-emerald-200">
                  <CheckCircle className="h-4 w-4" />
                  Oferta comunicada
                </div>

                <div className="inline-flex items-baseline gap-1 rounded-full bg-white/80 px-3 py-1 text-sm font-semibold text-emerald-900 shadow-sm dark:bg-emerald-900/80 dark:text-emerald-100">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-emerald-500 dark:text-emerald-300">
                    Preço
                  </span>
                  <span className="text-md leading-none">
                    {formatPriceWithMargin(activeOffer, margin)}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="flex items-center justify-between gap-3 text-xs text-emerald-900/90 dark:text-emerald-50/90">
                <div className="flex items-center gap-2">
                  <Package className="h-3.5 w-3.5 opacity-70" />
                  <span className="font-medium">
                    {formatSupplier(activeOffer)}
                  </span>
                </div>

                <div className="inline-flex items-center gap-1 rounded-full bg-emerald-900/5 px-2.5 py-1 text-[11px] font-medium text-emerald-900 dark:bg-emerald-800/70 dark:text-emerald-100">
                  <span className="opacity-80">Stock enviado</span>
                  <span className="font-semibold">
                    {formatStock(activeOffer)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="
                flex min-w-[220px] flex-col items-center justify-center gap-1.5
                rounded-xl border border-dashed border-border/70
                bg-muted/40
                px-4 py-3
                text-center
              "
            >
              <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                <Package className="h-3.5 w-3.5 opacity-60" />
                Sem oferta comunicada
              </div>
              <p className="text-[11px] text-muted-foreground/80">
                Produto ainda não tem oferta ativa sincronizada com o
                PrestaShop.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Stats numéricos */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat
          title="Fornecedores"
          value={String(stats?.suppliers_count ?? 0)}
        />
        <Stat
          title="Ofertas c/ stock"
          value={String(stats?.offers_in_stock ?? 0)}
        />
        <Stat
          title="1ª vez visto"
          value={stats?.first_seen ? fmtDateShort(stats.first_seen) : "—"}
        />
        <Stat
          title="Última vez"
          value={stats?.last_seen ? fmtDateShort(stats.last_seen) : "—"}
        />
      </div>
    </div>
  );
}
