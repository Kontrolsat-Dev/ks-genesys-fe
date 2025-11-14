import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { ProductStats } from "@/api/products/types";
import { fmtDateShort } from "./product-utils";

type Props = { stats?: ProductStats };

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/20 p-3">
      <div className="text-xs text-muted-foreground">{title}</div>
      <div className="text-lg font-semibold mt-1">{value}</div>
    </div>
  );
}

export default function ProductStats({ stats }: Props) {
  return (
    <Card className="p-6 space-y-4">
      <h3 className="text-sm font-medium">Estatísticas</h3>
      <div className="grid grid-cols-4 gap-3">
        <Stat
          title="Fornecedores"
          value={String(stats?.suppliers_count ?? 0)}
        />
        <Stat
          title="Ofertas c/ stock"
          value={String(stats?.offers_in_stock ?? 0)}
        />
        <Stat title="1ª vez visto" value={fmtDateShort(stats?.first_seen)} />
        <Stat title="Última vez" value={fmtDateShort(stats?.last_seen)} />
      </div>
      <Separator />
      <div className="text-xs text-muted-foreground">
        {stats?.last_change_at
          ? `Última alteração: ${fmtDateShort(stats.last_change_at)}`
          : "Sem alterações registadas"}
      </div>
    </Card>
  );
}
