// src/features/products/index.tsx
import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";

import { useProductsList } from "./queries";
import { useAllCategories } from "./categories/queries";
import { useAllBrands } from "./brands/queries";
import { useProductsSearchState } from "./search-state";

import type { ProductExt } from "@/api/products";
import ProductsFiltersBar from "./components/products-filters-bar";
import ProductsTable from "./components/products-table";

export default function ProductsPage() {
  const searchState = useProductsSearchState();

  // dropdowns
  const { data: brands = [], isLoading: isLoadingBrands } = useAllBrands();
  const { data: categories = [], isLoading: isLoadingCategories } =
    useAllCategories();

  // listagem de produtos
  const { data, isLoading, isFetching } = useProductsList({
    page: searchState.page,
    pageSize: searchState.pageSize,
    q: searchState.qParam,
    gtin: searchState.gtin,
    partnumber: searchState.partnumber,
    id_brand: searchState.id_brand,
    id_category: searchState.id_category,
    id_supplier: searchState.id_supplier,
    has_stock: searchState.hasStock,
    imported: searchState.imported,
    sort: searchState.sort,
  });

  const totalPages = useMemo(
    () => (data ? Math.max(1, Math.ceil(data.total / data.page_size)) : 1),
    [data]
  );
  const elapsedMs = (data as any)?.elapsedMs as number | undefined;
  const items: ProductExt[] = data?.items ?? [];

  const goPrev = () => searchState.setPage(Math.max(1, searchState.page - 1));

  const goNext = () =>
    searchState.setPage(Math.min(totalPages, searchState.page + 1));

  return (
    <TooltipProvider delayDuration={100}>
      <div className="mx-auto space-y-6">
        {/* Header + filtros */}
        <ProductsFiltersBar
          qInput={searchState.qInput}
          setQInput={searchState.setQInput}
          sort={searchState.sort}
          pageSize={searchState.pageSize}
          id_brand={searchState.id_brand}
          id_category={searchState.id_category}
          hasStockUI={searchState.hasStockUI}
          importedUI={searchState.importedUI}
          onChangeSort={searchState.setSort}
          onChangePageSize={searchState.setPageSize}
          onChangeHasStock={searchState.setHasStockUI}
          onChangeImported={searchState.setImportedUI}
          onChangeBrand={searchState.setBrandId}
          onChangeCategory={searchState.setCategoryId}
          brands={brands}
          categories={categories}
          isLoadingBrands={isLoadingBrands}
          isLoadingCategories={isLoadingCategories}
        />

        {/* info de resultados */}
        <div className="mt-[-0.75rem] px-1 text-xs text-muted-foreground">
          {data
            ? `${data.total} resultados` +
              (typeof elapsedMs === "number"
                ? ` • ${Math.round(elapsedMs)} ms`
                : "") +
              (isFetching ? " • a atualizar…" : "")
            : "—"}
        </div>

        {/* Tabela */}
        <ProductsTable
          items={items}
          qParam={searchState.qParam}
          isLoading={isLoading}
        />

        {/* Paginação */}
        <Card className="mt-0">
          <Separator />
          <div className="flex items-center justify-between px-4 py-3">
            <div className="text-xs text-muted-foreground">
              Página {data?.page ?? searchState.page} de {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goPrev}
                disabled={(data?.page ?? searchState.page) <= 1 || isFetching}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goNext}
                disabled={
                  (data?.page ?? searchState.page) >= totalPages || isFetching
                }
              >
                Seguinte
              </Button>
              {isFetching && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            </div>
          </div>
        </Card>
      </div>
    </TooltipProvider>
  );
}
