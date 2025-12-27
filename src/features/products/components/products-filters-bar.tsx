// src/features/products/components/products-filters-bar.tsx
import { useState, type ReactNode, type MouseEvent } from "react";
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
import {
  Filter,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  XCircle,
} from "lucide-react";
import { Spinner } from "@/components/genesys-ui";

import type { Brand } from "@/api/brands";
import type { Category } from "@/api/categories";
import type { Supplier } from "@/api/suppliers";

type ProductsFiltersBarProps = {
  qInput: string;
  setQInput: (v: string) => void;

  sort: "recent" | "name" | "cheapest";
  pageSize: number;

  id_brand: number | null;
  id_category: number | null;
  id_supplier: number | null;

  hasStockUI: "all" | "in" | "out";
  importedUI: "all" | "imported" | "not_imported";

  onChangeSort: (v: "recent" | "name" | "cheapest") => void;
  onChangePageSize: (v: number) => void;
  onChangeHasStock: (v: "all" | "in" | "out") => void;
  onChangeImported: (v: "all" | "imported" | "not_imported") => void;
  onChangeBrand: (v: string) => void;
  onChangeCategory: (v: string) => void;
  onChangeSupplier: (v: string) => void;
  onResetFilters: () => void;

  brands: Brand[];
  categories: Category[];
  suppliers: Supplier[];

  isLoadingBrands: boolean;
  isLoadingCategories: boolean;
  isLoadingSuppliers: boolean;

  /** True quando o endpoint de facets está a recalcular as opções */
  isUpdatingFacets: boolean;
};

type AdvancedFilterFieldProps = {
  label: string;
  children: ReactNode;
};

function AdvancedFilterField({ label, children }: AdvancedFilterFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

export default function ProductsFiltersBar({
  qInput,
  setQInput,
  sort,
  pageSize,
  id_brand,
  id_category,
  id_supplier,
  hasStockUI,
  importedUI,
  onChangeSort,
  onChangePageSize,
  onChangeHasStock,
  onChangeImported,
  onChangeBrand,
  onChangeCategory,
  onChangeSupplier,
  onResetFilters,
  brands,
  categories,
  suppliers,
  isLoadingBrands,
  isLoadingCategories,
  isLoadingSuppliers,
  isUpdatingFacets,
}: ProductsFiltersBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const hasAnyAdvancedFilter =
    !!id_brand ||
    !!id_category ||
    !!id_supplier ||
    hasStockUI !== "all" ||
    importedUI !== "all" ||
    !!qInput;

  const handleClearAdvanced = () => {
    onResetFilters();
  };

  const handleClearBrand = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onChangeBrand("all");
  };

  const handleClearCategory = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onChangeCategory("all");
  };

  const handleClearSupplier = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onChangeSupplier("all");
  };

  return (
    <Card className="space-y-3 p-4">
      {/* Linha principal: título + pesquisa rápida + botão pesquisa avançada */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">Produtos</h1>
          <p className="text-sm text-muted-foreground">
            Pesquisa rápida no catálogo. Use a pesquisa avançada para filtrar
            por marca, categoria, stock e estado de importação.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          {/* Pesquisa rápida */}
          <div className="relative w-full min-w-[240px] sm:w-[320px]">
            <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2">
              <Search className="h-4 w-4 text-slate-400" />
            </span>
            <Input
              placeholder="Pesquisar por nome, GTIN, MPN…"
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              className="pl-8 pr-7"
            />
            {qInput && (
              <button
                type="button"
                onClick={() => setQInput("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                aria-label="Limpar pesquisa"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Botão de pesquisa avançada */}
          <Button
            type="button"
            variant={
              showAdvanced || hasAnyAdvancedFilter ? "default" : "outline"
            }
            size="sm"
            className="inline-flex items-center gap-2"
            onClick={() => setShowAdvanced((v) => !v)}
            aria-expanded={showAdvanced}
          >
            <Filter className="h-4 w-4" />
            <span>Pesquisa avançada</span>
            {showAdvanced ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>

      {/* Painel de pesquisa avançada - com animação */}
      <div
        className="grid transition-all duration-300 ease-in-out"
        style={{ gridTemplateRows: showAdvanced ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="mt-3 space-y-3 rounded-md border bg-muted/40 p-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Filtros avançados do catálogo</span>

              <div className="flex items-center gap-2">
                {isUpdatingFacets && (
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Spinner size="xs" />a atualizar filtros…
                  </span>
                )}

                {hasAnyAdvancedFilter && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="inline-flex h-auto items-center gap-1 px-2 py-1 text-xs"
                    onClick={handleClearAdvanced}
                  >
                    <XCircle className="h-3 w-3" />
                    <span>Limpar filtros</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Linha 1: Fornecedor + Marca + Categoria */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <AdvancedFilterField label="Fornecedor (opcional)">
                <div className="relative">
                  <Select
                    value={id_supplier ? String(id_supplier) : "all"}
                    onValueChange={onChangeSupplier}
                  >
                    <SelectTrigger className="w-full pr-7">
                      <SelectValue placeholder="Selecionar fornecedor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {isLoadingSuppliers
                          ? "A carregar fornecedores…"
                          : "Todos os fornecedores"}
                      </SelectItem>
                      {suppliers.map((s) => (
                        <SelectItem key={s.id} value={s.id.toString()}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {id_supplier && (
                    <button
                      type="button"
                      onClick={handleClearSupplier}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                      aria-label="Limpar fornecedor"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </AdvancedFilterField>

              <AdvancedFilterField label="Marca (opcional)">
                <div className="relative">
                  <Select
                    value={id_brand ? String(id_brand) : "all"}
                    onValueChange={onChangeBrand}
                  >
                    <SelectTrigger className="w-full pr-7">
                      <SelectValue placeholder="Selecionar marca" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {isLoadingBrands
                          ? "A carregar marcas…"
                          : "Todas as marcas"}
                      </SelectItem>
                      {brands.map((b) => (
                        <SelectItem key={b.id} value={b.id.toString()}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {id_brand && (
                    <button
                      type="button"
                      onClick={handleClearBrand}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                      aria-label="Limpar marca"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </AdvancedFilterField>

              <AdvancedFilterField label="Categoria (opcional)">
                <div className="relative">
                  <Select
                    value={id_category ? String(id_category) : "all"}
                    onValueChange={onChangeCategory}
                  >
                    <SelectTrigger className="w-full pr-7">
                      <SelectValue placeholder="Selecionar categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {isLoadingCategories
                          ? "A carregar categorias…"
                          : "Todas as categorias"}
                      </SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {id_category && (
                    <button
                      type="button"
                      onClick={handleClearCategory}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                      aria-label="Limpar categoria"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </AdvancedFilterField>
            </div>

            {/* Linha 2: Stock + Importação + Ordenação + Tamanho página */}
            <div className="grid gap-3 md:grid-cols-4">
              <AdvancedFilterField label="Stock">
                <Select
                  value={hasStockUI}
                  onValueChange={(v) => onChangeHasStock(v as any)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filtrar por stock" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="in">Com stock</SelectItem>
                    <SelectItem value="out">Sem stock</SelectItem>
                  </SelectContent>
                </Select>
              </AdvancedFilterField>

              <AdvancedFilterField label="Estado de importação">
                <Select
                  value={importedUI}
                  onValueChange={(v) => onChangeImported(v as any)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filtrar por importação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="imported">Importados</SelectItem>
                    <SelectItem value="not_imported">Por importar</SelectItem>
                  </SelectContent>
                </Select>
              </AdvancedFilterField>

              <AdvancedFilterField label="Ordenar por">
                <Select
                  value={sort}
                  onValueChange={(v) => onChangeSort(v as any)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Ordenar resultados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Recentes</SelectItem>
                    <SelectItem value="name">Nome</SelectItem>
                    <SelectItem value="cheapest">Preço</SelectItem>
                  </SelectContent>
                </Select>
              </AdvancedFilterField>

              <AdvancedFilterField label="Resultados por página">
                <Select
                  value={String(pageSize)}
                  onValueChange={(v) => onChangePageSize(Number(v))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Qtde/página" />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 20, 50, 100].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} / página
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </AdvancedFilterField>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
