import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import type { ProductEventOut } from "@/api/products/types";
import { fmtMoney } from "./product-utils";

// YYYY-MM-DD
function dayKey(d: string) {
  const dt = new Date(d);
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

type SeriesMeta = { key: string; supplierId: number; name: string };

type Props = { events: ProductEventOut[] };

export default function ProductPriceChart({ events }: Props) {
  const suppliers = new Map<number, string>();
  for (const e of events ?? []) {
    if (typeof e.id_supplier === "number") {
      suppliers.set(e.id_supplier, e.supplier_name ?? `#${e.id_supplier}`);
    }
  }

  const byDay = new Map<string, Map<number, number | null>>();
  for (const e of events ?? []) {
    const key = dayKey(e.created_at);
    if (!byDay.has(key)) byDay.set(key, new Map());
    const perSup = byDay.get(key)!;

    // preço -> number | null (evitar NaN)
    let priceNum: number | null = null;
    if (e.price != null && String(e.price).trim() !== "") {
      const n = Number(String(e.price).replace(",", "."));
      priceNum = Number.isFinite(n) ? n : null;
    }

    if (typeof e.id_supplier === "number") {
      perSup.set(e.id_supplier, priceNum);
    }
  }

  const days = Array.from(byDay.keys()).sort();
  const seriesMeta: SeriesMeta[] = Array.from(suppliers.entries()).map(
    ([id, name]) => ({ key: `s_${id}`, supplierId: id, name })
  );

  const data = days.map((k) => {
    const label = new Date(k).toLocaleDateString();
    const row: Record<string, any> = { x: label };
    const perSup = byDay.get(k)!;
    for (const { supplierId, key } of seriesMeta) {
      row[key] = perSup.has(supplierId) ? perSup.get(supplierId) : null;
    }
    return row;
  });

  const totalPoints =
    data.reduce(
      (acc, row) =>
        acc + seriesMeta.reduce((n, s) => (row[s.key] != null ? n + 1 : n), 0),
      0
    ) ?? 0;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">
          Evolução do preço por fornecedor
        </h3>
        <Badge variant="outline">pontos: {totalPoints}</Badge>
      </div>
      <div className="h-64">
        {data.length === 0 ? (
          <div className="text-sm text-muted-foreground h-full flex items-center justify-center">
            Sem dados
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(val: any) =>
                  val == null ? "—" : fmtMoney(String(val))
                }
                labelFormatter={(l) => `Dia ${l}`}
              />
              <Legend />
              {seriesMeta.map(({ key, name }) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={name}
                  dot={false}
                  strokeWidth={2}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
