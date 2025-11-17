import { Card } from "@/components/ui/card";
import type { ProductStatsOut, OfferOut } from "@/api/products/types";
import { fmtDateShort } from "@/helpers/fmtDate";
import { fmtMoney } from "@/helpers/fmtPrices";

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
            title="Oferta comunicada para o prestashop"
            className="rounded-lg trannstion-all duration-200 border bg-green-400/20 border-green-400 text-black shaodw-primary hover:bg-primary/40 px-3 py-2 text-right text-xs dark:text-white min-w-[180px]"
          >
            <div className="flex items-center gap-1 text-md uppercase tracking-wide dark:text-white">
              Oferta Ativa:
              <div className="text-lg font-semibold">
                {fmtMoney(bestOffer?.price)}
              </div>
            </div>
            <div className="text-[14px]  mt-0.5">
              {bestOffer?.supplier_name ?? `#${bestOffer?.id_supplier}`} ·
              stock:{" "}
              {typeof bestOffer?.stock === "number" ? bestOffer.stock : "—"}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-center">
            <div className="text-xs ">Sem oferta ativa</div>
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
