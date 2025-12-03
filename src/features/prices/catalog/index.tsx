// src/features/prices/catalog/index.tsx
import { useState } from "react";
import { useCatalogPriceChanges } from "./queries";
import type { PriceChangeDirection } from "@/api/products";
import { CatalogFiltersBar, CatalogTable } from "./components";

const PAGE_SIZE = 50;

export default function PricesCatalogPage() {
  const [direction, setDirection] = useState<PriceChangeDirection>("down");
  const [days, setDays] = useState<number>(30);
  const [minAbsDelta, setMinAbsDelta] = useState<number | null>(0);
  const [minPctDelta, setMinPctDelta] = useState<number | null>(5);
  const [page, setPage] = useState<number>(1);

  const { data, isLoading, error, isFetching } = useCatalogPriceChanges({
    direction,
    days,
    min_abs_delta: minAbsDelta,
    min_pct_delta: minPctDelta,
    page,
    page_size: PAGE_SIZE,
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const elapsedMs = (data as any)?.elapsedMs as number | undefined;

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  const handleChangeDirection = (val: PriceChangeDirection) => {
    setDirection(val);
    setPage(1);
  };

  const handleChangeDays = (val: number) => {
    setDays(val);
    setPage(1);
  };

  const handleChangeMinAbsDelta = (val: number | null) => {
    setMinAbsDelta(val);
    setPage(1);
  };

  const handleChangeMinPctDelta = (val: number | null) => {
    setMinPctDelta(val);
    setPage(1);
  };

  return (
    <div className="mx-auto space-y-6">
      <CatalogFiltersBar
        direction={direction}
        days={days}
        minAbsDelta={minAbsDelta}
        minPctDelta={minPctDelta}
        onChangeDirection={handleChangeDirection}
        onChangeDays={handleChangeDays}
        onChangeMinAbsDelta={handleChangeMinAbsDelta}
        onChangeMinPctDelta={handleChangeMinPctDelta}
        error={error}
      />

      <CatalogTable
        items={items}
        isLoading={isLoading}
        isFetching={isFetching}
        page={page}
        totalPages={totalPages}
        total={total}
        elapsedMs={elapsedMs}
        onPrevPage={handlePrev}
        onNextPage={handleNext}
      />
    </div>
  );
}

