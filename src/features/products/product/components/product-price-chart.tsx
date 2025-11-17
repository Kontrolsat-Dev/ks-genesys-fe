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
import { fmtMoney } from "@/helpers/fmtPrices";
import { getColor } from "@/constants/colors";

function dayKey(d: string) {
  const dt = new Date(d);
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

type SeriesMeta = {
  key: string;
  supplierId: number;
  name: string;
  color: string;
};

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
    ([id, name], idx) => ({
      key: `s_${id}`,
      supplierId: id,
      name,
      color: getColor(idx),
    })
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

  const LegendContent = (props: any) => {
    const payload = (props?.payload ?? []) as Array<{
      value: string;
      color: string;
      dataKey: string;
    }>;
    return (
      <ul className="flex flex-wrap gap-3 text-xs mt-4">
        {payload.map((entry) => (
          <li key={entry.dataKey} className="flex items-center gap-1">
            <span
              className="inline-block h-2 w-2 rounded"
              style={{ background: entry.color }}
            />
            <span style={{ color: entry.color }} className="font-medium">
              {entry.value}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Card className="p-6 border border-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Evolução do Preço por Fornecedor
          </h3>
          <p className="text-xs text-muted-foreground mt-1">Últimos 90 dias</p>
        </div>
        <Badge variant="secondary" className="text-xs">
          {totalPoints} pontos
        </Badge>
      </div>
      <div className="h-64">
        {data.length === 0 ? (
          <div className="text-sm text-muted-foreground h-full flex items-center justify-center">
            Sem dados disponíveis
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="x"
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              />
              <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  color: "var(--foreground)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
                wrapperClassName="recharts-tooltip-wrapper"
                labelStyle={{ color: "var(--muted-foreground)" }}
                itemStyle={{ color: "var(--foreground)" }}
                cursor={{ fill: "var(--muted)" }}
                formatter={(val: any) =>
                  val == null ? "—" : fmtMoney(String(val))
                }
                labelFormatter={(l) => `Dia ${l}`}
              />
              <Legend content={<LegendContent />} />
              {seriesMeta.map(({ key, name, color }) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={name}
                  dot={false}
                  strokeWidth={2}
                  isAnimationActive
                  connectNulls
                  stroke={color}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
