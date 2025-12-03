// src/features/prices/active-offer/index.tsx
import { useState } from "react";
import { useActiveOfferPriceChanges } from "./queries";
import type { PriceChangeDirection } from "@/api/products";
import { ActiveOfferFiltersBar, ActiveOfferTable } from "./components";

export default function PricesActiveOfferPage() {
  const [direction, setDirection] = useState<PriceChangeDirection>("down");
  const [days, setDays] = useState<number>(7);
  const [minAbsDelta, setMinAbsDelta] = useState<number | undefined>(undefined);
  const [minPctDelta, setMinPctDelta] = useState<number | undefined>(undefined);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);

  const { data, isLoading, isError, error, isFetching } =
    useActiveOfferPriceChanges({
      direction,
      days,
      min_abs_delta: minAbsDelta ?? null,
      min_pct_delta: minPctDelta ?? null,
      page,
      page_size: pageSize,
    });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageSizeFromApi = data?.page_size ?? pageSize;
  const totalPages =
    total && pageSizeFromApi
      ? Math.max(1, Math.ceil(total / pageSizeFromApi))
      : 1;

  const handlePrevPage = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  const handleResetFilters = () => {
    setDirection("down");
    setDays(7);
    setMinAbsDelta(undefined);
    setMinPctDelta(undefined);
    setPage(1);
    setPageSize(50);
  };

  const handleChangeDirection = (val: PriceChangeDirection) => {
    setDirection(val);
    setPage(1);
  };

  const handleChangeDays = (val: number) => {
    setDays(val);
    setPage(1);
  };

  const handleChangeMinAbsDelta = (val: number | undefined) => {
    setMinAbsDelta(val);
    setPage(1);
  };

  const handleChangeMinPctDelta = (val: number | undefined) => {
    setMinPctDelta(val);
    setPage(1);
  };

  const handleChangePageSize = (val: number) => {
    setPageSize(val);
    setPage(1);
  };

  return (
    <div className="mx-auto space-y-6">
      <ActiveOfferFiltersBar
        direction={direction}
        days={days}
        minAbsDelta={minAbsDelta}
        minPctDelta={minPctDelta}
        pageSize={pageSize}
        onChangeDirection={handleChangeDirection}
        onChangeDays={handleChangeDays}
        onChangeMinAbsDelta={handleChangeMinAbsDelta}
        onChangeMinPctDelta={handleChangeMinPctDelta}
        onChangePageSize={handleChangePageSize}
        onResetFilters={handleResetFilters}
        isFetching={isFetching}
        error={isError ? error : undefined}
      />

      <ActiveOfferTable
        items={items}
        isLoading={isLoading}
        isFetching={isFetching}
        total={total}
        page={page}
        totalPages={totalPages}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
      />
    </div>
  );
}
