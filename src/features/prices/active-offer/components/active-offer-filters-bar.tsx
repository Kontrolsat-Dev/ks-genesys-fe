// src/features/prices/active-offer/components/active-offer-filters-bar.tsx
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

type ActiveOfferFiltersBarProps = {
  direction: PriceChangeDirection;
  days: number;
  minAbsDelta: number | undefined;
  minPctDelta: number | undefined;
  pageSize: number;
  onChangeDirection: (val: PriceChangeDirection) => void;
  onChangeDays: (val: number) => void;
  onChangeMinAbsDelta: (val: number | undefined) => void;
  onChangeMinPctDelta: (val: number | undefined) => void;
  onChangePageSize: (val: number) => void;
  onResetFilters: () => void;
  isFetching: boolean;
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

export default function ActiveOfferFiltersBar({
  direction,
  days,
  minAbsDelta,
  minPctDelta,
  pageSize,
  onChangeDirection,
  onChangeDays,
  onChangeMinAbsDelta,
  onChangeMinPctDelta,
  onChangePageSize,
  onResetFilters,
  isFetching,
  error,
}: ActiveOfferFiltersBarProps) {
  const hasActiveFilters =
    direction !== "down" ||
    days !== 7 ||
    minAbsDelta !== undefined ||
    minPctDelta !== undefined ||
    pageSize !== 50;

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight">
              Movimentos – Ofertas ativas
            </h1>
            <p className="text-sm text-muted-foreground">
              Variações de preço na oferta ativa (loja) nos últimos dias.
            </p>
          </div>

          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              disabled={isFetching}
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

          <div className="grid gap-3 md:grid-cols-5">
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
                    <SelectValue placeholder="Sentido" />
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
            <FilterField label="Janela">
              <div className="relative">
                <Select
                  value={String(days)}
                  onValueChange={(val) => onChangeDays(Number(val))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Janela" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Últimos 7 dias</SelectItem>
                    <SelectItem value="30">Últimos 30 dias</SelectItem>
                    <SelectItem value="90">Últimos 90 dias</SelectItem>
                  </SelectContent>
                </Select>
                {days !== 7 && (
                  <button
                    type="button"
                    onClick={() => onChangeDays(7)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                    aria-label="Limpar janela"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </FilterField>

            {/* Mínimo € */}
            <FilterField label="Δ mínimo (€)">
              <div className="relative">
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="Opcional"
                  value={minAbsDelta ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    onChangeMinAbsDelta(v === "" ? undefined : Number(v));
                  }}
                />
                {minAbsDelta !== undefined && (
                  <button
                    type="button"
                    onClick={() => onChangeMinAbsDelta(undefined)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                    aria-label="Limpar Δ €"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </FilterField>

            {/* Mínimo % */}
            <FilterField label="Δ mínimo (%)">
              <div className="relative">
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="Opcional"
                  value={minPctDelta ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    onChangeMinPctDelta(v === "" ? undefined : Number(v));
                  }}
                />
                {minPctDelta !== undefined && (
                  <button
                    type="button"
                    onClick={() => onChangeMinPctDelta(undefined)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                    aria-label="Limpar Δ %"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </FilterField>

            {/* Page Size */}
            <FilterField label="Por página">
              <div className="relative">
                <Select
                  value={String(pageSize)}
                  onValueChange={(val) => onChangePageSize(Number(val))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Por página" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25 / pág.</SelectItem>
                    <SelectItem value="50">50 / pág.</SelectItem>
                    <SelectItem value="100">100 / pág.</SelectItem>
                  </SelectContent>
                </Select>
                {pageSize !== 50 && (
                  <button
                    type="button"
                    onClick={() => onChangePageSize(50)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                    aria-label="Limpar tamanho página"
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
            Ocorreu um erro ao carregar os movimentos de preço.
            {error?.message && (
              <span className="ml-1 opacity-80">({error.message})</span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
