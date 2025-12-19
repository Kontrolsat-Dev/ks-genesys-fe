// src/features/products/index.tsx
import { useMemo, useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";

import { useProductsList, useProductsFacets } from "./queries";
import { useAllCategories } from "./categories/queries";
import { useAllBrands } from "./brands/queries";
import { useProductsSearchState } from "./search-state";

import type { ProductExt } from "@/api/products";
import ProductsFiltersBar from "./components/products-filters-bar";
import ProductsTable from "./components/products-table";
import { useSuppliersList } from "../suppliers/queries";
import BulkImportModal from "./components/bulk-import-modal";

export default function ProductsPage() {
  const searchState = useProductsSearchState();
  
  // Bulk import selection state
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);

  // dropdowns base
  const { data: brands = [], isLoading: isLoadingBrands } = useAllBrands();
  const { data: categories = [], isLoading: isLoadingCategories } =
    useAllCategories();

  const { data: suppliersRes, isLoading: isLoadingSuppliers } =
    useSuppliersList({
      page: 1,
      pageSize: 200,
      search: null,
    });
  const suppliers = suppliersRes?.items ?? [];

  // facets (dependem dos filtros atuais)
  const { data: facets, isFetching: isFetchingFacets } = useProductsFacets({
    q: searchState.qParam,
    gtin: searchState.gtin,
    partnumber: searchState.partnumber,
    id_brand: searchState.id_brand,
    id_category: searchState.id_category,
    id_supplier: searchState.id_supplier,
    has_stock: searchState.hasStock,
    imported: searchState.imported,
  });

  const facetBrandIds = facets?.brand_ids ?? null;
  const facetCategoryIds = facets?.category_ids ?? null;
  const facetSupplierIds = facets?.supplier_ids ?? null;

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

  const items: ProductExt[] = data?.items ?? [];

  const totalPages = useMemo(
    () => (data ? Math.max(1, Math.ceil(data.total / data.page_size)) : 1),
    [data]
  );
  const elapsedMs = (data as any)?.elapsedMs as number | undefined;

  const scrollToTop = () => {
    const container = document.getElementById("main-scroll-container");
    if (container) {
      container.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goPrev = () => {
    searchState.setPage(Math.max(1, searchState.page - 1));
    scrollToTop();
  };
  const goNext = () => {
    searchState.setPage(Math.min(totalPages, searchState.page + 1));
    scrollToTop();
  };

  // aplicar facets às opções dos dropdowns
  const filteredBrands = useMemo(() => {
    if (!facetBrandIds) return brands;
    const allowed = new Set(facetBrandIds);
    const selectedId = searchState.id_brand ?? null;

    return brands.filter(
      (b) => allowed.has(b.id) || (selectedId !== null && b.id === selectedId)
    );
  }, [brands, facetBrandIds, searchState.id_brand]);

  const filteredCategories = useMemo(() => {
    if (!facetCategoryIds) return categories;
    const allowed = new Set(facetCategoryIds);
    const selectedId = searchState.id_category ?? null;

    return categories.filter(
      (c) => allowed.has(c.id) || (selectedId !== null && c.id === selectedId)
    );
  }, [categories, facetCategoryIds, searchState.id_category]);

  const filteredSuppliers = useMemo(() => {
    if (!facetSupplierIds) return suppliers;
    const allowed = new Set(facetSupplierIds);
    const selectedId = searchState.id_supplier ?? null;

    return suppliers.filter(
      (s) => allowed.has(s.id) || (selectedId !== null && s.id === selectedId)
    );
  }, [suppliers, facetSupplierIds, searchState.id_supplier]);

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
          id_supplier={searchState.id_supplier}
          hasStockUI={searchState.hasStockUI}
          importedUI={searchState.importedUI}
          onChangeSort={searchState.setSort}
          onChangePageSize={searchState.setPageSize}
          onChangeHasStock={searchState.setHasStockUI}
          onChangeImported={searchState.setImportedUI}
          onChangeBrand={searchState.setBrandId}
          onChangeCategory={searchState.setCategoryId}
          onChangeSupplier={searchState.setSupplierId}
          onResetFilters={searchState.resetAllFilters}
          
          brands={filteredBrands}
          categories={filteredCategories}
          suppliers={filteredSuppliers}
          isLoadingBrands={isLoadingBrands}
          isLoadingCategories={isLoadingCategories}
          isLoadingSuppliers={isLoadingSuppliers}
          isUpdatingFacets={isFetchingFacets}
        />

        {/* Tabela com paginação integrada */}
        <ProductsTable
          items={items}
          qParam={searchState.qParam}
          isLoading={isLoading}
          currentPage={data?.page ?? searchState.page}
          totalPages={totalPages}
          totalResults={data?.total ?? 0}
          elapsedMs={elapsedMs}
          isFetching={isFetching}
          onPrevPage={goPrev}
          onNextPage={goNext}
          // Selection props
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onBulkImport={() => setShowBulkImportModal(true)}
        />
        
        {/* Bulk Import Modal */}
        <BulkImportModal
          open={showBulkImportModal}
          onOpenChange={setShowBulkImportModal}
          selectedIds={selectedIds}
          products={items}
          categories={categories}
          onSuccess={() => {
            setSelectedIds(new Set());
            setShowBulkImportModal(false);
          }}
        />
      </div>
    </TooltipProvider>
  );
}
