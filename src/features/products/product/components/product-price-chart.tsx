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
} from "recharts";
import type { SeriesDailyPoint } from "@/api/products/types";
import { fmtMoney } from "./product-utils";

type Props = { points: SeriesDailyPoint[] };

export default function ProductPriceChart({ points }: Props) {
  const data = (points ?? []).map((r) => ({
    x: new Date(r.date).toLocaleDateString(),
    price: r.price ? Number(r.price) : null,
  }));

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">Evolução do preço</h3>
        <Badge variant="outline">
          pontos: {data.filter((d) => d.price != null).length}
        </Badge>
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
              <Line
                type="monotone"
                dataKey="price"
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
