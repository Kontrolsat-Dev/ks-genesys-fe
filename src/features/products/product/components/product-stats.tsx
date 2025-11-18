import type { ProductStatsOut, OfferOut } from "@/api/products/types";
import { fmtDateShort } from "@/helpers/fmtDate";
import { fmtMoney } from "@/helpers/fmtPrices";
import { CheckCircle, Package } from "lucide-react";

type Props = { stats?: ProductStatsOut; bestOffer?: OfferOut | null };

function Stat({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors p-4">
      <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
        {title}
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
    </div>
  );
}

export default function ProductStats({ stats, bestOffer }: Props) {
  const lastChange =
    stats?.last_change_at != null
      ? `${fmtDateShort(stats.last_change_at)}`
      : "Sem alterações";

  const hasBest = !!bestOffer;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Estatísticas
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Última actualização: {lastChange}
          </p>
        </div>

        {hasBest ? (
          <div
            title="Oferta comunicada para o PrestaShop"
            className="group relative flex flex-col gap-2 rounded-xl border border-emerald-400/70 bg-emerald-50/80 px-4 py-3 shadow-sm ring-1 ring-emerald-500/10 transition-all duration-200 dark:border-emerald-500/60 dark:bg-emerald-900/40"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-800 dark:text-emerald-200">
                <CheckCircle className="h-4 w-4" />
                Oferta ativa
              </div>

              <div className="inline-flex items-baseline gap-1 rounded-full bg-white/80 px-3 py-1 text-sm font-semibold text-emerald-900 shadow-sm dark:bg-emerald-900/80 dark:text-emerald-100">
                <span className="text-[11px] font-medium uppercase tracking-wide text-emerald-500 dark:text-emerald-300">
                  Preço
                </span>
                <span className="text-lg leading-none">
                  {fmtMoney(bestOffer?.price)}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="flex items-center justify-between gap-3 text-xs text-emerald-900/90 dark:text-emerald-50/90">
              <div className="flex items-center gap-2">
                <Package className="h-3.5 w-3.5 opacity-70" />
                <span className="font-medium">
                  {bestOffer?.supplier_name ??
                    `Fornecedor #${bestOffer?.id_supplier}`}
                </span>
              </div>

              <div className="inline-flex items-center gap-1 rounded-full bg-emerald-900/5 px-2.5 py-1 text-[11px] font-medium text-emerald-900 dark:bg-emerald-800/70 dark:text-emerald-100">
                <span className="opacity-80">Stock</span>
                <span className="font-semibold">
                  {typeof bestOffer?.stock === "number" ? bestOffer.stock : "—"}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="
      flex min-w-[200px] flex-col items-center justify-center gap-1.5
      rounded-xl border border-dashed border-border/70
      bg-muted/40
      px-4 py-3
      text-center
    "
          >
            <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              <Package className="h-3.5 w-3.5 opacity-60" />
              Sem oferta ativa
            </div>
            <p className="text-[11px] text-muted-foreground/80">
              Nenhum fornecedor com stock selecionado para este produto.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat
          title="Fornecedores"
          value={String(stats?.suppliers_count ?? 0)}
        />
        <Stat
          title="Ofertas c/ Stock"
          value={String(stats?.offers_in_stock ?? 0)}
        />
        <Stat title="1ª vez visto" value={fmtDateShort(stats?.first_seen)} />
        <Stat title="Última vez" value={fmtDateShort(stats?.last_seen)} />
      </div>
    </div>
  );
}
