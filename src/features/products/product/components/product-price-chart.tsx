import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Maximize2 } from "lucide-react";
import type { ProductEventOut } from "@/api/products/types";
import { fmtMoney } from "@/helpers/fmtPrices";
import { cn } from "@/lib/utils";
import ChartExpandModal from "./chart-expand-modal";
import {
  useChartData,
  extractPrice,
  type ChartContentProps,
} from "./chart-utils";

type Props = { events: ProductEventOut[] };

function PriceChartContent({ events, filterDays, height = "h-64" }: ChartContentProps) {
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const { data, seriesMeta, totalPoints } = useChartData(events, filterDays, extractPrice);

  const toggleSeries = (key: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const LegendContent = (props: any) => {
    const payload = (props?.payload ?? []) as Array<{
      value: string;
      color: string;
      dataKey: string;
    }>;
    return (
      <ul className="flex flex-wrap gap-2 text-xs mt-4 justify-center">
        {payload.map((entry) => {
          const isHidden = hidden.has(entry.dataKey);
          return (
            <li
              key={entry.dataKey}
              className={cn(
                "flex items-center gap-1.5 cursor-pointer select-none px-2 py-1 rounded transition-colors",
                isHidden 
                  ? "opacity-40 hover:opacity-60" 
                  : "hover:bg-muted"
              )}
              onClick={() => toggleSeries(entry.dataKey)}
            >
              <span
                className={cn("inline-block h-2.5 w-2.5 rounded-sm", isHidden && "bg-muted-foreground")}
                style={{ background: isHidden ? undefined : entry.color }}
              />
              <span 
                className={cn("font-medium", isHidden && "line-through")}
                style={{ color: isHidden ? "var(--muted-foreground)" : entry.color }}
              >
                {entry.value}
              </span>
            </li>
          );
        })}
        <li className="text-muted-foreground ml-2">({totalPoints} pts)</li>
      </ul>
    );
  };

  if (data.length === 0) {
    return (
      <div className={cn("text-sm text-muted-foreground flex items-center justify-center", height)}>
        Sem dados disponíveis
      </div>
    );
  }

  return (
    <div className={height}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="x"
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            interval="preserveStartEnd"
          />
          <YAxis 
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            tickFormatter={(v) => fmtMoney(String(v))}
          />
          <Tooltip
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              color: "var(--foreground)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
            labelStyle={{ color: "var(--muted-foreground)" }}
            itemStyle={{ color: "var(--foreground)" }}
            cursor={{ fill: "var(--muted)" }}
            formatter={(val: any) => val == null ? "—" : fmtMoney(String(val))}
            labelFormatter={(l) => `${l}`}
          />
          <Legend content={<LegendContent />} />
          {seriesMeta.map(({ key, name, color }) => (
            <Line
              key={key}
              type="stepAfter"
              dataKey={key}
              name={name}
              hide={hidden.has(key)}
              dot={{ r: 2, fill: color, strokeWidth: 0 }}
              activeDot={{ r: 4, fill: color, strokeWidth: 2, stroke: "var(--background)" }}
              strokeWidth={2}
              isAnimationActive
              connectNulls
              stroke={color}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function ProductPriceChart({ events }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <Card className="p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Evolução do Preço
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">Últimos 90 dias</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setExpanded(true)}
            title="Expandir gráfico"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
        
        <PriceChartContent events={events} filterDays={90} height="h-56" />
      </Card>

      <ChartExpandModal
        open={expanded}
        onOpenChange={setExpanded}
        title="Evolução do Preço por Fornecedor"
        subtitle="Clica nos fornecedores para mostrar/esconder"
      >
        {({ filterDays }) => (
          <PriceChartContent events={events} filterDays={filterDays} height="h-full" />
        )}
      </ChartExpandModal>
    </>
  );
}


