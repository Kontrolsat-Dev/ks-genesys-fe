// src/features/prices/catalog/components/catalog-filters-bar.tsx
import type { PriceChangeDirection } from "@/api/products";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, X, XCircle } from "lucide-react";

type CatalogFiltersBarProps = {
  direction: PriceChangeDirection;
  days: number;
  minAbsDelta: number | null;
  minPctDelta: number | null;
  onChangeDirection: (val: PriceChangeDirection) => void;
  onChangeDays: (val: number) => void;
  onChangeMinAbsDelta: (val: number | null) => void;
  onChangeMinPctDelta: (val: number | null) => void;
  error?: any;
};

type FilterFieldProps = {
  label: string;
  children: React.ReactNode;
};

function FilterField({ label, children }: FilterFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}

export default function CatalogFiltersBar({
  direction,
  days,
  minAbsDelta,
  minPctDelta,
  onChangeDirection,
  onChangeDays,
  onChangeMinAbsDelta,
  onChangeMinPctDelta,
  error,
}: CatalogFiltersBarProps) {
  const hasActiveFilters =
    direction !== "down" ||
    days !== 30 ||
    minAbsDelta !== 0 ||
    minPctDelta !== 5;

  const handleClearFilters = () => {
    onChangeDirection("down");
    onChangeDays(30);
    onChangeMinAbsDelta(0);
    onChangeMinPctDelta(5);
  };

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight">
              Movimentos de preço — Catálogo
            </h1>
            <p className="text-sm text-muted-foreground">
              Variações de preço em todos os produtos (importados ou não), com
              base no histórico do catálogo.
            </p>
          </div>

          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1.5 text-xs"
            >
              <XCircle className="h-3.5 w-3.5" />
              <span>Limpar filtros</span>
            </Button>
          )}
        </div>

        {/* Filters Section */}
        <div className="rounded-md border bg-muted/40 p-3">
          <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
            <span>Filtros de pesquisa</span>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            {/* Direção */}
            <FilterField label="Direção">
              <div className="relative">
                <Select
                  value={direction}
                  onValueChange={(val: PriceChangeDirection) =>
                    onChangeDirection(val)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Direção" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="down">Quedas</SelectItem>
                    <SelectItem value="up">Subidas</SelectItem>
                    <SelectItem value="both">Ambos</SelectItem>
                  </SelectContent>
                </Select>
                {direction !== "down" && (
                  <button
                    type="button"
                    onClick={() => onChangeDirection("down")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                    aria-label="Limpar direção"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </FilterField>

            {/* Janela (dias) */}
            <FilterField label="Janela (dias)">
              <div className="relative">
                <Select
                  value={String(days)}
                  onValueChange={(val) => onChangeDays(Number(val) || 30)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 dias</SelectItem>
                    <SelectItem value="30">30 dias</SelectItem>
                    <SelectItem value="90">90 dias</SelectItem>
                  </SelectContent>
                </Select>
                {days !== 30 && (
                  <button
                    type="button"
                    onClick={() => onChangeDays(30)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                    aria-label="Limpar janela"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </FilterField>

            {/* Mínimo € */}
            <FilterField label="Mín. variação (€)">
              <div className="relative">
                <Input
                  type="number"
                  step="0.01"
                  value={minAbsDelta ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    onChangeMinAbsDelta(val === "" ? null : Number(val));
                  }}
                  placeholder="0 para desligar"
                />
                {minAbsDelta !== 0 && minAbsDelta !== null && (
                  <button
                    type="button"
                    onClick={() => onChangeMinAbsDelta(0)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                    aria-label="Limpar variação €"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </FilterField>

            {/* Mínimo % */}
            <FilterField label="Mín. variação (%)">
              <div className="relative">
                <Input
                  type="number"
                  step="0.1"
                  value={minPctDelta ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    onChangeMinPctDelta(val === "" ? null : Number(val));
                  }}
                  placeholder="0 para desligar"
                />
                {minPctDelta !== 5 && minPctDelta !== null && (
                  <button
                    type="button"
                    onClick={() => onChangeMinPctDelta(5)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                    aria-label="Limpar variação %"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </FilterField>
          </div>
        </div>

        {/* Estado de erro */}
        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            Ocorreu um erro ao carregar os movimentos de preço do catálogo.
          </div>
        )}
      </div>
    </Card>
  );
}
