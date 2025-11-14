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

export default function ProductStockChart({ events }: Props) {
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

    const stockNum =
      typeof e.stock === "number" && Number.isFinite(e.stock) ? e.stock : null;

    if (typeof e.id_supplier === "number") {
      perSup.set(e.id_supplier, stockNum);
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

  // Legend custom para colorir também o texto
  const LegendContent = (props: any) => {
    const payload = (props?.payload ?? []) as Array<{
      value: string;
      color: string;
      dataKey: string;
    }>;
    return (
      <ul className="flex flex-wrap gap-3 text-xs">
        {payload.map((entry) => (
          <li key={entry.dataKey} className="flex items-center gap-1">
            <span
              className="inline-block h-2 w-2 rounded"
              style={{ background: entry.color }}
            />
            <span style={{ color: entry.color }}>{entry.value}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">
          Evolução do stock por fornecedor
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
                contentStyle={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  color: "var(--popover-foreground)",
                  boxShadow: "0 8px 24px var(--background)",
                }}
                wrapperClassName="recharts-tooltip-wrapper"
                labelStyle={{ color: "var(--muted-foreground)" }}
                itemStyle={{ color: "var(--foreground)" }}
                cursor={{ fill: "var(--muted)" }}
                formatter={(val: any) => (val == null ? "—" : String(val))}
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
                  strokeWidth={1.75}
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
