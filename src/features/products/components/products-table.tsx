// src/features/products/components/products-table.tsx
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Highlight from "@/components/genesys-ui/Hightlight";
import { cn } from "@/lib/utils";
import { ExternalLink, ChevronLeft, ChevronRight, Upload } from "lucide-react";
import { Spinner } from "@/components/genesys-ui";

import { fmtPrice } from "@/helpers/fmtPrices";
import type { ProductExt } from "@/api/products";

import {
  OffersInline,
  StatusDot,
  TableEmpty,
  TableSkeleton,
} from "@/features/products/components";

// Helper: verifica se produto foi criado nos últimos N dias (default: 7)
const NEW_THRESHOLD_DAYS = 7;
const isNew = (createdAt: string): boolean => {
  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays <= NEW_THRESHOLD_DAYS;
};

type ProductsTableProps = {
  items: ProductExt[];
  qParam: string | null;
  isLoading: boolean;
  // Pagination props
  currentPage?: number;
  totalPages?: number;
  totalResults?: number;
  elapsedMs?: number;
  isFetching?: boolean;
  onPrevPage?: () => void;
  onNextPage?: () => void;
  // Selection props
  selectedIds?: Set<number>;
  onSelectionChange?: (ids: Set<number>) => void;
  onBulkImport?: () => void;
};

export default function ProductsTable({
  items,
  qParam,
  isLoading,
  currentPage = 1,
  totalPages = 1,
  totalResults = 0,
  elapsedMs,
  isFetching = false,
  onPrevPage,
  onNextPage,
  selectedIds,
  onSelectionChange,
  onBulkImport,
}: ProductsTableProps) {
  const hasPagination = onPrevPage && onNextPage;
  const hasSelection =
    selectedIds !== undefined && onSelectionChange !== undefined;

  // Selection helpers
  const allSelected =
    hasSelection &&
    items.length > 0 &&
    items.every((p) => selectedIds.has(p.id));
  const someSelected = hasSelection && items.some((p) => selectedIds.has(p.id));

  const toggleAll = () => {
    if (!onSelectionChange) return;
    if (allSelected) {
      // Deselect all current page items
      const newSet = new Set(selectedIds);
      items.forEach((p) => newSet.delete(p.id));
      onSelectionChange(newSet);
    } else {
      // Select all current page items
      const newSet = new Set(selectedIds);
      items.forEach((p) => newSet.add(p.id));
      onSelectionChange(newSet);
    }
  };

  const toggleOne = (id: number) => {
    if (!onSelectionChange || !selectedIds) return;
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    onSelectionChange(newSet);
  };

  return (
    <Card className="overflow-hidden p-0">
      <div className="min-w-full overflow-x-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <TableRow className="[&_th]:text-muted-foreground">
              {hasSelection && (
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleAll}
                    aria-label="Selecionar todos"
                    className={someSelected && !allSelected ? "opacity-50" : ""}
                  />
                </TableHead>
              )}
              <TableHead className="w-[36%]">Produto</TableHead>
              <TableHead className="w-[12%]">Marca</TableHead>
              <TableHead className="w-[16%]">GTIN/MPN</TableHead>
              <TableHead className="w-[16%]">Ofertas</TableHead>
              <TableHead className="w-[10%] text-right">Preço</TableHead>
              <TableHead className="w-[8%] text-right">Stock</TableHead>
              <TableHead className="w-[2%]"> </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading && (
              <TableSkeleton rows={10} cols={7} rightAlignCols={[4, 5]} />
            )}

            {!isLoading && items.length === 0 && <TableEmpty />}

            {!isLoading &&
              items.map((p) => {
                const initials = (p.brand_name || p.name || "?")
                  .slice(0, 2)
                  .toUpperCase();
                const bestPrice =
                  p.best_offer?.price != null
                    ? Number.parseFloat(p.best_offer.price)
                    : NaN;

                return (
                  <TableRow
                    key={p.id}
                    className={cn(
                      "group hover:bg-muted/30",
                      hasSelection && selectedIds?.has(p.id) && "bg-muted/50"
                    )}
                  >
                    {/* Checkbox */}
                    {hasSelection && (
                      <TableCell className="w-[40px]">
                        <Checkbox
                          checked={selectedIds?.has(p.id) ?? false}
                          onCheckedChange={() => toggleOne(p.id)}
                          aria-label={`Selecionar ${p.name}`}
                        />
                      </TableCell>
                    )}
                    {/* Produto */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border rounded-md">
                          {p.image_url ? (
                            <AvatarImage src={p.image_url} alt={p.name || ""} />
                          ) : (
                            <AvatarFallback className="text-[10px]">
                              {initials}
                            </AvatarFallback>
                          )}
                        </Avatar>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="max-w-[32ch] truncate font-medium leading-tight">
                              <Highlight
                                text={p.name || "—"}
                                query={qParam || ""}
                              />
                            </div>
                            <Badge
                              variant={p.id_ecommerce ? "secondary" : "outline"}
                              className={cn(
                                "h-5 px-2 text-[10px] font-medium",
                                p.id_ecommerce ? "border-emerald-300" : ""
                              )}
                            >
                              {p.id_ecommerce ? "importado" : "por importar"}
                            </Badge>
                            {p.created_at && isNew(p.created_at) && (
                              <span className="inline-flex items-baseline gap-1 text-[10px] text-blue-600 dark:text-blue-400">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                                novo
                              </span>
                            )}
                          </div>

                          <div className="truncate text-xs text-muted-foreground">
                            {p.category_name || "—"}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Marca */}
                    <TableCell className="truncate">
                      {p.brand_name ? (
                        <Highlight text={p.brand_name} query={qParam || ""} />
                      ) : (
                        "—"
                      )}
                    </TableCell>

                    {/* GTIN/MPN */}
                    <TableCell className="truncate">
                      <div className="text-xs">
                        <span className="text-muted-foreground">GTIN:</span>{" "}
                        {p.gtin ? (
                          <Highlight text={p.gtin} query={qParam || ""} />
                        ) : (
                          "—"
                        )}
                      </div>
                      <div className="text-xs">
                        <span className="text-muted-foreground">MPN:</span>{" "}
                        {p.partnumber ? (
                          <Highlight
                            text={String(p.partnumber)}
                            query={qParam || ""}
                          />
                        ) : (
                          "—"
                        )}
                      </div>
                    </TableCell>

                    {/* Ofertas */}
                    <TableCell>
                      <OffersInline offers={p.offers} best={p.best_offer} />
                    </TableCell>

                    {/* Preço (melhor oferta) */}
                    <TableCell className="text-right">
                      <div className="leading-tight">
                        <div className="text-[11px] text-muted-foreground">
                          desde
                        </div>
                        <div className="text-base font-semibold tabular-nums">
                          {Number.isFinite(bestPrice)
                            ? fmtPrice(bestPrice)
                            : "—"}
                        </div>
                      </div>
                    </TableCell>

                    {/* Stock (melhor oferta) */}
                    <TableCell className="text-right">
                      {typeof p.best_offer?.stock === "number" ? (
                        <div className="inline-flex items-center justify-end gap-2">
                          <StatusDot ok={(p.best_offer?.stock ?? 0) > 0} />
                          <span className="text-sm tabular-nums">
                            {p.best_offer?.stock}
                          </span>
                        </div>
                      ) : (
                        "—"
                      )}
                    </TableCell>

                    {/* Ações */}
                    <TableCell>
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="gap-1"
                      >
                        <Link to={`/products/${p.id}`} title="Ver detalhe">
                          <ExternalLink className="h-4 w-4" />
                          Detalhe
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer - Vercel-like design */}
      {hasPagination && (
        <div className="border-t bg-muted/30">
          <div className="flex items-center justify-between px-6 py-3">
            {/* Left: Results info + Bulk Import */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {/* Selection count and bulk import button */}
              {hasSelection && selectedIds && selectedIds.size > 0 && (
                <>
                  <Button
                    size="sm"
                    onClick={onBulkImport}
                    className="h-8 gap-1.5"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Importar {selectedIds.size}{" "}
                    {selectedIds.size === 1 ? "produto" : "produtos"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelectionChange?.(new Set())}
                    className="h-8 text-muted-foreground"
                  >
                    Limpar seleção
                  </Button>
                  <span className="text-muted-foreground/50">•</span>
                </>
              )}
              <span>
                {totalResults > 0 ? (
                  <>
                    <span className="font-medium text-foreground">
                      {totalResults.toLocaleString()}
                    </span>{" "}
                    {totalResults === 1 ? "resultado" : "resultados"}
                  </>
                ) : (
                  "Nenhum resultado"
                )}
              </span>
              {typeof elapsedMs === "number" && (
                <>
                  <span className="text-muted-foreground/50">•</span>
                  <span>{Math.round(elapsedMs)} ms</span>
                </>
              )}
              {isFetching && (
                <>
                  <span className="text-muted-foreground/50">•</span>
                  <span className="flex items-center gap-1.5">
                    <Spinner size="xs" />a atualizar
                  </span>
                </>
              )}
            </div>

            {/* Right: Pagination controls */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                Página{" "}
                <span className="font-medium text-foreground">
                  {currentPage}
                </span>{" "}
                de{" "}
                <span className="font-medium text-foreground">
                  {totalPages}
                </span>
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onPrevPage}
                  disabled={currentPage <= 1 || isFetching}
                  className="h-8 px-2.5 gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Anterior</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onNextPage}
                  disabled={currentPage >= totalPages || isFetching}
                  className="h-8 px-2.5 gap-1"
                >
                  <span className="hidden sm:inline">Seguinte</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
